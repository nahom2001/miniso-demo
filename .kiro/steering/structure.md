# Project Structure

```
src/
  config/
    brand.config.ts      — store name, logo, colours (swap for client rebrand)
    currencies.ts        — ETB/USD rates, formatPrice()
    features.ts          — feature flags for TBC items

  mock/
    db.ts                — in-memory store + localStorage persistence + reset
    erpBus.ts            — BroadcastChannel event bus for ERP ↔ Storefront sync
    simulator.ts         — random event generator (orders, stock alerts)
    seed/
      index.ts           — deterministic seed data (faker seed=42)
    services/
      products.ts        — async product/category/review queries with latency
      orders.ts          — order CRUD, dashboard stats
      inventory.ts       — stock levels, adjustments

  domain/
    types.ts             — ALL shared TypeScript types (no duplicates elsewhere)

  stores/
    authStore.ts         — user, login, logout, RBAC permissions
    cartStore.ts         — cart items, totals, coupon logic
    uiStore.ts           — language, currency, sidebar, toasts, demo bar

  components/
    ui/                  — primitive components (Button, Card, Input, Dialog…)
    shared/              — cross-surface components (ProductCard, OrderStatusBadge, layouts…)
    storefront/          — storefront-specific (CartDrawer…)
    admin/               — admin-specific components

  pages/
    storefront/          — HomePage, ProductDetailPage, SearchPage, CheckoutPage…
    account/             — AccountLayout (Outlet), AccountOverviewPage, AccountOrdersPage…
    admin/               — DashboardPage, OrdersPage, CataloguePage, InventoryPage…
    erp-sim/             — ErpSimulatorPage

  i18n/
    en.json              — English strings
    am.json              — Amharic strings
    index.ts             — i18next init

  routes.tsx             — all routes, lazy imports, RequireAuth / RequireAdmin guards
  App.tsx                — root component, language sync
  main.tsx               — React root, QueryClient, BrowserRouter
  index.css              — Tailwind base + CSS variables + global utilities
```

Key conventions:
- Types live ONLY in `domain/types.ts` — import from there everywhere
- All mock data lives in `mock/seed/index.ts` — no inline fake data in components
- All async operations go through `mock/services/` — no direct `db` reads in components
- Use `useUIStore` for language/currency — never hardcode locale in components
