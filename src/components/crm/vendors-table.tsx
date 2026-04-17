'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteVendor } from '@/app/actions/vendors'
import { Trash2, Eye, Mail, Phone } from 'lucide-react'

interface Vendor {
  id: string
  vendorNumber: string
  companyName: string
  contactPerson: string | null
  email: string
  phone: string | null
  status: string
  _count?: { bills: number }
}

export function VendorsTable({ vendors }: { vendors: Vendor[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this vendor?')) return
    setDeletingId(id)
    try {
      await deleteVendor(id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete vendor')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Vendor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Contact</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Bills</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-white">{vendor.companyName}</p>
                <p className="text-xs text-zinc-500 font-mono">{vendor.vendorNumber}</p>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {vendor.contactPerson && <p className="text-sm text-white">{vendor.contactPerson}</p>}
                  <div className="flex items-center gap-1 text-xs text-zinc-500"><Mail className="h-3 w-3" />{vendor.email}</div>
                  {vendor.phone && <div className="flex items-center gap-1 text-xs text-zinc-500"><Phone className="h-3 w-3" />{vendor.phone}</div>}
                </div>
              </td>
              <td className="px-6 py-4 text-center"><span className="text-sm text-white">{vendor._count?.bills || 0}</span></td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${vendor.status === 'ACTIVE' ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-500/10'}`}>{vendor.status}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-700 hover:text-white transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(vendor.id)} disabled={deletingId === vendor.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
