'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'

interface DashboardShellProps {
  children: React.ReactNode
  enabledModules: string[]
  userRole: string | null
}

export function DashboardShell({ children, enabledModules, userRole }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar 
        enabledModules={enabledModules} 
        userRole={userRole} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 bg-zinc-950 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
