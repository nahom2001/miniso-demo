import type { CurrencyCode } from '@/config/currencies'

// ─── Auth & Users ────────────────────────────────────────────────────────────
export type Role = 'guest' | 'customer' | 'staff' | 'marketing' | 'finance' | 'admin' | 'manager'

export interface User {
  id: string
  name: string
  email: string
  phone?: string        // primary identifier per proposal (phone number)
  faydaId?: string      // Fayda national ID — required for customer registration
  role: Role
  locale: 'en' | 'am'
  currencyPref: CurrencyCode
  avatar?: string
  createdAt: string
}

// ─── Catalogue ───────────────────────────────────────────────────────────────
export interface LocalizedString {
  en: string
  am: string
}

export interface Category {
  id: string
  parentId: string | null
  name: LocalizedString
  slug: string
  image?: string
  seo: SeoMeta
  productCount: number
}

export interface Attribute {
  id: string
  name: string
  values: string[]
}

export interface ProductPrice {
  ETB: number
  USD: number
}

export interface ScheduledPrice {
  id: string
  prices: ProductPrice
  startDate: string
  endDate: string
}

export interface SeoMeta {
  slug: string
  metaTitle: string
  metaDescription: string
}

export type ProductStatus = 'active' | 'draft' | 'archived'

export interface Product {
  id: string
  sku: string
  name: LocalizedString
  description: LocalizedString
  categoryIds: string[]
  tags: string[]
  brand: string
  images: string[]
  isDigital: boolean
  status: ProductStatus
  prices: ProductPrice
  scheduledPrices: ScheduledPrice[]
  seo: SeoMeta
  rating: number
  reviewCount: number
  createdAt: string
}

export interface Variant {
  id: string
  productId: string
  sku: string
  options: Record<string, string>
  prices: ProductPrice
  image?: string
  stock?: number
}

// ─── Inventory ───────────────────────────────────────────────────────────────
export type LocationId = 'online' | 'bole' | 'piassa' | 'megenagna'

export interface StockItem {
  variantId: string
  locationId: LocationId
  qty: number
  lowThreshold: number
}

export type AdjustmentReason = 'damage' | 'recount' | 'return' | 'transfer' | 'initial' | 'other'

export interface StockAdjustment {
  id: string
  variantId: string
  locationId: LocationId
  delta: number
  reasonCode: AdjustmentReason
  userId: string
  note: string
  ts: string
}

// ─── Cart & Checkout ─────────────────────────────────────────────────────────
export interface CartItem {
  variantId: string
  productId: string
  qty: number
  unitPrice: number // ETB
}

export interface CartTotals {
  subtotal: number
  discount: number
  shipping: number
  vat: number
  total: number
  currency: CurrencyCode
}

export interface Address {
  id: string
  userId: string
  label: string
  fullName: string
  phone: string
  city: string
  subCity: string
  woreda: string
  detail: string
  isDefault: boolean
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'placed'
  | 'paid'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded'

export interface OrderItem {
  variantId: string
  productId: string
  productName: string
  variantLabel: string
  image: string
  qty: number
  unitPrice: number
  total: number
}

export interface OrderTotals {
  subtotal: number
  discount: number
  shipping: number
  vat: number
  total: number
  currency: CurrencyCode
}

export interface OrderTimelineEntry {
  status: OrderStatus
  ts: string
  note?: string
  userId?: string
}

export interface Order {
  id: string
  number: string
  customerId: string | null // null = guest
  customerName: string
  customerEmail: string
  items: OrderItem[]
  totals: OrderTotals
  status: OrderStatus
  timeline: OrderTimelineEntry[]
  paymentId: string
  deliveryZoneId: string
  partnerId: string | null
  notes: OrderNote[]
  address: Omit<Address, 'id' | 'userId' | 'isDefault'>
  couponCode?: string
  channel: 'online' | 'pos' | 'phone'
  createdAt: string
}

export interface OrderNote {
  id: string
  userId: string
  text: string
  ts: string
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export type PaymentMethod = 'card' | 'telebirr' | 'cbe_birr' | 'bank_transfer' | 'cash_on_delivery'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  orderId: string
  method: PaymentMethod
  currency: CurrencyCode
  amount: number
  status: PaymentStatus
  gatewayRef: string
  createdAt: string
}

// ─── Refunds & Returns ───────────────────────────────────────────────────────
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed'
export type ReturnResolution = 'refund' | 'exchange' | 'store_credit'

export interface Refund {
  id: string
  orderId: string
  amount: number
  type: 'full' | 'partial'
  status: RefundStatus
  reason: string
  requestedBy: string
  approvedBy?: string
  auditLog: AuditEntry[]
  createdAt: string
}

export interface ReturnRequest {
  id: string
  orderId: string
  items: { variantId: string; qty: number; reason: string }[]
  resolution: ReturnResolution
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// ─── Delivery ────────────────────────────────────────────────────────────────
export interface DeliveryZone {
  id: string
  name: string
  rate: number // ETB
  etaDays: number
}

export interface DeliveryPartner {
  id: string
  name: string
  trackingUrl?: string
}

// ─── Coupons ─────────────────────────────────────────────────────────────────
export type CouponType = 'percentage' | 'fixed'

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  minBasket: number
  usageLimit: number
  used: number
  expiresAt: string
  active: boolean
}

// ─── Marketing ───────────────────────────────────────────────────────────────
export interface Banner {
  id: string
  image: string
  link: string
  title: string
  subtitle: string
  order: number
  startDate: string
  endDate: string
  active: boolean
}

export type CampaignChannel = 'email' | 'sms'
export type CampaignSegment = 'all' | 'new' | 'returning' | 'abandoned_cart'

export interface Campaign {
  id: string
  name: string
  channel: CampaignChannel
  segment: CampaignSegment
  subject: string
  body: string
  sentAt?: string
  stats: { sent: number; opened: number; clicked: number }
  status: 'draft' | 'sent'
  createdAt: string
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  text: string
  status: ReviewStatus
  createdAt: string
}

// ─── Wishlist ────────────────────────────────────────────────────────────────
export interface WishlistItem {
  productId: string
  addedAt: string
}

// ─── Notifications ───────────────────────────────────────────────────────────
export type NotificationType =
  | 'order_placed'
  | 'order_paid'
  | 'order_shipped'
  | 'order_delivered'
  | 'low_stock'
  | 'refund_approved'
  | 'campaign_sent'
  | 'system'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  ts: string
  link?: string
}

// ─── ERP / Sync ──────────────────────────────────────────────────────────────
export type SyncDirection = 'storefront→erp' | 'erp→storefront'
export type SyncEntity = 'inventory' | 'order' | 'payment'
export type SyncStatus = 'success' | 'failed' | 'pending'

export interface SyncLogEntry {
  id: string
  direction: SyncDirection
  entity: SyncEntity
  entityId: string
  status: SyncStatus
  ts: string
  payload: unknown
  retryCount: number
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface AuditEntry {
  id: string
  userId: string
  action: string
  entity: string
  entityId: string
  ts: string
  before?: unknown
  after?: unknown
}

export interface Backup {
  id: string
  ts: string
  size: string
  status: 'completed' | 'failed' | 'running'
  type: 'auto' | 'manual'
}

export interface IntegrationStatus {
  id: string
  name: string
  type: 'erp' | 'payment' | 'sms' | 'email' | 'delivery'
  status: 'connected' | 'not_configured' | 'error'
  lastSync?: string
}
