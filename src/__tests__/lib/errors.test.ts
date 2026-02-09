/**
 * Error Classes Tests
 */
import { describe, it, expect } from 'vitest'
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  BusinessRuleError,
  RateLimitError,
  InternalError,
  handleActionError,
  isAppError,
} from '@/lib/errors'

describe('AppError', () => {
  it('should create base error with correct properties', () => {
    const error = new AppError('Test error', 418, 'TEST_ERROR')
    
    expect(error.message).toBe('Test error')
    expect(error.statusCode).toBe(418)
    expect(error.code).toBe('TEST_ERROR')
    expect(error.name).toBe('AppError')
  })
})

describe('Specialized Errors', () => {
  it('should create UnauthorizedError with 401 status', () => {
    const error = new UnauthorizedError()
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
  })

  it('should create ForbiddenError with 403 status', () => {
    const error = new ForbiddenError('Access denied')
    expect(error.statusCode).toBe(403)
    expect(error.code).toBe('FORBIDDEN')
    expect(error.message).toBe('Access denied')
  })

  it('should create NotFoundError with 404 status', () => {
    const error = new NotFoundError('Customer')
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toBe('Customer not found')
  })

  it('should create ValidationError with 400 status', () => {
    const error = new ValidationError('Email is required')
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('VALIDATION_ERROR')
  })

  it('should create ConflictError with 409 status', () => {
    const error = new ConflictError('Email already exists')
    expect(error.statusCode).toBe(409)
    expect(error.code).toBe('CONFLICT')
  })

  it('should create BusinessRuleError with 422 status', () => {
    const error = new BusinessRuleError('Cannot delete customer with unpaid invoices')
    expect(error.statusCode).toBe(422)
    expect(error.code).toBe('BUSINESS_RULE_VIOLATION')
  })

  it('should create RateLimitError with 429 status', () => {
    const error = new RateLimitError()
    expect(error.statusCode).toBe(429)
    expect(error.code).toBe('RATE_LIMITED')
  })

  it('should create InternalError with 500 status', () => {
    const error = new InternalError()
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('INTERNAL_ERROR')
  })
})

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    expect(isAppError(new AppError('test', 400, 'TEST'))).toBe(true)
    expect(isAppError(new NotFoundError('test'))).toBe(true)
    expect(isAppError(new ValidationError('test'))).toBe(true)
  })

  it('should return false for regular errors', () => {
    expect(isAppError(new Error('test'))).toBe(false)
    expect(isAppError(null)).toBe(false)
    expect(isAppError(undefined)).toBe(false)
    expect(isAppError('error string')).toBe(false)
  })
})

describe('handleActionError', () => {
  it('should convert AppError to failed result', () => {
    const error = new NotFoundError('Customer')
    const result = handleActionError(error)
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('Customer not found')
    expect(result.code).toBe('NOT_FOUND')
  })

  it('should convert unknown error to internal error result', () => {
    const error = new Error('Some unexpected error')
    const result = handleActionError(error)
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('An unexpected error occurred')
    expect(result.code).toBe('INTERNAL_ERROR')
  })

  it('should handle non-Error objects', () => {
    const result = handleActionError('string error')
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('An unexpected error occurred')
  })
})
