/**
 * Application Logger for MinaERP
 * 
 * Uses Pino for fast, structured logging in production.
 * Provides pretty printing in development.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  organizationId?: string
  userId?: string
  action?: string
  entityType?: string
  entityId?: string
  [key: string]: unknown
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'
  private level = process.env.LOG_LEVEL || 'info'

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.level as LogLevel)
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const base = { timestamp, level, message, ...context }
    
    if (this.isDev) {
      const emoji = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' }[level]
      return `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}${context ? ` ${JSON.stringify(context)}` : ''}`
    }
    
    return JSON.stringify(base)
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, error?: unknown, context?: LogContext) {
    if (this.shouldLog('error')) {
      const errorInfo = error instanceof Error 
        ? { errorMessage: error.message, stack: error.stack }
        : { errorMessage: String(error) }
      
      console.error(this.formatMessage('error', message, { ...context, ...errorInfo }))
    }
  }

  /**
   * Log an HTTP request
   */
  request(method: string, path: string, statusCode?: number, durationMs?: number) {
    this.info('HTTP Request', {
      method,
      path,
      statusCode,
      durationMs,
    })
  }

  /**
   * Log a database query
   */
  query(model: string, operation: string, durationMs?: number) {
    this.debug('Database Query', {
      model,
      operation,
      durationMs,
    })
  }

  /**
   * Log an action with organization context
   */
  action(actionName: string, context: LogContext) {
    this.info(`Action: ${actionName}`, context)
  }
}

// Export singleton logger
export const logger = new Logger()

// Also export for testing
export { Logger }
