import { getProductDetails } from '@/app/actions/products'
import { 
  Package, 
  ArrowLeft, 
  DollarSign, 
  Receipt, 
  Settings, 
  AlertTriangle,
  History,
  ShoppingCart,
  Wrench,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { orgId } = await auth()
  const org = orgId ? await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { currency: true }
  }) : null
  const currency = org?.currency || 'USD'

  const data = await getProductDetails(id)
  const product = data.product
  const salesOrders = data.salesOrders
  const bomsAsFinished = data.bomsAsFinished
  const bomsAsComponent = data.bomsAsComponent
  const workOrders = data.workOrders
  const stockMovements = data.stockMovements

  const totalStock = product.stockLevels.reduce((sum: number, sl: any) => sum + Number(sl.quantity), 0)
  const totalReserved = product.stockLevels.reduce((sum: number, sl: any) => sum + Number(sl.reservedQty), 0)
  const totalAvailable = product.stockLevels.reduce((sum: number, sl: any) => sum + Number(sl.availableQty), 0)

  return (
    <div className="space-y-6">
      {/* Back button & Page Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/inventory/products"
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          <p className="text-zinc-500 font-mono text-sm">{product.sku}</p>
        </div>
      </div>

      {/* Main product stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Physical Stock</p>
              <p className="text-xl font-bold text-white">{totalStock}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Reserved Stock</p>
              <p className="text-xl font-bold text-white">{totalReserved}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Package className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Available Stock</p>
              <p className="text-xl font-bold text-green-400">{totalAvailable}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <DollarSign className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Selling Price</p>
              <p className="text-xl font-bold text-white">{formatCurrency(Number(product.sellingPrice), currency)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Stock location, Sales history, Manufacturing */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stock by location */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-zinc-400" />
              Stock Levels by Warehouse
            </h2>
            {product.stockLevels.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-sm">
                No stock registered in any warehouse location.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500">
                      <th className="pb-2 font-medium">Warehouse</th>
                      <th className="pb-2 font-medium text-right">Physical Qty</th>
                      <th className="pb-2 font-medium text-right">Reserved Qty</th>
                      <th className="pb-2 font-medium text-right">Available Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {product.stockLevels.map((sl: any) => (
                      <tr key={sl.id} className="hover:bg-zinc-800/10">
                        <td className="py-2.5">
                          <Link 
                            href={`/dashboard/inventory/warehouses/${sl.warehouseId}`}
                            className="font-medium text-white hover:text-blue-400 transition-colors"
                          >
                            {sl.warehouse.name}
                          </Link>
                          <p className="text-xs text-zinc-500 font-mono mt-0.5">{sl.warehouse.code}</p>
                        </td>
                        <td className="py-2.5 text-right font-mono text-white">{Number(sl.quantity)}</td>
                        <td className="py-2.5 text-right font-mono text-zinc-500">{Number(sl.reservedQty)}</td>
                        <td className="py-2.5 text-right font-mono text-green-400 font-bold">{Number(sl.availableQty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sales History (Link to CRM / Sales Orders) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-zinc-400" />
              Sales History
            </h2>
            {salesOrders.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-sm">
                No sales orders logged for this product.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500">
                      <th className="pb-2 font-medium">Order</th>
                      <th className="pb-2 font-medium">Customer</th>
                      <th className="pb-2 font-medium text-right">Qty Sold</th>
                      <th className="pb-2 font-medium text-right">Price</th>
                      <th className="pb-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {salesOrders.map((so: any) => (
                      <tr key={so.id} className="hover:bg-zinc-800/10">
                        <td className="py-2.5">
                          <Link 
                            href={`/dashboard/sales/orders/${so.salesOrderId}`}
                            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {so.salesOrder.orderNumber}
                          </Link>
                        </td>
                        <td className="py-2.5 text-zinc-300 truncate max-w-[150px]">{so.salesOrder.customer.companyName}</td>
                        <td className="py-2.5 text-right font-mono text-white">{Number(so.quantity)}</td>
                        <td className="py-2.5 text-right font-mono text-zinc-400">{formatCurrency(Number(so.unitPrice), currency)}</td>
                        <td className="py-2.5 text-right">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            so.salesOrder.status === 'DELIVERED' 
                              ? 'text-green-400 bg-green-400/10 border border-green-500/20' 
                              : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                          }`}>
                            {so.salesOrder.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Manufacturing Links (BOMs & Production orders) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-zinc-400" />
              Manufacturing & BOM Association
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* BOM associations */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Bill of Materials</h3>
                
                {bomsAsFinished.length === 0 && bomsAsComponent.length === 0 ? (
                  <p className="text-xs text-zinc-500">This product is not linked to any BOMs.</p>
                ) : (
                  <div className="space-y-2">
                    {bomsAsFinished.map((bom: any) => (
                      <div key={bom.id} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 flex flex-col justify-between gap-1">
                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">FINISHED PRODUCT</span>
                        <div className="flex items-center justify-between">
                          <Link href="/dashboard/manufacturing" className="text-xs font-bold text-white hover:text-blue-400 truncate">
                            {bom.name}
                          </Link>
                          <span className="text-xs text-zinc-500 font-mono">{bom.bomNumber}</span>
                        </div>
                      </div>
                    ))}
                    {bomsAsComponent.map((comp: any) => (
                      <div key={comp.id} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 flex flex-col justify-between gap-1">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">BOM COMPONENT ({Number(comp.quantity)} qty)</span>
                        <div className="flex items-center justify-between">
                          <Link href="/dashboard/manufacturing" className="text-xs font-bold text-white hover:text-blue-400 truncate">
                            Produces {comp.bom.product?.name || 'Finished Product'}
                          </Link>
                          <span className="text-xs text-zinc-500 font-mono">{comp.bom.bomNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work orders */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Work Orders</h3>
                {workOrders.length === 0 ? (
                  <p className="text-xs text-zinc-500">No active work orders producing this product.</p>
                ) : (
                  <div className="space-y-2">
                    {workOrders.map((wo: any) => (
                      <div key={wo.id} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{wo.workOrderNumber}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Qty: {Number(wo.completedQty)}/{Number(wo.quantity)}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          wo.status === 'COMPLETED' 
                            ? 'text-green-400 bg-green-400/10 border border-green-500/20' 
                            : wo.status === 'IN_PROGRESS'
                              ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                              : 'text-zinc-500 bg-zinc-500/10 border border-zinc-500/20'
                        }`}>
                          {wo.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Product Details & Stock Movements */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-zinc-400" />
              Specifications
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-zinc-850">
                <span className="text-zinc-500 font-medium">Category</span>
                <span className="text-white font-semibold">{product.category || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-850">
                <span className="text-zinc-500 font-medium">Type</span>
                <span className="text-white font-semibold">{product.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-850">
                <span className="text-zinc-500 font-medium">Unit</span>
                <span className="text-white font-semibold">{product.unit}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-850">
                <span className="text-zinc-500 font-medium">Cost Price</span>
                <span className="text-white font-mono font-semibold">{formatCurrency(Number(product.costPrice), currency)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-850">
                <span className="text-zinc-500 font-medium">Reorder Alert Level</span>
                <span className="text-orange-400 font-semibold">{product.reorderLevel} qty</span>
              </div>
              {product.barcode && (
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-500 font-medium">Barcode</span>
                  <span className="text-white font-mono">{product.barcode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stock Movements */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-zinc-400" />
              Stock Move History
            </h2>
            {stockMovements.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No movements logged yet.</p>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {stockMovements.map((move: any) => {
                  const isIncoming = move.type === 'IN'
                  return (
                    <div key={move.id} className="flex gap-3 pb-3 border-b border-zinc-850 last:border-0 last:pb-0">
                      <div className={`p-1.5 rounded-lg border h-fit ${isIncoming ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {isIncoming ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white uppercase tracking-wider">{move.reason || move.type}</p>
                          <span className={`text-xs font-mono font-bold ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
                            {isIncoming ? '+' : ''}{Number(move.quantity)}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{move.movementNumber}</p>
                        {move.notes && <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{move.notes}</p>}
                        <p className="text-[9px] text-zinc-600 mt-1">{new Date(move.createdAt).toLocaleDateString()}</p>
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
