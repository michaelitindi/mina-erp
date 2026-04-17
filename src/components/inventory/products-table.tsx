'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProduct } from '@/app/actions/products'
import { Trash2 } from 'lucide-react'

interface Product {
  id: string
  sku: string
  name: string
  category: string | null
  type: string
  costPrice: number | { toNumber: () => number }
  sellingPrice: number | { toNumber: () => number }
  isActive: boolean
  stockLevels: { quantity: number | { toNumber: () => number }; warehouse: { name: string } }[]
}

const getAmount = (amt: number | { toNumber: () => number }): number => typeof amt === 'number' ? amt : amt?.toNumber?.() || 0

export function ProductsTable({ products }: { products: Product[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    setProcessingId(id)
    try { await deleteProduct(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Category</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Cost</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Price</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Stock</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {products.map((product) => {
            const totalStock = product.stockLevels.reduce((sum, sl) => sum + getAmount(sl.quantity), 0)
            return (
              <tr key={product.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-white">{product.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{product.sku}</p>
                </td>
                <td className="px-6 py-4"><span className="text-sm text-zinc-400">{product.category || '—'}</span></td>
                <td className="px-6 py-4 text-right"><span className="text-sm text-zinc-400">${getAmount(product.costPrice).toFixed(2)}</span></td>
                <td className="px-6 py-4 text-right"><span className="text-sm text-white font-mono">${getAmount(product.sellingPrice).toFixed(2)}</span></td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-medium ${totalStock === 0 ? 'text-red-400' : totalStock < 10 ? 'text-orange-400' : 'text-green-400'}`}>{totalStock}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-500/10'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(product.id)} disabled={processingId === product.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
