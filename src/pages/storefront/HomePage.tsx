import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Truck, RotateCcw, ShieldCheck, Headphones,
  TrendingUp, Clock, Star, Tag,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { ProductCard } from '@/components/shared/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { getFeaturedProducts, getNewArrivals, getCategories } from '@/mock/services/products'
import * as seed from '@/mock/seed'
import { useUIStore } from '@/stores/uiStore'

// Category icon mapping
const CAT_EMOJI: Record<string, string> = {
  'plush-toys':    '🧸',
  'stationery':    '✏️',
  'beauty':        '💄',
  'home':          '🏠',
  'electronics':   '🎧',
  'snacks':        '🍡',
  'fashion':       '👜',
  'vouchers':      '🎁',
}

const VALUE_PROPS = [
  { icon: <Truck className="h-5 w-5" />,        label: 'Free Delivery',    sub: 'Orders over Br 1,500' },
  { icon: <RotateCcw className="h-5 w-5" />,    label: 'Easy Returns',     sub: 'Within 14 days' },
  { icon: <ShieldCheck className="h-5 w-5" />,  label: 'Secure Payment',   sub: 'Telebirr, CBE Birr & more' },
  { icon: <Headphones className="h-5 w-5" />,   label: '24/7 Support',     sub: 'Always here to help' },
]

const SORT_LINKS = [
  { icon: <TrendingUp className="h-4 w-4" />, label: 'Popular',     to: '/search?sort=rating' },
  { icon: <Tag className="h-4 w-4" />,        label: 'Best Price',  to: '/search?sort=price_asc' },
  { icon: <Clock className="h-4 w-4" />,      label: 'New In',      to: '/search?sort=newest' },
  { icon: <Star className="h-4 w-4" />,       label: 'Top Rated',   to: '/search?sort=rating' },
]

export function HomePage() {
  const { t } = useTranslation()
  const language = useUIStore((s) => s.language)
  const [bannerIdx, setBannerIdx] = useState(0)
  const activeBanners = seed.banners.filter((b) => b.active)

  const { data: featured, isLoading: loadingFeatured } = useQuery({ queryKey: ['featured'], queryFn: getFeaturedProducts })
  const { data: newArrivals, isLoading: loadingNew } = useQuery({ queryKey: ['new-arrivals'], queryFn: getNewArrivals })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  useEffect(() => {
    if (activeBanners.length <= 1) return
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % activeBanners.length), 5000)
    return () => clearInterval(timer)
  }, [activeBanners.length])

  const currentBanner = activeBanners[bannerIdx]

  return (
    <StorefrontLayout>

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      {currentBanner && (
        <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden">
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className="w-full h-full object-cover transition-all duration-700"
            key={currentBanner.id}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent flex items-center">
            <div className="container max-w-7xl mx-auto px-6 md:px-12">
              <div className="max-w-lg">
                <p className="text-white/70 text-sm uppercase tracking-widest mb-2 font-medium">Miniso Ethiopia</p>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">{currentBanner.title}</h1>
                <p className="text-lg text-white/85 mb-6">{currentBanner.subtitle}</p>
                <div className="flex items-center gap-3">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                    <Link to={currentBanner.link}>{t('home.shopNow')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Link to="/search" className="text-white/80 hover:text-white text-sm underline underline-offset-2">
                    Browse all
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {activeBanners.length > 1 && (
            <>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {activeBanners.map((_, i) => (
                  <button key={i} onClick={() => setBannerIdx(i)}
                    className={`h-2 rounded-full transition-all ${i === bannerIdx ? 'bg-white w-6' : 'bg-white/50 w-2'}`} />
                ))}
              </div>
              <button onClick={() => setBannerIdx((i) => (i - 1 + activeBanners.length) % activeBanners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setBannerIdx((i) => (i + 1) % activeBanners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Value proposition strip ──────────────────────────────────── */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {VALUE_PROPS.map((v) => (
              <div key={v.label} className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                  {v.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{v.label}</p>
                  <p className="text-xs text-muted-foreground">{v.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-10 space-y-14 pb-24 md:pb-10">

        {/* ── Shop by Category ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">{t('home.shopByCategory')}</h2>
            <Link to="/categories" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              {t('home.viewAll')} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {(categories ?? seed.categories).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-2xl border bg-white hover:border-brand-300 hover:shadow-md transition-all"
              >
                {/* Emoji icon on top of image */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                  <img src={cat.image} alt={cat.name.en}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  <span className="absolute bottom-0.5 right-0.5 text-base leading-none drop-shadow">
                    {CAT_EMOJI[cat.slug] ?? '🛍️'}
                  </span>
                </div>
                <span className="text-xs font-medium text-center line-clamp-2 leading-tight">
                  {cat.name[language]}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Quick sort entry points ───────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-muted-foreground mr-1">Browse by:</span>
            {SORT_LINKS.map((s) => (
              <Link
                key={s.label}
                to={s.to}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border bg-white text-sm font-medium text-gray-700 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
              >
                {s.icon} {s.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Products ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">{t('home.featured')}</h2>
            <Link to="/search" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              {t('home.viewAll')} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingFeatured
              ? Array(12).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured?.slice(0, 12).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* ── Promo banner ─────────────────────────────────────────────── */}
        <section className="rounded-2xl overflow-hidden relative h-48 bg-gradient-to-r from-brand-600 to-brand-800">
          <div className="absolute inset-0 flex items-center px-10">
            <div className="text-white">
              <p className="text-xs uppercase tracking-widest mb-2 opacity-70 font-semibold">Limited Time Offer</p>
              <h3 className="text-3xl font-bold mb-2">Up to 30% Off</h3>
              <p className="text-white/80 text-sm mb-4">
                Use code <strong className="bg-white/20 px-2 py-0.5 rounded font-mono">FLASH15</strong> at checkout
              </p>
              <Button asChild variant="secondary" size="sm" className="font-semibold">
                <Link to="/search">Shop the Sale <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </div>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] opacity-[0.07] font-black select-none">
            SALE
          </div>
        </section>

        {/* ── New Arrivals ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold">{t('home.newArrivals')}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Fresh stock — just landed</p>
            </div>
            <Link to="/search?sort=newest" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              {t('home.viewAll')} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {loadingNew
              ? Array(8).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
              : newArrivals?.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

      </div>
    </StorefrontLayout>
  )
}
