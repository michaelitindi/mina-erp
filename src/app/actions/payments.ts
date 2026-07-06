'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'
import { postToLedger } from '@/lib/finance'
import { serializeDecimal } from '@/lib/utils'
import { initializePayment } from '@/lib/payment'

const createPaymentSchema = z.object({
  paymentDate: z.coerce.date(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER']),
  referenceNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  invoiceId: z.string().nullable().optional(),
  billId: z.string().nullable().optional(),
})

type CreatePaymentInput = z.infer<typeof createPaymentSchema>

import { getOrgWithModuleCheck } from '@/lib/module-access'

async function getOrganization() {
  const { userId, orgId } = await getOrgWithModuleCheck('FINANCE')
  return { userId, orgId }
}

async function generatePaymentNumber(orgId: string): Promise<string> {
  const lastPayment = await prisma.payment.findFirst({
    where: { organizationId: orgId },
    orderBy: { paymentNumber: 'desc' },
    select: { paymentNumber: true }
  })

  if (!lastPayment) {
    return 'PAY-000001'
  }

  const lastNum = parseInt(lastPayment.paymentNumber.replace('PAY-', '')) || 0
  return `PAY-${String(lastNum + 1).padStart(6, '0')}`
}

export async function getPayments() {
  const { orgId } = await getOrganization()

  const payments = await prisma.payment.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
    },
    orderBy: { paymentDate: 'desc' },
    include: {
      invoice: {
        select: { invoiceNumber: true, customer: { select: { companyName: true } } }
      },
      bill: {
        select: { billNumber: true, vendor: { select: { companyName: true } } }
      }
    }
  })

  return serializeDecimal(payments)
}

export async function createPayment(input: CreatePaymentInput) {
  const { userId, orgId } = await getOrganization()
  
  const validated = createPaymentSchema.parse(input)
  const paymentNumber = await generatePaymentNumber(orgId)

  // Create payment in a transaction to update invoice/bill paidAmount
  const payment = await prisma.$transaction(async (tx) => {
    const newPayment = await tx.payment.create({
      data: {
        paymentNumber,
        paymentDate: validated.paymentDate,
        amount: new Decimal(validated.amount),
        paymentMethod: validated.paymentMethod,
        referenceNumber: validated.referenceNumber,
        notes: validated.notes,
        invoiceId: validated.invoiceId,
        billId: validated.billId,
        organizationId: orgId,
        createdBy: userId,
      }
    })

    // Update invoice paid amount if linked
    if (validated.invoiceId) {
      const invoice = await tx.invoice.findUnique({
        where: { id: validated.invoiceId },
        select: { paidAmount: true, totalAmount: true }
      })
      
      if (invoice) {
        const newPaidAmount = Number(invoice.paidAmount) + validated.amount
        const newStatus = newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' : 'SENT'
        
        await tx.invoice.update({
          where: { id: validated.invoiceId },
          data: {
            paidAmount: new Decimal(newPaidAmount),
            status: newStatus,
          }
        })
      }
    }

    // Update bill paid amount if linked
    if (validated.billId) {
      const bill = await tx.bill.findUnique({
        where: { id: validated.billId },
        select: { paidAmount: true, totalAmount: true }
      })
      
      if (bill) {
        const newPaidAmount = Number(bill.paidAmount) + validated.amount
        const newStatus = newPaidAmount >= Number(bill.totalAmount) ? 'PAID' : 'APPROVED'
        
        await tx.bill.update({
          where: { id: validated.billId },
          data: {
            paidAmount: new Decimal(newPaidAmount),
            status: newStatus,
          }
        })
      }
    }

    // Post to General Ledger
    if (validated.invoiceId) {
      const invoice = await tx.invoice.findUnique({
        where: { id: validated.invoiceId },
        include: { customer: { select: { companyName: true } } }
      })
      
      await postToLedger(tx, {
        organizationId: orgId,
        transactionDate: validated.paymentDate,
        description: `Payment for Invoice ${invoice?.invoiceNumber} - ${invoice?.customer.companyName}`,
        referenceNumber: validated.referenceNumber || paymentNumber,
        userId,
        entries: [
          { accountNumber: '1010', debit: validated.amount, description: 'Checking Account (Receipt)' },
          { accountNumber: '1100', credit: validated.amount, description: 'Accounts Receivable' }
        ]
      })
    } else if (validated.billId) {
      const bill = await tx.bill.findUnique({
        where: { id: validated.billId },
        include: { vendor: { select: { companyName: true } } }
      })

      await postToLedger(tx, {
        organizationId: orgId,
        transactionDate: validated.paymentDate,
        description: `Payment for Bill ${bill?.billNumber} - ${bill?.vendor.companyName}`,
        referenceNumber: validated.referenceNumber || paymentNumber,
        userId,
        entries: [
          { accountNumber: '2000', debit: validated.amount, description: 'Accounts Payable' },
          { accountNumber: '1010', credit: validated.amount, description: 'Checking Account (Payment)' }
        ]
      })
    }

    return newPayment
  })

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'CREATE',
    entityType: 'Payment',
    entityId: payment.id,
    newValues: payment as unknown as Record<string, unknown>,
  })

  revalidatePath('/dashboard/finance/payments')
  revalidatePath('/dashboard/finance/invoices')
  revalidatePath('/dashboard/finance/bills')
  return serializeDecimal(payment)
}

