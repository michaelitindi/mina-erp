'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleStoreStatus, updateStore, deleteStore } from '@/app/actions/ecommerce'
import { Power, Package, ShoppingBag, Edit, Trash2, ExternalLink, X, Eye, EyeOff } from 'lucide-react'

interface Store {
  id: string
  name: string
  slug: string
  description: string | null
  primaryColor: string
  isActive: boolean
  currency: string
  createdAt: Date
  paymentProvider?: string
  stripePublicKey?: string | null
  stripeSecretKey?: string | null
  paystackPublicKey?: string | null
  paystackSecretKey?: string | null
  flutterwavePublicKey?: string | null
  flutterwaveSecretKey?: string | null
  lemonSqueezyApiKey?: string | null
  lemonSqueezyStoreId?: string | null
  announcementText?: string | null
  announcementActive?: boolean
  heroImage?: string | null
  _count?: { products: number; orders: number }
}

type PaymentProvider = 'COD' | 'STRIPE' | 'PAYSTACK' | 'FLUTTERWAVE' | 'LEMONSQUEEZY'

const providerInfo: Record<PaymentProvider, { name: string; description: string; regions: string }> = {
  COD: { name: 'Cash on Delivery', description: 'Customers pay on delivery', regions: 'All regions' },
  STRIPE: { name: 'Stripe', description: 'Credit/Debit cards, Apple Pay, Google Pay', regions: 'US, EU, UK, AU, etc.' },
  PAYSTACK: { name: 'Paystack', description: 'Cards, bank, mobile money', regions: 'Nigeria, Ghana, South Africa, Kenya' },
  FLUTTERWAVE: { name: 'Flutterwave', description: 'Cards, mobile money, bank transfer', regions: 'Africa, UK, EU' },
  LEMONSQUEEZY: { name: 'Lemon Squeezy', description: 'Digital products, subscriptions', regions: 'Global' },
}

