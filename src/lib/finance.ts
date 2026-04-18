import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * Double-entry accounting utility for MinaERP
 */

interface LedgerEntry {
  accountNumber: string
  debit?: number | Decimal
  credit?: number | Decimal
  description?: string
}

interface PostToLedgerInput {
  organizationId: string
  transactionDate: Date
  description: string
  referenceNumber?: string
  userId: string
  entries: LedgerEntry[]
}

/**
 * Creates a balanced transaction in the General Ledger
 */
export async function postToLedger(tx: any, input: PostToLedgerInput) {
  const { organizationId, transactionDate, description, referenceNumber, userId, entries } = input

  // 1. Verify balance
  let totalDebit = new Decimal(0)
  let totalCredit = new Decimal(0)

  for (const entry of entries) {
    if (entry.debit) totalDebit = totalDebit.add(new Decimal(entry.debit.toString()))
    if (entry.credit) totalCredit = totalCredit.add(new Decimal(entry.credit.toString()))
  }

  if (!totalDebit.equals(totalCredit)) {
    throw new Error(`Transaction is not balanced. Debits: ${totalDebit}, Credits: ${totalCredit}`)
  }

  // 2. Find account IDs for the provided account numbers
  const accountNumbers = entries.map(e => e.accountNumber)
  const accounts = await tx.account.findMany({
    where: {
      organizationId,
      accountNumber: { in: accountNumbers },
      deletedAt: null,
    },
    select: { id: true, accountNumber: true }
  })

  if (accounts.length !== new Set(accountNumbers).size) {
    const foundNumbers = accounts.map((a: any) => a.accountNumber)
    const missing = accountNumbers.filter(n => !foundNumbers.includes(n))
    throw new Error(`Missing accounts in Chart of Accounts: ${missing.join(', ')}. Please seed or create them first.`)
  }

  const accountMap = accounts.reduce((acc: any, curr: any) => {
    acc[curr.accountNumber] = curr.id
    return acc
  }, {})

  // 3. Create the Transaction and Entries
  const transaction = await tx.transaction.create({
    data: {
      organizationId,
      transactionDate,
      description,
      referenceNumber,
      totalAmount: totalDebit,
      status: 'POSTED',
      createdBy: userId,
      entries: {
        create: entries.map(entry => ({
          accountId: accountMap[entry.accountNumber],
          debit: entry.debit ? new Decimal(entry.debit.toString()) : 0,
          credit: entry.credit ? new Decimal(entry.credit.toString()) : 0,
          description: entry.description || description,
        }))
      }
    }
  })

  // 4. Update account balances
  for (const entry of entries) {
    const amount = new Decimal(entry.debit?.toString() || 0).sub(new Decimal(entry.credit?.toString() || 0))
    await tx.account.update({
      where: { 
        organizationId_accountNumber: {
          organizationId,
          accountNumber: entry.accountNumber
        }
      },
      data: {
        balance: { increment: amount }
      }
    })
  }

  return transaction
}
