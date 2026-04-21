import { checkModuleAccess } from '@/lib/module-access'
import { FinanceModuleNav } from './finance-nav'

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkModuleAccess('FINANCE')
  
  return (
    <div className="flex flex-col min-h-full">
      <FinanceModuleNav />
      <div className="flex-1 p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}

