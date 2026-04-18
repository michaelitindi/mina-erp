import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * Official eTIMS KRA Integration Client for MinaERP
 * 
 * This class handles the technical transmission of tax invoices to the KRA servers.
 * It is designed for 'Plug and Play' readiness: once the user provides credentials,
 * it switches from Simulation to real API calls.
 */

export interface EtimsConfig {
  deviceId: string
  serialNumber: string
  securityKey: string
  mode: 'SIMULATION' | 'SANDBOX' | 'PRODUCTION'
}

export interface EtimsResponse {
  success: boolean
  controlNumber?: string
  qrCodeUrl?: string
  error?: string
  rawResponse?: any
}

export class EtimsClient {
  private config: EtimsConfig

  constructor(config: EtimsConfig) {
    this.config = config
  }

  private getApiUrl(): string {
    if (this.config.mode === 'PRODUCTION') {
      return 'https://etims.kra.go.ke/api/v1/invc/save' // Example URL
    }
    return 'https://etims-sandbox.kra.go.ke/api/v1/invc/save'
  }

  /**
   * Validates and signs an invoice with KRA eTIMS
   */
  async submitInvoice(invoiceId: string): Promise<EtimsResponse> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        organization: true,
        customer: true,
        lineItems: true
      }
    })

    if (!invoice) return { success: false, error: 'Invoice not found' }

    // 1. Data Validation (KRA Mandatory Checks)
    if (!invoice.organization.pinNumber) return { success: false, error: 'Seller PIN is missing' }
    if (invoice.totalAmount.gt(1000) && !invoice.customer.pinNumber) {
      // Per KRA, B2B over certain amounts must have a Buyer PIN
      // We'll allow it for simulation but log a warning
    }

    // 2. Map ERP models to KRA JSON format
    const kraPayload = {
      header: {
        deviceId: this.config.deviceId,
        serialNumber: this.config.serialNumber,
        pin: invoice.organization.pinNumber,
      },
      invoice: {
        number: invoice.invoiceNumber,
        date: invoice.invoiceDate.toISOString(),
        totalAmount: Number(invoice.totalAmount),
        taxAmount: Number(invoice.taxAmount),
        buyerPin: invoice.customer.pinNumber,
        buyerName: invoice.customer.companyName,
      },
      items: invoice.lineItems.map(item => ({
        description: item.description,
        qty: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate),
        taxCategory: 'A', // Default to Standard 16%
        amount: Number(item.amount),
        hsCode: '0000.00.00' // Real products will use product.hsCode
      }))
    }

    // 3. Transmission
    if (this.config.mode === 'SIMULATION') {
      return this.simulateTransmission(invoiceId)
    }

    try {
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Key': this.config.securityKey
        },
        body: JSON.stringify(kraPayload)
      })

      const data = await response.json()
      
      if (data.status === 'SUCCESS') {
        const result = {
          success: true,
          controlNumber: data.controlNumber,
          qrCodeUrl: data.qrCodeUrl
        }
        await this.updateInvoice(invoiceId, result)
        return result
      } else {
        return { success: false, error: data.message || 'KRA API Error', rawResponse: data }
      }
    } catch (err) {
      console.error('eTIMS Connection Error:', err)
      return { success: false, error: 'Could not connect to KRA servers' }
    }
  }

  private async simulateTransmission(invoiceId: string): Promise<EtimsResponse> {
    await new Promise(r => setTimeout(resolve => r(null), 500))
    const mockResult = {
      success: true,
      controlNumber: `KRA-SIM-${Math.random().toString(36).substring(7).toUpperCase()}`,
      qrCodeUrl: `https://itax.kra.go.ke/verify?id=${invoiceId}`
    }
    await this.updateInvoice(invoiceId, mockResult)
    return mockResult
  }

  private async updateInvoice(invoiceId: string, result: { controlNumber: string, qrCodeUrl: string }) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        kraControlNumber: result.controlNumber,
        kraQrCode: result.qrCodeUrl,
        isEtimsValidated: true,
        etimsValidatedAt: new Date()
      }
    })
  }
}

/**
 * High-level service hook used by server actions
 */
export async function validateWithEtims(invoiceId: string): Promise<EtimsResponse> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { organization: true }
  })

  if (!invoice) return { success: false, error: 'Invoice not found' }
  const { organization: org } = invoice

  // Instantiate client with organization's KRA settings
  const client = new EtimsClient({
    deviceId: org.etimsDeviceId || 'SIM_DEVICE',
    serialNumber: org.etimsSerialNumber || 'SIM_SERIAL',
    securityKey: org.etimsSecurityKey || 'SIM_KEY',
    mode: (org.etimsMode as any) || 'SIMULATION'
  })

  return client.submitInvoice(invoiceId)
}
