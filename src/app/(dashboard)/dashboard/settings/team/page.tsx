import { OrganizationProfile } from '@clerk/nextjs'
import { Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsTeamPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/settings"
          className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-zinc-400" />
            Team & Roles
          </h1>
          <p className="text-zinc-500 text-sm">Manage organization members, invites, and permission privileges</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-2 overflow-hidden">
        <OrganizationProfile 
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full bg-zinc-950 border border-zinc-850 shadow-none text-white",
              navbar: "hidden", // Hide navigation so it focuses purely on member list if needed, or keep it standard
              headerTitle: "text-white text-lg font-bold",
              headerSubtitle: "text-zinc-500 text-xs",
              membersPageHeaderTitle: "text-white text-base",
              organizationProfile: "bg-zinc-950 text-white",
              baseTheme: "dark"
            }
          }} 
        />
      </div>
    </div>
  )
}
