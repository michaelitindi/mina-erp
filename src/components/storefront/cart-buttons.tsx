'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Check, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  price: number | { toNumber?: () => number }
  stockQuantity: number
  stockTracking?: boolean
}

const getPrice = (p: number | { toNumber?: () => number }): number => typeof p === 'number' ? p : p?.toNumber?.() || 0

// Simple localStorage cart
function getCart(): { productId: string; name: string; price: number; quantity: number; slug: string }[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]')
  } catch { return [] }
}

function saveCart(cart: { productId: string; name: string; price: number; quantity: number; slug: string }[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('cart', JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-updated'))
}

export function addToCart(product: Product) {
  const cart = getCart()
  const existing = cart.find(i => i.productId === product.id)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ 
      productId: product.id, 
      name: product.name, 
      price: getPrice(product.price), 
      quantity: 1,
      slug: product.slug
    })
  }
  saveCart(cart)
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter(i => i.productId !== productId)
  saveCart(cart)
}

export function updateCartQuantity(productId: string, quantity: number) {
  const cart = getCart()
  const item = cart.find(i => i.productId === productId)
  if (item) {
    if (quantity <= 0) {
      saveCart(cart.filter(i => i.productId !== productId))
    } else {
      item.quantity = quantity
      saveCart(cart)
    }
  }
}

export function clearCart() {
  saveCart([])
}

export function useCart() {
  const [cart, setCart] = useState<{ productId: string; name: string; price: number; quantity: number; slug: string }[]>([])
  
  useEffect(() => {
    setCart(getCart())
    const handleCartUpdate = () => {
      setCart(getCart())
    }
    window.addEventListener('cart-updated', handleCartUpdate)
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
    }
  }, [])

  return cart
}

export function CartIcon({ slug }: { slug: string }) {
  const cart = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const itemCount = mounted ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0

  return (
    <Link 
      href={`/store/${slug}/cart`} 
      className="relative text-slate-400 hover:text-white transition-colors flex items-center justify-center p-2 rounded-xl hover:bg-slate-800/40"
      aria-label="Shopping Cart"
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-lg border border-slate-900 transition-all duration-300">
          {itemCount}
        </span>
      )}
    </Link>
  )
}

export function AddToCartButton({ product, currency, size = 'small' }: { product: Product; currency: string; size?: 'small' | 'large' }) {
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)

  function handleAdd() {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const isOutOfStock = product.stockTracking !== false && product.stockQuantity <= 0

  if (size === 'large') {
    return (
      <div className="flex gap-3">
        <div className="flex items-center border border-zinc-700 rounded-xl">
          <button 
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))} 
            className="px-4 py-3 text-zinc-500 hover:text-white cursor-pointer"
          >
            -
          </button>
          <span className="px-4 py-3 text-white font-medium select-none">{quantity}</span>
          <button 
            type="button"
            onClick={() => setQuantity(product.stockTracking !== false ? Math.min(product.stockQuantity, quantity + 1) : quantity + 1)} 
            className="px-4 py-3 text-zinc-500 hover:text-white cursor-pointer"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={isOutOfStock || added}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
            added 
              ? 'bg-green-600 text-white' 
              : isOutOfStock 
                ? 'bg-zinc-800 text-zinc-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" /> Added to Cart
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" /> Add to Cart - {currency} {(getPrice(product.price) * quantity).toFixed(2)}
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock || added}
      className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
        added 
          ? 'bg-green-600/20 text-green-400' 
          : isOutOfStock 
            ? 'bg-zinc-800 text-zinc-600' 
            : 'bg-zinc-800 text-white hover:bg-zinc-700'
      }`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : isOutOfStock ? (
        'Out of Stock'
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </>
      )}
    </button>
  )
}
