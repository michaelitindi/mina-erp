import { describe, it, expect } from 'vitest'
import {
  getPaginationParams,
  buildPaginatedResult,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '@/lib/pagination'

describe('Pagination Utilities', () => {
  describe('getPaginationParams', () => {
    it('should use defaults when no params provided', () => {
      const result = getPaginationParams()
      expect(result.page).toBe(DEFAULT_PAGE)
      expect(result.limit).toBe(DEFAULT_LIMIT)
      expect(result.skip).toBe(0)
      expect(result.take).toBe(DEFAULT_LIMIT)
    })

    it('should calculate skip correctly', () => {
      const result = getPaginationParams(3, 20)
      expect(result.skip).toBe(40) // (3-1) * 20
      expect(result.take).toBe(20)
    })

    it('should enforce minimum page of 1', () => {
      const result = getPaginationParams(0, 20)
      expect(result.page).toBe(1)
      expect(result.skip).toBe(0)
    })

    it('should enforce maximum limit', () => {
      const result = getPaginationParams(1, 500)
      expect(result.limit).toBe(MAX_LIMIT)
      expect(result.take).toBe(MAX_LIMIT)
    })

    it('should enforce minimum limit of 1', () => {
      const result = getPaginationParams(1, 0)
      expect(result.limit).toBe(1)
    })
  })

  describe('buildPaginatedResult', () => {
    it('should build correct pagination metadata', () => {
      const items = [1, 2, 3, 4, 5]
      const result = buildPaginatedResult(items, 50, 1, 5)

      expect(result.items).toEqual(items)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(5)
      expect(result.pagination.total).toBe(50)
      expect(result.pagination.pages).toBe(10)
      expect(result.pagination.hasNext).toBe(true)
      expect(result.pagination.hasPrev).toBe(false)
    })

    it('should detect last page correctly', () => {
      const items = [1, 2]
      const result = buildPaginatedResult(items, 12, 6, 2)

      expect(result.pagination.page).toBe(6)
      expect(result.pagination.pages).toBe(6)
      expect(result.pagination.hasNext).toBe(false)
      expect(result.pagination.hasPrev).toBe(true)
    })

    it('should handle single page', () => {
      const items = [1, 2, 3]
      const result = buildPaginatedResult(items, 3, 1, 10)

      expect(result.pagination.pages).toBe(1)
      expect(result.pagination.hasNext).toBe(false)
      expect(result.pagination.hasPrev).toBe(false)
    })

    it('should handle empty results', () => {
      const result = buildPaginatedResult([], 0, 1, 10)

      expect(result.items).toEqual([])
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.pages).toBe(0)
    })
  })
})
