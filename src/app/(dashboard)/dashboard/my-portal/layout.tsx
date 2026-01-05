import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getMyEmployee } from '@/app/actions/self-service'
import { 
  User, 
  Wallet, 
  GraduationCap, 
  Users, 
  Calendar,
  Clock,
  Receipt,
  LogOut 
} from 'lucide-react'

const tabs = [
  { name: 'Profile', href: '/dashboard/my-portal', icon: User },
  { name: 'Bank Details', href: '/dashboard/my-portal/bank', icon: Wallet },
  { name: 'Professional', href: '/dashboard/my-portal/professional', icon: GraduationCap },
  { name: 'Dependants', href: '/dashboard/my-portal/dependants', icon: Users },
  { name: 'Leaves', href: '/dashboard/my-portal/leaves', icon: Calendar },
  { name: 'Attendance', href: '/dashboard/my-portal/attendance', icon: Clock },
  { name: 'Payslips', href: '/dashboard/my-portal/payslips', icon: Receipt },
  { name: 'Resignation', href: '/dashboard/my-portal/resignation', icon: LogOut },
]

export default async function MyPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  
  const employee = await getMyEmployee()
  
  // If no employee record linked, show message
  if (!employee) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-8 text-center">
          <User className="h-16 w-16 mx-auto text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Employee Record Found</h2>
          <p className="text-slate-400">
            Your account is not linked to an employee record yet. Please contact your HR administrator 
            to set up your employee profile.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Portal</h1>
        <p className="text-slate-400">
          Welcome, {employee.firstName}! Manage your personal information and HR requests.
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6 overflow-x-auto">
        <nav className="flex gap-1 border-b border-slate-700 pb-px">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-t-lg transition-colors whitespace-nowrap"
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Content */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6">
        {children}
      </div>
    </div>
  )
}
