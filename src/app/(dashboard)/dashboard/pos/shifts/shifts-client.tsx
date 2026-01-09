'use client'

import { useState, useTransition } from 'react'
import { Clock, CheckCircle, AlertCircle, Play, XCircle } from 'lucide-react'
import { closeSession, openSession } from '@/app/actions/pos'

interface Terminal {
  id: string
  name: string
  location: string | null
}

interface Session {
  id: string
  terminalId: string
  cashierId: string
  cashierName: string
  openedAt: Date
  closedAt: Date | null
  openingCash: any
  closingCash: any
  expectedCash: any
  cashDifference: any
  status: string
  notes: string | null
  terminal: Terminal
}

interface ShiftsClientProps {
  sessions: Session[]
  activeSession: Session | null
  terminals: Terminal[]
}

export function ShiftsClient({ sessions, activeSession, terminals }: ShiftsClientProps) {
  const [showClose, setShowClose] = useState(false)
  const [showOpen, setShowOpen] = useState(false)
  const [closingCash, setClosingCash] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedTerminal, setSelectedTerminal] = useState('')
  const [openingCash, setOpeningCash] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleCloseShift = async () => {
    if (!activeSession || !closingCash) return
    startTransition(async () => {
      try {
        await closeSession(activeSession.id, {
          closingCash: parseFloat(closingCash),
          notes: notes || undefined,
        })
        setShowClose(false)
        window.location.reload()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  const handleOpenShift = async () => {
    if (!selectedTerminal || !openingCash) return
    startTransition(async () => {
      try {
        await openSession({
          terminalId: selectedTerminal,
          openingCash: parseFloat(openingCash),
        })
        setShowOpen(false)
        window.location.reload()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Shift Management</h1>
          <p className="text-slate-400">Track cashier sessions</p>
        </div>
        {!activeSession ? (
          <button
            onClick={() => setShowOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
          >
            <Play className="h-4 w-4" />
            Open Shift
          </button>
        ) : (
          <button
            onClick={() => setShowClose(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
          >
            <XCircle className="h-4 w-4" />
            Close Shift
          </button>
        )}
      </div>

      {/* Active Shift Banner */}
      {activeSession && (
        <div className="bg-emerald-600/10 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Active Shift</h3>
              <p className="text-emerald-300">
                {activeSession.terminal.name} • Started at {new Date(activeSession.openedAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Opening Cash</p>
              <p className="text-xl font-bold text-white">${Number(activeSession.openingCash).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Shift History */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Shift History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Terminal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cashier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Opened</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Closed</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Opening</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Closing</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Variance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No shifts yet</p>
                  </td>
                </tr>
              ) : (
                sessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-sm text-white">{session.terminal.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{session.cashierName}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(session.openedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {session.closedAt ? new Date(session.closedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-white">
                      ${Number(session.openingCash).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-white">
                      {session.closingCash ? `$${Number(session.closingCash).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {session.cashDifference != null ? (
                        <span className={Number(session.cashDifference) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {Number(session.cashDifference) >= 0 ? '+' : ''}${Number(session.cashDifference).toFixed(2)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'OPEN' 
                          ? 'text-emerald-400 bg-emerald-400/10' 
                          : 'text-slate-400 bg-slate-400/10'
                      }`}>
                        {session.status === 'OPEN' ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close Shift Modal */}
      {showClose && activeSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Close Shift</h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Opening Cash</span>
                  <span className="text-white font-medium">${Number(activeSession.openingCash).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Started</span>
                  <span className="text-white">{new Date(activeSession.openedAt).toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Closing Cash Count
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                  <input
                    type="number"
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this shift..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClose(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseShift}
                  disabled={!closingCash || isPending}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {isPending ? 'Closing...' : 'Close Shift'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Shift Modal */}
      {showOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Open Shift</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Terminal
                </label>
                <select
                  value={selectedTerminal}
                  onChange={(e) => setSelectedTerminal(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose terminal...</option>
                  {terminals.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Opening Cash Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                  <input
                    type="number"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOpen(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenShift}
                  disabled={!selectedTerminal || !openingCash || isPending}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {isPending ? 'Opening...' : 'Open Shift'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
