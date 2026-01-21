/**
 * Financial Calculation Utilities for MinaERP
 * 
 * Provides accurate financial calculations using Decimal
 * to avoid floating-point precision issues.
 */

import { Decimal } from '@prisma/client/runtime/library'

/**
 * Round to 2 decimal places (standard for currency)
 */
export function roundCurrency(value: number | Decimal): Decimal {
  const num = typeof value === 'number' ? value : Number(value)
  return new Decimal(Math.round(num * 100) / 100)
}

/**
 * Calculate line item total
 * lineTotal = (quantity * unitPrice) - discount + tax
 */
export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0,
  taxRate: number = 0
): { subtotal: Decimal; discount: Decimal; tax: Decimal; total: Decimal } {
  const subtotal = new Decimal(quantity).mul(unitPrice)
  const discount = subtotal.mul(discountPercent / 100)
  const afterDiscount = subtotal.sub(discount)
  const tax = afterDiscount.mul(taxRate / 100)
  const total = afterDiscount.add(tax)

  return {
    subtotal: roundCurrency(subtotal),
    discount: roundCurrency(discount),
    tax: roundCurrency(tax),
    total: roundCurrency(total),
  }
}

/**
 * Calculate invoice/bill totals from line items
 */
export function calculateDocumentTotals(
  lineItems: Array<{ quantity: number; unitPrice: number; discountPercent?: number; taxRate?: number }>,
  shippingAmount: number = 0,
  documentDiscountPercent: number = 0
): {
  subtotal: Decimal
  discountAmount: Decimal
  taxAmount: Decimal
  shippingAmount: Decimal
  totalAmount: Decimal
} {
  let subtotal = new Decimal(0)
  let taxAmount = new Decimal(0)

  for (const item of lineItems) {
    const line = calculateLineTotal(
      item.quantity,
      item.unitPrice,
      item.discountPercent || 0,
      item.taxRate || 0
    )
    subtotal = subtotal.add(line.subtotal).sub(line.discount)
    taxAmount = taxAmount.add(line.tax)
  }

  // Apply document-level discount
  const discountAmount = subtotal.mul(documentDiscountPercent / 100)
  const afterDiscount = subtotal.sub(discountAmount)

  // Calculate total
  const shipping = new Decimal(shippingAmount)
  const totalAmount = afterDiscount.add(taxAmount).add(shipping)

  return {
    subtotal: roundCurrency(subtotal),
    discountAmount: roundCurrency(discountAmount),
    taxAmount: roundCurrency(taxAmount),
    shippingAmount: roundCurrency(shipping),
    totalAmount: roundCurrency(totalAmount),
  }
}

/**
 * Calculate VAT/Tax amount
 */
export function calculateTax(amount: number | Decimal, taxRate: number): Decimal {
  const base = typeof amount === 'number' ? new Decimal(amount) : amount
  return roundCurrency(base.mul(taxRate / 100))
}

/**
 * Calculate amount before tax (reverse VAT calculation)
 */
export function calculateAmountBeforeTax(totalWithTax: number | Decimal, taxRate: number): Decimal {
  const total = typeof totalWithTax === 'number' ? new Decimal(totalWithTax) : totalWithTax
  return roundCurrency(total.div(1 + taxRate / 100))
}

/**
 * Calculate payment due (total - paid)
 */
export function calculateAmountDue(totalAmount: number | Decimal, paidAmount: number | Decimal): Decimal {
  const total = typeof totalAmount === 'number' ? new Decimal(totalAmount) : totalAmount
  const paid = typeof paidAmount === 'number' ? new Decimal(paidAmount) : paidAmount
  return roundCurrency(total.sub(paid))
}

/**
 * Calculate change for POS cash payments
 */
export function calculateChange(totalAmount: number, cashReceived: number): number {
  return Math.max(0, cashReceived - totalAmount)
}

/**
 * Format currency for display (Kenya Shillings)
 */
export function formatCurrency(amount: number | Decimal, currency: string = 'KES'): string {
  const num = typeof amount === 'number' ? amount : Number(amount)
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
  }).format(num)
}

/**
 * Format as USD
 */
export function formatUSD(amount: number | Decimal): string {
  const num = typeof amount === 'number' ? amount : Number(amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}
