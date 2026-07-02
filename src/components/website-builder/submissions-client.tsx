'use client'

import { useState } from 'react'
import { markSubmissionRead } from '@/app/actions/website-builder'
import { FileText, CheckCircle, Mail, Clock, ShieldAlert, ArrowLeft, Trash } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function SubmissionsClient({ initialSubmissions, websiteId, websiteName }: { initialSubmissions: any[]; websiteId: string; websiteName: string }) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [selectedId, setSelectedId] = useState<string | null>(initialSubmissions[0]?.id || null)
  const router = useRouter()

  const selected = submissions.find((s) => s.id === selectedId)

  const handleMarkRead = async (id: string) => {
    try {
      await markSubmissionRead(id)
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isRead: true } : s))
      )
      router.refresh()
    } catch (e) {
      console.error('Failed to mark read')
    }
  }

  // Parse custom submission payload
  const renderPayload = (payloadStr: string) => {
    try {
      const obj = JSON.parse(payloadStr)
      return (
        <div className="space-y-4">
          {Object.entries(obj).map(([key, val]: any) => (
            <div key={key} className="border-b border-zinc-900 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-0.5">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="text-sm text-white font-medium whitespace-pre-wrap">{String(val)}</span>
            </div>
          ))}
        </div>
      )
    } catch (e) {
      return <pre className="text-xs text-zinc-400 bg-zinc-950 p-3 rounded">{payloadStr}</pre>
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/website-builder"
          className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-yellow-500" />
            Form Submissions
          </h1>
          <p className="text-zinc-500 text-sm">
            Visitor submissions captured on <span className="text-zinc-300 font-semibold">{websiteName}</span>
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-12 text-center max-w-2xl mx-auto">
          <ShieldAlert className="mx-auto h-12 w-12 text-zinc-650" />
          <h3 className="mt-4 text-base font-bold text-white">No submissions captured yet</h3>
          <p className="mt-2 text-zinc-500 text-xs">
            Form entries (such as contact forms or admissions) will appear here instantly when visitors fill them out.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {/* List panel */}
          <div className="md:col-span-1 rounded-xl border border-zinc-850 bg-zinc-900/30 overflow-hidden space-y-1">
            <div className="p-3 bg-zinc-900/50 border-b border-zinc-850 font-bold text-xs text-zinc-400 uppercase tracking-wider">
              Inbox ({submissions.filter(s => !s.isRead).length} unread)
            </div>
            <div className="divide-y divide-zinc-900 max-h-[600px] overflow-y-auto">
              {submissions.map((sub) => {
                let name = 'Anonymous'
                try {
                  const p = JSON.parse(sub.payload)
                  name = p.name || p.email || name
                } catch(e){}

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedId(sub.id)}
                    className={`p-3.5 cursor-pointer text-left transition-all ${
                      selectedId === sub.id ? 'bg-zinc-850' : 'hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        sub.formType === 'ADMISSION' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {sub.formType}
                      </span>
                      {!sub.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-white truncate">{name}</p>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Details inspector */}
          <div className="md:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 min-h-[400px] flex flex-col justify-between">
            {selected ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Submission Profile</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">ID: {selected.id}</p>
                  </div>
                  {!selected.isRead && (
                    <button
                      onClick={() => handleMarkRead(selected.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mark as Read
                    </button>
                  )}
                </div>

                <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl space-y-4">
                  {renderPayload(selected.payload)}
                </div>
              </div>
            ) : (
              <div className="m-auto text-center text-zinc-500 text-xs">
                Select a submission entry to inspect its details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
