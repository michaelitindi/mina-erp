'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOpportunityStage, deleteOpportunity } from '@/app/actions/opportunities'
import { Trash2, Target, TrendingUp, ChevronRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Opportunity {
  id: string
  opportunityNumber: string
  name: string
  customerId: string
  amount: number
  probability: number
  stage: string
  expectedCloseDate: Date | string | null
  customer: { companyName: string }
}

export function OpportunitiesTable({ opportunities }: { opportunities: Opportunity[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  const getAmount = (amt: number | { toNumber: () => number }): number => {
    if (typeof amt === 'number') return amt
    if (typeof amt.toNumber === 'function') return amt.toNumber()
    return 0
  }

  const stageColors: Record<string, string> = {
    PROSPECTING: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
    QUALIFICATION: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20',
    PROPOSAL: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20',
    NEGOTIATION: 'text-orange-400 bg-orange-400/10 border-orange-500/20',
    CLOSED_WON: 'text-green-400 bg-green-400/10 border-green-500/20',
    CLOSED_LOST: 'text-red-400 bg-red-400/10 border-red-500/20',
  }

  async function handleStageChange(id: string, stage: string) {
    setProcessingId(id)
    try {
      await updateOpportunityStage(id, stage)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this opportunity?')) return
    setProcessingId(id)
    try {
      await deleteOpportunity(id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-sm backdrop-blur-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Opportunity</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Customer</th>
            <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Amount</th>
            <th className="px-6 py-3 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Probability</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stage</th>
            <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {opportunities.map((opp) => (
            <tr key={opp.id} className="group hover:bg-zinc-800/30 transition-all duration-200">
              <td className="px-6 py-4">
                <Link href={`/dashboard/crm/opportunities/${opp.id}`} className="block group/link">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white group-hover/link:text-blue-400 transition-colors leading-tight">
                      {opp.name}
                    </p>
                    <ExternalLink className="h-3 w-3 text-zinc-600 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">
                    {opp.opportunityNumber}
                  </p>
                </Link>
              </td>
              <td className="px-6 py-4">
                <Link href={`/dashboard/crm/customers/${opp.customerId}`} className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                  {opp.customer.companyName}
                </Link>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-sm font-black text-white font-mono">
                  ${getAmount(opp.amount).toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500" 
                      style={{ width: `${opp.probability}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{opp.probability}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                  stageColors[opp.stage]
                )}>
                  {opp.stage.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleDelete(opp.id)}
                    disabled={processingId === opp.id}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete Opportunity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
