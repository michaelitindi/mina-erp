import { TableLoader, CardLoader } from '@/components/shared/loading'

export default function ModuleLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 animate-pulse rounded bg-slate-700" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-700/50" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-700" />
      </div>
      
      {/* Stats cards */}
      <CardLoader />
      
      {/* Table */}
      <TableLoader />
    </div>
  )
}
