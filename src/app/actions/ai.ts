'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getGeminiClient, getGeminiApiKey } from '@/lib/gemini'
import { SchemaType, FunctionDeclaration } from '@google/generative-ai'
import { getLowStockAlerts } from './products'
import { globalSearch } from '@/lib/search'
import { Decimal } from '@prisma/client/runtime/library'
import { logAudit } from '@/lib/audit'
import { serializeDecimal } from '@/lib/utils'

export async function getAiSettings() {
  const { orgId } = await auth()
  if (!orgId) {
    throw new Error('Unauthorized: No active organization context found.')
  }

  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { geminiApiKey: true }
  })

  const hasEnvFallback = !!process.env.GEMINI_API_KEY
  const hasKey = !!org?.geminiApiKey

  let maskedKey = ''
  if (org?.geminiApiKey) {
    const key = org.geminiApiKey
    if (key.length > 8) {
      maskedKey = `••••••••${key.slice(-4)}`
    } else {
      maskedKey = '••••••••'
    }
  }

  return {
    hasKey,
    maskedKey,
    hasEnvFallback
  }
}

export async function updateAiSettings(apiKey: string) {
  const { orgId } = await auth()
  if (!orgId) {
    throw new Error('Unauthorized: No active organization context found.')
  }

  const trimmedKey = apiKey.trim()

  await prisma.organization.update({
    where: { clerkOrgId: orgId },
    data: {
      geminiApiKey: trimmedKey || null
    }
  })

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/settings/ai')

  return { success: true }
}

// Gemini Tool Definitions
const getSalesOverviewTool: FunctionDeclaration = {
  name: 'getSalesOverview',
  description: 'Retrieve financial sales overview (total revenue, paid revenue, pending invoices, customer count).',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  }
}

const getInventoryAlertsTool: FunctionDeclaration = {
  name: 'getInventoryAlerts',
  description: 'Retrieve products that are currently below their reorder level and require attention.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  }
}

const searchERPDataTool: FunctionDeclaration = {
  name: 'searchERPData',
  description: 'Search Products, Invoices, Customers, Employees, and Vendors in the ERP system by a text query.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: 'Text term to search, e.g. a company name, SKU code, or invoice number.',
      }
    },
    required: ['query']
  }
}

const createProductTool: FunctionDeclaration = {
  name: 'createProduct',
  description: 'Create a new product record in the ERP inventory.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      sku: { type: SchemaType.STRING, description: 'Unique Stock Keeping Unit code, e.g. WOOD-PLANK-01.' },
      name: { type: SchemaType.STRING, description: 'Friendly name of the product.' },
      costPrice: { type: SchemaType.NUMBER, description: 'Production or unit cost price.' },
      sellingPrice: { type: SchemaType.NUMBER, description: 'Public catalog unit selling price.' },
      category: { type: SchemaType.STRING, description: 'Optional classification, e.g. Materials, Finish.' },
      description: { type: SchemaType.STRING, description: 'Optional details about the item.' }
    },
    required: ['sku', 'name', 'costPrice', 'sellingPrice']
  }
}

const createCustomerTool: FunctionDeclaration = {
  name: 'createCustomer',
  description: 'Create a new customer profile in the ERP CRM.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      companyName: { type: SchemaType.STRING, description: 'Name of the customer company.' },
      contactPerson: { type: SchemaType.STRING, description: 'Full name of the contact person.' },
      email: { type: SchemaType.STRING, description: 'Contact email address.' },
      phone: { type: SchemaType.STRING, description: 'Optional phone number.' }
    },
    required: ['companyName', 'email']
  }
}

const createNotificationTool: FunctionDeclaration = {
  name: 'createNotification',
  description: 'Trigger a new database alert/notification for the current organization.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: 'Short alert header.' },
      message: { type: SchemaType.STRING, description: 'Detailed alert message.' }
    },
    required: ['title', 'message']
  }
}

