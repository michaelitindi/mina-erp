import { getOrganizationWithModules } from '@/app/actions/onboarding'
import { ModulesClient } from '@/components/shared/modules-client'
import { redirect } from 'next/navigation'

export default async function SettingsModulesPage() {
  const org = await getOrganizationWithModules()
  
  if (!org) {
    redirect('/dashboard')
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <ModulesClient initialModules={org.enabledModules} />
    </div>
  )
}
