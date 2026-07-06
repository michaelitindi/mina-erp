'use client'

import { useState, useTransition } from 'react'
import { 
  CreditCard, Plus, Trash2, Settings, 
  CheckCircle, XCircle, ToggleLeft, ToggleRight,
  ShoppingCart, Globe, X, Sparkles
} from 'lucide-react'
import { 
  createPaymentProvider, 
  deletePaymentProvider, 
  togglePaymentProvider,
  updatePaymentProvider 
} from '@/app/actions/payment-providers'

interface Provider {
  id: string
  providerType: string
  displayName: string
  isActive: boolean
  forPOS: boolean
  forEcommerce: boolean
  config: any
}

interface AvailableType {
  type: string
  name: string
  description: string
  forPOS: boolean
  forEcommerce: boolean
}

interface PaymentsClientProps {
  providers: Provider[]
  availableTypes: AvailableType[]
}

const PROVIDER_ICONS: Record<string, string> = {
  STRIPE: '💳',
  PAYSTACK: '🇳🇬',
  PAYPAL: '🅿️',
  LEMONSQUEEZY: '🍋',
  RAZORPAY: '💰',
  GPAY: '🔵',
  MPESA: '📱',
  FLUTTERWAVE: '🦋',
  INTASEND: '🏦',
  CASH: '💵',
}

const PROVIDER_CONFIG_FIELDS: Record<string, { label: string, key: string, type: string }[]> = {
  STRIPE: [
    { label: 'Secret Key', key: 'secretKey', type: 'password' },
    { label: 'Webhook Secret', key: 'webhookSecret', type: 'password' },
  ],
  PAYSTACK: [
    { label: 'Public Key', key: 'publicKey', type: 'text' },
    { label: 'Secret Key', key: 'secretKey', type: 'password' },
  ],
  PAYPAL: [
    { label: 'Client ID', key: 'clientId', type: 'text' },
    { label: 'Client Secret', key: 'clientSecret', type: 'password' },
  ],
  LEMONSQUEEZY: [
    { label: 'API Key', key: 'apiKey', type: 'password' },
    { label: 'Store ID', key: 'storeId', type: 'text' },
  ],
  RAZORPAY: [
    { label: 'Key ID', key: 'keyId', type: 'text' },
    { label: 'Key Secret', key: 'keySecret', type: 'password' },
  ],
  MPESA: [
    { label: 'Consumer Key', key: 'consumerKey', type: 'text' },
    { label: 'Consumer Secret', key: 'consumerSecret', type: 'password' },
    { label: 'Shortcode', key: 'shortcode', type: 'text' },
    { label: 'Passkey', key: 'passkey', type: 'password' },
    { label: 'Sandbox Mode (true/false)', key: 'isSandbox', type: 'text' },
  ],
  FLUTTERWAVE: [
    { label: 'Public Key', key: 'publicKey', type: 'text' },
    { label: 'Secret Key', key: 'secretKey', type: 'password' },
  ],
  INTASEND: [
    { label: 'API Key', key: 'apiKey', type: 'password' },
    { label: 'Publishable Key', key: 'publishableKey', type: 'text' },
  ],
  GPAY: [],
  CASH: [],
}

const COUNTRIES = [
  { code: 'ALL', name: '🌍 All Countries / Global' },
  { code: 'US', name: '🇺🇸 United States' },
  { code: 'KE', name: '🇰🇪 Kenya' },
  { code: 'NG', name: '🇳🇬 Nigeria' },
  { code: 'ZA', name: '🇿🇦 South Africa' },
  { code: 'GH', name: '🇬🇭 Ghana' },
  { code: 'IN', name: '🇮🇳 India' },
  { code: 'GB', name: '🇬🇧 United Kingdom' },
  { code: 'CA', name: '🇨🇦 Canada' },
  { code: 'EU', name: '🇪🇺 Europe (General)' },
  { code: 'AE', name: '🇦🇪 United Arab Emirates' },
  { code: 'OTHER', name: '🌐 Other Region (Global)' },
]

const COUNTRY_PAYMENT_MAP: Record<string, string[]> = {
  ALL: ['STRIPE', 'PAYSTACK', 'PAYPAL', 'LEMONSQUEEZY', 'RAZORPAY', 'GPAY', 'MPESA', 'FLUTTERWAVE', 'INTASEND', 'CASH'],
  US: ['STRIPE', 'PAYPAL', 'GPAY', 'LEMONSQUEEZY', 'CASH'],
  KE: ['MPESA', 'INTASEND', 'FLUTTERWAVE', 'CASH'],
  NG: ['PAYSTACK', 'FLUTTERWAVE', 'CASH'],
  ZA: ['PAYSTACK', 'FLUTTERWAVE', 'CASH'],
  GH: ['PAYSTACK', 'FLUTTERWAVE', 'CASH'],
  IN: ['RAZORPAY', 'GPAY', 'PAYPAL', 'CASH'],
  GB: ['STRIPE', 'PAYPAL', 'GPAY', 'CASH'],
  CA: ['STRIPE', 'PAYPAL', 'GPAY', 'CASH'],
  EU: ['STRIPE', 'PAYPAL', 'LEMONSQUEEZY', 'GPAY', 'CASH'],
  AE: ['STRIPE', 'PAYPAL', 'GPAY', 'CASH'],
  OTHER: ['STRIPE', 'PAYPAL', 'FLUTTERWAVE', 'CASH'],
}

