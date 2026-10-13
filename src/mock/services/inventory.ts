import { db } from '@/mock/db'
import * as seed from '@/mock/seed'
import type { StockAdjustment, LocationId, AdjustmentReason } from '@/domain/types'

function delay(ms = 250): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 200))
}

const adjustments: StockAdjustment[] = []

export async function getStockItems(locationId?: LocationId) {
  await delay(200)
  return locationId
    ? db.stockItems.filter((s) => s.locationId === locationId)
    : db.stockItems
}

export async function adjustStock(
  variantId: string,
  locationId: LocationId,
  delta: number,
  reasonCode: AdjustmentReason,
  userId: string,
  note = ''
): Promise<void> {
  await delay(300)
  const item = db.stockItems.find((s) => s.variantId === variantId && s.locationId === locationId)
  if (!item) throw new Error('Stock item not found')
  item.qty = Math.max(0, item.qty + delta)
  db.save()

  const adj: StockAdjustment = {
    id: `adj-${Date.now()}`,
    variantId,
    locationId,
    delta,
    reasonCode,
    userId,
    note,
    ts: new Date().toISOString(),
  }
  adjustments.push(adj)
}

export async function getAdjustments(): Promise<StockAdjustment[]> {
  await delay(150)
  return [...adjustments].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
}

export async function getLowStockItems() {
  await delay(200)
  return db.stockItems.filter((s) => s.qty <= s.lowThreshold).map((s) => {
    const variant = seed.variants.find((v) => v.id === s.variantId)
    const product = db.products.find((p) => p.id === variant?.productId || p.id === s.variantId.replace('default-', ''))
    return { ...s, productName: product?.name.en ?? s.variantId }
  })
}
