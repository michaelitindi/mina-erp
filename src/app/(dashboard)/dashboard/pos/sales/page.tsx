import { getSales, getDailySummary } from '@/app/actions/pos'
import { Receipt, DollarSign, CreditCard, Banknote } from 'lucide-react'

export default async function POSSalesPage() {
  const [sales, summary] = await Promise.all([
    getSales(),
    getDailySummary(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales History</h1>
          <p className="text-slate-400">View transaction history</p>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Today's Sales</p>
              <p className="text-2xl font-bold text-white">${summary.totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Receipt className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Transactions</p>
              <p className="text-2xl font-bold text-white">{summary.totalTransactions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Banknote className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Cash</p>
              <p className="text-2xl font-bold text-white">
                ${(summary.byPaymentMethod['CASH'] || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <CreditCard className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Card</p>
              <p className="text-2xl font-bold text-white">
                ${(summary.byPaymentMethod['CARD'] || summary.byPaymentMethod['STRIPE'] || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Sale #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Payment</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No sales yet</p>
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-mono text-sm text-white">{sale.saleNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(sale.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {sale.items.length} items
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {sale.payments[0]?.providerType === 'CASH' ? (
                          <Banknote className="h-4 w-4 text-green-400" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-blue-400" />
                        )}
                        <span className="text-sm text-slate-300">
                          {sale.payments[0]?.providerType || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-white">
                      ${Number(sale.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'COMPLETED' ? 'text-green-400 bg-green-400/10' :
                        sale.status === 'VOIDED' ? 'text-red-400 bg-red-400/10' :
                        'text-slate-400 bg-slate-400/10'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
