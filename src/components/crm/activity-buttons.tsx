'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createActivity } from '@/app/actions/activities'
import { Plus, X, Phone, Mail, Users, CheckSquare, FileText, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityLogButtonProps {
  leadId?: string
  opportunityId?: string
  customerId?: string
}

export function ActivityLogButton({ leadId, opportunityId, customerId }: ActivityLogButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const activityTypes = [
    { value: 'CALL', label: 'Phone Call', icon: Phone, color: 'text-blue-400 bg-blue-400/10' },
    { value: 'EMAIL', label: 'Email', icon: Mail, color: 'text-purple-400 bg-purple-400/10' },
    { value: 'MEETING', label: 'Meeting', icon: Users, color: 'text-green-400 bg-green-400/10' },
    { value: 'TASK', label: 'Task', icon: CheckSquare, color: 'text-orange-400 bg-orange-400/10' },
    { value: 'NOTE', label: 'Note', icon: FileText, color: 'text-zinc-400 bg-zinc-400/10' },
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      await createActivity({
        type: formData.get('type') as any,
        subject: formData.get('subject') as string,
        description: formData.get('description') as string || null,
        dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
        status: 'PENDING',
        priority: formData.get('priority') as any || 'MEDIUM',
        leadId,
        opportunityId,
        customerId,
      })
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-all shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Log Interaction
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Log Interaction</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Record a new touchpoint</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Activity Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {activityTypes.map((type) => (
                    <label key={type.value} className="cursor-pointer group">
                      <input type="radio" name="type" value={type.value} defaultChecked={type.value === 'CALL'} className="sr-only peer" />
                      <div className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all group-hover:border-zinc-600",
                        "peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:ring-1 peer-checked:ring-blue-500"
                      )}>
                        <type.icon className={cn("h-5 w-5 mb-1", type.color.split(' ')[0])} />
                        <span className="text-[9px] font-black uppercase text-zinc-500 peer-checked:text-blue-400">{type.value}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Subject / Headline *</label>
                <input
                  name="subject"
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="e.g., Initial discovery call regarding ERP needs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Detailed Notes</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none transition-all resize-none"
                  placeholder="Summarize the key points of the interaction..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Follow-up / Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="date"
                      name="dueDate"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Priority</label>
                  <select
                    name="priority"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM" selected>Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 transition-all hover:text-white"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Interaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
