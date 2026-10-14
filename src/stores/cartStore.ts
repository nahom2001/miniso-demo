import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartTotals } from '@/domain/types'
import type { CurrencyCode } from '@/config/currencies'
import { convertPrice } from '@/config/currencies'
import * as seed from '@/mock/seed'

interface CartState {
  items: CartItem[]
  couponCode: string
  currency: CurrencyCode
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, qty: number) => void
  clearCart: () => void
  applyCoupon: (code: string) => { success: boolean; message: string }
  removeCoupon: () => void
  setOpen: (open: boolean) => void
  getTotals: () => CartTotals
}

const VAT_RATE = 0.15
const SHIPPING_ETB = 80

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: '',
      currency: 'ETB',
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return { items: state.items.map((i) => i.variantId === item.variantId ? { ...i, qty: i.qty + item.qty } : i) }
          }
          return { items: [...state.items, item], isOpen: true }
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      updateQty: (variantId, qty) =>
        set((state) => {
          if (qty <= 0) return { items: state.items.filter((i) => i.variantId !== variantId) }
          return { items: state.items.map((i) => i.variantId === variantId ? { ...i, qty } : i) }
        }),

      clearCart: () => set({ items: [], couponCode: '' }),

      applyCoupon: (code) => {
        const coupon = seed.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase())
        if (!coupon) return { success: false, message: 'Invalid coupon code' }
        if (!coupon.active) return { success: false, message: 'This coupon has expired' }
        if (coupon.used >= coupon.usageLimit) return { success: false, message: 'Coupon usage limit reached' }
        if (new Date(coupon.expiresAt) < new Date()) return { success: false, message: 'Coupon has expired' }
        const { getTotals } = get()
        const totals = getTotals()
        if (totals.subtotal < coupon.minBasket) return { success: false, message: `Minimum basket is Br ${coupon.minBasket}` }
        set({ couponCode: code.toUpperCase() })
        return { success: true, message: `Coupon ${code.toUpperCase()} applied!` }
      },

      removeCoupon: () => set({ couponCode: '' }),

      setOpen: (open) => set({ isOpen: open }),

      getTotals: (): CartTotals => {
        const { items, couponCode, currency } = get()
        const subtotalEtb = items.reduce((s, i) => s + i.unitPrice * i.qty, 0)
        let discountEtb = 0
        if (couponCode) {
          const coupon = seed.coupons.find((c) => c.code === couponCode)
          if (coupon && coupon.active) {
            discountEtb = coupon.type === 'percentage'
              ? subtotalEtb * (coupon.value / 100)
              : Math.min(coupon.value, subtotalEtb)
          }
        }
        const shippingEtb = items.length > 0 ? SHIPPING_ETB : 0
        const vatEtb = (subtotalEtb - discountEtb + shippingEtb) * VAT_RATE
        const totalEtb = subtotalEtb - discountEtb + shippingEtb + vatEtb

        const r = (v: number) => convertPrice(v, currency)
        return {
          subtotal: r(subtotalEtb),
          discount: r(discountEtb),
          shipping: r(shippingEtb),
          vat: r(vatEtb),
          total: r(totalEtb),
          currency,
        }
      },
    }),
    { name: 'miniso_cart_v3' }
  )
)
