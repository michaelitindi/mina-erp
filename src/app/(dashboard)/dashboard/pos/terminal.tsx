'use client'

import { useState, useTransition } from 'react'
import { 
  Search, Plus, Minus, Trash2, CreditCard, Banknote, 
  X, CheckCircle, ShoppingCart, Clock
} from 'lucide-react'
import { createSale, openSession } from '@/app/actions/pos'

interface Product {
  id: string
  sku: string
  name: string
  sellingPrice: any
  taxRate: any
  imageUrl: string | null
  barcode: string | null
}

interface CartItem extends Product {
  quantity: number
}

interface Terminal {
  id: string
  name: string
  location: string | null
}

interface Session {
  id: string
  terminalId: string
  cashierName: string
  terminal: Terminal
}

interface POSTerminalProps {
  session: Session | null
  terminals: Terminal[]
  products: Product[]
}

export function POSTerminal({ session, terminals, products }: POSTerminalProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [showOpenShift, setShowOpenShift] = useState(!session)
  const [selectedTerminal, setSelectedTerminal] = useState('')
  const [openingCash, setOpeningCash] = useState('')
  const [isPending, startTransition] = useTransition()
  const [saleComplete, setSaleComplete] = useState(false)

  // Filter products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(search.toLowerCase())
  )

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const clearCart = () => setCart([])

  // Calculations
  const subtotal = cart.reduce((sum, item) => 
    sum + item.quantity * Number(item.sellingPrice), 0
  )
  const tax = cart.reduce((sum, item) => 
    sum + item.quantity * Number(item.sellingPrice) * Number(item.taxRate) / 100, 0
  )
  const total = subtotal + tax

  // Open shift
  const handleOpenShift = async () => {
    if (!selectedTerminal || !openingCash) return
    startTransition(async () => {
      try {
        await openSession({ 
          terminalId: selectedTerminal, 
          openingCash: parseFloat(openingCash) 
        })
        setShowOpenShift(false)
        window.location.reload()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  // Process sale
  const processSale = async (paymentMethod: string, amountPaid: number) => {
    if (!session || cart.length === 0) return
    
    startTransition(async () => {
      try {
        await createSale({
          sessionId: session.id,
          items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            productSku: item.sku,
            quantity: item.quantity,
            unitPrice: Number(item.sellingPrice),
          })),
          payments: [{
            providerType: paymentMethod === 'cash' ? 'CASH' : 'CARD',
            method: paymentMethod,
            amount: total,
            changeGiven: paymentMethod === 'cash' ? amountPaid - total : undefined,
          }],
          taxAmount: tax,
        })
        
        clearCart()
        setShowPayment(false)
        setSaleComplete(true)
        setTimeout(() => setSaleComplete(false), 2000)
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  // Open shift modal
  if (showOpenShift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Open Shift</h2>
              <p className="text-slate-400 text-sm">Start your POS session</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Terminal
              </label>
              <select
                value={selectedTerminal}
                onChange={(e) => setSelectedTerminal(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose terminal...</option>
                {terminals.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.location ? `(${t.location})` : ''}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Opening Cash Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                <input
                  type="number"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={handleOpenShift}
              disabled={!selectedTerminal || !openingCash || isPending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Opening...' : 'Open Shift'}
            </button>
          </div>
          
          {terminals.length === 0 && (
            <p className="mt-4 text-amber-400 text-sm text-center">
              No terminals configured. Ask admin to create terminals first.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Products Grid */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4 relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or scan barcode..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left hover:border-blue-500 hover:bg-slate-750 transition-all group"
            >
              <div className="aspect-square bg-slate-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                  <ShoppingCart className="h-8 w-8 text-slate-500" />
                )}
              </div>
              <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                {product.name}
              </h3>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                ${Number(product.sellingPrice).toFixed(2)}
              </p>
            </button>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              {search ? 'No products found' : 'No products available'}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="w-96 flex flex-col bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white">Current Sale</h2>
            <p className="text-xs text-slate-400">{session?.terminal.name}</p>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-slate-400 hover:text-red-400 text-sm">
              Clear
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-sm">Add products to begin</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white text-sm line-clamp-1 flex-1">{item.name}</h4>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-400 ml-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 bg-slate-600 rounded hover:bg-slate-500"
                    >
                      <Minus className="h-4 w-4 text-white" />
                    </button>
                    <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 bg-slate-600 rounded hover:bg-slate-500"
                    >
                      <Plus className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <span className="font-bold text-white">
                    ${(item.quantity * Number(item.sellingPrice)).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="border-t border-slate-700 p-4 space-y-3">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-slate-600">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0 || isPending}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="h-5 w-5" />
            Charge ${total.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={total}
          onClose={() => setShowPayment(false)}
          onPay={processSale}
          isPending={isPending}
        />
      )}

      {/* Success Toast */}
      {saleComplete && (
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom">
          <CheckCircle className="h-6 w-6" />
          <span className="font-medium">Sale completed!</span>
        </div>
      )}
    </div>
  )
}

function PaymentModal({ 
  total, 
  onClose, 
  onPay, 
  isPending 
}: { 
  total: number
  onClose: () => void
  onPay: (method: string, amount: number) => void
  isPending: boolean
}) {
  const [method, setMethod] = useState<'cash' | 'card'>('cash')
  const [cashReceived, setCashReceived] = useState('')
  
  const change = parseFloat(cashReceived || '0') - total
  const canPay = method === 'card' || parseFloat(cashReceived) >= total

  const quickCash = [10, 20, 50, 100]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Payment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-slate-400">Total Amount</p>
          <p className="text-4xl font-bold text-white">${total.toFixed(2)}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setMethod('cash')}
            className={`py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              method === 'cash' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Banknote className="h-5 w-5" />
            Cash
          </button>
          <button
            onClick={() => setMethod('card')}
            className={`py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              method === 'card' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            Card
          </button>
        </div>
        
        {method === 'cash' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cash Received
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {quickCash.map(amount => (
                <button
                  key={amount}
                  onClick={() => setCashReceived(String(amount))}
                  className="py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                >
                  ${amount}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between py-2 text-lg">
              <span className="text-slate-400">Exact</span>
              <button 
                onClick={() => setCashReceived(total.toFixed(2))}
                className="text-emerald-400 font-medium hover:underline"
              >
                ${total.toFixed(2)}
              </button>
            </div>
            
            {parseFloat(cashReceived) >= total && (
              <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-lg p-4 text-center">
                <p className="text-slate-300">Change Due</p>
                <p className="text-3xl font-bold text-emerald-400">${change.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}
        
        {method === 'card' && (
          <div className="bg-slate-700/50 rounded-lg p-6 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-blue-400 mb-3" />
            <p className="text-slate-300">Ready for card payment</p>
            <p className="text-sm text-slate-400 mt-1">Use your card terminal</p>
          </div>
        )}
        
        <button
          onClick={() => onPay(method, parseFloat(cashReceived || '0'))}
          disabled={!canPay || isPending}
          className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Processing...' : `Complete ${method === 'cash' ? 'Cash' : 'Card'} Payment`}
        </button>
      </div>
    </div>
  )
}
