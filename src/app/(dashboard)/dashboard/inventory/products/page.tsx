import { getProducts, getProductStats } from '@/app/actions/products'
import { ProductsTable } from '@/components/inventory/products-table'
import { CreateProductButton } from '@/components/inventory/product-buttons'
import { Package, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'

export default async function ProductsPage() {
  const [products, stats] = await Promise.all([
    getProducts(),
    getProductStats()
  ])

  const totalValue = products.reduce((sum, p) => {
    const stockQty = p.stockLevels.reduce((s, sl) => s + Number(sl.quantity), 0)
    return sum + (stockQty * Number(p.costPrice))
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-slate-400">Manage your inventory items</p>
        </div>
        <CreateProductButton />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><Package className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-slate-400">Total Products</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><CheckCircle className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-slate-400">Active</p><p className="text-2xl font-bold text-white">{stats.active}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2"><AlertTriangle className="h-5 w-5 text-orange-400" /></div>
            <div><p className="text-sm text-slate-400">Low Stock</p><p className="text-2xl font-bold text-white">{stats.lowStock}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><DollarSign className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-sm text-slate-400">Inventory Value</p><p className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">No products yet</h3>
          <p className="mt-2 text-slate-400">Add your first product to start tracking inventory.</p>
          <div className="mt-6"><CreateProductButton /></div>
        </div>
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  )
}
