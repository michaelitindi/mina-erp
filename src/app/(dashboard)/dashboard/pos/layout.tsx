import { checkModuleAccess } from '@/lib/module-access'
import { POSModuleNav } from './pos-nav'

export default async function POSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkModuleAccess('POS')
  
  return (
    <div className="flex flex-col min-h-full">
      <POSModuleNav />
      <div className="flex-1 p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}
