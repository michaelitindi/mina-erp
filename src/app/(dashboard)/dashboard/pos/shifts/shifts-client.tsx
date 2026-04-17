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
          <p className="text-zinc-500">Track cashier sessions</p>
        </div>
        {!activeSession ? (
          <button
            onClick={() => setShowOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Play className="h-4 w-4" />
            Open New Shift
          </button>
        ) : (
          <button
            onClick={() => setShowClose(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold shadow-lg shadow-orange-600/20 transition-all active:scale-95"
          >
            <XCircle className="h-4 w-4" />
            Close Active Shift
          </button>
        )}
      </div>

      {/* Active Shift Banner */}
      {activeSession && (
        <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-xl p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/20 rounded-xl">
              <Clock className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-white">Active Shift</h3>
              <p className="text-emerald-400/70 font-medium">
                {activeSession.terminal.name} • Started at {new Date(activeSession.openedAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Opening Cash</p>
              <p className="text-3xl font-black text-white">${Number(activeSession.openingCash).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Shift History */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="font-bold text-white">Shift History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Terminal</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cashier</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Opened</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Closed</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Opening</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Closing</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Variance</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-zinc-600">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-sm">No shift history available</p>
                  </td>
                </tr>
              ) : (
                sessions.map(session => (
                  <tr key={session.id} className="hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-white font-medium">{session.terminal.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{session.cashierName}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {new Date(session.openedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {session.closedAt ? new Date(session.closedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-white font-bold">
                      ${Number(session.openingCash).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-white font-bold">
                      {session.closingCash ? `$${Number(session.closingCash).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {session.cashDifference != null ? (
                        <span className={`font-black ${Number(session.cashDifference) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {Number(session.cashDifference) >= 0 ? '+' : ''}${Number(session.cashDifference).toFixed(2)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border border-current/20 ${
                        session.status === 'OPEN' 
                          ? 'text-emerald-400 bg-emerald-400/10' 
                          : 'text-zinc-500 bg-zinc-500/10'
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6">Close Shift</h2>
            
            <div className="space-y-6">
              <div className="bg-zinc-950/50 rounded-xl p-5 border border-zinc-800">
                <div className="flex justify-between mb-2">
                  <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Opening Cash</span>
                  <span className="text-white font-black">${Number(activeSession.openingCash).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Started</span>
                  <span className="text-white font-medium">{new Date(activeSession.openedAt).toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                  Closing Cash Count
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-zinc-500 font-bold">$</span>
                  <input
                    type="number"
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xl font-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                  Shift Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any discrepancies or incidents..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none transition-all"
                />
              </div>
              
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowClose(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseShift}
                  disabled={!closingCash || isPending}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg shadow-orange-600/20 disabled:opacity-50 transition-all active:scale-95"
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6">Open Shift</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                  Select Terminal
                </label>
                <select
                  value={selectedTerminal}
                  onChange={(e) => setSelectedTerminal(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Choose terminal...</option>
                  {terminals.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                  Opening Cash Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-zinc-500 font-bold">$</span>
                  <input
                    type="number"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xl font-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenShift}
                  disabled={!selectedTerminal || !openingCash || isPending}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all active:scale-95"
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
