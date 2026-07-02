'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrganizationProfile } from '@/app/actions/settings'
import { Building2, Save, ArrowLeft, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function ProfileSettingsClient({ initialProfile }: { initialProfile: any }) {
  const [name, setName] = useState(initialProfile?.name || '')
  const [website, setWebsite] = useState(initialProfile?.website || '')
  const [industry, setIndustry] = useState(initialProfile?.industry || '')
  const [currency, setCurrency] = useState(initialProfile?.currency || 'USD')
  const [timezone, setTimezone] = useState(initialProfile?.timezone || 'UTC')

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateOrganizationProfile({
        name,
        website,
        industry,
        currency,
        timezone
      })
      setSuccess('Organization profile updated successfully!')
      router.refresh()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err?.message || 'Failed to update organization details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6 select-none">
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
            <Building2 className="h-6 w-6 text-blue-500" />
            Profile Settings
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Configure your company identity, website standards, and metrics settings</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-2.5 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold shadow-lg shadow-green-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold shadow-lg shadow-red-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-sm shadow-xl">
        <div className="space-y-1">
          <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-0.5">Company / Organization Name *</label>
          <div className="relative group">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-0.5">Website URL</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. https://mycompany.com"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-0.5">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Education, Tech, Logistics"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-0.5">Standard Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer"
            >
              <option value="USD">USD - United States Dollar ($)</option>
              <option value="KES">KES - Kenyan Shilling (KSh)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-0.5">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-5 border-t border-zinc-800/80">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 text-white" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
