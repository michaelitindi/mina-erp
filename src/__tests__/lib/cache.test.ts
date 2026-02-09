/**
 * Cache Tests
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock the cache module fresh for each test
let cache: typeof import('@/lib/cache').cache
let cacheKeys: typeof import('@/lib/cache').cacheKeys
let cacheTTL: typeof import('@/lib/cache').cacheTTL

beforeEach(async () => {
  vi.resetModules()
  const cacheModule = await import('@/lib/cache')
  cache = cacheModule.cache
  cacheKeys = cacheModule.cacheKeys
  cacheTTL = cacheModule.cacheTTL
  cache.clear()
})

afterEach(() => {
  cache.clear()
})

describe('Cache', () => {
  describe('basic operations', () => {
    it('should set and get a value', () => {
      cache.set('test-key', 'test-value', 60)
      expect(cache.get('test-key')).toBe('test-value')
    })

    it('should return null for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeNull()
    })

    it('should delete a value', () => {
      cache.set('test-key', 'test-value', 60)
      expect(cache.delete('test-key')).toBe(true)
      expect(cache.get('test-key')).toBeNull()
    })

    it('should check if key exists', () => {
      cache.set('test-key', 'test-value', 60)
      expect(cache.has('test-key')).toBe(true)
      expect(cache.has('non-existent')).toBe(false)
    })

    it('should clear all values', () => {
      cache.set('key1', 'value1', 60)
      cache.set('key2', 'value2', 60)
      cache.clear()
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('TTL expiration', () => {
    it('should return null for expired values', async () => {
      cache.set('expiring-key', 'value', 1) // 1 second TTL
      expect(cache.get('expiring-key')).toBe('value')
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100))
      expect(cache.get('expiring-key')).toBeNull()
    })
  })

  describe('pattern deletion', () => {
    it('should delete keys matching prefix', () => {
      cache.set('user:123:profile', 'profile', 60)
      cache.set('user:123:settings', 'settings', 60)
      cache.set('user:456:profile', 'other-profile', 60)
      cache.set('org:789:data', 'org-data', 60)

      const deleted = cache.deletePattern('user:123:')
      expect(deleted).toBe(2)
      expect(cache.get('user:123:profile')).toBeNull()
      expect(cache.get('user:123:settings')).toBeNull()
      expect(cache.get('user:456:profile')).toBe('other-profile')
      expect(cache.get('org:789:data')).toBe('org-data')
    })
  })

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      cache.set('cached-key', 'cached-value', 60)
      const factory = vi.fn(() => Promise.resolve('new-value'))
      
      const result = await cache.getOrSet('cached-key', factory, 60)
      
      expect(result).toBe('cached-value')
      expect(factory).not.toHaveBeenCalled()
    })

    it('should call factory and cache result if not exists', async () => {
      const factory = vi.fn(() => Promise.resolve('factory-value'))
      
      const result = await cache.getOrSet('new-key', factory, 60)
      
      expect(result).toBe('factory-value')
      expect(factory).toHaveBeenCalledTimes(1)
      expect(cache.get('new-key')).toBe('factory-value')
    })
  })

  describe('stats', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1', 60)
      cache.set('key2', 'value2', 60)
      
      const stats = cache.stats()
      
      expect(stats.size).toBe(2)
      expect(stats.keys).toContain('key1')
      expect(stats.keys).toContain('key2')
    })
  })
})

describe('cacheKeys helpers', () => {
  it('should generate organization-scoped keys', () => {
    expect(cacheKeys.org('org-123', 'settings')).toBe('org:org-123:settings')
    expect(cacheKeys.products('org-123')).toBe('org:org-123:products')
    expect(cacheKeys.customers('org-123')).toBe('org:org-123:customers')
  })

  it('should generate user-scoped keys', () => {
    expect(cacheKeys.user('user-456', 'preferences')).toBe('user:user-456:preferences')
  })
})

describe('cacheTTL presets', () => {
  it('should have correct TTL values', () => {
    expect(cacheTTL.short).toBe(60)
    expect(cacheTTL.medium).toBe(300)
    expect(cacheTTL.long).toBe(900)
    expect(cacheTTL.veryLong).toBe(3600)
  })
})
