/**
 * Rate Limit Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Reset modules between tests
let checkRateLimit: typeof import('@/lib/rate-limit').checkRateLimit
let getClientIdentifier: typeof import('@/lib/rate-limit').getClientIdentifier
let getRateLimitHeaders: typeof import('@/lib/rate-limit').getRateLimitHeaders
let rateLimitPresets: typeof import('@/lib/rate-limit').rateLimitPresets

beforeEach(async () => {
  vi.resetModules()
  const module = await import('@/lib/rate-limit')
  checkRateLimit = module.checkRateLimit
  getClientIdentifier = module.getClientIdentifier
  getRateLimitHeaders = module.getRateLimitHeaders
  rateLimitPresets = module.rateLimitPresets
})

describe('checkRateLimit', () => {
  it('should allow requests under the limit', async () => {
    const result = await checkRateLimit('test-user', { windowMs: 60000, maxRequests: 10 })
    
    expect(result.success).toBe(true)
    expect(result.limit).toBe(10)
    expect(result.remaining).toBe(9)
  })

  it('should track request counts', async () => {
    const config = { windowMs: 60000, maxRequests: 5 }
    
    await checkRateLimit('counting-user', config)
    await checkRateLimit('counting-user', config)
    const result = await checkRateLimit('counting-user', config)
    
    expect(result.remaining).toBe(2) // 5 - 3 = 2
  })

  it('should block requests over the limit', async () => {
    const config = { windowMs: 60000, maxRequests: 3 }
    
    await checkRateLimit('limited-user', config)
    await checkRateLimit('limited-user', config)
    await checkRateLimit('limited-user', config)
    const result = await checkRateLimit('limited-user', config)
    
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should track different identifiers separately', async () => {
    const config = { windowMs: 60000, maxRequests: 5 }
    
    await checkRateLimit('user-a', config)
    await checkRateLimit('user-a', config)
    const resultA = await checkRateLimit('user-a', config)
    const resultB = await checkRateLimit('user-b', config)
    
    expect(resultA.remaining).toBe(2) // 5 - 3
    expect(resultB.remaining).toBe(4) // 5 - 1
  })
})

describe('getClientIdentifier', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178' }
    })
    
    expect(getClientIdentifier(request)).toBe('203.0.113.195')
  })

  it('should extract IP from x-real-ip header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '203.0.113.195' }
    })
    
    expect(getClientIdentifier(request)).toBe('203.0.113.195')
  })

  it('should fallback to anonymous for unknown clients', () => {
    const request = new Request('http://localhost')
    
    expect(getClientIdentifier(request)).toBe('anonymous')
  })
})

describe('getRateLimitHeaders', () => {
  it('should return rate limit headers', () => {
    const headers = getRateLimitHeaders({
      success: true,
      limit: 100,
      remaining: 95,
      reset: 1234567890,
    })
    
    expect(headers['X-RateLimit-Limit']).toBe('100')
    expect(headers['X-RateLimit-Remaining']).toBe('95')
    expect(headers['X-RateLimit-Reset']).toBe('1234567890')
  })
})

describe('rateLimitPresets', () => {
  it('should have standard preset', () => {
    expect(rateLimitPresets.standard.maxRequests).toBe(100)
    expect(rateLimitPresets.standard.windowMs).toBe(15 * 60 * 1000)
  })

  it('should have auth preset (stricter)', () => {
    expect(rateLimitPresets.auth.maxRequests).toBe(10)
  })

  it('should have heavy preset (very strict)', () => {
    expect(rateLimitPresets.heavy.maxRequests).toBe(10)
    expect(rateLimitPresets.heavy.windowMs).toBe(60 * 60 * 1000)
  })

  it('should have public preset (generous)', () => {
    expect(rateLimitPresets.public.maxRequests).toBe(300)
  })
})
