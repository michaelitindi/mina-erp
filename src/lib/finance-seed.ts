import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface DefaultAccount {
  accountNumber: string
  accountName: string
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  description: string
}

export const DEFAULT_CHART_OF_ACCOUNTS: DefaultAccount[] = [
  { accountNumber: '1000', accountName: 'Cash / Operating Account', accountType: 'ASSET', description: 'Primary liquid operating cash account' },
  { accountNumber: '1100', accountName: 'Accounts Receivable', accountType: 'ASSET', description: 'Customer outstanding invoice balances' },
  { accountNumber: '1200', accountName: 'Inventory Asset', accountType: 'ASSET', description: 'Valuation of physical stock on hand' },
  { accountNumber: '2000', accountName: 'Accounts Payable', accountType: 'LIABILITY', description: 'Vendor outstanding bill balances' },
  { accountNumber: '2100', accountName: 'Tax Payable (eTIMS/VAT)', accountType: 'LIABILITY', description: 'Accrued sales and value-added tax liability' },
  { accountNumber: '3000', accountName: 'Retained Earnings', accountType: 'EQUITY', description: 'Accumulated business equity earnings' },
  { accountNumber: '4000', accountName: 'Sales Revenue', accountType: 'REVENUE', description: 'Income from sales of goods and services' },
  { accountNumber: '5000', accountName: 'Cost of Goods Sold', accountType: 'EXPENSE', description: 'Direct cost of inventory sold' },
  { accountNumber: '5100', accountName: 'Operating Expenses', accountType: 'EXPENSE', description: 'General operational overhead expenses' },
]

/**
 * Seeds missing default Chart of Accounts for an organization inside a transaction or client.
 */
export async function seedDefaultAccounts(tx: any, organizationId: string, userId: string): Promise<void> {
  const existingAccounts = await tx.account.findMany({
    where: { organizationId, deletedAt: null },
    select: { accountNumber: true }
  })

  const existingNumbers = new Set(existingAccounts.map((a: any) => a.accountNumber))
  const missingAccounts = DEFAULT_CHART_OF_ACCOUNTS.filter(a => !existingNumbers.has(a.accountNumber))

  if (missingAccounts.length === 0) return

  await tx.account.createMany({
    data: missingAccounts.map(a => ({
      organizationId,
      accountNumber: a.accountNumber,
      accountName: a.accountName,
      accountType: a.accountType,
      description: a.description,
      balance: new Decimal(0),
      createdBy: userId,
    }))
  })
}
