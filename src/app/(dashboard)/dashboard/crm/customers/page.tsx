import { getCustomers } from '@/app/actions/customers'
import { CustomersTable } from '@/components/crm/customers-table'
import { CreateCustomerButton } from '@/components/crm/customer-buttons'
import { Users, Building2 } from 'lucide-react'

export default async function CustomersPage() {
  const { items: customers, pagination } = await getCustomers()

  const activeCustomers = customers.filter((c: any) => c.status === 'ACTIVE')
  const totalInvoices = customers.reduce((sum: number, c: any) => sum + (c._count?.invoices || 0), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-zinc-500">Manage your customer relationships</p>
        </div>
        <CreateCustomerButton />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-white">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Building2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Active Customers</p>
              <p className="text-2xl font-bold text-white">{activeCustomers.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Total Invoices</p>
              <p className="text-2xl font-bold text-white">{totalInvoices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {customers.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center shadow-sm backdrop-blur-sm">
          <Users className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 text-lg font-semibold text-white">No customers yet</h3>
          <p className="mt-2 text-zinc-500">
            Get started by adding your first customer.
          </p>
          <div className="mt-6">
            <CreateCustomerButton />
          </div>
        </div>
      ) : (
        <CustomersTable customers={customers} />
      )}
    </div>
  )
}
