import { TableLoader, CardLoader } from '@/components/shared/loading'

export default function DashboardPageLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-32 animate-pulse rounded bg-slate-700" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-slate-700/50" />
      </div>
      
      {/* Stats cards skeleton */}
      <CardLoader />
      
      {/* Quick actions skeleton */}
      <div className="mt-8">
        <div className="h-6 w-28 animate-pulse rounded bg-slate-700 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 flex items-center gap-3"
            >
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-700" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
