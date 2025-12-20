import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function getOrganizationData(clerkOrgId: string) {
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId },
    select: { enabledModules: true, onboardingComplete: true }
  })
  return org
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { orgId } = await auth()
  
  // Check onboarding status
  if (orgId) {
    const org = await getOrganizationData(orgId)
    
    // If org exists but onboarding not complete, redirect
    if (org && !org.onboardingComplete) {
      redirect('/onboarding')
    }
    
    // If org doesn't exist yet (first time), redirect to onboarding
    if (!org) {
      redirect('/onboarding')
    }

    return (
      <div className="min-h-screen bg-slate-900">
        <Sidebar enabledModules={org.enabledModules} />
        <div className="ml-64">
          <Header />
          <main>
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Fallback if no org (shouldn't happen with proper auth)
  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}