export async function deletePayment(id: string) {
  const { userId, orgId } = await getOrganization()

  const existing = await prisma.payment.findFirst({
    where: { id, organizationId: orgId, deletedAt: null }
  })

  if (!existing) {
    throw new Error('Payment not found')
  }

  // Reverse the payment in a transaction
  await prisma.$transaction(async (tx) => {
    // Reverse invoice paid amount if linked
    if (existing.invoiceId) {
      const invoice = await tx.invoice.findUnique({
        where: { id: existing.invoiceId },
        select: { paidAmount: true }
      })
      
      if (invoice) {
        const newPaidAmount = Math.max(0, Number(invoice.paidAmount) - Number(existing.amount))
        await tx.invoice.update({
          where: { id: existing.invoiceId },
          data: {
            paidAmount: new Decimal(newPaidAmount),
            status: newPaidAmount === 0 ? 'SENT' : 'SENT',
          }
        })
      }
    }

    // Reverse bill paid amount if linked
    if (existing.billId) {
      const bill = await tx.bill.findUnique({
        where: { id: existing.billId },
        select: { paidAmount: true }
      })
      
      if (bill) {
        const newPaidAmount = Math.max(0, Number(bill.paidAmount) - Number(existing.amount))
        await tx.bill.update({
          where: { id: existing.billId },
          data: {
            paidAmount: new Decimal(newPaidAmount),
            status: 'APPROVED',
          }
        })
      }
    }

    // Soft delete payment
    await tx.payment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      }
    })
  })

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'DELETE',
    entityType: 'Payment',
    entityId: id,
    oldValues: existing as unknown as Record<string, unknown>,
  })

  revalidatePath('/dashboard/finance/payments')
  revalidatePath('/dashboard/finance/invoices')
  revalidatePath('/dashboard/finance/bills')
  return { success: true }
}

export async function payInvoiceOnline(
  invoiceId: string,
  provider: 'STRIPE' | 'PAYSTACK' | 'FLUTTERWAVE',
  callbackUrl: string
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true }
  })
  if (!invoice) throw new Error('Invoice not found')

  const providerConfig = await prisma.paymentProvider.findFirst({
    where: {
      organizationId: invoice.organizationId,
      providerType: provider,
      isActive: true
    }
  })
  if (!providerConfig) {
    throw new Error(`Payment gateway ${provider} is not configured or not active for this organization.`)
  }

  const config = providerConfig.config as Record<string, string> || {}
  const secretKey = config.secretKey || ''
  const publicKey = config.publicKey || ''

  const amountInCents = Math.round(Number(invoice.totalAmount) * 100)
  
  const paymentParams = {
    orderId: invoice.id,
    orderNumber: invoice.invoiceNumber,
    amount: amountInCents,
    currency: 'USD',
    customerEmail: invoice.customer.email || 'customer@example.com',
    customerName: invoice.customer.companyName || invoice.customer.contactPerson || 'Customer',
    description: `Payment for Invoice ${invoice.invoiceNumber}`,
    callbackUrl,
    metadata: {
      invoiceId: invoice.id,
      type: 'INVOICE'
    }
  }

  const result = await initializePayment(
    {
      provider,
      secretKey,
      publicKey
    },
    paymentParams
  )

  if (!result.success) {
    throw new Error(result.error || 'Failed to initialize payment gateway session')
  }

  return {
    redirectUrl: result.redirectUrl,
    paymentReference: result.paymentReference
  }
}

