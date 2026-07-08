'use client'

import { useState, useTransition, useEffect } from 'react'
import { getTerminals, createTerminal, updateTerminal, deleteTerminal } from '@/app/actions/pos'
import { POSModuleNav } from '../pos-nav'
import { ShoppingCart, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface Terminal {
  id: string
  name: string
  location: string | null
  status: string
}

export default function POSTerminalsSettingsPage() {
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [isPending, startTransition] = useTransition()

  // Fetch terminals on mount
  useEffect(() => {
    loadTerminals()
  }, [])

  const loadTerminals = async () => {
    const list = await getTerminals()
    setTerminals(list as any)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    startTransition(async () => {
      try {
        await createTerminal({ name, location })
        setName('')
        setLocation('')
        await loadTerminals()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  const handleUpdate = async (id: string) => {
    if (!editName) return

    startTransition(async () => {
      try {
        await updateTerminal(id, { name: editName, location: editLocation })
        setEditingId(null)
        await loadTerminals()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this terminal?')) return

    startTransition(async () => {
      try {
        await deleteTerminal(id)
        await loadTerminals()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  return (
    <div className="space-y-6 select-none p-4 md:p-6">
      <POSModuleNav />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Create Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            Add Terminal
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Terminal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main Counter 1"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Ground Floor"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || !name}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
            >
              {isPending ? 'Creating...' : 'Create Terminal'}
            </button>
          </form>
        </div>

        {/* Terminals List */}
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            Registered Terminals
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {terminals.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-4 font-medium text-white">
                      {editingId === t.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-zinc-850 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        />
                      ) : (
                        t.name
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === t.id ? (
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="bg-zinc-850 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        />
                      ) : (
                        t.location || 'N/A'
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
                        t.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}>
                        {t.status === 'ACTIVE' ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {editingId === t.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleUpdate(t.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3 justify-end items-center">
                          <button
                            onClick={() => {
                              setEditingId(t.id)
                              setEditName(t.name)
                              setEditLocation(t.location || '')
                            }}
                            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Edit Terminal"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Terminal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {terminals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500 text-sm">
                      No terminals registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
