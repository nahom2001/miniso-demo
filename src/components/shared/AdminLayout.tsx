import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, BarChart2, Users, Settings,
  Tag, Warehouse, Megaphone, FileText, Shield, Plug, Database,
  Bell, ChevronLeft, ChevronRight, Menu, X, Activity, RefreshCw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { usePermission } from '@/stores/authStore'
import { db } from '@/mock/db'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { brand } from '@/config/brand.config'

interface NavItem {
  label: string
  icon: React.ReactNode
  to: string
  permission?: string
  badge?: number
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const unread = db.notifications.filter((n) => !n.read).length

  const navItems: NavItem[] = [
    { label: t('admin.dashboard'), icon: <LayoutDashboard className="h-4 w-4" />, to: '/admin', permission: 'view_dashboard' },
    { label: t('admin.orders'), icon: <ShoppingCart className="h-4 w-4" />, to: '/admin/orders', permission: 'view_orders' },
    { label: t('admin.returns'), icon: <RefreshCw className="h-4 w-4" />, to: '/admin/returns', permission: 'manage_orders' },
    { label: t('admin.catalogue'), icon: <Package className="h-4 w-4" />, to: '/admin/catalogue', permission: 'view_dashboard' },
    { label: t('admin.inventory'), icon: <Warehouse className="h-4 w-4" />, to: '/admin/inventory', permission: 'manage_inventory' },
    { label: t('admin.marketing'), icon: <Megaphone className="h-4 w-4" />, to: '/admin/marketing', permission: 'manage_marketing' },
    { label: t('admin.reports'), icon: <BarChart2 className="h-4 w-4" />, to: '/admin/reports', permission: 'view_reports' },
    { label: t('admin.customers'), icon: <Users className="h-4 w-4" />, to: '/admin/customers', permission: 'view_customers' },
    { label: t('admin.users'), icon: <Shield className="h-4 w-4" />, to: '/admin/users', permission: 'view_dashboard' },
    { label: t('admin.integrations'), icon: <Plug className="h-4 w-4" />, to: '/admin/integrations', permission: 'view_dashboard' },
    { label: t('admin.apiDocs'), icon: <FileText className="h-4 w-4" />, to: '/admin/api-docs', permission: 'view_dashboard' },
    { label: t('admin.backupRecovery'), icon: <Database className="h-4 w-4" />, to: '/admin/backup', permission: 'view_dashboard' },
    { label: t('admin.settings'), icon: <Settings className="h-4 w-4" />, to: '/admin/settings', permission: 'view_dashboard' },
    { label: t('admin.auditLog'), icon: <Activity className="h-4 w-4" />, to: '/admin/audit', permission: 'view_dashboard' },
  ]

  const canViewItem = usePermission('view_dashboard')

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn('flex flex-col h-full', mobile && 'w-72')}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b gap-3">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        {(sidebarOpen || mobile) && (
          <div>
            <p className="font-bold text-sm">{brand.shortName} Admin</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => mobile && setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className={cn(isActive ? 'text-brand-600' : '')}>{item.icon}</span>
              {(sidebarOpen || mobile) && (
                <span className="flex-1">{item.label}</span>
              )}
              {(sidebarOpen || mobile) && item.badge && (
                <Badge variant="destructive" className="text-xs h-4 px-1">{item.badge}</Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      {(sidebarOpen || mobile) && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
              {user?.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/') }} className="text-xs text-destructive hover:underline">
            Sign Out
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col border-r bg-white transition-all duration-300 flex-shrink-0',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        <Sidebar />
        <button
          onClick={toggleSidebar}
          className="absolute top-1/2 -right-3 w-6 h-6 rounded-full border bg-white shadow-sm flex items-center justify-center z-10 hover:bg-gray-50"
        >
          {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 bg-white h-full overflow-y-auto"><Sidebar mobile /></div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b bg-white flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-8 w-8 rounded flex items-center justify-center hover:bg-gray-100"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex-1" />

          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Storefront</Link>
          <Link to="/erp-sim" className="text-sm text-muted-foreground hover:text-foreground">ERP Sim →</Link>

          <Link to="/admin/notifications" className="relative h-8 w-8 rounded flex items-center justify-center hover:bg-gray-100">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
            {user?.name[0]}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
