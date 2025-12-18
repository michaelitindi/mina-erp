import { getLeaveRequests, getEmployees } from '@/app/actions/employees'
import { LeaveTable } from '@/components/hr/leave-table'
import { CreateLeaveButton } from '@/components/hr/leave-buttons'
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

export default async function LeavePage() {
  const [leaves, employees] = await Promise.all([
    getLeaveRequests(),
    getEmployees()
  ])

  const pending = leaves.filter(l => l.status === 'PENDING').length
  const approved = leaves.filter(l => l.status === 'APPROVED').length
  const rejected = leaves.filter(l => l.status === 'REJECTED').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Management</h1>
          <p className="text-slate-400">Manage employee time off requests</p>
        </div>
        <CreateLeaveButton employees={employees} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><Calendar className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-slate-400">Total Requests</p><p className="text-2xl font-bold text-white">{leaves.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2"><Clock className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-sm text-slate-400">Pending</p><p className="text-2xl font-bold text-white">{pending}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><CheckCircle className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-slate-400">Approved</p><p className="text-2xl font-bold text-white">{approved}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2"><XCircle className="h-5 w-5 text-red-400" /></div>
            <div><p className="text-sm text-slate-400">Rejected</p><p className="text-2xl font-bold text-white">{rejected}</p></div>
          </div>
        </div>
      </div>

      {leaves.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">No leave requests yet</h3>
          <p className="mt-2 text-slate-400">Create a leave request to get started.</p>
          <div className="mt-6"><CreateLeaveButton employees={employees} /></div>
        </div>
      ) : (
        <LeaveTable leaves={leaves} />
      )}
    </div>
  )
}
