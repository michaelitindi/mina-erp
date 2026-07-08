'use client'

import { ModuleNav } from '@/components/shared/module-nav'
import { ShoppingCart, History, Clock, Settings } from 'lucide-react'

const posNavItems = [
  { name: 'Terminal', href: '/dashboard/pos', icon: ShoppingCart },
  { name: 'Sales', href: '/dashboard/pos/sales', icon: History },
  { name: 'Shifts', href: '/dashboard/pos/shifts', icon: Clock },
  { name: 'Settings', href: '/dashboard/pos/settings', icon: Settings },
]

export function POSModuleNav() {
  return <ModuleNav moduleName="Point of Sale" items={posNavItems} />
}
