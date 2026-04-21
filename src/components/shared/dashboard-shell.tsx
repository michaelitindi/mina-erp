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
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar - Fixed width on large screens */}
      <Sidebar 
        enabledModules={enabledModules} 
        userRole={userRole} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 min-h-0 bg-zinc-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
