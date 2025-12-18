'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSalesOrder } from '@/app/actions/sales-orders'
import { Plus, X, Trash2 } from 'lucide-react'

interface Customer { id: string; companyName: string }
interface LineItem { description: string; sku: string; quantity: number; unitPrice: number; taxRate: number; discountPercent: number }

export function CreateSalesOrderButton({ customers }: { customers: Customer[] }) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Create Sales Order</h2>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Customer *</label>
                  <select name="customerId" required className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="">Select...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Order Date *</label>
                  <input name="orderDate" type="date" required defaultValue={today} className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Expected Delivery</label>
                  <input name="expectedDeliveryDate" type="date" className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">Line Items</label>
                  <button type="button" onClick={addLine} className="text-xs text-blue-400 hover:text-blue-300">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input placeholder="Description" value={item.description} onChange={e => updateLine(i, 'description', e.target.value)} className="col-span-4 rounded-lg border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none" />
                      <input placeholder="SKU" value={item.sku} onChange={e => updateLine(i, 'sku', e.target.value)} className="col-span-2 rounded-lg border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none" />
                      <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-1 rounded-lg border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none" />
                      <input type="number" min="0" step="0.01" placeholder="Price" value={item.unitPrice} onChange={e => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="col-span-2 rounded-lg border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none" />
                      <input type="number" min="0" max="100" placeholder="Tax%" value={item.taxRate} onChange={e => updateLine(i, 'taxRate', parseFloat(e.target.value) || 0)} className="col-span-1 rounded-lg border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none" />
                      <input type="number" min="0" max="100" placeholder="Disc%" value={item.discountPercent} onChange={e => updateLine(i, 'discountPercent', parseFloat(e.target.value) || 0)} className="col-span-1 rounded-lg border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none" />
                      <button type="button" onClick={() => removeLine(i)} className="col-span-1 p-1.5 text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-300 mb-1">Shipping Address</label><input name="shippingAddress" className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1">City</label><input name="shippingCity" className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1">Country</label><input name="shippingCountry" className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" /></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-300 mb-1">Shipping Amount</label><input name="shippingAmount" type="number" min="0" step="0.01" defaultValue="0" className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-slate-300 mb-1">Notes</label><input name="notes" className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" /></div>
              </div>

              <div className="flex justify-end gap-4 text-sm text-slate-300 bg-slate-700/50 p-3 rounded-lg">
                <span>Subtotal: <strong className="text-white">${subtotal.toFixed(2)}</strong></span>
                <span>Tax: <strong className="text-white">${taxTotal.toFixed(2)}</strong></span>
                <span>Total: <strong className="text-green-400 text-lg">${(subtotal + taxTotal).toFixed(2)}</strong></span>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50">{isLoading ? 'Creating...' : 'Create Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
