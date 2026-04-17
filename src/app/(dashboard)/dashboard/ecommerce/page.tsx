import { getStores, getOnlineOrders, getEcommerceStats, getOnlineProducts } from '@/app/actions/ecommerce'
import { checkModuleAccess } from '@/lib/module-access'
import { StoresTable } from '@/components/ecommerce/stores-table'
import { CreateStoreButton } from '@/components/ecommerce/store-buttons'
import { CreateProductButton, ProductsTable } from '@/components/ecommerce/products'
import { Store, ShoppingBag, Package, DollarSign, Clock } from 'lucide-react'

export default async function EcommercePage() {
  await checkModuleAccess('ECOMMERCE')
  const [stores, orders, stats, products] = await Promise.all([
    getStores(), 
    getOnlineOrders(), 
    getEcommerceStats(),
    getOnlineProducts()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">E-Commerce</h1>
          <p className="text-zinc-500">Manage online stores, products, and orders</p>
        </div>
        <div className="flex gap-3">
          <CreateStoreButton />
          <CreateProductButton stores={stores} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><Store className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-zinc-500">Stores</p><p className="text-2xl font-bold text-white">{stats.totalStores}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><Package className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-zinc-500">Products</p><p className="text-2xl font-bold text-white">{stats.totalProducts}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><ShoppingBag className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-sm text-zinc-500">Orders</p><p className="text-2xl font-bold text-white">{stats.totalOrders}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2"><Clock className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-sm text-zinc-500">Pending</p><p className="text-2xl font-bold text-white">{stats.pendingOrders}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2"><DollarSign className="h-5 w-5 text-emerald-400" /></div>
            <div><p className="text-sm text-zinc-500">Revenue</p><p className="text-2xl font-bold text-white">${stats.revenue.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <Store className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="mt-4 text-lg font-semibold text-white">No online stores yet</h3>
          <p className="mt-2 text-zinc-500">Create your first online store to start selling.</p>
          <div className="mt-6"><CreateStoreButton /></div>
        </div>
      ) : (
        <div className="space-y-6">
          <StoresTable stores={stores} />
          
          {/* Products Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Products</h2>
            {products.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                <Package className="mx-auto h-10 w-10 text-zinc-700" />
                <p className="mt-2 text-zinc-500">No products yet. Add your first product to start selling.</p>
                <div className="mt-4"><CreateProductButton stores={stores} /></div>
              </div>
            ) : (
              <ProductsTable products={products} />
            )}
          </div>
          
          {/* Orders Section */}
          {orders.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="border-b border-zinc-800 p-4 bg-zinc-900/50">
                <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900">
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Store</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders.slice(0, 10).map(order => (
                      <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-white">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm text-zinc-300">{order.store.name}</td>
                        <td className="px-6 py-4 text-sm text-zinc-300">{order.customerName}</td>
                        <td className="px-6 py-4 text-sm text-white text-right">${Number(order.totalAmount).toLocaleString()}</td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'DELIVERED' ? 'text-green-400 bg-green-400/10' :
                          order.status === 'SHIPPED' ? 'text-blue-400 bg-blue-400/10' :
                          order.status === 'PENDING' ? 'text-yellow-400 bg-yellow-400/10' :
                          'text-zinc-500 bg-zinc-500/10'
                        }`}>{order.status}</span></td>
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
