'use client'

import { UserButton, OrganizationSwitcher } from '@clerk/nextjs'
import { Bell, Search, Menu } from 'lucide-react'

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
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-64 xl:w-80 rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
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
        <button className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-zinc-950"></span>
        </button>

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
