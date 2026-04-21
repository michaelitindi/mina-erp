'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteLead, updateLeadStatus, convertLeadToCustomer } from '@/app/actions/leads'
import { Trash2, UserCheck, PhoneCall, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  leadNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  companyName: string | null
  source: string
  status: string
  rating: string | null
  estimatedValue: number | { toNumber: () => number } | null
  _count?: { activities: number }
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  const getAmount = (amt: number | { toNumber: () => number } | null): number => {
    if (amt === null) return 0
    if (typeof amt === 'number') return amt
    if (typeof amt.toNumber === 'function') return amt.toNumber()
    return 0
  }

  const statusColors: Record<string, string> = {
    NEW: 'text-blue-400 bg-blue-400/10',
    CONTACTED: 'text-yellow-400 bg-yellow-400/10',
    QUALIFIED: 'text-green-400 bg-green-400/10',
    UNQUALIFIED: 'text-zinc-500 bg-zinc-500/10',
    CONVERTED: 'text-purple-400 bg-purple-400/10',
  }

  const ratingIcons: Record<string, string> = {
    HOT: '🔥',
    WARM: '☀️',
    COLD: '❄️',
  }

  async function handleStatusChange(id: string, status: string) {
    setProcessingId(id)
    try { await updateLeadStatus(id, status); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to update') }
    finally { setProcessingId(null) }
  }

  async function handleConvert(id: string) {
    if (!confirm('Convert this lead to a customer?')) return
    setProcessingId(id)
    try { await convertLeadToCustomer(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to convert') }
    finally { setProcessingId(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lead?')) return
    setProcessingId(id)
    try { await deleteLead(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to delete') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-sm backdrop-blur-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lead Details</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contact</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Source</th>
            <th className="px-6 py-3 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rating</th>
            <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Est. Value</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
            <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {leads.map((lead) => (
            <tr key={lead.id} className="group hover:bg-zinc-800/30 transition-all duration-200">
              <td className="px-6 py-4">
                <Link href={`/dashboard/crm/leads/${lead.id}`} className="block">
                  <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">
                    {lead.leadNumber}
                  </p>
                </Link>
                {lead.companyName && <p className="text-xs text-zinc-600 mt-1">{lead.companyName}</p>}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-zinc-400">{lead.email}</p>
                {lead.phone && <p className="text-[10px] text-zinc-600 font-bold uppercase">{lead.phone}</p>}
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider">
                  {lead.source.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{lead.rating ? ratingIcons[lead.rating] : '—'}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-sm font-black text-white font-mono">
                  {getAmount(lead.estimatedValue) > 0 ? `$${getAmount(lead.estimatedValue).toLocaleString()}` : '—'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                  statusColors[lead.status]
                )}>
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {lead.status === 'NEW' && (
                    <button onClick={() => handleStatusChange(lead.id, 'CONTACTED')} disabled={processingId === lead.id} className="rounded-lg p-2 text-zinc-500 hover:bg-blue-600/20 hover:text-blue-400 transition-colors disabled:opacity-50" title="Mark Contacted">
                      <PhoneCall className="h-4 w-4" />
                    </button>
                  )}
                  {lead.status === 'CONTACTED' && (
                    <button onClick={() => handleStatusChange(lead.id, 'QUALIFIED')} disabled={processingId === lead.id} className="rounded-lg p-2 text-zinc-500 hover:bg-green-600/20 hover:text-green-400 transition-colors disabled:opacity-50" title="Mark Qualified">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {lead.status === 'QUALIFIED' && (
                    <button onClick={() => handleConvert(lead.id)} disabled={processingId === lead.id} className="rounded-lg p-2 text-zinc-500 hover:bg-purple-600/20 hover:text-purple-400 transition-colors disabled:opacity-50" title="Convert to Customer">
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}
                  {lead.status !== 'CONVERTED' && (
                    <button onClick={() => handleDelete(lead.id)} disabled={processingId === lead.id} className="rounded-lg p-2 text-zinc-500 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
