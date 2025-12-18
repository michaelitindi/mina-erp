import { getPurchaseOrders, getPOStats } from '@/app/actions/purchase-orders'
import { getVendors } from '@/app/actions/vendors'
import { POTable } from '@/components/procurement/po-table'
import { CreatePOButton } from '@/components/procurement/po-buttons'
import { ShoppingBag, Send, Package, CheckCircle } from 'lucide-react'

export default async function PurchaseOrdersPage() {
  const [orders, stats, vendors] = await Promise.all([
    getPurchaseOrders(),
    getPOStats(),
    getVendors()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
          <p className="text-slate-400">Manage orders to vendors</p>
        </div>
        <CreatePOButton vendors={vendors} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><ShoppingBag className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-slate-400">Total POs</p><p className="text-2xl font-bold text-white">{stats.total.count}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2"><Package className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-sm text-slate-400">Draft</p><p className="text-2xl font-bold text-white">{stats.draft}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><Send className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-sm text-slate-400">Sent</p><p className="text-2xl font-bold text-white">{stats.sent}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><CheckCircle className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-slate-400">Received</p><p className="text-2xl font-bold text-white">{stats.received}</p></div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">No purchase orders yet</h3>
          <p className="mt-2 text-slate-400">Create your first purchase order to start ordering from vendors.</p>
          <div className="mt-6"><CreatePOButton vendors={vendors} /></div>
        </div>
      ) : (
        <POTable orders={orders} />
      )}
    </div>
  )
}
