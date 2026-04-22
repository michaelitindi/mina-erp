'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSalesOrder } from '@/app/actions/sales-orders'
import { Plus, X, Trash2, Building2 } from 'lucide-react'

interface Customer { id: string; companyName: string }
interface Warehouse { id: string; name: string; code: string }
interface LineItem { description: string; sku: string; quantity: number; unitPrice: number; taxRate: number; discountPercent: number; productId?: string }

export function CreateSalesOrderButton({ customers, warehouses }: { customers: Customer[], warehouses: Warehouse[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', sku: '', quantity: 1, unitPrice: 0, taxRate: 0, discountPercent: 0 }])
  const router = useRouter()

  const addLine = () => setLineItems([...lineItems, { description: '', sku: '', quantity: 1, unitPrice: 0, taxRate: 0, discountPercent: 0 }])
  const removeLine = (i: number) => lineItems.length > 1 && setLineItems(lineItems.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[i] = { ...updated[i], [field]: value }
    setLineItems(updated)
  }

  const subtotal = lineItems.reduce((sum, item) => {
    const base = item.quantity * item.unitPrice
    const discount = base * (item.discountPercent / 100)
    return sum + (base - discount)
  }, 0)
  const taxTotal = lineItems.reduce((sum, item) => {
    const base = item.quantity * item.unitPrice
    const discount = base * (item.discountPercent / 100)
    return sum + ((base - discount) * item.taxRate / 100)
  }, 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    try {
      await createSalesOrder({
        customerId: formData.get('customerId') as string,
        warehouseId: formData.get('warehouseId') as string || null,
        orderDate: new Date(formData.get('orderDate') as string),
        expectedDeliveryDate: formData.get('expectedDeliveryDate') ? new Date(formData.get('expectedDeliveryDate') as string) : null,
        lineItems,
        shippingAddress: formData.get('shippingAddress') as string || null,
        shippingCity: formData.get('shippingCity') as string || null,
        shippingCountry: formData.get('shippingCountry') as string || null,
        shippingAmount: parseFloat(formData.get('shippingAmount') as string) || 0,
        notes: formData.get('notes') as string || null,
      })
      setIsOpen(false)
      setLineItems([{ description: '', sku: '', quantity: 1, unitPrice: 0, taxRate: 0, discountPercent: 0 }])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <button onClick={() => setIsOpen(true)} disabled={customers.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
        <Plus className="h-4 w-4" />New Order
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Create Sales Order</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Direct Inventory Reservation</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Primary Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Customer *</label>
                  <select name="customerId" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all">
                    <option value="">Select customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Fulfillment Warehouse *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <select name="warehouseId" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all">
                      <option value="">Select location...</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Order Date</label>
                  <input name="orderDate" type="date" required defaultValue={today} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all" />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Order Items</h3>
                  <button type="button" onClick={addLine} className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full transition-all">+ Add Product</button>
                </div>
                <div className="space-y-3">
                  {lineItems.map((item, i) => (
                    <div key={i} className="group grid grid-cols-12 gap-3 items-center p-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all">
                      <div className="col-span-4">
                        <input placeholder="Product Description" value={item.description} onChange={e => updateLine(i, 'description', e.target.value)} className="w-full bg-transparent text-sm text-white font-bold placeholder:text-zinc-700 focus:outline-none" />
                      </div>
                      <div className="col-span-2">
                        <input placeholder="SKU" value={item.sku} onChange={e => updateLine(i, 'sku', e.target.value)} className="w-full bg-transparent text-[11px] text-zinc-500 font-mono placeholder:text-zinc-700 focus:outline-none uppercase" />
                      </div>
                      <div className="col-span-1 border-l border-zinc-800 pl-3">
                        <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-sm text-white font-bold focus:outline-none" />
                      </div>
                      <div className="col-span-2 border-l border-zinc-800 pl-3">
                        <input type="number" min="0" step="0.01" placeholder="Price" value={item.unitPrice} onChange={e => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-sm text-white font-bold focus:outline-none" />
                      </div>
                      <div className="col-span-1">
                        <input type="number" min="0" max="100" placeholder="Tax%" value={item.taxRate} onChange={e => updateLine(i, 'taxRate', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-[11px] text-zinc-500 focus:outline-none" />
                      </div>
                      <div className="col-span-1">
                        <input type="number" min="0" max="100" placeholder="Disc%" value={item.discountPercent} onChange={e => updateLine(i, 'discountPercent', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-[11px] text-zinc-500 focus:outline-none" />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button type="button" onClick={() => removeLine(i)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-800 pt-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Shipping Destination</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <input name="shippingAddress" placeholder="Full Street Address" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all" />
                    </div>
                    <input name="shippingCity" placeholder="City" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all" />
                    <input name="shippingCountry" placeholder="Country" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-4">
                  <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                    <span>Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                    <span>Tax Total</span>
                    <span className="text-white">${taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase border-t border-zinc-800 pt-4">
                    <span>Shipping Cost</span>
                    <input name="shippingAmount" type="number" min="0" step="0.01" defaultValue="0" className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-right text-sm text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                    <span className="text-sm font-black text-white uppercase tracking-tight">Grand Total</span>
                    <span className="text-2xl font-black text-green-400">${(subtotal + taxTotal).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 transition-all hover:text-white">Discard</button>
                <button type="submit" disabled={isLoading} className="flex-1 rounded-xl bg-blue-600 px-4 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50">{isLoading ? 'Processing Order...' : 'Create Sales Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
