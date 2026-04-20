import { auth } from '@clerk/nextjs/server'
import { OrganizationSwitcher } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/roles'
import { DashboardShell } from '@/components/shared/dashboard-shell'
import { Header } from '@/components/shared/header'
import Link from 'next/link'

async function getOrganizationData(clerkOrgId: string) {
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId },
    select: { id: true, enabledModules: true, onboardingComplete: true }
  })
  return org
}

async function getEmployeeModules(orgId: string, clerkUserId: string) {
  const employee = await prisma.employee.findFirst({
    where: { 
      organizationId: orgId, 
      clerkUserId,
      deletedAt: null 
    },
    select: { allowedModules: true }
  })
  return employee?.allowedModules || []
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, orgId, orgRole } = await auth()
  
  // If user is not signed in, redirect to sign-in
  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard')
  }
  
  // If user is signed in but has no organization, they need to create/join one
  if (!orgId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md w-full p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-8 shadow-xl shadow-blue-500/20">
            <span className="text-3xl font-black text-white">M</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Welcome to MinaERP</h1>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            MinaERP is a multi-tenant platform. Please select an existing organization or create a new one to continue.
          </p>
          <div className="flex flex-col gap-4">
            <div className="p-1 bg-zinc-800 rounded-xl">
              <OrganizationSwitcher 
                hidePersonal
                afterCreateOrganizationUrl="/onboarding"
                afterSelectOrganizationUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    organizationSwitcherTrigger: 'w-full bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white rounded-lg px-4 py-3 h-12',
                    organizationPreviewTextContainer: 'text-white font-bold',
                    organizationSwitcherTriggerIcon: 'text-zinc-400'
                  }
                }}
              />
            </div>
            <Link 
              href="/"
              className="text-sm text-zinc-500 hover:text-white transition-colors font-medium mt-4"
            >
              ← Back to Landing Page
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  // Check onboarding status
  const org = await getOrganizationData(orgId)
  
  // Only admins do onboarding - members skip if org not set up yet
  const userIsAdmin = isAdmin(orgRole)
  
  if (userIsAdmin) {
    // Admin: redirect to onboarding if not complete
    if (org && !org.onboardingComplete) {
      redirect('/onboarding')
    }
    if (!org) {
      redirect('/onboarding')
    }
  } else {
    // Member: if org doesn't exist or onboarding not complete, show waiting message
    if (!org || !org.onboardingComplete) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <div className="text-center max-w-md w-full p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-8 shadow-xl shadow-blue-500/20">
              <span className="text-3xl font-black text-white">M</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-4 tracking-tight">Almost There!</h1>
            <p className="text-zinc-400 leading-relaxed mb-6">
              Your organization admin is still setting up MinaERP. Please check back once the initial configuration is complete.
            </p>
            <div className="pt-6 border-t border-zinc-800">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-all"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      )
    }
  }

  // Determine which modules to show
  let modulesToShow: string[] = []
  
  if (userIsAdmin) {
    // Admins see all enabled organization modules
    modulesToShow = org?.enabledModules || []
  } else {
    // Members see only their allowed modules (intersection with org enabled)
    const employeeModules = org ? await getEmployeeModules(org.id, userId) : []
    const orgModules = org?.enabledModules || []
    // Only show modules that are both allowed for employee AND enabled for org
    modulesToShow = employeeModules.filter(m => orgModules.includes(m))
  }

  return (
    <DashboardShell enabledModules={modulesToShow} userRole={orgRole ?? null}>
      {children}
    </DashboardShell>
  )
}




