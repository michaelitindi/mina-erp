'use client'

import { useState, useEffect } from 'react'
import { getMyTimesheets } from '@/app/actions/self-service'
import { Clock, Calendar } from 'lucide-react'

type Timesheet = {
  id: string
  weekStartDate: Date
  status: string
  totalHours: { toString: () => string }
  overtimeHours: { toString: () => string }
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-500/20 text-slate-400',
  SUBMITTED: 'bg-blue-500/20 text-blue-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true)
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  
  useEffect(() => {
    getMyTimesheets().then((data) => {
      setTimesheets(data)
      setLoading(false)
    })
  }, [])
  
  if (loading) {
    return <div className="text-slate-400">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Time & Attendance</h2>
      </div>
      
      <p className="text-sm text-slate-400">
        View your timesheets and attendance records.
      </p>
      
      {timesheets.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No timesheets found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 text-left">
                <th className="pb-3 text-sm font-medium text-slate-400">Week Starting</th>
                <th className="pb-3 text-sm font-medium text-slate-400">Total Hours</th>
                <th className="pb-3 text-sm font-medium text-slate-400">Overtime</th>
                <th className="pb-3 text-sm font-medium text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((ts) => (
                <tr key={ts.id} className="border-b border-slate-700/50">
                  <td className="py-3 text-white">
                    {new Date(ts.weekStartDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-white">{ts.totalHours.toString()} hrs</td>
                  <td className="py-3 text-white">{ts.overtimeHours.toString()} hrs</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[ts.status]}`}>
                      {ts.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
