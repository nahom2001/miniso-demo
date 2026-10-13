/**
 * Cross-tab ERP event bus using BroadcastChannel.
 * Storefront and ERP simulator can run in separate tabs and see each other's events.
 */
import type { SyncLogEntry, SyncDirection, SyncEntity, SyncStatus } from '@/domain/types'
import { db } from './db'

export type ErpEvent =
  | { type: 'STOCK_UPDATED'; variantId: string; qty: number; locationId: string }
  | { type: 'ORDER_CREATED'; orderId: string; orderNumber: string; total: number }
  | { type: 'PAYMENT_SETTLED'; paymentId: string; orderId: string; amount: number }
  | { type: 'SYNC_REQUEST' }

type Listener = (event: ErpEvent) => void
const listeners = new Set<Listener>()

let channel: BroadcastChannel | null = null

function getChannel() {
  if (!channel) {
    channel = new BroadcastChannel('miniso_erp_bus')
    channel.onmessage = (e: MessageEvent<ErpEvent>) => {
      listeners.forEach((l) => l(e.data))
    }
  }
  return channel
}

export const erpBus = {
  emit(event: ErpEvent) {
    getChannel().postMessage(event)
    listeners.forEach((l) => l(event))
    // Record sync log
    const entity: SyncEntity = event.type === 'STOCK_UPDATED' ? 'inventory'
      : event.type.startsWith('PAYMENT') ? 'payment' : 'order'
    const direction: SyncDirection = 'storefront→erp'
    const entry: SyncLogEntry = {
      id: `sync-${Date.now()}`,
      direction,
      entity,
      entityId: 'orderId' in event ? event.orderId : 'variantId' in event ? event.variantId : '',
      status: 'success',
      ts: new Date().toISOString(),
      payload: event,
      retryCount: 0,
    }
    db.syncLog.unshift(entry)
    if (db.syncLog.length > 100) db.syncLog.pop()
  },
  on(listener: Listener) {
    listeners.add(listener)
    getChannel()
    return () => listeners.delete(listener)
  },
  simulateFailure(event: ErpEvent) {
    const entity: SyncEntity = event.type === 'STOCK_UPDATED' ? 'inventory'
      : event.type.startsWith('PAYMENT') ? 'payment' : 'order'
    const entry: SyncLogEntry = {
      id: `sync-${Date.now()}`,
      direction: 'storefront→erp',
      entity,
      entityId: '',
      status: 'failed',
      ts: new Date().toISOString(),
      payload: event,
      retryCount: 0,
    }
    db.syncLog.unshift(entry)
  },
}
