import { ReactNode } from 'react'
import { isAdmin } from '@/lib/roles'

interface AdminOnlyProps {
  children: ReactNode
  role: string | undefined | null
  fallback?: ReactNode
}

/**
 * Wrapper component that only renders children if user is an admin.
 * Use this to hide admin-only actions like delete buttons.
 * 
 * @example
 * <AdminOnly role={userRole}>
 *   <DeleteButton onClick={handleDelete} />
 * </AdminOnly>
 */
export function AdminOnly({ children, role, fallback = null }: AdminOnlyProps) {
  if (!isAdmin(role)) {
    return <>{fallback}</>
  }
  return <>{children}</>
}

/**
 * Wrapper component that only renders children if user is a member (not admin).
 * Use for member-specific UI elements.
 */
export function MemberOnly({ children, role, fallback = null }: AdminOnlyProps) {
  if (isAdmin(role)) {
    return <>{fallback}</>
  }
  return <>{children}</>
}
