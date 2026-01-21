import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { createCustomerSchema, createInvoiceSchema } from '@/lib/validations/finance'

describe('Finance Validation Schemas', () => {
  describe('createCustomerSchema', () => {
    it('should accept valid customer data', () => {
      const validCustomer = {
        companyName: 'Acme Corp',
        email: 'contact@acme.com',
        phone: '+254712345678',
        customerType: 'BUSINESS',
      }

      const result = createCustomerSchema.safeParse(validCustomer)
      expect(result.success).toBe(true)
    })

    it('should reject customer without company name', () => {
      const invalidCustomer = {
        email: 'contact@acme.com',
      }

      const result = createCustomerSchema.safeParse(invalidCustomer)
      expect(result.success).toBe(false)
    })

    it('should reject invalid email format', () => {
      const invalidCustomer = {
        companyName: 'Acme Corp',
        email: 'not-an-email',
      }

      const result = createCustomerSchema.safeParse(invalidCustomer)
      expect(result.success).toBe(false)
    })
  })

  describe('createInvoiceSchema', () => {
    it('should accept valid invoice data', () => {
      const validInvoice = {
        customerId: 'cust-123',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lineItems: [
          {
            description: 'Consulting Services',
            quantity: 10,
            unitPrice: 100,
            taxRate: 16,
          },
        ],
      }

      const result = createInvoiceSchema.safeParse(validInvoice)
      expect(result.success).toBe(true)
    })

    it('should reject invoice without line items', () => {
      const invalidInvoice = {
        customerId: 'cust-123',
        invoiceDate: new Date(),
        dueDate: new Date(),
        lineItems: [],
      }

      const result = createInvoiceSchema.safeParse(invalidInvoice)
      expect(result.success).toBe(false)
    })

    it('should reject negative quantities', () => {
      const invalidInvoice = {
        customerId: 'cust-123',
        invoiceDate: new Date(),
        dueDate: new Date(),
        lineItems: [
          {
            description: 'Item',
            quantity: -5,
            unitPrice: 100,
          },
        ],
      }

      const result = createInvoiceSchema.safeParse(invalidInvoice)
      expect(result.success).toBe(false)
    })
  })
})
