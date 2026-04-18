import { checkModuleAccess } from '@/lib/module-access'
import { POSModuleNav } from './pos-nav'

export default async function POSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkModuleAccess('POS')
  
  return (
    <div className="space-y-6">
      <POSModuleNav />
      <div>
        {children}
      </div>
    </div>
  )
}
