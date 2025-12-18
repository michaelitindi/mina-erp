'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSalesOrder, updateSalesOrderStatus } from '@/app/actions/sales-orders'
import { Trash2, CheckCircle, Truck, Package, XCircle } from 'lucide-react'

interface SalesOrder {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  orderDate: Date
  totalAmount: number | { toNumber: () => number }
  customer: { companyName: string }
  _count?: { lineItems: number; deliveries: number }
}

const getAmount = (amt: number | { toNumber: () => number }): number => typeof amt === 'number' ? amt : amt?.toNumber?.() || 0

export function SalesOrdersTable({ orders }: { orders: SalesOrder[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  const statusColors: Record<string, string> = {
    DRAFT: 'text-slate-400 bg-slate-400/10',
    CONFIRMED: 'text-blue-400 bg-blue-400/10',
    PROCESSING: 'text-yellow-400 bg-yellow-400/10',
    SHIPPED: 'text-purple-400 bg-purple-400/10',
    DELIVERED: 'text-green-400 bg-green-400/10',
    CANCELLED: 'text-red-400 bg-red-400/10',
  }

  const paymentColors: Record<string, string> = {
    UNPAID: 'text-red-400',
    PARTIAL: 'text-yellow-400',
    PAID: 'text-green-400',
  }

  async function handleStatusChange(id: string, status: string) {
    setProcessingId(id)
    try { await updateSalesOrderStatus(id, status); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this order?')) return
    setProcessingId(id)
    try { await deleteSalesOrder(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800">
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Order #</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Total</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Payment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-white font-mono">{order.orderNumber}</p>
                <p className="text-xs text-slate-400">{order._count?.lineItems || 0} items</p>
              </td>
              <td className="px-6 py-4"><span className="text-sm text-slate-300">{order.customer.companyName}</span></td>
              <td className="px-6 py-4"><span className="text-sm text-slate-300">{new Date(order.orderDate).toLocaleDateString()}</span></td>
              <td className="px-6 py-4 text-right"><span className="text-sm text-white font-mono">${getAmount(order.totalAmount).toLocaleString()}</span></td>
              <td className="px-6 py-4 text-center"><span className={`text-xs font-medium ${paymentColors[order.paymentStatus]}`}>{order.paymentStatus}</span></td>
              <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{order.status}</span></td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1">
                  {order.status === 'DRAFT' && (
                    <button onClick={() => handleStatusChange(order.id, 'CONFIRMED')} disabled={processingId === order.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-600/20 hover:text-blue-400 transition-colors disabled:opacity-50" title="Confirm">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button onClick={() => handleStatusChange(order.id, 'PROCESSING')} disabled={processingId === order.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-yellow-600/20 hover:text-yellow-400 transition-colors disabled:opacity-50" title="Start Processing">
                      <Package className="h-4 w-4" />
                    </button>
                  )}
                  {order.status === 'PROCESSING' && (
                    <button onClick={() => handleStatusChange(order.id, 'SHIPPED')} disabled={processingId === order.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-600/20 hover:text-purple-400 transition-colors disabled:opacity-50" title="Mark Shipped">
                      <Truck className="h-4 w-4" />
                    </button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button onClick={() => handleStatusChange(order.id, 'DELIVERED')} disabled={processingId === order.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-green-600/20 hover:text-green-400 transition-colors disabled:opacity-50" title="Mark Delivered">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <button onClick={() => handleStatusChange(order.id, 'CANCELLED')} disabled={processingId === order.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Cancel">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(order.id)} disabled={processingId === order.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
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
