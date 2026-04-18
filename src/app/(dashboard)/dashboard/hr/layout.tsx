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
    <div className="space-y-6">
      <HRModuleNav />
      <div>
        {children}
      </div>
    </div>
  )
}

