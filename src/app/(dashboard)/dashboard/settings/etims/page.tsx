'use client'

import { useState, useEffect } from 'react'
import { updateEtimsSettings, getOrganizationSettings } from '@/app/actions/settings'
import { Shield, Save, AlertCircle, CheckCircle2, Zap } from 'lucide-react'

export default function EtimsSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [form, setForm] = useState({
    pinNumber: '',
    etimsDeviceId: '',
    etimsSerialNumber: '',
    etimsSecurityKey: '',
    etimsMode: 'SIMULATION' as 'SIMULATION' | 'SANDBOX' | 'PRODUCTION'
  })

  useEffect(() => {
    async function load() {
      try {
        const settings = await getOrganizationSettings()
        if (settings) {
          setForm({
            pinNumber: settings.pinNumber || '',
            etimsDeviceId: settings.etimsDeviceId || '',
            etimsSerialNumber: settings.etimsSerialNumber || '',
            etimsSecurityKey: settings.etimsSecurityKey || '',
            etimsMode: (settings.etimsMode as any) || 'SIMULATION'
          })
        }
      } catch (err) {
        setError('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')

    try {
      await updateEtimsSettings(form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-zinc-500">Loading KRA Configuration...</div>

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Kenya Compliance (eTIMS)</h1>
        <p className="text-zinc-500">Configure your direct connection to the KRA Tax Invoice Management System</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-800">
              <Shield className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">KRA Device Credentials</h2>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">My KRA PIN *</label>
                  <input
                    required
                    value={form.pinNumber}
                    onChange={e => setForm({ ...form, pinNumber: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="P0XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Integration Mode</label>
                  <select
                    value={form.etimsMode}
                    onChange={e => setForm({ ...form, etimsMode: e.target.value as any })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-white font-bold focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="SIMULATION">Simulation (Offline)</option>
                    <option value="SANDBOX">KRA Sandbox (Testing)</option>
                    <option value="PRODUCTION">KRA Production (Live)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-4 mt-6">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Device API Configuration</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Device ID</label>
                    <input
                      value={form.etimsDeviceId}
                      onChange={e => setForm({ ...form, etimsDeviceId: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="Enter Device ID"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Serial Number</label>
                    <input
                      value={form.etimsSerialNumber}
                      onChange={e => setForm({ ...form, etimsSerialNumber: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="Device Serial Number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Security Key</label>
                  <input
                    type="password"
                    value={form.etimsSecurityKey}
                    onChange={e => setForm({ ...form, etimsSecurityKey: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Enter Secret Security Key"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Settings saved successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Configuration</>}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-sm backdrop-blur-sm">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Connection Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Environment</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-current/20 ${
                  form.etimsMode === 'PRODUCTION' ? 'text-red-400' : form.etimsMode === 'SANDBOX' ? 'text-yellow-400' : 'text-zinc-500'
                }`}>
                  {form.etimsMode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Integration</span>
                <span className={`flex items-center gap-1.5 text-xs font-bold ${form.pinNumber ? 'text-green-400' : 'text-zinc-600'}`}>
                  {form.pinNumber ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {form.pinNumber ? 'KRA Ready' : 'Incomplete'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Plug & Play</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Once you have your OSCU/VSCU credentials from KRA, simply enter them here. Your ERP will automatically switch to live real-time tax invoice transmission.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
