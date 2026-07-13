import { getWarehouseDetails } from '@/app/actions/warehouses'
import { Warehouse, MapPin, Package, ArrowLeft, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export default async function WarehouseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { orgId } = await auth()
  const org = orgId ? await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { currency: true }
  }) : null
  const currency = org?.currency || 'USD'

  const data = await getWarehouseDetails(id)
  const wh = data.warehouse
  const stockLevels = data.stockLevels
  const movements = data.stockMovements

  return (
    <div className="space-y-6">
      {/* Back button & Page Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/inventory/warehouses"
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{wh.name}</h1>
            {wh.isDefault && (
              <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 border border-yellow-500/20">
                DEFAULT
              </span>
            )}
          </div>
          <p className="text-zinc-500 font-mono text-sm">{wh.code}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Distinct Products Stored</p>
              <p className="text-xl font-bold text-white">{stockLevels.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <MapPin className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Location</p>
              <p className="text-sm font-semibold text-white truncate">
                {[wh.address, wh.city, wh.country].filter(Boolean).join(', ') || 'Address unconfigured'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Warehouse className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Status</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${wh.isActive ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-500/10'}`}>
                {wh.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Stock Levels */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-zinc-400" />
              Current Stock Levels
            </h2>
            {stockLevels.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No inventory stored in this location yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500">
                      <th className="pb-3 font-medium">Product</th>
                      <th className="pb-3 font-medium text-right">Physical Qty</th>
                      <th className="pb-3 font-medium text-right">Reserved Qty</th>
                      <th className="pb-3 font-medium text-right">Available Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {stockLevels.map((sl: any) => (
                      <tr key={sl.id} className="hover:bg-zinc-800/10">
                        <td className="py-3 pr-4">
                          <Link 
                            href={`/dashboard/inventory/products/${sl.productId}`}
                            className="font-medium text-white hover:text-blue-400 transition-colors"
                          >
                            {sl.product.name}
                          </Link>
                          <p className="text-xs text-zinc-500 font-mono mt-0.5">{sl.product.sku}</p>
                        </td>
                        <td className="py-3 text-right text-white font-mono">{Number(sl.quantity)}</td>
                        <td className="py-3 text-right text-zinc-500 font-mono">{Number(sl.reservedQty)}</td>
                        <td className="py-3 text-right text-green-400 font-mono font-bold">{Number(sl.availableQty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Stock Movements Log */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-400" />
              Stock Movements
            </h2>
            {movements.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No stock transactions logged for this warehouse.
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {movements.map((move: any) => {
                  const isIncoming = move.toWarehouseId === id
                  const isTransfer = move.fromWarehouseId && move.toWarehouseId
                  
                  return (
                    <div key={move.id} className="flex items-start gap-3 border-b border-zinc-850 pb-3 last:border-0 last:pb-0">
                      <div className={`mt-0.5 p-1 rounded-lg border ${
                        isTransfer 
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                          : isIncoming
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {isIncoming ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-white font-bold truncate">
                            {move.product.name}
                          </p>
                          <span className={`text-xs font-mono font-bold shrink-0 ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
                            {isIncoming ? '+' : ''}{Number(move.quantity)}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase mt-0.5">
                          {move.reason || move.type} • {move.movementNumber}
                        </p>
                        {move.notes && (
                          <p className="text-[10px] text-zinc-400 italic mt-1 leading-relaxed">
                            {move.notes}
                          </p>
                        )}
                        <p className="text-[9px] text-zinc-600 font-medium mt-1">
                          {new Date(move.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
