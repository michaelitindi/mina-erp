'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getGeminiClient, getGeminiApiKey } from '@/lib/gemini'
import { SchemaType, FunctionDeclaration } from '@google/generative-ai'
import { createProduct as apiCreateProduct, getLowStockAlerts } from './products'
import { createCustomer as apiCreateCustomer } from './customers'
import { createBOM as apiCreateBOM, createWorkOrder as apiCreateWorkOrder } from './manufacturing'
import { createPurchaseOrder as apiCreatePO } from './purchase-orders'
import { globalSearch } from '@/lib/search'
import { checkToolSafety } from '@/lib/ai-guardrails'

// ... (in declarations)
const createWorkOrderTool: FunctionDeclaration = {
  name: 'createWorkOrder',
  description: 'Schedule a new manufacturing Work Order for production execution.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      bomId: { type: SchemaType.STRING, description: 'Optional Bill of Materials (BOM) recipe ID.' },
      productId: { type: SchemaType.STRING, description: 'Optional finished product ID to manufacture.' },
      quantity: { type: SchemaType.NUMBER, description: 'Quantity of items to produce.' },
      priority: { type: SchemaType.STRING, description: 'Priority level: LOW, MEDIUM, HIGH, or CRITICAL.' },
      notes: { type: SchemaType.STRING, description: 'Optional production notes.' }
    },
    required: ['quantity']
  }
}

const createPurchaseOrderTool: FunctionDeclaration = {
  name: 'createPurchaseOrder',
  description: 'Draft a vendor Purchase Order for materials or stock replenishment.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      vendorId: { type: SchemaType.STRING, description: 'ID of the vendor supplier.' },
      itemDescription: { type: SchemaType.STRING, description: 'Description of the goods being purchased.' },
      quantity: { type: SchemaType.NUMBER, description: 'Unit quantity to purchase.' },
      unitPrice: { type: SchemaType.NUMBER, description: 'Cost price per unit.' },
      notes: { type: SchemaType.STRING, description: 'Optional purchasing notes.' }
    },
    required: ['vendorId', 'itemDescription', 'quantity', 'unitPrice']
  }
}

const getFinancialStatementsTool: FunctionDeclaration = {
  name: 'getFinancialStatements',
  description: 'Retrieve financial Profit and Loss (P&L) performance summary metrics.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  }
}
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
  const { orgId, userId } = await auth()
  if (!orgId || !userId) {
    throw new Error('Unauthorized: Session expired.')
  }

  const trimmedKey = apiKey.trim()
  if (!trimmedKey) {
    throw new Error('API key cannot be empty.')
  }

  const org = await prisma.organization.update({
    where: { clerkOrgId: orgId },
    data: { geminiApiKey: trimmedKey }
  })

  await logAudit({
    organizationId: org.id,
    userId,
    action: 'UPDATE',
    entityType: 'OrganizationSettings',
    entityId: org.id,
    newValues: { geminiApiKeyConfigured: true },
  })

  revalidatePath('/dashboard/settings/ai')
  revalidatePath('/dashboard')

  return { success: true }
}

export async function removeAiSettings() {
  const { orgId, userId } = await auth()
  if (!orgId || !userId) {
    throw new Error('Unauthorized: Session expired.')
  }

  const org = await prisma.organization.update({
    where: { clerkOrgId: orgId },
    data: { geminiApiKey: null }
  })

  await logAudit({
    organizationId: org.id,
    userId,
    action: 'DELETE',
    entityType: 'OrganizationSettings',
    entityId: org.id,
    newValues: { geminiApiKeyConfigured: false },
  })

  revalidatePath('/dashboard/settings/ai')
  revalidatePath('/dashboard')

  return { success: true }
}

// Function declarations for Gemini Copilot Tools
const getSalesOverviewTool: FunctionDeclaration = {
  name: 'getSalesOverview',
  description: 'Retrieve financial sales overview, total revenue, invoice metrics, and pending balances for the tenant.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  }
}

