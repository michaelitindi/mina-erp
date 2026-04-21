import { checkModuleAccess } from '@/lib/module-access'
import { CRMModuleNav } from './crm-nav'

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user has access to CRM module
  await checkModuleAccess('CRM')
  
  return (
    <div className="flex flex-col min-h-full">
      <CRMModuleNav />
      <div className="flex-1 p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}

