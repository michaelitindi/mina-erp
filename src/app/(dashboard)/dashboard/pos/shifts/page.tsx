import { getSessions, getActiveSession, getTerminals } from '@/app/actions/pos'
import { ShiftsClient } from './shifts-client'

export default async function POSShiftsPage() {
  const [sessions, activeSession, terminals] = await Promise.all([
    getSessions(),
    getActiveSession(),
    getTerminals(),
  ])

  return (
    <ShiftsClient 
      sessions={sessions} 
      activeSession={activeSession} 
      terminals={terminals} 
    />
  )
}
