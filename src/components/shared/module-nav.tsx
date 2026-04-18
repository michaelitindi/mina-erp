'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface ModuleNavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface ModuleNavProps {
  moduleName: string
  items: ModuleNavItem[]
}

export function ModuleNav({ moduleName, items }: ModuleNavProps) {
  const pathname = usePathname()

  return (
    <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-16 z-20">
      <div className="flex items-center gap-1 px-4 md:px-6 py-2 overflow-x-auto no-scrollbar">
        <span className="mr-4 text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">{moduleName}</span>
        <nav className="flex items-center gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
