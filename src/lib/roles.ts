/**
 * Role utilities for Clerk organization roles
 */

// Check if user is an admin
export const isAdmin = (role: string | undefined | null): boolean => {
  return role === 'org:admin'
}

// Check if user is a member
export const isMember = (role: string | undefined | null): boolean => {
  return role === 'org:member'
}

// Modules that are hidden from members (admin-only)
export const ADMIN_ONLY_MODULES = ['Settings', 'Reports'] as const

// Type for admin-only module names
export type AdminOnlyModule = typeof ADMIN_ONLY_MODULES[number]

// Check if a module is admin-only
export const isAdminOnlyModule = (moduleName: string): boolean => {
  return ADMIN_ONLY_MODULES.includes(moduleName as AdminOnlyModule)
}
