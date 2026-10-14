import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Heart, Menu, User, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { brand } from '@/config/brand.config'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import { CartDrawer } from '@/components/storefront/CartDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import * as seed from '@/mock/seed'

interface Props { children: React.ReactNode }

export function StorefrontLayout({ children }: Props) {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const items = useCartStore((s) => s.items)
  const setOpen = useCartStore((s) => s.setOpen)
  const { language, currency, setLanguage, setCurrency } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const cartCount = items.reduce((s, i) => s + i.qty, 0)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="screen-only bg-brand-600 text-white text-xs py-2 px-4 text-center">
        Free delivery in Addis Ababa on orders over Br 1,500 •{' '}
        <button onClick={() => setLanguage(language === 'en' ? 'am' : 'en')} className="underline ml-2">
          {language === 'en' ? 'አማርኛ' : 'English'}
        </button>
        {' · '}
        <button onClick={() => setCurrency(currency === 'ETB' ? 'USD' : 'ETB')} className="underline">
          {currency === 'ETB' ? 'USD' : 'ETB'}
        </button>
      </div>

      {/* Main header */}
      <header className="screen-only sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-lg hidden sm:block">{brand.shortName}</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search') + '...'}
                className="pl-9 pr-4 h-9 bg-gray-50"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <Link to="/account/wishlist" className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100 transition-colors">
              <Heart className="h-5 w-5" />
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setProfileOpen((o) => !o)}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:block max-w-[80px] truncate">{user?.name.split(' ')[0]}</span>
                  <ChevronDown className={cn('h-3 w-3 transition-transform', profileOpen && 'rotate-180')} />
                </Button>
                {profileOpen && (
                  <>
                    {/* Backdrop to close on outside click */}
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-white shadow-lg z-50">
                      <Link to="/account" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50">{t('nav.account')}</Link>
                      <Link to="/account/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50">{t('nav.orders')}</Link>
                      <Link to="/account/wishlist" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50">{t('nav.wishlist')}</Link>
                      {(user?.role === 'admin' || user?.role === 'staff' || user?.role === 'manager') && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-brand-600 font-medium">{t('nav.admin')}</Link>
                      )}
                      <hr className="my-1" />
                      <button onClick={() => { logout(); setProfileOpen(false) }} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-destructive">{t('nav.logout')}</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">{t('nav.login')}</Button>
              </Link>
            )}

            <button
              onClick={() => setOpen(true)}
              className="relative h-9 w-9 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <button
              className="sm:hidden h-9 w-9 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden md:block border-t bg-gray-50">
          <div className="container max-w-7xl mx-auto px-4 flex items-center gap-1 h-10 overflow-x-auto">
            {seed.categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-brand-600 whitespace-nowrap rounded hover:bg-white transition-colors"
              >
                {cat.name[language]}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white py-2 px-4 space-y-1">
            {seed.categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`} onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-gray-700 hover:text-brand-600">{cat.name[language]}</Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="screen-only bg-gray-900 text-white mt-16">
        <div className="container max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold">{brand.name}</span>
            </div>
            <p className="text-gray-400 text-sm">{brand.tagline}</p>
            <p className="text-gray-400 text-xs mt-2">{brand.address}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {seed.categories.slice(0, 5).map((c) => (
                <li key={c.id}><Link to={`/category/${c.slug}`} className="hover:text-white transition-colors">{c.name.en}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Help</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white">Returns</a></li>
              <li><a href="#" className="hover:text-white">Track Order</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href={brand.social.instagram} className="hover:text-white">Instagram</a></li>
              <li><a href={brand.social.facebook} className="hover:text-white">Facebook</a></li>
              <li><a href={brand.social.telegram} className="hover:text-white">Telegram</a></li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">© 2026 {brand.name}</p>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="screen-only md:hidden fixed bottom-0 inset-x-0 bg-white border-t z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-brand-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            {t('nav.home')}
          </Link>
          <Link to="/categories" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-brand-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            {t('nav.categories')}
          </Link>
          <Link to="/search" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-brand-600">
            <Search className="h-5 w-5" />
            {t('nav.search')}
          </Link>
          <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-brand-600 relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center">{cartCount}</span>}
            {t('nav.cart')}
          </button>
          <Link to={isAuthenticated ? '/account' : '/login'} className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-brand-600">
            <User className="h-5 w-5" />
            {t('nav.account')}
          </Link>
        </div>
      </div>

      <CartDrawer />
    </div>
  )
}