export function PaymentsClient({ providers, availableTypes }: PaymentsClientProps) {
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<Provider | null>(null)
  const [selectedType, setSelectedType] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [forPOS, setForPOS] = useState(true)
  const [forEcommerce, setForEcommerce] = useState(true)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    if (!selectedType || !displayName) return
    startTransition(async () => {
      try {
        await createPaymentProvider({
          providerType: selectedType,
          displayName,
          forPOS,
          forEcommerce,
          config: Object.keys(config).length > 0 ? config : undefined,
        })
        setShowAdd(false)
        resetForm()
        window.location.reload()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this payment provider?')) return
    startTransition(async () => {
      try {
        await deletePaymentProvider(id)
        window.location.reload()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  const handleToggle = (id: string) => {
    startTransition(async () => {
      try {
        await togglePaymentProvider(id)
        window.location.reload()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  const resetForm = () => {
    setSelectedType('')
    setDisplayName('')
    setForPOS(true)
    setForEcommerce(true)
    setConfig({})
  }

  const allowedProviderTypes = COUNTRY_PAYMENT_MAP[selectedCountry] || COUNTRY_PAYMENT_MAP.ALL
  const filteredAvailableTypes = availableTypes.filter(type => allowedProviderTypes.includes(type.type))
  const selectedTypeInfo = availableTypes.find(t => t.type === selectedType)
  const configFields = PROVIDER_CONFIG_FIELDS[selectedType] || []

  return (
    <div className="space-y-6">
      {/* Country Filter Selector */}
      <div className="bg-slate-900/30 border border-slate-700/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-blue-400" />
            Filter by Country / Region
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Select a country to view recommended payment gateways and configure local methods.</p>
        </div>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg text-sm text-white px-4 py-2.5 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Configured Providers */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Configured Providers</h2>
          {filteredAvailableTypes.length > 0 && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
            >
              <Plus className="h-4 w-4" />
              Add Provider
            </button>
          )}
        </div>
        
        {providers.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No payment providers configured</p>
            <p className="text-sm mt-1">Add your first provider to accept payments</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {providers.map(provider => (
              <div key={provider.id} className="px-6 py-4 flex items-center gap-4">
                <div className="text-2xl">{PROVIDER_ICONS[provider.providerType] || '💳'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{provider.displayName}</h3>
                    <span className="text-xs text-slate-500">{provider.providerType}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    {provider.forPOS && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShoppingCart className="h-3 w-3" /> POS
                      </span>
                    )}
                    {provider.forEcommerce && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <Globe className="h-3 w-3" /> E-commerce
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleToggle(provider.id)}
                  disabled={isPending}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {provider.isActive ? (
                    <ToggleRight className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-slate-500" />
                  )}
                </button>
                
                <button
                  onClick={() => handleDelete(provider.id)}
                  disabled={isPending}
                  className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Providers Info */}
      {filteredAvailableTypes.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="font-medium text-white mb-3 flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            Recommended Gateways for {COUNTRIES.find(c => c.code === selectedCountry)?.name.split(' ').slice(1).join(' ') || 'this Region'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {filteredAvailableTypes.map(type => (
              <span 
                key={type.type}
                className="px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-slate-300"
              >
                {PROVIDER_ICONS[type.type] || '💳'} {type.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Payment Provider</h2>
              <button onClick={() => { setShowAdd(false); resetForm() }} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Provider Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value)
                    const info = filteredAvailableTypes.find(t => t.type === e.target.value)
                    if (info) {
                      setDisplayName(info.name)
                      setForPOS(info.forPOS)
                      setForEcommerce(info.forEcommerce)
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Select provider...</option>
                  {filteredAvailableTypes.map(type => (
                    <option key={type.type} value={type.type}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedType && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g., Pay with Card"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forPOS}
                        onChange={(e) => setForPOS(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 cursor-pointer"
                      />
                      <span className="text-sm text-slate-300">Enable for POS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forEcommerce}
                        onChange={(e) => setForEcommerce(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 cursor-pointer"
                      />
                      <span className="text-sm text-slate-300">Enable for E-commerce</span>
                    </label>
                  </div>
                  
                  {configFields.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-700">
                      <p className="text-sm font-medium text-slate-400">API Configuration</p>
                      {configFields.map(field => (
                        <div key={field.key}>
                          <label className="block text-sm text-slate-300 mb-1">{field.label}</label>
                          <input
                            type={field.type}
                            value={config[field.key] || ''}
                            onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {configFields.length === 0 && selectedType !== 'CASH' && (
                    <p className="text-sm text-amber-400">
                      ⚠️ Configuration for {selectedTypeInfo?.name} coming soon
                    </p>
                  )}
                </>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowAdd(false); resetForm() }}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!selectedType || !displayName || isPending}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {isPending ? 'Adding...' : 'Add Provider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
