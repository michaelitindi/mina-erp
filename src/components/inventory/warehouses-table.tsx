'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteWarehouse } from '@/app/actions/warehouses'
import { Trash2, Star } from 'lucide-react'

interface Warehouse {
  id: string
  code: string
  name: string
  city: string | null
  country: string | null
  isDefault: boolean
  isActive: boolean
  _count?: { stockLevels: number }
}

export function WarehousesTable({ warehouses }: { warehouses: Warehouse[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Delete this warehouse? Stock must be empty.')) return
    setProcessingId(id)
    try { await deleteWarehouse(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800">
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Warehouse</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Location</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Products</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {warehouses.map((wh) => (
            <tr key={wh.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{wh.name}</p>
                  {wh.isDefault && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                </div>
                <p className="text-xs text-slate-400 font-mono">{wh.code}</p>
              </td>
              <td className="px-6 py-4"><span className="text-sm text-slate-300">{[wh.city, wh.country].filter(Boolean).join(', ') || '—'}</span></td>
              <td className="px-6 py-4 text-center"><span className="text-sm text-white">{wh._count?.stockLevels || 0}</span></td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${wh.isActive ? 'text-green-400 bg-green-400/10' : 'text-slate-400 bg-slate-400/10'}`}>
                  {wh.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => handleDelete(wh.id)} disabled={processingId === wh.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
