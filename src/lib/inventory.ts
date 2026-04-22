import { prisma } from './prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function reserveStock(
  productId: string,
  warehouseId: string,
  quantity: number | Decimal,
  organizationId: string,
  tx: any = prisma
) {
  const qty = typeof quantity === 'number' ? new Decimal(quantity) : quantity

  // Find the stock level
  const stockLevel = await tx.stockLevel.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId
      }
    }
  })

  if (!stockLevel) {
    throw new Error(`No stock record found for product in specified warehouse.`)
  }

  if (stockLevel.availableQty.lessThan(qty)) {
    throw new Error(`Insufficient stock. Available: ${stockLevel.availableQty}, Requested: ${qty}`)
  }

  // Update stock level: increment reserved, decrement available
  return await tx.stockLevel.update({
    where: { id: stockLevel.id },
    data: {
      reservedQty: stockLevel.reservedQty.plus(qty),
      availableQty: stockLevel.availableQty.minus(qty),
    }
  })
}

export async function releaseStock(
  productId: string,
  warehouseId: string,
  quantity: number | Decimal,
  organizationId: string,
  tx: any = prisma
) {
  const qty = typeof quantity === 'number' ? new Decimal(quantity) : quantity

  const stockLevel = await tx.stockLevel.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId
      }
    }
  })

  if (!stockLevel) return

  // Update stock level: decrement reserved, increment available
  return await tx.stockLevel.update({
    where: { id: stockLevel.id },
    data: {
      reservedQty: Decimal.max(0, stockLevel.reservedQty.minus(qty)),
      availableQty: stockLevel.availableQty.plus(qty),
    }
  })
}

/**
 * Deduct stock permanently (used when an order is SHIPPED)
 */
export async function deductStock(
  productId: string,
  warehouseId: string,
  quantity: number | Decimal,
  organizationId: string,
  tx: any = prisma
) {
  const qty = typeof quantity === 'number' ? new Decimal(quantity) : quantity

  const stockLevel = await tx.stockLevel.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId
      }
    }
  })

  if (!stockLevel) throw new Error(`Stock record not found for deduction.`)

  // Final deduction: decrement total quantity and reserved quantity
  return await tx.stockLevel.update({
    where: { id: stockLevel.id },
    data: {
      quantity: stockLevel.quantity.minus(qty),
      reservedQty: Decimal.max(0, stockLevel.reservedQty.minus(qty)),
    }
  })
}
