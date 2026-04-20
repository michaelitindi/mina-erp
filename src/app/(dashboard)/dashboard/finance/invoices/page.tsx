import { getInvoices } from '@/app/actions/invoices'
import { getCustomers } from '@/app/actions/customers'
import { InvoicesTable } from '@/components/finance/invoices-table'
import { CreateInvoiceButton } from '@/components/finance/invoice-buttons'
import { Receipt, DollarSign, Clock, CheckCircle } from 'lucide-react'

export default async function InvoicesPage() {
  const [invoicesResult, customersResult] = await Promise.all([
    getInvoices(),
    getCustomers()
  ])

  const invoices = invoicesResult.items
  const customers = customersResult.items

  const stats = {
    total: invoices.length,
    draft: invoices.filter((i: any) => i.status === 'DRAFT').length,
    sent: invoices.filter((i: any) => i.status === 'SENT').length,
    paid: invoices.filter((i: any) => i.status === 'PAID').length,
    overdue: invoices.filter((i: any) => i.status === 'OVERDUE').length,
    totalAmount: invoices.reduce((sum: number, i: any) => sum + Number(i.totalAmount), 0),
    paidAmount: invoices.filter((i: any) => i.status === 'PAID').reduce((sum: number, i: any) => sum + Number(i.totalAmount), 0),
    pendingAmount: invoices.filter((i: any) => ['DRAFT', 'SENT', 'OVERDUE'].includes(i.status)).reduce((sum: number, i: any) => sum + Number(i.totalAmount), 0),
  }


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-zinc-500">Manage your accounts receivable</p>
        </div>
        <CreateInvoiceButton customers={customers} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Receipt className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Total Invoices</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-white">${stats.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-white">${stats.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Paid</p>
              <p className="text-2xl font-bold text-white">${stats.paidAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center shadow-sm backdrop-blur-sm">
          <Receipt className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 text-lg font-semibold text-white">No invoices yet</h3>
          <p className="mt-2 text-zinc-500">
            Create your first invoice to start tracking revenue.
          </p>
          <div className="mt-6">
            <CreateInvoiceButton customers={customers} />
          </div>
        </div>
      ) : (
        <InvoicesTable invoices={invoices} />
      )}
    </div>
  )
}
