'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { search } from '@/app/actions/search'
import type { SearchResult } from '@/lib/search'

const typeIcons: Record<SearchResult['type'], string> = {
  customer: '👤',
  product: '📦',
  invoice: '🧾',
  employee: '👔',
  vendor: '🏭',
  opportunity: '💰',
}

const typeLabels: Record<SearchResult['type'], string> = {
  customer: 'Customer',
  product: 'Product',
  invoice: 'Invoice',
  employee: 'Employee',
  vendor: 'Vendor',
  opportunity: 'Opportunity',
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await search(query)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleResultClick = (link: string) => {
    setQuery('')
    setIsOpen(false)
    router.push(link)
  }

  // Group results by type
  const groupedResults = results.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = []
    acc[curr.type].push(curr)
    return acc;
  }, {} as Record<SearchResult['type'], SearchResult[]>)

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search customers, products, invoices, staff..."
          className="h-10 w-64 xl:w-80 rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-10 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-zinc-500" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 mt-2 w-72 md:w-96 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl backdrop-blur-md max-h-96 overflow-y-auto z-50">
          {loading && results.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500">No results found for &ldquo;{query}&rdquo;</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type} className="space-y-1">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 py-1">
                    {typeLabels[type as SearchResult['type']]}
                  </h3>
                  <div className="space-y-px">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleResultClick(item.link)}
                        className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-zinc-900 transition-colors group cursor-pointer"
                      >
                        <span className="text-sm shrink-0">{typeIcons[item.type]}</span>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
