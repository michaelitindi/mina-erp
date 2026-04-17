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
  DRAFT: 'bg-zinc-600/20 text-zinc-500',
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
    return <div className="text-zinc-500">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Time & Attendance</h2>
      </div>
      
      <p className="text-sm text-zinc-500">
        View your timesheets and attendance records.
      </p>
      
      {timesheets.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No timesheets found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-left bg-zinc-900/50">
                <th className="px-4 py-3 text-xs font-black text-zinc-500 uppercase tracking-widest">Week Starting</th>
                <th className="px-4 py-3 text-xs font-black text-zinc-500 uppercase tracking-widest">Total Hours</th>
                <th className="px-4 py-3 text-xs font-black text-zinc-500 uppercase tracking-widest">Overtime</th>
                <th className="px-4 py-3 text-xs font-black text-zinc-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((ts) => (
                <tr key={ts.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-4 text-sm text-white font-medium">
                    {new Date(ts.weekStartDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-300">{ts.totalHours.toString()} hrs</td>
                  <td className="px-4 py-4 text-sm text-zinc-300">{ts.overtimeHours.toString()} hrs</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border border-current/20 ${statusColors[ts.status]}`}>
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
