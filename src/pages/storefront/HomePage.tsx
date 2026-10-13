import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { ProductCard } from '@/components/shared/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { getFeaturedProducts, getNewArrivals, getCategories } from '@/mock/services/products'
import * as seed from '@/mock/seed'
import { useUIStore } from '@/stores/uiStore'

export function HomePage() {
  const { t } = useTranslation()
  const language = useUIStore((s) => s.language)
  const [bannerIdx, setBannerIdx] = useState(0)
  const activeBanners = seed.banners.filter((b) => b.active)

  const { data: featured, isLoading: loadingFeatured } = useQuery({ queryKey: ['featured'], queryFn: getFeaturedProducts })
  const { data: newArrivals, isLoading: loadingNew } = useQuery({ queryKey: ['new-arrivals'], queryFn: getNewArrivals })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  // Auto-advance banner
  useEffect(() => {
    if (activeBanners.length <= 1) return
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % activeBanners.length), 5000)
    return () => clearInterval(t)
  }, [activeBanners.length])

  const currentBanner = activeBanners[bannerIdx]

  return (
    <StorefrontLayout>
      {/* Hero Banner */}
      {currentBanner && (
        <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden">
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className="w-full h-full object-cover transition-all duration-700"
            key={currentBanner.id}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center">
            <div className="container max-w-7xl mx-auto px-6 md:px-12">
              <div className="max-w-lg animate-fade-in">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{currentBanner.title}</h1>
                <p className="text-lg text-white/90 mb-6">{currentBanner.subtitle}</p>
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Link to={currentBanner.link}>{t('home.shopNow')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
          {/* Dots */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {activeBanners.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'bg-white w-6' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
          {/* Prev/Next */}
          {activeBanners.length > 1 && (
            <>
              <button onClick={() => setBannerIdx((i) => (i - 1 + activeBanners.length) % activeBanners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setBannerIdx((i) => (i + 1) % activeBanners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}

      <div className="container max-w-7xl mx-auto px-4 py-10 space-y-14 pb-20 md:pb-10">
        {/* Shop by Category */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('home.shopByCategory')}</h2>
            <Link to="/categories" className="text-sm text-brand-600 hover:underline flex items-center gap-1">{t('home.viewAll')} <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {(categories ?? seed.categories).map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-white hover:border-brand-300 hover:shadow-md transition-all group">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                  <img src={cat.image} alt={cat.name.en} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-medium text-center line-clamp-2">{cat.name[language]}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('home.featured')}</h2>
            <Link to="/search" className="text-sm text-brand-600 hover:underline flex items-center gap-1">{t('home.viewAll')} <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingFeatured
              ? Array(12).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured?.slice(0, 12).map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="rounded-2xl overflow-hidden relative h-48 bg-gradient-to-r from-brand-600 to-brand-800">
          <div className="absolute inset-0 flex items-center px-10">
            <div className="text-white">
              <p className="text-sm uppercase tracking-widest mb-2 opacity-80">Limited Time</p>
              <h3 className="text-3xl font-bold mb-3">Up to 30% Off</h3>
              <p className="text-white/80 mb-5">Use code <strong>FLASH15</strong> at checkout</p>
              <Button asChild variant="secondary" size="sm">
                <Link to="/search">Shop the Sale</Link>
              </Button>
            </div>
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-9xl opacity-10 font-black">15%</div>
        </section>

        {/* New Arrivals */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('home.newArrivals')}</h2>
            <Link to="/search?sort=newest" className="text-sm text-brand-600 hover:underline flex items-center gap-1">{t('home.viewAll')} <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {loadingNew
              ? Array(4).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
              : newArrivals?.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>
      </div>
    </StorefrontLayout>
  )
}
