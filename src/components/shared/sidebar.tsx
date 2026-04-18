'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { isAdmin, ADMIN_ONLY_MODULES } from '@/lib/roles'
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
  User2,
  X,
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
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, moduleKey: null }, // Admin only
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, moduleKey: null }, // Admin only
]

interface SidebarProps {
  enabledModules?: string[]
  userRole?: string | null
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ enabledModules, userRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const userIsAdmin = isAdmin(userRole)

  // Filter navigation based on enabled modules AND user role
  const filteredNavigation = navigation.filter(item => {
    // Check if admin-only module (Settings, Reports)
    if (ADMIN_ONLY_MODULES.includes(item.name as typeof ADMIN_ONLY_MODULES[number])) {
      if (!userIsAdmin) return false // Hide from non-admins
    }
    
    // Check module enablement
    return item.moduleKey === null || // Always show items without moduleKey (if passed role check)
      !enabledModules || // Show all if no modules specified
      enabledModules.includes(item.moduleKey)
  })
  
  const isMyPortalActive = pathname.startsWith('/dashboard/my-portal')

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <span className="text-xl font-semibold text-white">MinaERP</span>
            </Link>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="lg:hidden p-2 text-zinc-500 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent'
                  )}
                  onClick={onClose}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          {/* My Portal - Always visible at bottom */}
          <div className="border-t border-zinc-800 px-3 py-3">
            <Link
              href="/dashboard/my-portal"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isMyPortalActive
                  ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent'
              )}
              onClick={onClose}
            >
              <User2 className="h-5 w-5" />
              My Portal
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}


