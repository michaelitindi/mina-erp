'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAsset, updateAssetStatus, calculateDepreciation } from '@/app/actions/assets'
import { Trash2, Wrench, Calculator, CheckCircle } from 'lucide-react'

interface Asset {
  id: string
  assetNumber: string
  name: string
  category: string
  location: string | null
  purchasePrice: number | { toNumber: () => number }
  currentValue: number | { toNumber: () => number }
  status: string
  purchaseDate: Date
  _count?: { maintenanceRecords: number }
}

const getAmount = (amt: number | { toNumber: () => number }): number => typeof amt === 'number' ? amt : amt?.toNumber?.() || 0

export function AssetsTable({ assets }: { assets: Asset[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  const statusColors: Record<string, string> = {
    ACTIVE: 'text-green-400 bg-green-400/10',
    DISPOSED: 'text-red-400 bg-red-400/10',
    UNDER_MAINTENANCE: 'text-yellow-400 bg-yellow-400/10',
  }

  const categoryColors: Record<string, string> = {
    EQUIPMENT: 'text-blue-400',
    VEHICLE: 'text-purple-400',
    FURNITURE: 'text-orange-400',
    IT: 'text-cyan-400',
    BUILDING: 'text-green-400',
  }

  async function handleStatusChange(id: string, status: string) {
    setProcessingId(id)
    try { await updateAssetStatus(id, status); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  async function handleDepreciation(id: string) {
    setProcessingId(id)
    try { await calculateDepreciation(id); router.refresh(); alert('Depreciation calculated') }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this asset?')) return
    setProcessingId(id)
    try { await deleteAsset(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Asset</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Location</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Purchase</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Book Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-white">{asset.name}</p>
                <p className="text-xs text-zinc-500 font-mono">{asset.assetNumber}</p>
              </td>
              <td className="px-6 py-4"><span className={`text-sm font-medium ${categoryColors[asset.category]}`}>{asset.category}</span></td>
              <td className="px-6 py-4"><span className="text-sm text-zinc-400">{asset.location || '—'}</span></td>
              <td className="px-6 py-4 text-right"><span className="text-sm text-zinc-400">${getAmount(asset.purchasePrice).toLocaleString()}</span></td>
              <td className="px-6 py-4 text-right"><span className="text-sm text-white font-mono">${getAmount(asset.currentValue).toLocaleString()}</span></td>
              <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[asset.status]}`}>{asset.status.replace('_', ' ')}</span></td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1">
                  <button onClick={() => handleDepreciation(asset.id)} disabled={processingId === asset.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-blue-600/20 hover:text-blue-400 transition-colors disabled:opacity-50" title="Calculate Depreciation">
                    <Calculator className="h-4 w-4" />
                  </button>
                  {asset.status === 'ACTIVE' && (
                    <button onClick={() => handleStatusChange(asset.id, 'UNDER_MAINTENANCE')} disabled={processingId === asset.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-yellow-600/20 hover:text-yellow-400 transition-colors disabled:opacity-50" title="Maintenance">
                      <Wrench className="h-4 w-4" />
                    </button>
                  )}
                  {asset.status === 'UNDER_MAINTENANCE' && (
                    <button onClick={() => handleStatusChange(asset.id, 'ACTIVE')} disabled={processingId === asset.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-green-600/20 hover:text-green-400 transition-colors disabled:opacity-50" title="Mark Active">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(asset.id)} disabled={processingId === asset.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
