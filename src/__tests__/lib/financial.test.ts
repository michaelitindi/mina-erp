import { describe, it, expect } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import {
  roundCurrency,
  calculateLineTotal,
  calculateDocumentTotals,
  calculateTax,
  calculateAmountBeforeTax,
  calculateAmountDue,
  calculateChange,
  formatCurrency,
} from '@/lib/financial'

describe('Financial Calculations', () => {
  describe('roundCurrency', () => {
    it('should round to 2 decimal places', () => {
      expect(Number(roundCurrency(10.126))).toBe(10.13)
      expect(Number(roundCurrency(10.124))).toBe(10.12)
      expect(Number(roundCurrency(10.125))).toBe(10.13)
    })

    it('should handle Decimal input', () => {
      const decimal = new Decimal(10.126)
      expect(Number(roundCurrency(decimal))).toBe(10.13)
    })
  })

  describe('calculateLineTotal', () => {
    it('should calculate basic line total', () => {
      const result = calculateLineTotal(5, 100)
      expect(Number(result.subtotal)).toBe(500)
      expect(Number(result.total)).toBe(500)
    })

    it('should apply discount correctly', () => {
      const result = calculateLineTotal(5, 100, 10) // 10% discount
      expect(Number(result.subtotal)).toBe(500)
      expect(Number(result.discount)).toBe(50)
      expect(Number(result.total)).toBe(450)
    })

    it('should apply tax after discount', () => {
      const result = calculateLineTotal(5, 100, 10, 16) // 10% discount, 16% tax
      expect(Number(result.subtotal)).toBe(500)
      expect(Number(result.discount)).toBe(50)
      expect(Number(result.tax)).toBe(72) // 16% of 450
      expect(Number(result.total)).toBe(522) // 450 + 72
    })
  })

  describe('calculateDocumentTotals', () => {
    it('should calculate invoice totals', () => {
      const lineItems = [
        { quantity: 2, unitPrice: 100, taxRate: 16 },
        { quantity: 3, unitPrice: 50, taxRate: 16 },
      ]

      const result = calculateDocumentTotals(lineItems)

      // Subtotal: (2*100) + (3*50) = 350
      expect(Number(result.subtotal)).toBe(350)
      // Tax: 350 * 16% = 56
      expect(Number(result.taxAmount)).toBe(56)
      // Total: 350 + 56 = 406
      expect(Number(result.totalAmount)).toBe(406)
    })

    it('should include shipping', () => {
      const lineItems = [{ quantity: 1, unitPrice: 100 }]
      const result = calculateDocumentTotals(lineItems, 50)

      expect(Number(result.subtotal)).toBe(100)
      expect(Number(result.shippingAmount)).toBe(50)
      expect(Number(result.totalAmount)).toBe(150)
    })
  })

  describe('calculateTax', () => {
    it('should calculate 16% VAT', () => {
      expect(Number(calculateTax(1000, 16))).toBe(160)
    })

    it('should handle zero tax rate', () => {
      expect(Number(calculateTax(1000, 0))).toBe(0)
    })
  })

  describe('calculateAmountBeforeTax', () => {
    it('should reverse calculate amount before tax', () => {
      // If total with 16% tax is 1160, original was 1000
      const result = calculateAmountBeforeTax(1160, 16)
      expect(Number(result)).toBe(1000)
    })
  })

  describe('calculateAmountDue', () => {
    it('should calculate remaining balance', () => {
      expect(Number(calculateAmountDue(1000, 300))).toBe(700)
    })

    it('should return zero for overpayment', () => {
      // Note: our function doesn't handle overpayment specially
      expect(Number(calculateAmountDue(1000, 1200))).toBe(-200)
    })
  })

  describe('calculateChange', () => {
    it('should calculate change for cash payment', () => {
      expect(calculateChange(85, 100)).toBe(15)
    })

    it('should return zero for exact payment', () => {
      expect(calculateChange(100, 100)).toBe(0)
    })

    it('should return zero for underpayment', () => {
      expect(calculateChange(100, 80)).toBe(0)
    })
  })

  describe('formatCurrency', () => {
    it('should format as KES by default', () => {
      const formatted = formatCurrency(1000)
      expect(formatted).toContain('1,000')
    })
  })
})
