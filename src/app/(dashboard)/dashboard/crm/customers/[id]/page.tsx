import { getCustomer } from '@/app/actions/customers'
import { getActivities } from '@/app/actions/activities'
import { redirect } from 'next/navigation'
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ChevronRight,
  ArrowLeft,
  Shield,
  CreditCard,
  FileText,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ActivityTimeline } from '@/components/crm/activity-timeline'
import { ActivityLogButton } from '@/components/crm/activity-buttons'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const [customer, activities] = await Promise.all([
    getCustomer(id),
    getActivities({ customerId: id })
  ])

  if (!customer) redirect('/dashboard/crm/customers')

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Link href="/dashboard/crm/customers" className="hover:text-white transition-colors">Customers</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-400">{customer.customerNumber}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{customer.companyName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ActivityLogButton customerId={customer.id} />
          <Link
            href="/dashboard/crm/customers"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Core Data */}
        <div className="lg:col-span-1 space-y-6">
          {/* Identity & Compliance Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                customer.customerType === 'BUSINESS' ? 'text-blue-400 bg-blue-400/10 border-blue-500/20' : 'text-purple-400 bg-purple-400/10 border-purple-500/20'
              )}>
                {customer.customerType}
              </span>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{customer.status}</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-blue-400 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-blue-400 font-mono tracking-wider">{customer.pinNumber || 'Not Configured'}</p>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mt-1">KRA PIN (Kenya Compliance)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-4 border-t border-zinc-800/50">
                <CreditCard className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{customer.paymentTerms || 'Standard'}</p>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mt-1">Payment Terms</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">${Number(customer.creditLimit || 0).toLocaleString()}</p>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mt-1">Credit Limit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Contact & Location</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{customer.email}</p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">Primary Email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{customer.phone || '—'}</p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">Contact Number</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-zinc-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white leading-relaxed">
                    {customer.address || 'No address provided'}<br/>
                    {customer.city}{customer.city && customer.country ? ', ' : ''}{customer.country}
                  </p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase mt-1">Mailing Address</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interaction History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-sm backdrop-blur-sm">
            <div className="border-b border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Activity Log</h2>
              </div>
              <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase tracking-widest">
                {activities.length} Events
              </span>
            </div>
            <div className="p-6">
              <ActivityTimeline activities={activities as any} />
            </div>
          </div>

          {/* Recent Invoices Quick View */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Recent Invoices</h3>
              <Link href="/dashboard/finance/invoices" className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">View All Invoices</Link>
            </div>
            
            {customer.invoices && customer.invoices.length > 0 ? (
              <div className="space-y-3">
                {customer.invoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/50">
                    <div>
                      <p className="text-sm font-bold text-white">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">{new Date(inv.invoiceDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">${Number(inv.totalAmount).toLocaleString()}</p>
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
                <FileText className="h-8 w-8 text-zinc-700 mb-2" />
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">No financial history found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
