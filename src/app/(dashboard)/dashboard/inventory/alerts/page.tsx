import { getLowStockAlerts } from '@/app/actions/products'
import { AlertTriangle, Package, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function AlertsPage() {
  const alerts = await getLowStockAlerts()

  const critical = alerts.filter((a: any) => a.isCritical)
  const low = alerts.filter((a: any) => !a.isCritical)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reorder Alerts</h1>
          <p className="text-zinc-500">Products that need restocking</p>
        </div>
        <Link href="/dashboard/procurement/purchase-orders" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
          <ShoppingBag className="h-4 w-4" />Create Purchase Order
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Critical</p><p className="text-2xl font-bold text-red-400">{critical.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2"><AlertTriangle className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Low Stock</p><p className="text-2xl font-bold text-yellow-400">{low.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><Package className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Total Alerts</p><p className="text-2xl font-bold text-white">{alerts.length}</p></div>
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center shadow-sm backdrop-blur-sm">
          <Package className="mx-auto h-12 w-12 text-green-500 opacity-50" />
          <h3 className="mt-4 text-lg font-semibold text-white">All stock levels are healthy!</h3>
          <p className="mt-2 text-zinc-500">No products are below their reorder levels.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {critical.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2 uppercase tracking-tight">
                <AlertTriangle className="h-5 w-5" /> Critical - Out of Stock
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {critical.map(product => (
                  <div key={product.id} className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 shadow-lg shadow-red-500/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">{product.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1">{product.sku}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-black tracking-widest">OUT</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] text-zinc-500 uppercase font-bold">Stock</p><p className="text-lg font-bold text-white">0</p></div>
                      <div><p className="text-[10px] text-zinc-500 uppercase font-bold">Reorder</p><p className="text-lg font-bold text-white">{product.reorderLevel}</p></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-red-500/10">
                      <p className="text-xs text-zinc-400 font-medium italic">Suggested Order: <span className="text-blue-400 font-black not-italic">{product.suggestedOrder} units</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {low.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2 uppercase tracking-tight">
                <AlertTriangle className="h-5 w-5" /> Low Stock Warning
              </h2>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-sm backdrop-blur-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stock</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reorder</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deficit</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {low.map(product => (
                      <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{product.name}</p>
                          <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{product.sku}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 text-xs font-black">
                            {product.totalStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium text-zinc-400">{product.reorderLevel}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-red-400 font-black">-{Math.abs(product.deficit)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-blue-400 font-black">{product.suggestedOrder} <span className="text-[10px] font-medium opacity-50">units</span></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
