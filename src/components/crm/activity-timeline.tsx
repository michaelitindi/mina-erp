'use client'

import { 
  Phone, 
  Mail, 
  Users, 
  CheckSquare, 
  FileText, 
  Clock, 
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: string
  subject: string
  description?: string | null
  dueDate?: string | null
  status: string
  priority: string
  createdAt: string
  createdBy: string
}

interface ActivityTimelineProps {
  activities: Activity[]
}

const activityIcons: Record<string, any> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: CheckSquare,
  NOTE: FileText,
}

const typeColors: Record<string, string> = {
  CALL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  EMAIL: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  MEETING: 'bg-green-500/10 text-green-400 border-green-500/20',
  TASK: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  NOTE: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
        <div className="p-4 rounded-full bg-zinc-800 text-zinc-600 mb-4">
          <Clock className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white uppercase tracking-tight">No Interaction History</h3>
        <p className="text-sm text-zinc-500 max-w-xs mt-1">
          Start recording calls, emails, and meetings to see a timeline of your relationship.
        </p>
      </div>
    )
  }

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const formatShortDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-blue-500/50 before:via-zinc-800 before:to-zinc-800/0">
      {activities.map((activity, idx) => {
        const Icon = activityIcons[activity.type] || FileText
        const isCompleted = activity.status === 'COMPLETED'
        
        return (
          <div key={activity.id} className="relative flex items-start gap-6 group">
            {/* Timeline Dot & Icon */}
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 shadow-sm transition-all duration-300 z-10",
              isCompleted ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-zinc-900 border-zinc-800 text-zinc-500",
              "group-hover:scale-110 group-hover:border-blue-500/50 group-hover:text-blue-400"
            )}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content Card */}
            <div className="flex-1 space-y-2 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                    typeColors[activity.type]
                  )}>
                    {activity.type}
                  </span>
                  <h4 className="text-sm font-bold text-white">{activity.subject}</h4>
                </div>
                <time className="text-[10px] font-bold text-zinc-500 uppercase">
                  {formatDate(activity.createdAt)}
                </time>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-zinc-900 hover:border-zinc-700">
                {activity.description && (
                  <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{activity.description}</p>
                )}
                
                <div className="mt-4 flex items-center gap-4 pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status:</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1",
                      isCompleted ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                    )}>
                      {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      {activity.status}
                    </span>
                  </div>
                  
                  {activity.dueDate && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Due:</span>
                      <span className="text-[10px] font-black text-white bg-zinc-800 px-2 py-0.5 rounded-full">
                        {formatShortDate(activity.dueDate)}
                      </span>
                    </div>
                  )}

                  <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-zinc-600">
                    <span>By User {activity.createdBy.slice(-4)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
