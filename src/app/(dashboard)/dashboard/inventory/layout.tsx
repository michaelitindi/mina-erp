import { checkModuleAccess } from '@/lib/module-access'
import { InventoryModuleNav } from './inventory-nav'

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkModuleAccess('INVENTORY')
  
  return (
    <div className="flex flex-col min-h-full">
      <InventoryModuleNav />
      <div className="flex-1 p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}

