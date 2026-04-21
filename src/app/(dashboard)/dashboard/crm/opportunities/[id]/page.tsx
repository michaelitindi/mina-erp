import { getOpportunity } from '@/app/actions/opportunities'
import { getActivities } from '@/app/actions/activities'
import { redirect } from 'next/navigation'
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  ChevronRight,
  ArrowLeft,
  Building2,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ActivityTimeline } from '@/components/crm/activity-timeline'
import { ActivityLogButton } from '@/components/crm/activity-buttons'

export default async function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const [opportunity, activities] = await Promise.all([
    getOpportunity(id),
    getActivities({ opportunityId: id })
  ])

  if (!opportunity) redirect('/dashboard/crm/opportunities')

  const weightedValue = Number(opportunity.amount) * (opportunity.probability / 100)

  const stageColors: Record<string, string> = {
    PROSPECTING: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
    QUALIFICATION: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20',
    PROPOSAL: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20',
    NEGOTIATION: 'text-orange-400 bg-orange-400/10 border-orange-500/20',
    CLOSED_WON: 'text-green-400 bg-green-400/10 border-green-500/20',
    CLOSED_LOST: 'text-red-400 bg-red-400/10 border-red-500/20',
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Link href="/dashboard/crm/opportunities" className="hover:text-white transition-colors">Opportunities</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-400">{opportunity.opportunityNumber}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{opportunity.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ActivityLogButton opportunityId={opportunity.id} />
          <Link
            href="/dashboard/crm/opportunities"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pipeline
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Deal Intelligence */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progression Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                stageColors[opportunity.stage]
              )}>
                {opportunity.stage.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-bold text-white">{opportunity.probability}% Prob.</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Total Amount</p>
                  <p className="text-lg font-black text-white">${Number(opportunity.amount).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Weighted Value</p>
                  <p className="text-lg font-black text-blue-400">${weightedValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Dates & Customer Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Deal Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/crm/customers/${opportunity.customerId}`} className="text-xs font-bold text-white hover:text-blue-400 transition-colors truncate block">
                    {opportunity.customer.companyName}
                  </Link>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">Linked Customer</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">
                    {opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'No date set'}
                  </p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">Expected Close</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{opportunity.source || 'Direct'}</p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">Opportunity Source</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interaction History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-sm backdrop-blur-sm">
            <div className="border-b border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Deal Activity</h2>
              </div>
              <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase tracking-widest">
                {activities.length} Interactions
              </span>
            </div>
            <div className="p-6">
              <ActivityTimeline activities={activities as any} />
            </div>
          </div>

          {/* Description & Internal Notes */}
          {(opportunity.description || opportunity.notes) && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
              <div className="space-y-6">
                {opportunity.description && (
                  <div>
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Requirement Summary</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed">{opportunity.description}</p>
                  </div>
                )}
                {opportunity.notes && (
                  <div className="pt-4 border-t border-zinc-800">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Deal Notes</h3>
                    <p className="text-sm text-zinc-400 italic">"{opportunity.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
