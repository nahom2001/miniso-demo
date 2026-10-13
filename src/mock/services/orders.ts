import { db } from '@/mock/db'
import * as seed from '@/mock/seed'
import type { Order, OrderStatus, Refund, ReturnRequest } from '@/domain/types'

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 200))
}

export async function getOrders(opts?: { customerId?: string; status?: OrderStatus }): Promise<Order[]> {
  await delay(250)
  let orders = db.orders
  if (opts?.customerId) orders = orders.filter((o) => o.customerId === opts.customerId)
  if (opts?.status) orders = orders.filter((o) => o.status === opts.status)
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getOrder(id: string): Promise<Order | null> {
  await delay(150)
  return db.orders.find((o) => o.id === id) ?? null
}

export async function updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
  await delay(400)
  const order = db.orders.find((o) => o.id === id)
  if (!order) throw new Error('Order not found')
  order.status = status
  order.timeline.push({ status, ts: new Date().toISOString(), note })
  db.save()
  return order
}

export async function addOrderNote(orderId: string, text: string, userId: string): Promise<Order> {
  await delay(200)
  const order = db.orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  order.notes.push({ id: `note-${Date.now()}`, userId, text, ts: new Date().toISOString() })
  db.save()
  return order
}

export async function getRefunds(): Promise<Refund[]> {
  await delay(200)
  return seed.refunds
}

export async function getReturnRequests(): Promise<ReturnRequest[]> {
  await delay(200)
  return seed.returnRequests
}

export async function getPayments() {
  await delay(200)
  return seed.payments
}

export async function getDashboardStats() {
  await delay(300)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayOrders = db.orders.filter((o) => new Date(o.createdAt) >= todayStart)
  const todaySales = todayOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totals.total, 0)
  const totalOrders = db.orders.length
  const lowStock = db.stockItems.filter((s) => s.qty <= s.lowThreshold).length
  const pendingRefunds = seed.refunds.filter((r) => r.status === 'pending').length
  const avgBasket = db.orders.reduce((s, o) => s + o.totals.total, 0) / (db.orders.length || 1)

  // Sales over time (last 30 days)
  const salesByDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    salesByDay[key] = 0
  }
  db.orders.forEach((o) => {
    const key = o.createdAt.slice(0, 10)
    if (key in salesByDay) salesByDay[key] += o.totals.total
  })

  const salesChart = Object.entries(salesByDay).map(([date, value]) => ({ date, value }))

  // By category
  const byCat: Record<string, number> = {}
  db.orders.forEach((o) => o.items.forEach((it) => {
    const prod = db.products.find((p) => p.id === it.productId)
    const cat = prod?.categoryIds[0] ?? 'unknown'
    byCat[cat] = (byCat[cat] ?? 0) + it.total
  }))

  // By status
  const byStatus: Record<string, number> = {}
  db.orders.forEach((o) => { byStatus[o.status] = (byStatus[o.status] ?? 0) + 1 })

  return {
    todaySales,
    todayOrderCount: todayOrders.length,
    totalOrders,
    lowStock,
    pendingRefunds,
    avgBasket,
    conversionRate: 3.4,
    salesChart,
    byCat,
    byStatus,
  }
}
