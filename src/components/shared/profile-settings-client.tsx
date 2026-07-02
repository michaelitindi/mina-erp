'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrganizationProfile } from '@/app/actions/settings'
import { Building2, Save, ArrowLeft, Loader2 } from 'lucide-react'
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
    } catch (err: any) {
      setError(err?.message || 'Failed to update organization details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/settings"
          className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-zinc-400" />
            Profile Settings
          </h1>
          <p className="text-zinc-500 text-sm">Update your company name, website, and currency standards</p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Company / Organization Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Website URL</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. https://mycompany.com"
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Education, Tech, Logistics"
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Standard Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-2 text-xs text-white rounded focus:outline-none"
            >
              <option value="USD">USD - United States Dollar ($)</option>
              <option value="KES">KES - Kenyan Shilling (KSh)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-2 text-xs text-white rounded focus:outline-none"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-850">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
