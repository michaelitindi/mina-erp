'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { Decimal } from '@prisma/client/runtime/library'

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')
  
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })
  if (!org) throw new Error('Organization not found')
  
  return { clerkUserId: userId, orgId: org.id }
}

// ============================================
// TERMINAL MANAGEMENT
// ============================================

export async function getTerminals() {
  const { orgId } = await getOrganization()
  
  return prisma.pOSTerminal.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  })
}

export async function createTerminal(data: {
  name: string
  location?: string
}) {
  const { orgId } = await getOrganization()
  
  const terminal = await prisma.pOSTerminal.create({
    data: {
      organizationId: orgId,
      name: data.name,
      location: data.location,
    },
  })
  
  revalidatePath('/dashboard/pos')
  return terminal
}

export async function updateTerminal(id: string, data: {
  name?: string
  location?: string
  status?: string
}) {
  const { orgId } = await getOrganization()
  
  const terminal = await prisma.pOSTerminal.update({
    where: { id, organizationId: orgId },
    data,
  })
  
  revalidatePath('/dashboard/pos')
  return terminal
}

export async function deleteTerminal(id: string) {
  const { orgId } = await getOrganization()
  
  await prisma.pOSTerminal.delete({
    where: { id, organizationId: orgId },
  })
  
  revalidatePath('/dashboard/pos')
}

// ============================================
// SESSION/SHIFT MANAGEMENT
// ============================================

export async function getActiveSession() {
  const { orgId, clerkUserId } = await getOrganization()
  
  return prisma.pOSSession.findFirst({
    where: { 
      organizationId: orgId,
      cashierId: clerkUserId,
      status: 'OPEN',
    },
    include: { terminal: true },
  })
}

export async function getSessions(filters?: {
  terminalId?: string
  status?: string
  startDate?: Date
  endDate?: Date
}) {
  const { orgId } = await getOrganization()
  
  return prisma.pOSSession.findMany({
    where: { 
      organizationId: orgId,
      ...(filters?.terminalId && { terminalId: filters.terminalId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.startDate && { openedAt: { gte: filters.startDate } }),
      ...(filters?.endDate && { openedAt: { lte: filters.endDate } }),
    },
    include: { terminal: true },
    orderBy: { openedAt: 'desc' },
  })
}

export async function openSession(data: {
  terminalId: string
  openingCash: number
}) {
  const { orgId, clerkUserId } = await getOrganization()
  
  // Check if user already has an open session
  const existingSession = await prisma.pOSSession.findFirst({
    where: { 
      organizationId: orgId,
      cashierId: clerkUserId,
      status: 'OPEN',
    },
  })
  if (existingSession) {
    throw new Error('You already have an open shift. Close it before starting a new one.')
  }
  
  // Get user name from Clerk (or employee record)
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId },
    select: { firstName: true, lastName: true },
  })
  const cashierName = employee 
    ? `${employee.firstName} ${employee.lastName}` 
    : 'Unknown Cashier'
  
  const session = await prisma.pOSSession.create({
    data: {
      organizationId: orgId,
      terminalId: data.terminalId,
      cashierId: clerkUserId,
      cashierName,
      openingCash: data.openingCash,
    },
    include: { terminal: true },
  })
  
  revalidatePath('/dashboard/pos')
  return session
}

export async function closeSession(id: string, data: {
  closingCash: number
  notes?: string
}) {
  const { orgId } = await getOrganization()
  
  // Get session with cash sales
  const session = await prisma.pOSSession.findUnique({
    where: { id, organizationId: orgId },
    include: {
      sales: {
        include: { payments: true },
      },
    },
  })
  if (!session) throw new Error('Session not found')
  if (session.status === 'CLOSED') throw new Error('Session already closed')
  
  // Calculate expected cash
  const cashSales = session.sales.reduce((total, sale) => {
    const cashPayments = sale.payments
      .filter(p => p.providerType === 'CASH')
      .reduce((sum, p) => sum + Number(p.amount), 0)
    return total + cashPayments
  }, 0)
  
  const expectedCash = Number(session.openingCash) + cashSales
  const cashDifference = data.closingCash - expectedCash
  
  const updated = await prisma.pOSSession.update({
    where: { id },
    data: {
      closedAt: new Date(),
      closingCash: data.closingCash,
      expectedCash,
      cashDifference,
      status: 'CLOSED',
      notes: data.notes,
    },
  })
  
  revalidatePath('/dashboard/pos')
  return updated
}

// ============================================
// SALES
// ============================================

