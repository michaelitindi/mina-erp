'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  UserCircle,
  BarChart3,
  Settings,
  Wallet,
  ShoppingBag,
  HardDrive,
  FolderKanban,
  FolderOpen,
  Cog,
  Store,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, moduleKey: null }, // Always visible
  { name: 'Finance', href: '/dashboard/finance/accounts', icon: Wallet, moduleKey: 'FINANCE' },
  { name: 'CRM', href: '/dashboard/crm/customers', icon: Users, moduleKey: 'CRM' },
  { name: 'Sales', href: '/dashboard/sales/orders', icon: ShoppingCart, moduleKey: 'SALES' },
  { name: 'Inventory', href: '/dashboard/inventory/products', icon: Package, moduleKey: 'INVENTORY' },
  { name: 'Procurement', href: '/dashboard/procurement/purchase-orders', icon: ShoppingBag, moduleKey: 'PROCUREMENT' },
  { name: 'HR', href: '/dashboard/hr/employees', icon: UserCircle, moduleKey: 'HR' },
  { name: 'Assets', href: '/dashboard/assets', icon: HardDrive, moduleKey: 'ASSETS' },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, moduleKey: 'PROJECTS' },
  { name: 'Documents', href: '/dashboard/documents', icon: FolderOpen, moduleKey: 'DOCUMENTS' },
  { name: 'Manufacturing', href: '/dashboard/manufacturing', icon: Cog, moduleKey: 'MANUFACTURING' },
  { name: 'E-Commerce', href: '/dashboard/ecommerce', icon: Store, moduleKey: 'ECOMMERCE' },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, moduleKey: null }, // Always visible
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, moduleKey: null }, // Always visible
]

interface SidebarProps {
  enabledModules?: string[]
}

export function Sidebar({ enabledModules }: SidebarProps) {
  const pathname = usePathname()

  // Filter navigation based on enabled modules
  const filteredNavigation = navigation.filter(item => 
    item.moduleKey === null || // Always show items without moduleKey
    !enabledModules || // Show all if no modules specified
    enabledModules.includes(item.moduleKey)
  )

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-700 bg-slate-800/50 backdrop-blur-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-700 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-lg font-bold text-white">E</span>
            </div>
            <span className="text-xl font-semibold text-white">ERP System</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNavigation.map((item) => {
            // Check if current page is within this module's section
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href.split('/').slice(0, 4).join('/')))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

