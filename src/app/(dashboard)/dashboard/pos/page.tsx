import { auth } from '@clerk/nextjs/server'
import { getActiveSession, getTerminals, getProductsForPOS } from '@/app/actions/pos'
import { POSTerminal } from './terminal'

export default async function POSPage() {
  const { orgRole } = await auth()
  const isAdmin = orgRole === 'org:admin'

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
    />
  )
}
