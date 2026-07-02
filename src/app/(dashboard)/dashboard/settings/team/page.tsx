import { OrganizationProfile } from '@clerk/nextjs'
import { Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsTeamPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl select-none">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="rounded-xl p-2 border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            Team & Roles
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage organization members, invitations, and permission roles securely</p>
        </div>
      </div>

      {/* Clerk organization card with custom dark variables */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/10 p-4 md:p-6 overflow-x-auto shadow-xl backdrop-blur-sm">
        <OrganizationProfile 
          routing="hash"
          appearance={{
            variables: {
              colorPrimary: '#3b82f6', // blue-500
              colorBackground: '#09090b', // zinc-950
              colorText: '#ffffff',
              colorTextSecondary: '#71717a', // zinc-500
              colorDanger: '#ef4444',
              colorSuccess: '#22c55e',
              colorWarning: '#f59e0b',
              borderRadius: '0.75rem',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            elements: {
              rootBox: "w-full max-w-full",
              cardBox: "w-full max-w-full bg-zinc-950/40 border border-zinc-850/80 shadow-none text-white rounded-xl",
              card: "bg-transparent shadow-none text-white w-full max-w-none rounded-xl",
              navbar: "hidden", // We hide the navbar so it only shows members and profile management directly
              navbarMobileMenuButton: "text-white",
              headerTitle: "text-white text-xl font-bold tracking-tight",
              headerSubtitle: "text-zinc-400 text-sm",
              membersPageHeaderTitle: "text-white text-lg font-semibold",
              membersPageHeaderSubtitle: "text-zinc-400 text-sm",
              organizationProfile: "bg-transparent text-white",
              profilePage: "bg-transparent text-white",
              profileSectionTitleText: "text-white font-bold",
              profileSectionSubtitleText: "text-zinc-400",
              breadcrumbs: "hidden",
              scrollBox: "bg-transparent border-none shadow-none",
              pageScrollBox: "bg-transparent p-0",
              membersTable: "border border-zinc-800/80 bg-zinc-900/30 rounded-xl overflow-hidden mt-4",
              membersTableHeader: "bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 font-bold",
              membersTableRow: "border-b border-zinc-800 hover:bg-zinc-900/40 transition-colors",
              membersTableCell: "text-white py-3 px-4",
              memberRoleSelectButton: "bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2.5 py-1 text-xs hover:bg-zinc-800",
              button: "text-xs font-semibold px-3.5 py-2 rounded-lg transition-all cursor-pointer",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]",
              formButtonReset: "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white",
              formFieldInput: "bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-white rounded-lg text-sm px-3.5 py-2",
              formFieldLabel: "text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1",
              modalBackdrop: "bg-black/60 backdrop-blur-sm",
              modalContent: "bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl",
              accordionTriggerButton: "text-white hover:bg-zinc-900/50",
              accordionContent: "text-zinc-400",
            }
          }} 
        />
      </div>
    </div>
  )
}
