import { getSalesOrders, getSalesOrderStats } from '@/app/actions/sales-orders'
import { getCustomers } from '@/app/actions/customers'
import { getWarehouses } from '@/app/actions/warehouses'
import { SalesOrdersTable } from '@/components/sales/sales-orders-table'
import { CreateSalesOrderButton } from '@/components/sales/sales-order-buttons'
import { ShoppingCart, Package, Truck, CheckCircle } from 'lucide-react'

export default async function SalesOrdersPage() {
  const [ordersResult, stats, customersResult, warehouses] = await Promise.all([
    getSalesOrders(),
    getSalesOrderStats(),
    getCustomers(),
    getWarehouses()
  ])

  const orders = ordersResult.items
  const customers = customersResult.items

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Sales Orders</h1>
          <p className="text-sm text-zinc-500 font-medium">Manage customer orders and fulfillment</p>
        </div>
        <CreateSalesOrderButton customers={customers} warehouses={warehouses} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><ShoppingCart className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Orders</p><p className="text-2xl font-bold text-white">{stats.total.count}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2"><Package className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Processing</p><p className="text-2xl font-bold text-white">{stats.confirmed.count}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><Truck className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Shipped</p><p className="text-2xl font-bold text-white">{stats.shipped.count}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><CheckCircle className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Delivered</p><p className="text-2xl font-bold text-white">${stats.delivered.amount.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center shadow-sm backdrop-blur-sm">
          <div className="mx-auto h-16 w-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">No sales orders yet</h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">Create your first sales order to start processing customer orders and managing inventory.</p>
          <div className="mt-8">
            <CreateSalesOrderButton customers={customers} warehouses={warehouses} />
          </div>
        </div>
      ) : (
        <SalesOrdersTable orders={orders} />
      )}
    </div>
  )
}
