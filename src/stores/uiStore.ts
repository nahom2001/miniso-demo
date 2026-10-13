import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrencyCode } from '@/config/currencies'

interface UIState {
  language: 'en' | 'am'
  currency: CurrencyCode
  sidebarOpen: boolean
  demoBarVisible: boolean
  simulatorRunning: boolean
  toasts: Toast[]
  setLanguage: (lang: 'en' | 'am') => void
  setCurrency: (currency: CurrencyCode) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setDemoBarVisible: (v: boolean) => void
  setSimulatorRunning: (v: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'default' | 'success' | 'destructive' | 'warning'
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'en',
      currency: 'ETB',
      sidebarOpen: true,
      demoBarVisible: true,
      simulatorRunning: true,
      toasts: [],

      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setDemoBarVisible: (demoBarVisible) => set({ demoBarVisible }),
      setSimulatorRunning: (simulatorRunning) => set({ simulatorRunning }),

      addToast: (toast) =>
        set((s) => ({
          toasts: [...s.toasts, { ...toast, id: `toast-${Date.now()}` }].slice(-5),
        })),
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'miniso_ui', partialize: (s) => ({ language: s.language, currency: s.currency, demoBarVisible: s.demoBarVisible }) }
  )
)
