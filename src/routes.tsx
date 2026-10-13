import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, usePermission } from '@/stores/authStore'

// ─── Eager (tiny, needed on first load) ─────────────────────────────────────
import { LoginPage } from '@/pages/storefront/LoginPage'
import { HomePage } from '@/pages/storefront/HomePage'

// ─── Lazy storefront ─────────────────────────────────────────────────────────
const ProductDetailPage   = lazy(() => import('@/pages/storefront/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })))
const CategoryPage        = lazy(() => import('@/pages/storefront/CategoryPage').then(m => ({ default: m.CategoryPage })))
const SearchPage          = lazy(() => import('@/pages/storefront/SearchPage').then(m => ({ default: m.SearchPage })))
const CheckoutPage        = lazy(() => import('@/pages/storefront/CheckoutPage').then(m => ({ default: m.CheckoutPage })))
const OrderConfirmationPage = lazy(() => import('@/pages/storefront/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })))
const RegisterPage        = lazy(() => import('@/pages/storefront/RegisterPage').then(m => ({ default: m.RegisterPage })))

// ─── Lazy account ────────────────────────────────────────────────────────────
const AccountLayout       = lazy(() => import('@/pages/account/AccountLayout').then(m => ({ default: m.AccountLayout })))
const AccountOverviewPage = lazy(() => import('@/pages/account/AccountOverviewPage').then(m => ({ default: m.AccountOverviewPage })))
const AccountOrdersPage   = lazy(() => import('@/pages/account/AccountOrdersPage').then(m => ({ default: m.AccountOrdersPage })))
const AccountOrderDetailPage = lazy(() => import('@/pages/account/AccountOrderDetailPage').then(m => ({ default: m.AccountOrderDetailPage })))
const AccountWishlistPage = lazy(() => import('@/pages/account/AccountWishlistPage').then(m => ({ default: m.AccountWishlistPage })))
const AccountProfilePage  = lazy(() => import('@/pages/account/AccountProfilePage').then(m => ({ default: m.AccountProfilePage })))
const AccountAddressesPage = lazy(() => import('@/pages/account/AccountAddressesPage').then(m => ({ default: m.AccountAddressesPage })))

// ─── Lazy admin ──────────────────────────────────────────────────────────────
const DashboardPage       = lazy(() => import('@/pages/admin/DashboardPage').then(m => ({ default: m.DashboardPage })))
const OrdersPage          = lazy(() => import('@/pages/admin/OrdersPage').then(m => ({ default: m.OrdersPage })))
const OrderDetailPage     = lazy(() => import('@/pages/admin/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })))
const ReturnsPage         = lazy(() => import('@/pages/admin/ReturnsPage').then(m => ({ default: m.ReturnsPage })))
const CataloguePage       = lazy(() => import('@/pages/admin/CataloguePage').then(m => ({ default: m.CataloguePage })))
const InventoryPage       = lazy(() => import('@/pages/admin/InventoryPage').then(m => ({ default: m.InventoryPage })))
const MarketingPage       = lazy(() => import('@/pages/admin/MarketingPage').then(m => ({ default: m.MarketingPage })))
const ReportsPage         = lazy(() => import('@/pages/admin/ReportsPage').then(m => ({ default: m.ReportsPage })))
const CustomersPage       = lazy(() => import('@/pages/admin/CustomersPage').then(m => ({ default: m.CustomersPage })))
const UsersRolesPage      = lazy(() => import('@/pages/admin/UsersRolesPage').then(m => ({ default: m.UsersRolesPage })))
const IntegrationsPage    = lazy(() => import('@/pages/admin/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })))
const BackupPage          = lazy(() => import('@/pages/admin/BackupPage').then(m => ({ default: m.BackupPage })))
const NotificationsPage   = lazy(() => import('@/pages/admin/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const AuditLogPage        = lazy(() => import('@/pages/admin/AuditLogPage').then(m => ({ default: m.AuditLogPage })))
const SettingsPage        = lazy(() => import('@/pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })))

// ─── ERP Simulator ───────────────────────────────────────────────────────────
const ErpSimulatorPage    = lazy(() => import('@/pages/erp-sim/ErpSimulatorPage').then(m => ({ default: m.ErpSimulatorPage })))

// ─── Route guards ────────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const canView = usePermission('view_dashboard')
  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">No Permission</h1>
          <p className="text-muted-foreground mb-4">You don't have access to this area.</p>
          <a href="/" className="text-brand-600 hover:underline">← Back to Storefront</a>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

// ─── Loading fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
      </div>
    </div>
  )
}

// ─── 404 page ────────────────────────────────────────────────────────────────
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-8xl font-black text-brand-600 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors font-medium">
          ← Back to Home
        </a>
      </div>
    </div>
  )
}

// ─── Routes ──────────────────────────────────────────────────────────────────
export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Storefront ─────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Account ────────────────────────────────────────── */}
        <Route path="/account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
          <Route index element={<AccountOverviewPage />} />
          <Route path="orders" element={<AccountOrdersPage />} />
          <Route path="orders/:orderId" element={<AccountOrderDetailPage />} />
          <Route path="wishlist" element={<AccountWishlistPage />} />
          <Route path="profile" element={<AccountProfilePage />} />
          <Route path="addresses" element={<AccountAddressesPage />} />
        </Route>

        {/* ── Admin ──────────────────────────────────────────── */}
        <Route path="/admin" element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
        <Route path="/admin/orders" element={<RequireAdmin><OrdersPage /></RequireAdmin>} />
        <Route path="/admin/orders/:orderId" element={<RequireAdmin><OrderDetailPage /></RequireAdmin>} />
        <Route path="/admin/returns" element={<RequireAdmin><ReturnsPage /></RequireAdmin>} />
        <Route path="/admin/catalogue" element={<RequireAdmin><CataloguePage /></RequireAdmin>} />
        <Route path="/admin/catalogue/:section" element={<RequireAdmin><CataloguePage /></RequireAdmin>} />
        <Route path="/admin/inventory" element={<RequireAdmin><InventoryPage /></RequireAdmin>} />
        <Route path="/admin/marketing" element={<RequireAdmin><MarketingPage /></RequireAdmin>} />
        <Route path="/admin/reports" element={<RequireAdmin><ReportsPage /></RequireAdmin>} />
        <Route path="/admin/customers" element={<RequireAdmin><CustomersPage /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><UsersRolesPage /></RequireAdmin>} />
        <Route path="/admin/integrations" element={<RequireAdmin><IntegrationsPage /></RequireAdmin>} />
        <Route path="/admin/api-docs" element={<RequireAdmin><IntegrationsPage /></RequireAdmin>} />
        <Route path="/admin/backup" element={<RequireAdmin><BackupPage /></RequireAdmin>} />
        <Route path="/admin/notifications" element={<RequireAdmin><NotificationsPage /></RequireAdmin>} />
        <Route path="/admin/audit" element={<RequireAdmin><AuditLogPage /></RequireAdmin>} />
        <Route path="/admin/settings" element={<RequireAdmin><SettingsPage /></RequireAdmin>} />

        {/* ── ERP Simulator ──────────────────────────────────── */}
        <Route path="/erp-sim" element={<ErpSimulatorPage />} />
        <Route path="/erp-sim/*" element={<ErpSimulatorPage />} />

        {/* ── Fallback ───────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
