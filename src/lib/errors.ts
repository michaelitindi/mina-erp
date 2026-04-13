/**
 * Structured Error Classes for MinaERP
 * 
 * These provide consistent error handling across the application
 * with proper HTTP status codes and error codes for client handling.
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR'
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true // Distinguishes from programming errors
    
    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

// 401 - Authentication required
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

// 403 - Access denied
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'FORBIDDEN')
  }
}

// 404 - Resource not found
export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    const message = id ? `${entity} with ID ${id} not found` : `${entity} not found`
    super(message, 404, 'NOT_FOUND')
  }
}

// 400 - Validation error
export class ValidationError extends AppError {
  public readonly details?: Record<string, string[]>

  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR')
    this.details = details
  }
}

// 409 - Conflict (duplicate, already exists)
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

// 422 - Business rule violation
export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION')
  }
}

// 429 - Rate limited
export class RateLimitError extends AppError {
  public readonly retryAfter: number

  constructor(retryAfter: number = 60) {
    super('Too many requests. Please try again later.', 429, 'RATE_LIMITED')
    this.retryAfter = retryAfter
  }
}

// 503 - Service unavailable
export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE')
  }
}

// 500 - Internal server error
export class InternalError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super(message, 500, 'INTERNAL_ERROR')
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Result type for server actions
 * Provides consistent success/error responses
 */
export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; code: string; details?: Record<string, string[]> }

/**
 * Wrap a server action with error handling
 * Always returns a failure result
 */
export function handleActionError(error: unknown): Extract<ActionResult<never>, { success: false }> {
  if (isAppError(error)) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error instanceof ValidationError ? error.details : undefined,
    }
  }

  // Log unexpected errors
  console.error('Unexpected error:', error)

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
  }
}
