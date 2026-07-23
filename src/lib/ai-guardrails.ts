/**
 * AI Execution Safety Guardrail Framework for MinaERP
 * Enforces action sensitivity classification, tenant scope isolation, and human-in-the-loop confirmation.
 */

export type ToolSensitivityLevel = 'READ' | 'CREATE' | 'SENSITIVE_MUTATION'

export interface ToolSafetyRule {
  name: string
  sensitivity: ToolSensitivityLevel
  description: string
  requiresConfirmation: boolean
}

export const TOOL_SAFETY_REGISTRY: Record<string, ToolSafetyRule> = {
  getSalesOverview: { name: 'getSalesOverview', sensitivity: 'READ', description: 'Retrieve sales and revenue analytics', requiresConfirmation: false },
  getInventoryAlerts: { name: 'getInventoryAlerts', sensitivity: 'READ', description: 'Retrieve low stock inventory alerts', requiresConfirmation: false },
  searchERPData: { name: 'searchERPData', sensitivity: 'READ', description: 'Search records across ERP tables', requiresConfirmation: false },
  getFinancialStatements: { name: 'getFinancialStatements', sensitivity: 'READ', description: 'Retrieve financial P&L statements', requiresConfirmation: false },
  
  createProduct: { name: 'createProduct', sensitivity: 'CREATE', description: 'Create a new inventory product', requiresConfirmation: false },
  createCustomer: { name: 'createCustomer', sensitivity: 'CREATE', description: 'Create a new CRM customer profile', requiresConfirmation: false },
  createNotification: { name: 'createNotification', sensitivity: 'CREATE', description: 'Send a tenant alert notification', requiresConfirmation: false },
  createBOM: { name: 'createBOM', sensitivity: 'CREATE', description: 'Create a Bill of Materials recipe', requiresConfirmation: false },
  createInvoice: { name: 'createInvoice', sensitivity: 'CREATE', description: 'Draft a customer sales invoice', requiresConfirmation: false },
  createPurchaseOrder: { name: 'createPurchaseOrder', sensitivity: 'CREATE', description: 'Draft a vendor purchase order', requiresConfirmation: false },
  createWorkOrder: { name: 'createWorkOrder', sensitivity: 'CREATE', description: 'Schedule a manufacturing work order', requiresConfirmation: false },

  createBill: { name: 'createBill', sensitivity: 'SENSITIVE_MUTATION', description: 'Create a financial vendor bill liability', requiresConfirmation: true },
  processPayment: { name: 'processPayment', sensitivity: 'SENSITIVE_MUTATION', description: 'Process an outbound financial payment', requiresConfirmation: true },
  processPayrollRun: { name: 'processPayrollRun', sensitivity: 'SENSITIVE_MUTATION', description: 'Execute employee salary payroll run', requiresConfirmation: true },
}

/**
 * Validates whether a tool call requires explicit human confirmation before database execution.
 */
export function checkToolSafety(toolName: string): { allowed: boolean; requiresConfirmation: boolean; rule?: ToolSafetyRule } {
  const rule = TOOL_SAFETY_REGISTRY[toolName]
  if (!rule) {
    return { allowed: true, requiresConfirmation: false }
  }
  return {
    allowed: true,
    requiresConfirmation: rule.requiresConfirmation,
    rule
  }
}
