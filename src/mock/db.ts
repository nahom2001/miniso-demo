/**
 * In-memory database with localStorage persistence.
 * Reset reloads the original seed data.
 */
import * as seed from './seed'
import type { Order, Product, StockItem, Notification, SyncLogEntry, User, AuditEntry } from '@/domain/types'

const STORAGE_KEY = 'miniso_demo_db_v3'

export interface DB {
  products: Product[]
  orders: Order[]
  stockItems: StockItem[]
  notifications: Notification[]
  syncLog: SyncLogEntry[]
  users: User[]
  auditLog: AuditEntry[]
  cartAbandoned: string[] // user IDs with abandoned carts
}

function freshDB(): DB {
  return {
    products: JSON.parse(JSON.stringify(seed.products)),
    orders: JSON.parse(JSON.stringify(seed.orders)),
    stockItems: JSON.parse(JSON.stringify(seed.stockItems)),
    notifications: JSON.parse(JSON.stringify(seed.notifications)),
    syncLog: JSON.parse(JSON.stringify(seed.syncLog)),
    users: JSON.parse(JSON.stringify(seed.users)),
    auditLog: JSON.parse(JSON.stringify(seed.auditLog)),
    cartAbandoned: [],
  }
}

function loadDB(): DB {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as DB
  } catch {
    // ignore parse errors
  }
  return freshDB()
}

function saveDB(db: DB) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // ignore quota errors in demo
  }
}

let _db: DB = loadDB()

export const db = {
  get(): DB {
    return _db
  },
  save() {
    saveDB(_db)
  },
  reset() {
    _db = freshDB()
    saveDB(_db)
  },
  // Convenience getters (read-only snapshots)
  get products() { return _db.products },
  get orders() { return _db.orders },
  get stockItems() { return _db.stockItems },
  get notifications() { return _db.notifications },
  get syncLog() { return _db.syncLog },
  get users() { return _db.users },
  get auditLog() { return _db.auditLog },
}

export function resetDemoData() {
  db.reset()
  window.location.reload()
}
