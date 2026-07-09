'use client'

import { UserButton, OrganizationSwitcher } from '@clerk/nextjs'
import { Menu } from 'lucide-react'
import { GlobalSearch } from './global-search'
import { NotificationDropdown } from './notification-dropdown'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full flex-shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 md:px-6 backdrop-blur-xl">
      {/* Left side: Menu & Search */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className="hidden md:block">
          <GlobalSearch />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Organization Switcher */}
        <div className="max-w-[150px] md:max-w-none overflow-hidden">
          <OrganizationSwitcher 
            appearance={{
              elements: {
                rootBox: 'flex items-center',
                organizationSwitcherTrigger: 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg px-2 md:px-3 py-2 transition-colors',
                organizationPreviewTextContainer: 'hidden sm:block text-white',
                organizationSwitcherTriggerIcon: 'text-zinc-400',
                organizationPreviewMainIdentifier: 'text-white font-medium',
                organizationPreviewSecondaryIdentifier: 'text-zinc-500',
              }
            }}
            afterCreateOrganizationUrl="/dashboard"
            afterLeaveOrganizationUrl="/"
            afterSelectOrganizationUrl="/dashboard"
          />
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Button */}
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8 md:h-9 md:w-9 ring-2 ring-zinc-800 hover:ring-blue-500 transition-all',
            }
          }}
        />
      </div>
    </header>
  )
}
