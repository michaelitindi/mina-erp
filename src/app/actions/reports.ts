'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')

  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })

  if (!org) throw new Error('Organization not found')
  return { userId, orgId: org.id }
}

export type FinancialStatementLine = {
  accountNumber: string
  accountName: string
  balance: number
}

export type ProfitAndLoss = {
  revenue: FinancialStatementLine[]
  expenses: FinancialStatementLine[]
  totalRevenue: number
  totalExpenses: number
  netIncome: number
}

export type BalanceSheet = {
  assets: FinancialStatementLine[]
  liabilities: FinancialStatementLine[]
  equity: FinancialStatementLine[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
}

/**
 * Generates a Profit & Loss statement based on GL entries
 */
export async function getProfitAndLoss(startDate: Date, endDate: Date): Promise<ProfitAndLoss> {
  const { orgId } = await getOrganization()

  // Find all revenue and expense accounts and their entries in the period
  const accounts = await prisma.account.findMany({
    where: {
      organizationId: orgId,
      accountType: { in: ['REVENUE', 'EXPENSE'] },
      deletedAt: null,
    },
    include: {
      entries: {
        where: {
          transaction: {
            transactionDate: { gte: startDate, lte: endDate },
            status: 'POSTED',
            deletedAt: null,
          }
        }
      }
    }
  })

  const revenue: FinancialStatementLine[] = []
  const expenses: FinancialStatementLine[] = []
  let totalRevenue = 0
  let totalExpenses = 0

  accounts.forEach(acc => {
    // Calculate period balance
    const balance = acc.entries.reduce((sum, entry) => {
      const debit = Number(entry.debit)
      const credit = Number(entry.credit)
      return sum + (acc.accountType === 'REVENUE' ? (credit - debit) : (debit - credit))
    }, 0)

    const line = {
      accountNumber: acc.accountNumber,
      accountName: acc.accountName,
      balance,
    }

    if (acc.accountType === 'REVENUE') {
      revenue.push(line)
      totalRevenue += balance
    } else {
      expenses.push(line)
      totalExpenses += balance
    }
  })

  return {
    revenue,
    expenses,
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
  }
}

/**
 * Generates a Balance Sheet based on account balances as of a date
 */
export async function getBalanceSheet(asOfDate: Date): Promise<BalanceSheet> {
  const { orgId } = await getOrganization()

  // For a basic balance sheet, we can use the account balances directly
  // In a more advanced version, we'd sum all entries up to asOfDate
  const accounts = await prisma.account.findMany({
    where: {
      organizationId: orgId,
      accountType: { in: ['ASSET', 'LIABILITY', 'EQUITY'] },
      deletedAt: null,
    }
  })

  const assets: FinancialStatementLine[] = []
  const liabilities: FinancialStatementLine[] = []
  const equity: FinancialStatementLine[] = []
  let totalAssets = 0
  let totalLiabilities = 0
  let totalEquity = 0

  accounts.forEach(acc => {
    const balance = Number(acc.balance)
    const line = {
      accountNumber: acc.accountNumber,
      accountName: acc.accountName,
      balance,
    }

    if (acc.accountType === 'ASSET') {
      assets.push(line)
      totalAssets += balance
    } else if (acc.accountType === 'LIABILITY') {
      liabilities.push(line)
      totalLiabilities += balance
    } else {
      equity.push(line)
      totalEquity += balance
    }
  })

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
  }
}

/**
 * Returns a basic summary of GL performance for the dashboard
 */
export type VatSummaryLine = {
  category: string
  rate: number
  amount: number
  taxAmount: number
}

export type Vat3Summary = {
  sales: VatSummaryLine[]
  purchases: VatSummaryLine[]
  totalOutputTax: number
  totalInputTax: number
  netVatPayable: number
}

/**
 * Generates a VAT 3 summary for KRA returns
 */
export async function getVat3Summary(startDate: Date, endDate: Date): Promise<Vat3Summary> {
  const { orgId } = await getOrganization()

  // 1. Get all posted invoices in period
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      invoiceDate: { gte: startDate, lte: endDate },
      status: { not: 'VOID' },
      deletedAt: null
    },
    include: { lineItems: true }
  })

  // 2. Get all approved bills in period
  const bills = await prisma.bill.findMany({
    where: {
      organizationId: orgId,
      billDate: { gte: startDate, lte: endDate },
      status: { not: 'VOID' },
      deletedAt: null
    },
    include: { lineItems: true }
  })

  // Helper to group by tax rate
  const groupByTax = (items: any[]) => {
    const summary: Record<string, VatSummaryLine> = {}
    
    items.forEach(item => {
      item.lineItems.forEach((li: any) => {
        const rate = Number(li.taxRate)
        const key = rate.toString()
        
        if (!summary[key]) {
          summary[key] = {
            category: rate === 16 ? 'Standard (16%)' : rate === 8 ? 'Fuel (8%)' : rate === 0 ? 'Zero Rated' : 'Exempt',
            rate,
            amount: 0,
            taxAmount: 0
          }
        }
        
        const lineAmount = Number(li.amount)
        const lineTax = lineAmount * (rate / 100)
        
        summary[key].amount += lineAmount
        summary[key].taxAmount += lineTax
      })
    })
    
    return Object.values(summary)
  }

  const salesSummary = groupByTax(invoices)
  const purchasesSummary = groupByTax(bills)

  const totalOutputTax = salesSummary.reduce((sum, s) => sum + s.taxAmount, 0)
  const totalInputTax = purchasesSummary.reduce((sum, p) => sum + p.taxAmount, 0)

  return {
    sales: salesSummary,
    purchases: purchasesSummary,
    totalOutputTax,
    totalInputTax,
    netVatPayable: totalOutputTax - totalInputTax
  }
}
