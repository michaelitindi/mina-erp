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
    <div className="space-y-6">
      <CRMModuleNav />
      <div>
        {children}
      </div>
    </div>
  )
}

