import { getBudgets, getBudgetStats } from '@/app/actions/budgets'
import { getAccounts } from '@/app/actions/accounts'
import { BudgetsTable } from '@/components/finance/budgets-table'
import { CreateBudgetButton } from '@/components/finance/budget-buttons'
import { PiggyBank, CheckCircle, Calendar, DollarSign } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export default async function BudgetsPage() {
  const { orgId } = await auth()
  const org = orgId ? await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { currency: true }
  }) : null
  const currency = org?.currency || 'USD'

  const [budgets, stats, accounts] = await Promise.all([
    getBudgets(),
    getBudgetStats(),
    getAccounts()
  ])

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budgets</h1>
          <p className="text-zinc-500">Manage financial budgets and track variance</p>
        </div>
        <CreateBudgetButton accounts={accounts} currency={currency} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><PiggyBank className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Total Budgets</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><CheckCircle className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Active</p><p className="text-2xl font-bold text-white">{stats.active}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><Calendar className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Current Year</p><p className="text-2xl font-bold text-white">{currentYear}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2"><DollarSign className="h-5 w-5 text-orange-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">{currentYear} Budget</p><p className="text-2xl font-bold text-white">{formatCurrency(stats.currentYearTotal, currency)}</p></div>
          </div>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center shadow-sm backdrop-blur-sm">
          <PiggyBank className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 text-lg font-semibold text-white">No budgets yet</h3>
          <p className="mt-2 text-zinc-500">Create your first budget to start tracking spending against targets.</p>
          <div className="mt-6"><CreateBudgetButton accounts={accounts} currency={currency} /></div>
        </div>
      ) : (
        <BudgetsTable budgets={budgets} currency={currency} />
      )}
    </div>
  )
}
