/**
 * Search Utility
 * Provides full-text search functionality across different entities
 * Uses PostgreSQL's built-in text search capabilities
 */

import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

export interface SearchResult {
  type: 'customer' | 'product' | 'invoice' | 'employee' | 'vendor' | 'opportunity'
  id: string
  title: string
  subtitle: string
  link: string
  relevance?: number
}

export interface SearchOptions {
  query: string
  organizationId: string
  types?: SearchResult['type'][]
  limit?: number
}

/**
 * Global search across multiple entity types
 */
export async function globalSearch(options: SearchOptions): Promise<SearchResult[]> {
  const { query, organizationId, types, limit = 20 } = options
  
  if (!query || query.length < 2) return []

  const searchTerm = query.toLowerCase().trim()
  const results: SearchResult[] = []
  const perTypeLimit = Math.ceil(limit / (types?.length || 6))

  // Search Customers
  if (!types || types.includes('customer')) {
    const customers = await prisma.customer.findMany({
      where: {
        organizationId,
        deletedAt: null,
        OR: [
          { companyName: { contains: searchTerm, mode: 'insensitive' } },
          { contactPerson: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { customerNumber: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: perTypeLimit,
      select: { id: true, companyName: true, contactPerson: true, email: true },
    })

    results.push(...customers.map(c => ({
      type: 'customer' as const,
      id: c.id,
      title: c.companyName,
      subtitle: c.contactPerson || c.email,
      link: `/dashboard/crm/customers/${c.id}`,
    })))
  }

  // Search Products
  if (!types || types.includes('product')) {
    const products = await prisma.product.findMany({
      where: {
        organizationId,
        deletedAt: null,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { sku: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: perTypeLimit,
      select: { id: true, name: true, sku: true, sellingPrice: true },
    })

    results.push(...products.map(p => ({
      type: 'product' as const,
      id: p.id,
      title: p.name,
      subtitle: p.sku ? `SKU: ${p.sku}` : `$${Number(p.sellingPrice).toFixed(2)}`,
      link: `/dashboard/inventory/products/${p.id}`,
    })))
  }

  // Search Invoices
  if (!types || types.includes('invoice')) {
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        deletedAt: null,
        OR: [
          { invoiceNumber: { contains: searchTerm, mode: 'insensitive' } },
          { customer: { companyName: { contains: searchTerm, mode: 'insensitive' } } },
        ],
      },
      take: perTypeLimit,
      include: { customer: { select: { companyName: true } } },
    })

    results.push(...invoices.map(i => ({
      type: 'invoice' as const,
      id: i.id,
      title: i.invoiceNumber,
      subtitle: `${i.customer.companyName} - $${Number(i.totalAmount).toFixed(2)}`,
      link: `/dashboard/finance/invoices/${i.id}`,
    })))
  }

  // Search Employees
  if (!types || types.includes('employee')) {
    const employees = await prisma.employee.findMany({
      where: {
        organizationId,
        deletedAt: null,
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { employeeNumber: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: perTypeLimit,
      select: { id: true, firstName: true, lastName: true, department: true },
    })

    results.push(...employees.map(e => ({
      type: 'employee' as const,
      id: e.id,
      title: `${e.firstName} ${e.lastName}`,
      subtitle: e.department || 'Employee',
      link: `/dashboard/hr/employees/${e.id}`,
    })))
  }

  // Search Vendors
  if (!types || types.includes('vendor')) {
    const vendors = await prisma.vendor.findMany({
      where: {
        organizationId,
        deletedAt: null,
        OR: [
          { companyName: { contains: searchTerm, mode: 'insensitive' } },
          { contactPerson: { contains: searchTerm, mode: 'insensitive' } },
          { vendorNumber: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: perTypeLimit,
      select: { id: true, companyName: true, contactPerson: true },
    })

    results.push(...vendors.map(v => ({
      type: 'vendor' as const,
      id: v.id,
      title: v.companyName,
      subtitle: v.contactPerson || 'Vendor',
      link: `/dashboard/crm/vendors/${v.id}`,
    })))
  }

  // Search Opportunities
  if (!types || types.includes('opportunity')) {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        organizationId,
        deletedAt: null,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { customer: { companyName: { contains: searchTerm, mode: 'insensitive' } } },
        ],
      },
      take: perTypeLimit,
      include: { customer: { select: { companyName: true } } },
    })

    results.push(...opportunities.map(o => ({
      type: 'opportunity' as const,
      id: o.id,
      title: o.name,
      subtitle: `${o.customer.companyName} - $${Number(o.amount).toLocaleString()}`,
      link: `/dashboard/crm/opportunities/${o.id}`,
    })))
  }

  return results.slice(0, limit)
}

/**
 * Quick search for a specific entity type
 */
export async function quickSearch<T extends SearchResult['type']>(
  type: T,
  query: string,
  organizationId: string,
  limit: number = 10
): Promise<SearchResult[]> {
  return globalSearch({ query, organizationId, types: [type], limit })
}

/**
 * Type icons for UI display
 */
export const searchTypeIcons: Record<SearchResult['type'], string> = {
  customer: '👤',
  product: '📦',
  invoice: '🧾',
  employee: '👔',
  vendor: '🏭',
  opportunity: '💰',
}

/**
 * Type labels for UI display
 */
export const searchTypeLabels: Record<SearchResult['type'], string> = {
  customer: 'Customer',
  product: 'Product',
  invoice: 'Invoice',
  employee: 'Employee',
  vendor: 'Vendor',
  opportunity: 'Opportunity',
}
