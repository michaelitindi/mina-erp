import { checkModuleAccess } from '@/lib/module-access'
import { HRModuleNav } from './hr-nav'

export default async function HRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user has access to HR module
  await checkModuleAccess('HR')
  
  return (
    <div className="flex flex-col min-h-full">
      <HRModuleNav />
      <div className="flex-1 p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}

