'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateLeaveStatus } from '@/app/actions/employees'
import { CheckCircle, XCircle } from 'lucide-react'

interface LeaveRequest {
  id: string
  leaveType: string
  startDate: Date
  endDate: Date
  totalDays: number | { toNumber: () => number }
  status: string
  reason: string | null
  employee: { firstName: string; lastName: string; employeeNumber: string }
}

const getDays = (d: number | { toNumber: () => number }): number => typeof d === 'number' ? d : d?.toNumber?.() || 0

export function LeaveTable({ leaves }: { leaves: LeaveRequest[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  const statusColors: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    APPROVED: 'text-green-400 bg-green-400/10',
    REJECTED: 'text-red-400 bg-red-400/10',
    CANCELLED: 'text-slate-400 bg-slate-400/10',
  }

  const typeColors: Record<string, string> = {
    ANNUAL: 'text-blue-400',
    SICK: 'text-red-400',
    UNPAID: 'text-slate-400',
    MATERNITY: 'text-pink-400',
    PATERNITY: 'text-purple-400',
    OTHER: 'text-orange-400',
  }

  async function handleStatusChange(id: string, status: string) {
    setProcessingId(id)
    try { await updateLeaveStatus(id, status); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800">
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Period</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Days</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {leaves.map((leave) => (
            <tr key={leave.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-white">{leave.employee.firstName} {leave.employee.lastName}</p>
                <p className="text-xs text-slate-400">{leave.employee.employeeNumber}</p>
              </td>
              <td className="px-6 py-4"><span className={`text-sm font-medium ${typeColors[leave.leaveType]}`}>{leave.leaveType}</span></td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-300">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-4 text-center"><span className="text-sm text-white font-medium">{getDays(leave.totalDays)}</span></td>
              <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[leave.status]}`}>{leave.status}</span></td>
              <td className="px-6 py-4 text-right">
                {leave.status === 'PENDING' && (
                  <div className="flex justify-end gap-1">
                    <button onClick={() => handleStatusChange(leave.id, 'APPROVED')} disabled={processingId === leave.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-green-600/20 hover:text-green-400 transition-colors disabled:opacity-50" title="Approve">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleStatusChange(leave.id, 'REJECTED')} disabled={processingId === leave.id} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Reject">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
