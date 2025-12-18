import { getWarehouses } from '@/app/actions/warehouses'
import { WarehousesTable } from '@/components/inventory/warehouses-table'
import { CreateWarehouseButton } from '@/components/inventory/warehouse-buttons'
import { Warehouse, MapPin } from 'lucide-react'

export default async function WarehousesPage() {
  const warehouses = await getWarehouses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Warehouses</h1>
          <p className="text-slate-400">Manage your storage locations</p>
        </div>
        <CreateWarehouseButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><Warehouse className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-slate-400">Total Warehouses</p><p className="text-2xl font-bold text-white">{warehouses.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><MapPin className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-slate-400">Active Locations</p><p className="text-2xl font-bold text-white">{warehouses.filter(w => w.isActive).length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><Warehouse className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-sm text-slate-400">Products Stored</p><p className="text-2xl font-bold text-white">{warehouses.reduce((sum, w) => sum + (w._count?.stockLevels || 0), 0)}</p></div>
          </div>
        </div>
      </div>

      {warehouses.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <Warehouse className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">No warehouses yet</h3>
          <p className="mt-2 text-slate-400">Add your first warehouse to start managing stock locations.</p>
          <div className="mt-6"><CreateWarehouseButton /></div>
        </div>
      ) : (
        <WarehousesTable warehouses={warehouses} />
      )}
    </div>
  )
}
