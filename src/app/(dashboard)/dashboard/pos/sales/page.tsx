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
          <p className="text-zinc-500">View transaction history</p>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Today&apos;s Sales</p>
              <p className="text-2xl font-bold text-white">${summary.totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Receipt className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Transactions</p>
              <p className="text-2xl font-bold text-white">{summary.totalTransactions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Banknote className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Cash</p>
              <p className="text-2xl font-bold text-white">
                ${(summary.byPaymentMethod['CASH'] || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <CreditCard className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Card</p>
              <p className="text-2xl font-bold text-white">
                ${(summary.byPaymentMethod['CARD'] || summary.byPaymentMethod['STRIPE'] || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sale #</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Items</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-zinc-600">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-sm">No sales found for this period</p>
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-blue-400 font-bold">{sale.saleNumber}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400 font-medium">
                      {new Date(sale.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-white font-bold">{sale.items.length}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {sale.payments[0]?.providerType === 'CASH' ? (
                          <Banknote className="h-4 w-4 text-green-400" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-blue-400" />
                        )}
                        <span className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                          {sale.payments[0]?.providerType || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-black text-white">
                      ${Number(sale.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border border-current/20 ${
                        sale.status === 'COMPLETED' ? 'text-green-400 bg-green-400/10' :
                        sale.status === 'VOIDED' ? 'text-red-400 bg-red-400/10' :
                        'text-zinc-500 bg-zinc-500/10'
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