export function StoresTable({ stores }: { stores: Store[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [deletingStore, setDeletingStore] = useState<Store | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('COD')
  const [showSecrets, setShowSecrets] = useState(false)
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const router = useRouter()

  async function handleToggle(id: string) {
    setProcessingId(id)
    try { 
      await toggleStoreStatus(id)
      router.refresh() 
    } catch (err) { 
      alert(err instanceof Error ? err.message : 'Failed to toggle status') 
    } finally { 
      setProcessingId(null) 
    }
  }

  function startEdit(store: Store) {
    setEditingStore(store)
    setSelectedProvider((store.paymentProvider as PaymentProvider) || 'COD')
    setHeroImage(store.heroImage || null)
    setError('')
    setShowSecrets(false)
  }

  function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'stores')
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        setHeroImage(data.url)
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (err) {
      alert('Error uploading file')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingStore) return
    
    setSaving(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    try {
      await updateStore(editingStore.id, {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        description: formData.get('description') as string || null,
        primaryColor: formData.get('primaryColor') as string || '#3B82F6',
        currency: formData.get('currency') as string || 'USD',
        paymentProvider: selectedProvider,
        stripePublicKey: formData.get('stripePublicKey') as string || null,
        stripeSecretKey: formData.get('stripeSecretKey') as string || null,
        paystackPublicKey: formData.get('paystackPublicKey') as string || null,
        paystackSecretKey: formData.get('paystackSecretKey') as string || null,
        flutterwavePublicKey: formData.get('flutterwavePublicKey') as string || null,
        flutterwaveSecretKey: formData.get('flutterwaveSecretKey') as string || null,
        lemonSqueezyApiKey: formData.get('lemonSqueezyApiKey') as string || null,
        lemonSqueezyStoreId: formData.get('lemonSqueezyStoreId') as string || null,
        announcementText: formData.get('announcementText') as string || null,
        announcementActive: formData.get('announcementActive') === 'true',
        heroImage,
      })
      setEditingStore(null)
      setHeroImage(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update store')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingStore) return
    setDeleting(true)
    setError('')
    try {
      await deleteStore(deletingStore.id)
      setDeletingStore(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete store')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="border-b border-zinc-800 p-4">
        <h2 className="text-lg font-semibold text-white">Online Stores</h2>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <div key={store.id} className="rounded-xl border border-zinc-800 bg-zinc-850/30 p-5 shadow-sm hover:border-zinc-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    {store.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{store.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">/{store.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(store.id)}
                    disabled={processingId === store.id}
                    className={`rounded-lg p-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                      store.isActive 
                        ? 'text-green-400 hover:bg-green-600/20' 
                        : 'text-zinc-500 hover:bg-zinc-700/30'
                    }`}
                    title={store.isActive ? 'Deactivate Store' : 'Activate Store'}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {store.description && (
                <p className="text-xs text-zinc-400 mb-4 line-clamp-2 leading-relaxed">{store.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {store._count?.products || 0} products
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {store._count?.orders || 0} orders
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">{store.currency}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  store.isActive ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-500/10'
                }`}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <a 
                  href={`/store/${store.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-600/15 transition-colors cursor-pointer"
                  title="Preview Store"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => startEdit(store)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                  title="Edit Store Config"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeletingStore(store)}
                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-600/15 transition-colors cursor-pointer"
                  title="Delete Store"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Store Modal */}
      {editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-500" />
                Edit Store Configuration
              </h2>
              <button 
                onClick={() => setEditingStore(null)} 
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Store Name *</label>
                  <input 
                    name="name" 
                    required 
                    defaultValue={editingStore.name}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    onChange={(e) => {
                      const slugInput = e.target.form?.elements.namedItem('slug') as HTMLInputElement
                      if (slugInput) slugInput.value = generateSlug(e.target.value)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">URL Slug *</label>
                  <input 
                    name="slug" 
                    required 
                    defaultValue={editingStore.slug}
                    pattern="[a-z0-9-]+" 
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Primary Color</label>
                  <input 
                    name="primaryColor" 
                    type="color"
                    defaultValue={editingStore.primaryColor}
                    className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-1 py-1 cursor-pointer focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Currency</label>
                  <select 
                    name="currency" 
                    defaultValue={editingStore.currency}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="KES">KES (KSh)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  name="description" 
                  defaultValue={editingStore.description || ''}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                />
              </div>

              {/* Announcements Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Announcement Text</label>
                  <input 
                    name="announcementText" 
                    defaultValue={editingStore.announcementText || ''}
                    placeholder="e.g. Free shipping on orders over $50!" 
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      name="announcementActive" 
                      type="checkbox" 
                      value="true" 
                      defaultChecked={editingStore.announcementActive}
                      className="rounded border-zinc-800 bg-zinc-950 text-blue-500 focus:ring-blue-500" 
                    />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Show Announcement</span>
                  </label>
                </div>
              </div>

              {/* Hero Banner Upload Section */}
              <div className="border-t border-zinc-800 pt-4">
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Storefront Hero Banner Image</label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="flex h-24 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-950 hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="text-xs text-zinc-400 font-semibold">
                        {isUploading ? 'Uploading...' : 'Click to change hero banner'}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-1">PNG, JPG, WEBP (optimized with Sharp to WebP)</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} disabled={isUploading} />
                  </label>
                </div>
                {heroImage && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-zinc-800 h-32 w-full">
                    <img src={heroImage} alt="Hero Banner Preview" className="object-cover w-full h-full" />
                    <button type="button" onClick={() => setHeroImage(null)} className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Settings */}
              <div className="border-t border-zinc-800 pt-4 mt-6">
                <h3 className="text-sm font-bold text-white mb-3">Payment Gateway Integration</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                  {(Object.keys(providerInfo) as PaymentProvider[]).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setSelectedProvider(prov)}
                      className={`px-3 py-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                        selectedProvider === prov
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 mb-4">
                  <p className="text-xs font-bold text-white mb-1">{providerInfo[selectedProvider].name}</p>
                  <p className="text-xs text-zinc-500 mb-2">{providerInfo[selectedProvider].description}</p>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Regions: {providerInfo[selectedProvider].regions}
                  </span>
                </div>

                {selectedProvider === 'STRIPE' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-1">Stripe Publishable Key</label>
                      <input 
                        name="stripePublicKey" 
                        defaultValue={editingStore.stripePublicKey || ''}
                        placeholder="pk_live_..." 
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Stripe Secret Key</span>
                        <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer">
                          {showSecrets ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showSecrets ? 'Hide' : 'Reveal'}
                        </button>
                      </label>
                      <input 
                        name="stripeSecretKey" 
                        type={showSecrets ? 'text' : 'password'} 
                        defaultValue={editingStore.stripeSecretKey || ''}
                        placeholder="sk_live_..." 
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-mono" 
                      />
                    </div>
                  </div>
                )}

                {selectedProvider === 'PAYSTACK' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-1">Paystack Public Key</label>
                      <input 
                        name="paystackPublicKey" 
                        defaultValue={editingStore.paystackPublicKey || ''}
                        placeholder="pk_live_..." 
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Paystack Secret Key</span>
                        <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer">
                          {showSecrets ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showSecrets ? 'Hide' : 'Reveal'}
                        </button>
                      </label>
                      <input 
                        name="paystackSecretKey" 
                        type={showSecrets ? 'text' : 'password'} 
                        defaultValue={editingStore.paystackSecretKey || ''}
                        placeholder="sk_live_..." 
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-mono" 
                      />
                    </div>
                  </div>
                )}

                {selectedProvider === 'FLUTTERWAVE' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-1">Flutterwave Public Key</label>
                      <input 
                        name="flutterwavePublicKey" 
                        defaultValue={editingStore.flutterwavePublicKey || ''}
                        placeholder="FLWPUBK-..." 
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Flutterwave Secret Key</span>
                        <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer">
                          {showSecrets ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showSecrets ? 'Hide' : 'Reveal'}
                        </button>
                      </label>
                      <input 
                        name="flutterwaveSecretKey" 
                        type={showSecrets ? 'text' : 'password'} 
                        defaultValue={editingStore.flutterwaveSecretKey || ''}
                        placeholder="FLWSECK-..." 
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-mono" 
                      />
                    </div>
                  </div>
                )}

                {selectedProvider === 'LEMONSQUEEZY' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-1">Lemon Squeezy API Key</label>
                      <input 
                        name="lemonSqueezyApiKey" 
                        type={showSecrets ? 'text' : 'password'} 
                        defaultValue={editingStore.lemonSqueezyApiKey || ''}
                        placeholder="ApiKey..." 
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-1">Lemon Squeezy Store ID</label>
                      <input 
                        name="lemonSqueezyStoreId" 
                        defaultValue={editingStore.lemonSqueezyStoreId || ''}
                        placeholder="12345" 
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditingStore(null)} 
                  className="rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Store
            </h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{deletingStore.name}</strong>? This action will permanently remove the store and all associated products, categories, and orders. This action cannot be undone.
            </p>

            {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}

            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setDeletingStore(null)} 
                disabled={deleting}
                className="rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
