import { getFullOrganizationSettings } from '@/app/actions/settings'
import { ProfileSettingsClient } from '@/components/shared/profile-settings-client'
import { redirect } from 'next/navigation'

export default async function SettingsProfilePage() {
  const profile = await getFullOrganizationSettings()

  if (!profile) {
    redirect('/dashboard')
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <ProfileSettingsClient initialProfile={profile} />
    </div>
  )
}
