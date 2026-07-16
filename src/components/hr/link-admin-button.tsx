'use client'

import { useState } from 'react'
import { createAndLinkAdminEmployee } from '@/app/actions/self-service'
import { Sparkles, Loader2 } from 'lucide-react'

export function LinkAdminButton() {
  const [loading, setLoading] = useState(false)

  async function handleLink() {
    if (!confirm('Would you like to automatically create and link your administrator profile?')) return
    setLoading(true)
    try {
      await createAndLinkAdminEmployee()
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create admin profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLink}
      disabled={loading}
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating admin profile...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-blue-200" />
          Create & Link my Admin Profile
        </>
      )}
    </button>
  )
}
