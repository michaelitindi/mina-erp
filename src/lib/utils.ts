import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateNumber(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(6, '0')}`
}

/**
 * Recursively converts Prisma Decimal objects to plain numbers for JSON serialization.
 * Critical for passing server data to Next.js Client Components.
 */
export function serializeDecimal<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj

  // Handle Decimal objects
  if (typeof obj === 'object' && (obj as any).constructor?.name === 'Decimal') {
    return Number(obj.toString()) as any
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal) as any
  }

  // Handle Objects
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const serialized: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeDecimal((obj as any)[key])
      }
    }
    return serialized as T
  }

  return obj
}
