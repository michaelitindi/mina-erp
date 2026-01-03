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
  const { userId, orgId } = await auth()
  
  // If user is not signed in, redirect to sign-in
  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard')
  }
  
  // If user is signed in but has no organization, they need to create/join one
  // Clerk's OrganizationSwitcher will handle this
  if (!orgId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Welcome to MinaERP</h1>
          <p className="text-slate-400 mb-6">
            Please select or create an organization to continue.
          </p>
          <div className="flex justify-center">
            <Header />
          </div>
        </div>
      </div>
    )
  }
  
  // Check onboarding status
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


