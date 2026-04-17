import { getBills } from '@/app/actions/bills'
import { getVendors } from '@/app/actions/vendors'
import { BillsTable } from '@/components/finance/bills-table'
import { CreateBillButton } from '@/components/finance/bill-buttons'
import { CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react'

export default async function BillsPage() {
  const [bills, vendorsResult] = await Promise.all([getBills(), getVendors()])
  const vendors = vendorsResult.items

  const stats = {
    total: bills.length,
    draft: bills.filter(b => b.status === 'DRAFT').length,
    approved: bills.filter(b => b.status === 'APPROVED').length,
    paid: bills.filter(b => b.status === 'PAID').length,
    totalAmount: bills.reduce((sum, b) => sum + Number(b.totalAmount), 0),
    paidAmount: bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.totalAmount), 0),
    pendingAmount: bills.filter(b => ['DRAFT', 'APPROVED', 'OVERDUE'].includes(b.status)).reduce((sum, b) => sum + Number(b.totalAmount), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bills</h1>
          <p className="text-zinc-500">Manage your accounts payable</p>
        </div>
        <CreateBillButton vendors={vendors} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2"><CreditCard className="h-5 w-5 text-orange-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Total Bills</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2"><DollarSign className="h-5 w-5 text-red-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Total Payable</p><p className="text-2xl font-bold text-white">${stats.totalAmount.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2"><Clock className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Pending</p><p className="text-2xl font-bold text-white">${stats.pendingAmount.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><CheckCircle className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-zinc-500 font-medium">Paid</p><p className="text-2xl font-bold text-white">${stats.paidAmount.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center shadow-sm backdrop-blur-sm">
          <CreditCard className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 text-lg font-semibold text-white">No bills yet</h3>
          <p className="mt-2 text-zinc-500">Record your first bill to start tracking expenses.</p>
          <div className="mt-6"><CreateBillButton vendors={vendors} /></div>
        </div>
      ) : (
        <BillsTable bills={bills} />
      )}
    </div>
  )
}
