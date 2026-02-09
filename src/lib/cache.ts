/**
 * Simple Caching Layer
 * In-memory cache with TTL support
 * Can be upgraded to Redis for production multi-instance deployments
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class Cache {
  private store = new Map<string, CacheEntry<unknown>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup expired entries every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60_000)
    }
  }

  /**
   * Get a cached value
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    
    return entry.value
  }

  /**
   * Set a cached value with TTL in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  /**
   * Delete a cached value
   */
  delete(key: string): boolean {
    return this.store.delete(key)
  }

  /**
   * Delete all keys matching a pattern (prefix)
   */
  deletePattern(prefix: string): number {
    let deleted = 0
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
        deleted++
      }
    }
    return deleted
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return false
    }
    return true
  }

  /**
   * Get or set - returns cached value or calls factory to get and cache new value
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) return cached

    const value = await factory()
    this.set(key, value, ttlSeconds)
    return value
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Stop cleanup interval (for testing/shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Singleton instance
export const cache = new Cache()

// Cache key builders for common patterns
export const cacheKeys = {
  // Organization-scoped keys
  org: (orgId: string, resource: string) => `org:${orgId}:${resource}`,
  
  // User-scoped keys
  user: (userId: string, resource: string) => `user:${userId}:${resource}`,
  
  // Resource keys
  products: (orgId: string) => `org:${orgId}:products`,
  customers: (orgId: string) => `org:${orgId}:customers`,
  invoices: (orgId: string) => `org:${orgId}:invoices`,
  employees: (orgId: string) => `org:${orgId}:employees`,
  settings: (orgId: string) => `org:${orgId}:settings`,
  modules: (orgId: string) => `org:${orgId}:modules`,
}

// Common TTL values in seconds
export const cacheTTL = {
  short: 60,        // 1 minute - for frequently changing data
  medium: 300,      // 5 minutes - default
  long: 900,        // 15 minutes - for stable data
  veryLong: 3600,   // 1 hour - for rarely changing data
}

// Helper to invalidate cache on mutations
export function invalidateCache(patterns: string[]): void {
  patterns.forEach(pattern => cache.deletePattern(pattern))
}
