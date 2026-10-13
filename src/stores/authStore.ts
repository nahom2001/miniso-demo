import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role } from '@/domain/types'
import { db } from '@/mock/db'
import * as seed from '@/mock/seed'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginAs: (userId: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        // Demo: match by email OR phone number
        await new Promise((r) => setTimeout(r, 600))
        const input = email.toLowerCase().trim()
        const user = db.users.find(
          (u) =>
            u.email.toLowerCase() === input ||
            (u.phone && u.phone.replace(/\s/g, '') === input.replace(/\s/g, ''))
        )
        if (!user) return false
        if (password !== 'demo123' && !user.email.endsWith('@demo')) return false
        set({ user, isAuthenticated: true })
        return true
      },

      loginAs: (userId) => {
        const user = db.users.find((u) => u.id === userId)
        if (user) set({ user, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        const current = get().user
        if (!current) return
        const updated = { ...current, ...updates }
        set({ user: updated })
        const idx = db.users.findIndex((u) => u.id === current.id)
        if (idx >= 0) {
          db.users[idx] = updated
          db.save()
        }
      },
    }),
    { name: 'miniso_auth' }
  )
)

// Permission matrix
const PERMISSIONS: Record<Role, string[]> = {
  guest: ['browse', 'search', 'view_product', 'view_cart'],
  customer: ['browse', 'search', 'view_product', 'view_cart', 'checkout', 'view_orders', 'manage_wishlist', 'manage_addresses', 'write_review'],
  staff: ['browse', 'search', 'view_product', 'view_cart', 'view_orders', 'manage_orders', 'manage_inventory', 'view_customers', 'view_dashboard'],
  marketing: ['browse', 'view_dashboard', 'manage_marketing', 'manage_banners', 'manage_campaigns', 'manage_coupons', 'view_reports', 'manage_seo', 'moderate_reviews'],
  finance: ['view_dashboard', 'view_orders', 'manage_refunds', 'view_reports', 'view_payments'],
  manager: ['browse', 'view_dashboard', 'manage_orders', 'manage_inventory', 'manage_customers', 'manage_refunds', 'approve_refunds', 'view_reports', 'manage_marketing'],
  admin: ['*'],
}

export function usePermission(permission: string): boolean {
  const user = useAuthStore((s) => s.user)
  const role: Role = user?.role ?? 'guest'
  const perms = PERMISSIONS[role] ?? []
  return perms.includes('*') || perms.includes(permission)
}

export function hasPermission(role: Role, permission: string): boolean {
  const perms = PERMISSIONS[role] ?? []
  return perms.includes('*') || perms.includes(permission)
}

export const DEMO_ACCOUNTS = seed.users.slice(0, 6).map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  password: 'demo123',
}))
