'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateWebsiteWithAI } from '@/app/actions/website-builder'
import { Plus, Sparkles, X, Loader2 } from 'lucide-react'

export function CreateWebsiteModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [type, setType] = useState<'GENERAL' | 'SCHOOL' | 'COURSE' | 'PORTFOLIO'>('GENERAL')
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug || !prompt) {
      setError('Please fill in all required fields.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const website = await generateWebsiteWithAI(prompt, type)
      router.push(`/dashboard/website-builder/${website.id}/editor`)
      setIsOpen(false)
    } catch (err: any) {
      setError(err?.message || 'Failed to generate website.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
      >
        <Sparkles className="h-4 w-4 text-blue-200" />
        Create Website with AI
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
                <h2 className="text-xl font-bold text-white">AI Website Generator</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1">Website Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Greenwood Academy"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1">URL Path Segment *</label>
                <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
                  <span className="text-zinc-500 text-sm select-none">/site/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                    placeholder="greenwood-academy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1">Website Purpose / Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="GENERAL">General Business/Corporate</option>
                  <option value="SCHOOL">School, Academy, or College Portal</option>
                  <option value="COURSE">Educational Courses & Lesson Gating</option>
                  <option value="PORTFOLIO">Portfolio / Creative Showcase</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1">
                  Describe what you want on the website *
                </label>
                <textarea
                  required
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Describe your goals, e.g. 'A premium music academy website with course prices, online admission forms, teacher bio details, and curriculum overview.'"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-zinc-850 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Architecting Website...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
