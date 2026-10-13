/**
 * Event simulator — generates random orders, stock alerts, notifications.
 * Can be started/paused from the Demo Control Bar.
 */
import { db } from './db'
import { erpBus } from './erpBus'
import type { Order, OrderStatus, Notification } from '@/domain/types'
import * as seed from './seed'

type SimulatorListener = (event: SimEvent) => void
export type SimEvent =
  | { type: 'NEW_ORDER'; order: Order }
  | { type: 'STOCK_ALERT'; productName: string; qty: number }
  | { type: 'PAYMENT_RECEIVED'; orderId: string; amount: number }

const listeners = new Set<SimulatorListener>()
let intervalId: ReturnType<typeof setInterval> | null = null
let orderCounter = 10200

export const simulator = {
  start() {
    if (intervalId) return
    intervalId = setInterval(() => {
      const roll = Math.random()
      if (roll < 0.4) simulator.triggerNewOrder()
      else if (roll < 0.7) simulator.triggerStockAlert()
      else simulator.triggerPayment()
    }, 8000)
  },
  stop() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  },
  triggerNewOrder() {
    const customers = db.users.filter((u) => u.role === 'customer')
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const prods = db.products.slice(0, 10)
    const prod = prods[Math.floor(Math.random() * prods.length)]
    const qty = Math.floor(Math.random() * 3) + 1
    const total = prod.prices.ETB * qty * 1.15

    const order: Order = {
      id: `ord-live-${Date.now()}`,
      number: `MIN-${orderCounter++}`,
      customerId: customer?.id ?? null,
      customerName: customer?.name ?? 'Guest Customer',
      customerEmail: customer?.email ?? 'guest@example.com',
      items: [{
        variantId: `default-${prod.id}`,
        productId: prod.id,
        productName: prod.name.en,
        variantLabel: 'Default',
        image: prod.images[0],
        qty,
        unitPrice: prod.prices.ETB,
        total: prod.prices.ETB * qty,
      }],
      totals: { subtotal: prod.prices.ETB * qty, discount: 0, shipping: 80, vat: total * 0.15, total, currency: 'ETB' },
      status: 'placed',
      timeline: [{ status: 'placed', ts: new Date().toISOString() }],
      paymentId: `pay-live-${Date.now()}`,
      deliveryZoneId: 'zone-1',
      partnerId: null,
      notes: [],
      address: { label: 'Home', fullName: customer?.name ?? 'Guest', phone: '+251 912345678', city: 'Addis Ababa', subCity: 'Bole', woreda: '3', detail: 'Near Friendship mall' },
      channel: 'online',
      createdAt: new Date().toISOString(),
    }

    db.orders.unshift(order)
    db.save()

    const notif: Notification = {
      id: `notif-live-${Date.now()}`,
      userId: 'usr-admin',
      type: 'order_placed',
      title: 'New Order!',
      body: `Order ${order.number} placed by ${order.customerName}`,
      read: false,
      ts: new Date().toISOString(),
      link: `/admin/orders/${order.id}`,
    }
    db.notifications.unshift(notif)

    erpBus.emit({ type: 'ORDER_CREATED', orderId: order.id, orderNumber: order.number, total })
    listeners.forEach((l) => l({ type: 'NEW_ORDER', order }))
  },
  triggerStockAlert() {
    const lowItems = db.stockItems.filter((s) => s.qty <= s.lowThreshold + 5)
    if (!lowItems.length) return
    const item = lowItems[Math.floor(Math.random() * lowItems.length)]
    const prod = db.products.find((p) => p.id === item.variantId.replace('default-', ''))
    if (!prod) return

    const notif: Notification = {
      id: `notif-stock-${Date.now()}`,
      userId: 'usr-admin',
      type: 'low_stock',
      title: 'Low Stock Alert',
      body: `${prod.name.en} — only ${item.qty} left at ${item.locationId}`,
      read: false,
      ts: new Date().toISOString(),
      link: '/admin/inventory',
    }
    db.notifications.unshift(notif)
    listeners.forEach((l) => l({ type: 'STOCK_ALERT', productName: prod.name.en, qty: item.qty }))
  },
  triggerPayment() {
    const order = db.orders.find((o) => o.status === 'placed')
    if (!order) return
    order.status = 'paid' as OrderStatus
    order.timeline.push({ status: 'paid', ts: new Date().toISOString() })
    db.save()
    erpBus.emit({ type: 'PAYMENT_SETTLED', paymentId: order.paymentId, orderId: order.id, amount: order.totals.total })
    listeners.forEach((l) => l({ type: 'PAYMENT_RECEIVED', orderId: order.id, amount: order.totals.total }))
  },
  on(listener: SimulatorListener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  isRunning() {
    return intervalId !== null
  },
}

// Auto-start in demo mode
simulator.start()
