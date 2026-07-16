import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/roles'
import { Clock, User2 } from 'lucide-react'
import Link from 'next/link'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

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

  const orgObj = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { currency: true }
  })
  const currency = orgObj?.currency || 'USD'

  const stats = await getStats(orgId)

  return (
    <DashboardContent 
      stats={stats} 
      currency={currency} 
      userIsAdmin={userIsAdmin} 
    />
  )
}
