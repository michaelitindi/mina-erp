/**
 * Pagination utilities for MinaERP
 * 
 * Provides consistent pagination across all list queries.
 */

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 50
export const MAX_LIMIT = 100

/**
 * Get Prisma skip/take from page/limit
 */
export function getPaginationParams(page: number = DEFAULT_PAGE, limit: number = DEFAULT_LIMIT) {
  // Ensure valid values
  const validPage = Math.max(1, page)
  const validLimit = Math.min(MAX_LIMIT, Math.max(1, limit))

  return {
    skip: (validPage - 1) * validLimit,
    take: validLimit,
    page: validPage,
    limit: validLimit,
  }
}

/**
 * Build paginated result from items and total count
 */
export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const pages = Math.ceil(total / limit)

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  }
}

/**
 * Parse pagination from URL search params
 */
export function parsePaginationFromSearchParams(
  searchParams: URLSearchParams
): PaginationParams {
  const page = parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10)
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)

  return getPaginationParams(page, limit)
}
