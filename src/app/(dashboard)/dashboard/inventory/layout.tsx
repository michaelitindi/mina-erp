import { checkModuleAccess } from '@/lib/module-access'
import { InventoryModuleNav } from './inventory-nav'

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkModuleAccess('INVENTORY')
  
  return (
    <div className="space-y-6">
      <InventoryModuleNav />
      <div>
        {children}
      </div>
    </div>
  )
}

