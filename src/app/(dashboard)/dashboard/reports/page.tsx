import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Calendar,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { getProfitAndLoss, getBalanceSheet } from '@/app/actions/reports'
import Link from 'next/link'

export default async function ReportsPage() {
  const { orgId } = await auth()
  if (!orgId) redirect('/')

  // Fetch real GL data for the current year-to-date
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  
  const [pnl, balanceSheet] = await Promise.all([
    getProfitAndLoss(startOfYear, now),
    getBalanceSheet(now)
  ])

  const profitMargin = pnl.totalRevenue > 0 ? ((pnl.netIncome / pnl.totalRevenue) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Center</h1>
          <p className="text-zinc-500">Professional accounting reports from General Ledger</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-all shadow-sm">
            <Download className="h-4 w-4" />Export GL
          </button>
        </div>
      </div>

      {/* High-Level Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-3"><TrendingUp className="h-6 w-6 text-green-400" /></div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">YTD Revenue</p>
              <p className="text-2xl font-bold text-green-400">${pnl.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-3"><TrendingDown className="h-6 w-6 text-red-400" /></div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">YTD Expenses</p>
              <p className="text-2xl font-bold text-red-400">${pnl.totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-3"><DollarSign className="h-6 w-6 text-blue-400" /></div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Net Income</p>
              <p className={`text-2xl font-bold ${pnl.netIncome >= 0 ? 'text-blue-400' : 'text-red-400'}`}>${pnl.netIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-3"><PieChart className="h-6 w-6 text-purple-400" /></div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Profit Margin</p>
              <p className="text-2xl font-bold text-purple-400">{profitMargin}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profit & Loss Statement */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-xl">
          <div className="border-b border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><BarChart3 className="h-5 w-5 text-blue-400" /></div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Profit & Loss</h2>
            </div>
            <span className="text-xs font-black bg-zinc-800 text-zinc-400 px-2 py-1 rounded">YTD</span>
          </div>
          <div className="p-6 space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Operating Revenue</h3>
              <div className="space-y-2">
                {pnl.revenue.map(line => (
                  <div key={line.accountNumber} className="flex justify-between text-sm py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-300">{line.accountName}</span>
                    <span className="text-white font-mono">${line.balance.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-black pt-2 text-green-400">
                  <span>Total Revenue</span>
                  <span className="font-mono">${pnl.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Operating Expenses</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {pnl.expenses.map(line => (
                  <div key={line.accountNumber} className="flex justify-between text-sm py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">{line.accountName}</span>
                    <span className="text-zinc-200 font-mono">${line.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-black pt-4 text-red-400 border-t border-zinc-800 mt-2">
                <span>Total Expenses</span>
                <span className="font-mono">${pnl.totalExpenses.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-zinc-800 flex justify-between items-center">
              <span className="text-lg font-black text-white">Net Income</span>
              <span className={`text-2xl font-black font-mono ${pnl.netIncome >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                ${pnl.netIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Sheet */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-xl">
          <div className="border-b border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><FileText className="h-5 w-5 text-purple-400" /></div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Balance Sheet</h2>
            </div>
            <span className="text-xs font-black bg-zinc-800 text-zinc-400 px-2 py-1 rounded">As of Today</span>
          </div>
          <div className="p-6 space-y-6">
            {/* Assets */}
            <div>
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Assets</h3>
              <div className="space-y-2">
                {balanceSheet.assets.map(line => (
                  <div key={line.accountNumber} className="flex justify-between text-sm py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-300">{line.accountName}</span>
                    <span className="text-white font-mono">${line.balance.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-black pt-2 text-blue-400">
                  <span>Total Assets</span>
                  <span className="font-mono">${balanceSheet.totalAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div>
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Liabilities & Equity</h3>
              <div className="space-y-2">
                {balanceSheet.liabilities.map(line => (
                  <div key={line.accountNumber} className="flex justify-between text-sm py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">{line.accountName}</span>
                    <span className="text-zinc-200 font-mono">${line.balance.toLocaleString()}</span>
                  </div>
                ))}
                {balanceSheet.equity.map(line => (
                  <div key={line.accountNumber} className="flex justify-between text-sm py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-400">{line.accountName}</span>
                    <span className="text-zinc-200 font-mono">${line.balance.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-black pt-2 text-purple-400 border-t border-zinc-800 mt-2">
                  <span>Total Liabilities & Equity</span>
                  <span className="font-mono">${(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Reconciliation Check */}
            <div className="pt-4 border-t border-zinc-800 flex justify-center">
              <div className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2 ${
                Math.abs(balanceSheet.totalAssets - (balanceSheet.totalLiabilities + balanceSheet.totalEquity)) < 1
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
              }`}>
                {Math.abs(balanceSheet.totalAssets - (balanceSheet.totalLiabilities + balanceSheet.totalEquity)) < 1 ? (
                  <>BOOKS BALANCED ✓</>
                ) : (
                  <>IMBALANCE DETECTED ⚠</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
