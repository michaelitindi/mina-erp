'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSalesOrderStatus, createInvoiceFromSalesOrder } from '@/app/actions/sales-orders'
import { CheckCircle2, Ban, FileText, Loader2, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreateShipmentButton } from './shipment-buttons'

interface SalesOrder {
  id: string
  orderNumber: string
  status: string
  stockReserved: boolean
  invoiceId?: string | null
  lineItems: any[]
}

export function SalesOrderStatusButtons({ order }: { order: SalesOrder }) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  async function handleStatusUpdate(status: string) {
    if (status === 'CANCELLED' && !confirm('Are you sure you want to cancel this order? Stock will be released.')) return
    
    setIsLoading(status)
    try {
      await updateSalesOrderStatus(order.id, status)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setIsLoading(null)
    }
  }

  async function handleGenerateInvoice() {
    setIsLoading('INVOICE')
    try {
      const invoice = await createInvoiceFromSalesOrder(order.id)
      alert(`Invoice ${invoice.invoiceNumber} generated successfully!`)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate invoice')
    } finally {
      setIsLoading(null)
    }
  }

  // Define button visibility
  const showConfirm = order.status === 'DRAFT'
  const showCancel = ['DRAFT', 'CONFIRMED', 'PROCESSING'].includes(order.status)
  const showGenerateInvoice = ['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status) && !order.invoiceId
  const showShipment = ['CONFIRMED', 'PROCESSING'].includes(order.status)

  return (
    <div className="flex items-center gap-2">
      {showConfirm && (
        <button
          onClick={() => handleStatusUpdate('CONFIRMED')}
          disabled={!!isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
        >
          {isLoading === 'CONFIRMED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Confirm & Reserve Stock
        </button>
      )}

      {showShipment && <CreateShipmentButton order={order} />}

      {showGenerateInvoice && (
        <button
          onClick={handleGenerateInvoice}
          disabled={!!isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all active:scale-95"
        >
          {isLoading === 'INVOICE' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 text-green-400" />}
          Generate Invoice
        </button>
      )}

      {showCancel && (
        <button
          onClick={() => handleStatusUpdate('CANCELLED')}
          disabled={!!isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading === 'CANCELLED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
          Cancel Order
        </button>
      )}
    </div>
  )
}
