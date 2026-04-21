import { checkModuleAccess } from '@/lib/module-access'
import { SalesModuleNav } from './sales-nav'

export default async function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user has access to SALES module
  await checkModuleAccess('SALES')
  
  return (
    <div className="flex flex-col min-h-full">
      <SalesModuleNav />
      <div className="flex-1 p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}

