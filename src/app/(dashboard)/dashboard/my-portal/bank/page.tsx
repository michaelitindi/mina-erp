'use client'

import { useState, useEffect } from 'react'
import { getMyEmployee, updateBankDetails } from '@/app/actions/self-service'
import { Wallet, Save, Building } from 'lucide-react'

export default function BankDetailsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasBank, setHasBank] = useState(false)
  const [form, setForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    branchCode: '',
    accountType: 'CHECKING' as 'CHECKING' | 'SAVINGS',
  })
  
  useEffect(() => {
    getMyEmployee().then((emp) => {
      if (emp?.bankDetails) {
        setHasBank(true)
        setForm({
          bankName: emp.bankDetails.bankName,
          accountName: emp.bankDetails.accountName,
          accountNumber: emp.bankDetails.accountNumber,
          routingNumber: emp.bankDetails.routingNumber || '',
          swiftCode: emp.bankDetails.swiftCode || '',
          branchCode: emp.bankDetails.branchCode || '',
          accountType: emp.bankDetails.accountType as 'CHECKING' | 'SAVINGS',
        })
      }
      setLoading(false)
    })
  }, [])
  
  async function handleSave() {
    if (!form.bankName || !form.accountName || !form.accountNumber) {
      alert('Please fill in required fields')
      return
    }
    
    setSaving(true)
    try {
      await updateBankDetails(form)
      setHasBank(true)
      alert('Bank details saved successfully')
    } catch (error) {
      alert('Failed to save bank details')
    }
    setSaving(false)
  }
  
  if (loading) {
    return <div className="text-slate-400">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="h-6 w-6 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Bank Details</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      <p className="text-sm text-slate-400">
        Your bank details are used for salary payments. This information is kept secure and confidential.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Bank Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 pl-10 pr-3 py-2 text-white placeholder:text-slate-500"
              placeholder="e.g., Chase Bank"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Account Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.accountName}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500"
            placeholder="Name on the account"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Account Number <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500"
            placeholder="Your account number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Account Type</label>
          <select
            value={form.accountType}
            onChange={(e) => setForm({ ...form, accountType: e.target.value as 'CHECKING' | 'SAVINGS' })}
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
          >
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Routing Number</label>
          <input
            type="text"
            value={form.routingNumber}
            onChange={(e) => setForm({ ...form, routingNumber: e.target.value })}
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500"
            placeholder="For US banks"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">SWIFT Code</label>
          <input
            type="text"
            value={form.swiftCode}
            onChange={(e) => setForm({ ...form, swiftCode: e.target.value })}
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500"
            placeholder="For international transfers"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Branch Code</label>
          <input
            type="text"
            value={form.branchCode}
            onChange={(e) => setForm({ ...form, branchCode: e.target.value })}
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500"
            placeholder="Optional"
          />
        </div>
      </div>
    </div>
  )
}
