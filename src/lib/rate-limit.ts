/**
 * Rate Limiting for MinaERP API Routes
 * 
 * Uses in-memory rate limiting for development.
 * For production, configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for development
const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit for an identifier (e.g., IP address, user ID)
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): Promise<RateLimitResult> {
  const now = Date.now()
  const key = `rate_limit:${identifier}`

  // Get existing entry
  let entry = rateLimitStore.get(key)

  // If no entry or window expired, create new
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  // Calculate remaining
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const success = entry.count <= config.maxRequests

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: entry.resetTime,
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try various headers for real IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a generic identifier
  return 'anonymous'
}

/**
 * Rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  }
}

/**
 * Presets for different endpoint types
 */
export const rateLimitPresets = {
  // Standard API endpoints
  standard: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  
  // Authentication endpoints (stricter)
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  
  // Heavy operations (very strict)
  heavy: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  
  // Public endpoints (generous)
  public: { windowMs: 15 * 60 * 1000, maxRequests: 300 },
}

/**
 * Cleanup expired entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
