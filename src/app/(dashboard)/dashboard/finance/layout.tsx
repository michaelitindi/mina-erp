import { checkModuleAccess } from '@/lib/module-access'
import { FinanceModuleNav } from './finance-nav'

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkModuleAccess('FINANCE')
  
  return (
    <div className="space-y-6">
      <FinanceModuleNav />
      <div>
        {children}
      </div>
    </div>
  )
}

