import { getWarehouses } from '@/app/actions/warehouses'
import { WarehousesTable } from '@/components/inventory/warehouses-table'
import { CreateWarehouseButton } from '@/components/inventory/warehouse-buttons'
import { Warehouse, MapPin, Package } from 'lucide-react'

export default async function WarehousesPage() {
  const warehouses = await getWarehouses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Warehouses</h1>
          <p className="text-zinc-500">Manage your storage locations</p>
        </div>
        <CreateWarehouseButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Warehouse className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Total Warehouses</p>
              <p className="text-2xl font-bold text-white">{warehouses.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <MapPin className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Active Locations</p>
              <p className="text-2xl font-bold text-white">{warehouses.filter((w: any) => w.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Package className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Products Stored</p>
              <p className="text-2xl font-bold text-white">{warehouses.reduce((sum: number, w: any) => sum + (w._count?.stockLevels || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {warehouses.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center shadow-sm backdrop-blur-sm">
          <Warehouse className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 text-lg font-semibold text-white">No warehouses yet</h3>
          <p className="mt-2 text-zinc-500">Add your first warehouse to start managing stock locations.</p>
          <div className="mt-6"><CreateWarehouseButton /></div>
        </div>
      ) : (
        <WarehousesTable warehouses={warehouses} />
      )}
    </div>
  )
}
