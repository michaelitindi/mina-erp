/**
 * Granular Role-Based Access Control (RBAC) permission capability matrix for MinaERP
 */

export type PermissionAction =
  | 'invoices:read'
  | 'invoices:create'
  | 'invoices:delete'
  | 'customers:read'
  | 'customers:create'
  | 'pos:checkout'
  | 'inventory:read'
  | 'inventory:adjust'
  | 'manufacturing:read'
  | 'manufacturing:create_bom'
  | 'manufacturing:work_order'
  | 'hr:read'
  | 'hr:payroll'

export const MODULE_PERMISSION_MAP: Record<PermissionAction, string> = {
  'invoices:read': 'FINANCE',
  'invoices:create': 'FINANCE',
  'invoices:delete': 'FINANCE',
  'customers:read': 'CRM',
  'customers:create': 'CRM',
  'pos:checkout': 'POS',
  'inventory:read': 'INVENTORY',
  'inventory:adjust': 'INVENTORY',
  'manufacturing:read': 'MANUFACTURING',
  'manufacturing:create_bom': 'MANUFACTURING',
  'manufacturing:work_order': 'MANUFACTURING',
  'hr:read': 'HR',
  'hr:payroll': 'HR',
}

export function hasPermission(enabledModules: string[], action: PermissionAction, isAdminUser: boolean = false): boolean {
  if (isAdminUser) return true
  const requiredModule = MODULE_PERMISSION_MAP[action]
  if (!requiredModule) return true
  return enabledModules.includes(requiredModule)
}