export async function getSales(sessionId?: string) {
  const { orgId } = await getOrganization()
  
  return prisma.pOSSale.findMany({
    where: { 
      organizationId: orgId,
      ...(sessionId && { sessionId }),
    },
    include: {
      items: true,
      payments: true,
      customer: { select: { id: true, companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

export async function getSaleById(id: string) {
  const { orgId } = await getOrganization()
  
  return prisma.pOSSale.findUnique({
    where: { id, organizationId: orgId },
    include: {
      items: { include: { product: true } },
      payments: true,
      customer: true,
      session: { include: { terminal: true } },
    },
  })
}

async function generateSaleNumber(orgId: string): Promise<string> {
  const count = await prisma.pOSSale.count({ where: { organizationId: orgId } })
  return `POS-${String(count + 1).padStart(6, '0')}`
}

export async function createSale(data: {
  sessionId: string
  items: Array<{
    productId: string
    productName: string
    productSku?: string
    quantity: number
    unitPrice: number
    discount?: number
  }>
  payments: Array<{
    providerType: string
    method: string
    amount: number
    reference?: string
    changeGiven?: number
  }>
  customerId?: string
  customerName?: string
  discountAmount?: number
  discountType?: string
  taxAmount?: number
}) {
  const { orgId, clerkUserId } = await getOrganization()
  
  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice - (item.discount || 0)
    return sum + itemTotal
  }, 0)
  
  const discountAmount = data.discountAmount || 0
  const taxAmount = data.taxAmount || 0
  const totalAmount = subtotal - discountAmount + taxAmount
  
  const saleNumber = await generateSaleNumber(orgId)
  
  const sale = await prisma.pOSSale.create({
    data: {
      organizationId: orgId,
      sessionId: data.sessionId,
      saleNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      subtotal,
      discountAmount,
      discountType: data.discountType,
      taxAmount,
      totalAmount,
      createdBy: clerkUserId,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          total: item.quantity * item.unitPrice - (item.discount || 0),
        })),
      },
      payments: {
        create: data.payments.map(payment => ({
          providerType: payment.providerType,
          method: payment.method,
          amount: payment.amount,
          reference: payment.reference,
          changeGiven: payment.changeGiven,
        })),
      },
    },
    include: {
      items: true,
      payments: true,
    },
  })
  
  // Deduct stock for each item (inventory integration)
  for (const item of data.items) {
    const movementCount = await prisma.stockMovement.count({ where: { organizationId: orgId } })
    await prisma.stockMovement.create({
      data: {
        organizationId: orgId,
        movementNumber: `SM-${String(movementCount + 1).padStart(6, '0')}`,
        productId: item.productId,
        type: 'OUT',
        reason: 'SALE',
        quantity: -item.quantity,
        referenceType: 'POS_SALE',
        referenceId: sale.id,
        notes: `POS Sale: ${saleNumber}`,
        createdBy: clerkUserId,
      },
    })
    
    // Update stock level
    await prisma.stockLevel.updateMany({
      where: { 
        productId: item.productId,
        organizationId: orgId,
      },
      data: {
        quantity: { decrement: item.quantity },
      },
    })
  }
  
  revalidatePath('/dashboard/pos')
  return sale
}

export async function voidSale(id: string, reason?: string) {
  const { orgId, clerkUserId } = await getOrganization()
  
  const sale = await prisma.pOSSale.findUnique({
    where: { id, organizationId: orgId },
    include: { items: true },
  })
  if (!sale) throw new Error('Sale not found')
  if (sale.status === 'VOIDED') throw new Error('Sale already voided')
  
  // Restore stock
  for (const item of sale.items) {
    await prisma.stockLevel.updateMany({
      where: { 
        productId: item.productId,
        organizationId: orgId,
      },
      data: {
        quantity: { increment: item.quantity },
      },
    })
    
    const movementCount = await prisma.stockMovement.count({ where: { organizationId: orgId } })
    await prisma.stockMovement.create({
      data: {
        organizationId: orgId,
        movementNumber: `SM-${String(movementCount + 1).padStart(6, '0')}`,
        productId: item.productId,
        type: 'IN',
        reason: 'RETURN',
        quantity: item.quantity,
        referenceType: 'POS_SALE',
        referenceId: sale.id,
        notes: `Voided POS Sale: ${reason || 'No reason'}`,
        createdBy: clerkUserId,
      },
    })
  }
  
  const updated = await prisma.pOSSale.update({
    where: { id },
    data: { status: 'VOIDED' },
  })
  
  revalidatePath('/dashboard/pos')
  return updated
}

// ============================================
// PRODUCTS FOR POS
// ============================================

export async function getProductsForPOS(search?: string) {
  const { orgId } = await getOrganization()
  
  return prisma.product.findMany({
    where: { 
      organizationId: orgId,
      isActive: true,
      isSellable: true,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select: {
      id: true,
      sku: true,
      name: true,
      sellingPrice: true,
      taxRate: true,
      imageUrl: true,
      barcode: true,
    },
    orderBy: { name: 'asc' },
    take: 50,
  })
}

// ============================================
// REPORTING
// ============================================

export async function getDailySummary(date?: Date) {
  const { orgId } = await getOrganization()
  
  const targetDate = date || new Date()
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)
  
  const sales = await prisma.pOSSale.findMany({
    where: {
      organizationId: orgId,
      createdAt: { gte: startOfDay, lte: endOfDay },
      status: 'COMPLETED',
    },
    include: { payments: true },
  })
  
  const totalSales = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
  const totalTransactions = sales.length
  
  // Group by payment method
  const byPaymentMethod = sales.reduce((acc, sale) => {
    for (const payment of sale.payments) {
      const type = payment.providerType
      if (!acc[type]) acc[type] = 0
      acc[type] += Number(payment.amount)
    }
    return acc
  }, {} as Record<string, number>)
  
  return {
    date: targetDate.toISOString().split('T')[0],
    totalSales,
    totalTransactions,
    averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
    byPaymentMethod,
  }
}
