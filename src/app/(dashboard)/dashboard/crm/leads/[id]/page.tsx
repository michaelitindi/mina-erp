import { getLead } from '@/app/actions/leads'
import { getActivities } from '@/app/actions/activities'
import { redirect } from 'next/navigation'
import { 
  Users, 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  Calendar, 
  ChevronRight,
  User,
  ArrowLeft,
  Flame,
  Snowflake,
  Shield,
  TrendingUp,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ActivityTimeline } from '@/components/crm/activity-timeline'
import { ActivityLogButton } from '@/components/crm/activity-buttons'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const [lead, activities] = await Promise.all([
    getLead(id),
    getActivities({ leadId: id })
  ])

  if (!lead) redirect('/dashboard/crm/leads')

  const statusColors: Record<string, string> = {
    NEW: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
    CONTACTED: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20',
    QUALIFIED: 'text-green-400 bg-green-400/10 border-green-500/20',
    UNQUALIFIED: 'text-zinc-500 bg-zinc-500/10 border-zinc-700',
    CONVERTED: 'text-purple-400 bg-purple-400/10 border-purple-500/20',
  }

  const ratingIcons: Record<string, any> = {
    HOT: { icon: Flame, color: 'text-orange-500' },
    WARM: { icon: TrendingUp, color: 'text-yellow-500' },
    COLD: { icon: Snowflake, color: 'text-blue-500' },
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Link href="/dashboard/crm/leads" className="hover:text-white transition-colors">Leads</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-400">{lead.leadNumber}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{lead.firstName} {lead.lastName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ActivityLogButton leadId={lead.id} />
          <Link
            href="/dashboard/crm/leads"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status & Rating Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                statusColors[lead.status]
              )}>
                {lead.status}
              </span>
              {lead.rating && ratingIcons[lead.rating] && (
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const Icon = ratingIcons[lead.rating as string].icon
                    return <Icon className={cn("h-4 w-4", ratingIcons[lead.rating as string].color)} />
                  })()}
                  <span className="text-xs font-bold text-white">{lead.rating}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Lead Source</p>
                  <p className="text-sm font-bold text-white">{lead.source.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Est. Value</p>
                  <p className="text-sm font-bold text-white">${Number(lead.estimatedValue || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{lead.email}</p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">Email Address</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{lead.phone || 'Not provided'}</p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">Phone Number</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{lead.companyName || 'Individual'}</p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">Organization</p>
                </div>
              </div>
              {lead.pinNumber && (
                <div className="flex items-start gap-3 pt-2 border-t border-zinc-800">
                  <Shield className="h-4 w-4 text-blue-400 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-blue-400 font-mono tracking-wider">{lead.pinNumber}</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">KRA PIN (Kenya)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-sm backdrop-blur-sm">
            <div className="border-b border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Interaction History</h2>
              </div>
              <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase tracking-widest">
                {activities.length} Touchpoints
              </span>
            </div>
            <div className="p-6">
              <ActivityTimeline activities={activities as any} />
            </div>
          </div>

          {/* Notes Section */}
          {lead.notes && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Internal Notes</h3>
              <p className="text-sm text-zinc-400 leading-relaxed italic">"{lead.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
