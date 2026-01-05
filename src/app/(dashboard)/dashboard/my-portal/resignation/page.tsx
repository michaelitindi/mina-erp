'use client'

import { useState, useEffect } from 'react'
import { getMyEmployee, submitResignation, withdrawResignation } from '@/app/actions/self-service'
import { LogOut, AlertTriangle, Clock, CheckCircle, XCircle, Undo2 } from 'lucide-react'

type ResignationRequest = {
  id: string
  requestDate: Date
  lastWorkingDate: Date
  reason: string | null
  status: string
  notes: string | null
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
  WITHDRAWN: 'bg-slate-500/20 text-slate-400',
}

export default function ResignationPage() {
  const [loading, setLoading] = useState(true)
  const [resignations, setResignations] = useState<ResignationRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    lastWorkingDate: '',
    reason: '',
    notes: '',
  })
  
  useEffect(() => {
    loadData()
  }, [])
  
  async function loadData() {
    const emp = await getMyEmployee()
    if (emp?.resignations) {
      setResignations(emp.resignations)
    }
    setLoading(false)
  }
  
  const hasPending = resignations.some(r => r.status === 'PENDING')
  
  async function handleSubmit() {
    if (!form.lastWorkingDate) {
      alert('Please select your last working date')
      return
    }
    
    const confirmed = confirm(
      'Are you sure you want to submit a resignation request? This action will notify HR.'
    )
    if (!confirmed) return
    
    setSaving(true)
    try {
      await submitResignation({
        lastWorkingDate: new Date(form.lastWorkingDate),
        reason: form.reason || null,
        notes: form.notes || null,
      })
      setForm({ lastWorkingDate: '', reason: '', notes: '' })
      setShowForm(false)
      await loadData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit resignation'
      alert(message)
    }
    setSaving(false)
  }
  
  async function handleWithdraw(id: string) {
    const confirmed = confirm('Are you sure you want to withdraw your resignation request?')
    if (!confirmed) return
    
    try {
      await withdrawResignation(id)
      await loadData()
    } catch (error) {
      alert('Failed to withdraw resignation')
    }
  }
  
  if (loading) {
    return <div className="text-slate-400">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogOut className="h-6 w-6 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Resignation</h2>
        </div>
        {!hasPending && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-red-600/20 border border-red-600/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/30"
          >
            <LogOut className="h-4 w-4" />
            Submit Resignation
          </button>
        )}
      </div>
      
      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-200">
          <p className="font-medium">Before you proceed</p>
          <p className="text-yellow-200/70 mt-1">
            Submitting a resignation request will notify HR. You can withdraw a pending request, 
            but once approved, the resignation process will begin.
          </p>
        </div>
      </div>
      
      {/* Submit Form */}
      {showForm && (
        <div className="rounded-lg border border-red-600/30 bg-red-900/10 p-4 space-y-4">
          <h3 className="font-medium text-white">Submit Resignation Request</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Last Working Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.lastWorkingDate}
                onChange={(e) => setForm({ ...form, lastWorkingDate: e.target.value })}
                min={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              />
              <p className="text-xs text-slate-500 mt-1">Minimum 2 weeks notice</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Reason</label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              >
                <option value="">Select reason...</option>
                <option value="Better opportunity">Better opportunity</option>
                <option value="Career change">Career change</option>
                <option value="Personal reasons">Personal reasons</option>
                <option value="Relocation">Relocation</option>
                <option value="Retirement">Retirement</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Additional Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              placeholder="Any additional information..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Confirm Resignation'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* History */}
      {resignations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400">Request History</h3>
          {resignations.map((res) => (
            <div key={res.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">
                    Last Day: {new Date(res.lastWorkingDate).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[res.status]}`}>
                    {res.status}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  Submitted: {new Date(res.requestDate).toLocaleDateString()}
                  {res.reason && ` • ${res.reason}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {res.status === 'APPROVED' && <CheckCircle className="h-5 w-5 text-green-400" />}
                {res.status === 'REJECTED' && <XCircle className="h-5 w-5 text-red-400" />}
                {res.status === 'PENDING' && (
                  <>
                    <Clock className="h-5 w-5 text-yellow-400" />
                    <button
                      onClick={() => handleWithdraw(res.id)}
                      className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
                    >
                      <Undo2 className="h-4 w-4" />
                      Withdraw
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
