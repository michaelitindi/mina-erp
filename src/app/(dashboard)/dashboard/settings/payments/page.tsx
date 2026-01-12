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
        <p className="text-slate-400">Configure payment methods for POS and E-commerce</p>
      </div>
      
      <PaymentsClient 
        providers={providers} 
        availableTypes={availableTypes} 
      />
    </div>
  )
}
