import { getEmployees, getEmployeeStats } from '@/app/actions/employees'
import { getOrganizationWithModules } from '@/app/actions/onboarding'
import { EmployeesTable } from '@/components/hr/employees-table'
import { CreateEmployeeButton } from '@/components/hr/employee-buttons'
import { Users, UserCheck, Briefcase, Clock } from 'lucide-react'

export default async function EmployeesPage() {
  const [employeesResult, stats, org] = await Promise.all([
    getEmployees(),
    getEmployeeStats(),
    getOrganizationWithModules()
  ])
  
  const employees = employeesResult.items
  const orgModules = org?.enabledModules || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-zinc-500">Manage your workforce</p>
        </div>
        <CreateEmployeeButton />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><Users className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Total Employees</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><UserCheck className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Active</p><p className="text-2xl font-bold text-white">{stats.active}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><Briefcase className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Full-Time</p><p className="text-2xl font-bold text-white">{stats.fullTime}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2"><Clock className="h-5 w-5 text-orange-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Part-Time</p><p className="text-2xl font-bold text-white">{stats.partTime}</p></div>
          </div>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center shadow-sm backdrop-blur-sm">
          <Users className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 text-lg font-semibold text-white">No employees yet</h3>
          <p className="mt-2 text-zinc-500">Add your first employee to get started.</p>
          <div className="mt-6"><CreateEmployeeButton /></div>
        </div>
      ) : (
        <EmployeesTable employees={employees} orgEnabledModules={orgModules} />
      )}
    </div>
  )
}

