'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'
import { postToLedger } from '@/lib/finance'

const createCreditNoteSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  reason: z.string().nullable().optional(),
  cnDate: z.coerce.date().default(() => new Date()),
})

type CreateCreditNoteInput = z.infer<typeof createCreditNoteSchema>

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')

  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })

  if (!org) throw new Error('Organization not found')
  return { userId, orgId: org.id }
}

async function generateCNNumber(orgId: string): Promise<string> {
  const lastCN = await prisma.creditNote.findFirst({
    where: { organizationId: orgId },
    orderBy: { cnNumber: 'desc' },
    select: { cnNumber: true }
  })

  if (!lastCN) return 'CN-000001'
  const lastNum = parseInt(lastCN.cnNumber.replace('CN-', '')) || 0
  return `CN-${String(lastNum + 1).padStart(6, '0')}`
}

export async function createCreditNote(input: CreateCreditNoteInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createCreditNoteSchema.parse(input)
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: validated.invoiceId },
    include: { customer: true }
  })

  if (!invoice) throw new Error('Invoice not found')
  if (Number(invoice.totalAmount) < validated.amount) {
    throw new Error('Credit note amount cannot exceed invoice total')
  }

  const cnNumber = await generateCNNumber(orgId)

  const creditNote = await prisma.$transaction(async (tx) => {
    // 1. Create Credit Note record
    const cn = await tx.creditNote.create({
      data: {
        cnNumber,
        invoiceId: validated.invoiceId,
        amount: new Decimal(validated.amount),
        reason: validated.reason,
        cnDate: validated.cnDate,
        organizationId: orgId,
        createdBy: userId,
      }
    })

    // 2. Post Reversal to General Ledger
    // Reverse Sales: Debit Sales Revenue, Credit Accounts Receivable
    await postToLedger(tx, {
      organizationId: orgId,
      transactionDate: validated.cnDate,
      description: `Credit Note ${cnNumber} for Invoice ${invoice.invoiceNumber}`,
      referenceNumber: cnNumber,
      userId,
      entries: [
        { accountNumber: '4000', debit: validated.amount, description: 'Sales Returns/Reversal' },
        { accountNumber: '1100', credit: validated.amount, description: 'Accounts Receivable (Reduction)' }
      ]
    })

    // 3. Update Invoice status if fully credited
    if (Number(invoice.totalAmount) === validated.amount) {
      await tx.invoice.update({
        where: { id: validated.invoiceId },
        data: { status: 'VOID' }
      })
    }

    return cn
  })

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'CREATE',
    entityType: 'CreditNote',
    entityId: creditNote.id,
    newValues: creditNote as unknown as Record<string, unknown>,
  })

  revalidatePath('/dashboard/finance/invoices')
  return creditNote
}

export async function getCreditNotes() {
  const { orgId } = await getOrganization()
  return prisma.creditNote.findMany({
    where: { organizationId: orgId },
    include: { invoice: { select: { invoiceNumber: true, customer: { select: { companyName: true } } } } },
    orderBy: { cnDate: 'desc' }
  })
}
