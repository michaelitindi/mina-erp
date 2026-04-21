import { checkModuleAccess } from '@/lib/module-access'
import { ProcurementModuleNav } from './procurement-nav'

export default async function ProcurementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkModuleAccess('PROCUREMENT')
  
  return (
    <div className="flex flex-col min-h-full">
      <ProcurementModuleNav />
      <div className="flex-1 p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}

