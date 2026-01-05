'use client'

import { useState, useEffect } from 'react'
import { getMyLeaveRequests, submitMyLeave } from '@/app/actions/self-service'
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'

type LeaveRequest = {
  id: string
  leaveType: string
  startDate: Date
  endDate: Date
  totalDays: { toString: () => string }
  status: string
  reason: string | null
  createdAt: Date
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
}

export default function LeavesPage() {
  const [loading, setLoading] = useState(true)
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    leaveType: 'ANNUAL' as 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY' | 'PATERNITY' | 'OTHER',
    startDate: '',
    endDate: '',
    reason: '',
  })
  
  useEffect(() => {
    loadData()
  }, [])
  
  async function loadData() {
    const data = await getMyLeaveRequests()
    setLeaves(data)
    setLoading(false)
  }
  
  async function handleSubmit() {
    if (!form.startDate || !form.endDate) {
      alert('Please select start and end dates')
      return
    }
    
    setSaving(true)
    try {
      await submitMyLeave({
        ...form,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
      })
      setForm({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })
      setShowForm(false)
      await loadData()
    } catch (error) {
      alert('Failed to submit leave request')
    }
    setSaving(false)
  }
  
  if (loading) {
    return <div className="text-slate-400">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">My Leave Requests</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Request Leave
        </button>
      </div>
      
      {/* Submit Form */}
      {showForm && (
        <div className="rounded-lg border border-slate-600 bg-slate-700/30 p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Leave Type</label>
              <select
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value as typeof form.leaveType })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              >
                <option value="ANNUAL">Annual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
                <option value="MATERNITY">Maternity Leave</option>
                <option value="PATERNITY">Paternity Leave</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">End Date *</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Reason (optional)</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              placeholder="Brief reason for leave..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Submit Request'}
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
      
      {/* List */}
      {leaves.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No leave requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div key={leave.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{leave.leaveType.replace('_', ' ')} Leave</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[leave.status]}`}>
                    {leave.status}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  <span className="mx-2">•</span>
                  {leave.totalDays.toString()} day(s)
                </div>
                {leave.reason && <div className="text-sm text-slate-500 mt-1">{leave.reason}</div>}
              </div>
              <div className="ml-4">
                {leave.status === 'APPROVED' && <CheckCircle className="h-5 w-5 text-green-400" />}
                {leave.status === 'REJECTED' && <XCircle className="h-5 w-5 text-red-400" />}
                {leave.status === 'PENDING' && <Clock className="h-5 w-5 text-yellow-400" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
