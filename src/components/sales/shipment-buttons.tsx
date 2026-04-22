'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createShipment } from '@/app/actions/shipments'
import { Truck, X, Package, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SalesOrderItem {
  id: string
  description: string
  sku: string | null
  productId: string | null
  quantity: number
  deliveredQty: number
}

interface SalesOrder {
  id: string
  orderNumber: string
  lineItems: SalesOrderItem[]
}

export function CreateShipmentButton({ order }: { order: SalesOrder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // Track quantities to ship per item
  const [shipQtys, setShipQtys] = useState<Record<string, number>>(
    Object.fromEntries(order.lineItems.map(item => [item.id, Math.max(0, Number(item.quantity) - Number(item.deliveredQty))]))
  )
  const router = useRouter()

  const updateQty = (id: string, val: number, max: number) => {
    setShipQtys({ ...shipQtys, [id]: Math.min(max, Math.max(0, val)) })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const shipmentItems = order.lineItems
      .filter(item => (shipQtys[item.id] || 0) > 0)
      .map(item => ({
        salesOrderItemId: item.id,
        productId: item.productId,
        description: item.description,
        sku: item.sku,
        quantity: shipQtys[item.id]
      }))

    if (shipmentItems.length === 0) {
      setError('Please select at least one item to ship.')
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    
    try {
      await createShipment({
        salesOrderId: order.id,
        deliveryDate: new Date(formData.get('deliveryDate') as string),
        carrier: formData.get('carrier') as string || null,
        trackingNumber: formData.get('trackingNumber') as string || null,
        notes: formData.get('notes') as string || null,
        items: shipmentItems
      })
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shipment')
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
      >
        <Truck className="h-4 w-4 text-purple-400" />
        Record Shipment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Record Shipment</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Fulfillment for {order.orderNumber}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Items Selection */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Select Items to Ship</h3>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                  {order.lineItems.map((item) => {
                    const remaining = Math.max(0, Number(item.quantity) - Number(item.deliveredQty))
                    if (remaining <= 0) return null
                    
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 group hover:border-zinc-700 transition-all">
                        <div className="col-span-7">
                          <p className="text-sm font-bold text-white">{item.description}</p>
                          <p className="text-[10px] font-black text-zinc-500 uppercase">{item.sku || 'No SKU'}</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className="text-[10px] font-black text-zinc-500 uppercase leading-none mb-1">Remaining</p>
                          <p className="text-sm font-bold text-zinc-400">{remaining}</p>
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            max={remaining}
                            value={shipQtys[item.id] || 0}
                            onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 0, remaining)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white font-bold text-right focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Shipment Date</label>
                  <input name="deliveryDate" type="date" required defaultValue={today} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Carrier (Optional)</label>
                  <input name="carrier" placeholder="e.g., G4S, DHL, Wells Fargo" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Tracking Number</label>
                <input name="trackingNumber" placeholder="Enter reference or AWB number" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 transition-all hover:text-white">Discard</button>
                <button type="submit" disabled={isLoading} className="flex-1 rounded-xl bg-blue-600 px-4 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm Shipment & Deduct Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
