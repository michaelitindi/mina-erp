import { auth } from '@clerk/nextjs/server'
import { getActiveSession, getTerminals, getProductsForPOS } from '@/app/actions/pos'
import { POSTerminal } from './terminal'
import { prisma } from '@/lib/prisma'

export default async function POSPage() {
  const { orgRole, orgId } = await auth()
  const isAdmin = orgRole === 'org:admin'

  const org = orgId ? await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { currency: true }
  }) : null
  const currency = org?.currency || 'USD'

  const [session, terminals, products] = await Promise.all([
    getActiveSession(),
    getTerminals(),
    getProductsForPOS(),
  ])

  return (
    <POSTerminal 
      session={session} 
      terminals={terminals} 
      products={products} 
      isAdmin={isAdmin}
      currency={currency}
    />
  )
}
