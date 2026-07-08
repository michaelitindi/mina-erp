'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAiSettings, updateAiSettings } from '@/app/actions/ai'
import { Cpu, Save, AlertCircle, CheckCircle2, Eye, EyeOff, ExternalLink, ArrowLeft } from 'lucide-react'

export default function AiSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showKey, setShowKey] = useState(false)
  
  const [settings, setSettings] = useState({
    hasKey: false,
    maskedKey: '',
    hasEnvFallback: false
  })
  
  const [inputKey, setInputKey] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await getAiSettings()
        setSettings(res)
        if (res.hasKey) {
          setInputKey(res.maskedKey)
        }
      } catch (err) {
        setError('Failed to load AI settings')
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
      // If they didn't modify the masked key, don't update it
      let keyToUpdate = inputKey
      if (inputKey === settings.maskedKey && settings.hasKey) {
        // No change made
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        return
      }

      const res = await updateAiSettings(keyToUpdate)
      if (res.success) {
        setSuccess(true)
        // Refresh the local state
        const updatedSettings = await getAiSettings()
        setSettings(updatedSettings)
        setInputKey(updatedSettings.hasKey ? updatedSettings.maskedKey : '')
        setShowKey(false)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500 font-medium">
        <div className="animate-pulse flex items-center gap-2">
          <Cpu className="h-5 w-5 animate-spin text-zinc-600" />
          <span>Loading AI Configuration...</span>
        </div>
      </div>
    )
  }

  const isConfigured = settings.hasKey || settings.hasEnvFallback

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="rounded-xl p-2 border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Integrations</h1>
          <p className="text-zinc-500">Configure Gemini model settings for intelligent Copilots and autocomplete engines</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-800">
              <Cpu className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Gemini SDK Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={e => setInputKey(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-3 pr-10 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Enter your Gemini API key (AI Studio)"
                  />
                  {inputKey && (
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                    >
                      {showKey ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Tenant-scoped key. This will be encrypted and saved for this organization.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Integration Status</h3>
                <div className="flex items-center gap-2 text-sm">
                  {settings.hasKey ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-zinc-300 font-semibold">Active</span>
                      <span className="text-zinc-500">(Using organization API key)</span>
                    </>
                  ) : settings.hasEnvFallback ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-zinc-300 font-semibold">Fallback Active</span>
                      <span className="text-zinc-500">(Using global system environment key)</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-zinc-300 font-semibold">Not Configured</span>
                      <span className="text-zinc-500">(Gemini features will fail to load)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Error and Success Feedback */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  <AlertCircle className="h-4.5 w-4.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span>AI settings saved successfully!</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar Guide */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Where to get a key?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You can generate a free or pay-as-you-go API key directly from Google AI Studio. 
            </p>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Google AI Studio
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3">
            <h3 className="font-bold text-white text-sm">AI-Powered Features</h3>
            <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
              <li>Smart Sales Forecasting</li>
              <li>Dynamic product description generator</li>
              <li>POS intelligent inventory recommendations</li>
              <li>Autonomous business coaching and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
