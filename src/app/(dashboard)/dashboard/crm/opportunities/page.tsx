import { getOpportunities, getOpportunityPipeline } from '@/app/actions/opportunities'
import { getCustomers } from '@/app/actions/customers'
import { OpportunitiesTable } from '@/components/crm/opportunities-table'
import { CreateOpportunityButton } from '@/components/crm/opportunity-buttons'
import { Target, DollarSign, TrendingUp, Trophy } from 'lucide-react'

export default async function OpportunitiesPage() {
  const [opportunities, pipeline, customersResult] = await Promise.all([
    getOpportunities(),
    getOpportunityPipeline(),
    getCustomers()
  ])

  const customers = customersResult.items

  const openOpps = opportunities.filter(o => !['CLOSED_WON', 'CLOSED_LOST'].includes(o.stage))
  const wonOpps = opportunities.filter(o => o.stage === 'CLOSED_WON')
  const totalValue = openOpps.reduce((sum, o) => sum + Number(o.amount), 0)
  const wonValue = wonOpps.reduce((sum, o) => sum + Number(o.amount), 0)
  const avgProbability = openOpps.length > 0 ? Math.round(openOpps.reduce((sum, o) => sum + o.probability, 0) / openOpps.length) : 0

  const weightedTotal = pipeline.reduce((sum, s) => sum + s.weightedAmount, 0)
  const rawTotal = pipeline.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
          <p className="text-zinc-500">Manage opportunities and sales forecasting</p>
        </div>
        <CreateOpportunityButton customers={customers} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><Target className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Open Deals</p><p className="text-2xl font-bold text-white">{openOpps.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2"><DollarSign className="h-5 w-5 text-emerald-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Expected Value</p><p className="text-2xl font-bold text-emerald-400">${weightedTotal.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-zinc-500/10 p-2"><PieChart className="h-5 w-5 text-zinc-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Pipeline Total</p><p className="text-2xl font-bold text-white">${rawTotal.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><TrendingUp className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Avg. Confidence</p><p className="text-2xl font-bold text-white">{avgProbability}%</p></div>
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-sm backdrop-blur-sm overflow-hidden">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
          <BarChart3 className="h-5 w-5 text-blue-500" /> Sales Funnel
        </h2>
        <div className="grid grid-cols-6 gap-3">
          {pipeline.map((stage) => {
            const stageColors: Record<string, string> = {
              PROSPECTING: 'border-zinc-700 bg-zinc-800/50 text-zinc-400',
              QUALIFICATION: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
              PROPOSAL: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
              NEGOTIATION: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
              CLOSED_WON: 'border-green-500/20 bg-green-500/5 text-green-400',
              CLOSED_LOST: 'border-red-500/20 bg-red-500/5 text-red-400',
            }
            return (
              <div key={stage.stage} className={`relative rounded-xl border p-4 transition-all hover:scale-105 shadow-sm group ${stageColors[stage.stage]}`}>
                <p className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-1">{stage.stage.replace('_', ' ')}</p>
                <div className="flex items-end justify-between gap-1">
                  <p className="text-2xl font-black text-white">{stage.count}</p>
                  <p className="text-[10px] font-bold opacity-40 group-hover:opacity-100 transition-opacity">Deals</p>
                </div>
                <div className="mt-4 pt-3 border-t border-current/10">
                  <p className="text-xs font-black text-white">${stage.amount.toLocaleString()}</p>
                  <p className="text-[9px] font-medium opacity-60 mt-0.5">Exp: ${stage.weightedAmount.toLocaleString()}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center shadow-sm backdrop-blur-sm">
          <Target className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 text-lg font-semibold text-white">No opportunities yet</h3>
          <p className="mt-2 text-zinc-500">Create your first opportunity to start building your pipeline.</p>
          <div className="mt-6"><CreateOpportunityButton customers={customers} /></div>
        </div>
      ) : (
        <OpportunitiesTable opportunities={opportunities} />
      )}
    </div>
  )
}
