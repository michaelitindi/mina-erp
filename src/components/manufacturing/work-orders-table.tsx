'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateWorkOrderStatus } from '@/app/actions/manufacturing'
import { PlayCircle, CheckCircle, XCircle } from 'lucide-react'

interface WorkOrder {
  id: string
  workOrderNumber: string
  status: string
  priority: string
  quantity: number | { toNumber: () => number }
  bom?: { bomNumber: string; name: string } | null
}

const getQty = (qty: number | { toNumber: () => number }): number => typeof qty === 'number' ? qty : qty?.toNumber?.() || 0

export function WorkOrdersTable({ workOrders }: { workOrders: WorkOrder[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  async function handleStatusChange(id: string, status: string) {
    setProcessingId(id)
    setErrorMessage(null)
    try {
      await updateWorkOrderStatus(id, status)
      router.refresh()
    } catch (err: any) {
      console.error('Work order update error:', err)
      setErrorMessage(err.message || 'Failed to update manufacturing order')
    } finally {
      setProcessingId(null)
    }
  }

  const statusColors: Record<string, string> = {
    PLANNED: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
    IN_PROGRESS: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
    COMPLETED: 'text-green-400 bg-green-400/10 border border-green-400/20',
    CANCELLED: 'text-red-400 bg-red-400/10 border border-red-400/20',
  }

  const priorityColors: Record<string, string> = {
    LOW: 'text-zinc-500',
    MEDIUM: 'text-blue-400',
    HIGH: 'text-orange-400',
    CRITICAL: 'text-red-400',
  }

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-zinc-500 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {workOrders.slice(0, 10).map(wo => (
        <div key={wo.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white font-mono">{wo.workOrderNumber}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityColors[wo.priority]}`}>{wo.priority}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{wo.bom?.name || 'Demand Manufacturing Order'}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-zinc-400 font-mono">Qty: {getQty(wo.quantity)}</span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${statusColors[wo.status] || statusColors.PLANNED}`}>
              {wo.status.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-2">
              {wo.status === 'PLANNED' && (
                <button 
                  onClick={() => handleStatusChange(wo.id, 'IN_PROGRESS')} 
                  disabled={processingId === wo.id} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Start Production</span>
                </button>
              )}
              {wo.status === 'IN_PROGRESS' && (
                <button 
                  onClick={() => handleStatusChange(wo.id, 'COMPLETED')} 
                  disabled={processingId === wo.id} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Complete & Credit Stock</span>
                </button>
              )}
              {(wo.status === 'PLANNED' || wo.status === 'IN_PROGRESS') && (
                <button 
                  onClick={() => handleStatusChange(wo.id, 'CANCELLED')} 
                  disabled={processingId === wo.id} 
                  className="p-1.5 text-zinc-500 hover:text-red-400 disabled:opacity-50 transition-colors cursor-pointer" 
                  title="Cancel Order"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
