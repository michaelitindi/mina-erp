import { getSalesOrders, getSalesOrderStats } from '@/app/actions/sales-orders'
import { getCustomers } from '@/app/actions/customers'
import { SalesOrdersTable } from '@/components/sales/sales-orders-table'
import { CreateSalesOrderButton } from '@/components/sales/sales-order-buttons'
import { ShoppingCart, Package, Truck, CheckCircle } from 'lucide-react'

export default async function SalesOrdersPage() {
  const [orders, stats, customers] = await Promise.all([
    getSalesOrders(),
    getSalesOrderStats(),
    getCustomers()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Orders</h1>
          <p className="text-slate-400">Manage customer orders and fulfillment</p>
        </div>
        <CreateSalesOrderButton customers={customers} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><ShoppingCart className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-slate-400">Total Orders</p><p className="text-2xl font-bold text-white">{stats.total.count}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2"><Package className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-sm text-slate-400">Processing</p><p className="text-2xl font-bold text-white">{stats.confirmed.count}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><Truck className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-sm text-slate-400">Shipped</p><p className="text-2xl font-bold text-white">{stats.shipped.count}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><CheckCircle className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-slate-400">Delivered</p><p className="text-2xl font-bold text-white">${stats.delivered.amount.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">No sales orders yet</h3>
          <p className="mt-2 text-slate-400">Create your first sales order to start processing customer orders.</p>
          <div className="mt-6"><CreateSalesOrderButton customers={customers} /></div>
        </div>
      ) : (
        <SalesOrdersTable orders={orders} />
      )}
    </div>
  )
}
