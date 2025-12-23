export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-slate-600 border-t-blue-500`}
      />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer ring */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          {/* Inner pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-blue-500/20" />
          </div>
        </div>
        <p className="text-sm text-slate-400 animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

export function TableLoader() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-700/50" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-700/50" />
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/30 overflow-hidden">
        <div className="border-b border-slate-700 bg-slate-800 px-6 py-3">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 flex-1 animate-pulse rounded bg-slate-700" />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5].map(row => (
          <div key={row} className="border-b border-slate-700/50 px-6 py-4">
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i} 
                  className="h-4 flex-1 animate-pulse rounded bg-slate-700/50"
                  style={{ animationDelay: `${row * 100}ms` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardLoader() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map(i => (
        <div 
          key={i} 
          className="rounded-xl border border-slate-700 bg-slate-800/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-700" />
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-700" />
          </div>
          <div className="mt-4 h-8 w-24 animate-pulse rounded bg-slate-700" />
          <div className="mt-2 h-3 w-16 animate-pulse rounded bg-slate-700/50" />
        </div>
      ))}
    </div>
  )
}
