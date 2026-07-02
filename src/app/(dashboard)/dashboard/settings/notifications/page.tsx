'use client'

import { useState } from 'react'
import { Bell, ArrowLeft, Save, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function SettingsNotificationsPage() {
  const [emailInvoices, setEmailInvoices] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState(true)
  const [shiftApprovals, setShiftApprovals] = useState(false)
  const [leadsAssigned, setLeadsAssigned] = useState(true)
  
  const [success, setSuccess] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('Notification preferences saved successfully!')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="p-4 md:p-6 max-w-xl space-y-6 select-none">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/settings"
          className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-zinc-400" />
            Notifications
          </h1>
          <p className="text-zinc-500 text-sm">Configure email alerts and system warning messages</p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold animate-fade-in">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Email Customer Invoices</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Automatically email PDF invoices to customers upon creation.</p>
          </div>
          <button
            type="button"
            onClick={() => setEmailInvoices(!emailInvoices)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
              emailInvoices ? 'bg-blue-650 justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Low Stock Warnings</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Receive alert notifications when product stock level goes below threshold.</p>
          </div>
          <button
            type="button"
            onClick={() => setLowStockAlerts(!lowStockAlerts)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
              lowStockAlerts ? 'bg-blue-650 justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Shift Action Alerts</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Send supervisor alerts when POS cashiers open or close checkout shifts.</p>
          </div>
          <button
            type="button"
            onClick={() => setShiftApprovals(!shiftApprovals)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
              shiftApprovals ? 'bg-blue-650 justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
          </button>
        </div>

        <div className="flex items-center justify-between pb-2">
          <div>
            <h3 className="text-sm font-bold text-white">CRM Lead Assignment</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Email sales members instantly when new leads are assigned to them.</p>
          </div>
          <button
            type="button"
            onClick={() => setLeadsAssigned(!leadsAssigned)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
              leadsAssigned ? 'bg-blue-650 justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-855">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Save className="h-3.5 w-3.5" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  )
}
