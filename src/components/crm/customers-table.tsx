'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCustomer } from '@/app/actions/customers'
import { Trash2, Building2, User, Shield, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Customer {
  id: string
  customerNumber: string
  companyName: string
  email: string
  phone: string | null
  customerType: string
  status: string
  pinNumber: string | null
  _count?: { invoices: number }
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Delete this customer? This cannot be undone if they have no invoices.')) return
    setIsDeleting(id)
    try {
      await deleteCustomer(id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-sm backdrop-blur-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Identity</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Compliance</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Type</th>
            <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Invoices</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
            <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {customers.map((customer) => (
            <tr key={customer.id} className="group hover:bg-zinc-800/30 transition-all duration-200">
              <td className="px-6 py-4">
                <Link href={`/dashboard/crm/customers/${customer.id}`} className="block group/link">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white group-hover/link:text-blue-400 transition-colors leading-tight">
                      {customer.companyName}
                    </p>
                    <ExternalLink className="h-3 w-3 text-zinc-600 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">
                    {customer.customerNumber} • {customer.email}
                  </p>
                </Link>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  <Shield className={cn("h-3.5 w-3.5", customer.pinNumber ? "text-blue-400" : "text-zinc-700")} />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest font-mono",
                    customer.pinNumber ? "text-zinc-300" : "text-zinc-600"
                  )}>
                    {customer.pinNumber || 'NO PIN'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                  customer.customerType === 'BUSINESS' ? 'text-blue-400 bg-blue-400/10 border-blue-500/20' : 'text-purple-400 bg-purple-400/10 border-purple-500/20'
                )}>
                  {customer.customerType}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-sm font-black text-white font-mono">
                  {customer._count?.invoices || 0}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                  {customer.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleDelete(customer.id)}
                    disabled={isDeleting === customer.id}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete Customer"
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
