'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePurchaseOrder, updatePOStatus } from '@/app/actions/purchase-orders'
import { Trash2, Send, CheckCircle, XCircle } from 'lucide-react'

interface PurchaseOrder {
  id: string
  poNumber: string
  status: string
  orderDate: Date
  totalAmount: number | { toNumber: () => number }
  vendor: { companyName: string }
  _count?: { lineItems: number; goodsReceipts: number }
}

const getAmount = (amt: number | { toNumber: () => number }): number => typeof amt === 'number' ? amt : amt?.toNumber?.() || 0

export function POTable({ orders }: { orders: PurchaseOrder[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  const statusColors: Record<string, string> = {
    DRAFT: 'text-slate-400 bg-slate-400/10',
    SENT: 'text-blue-400 bg-blue-400/10',
    CONFIRMED: 'text-purple-400 bg-purple-400/10',
    PARTIAL: 'text-yellow-400 bg-yellow-400/10',
    RECEIVED: 'text-green-400 bg-green-400/10',
    CANCELLED: 'text-red-400 bg-red-400/10',
  }

  async function handleStatusChange(id: string, status: string) {
    setProcessingId(id)
    try { await updatePOStatus(id, status); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this purchase order?')) return
    setProcessingId(id)
    try { await deletePurchaseOrder(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800">
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">PO #</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Vendor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {orders.map((po) => (
            <tr key={po.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-white font-mono">{po.poNumber}</p>
                <p className="text-xs text-slate-400">{po._count?.lineItems || 0} items</p>
              </td>
              <td className="px-6 py-4"><span className="text-sm text-slate-300">{po.vendor.companyName}</span></td>
              <td className="px-6 py-4"><span className="text-sm text-slate-300">{new Date(po.orderDate).toLocaleDateString()}</span></td>
              <td className="px-6 py-4 text-right"><span className="text-sm text-white font-mono">${getAmount(po.totalAmount).toLocaleString()}</span></td>
              <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[po.status]}`}>{po.status}</span></td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1">
                  {po.status === 'DRAFT' && (
                    <button onClick={() => handleStatusChange(po.id, 'SENT')} disabled={processingId === po.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-600/20 hover:text-blue-400 transition-colors disabled:opacity-50" title="Send to Vendor">
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  {(po.status === 'SENT' || po.status === 'CONFIRMED') && (
                    <button onClick={() => handleStatusChange(po.id, 'RECEIVED')} disabled={processingId === po.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-green-600/20 hover:text-green-400 transition-colors disabled:opacity-50" title="Mark Received">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' && (
                    <button onClick={() => handleStatusChange(po.id, 'CANCELLED')} disabled={processingId === po.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Cancel">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(po.id)} disabled={processingId === po.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
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
