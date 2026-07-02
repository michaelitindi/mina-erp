'use client'

import { useState } from 'react'
import { Bell, ArrowLeft, Save, FileText, Package, Clock, Users, CheckCircle2 } from 'lucide-react'
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
    setTimeout(() => setSuccess(''), 4000)
  }

  const toggleItems = [
    {
      id: 'emailInvoices',
      title: 'Email Customer Invoices',
      description: 'Automatically email PDF invoices to customers upon creation.',
      value: emailInvoices,
      onChange: () => setEmailInvoices(!emailInvoices),
      icon: FileText,
      color: 'text-blue-400 bg-blue-400/10',
    },
    {
      id: 'lowStockAlerts',
      title: 'Low Stock Warnings',
      description: 'Receive alert notifications when product stock level goes below threshold.',
      value: lowStockAlerts,
      onChange: () => setLowStockAlerts(!lowStockAlerts),
      icon: Package,
      color: 'text-amber-400 bg-amber-400/10',
    },
    {
      id: 'shiftApprovals',
      title: 'Shift Action Alerts',
      description: 'Send supervisor alerts when POS cashiers open or close checkout shifts.',
      value: shiftApprovals,
      onChange: () => setShiftApprovals(!shiftApprovals),
      icon: Clock,
      color: 'text-purple-400 bg-purple-400/10',
    },
    {
      id: 'leadsAssigned',
      title: 'CRM Lead Assignment',
      description: 'Email sales members instantly when new leads are assigned to them.',
      value: leadsAssigned,
      onChange: () => setLeadsAssigned(!leadsAssigned),
      icon: Users,
      color: 'text-emerald-400 bg-emerald-400/10',
    },
  ]

  return (
    <div className="p-4 md:p-6 max-w-xl space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="rounded-xl p-2 border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-500" />
            Notifications
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Configure email alerts and system warning preferences</p>
        </div>
      </div>

      {/* Success alert */}
      {success && (
        <div className="flex items-center gap-2.5 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold shadow-lg shadow-green-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Toggles Container */}
      <form onSubmit={handleSave} className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-5 backdrop-blur-sm shadow-xl">
        <div className="space-y-4">
          {toggleItems.map((item) => (
            <div
              key={item.id}
              onClick={item.onChange}
              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-zinc-700/80 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex gap-3">
                <div className={`p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-110 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white transition-colors group-hover:text-blue-400">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Slider Toggle */}
              <button
                type="button"
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 ${
                  item.value 
                    ? 'bg-blue-600 justify-end' 
                    : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800/80">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  )
}
