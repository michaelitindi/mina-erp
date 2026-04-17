import { getPaymentProviders, getAvailableProviderTypes } from '@/app/actions/payment-providers'
import { PaymentsClient } from './payments-client'

export default async function PaymentsSettingsPage() {
  const [providers, availableTypes] = await Promise.all([
    getPaymentProviders(),
    getAvailableProviderTypes(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Providers</h1>
        <p className="text-zinc-500 font-medium">Configure payment methods for POS and E-commerce</p>
      </div>
      
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 shadow-sm backdrop-blur-sm">
        <PaymentsClient 
          providers={providers} 
          availableTypes={availableTypes} 
        />
      </div>
    </div>
  )
}