const getInventoryAlertsTool: FunctionDeclaration = {
  name: 'getInventoryAlerts',
  description: 'Retrieve low stock inventory items requiring reordering across all warehouses.',
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

const createBOMTool: FunctionDeclaration = {
  name: 'createBOM',
  description: 'Create a Bill of Materials (BOM) recipe for manufacturing a finished product.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      productId: { type: SchemaType.STRING, description: 'ID of the finished product to manufacture.' },
      name: { type: SchemaType.STRING, description: 'Friendly name for the BOM recipe, e.g. Wooden Desk Spec.' },
      quantity: { type: SchemaType.NUMBER, description: 'Quantity of finished goods produced by 1 batch.' },
      notes: { type: SchemaType.STRING, description: 'Optional manufacturing instructions or notes.' }
    },
    required: ['productId', 'name', 'quantity']
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
      const product = await apiCreateProduct({
        sku: args.sku,
        name: args.name,
        costPrice: Number(args.costPrice || 0),
        sellingPrice: Number(args.sellingPrice || 0),
        description: args.description || null,
        category: args.category || null,
        type: 'PHYSICAL',
        unit: 'EACH',
        taxRate: 0,
        reorderLevel: 0
      })
      return product
    }

    case 'createCustomer': {
      const customer = await apiCreateCustomer({
        companyName: args.companyName,
        contactPerson: args.contactPerson || null,
        email: args.email,
        phone: args.phone || null,
        customerType: 'BUSINESS'
      })
      return customer
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

    case 'createBOM': {
      const bom = await apiCreateBOM({
        productId: args.productId,
        name: args.name,
        notes: args.notes || null,
        components: [
          {
            description: 'Assembly Raw Component',
            quantity: Number(args.quantity || 1),
            unit: 'EACH',
            wastagePercent: 0
          }
        ]
      })
      return bom
    }

    case 'createWorkOrder': {
      const wo = await apiCreateWorkOrder({
        bomId: args.bomId || null,
        productId: args.productId || null,
        quantity: Number(args.quantity || 1),
        priority: args.priority || 'MEDIUM',
        notes: args.notes || null
      })
      return wo
    }

    case 'createPurchaseOrder': {
      const po = await apiCreatePO({
        vendorId: args.vendorId,
        orderDate: new Date(),
        lineItems: [
          {
            description: args.itemDescription,
            quantity: Number(args.quantity || 1),
            unitPrice: Number(args.unitPrice || 0),
            taxRate: 0
          }
        ],
        notes: args.notes || null
      })
      return po
    }

    case 'getFinancialStatements': {
      const [accounts, revenue, expenses] = await Promise.all([
        prisma.account.findMany({ where: { organizationId: orgId, deletedAt: null } }),
        prisma.invoice.aggregate({ where: { organizationId: orgId, status: 'PAID', deletedAt: null }, _sum: { totalAmount: true } }),
        prisma.bill.aggregate({ where: { organizationId: orgId, status: 'PAID', deletedAt: null }, _sum: { totalAmount: true } }),
      ])
      const totalRevenue = Number(revenue._sum.totalAmount || 0)
      const totalExpenses = Number(expenses._sum.totalAmount || 0)
      return {
        accountCount: accounts.length,
        netSalesRevenue: totalRevenue,
        totalExpenses: totalExpenses,
        netOperatingIncome: totalRevenue - totalExpenses
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

export async function askAiAssistant(
  message: string, 
  history: Array<{ role: 'user' | 'model', parts: string }>,
  attachments?: Array<{ mimeType: string; data: string }>
) {
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
      model: 'gemini-3.5-flash',
      systemInstruction: `You are Mina Assistant, a helpful ERP business copilot. The active organization's currency is "${org.currency || 'USD'}". All monetary values and price inputs should be represented in this currency.

When summarizing financial data, sales overviews, or inventory distributions, present figures cleanly using:
1. Markdown Tables for structured row-and-column data.
2. Visual Progress Bars for percentage distributions, e.g.:
   - **Paid Revenue**: [████████░░] 80% ($80,000)
   - **Pending Outstanding**: [██░░░░░░░░] 20% ($20,000)
3. Chart code blocks for metric comparisons, e.g.:
\`\`\`chart
Paid Invoices: 80000
Pending Invoices: 20000
\`\`\`

If the user provides an attached image or document (e.g. receipt photo, invoice PDF), inspect it carefully and extract relevant business fields automatically.`,
      tools: [{
        functionDeclarations: [
          getSalesOverviewTool,
          getInventoryAlertsTool,
          searchERPDataTool,
          createProductTool,
          createCustomerTool,
          createNotificationTool,
          createBOMTool,
          createWorkOrderTool,
          createPurchaseOrderTool,
          getFinancialStatementsTool
        ]
      }]
    })

    // Format the history items correctly for Gemini Chat Content objects, filtering out empty inputs
    const contents = history
      .filter(item => item.parts && item.parts.trim() !== '')
      .map(item => ({
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

    // Construct multimodal prompt payload
    const promptParts: any[] = [{ text: message }]
    if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
        promptParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        })
      })
    }

    let response = await chat.sendMessage(promptParts)
    let functionCalls = response.response.functionCalls()

    // Process tool executions in a loop to handle multi-turn logic (robust against nested queries)
    while (functionCalls && functionCalls.length > 0) {
      const functionResponses = await Promise.all(functionCalls.map(async (call) => {
        try {
          const rawResult = await handleToolCall(call.name, call.args, org.id, userId)
          // Essential: Serialize all database Decimals to plain numbers so the Gemini SDK can serialize them to JSON safely
          const toolResult = serializeDecimal(rawResult)
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
      response = followUp
      functionCalls = response.response.functionCalls()
    }

    const rawHistory = await chat.getHistory()
    const serializedHistory = rawHistory.map(h => ({
      role: h.role as 'user' | 'model',
      parts: h.parts.map(p => p.text || '').join(' ').trim()
    })).filter(h => h.parts !== '')

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
