import { getSalesOrder, updateSalesOrderStatus } from '@/app/actions/sales-orders'
import { redirect } from 'next/navigation'
import { 
  ShoppingCart, 
  User, 
  Building2, 
  Calendar, 
  Clock, 
  ChevronRight,
  ArrowLeft,
  Package,
  Truck,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Ban
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SalesOrderStatusButtons } from '@/components/sales/order-status-buttons'

export default async function SalesOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const order = await getSalesOrder(id)

  if (!order) redirect('/dashboard/sales/orders')

  const statusColors: Record<string, string> = {
    DRAFT: 'text-zinc-500 bg-zinc-500/10 border-zinc-700',
    CONFIRMED: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
    PROCESSING: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20',
    SHIPPED: 'text-purple-400 bg-purple-400/10 border-purple-500/20',
    DELIVERED: 'text-green-400 bg-green-400/10 border-green-500/20',
    CANCELLED: 'text-red-400 bg-red-400/10 border-red-500/20',
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Link href="/dashboard/sales/orders" className="hover:text-white transition-colors">Sales Orders</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-400">{order.orderNumber}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            {order.orderNumber}
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border align-middle",
              statusColors[order.status]
            )}>
              {order.status}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <SalesOrderStatusButtons order={order} />
          <Link
            href="/dashboard/sales/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Order Intelligence */}
        <div className="lg:col-span-1 space-y-6">
          {/* Inventory Reservation Info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Fulfillment Data</h3>
              {order.stockReserved ? (
                <div className="flex items-center gap-1.5 text-green-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">Stock Reserved</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">Not Reserved</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Source Warehouse</p>
                  <p className="text-sm font-bold text-white">{order.warehouse?.name || 'No warehouse linked'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Order Date</p>
                  <p className="text-sm font-bold text-white">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Customer & Shipping</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/crm/customers/${order.customerId}`} className="text-sm font-bold text-white hover:text-blue-400 transition-colors block truncate">
                    {order.customer.companyName}
                  </Link>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase mt-0.5">Purchasing Entity</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t border-zinc-800 pt-4">
                <Truck className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-relaxed">
                    {order.shippingAddress || 'No address provided'}<br/>
                    {order.shippingCity}{order.shippingCity && order.shippingCountry ? ', ' : ''}{order.shippingCountry}
                  </p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase mt-1">Shipping Destination</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Line Items & Finance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-sm backdrop-blur-sm">
            <div className="border-b border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Package className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Order Line Items</h2>
              </div>
              <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase tracking-widest">
                {order.lineItems.length} Products
              </span>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/50">
                    <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product / SKU</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Quantity</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Unit Price</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {order.lineItems.map((item: any) => (
                    <tr key={item.id} className="group hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{item.description}</p>
                        <p className="text-[10px] font-black font-mono text-zinc-500 uppercase">{item.sku || 'NO SKU'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-white">{Number(item.quantity)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-zinc-400">${Number(item.unitPrice).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-white">${Number(item.lineTotal).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="bg-zinc-900/50 p-6 border-t border-zinc-800">
              <div className="flex flex-col md:flex-row md:items-end md:justify-end gap-8">
                <div className="space-y-1.5 text-right">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subtotal</p>
                  <p className="text-sm font-bold text-white">${Number(order.subtotal).toLocaleString()}</p>
                </div>
                <div className="space-y-1.5 text-right">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tax (VAT)</p>
                  <p className="text-sm font-bold text-white">${Number(order.taxAmount).toLocaleString()}</p>
                </div>
                <div className="space-y-1.5 text-right">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Shipping</p>
                  <p className="text-sm font-bold text-white">${Number(order.shippingAmount).toLocaleString()}</p>
                </div>
                <div className="space-y-1.5 text-right bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-2xl">
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none mb-1">Grand Total</p>
                  <p className="text-3xl font-black text-green-400 tracking-tighter">${Number(order.totalAmount).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          {order.notes && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Internal Notes</h3>
              <p className="text-sm text-zinc-400 leading-relaxed italic">"{order.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