async function handleToolCall(name: string, args: any, orgId: string, userId: string) {
  switch (name) {
    case 'getSalesOverview': {
      const [invoiceCount, customerCount, pendingInvoices, paidInvoices] = await Promise.all([
        prisma.invoice.count({ where: { organizationId: orgId, deletedAt: null } }),
        prisma.customer.count({ where: { organizationId: orgId, deletedAt: null } }),
        prisma.invoice.aggregate({
          where: { organizationId: orgId, status: { in: ['DRAFT', 'SENT'] }, deletedAt: null },
          _sum: { totalAmount: true }
        }),
        prisma.invoice.aggregate({
          where: { organizationId: orgId, status: 'PAID', deletedAt: null },
          _sum: { totalAmount: true }
        }),
      ])
      return {
        invoiceCount,
        customerCount,
        pendingAmount: Number(pendingInvoices._sum.totalAmount || 0),
        paidAmount: Number(paidInvoices._sum.totalAmount || 0)
      }
    }

    case 'getInventoryAlerts': {
      const alerts = await getLowStockAlerts()
      return alerts
    }

    case 'searchERPData': {
      const results = await globalSearch({ query: args.query, organizationId: orgId })
      return results
    }

    case 'createProduct': {
      const product = await prisma.product.create({
        data: {
          sku: args.sku,
          name: args.name,
          costPrice: new Decimal(args.costPrice),
          sellingPrice: new Decimal(args.sellingPrice),
          category: args.category || null,
          description: args.description || null,
          organizationId: orgId,
          createdBy: userId
        }
      })
      await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'Product', entityId: product.id, newValues: product as any })
      revalidatePath('/dashboard/inventory/products')
      return serializeDecimal(product)
    }

    case 'createCustomer': {
      const lastCustomer = await prisma.customer.findFirst({
        where: { organizationId: orgId },
        orderBy: { customerNumber: 'desc' },
        select: { customerNumber: true }
      })
      const lastNum = lastCustomer ? (parseInt(lastCustomer.customerNumber.replace('CUST-', '')) || 0) : 0
      const customerNumber = `CUST-${String(lastNum + 1).padStart(6, '0')}`

      const customer = await prisma.customer.create({
        data: {
          companyName: args.companyName,
          contactPerson: args.contactPerson || null,
          email: args.email,
          phone: args.phone || null,
          customerNumber,
          organizationId: orgId,
          createdBy: userId
        }
      })
      await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'Customer', entityId: customer.id, newValues: customer as any })
      revalidatePath('/dashboard/crm/customers')
      return serializeDecimal(customer)
    }

    case 'createNotification': {
      const notification = await prisma.notification.create({
        data: {
          organizationId: orgId,
          userId: userId,
          type: 'INFO',
          title: args.title,
          message: args.message,
          isRead: false
        }
      })
      revalidatePath('/dashboard')
      return notification
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

export async function askAiAssistant(message: string, history: Array<{ role: 'user' | 'model', parts: string }>) {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) {
      return { success: false, error: 'UNAUTHORIZED', message: 'Session expired. Please sign in again.' }
    }

    const org = await prisma.organization.findUnique({
      where: { clerkOrgId: orgId }
    })
    if (!org) {
      return { success: false, error: 'ORGANIZATION_NOT_FOUND', message: 'Active organization context not found.' }
    }

    const apiKey = await getGeminiApiKey(orgId)
    if (!apiKey) {
      return { 
        success: false, 
        error: 'API_KEY_MISSING', 
        message: 'Your Gemini API Key is not configured. Please set it in Settings -> AI Configuration to enable the ERP Assistant.' 
      }
    }

    const client = await getGeminiClient(orgId)
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{
        functionDeclarations: [
          getSalesOverviewTool,
          getInventoryAlertsTool,
          searchERPDataTool,
          createProductTool,
          createCustomerTool,
          createNotificationTool
        ]
      }]
    })

    // Format the history items correctly for Gemini Chat Content objects
    const contents = history.map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.parts }]
    }))

    // Start chat session
    const chat = model.startChat({
      history: contents,
      generationConfig: {
        temperature: 0.2
      }
    })

    let response = await chat.sendMessage(message)
    let functionCalls = response.response.functionCalls()

    // Loop if the model requested function execution
    if (functionCalls && functionCalls.length > 0) {
      const functionResponses = await Promise.all(functionCalls.map(async (call) => {
        try {
          const toolResult = await handleToolCall(call.name, call.args, org.id, userId)
          return {
            functionResponse: {
              name: call.name,
              response: { result: toolResult }
            }
          }
        } catch (err: any) {
          return {
            functionResponse: {
              name: call.name,
              response: { error: err.message || 'Operation failed' }
            }
          }
        }
      }))

      // Send tool responses back to continue model generation
      const followUp = await chat.sendMessage(functionResponses)
      
      // Serialize history safely
      const rawHistory = await chat.getHistory()
      const serializedHistory = rawHistory.map(h => ({
        role: h.role as 'user' | 'model',
        parts: h.parts.map(p => p.text || '').join(' ')
      }))

      return {
        success: true,
        text: followUp.response.text() || '',
        history: serializedHistory
      }
    }

    const rawHistory = await chat.getHistory()
    const serializedHistory = rawHistory.map(h => ({
      role: h.role as 'user' | 'model',
      parts: h.parts.map(p => p.text || '').join(' ')
    }))

    return {
      success: true,
      text: response.response.text() || '',
      history: serializedHistory
    }
  } catch (err: any) {
    console.error('askAiAssistant Server Error:', err)
    return {
      success: false,
      error: 'SYSTEM_ERROR',
      message: err.message || 'An unexpected error occurred while communicating with the AI model.'
    }
  }
}
