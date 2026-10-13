import { Outlet, NavLink, Link } from 'react-router-dom'
import { Package, Heart, User, MapPin, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { useAuthStore } from '@/stores/authStore'

const NAV = [
  { to: '/account', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
  { to: '/account/orders', label: 'My Orders', icon: <Package className="h-4 w-4" /> },
  { to: '/account/wishlist', label: 'Wishlist', icon: <Heart className="h-4 w-4" /> },
  { to: '/account/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { to: '/account/addresses', label: 'Addresses', icon: <MapPin className="h-4 w-4" /> },
]

export function AccountLayout() {
  const { user, logout } = useAuthStore()

  return (
    <StorefrontLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">My Account</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-56 flex-shrink-0">
            {/* User card */}
            <div className="rounded-xl border bg-gradient-to-br from-brand-600 to-brand-800 text-white p-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mb-2">
                {user?.name[0]}
              </div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-white/70 truncate">{user?.email}</p>
              <p className="text-xs text-white/60 capitalize mt-0.5">{user?.role}</p>
            </div>

            <nav className="space-y-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border border-brand-100'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
