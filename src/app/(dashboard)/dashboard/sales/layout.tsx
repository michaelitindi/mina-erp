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
    <div className="space-y-6">
      <SalesModuleNav />
      <div>
        {children}
      </div>
    </div>
  )
}

