import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/roles'
import { 
  Receipt, 
  Users, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  User2,
} from 'lucide-react'
import Link from 'next/link'

async function getStats(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })
  
  if (!org) return null

  const [
    invoiceCount,
    customerCount,
    pendingInvoices,
    paidInvoices,
  ] = await Promise.all([
    prisma.invoice.count({ 
      where: { organizationId: org.id, deletedAt: null } 
    }),
    prisma.customer.count({ 
      where: { organizationId: org.id, deletedAt: null } 
    }),
    prisma.invoice.aggregate({
      where: { 
        organizationId: org.id, 
        status: { in: ['DRAFT', 'SENT'] },
        deletedAt: null 
      },
      _sum: { totalAmount: true }
    }),
    prisma.invoice.aggregate({
      where: { 
        organizationId: org.id, 
        status: 'PAID',
        deletedAt: null 
      },
      _sum: { totalAmount: true }
    }),
  ])

  return {
    invoiceCount,
    customerCount,
    pendingAmount: Number(pendingInvoices._sum.totalAmount || 0),
    paidAmount: Number(paidInvoices._sum.totalAmount || 0),
  }
}

async function getEmployeeModules(clerkOrgId: string, clerkUserId: string) {
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId }
  })
  if (!org) return []
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: org.id, clerkUserId, deletedAt: null },
    select: { allowedModules: true }
  })
  return employee?.allowedModules || []
}

export default async function DashboardPage() {
  const { userId, orgId, orgRole } = await auth()
  
  if (!orgId || !userId) {
    redirect('/')
  }

  const userIsAdmin = isAdmin(orgRole)
  
  // For members, check if they have any modules assigned
  if (!userIsAdmin) {
    const employeeModules = await getEmployeeModules(orgId, userId)
    
    // If no modules assigned, show setup pending screen
    if (employeeModules.length === 0) {
      return (
        <div className="p-6 min-h-[80vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <Clock className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Setting Up Your Account</h1>
            <p className="text-zinc-400 mb-6">
              Your administrator is configuring your access to MinaERP modules. 
              You'll be notified once your account is ready.
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 mb-6">
              <p className="text-sm text-zinc-400">
                In the meantime, you can access your <strong className="text-white">My Portal</strong> to update your personal information.
              </p>
            </div>
            <Link
              href="/dashboard/my-portal"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <User2 className="h-4 w-4" />
              Go to My Portal
            </Link>
          </div>
        </div>
      )
    }
  }

  const stats = await getStats(orgId)

  const cards = [
    {
      title: 'Total Revenue',
      value: stats ? `$${stats.paidAmount.toLocaleString()}` : '$0',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Pending Invoices',
      value: stats ? `$${stats.pendingAmount.toLocaleString()}` : '$0',
      icon: Receipt,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Total Customers',
      value: stats?.customerCount.toString() || '0',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Invoice Count',
      value: stats?.invoiceCount.toString() || '0',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600',
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500">Welcome to MinaERP</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg bg-gradient-to-br ${card.color} p-3 shadow-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Link
            href="/dashboard/finance/invoices"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 group"
          >
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">Create Invoice</span>
          </Link>
          <Link
            href="/dashboard/crm/customers"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 group"
          >
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">Add Customer</span>
          </Link>
          <Link
            href="/dashboard/finance/bills"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 group"
          >
            <div className="p-2 rounded-md bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">Enter Bill</span>
          </Link>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 group"
          >
            <div className="p-2 rounded-md bg-green-500/10 text-green-400 group-hover:bg-green-500/20 transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