export async function reconcilePaymentWebhook({
  amount,
  reference,
  provider,
  metadata
}: {
  amount: number
  reference: string
  provider: string
  metadata: Record<string, any>
}) {
  if (metadata.invoiceId || metadata.type === 'INVOICE') {
    const invoiceId = metadata.invoiceId
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true }
    })
    if (!invoice) {
      console.log('Invoice not found for reconciliation:', invoiceId)
      return { success: false, error: 'Invoice not found' }
    }

    const existing = await prisma.payment.findFirst({
      where: { referenceNumber: reference, deletedAt: null }
    })
    if (existing) {
      return { success: true, message: 'Already processed' }
    }

    const lastPayment = await prisma.payment.findFirst({
      where: { organizationId: invoice.organizationId },
      orderBy: { paymentNumber: 'desc' },
      select: { paymentNumber: true }
    })
    let paymentNumber = 'PAY-000001'
    if (lastPayment) {
      const lastNum = parseInt(lastPayment.paymentNumber.replace('PAY-', '')) || 0
      paymentNumber = `PAY-${String(lastNum + 1).padStart(6, '0')}`
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          organizationId: invoice.organizationId,
          paymentNumber,
          paymentDate: new Date(),
          amount: new Decimal(amount),
          paymentMethod: 'CREDIT_CARD',
          referenceNumber: reference,
          notes: `Auto-reconciled online payment via ${provider}`,
          invoiceId: invoice.id,
          createdBy: invoice.createdBy
        }
      })

      const newPaidAmount = Number(invoice.paidAmount) + amount
      const newStatus = newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' : 'SENT'
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: new Decimal(newPaidAmount),
          status: newStatus
        }
      })

      await postToLedger(tx, {
        organizationId: invoice.organizationId,
        transactionDate: new Date(),
        description: `Online Payment for Invoice ${invoice.invoiceNumber} - ${invoice.customer.companyName}`,
        referenceNumber: reference,
        userId: invoice.createdBy,
        entries: [
          { accountNumber: '1010', debit: amount, description: `${provider} checking receipt` },
          { accountNumber: '1100', credit: amount, description: 'Accounts Receivable' }
        ]
      })
    })

    revalidatePath('/dashboard/finance/payments')
    revalidatePath('/dashboard/finance/invoices')
    return { success: true, message: 'Invoice reconciled successfully' }
  }

  const orderId = metadata.orderId
  const order = await prisma.onlineOrder.findFirst({
    where: {
      OR: [
        { paymentReference: reference },
        { id: orderId }
      ]
    },
    include: { store: true }
  })

  if (order) {
    if (order.paymentStatus === 'PAID') {
      return { success: true, message: 'Already processed' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.onlineOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paidAt: new Date()
        }
      })

      await postToLedger(tx, {
        organizationId: order.store.organizationId,
        transactionDate: new Date(),
        description: `E-Commerce Storefront Order ${order.orderNumber} - ${order.customerName}`,
        referenceNumber: reference,
        userId: order.store.organizationId,
        entries: [
          { accountNumber: '1010', debit: Number(order.totalAmount), description: `${provider} checking receipt` },
          { accountNumber: '4000', credit: Number(order.totalAmount), description: 'E-commerce Sales Revenue' }
        ]
      })
    })

    revalidatePath('/dashboard/ecommerce')
    return { success: true, message: 'E-commerce order reconciled successfully' }
  }

  return { success: false, error: 'No matching entity found for reconciliation' }
}
