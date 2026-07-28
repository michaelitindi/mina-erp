/**
 * Module Dependency Definitions and Resolver Utility
 */

export const MODULE_DEPENDENCIES: Record<string, string[]> = {
  MANUFACTURING: ['INVENTORY', 'PROCUREMENT', 'SALES', 'FINANCE'],
  SALES: ['INVENTORY', 'FINANCE', 'CRM'],
  PROCUREMENT: ['INVENTORY', 'FINANCE'],
  POS: ['SALES', 'INVENTORY', 'FINANCE'],
  ECOMMERCE: ['SALES', 'INVENTORY', 'FINANCE'],
  PROJECTS: ['FINANCE', 'CRM'],
  ASSETS: ['FINANCE'],
  HR: ['FINANCE'],
}

export function resolveModuleDependencies(selectedModules: string[]): string[] {
  const resolved = new Set<string>(selectedModules)
  selectedModules.forEach(mod => {
    const deps = MODULE_DEPENDENCIES[mod] || []
    deps.forEach(dep => resolved.add(dep))
  })
  return Array.from(resolved)
}
