import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, TrendingUp, Tag, Clock, Star, ArrowUpDown, Search } from 'lucide-react'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { ProductCard } from '@/components/shared/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getProducts, getCategories } from '@/mock/services/products'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating'

const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  { key: 'relevance',  label: 'Popular',       icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { key: 'price_asc',  label: 'Price: Low',    icon: <ArrowUpDown className="h-3.5 w-3.5" /> },
  { key: 'price_desc', label: 'Price: High',   icon: <ArrowUpDown className="h-3.5 w-3.5 rotate-180" /> },
  { key: 'newest',     label: 'Newest',        icon: <Clock className="h-3.5 w-3.5" /> },
  { key: 'rating',     label: 'Top Rated',     icon: <Star className="h-3.5 w-3.5" /> },
]

// Popular tag suggestions for quick filtering
const QUICK_TAGS = ['kawaii', 'skincare', 'notebook', 'earphone', 'mug', 'bag', 'japanese', 'toy', 'candle', 'cable']

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const catParam = searchParams.get('cat') ?? ''
  const language = useUIStore((s) => s.language)

  const [search, setSearch] = useState(q)
  const [debouncedSearch, setDebouncedSearch] = useState(q)
  const [selectedCat, setSelectedCat] = useState(catParam)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [sortBy, setSortBy] = useState<SortKey>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTag, setActiveTag] = useState('')

  // Debounce search input → re-query after 300ms idle
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', debouncedSearch, selectedCat],
    queryFn: () => getProducts({ search: debouncedSearch || undefined, categoryId: selectedCat || undefined }),
  })

  // Sync URL → state
  useEffect(() => { setSearch(q); setDebouncedSearch(q) }, [q])
  useEffect(() => { setSelectedCat(catParam) }, [catParam])
  // Apply sort from URL param
  useEffect(() => {
    const s = searchParams.get('sort') as SortKey | null
    if (s && SORT_OPTIONS.find((o) => o.key === s)) setSortBy(s)
  }, [searchParams])

  // Filter + sort
  const sorted = (products ?? [])
    .filter((p) => p.prices.ETB >= priceRange[0] && p.prices.ETB <= priceRange[1])
    .filter((p) => !activeTag || p.tags.includes(activeTag))
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return a.prices.ETB - b.prices.ETB
      if (sortBy === 'price_desc') return b.prices.ETB - a.prices.ETB
      if (sortBy === 'newest')     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'rating')     return b.rating - a.rating
      return 0
    })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    // no-op — search is driven by debounce, kept for accessibility (Enter key)
  }

  const hasActiveFilters = !!q || !!selectedCat || !!activeTag

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Categories</h3>
        <div className="space-y-0.5">
          <button
            onClick={() => setSelectedCat('')}
            className={cn(
              'w-full text-left text-sm py-2 px-3 rounded-lg transition-colors',
              !selectedCat ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
            )}
          >
            All Categories
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={cn(
                'w-full text-left text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-between',
                selectedCat === cat.id ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              <span>{cat.name[language]}</span>
              <span className="text-xs text-muted-foreground">({cat.productCount})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Price Range (ETB)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
            className="h-8 text-sm"
            placeholder="Min"
          />
          <span className="text-muted-foreground text-sm flex-shrink-0">–</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="h-8 text-sm"
            placeholder="Max"
          />
        </div>
      </div>
    </div>
  )

  return (
    <StorefrontLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, tag…"
              className="pl-9 pr-9"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setDebouncedSearch('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden gap-1.5">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </form>

        {/* ── Sort pills ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-xs font-medium text-muted-foreground mr-1">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                sortBy === opt.key
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
              )}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* ── Tag chips ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <Tag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs border transition-all',
                activeTag === tag
                  ? 'bg-brand-50 text-brand-700 border-brand-300 font-medium'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
              )}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {q && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => { setSearch(''); setSearchParams({}) }}>
                "{q}" <X className="h-3 w-3" />
              </Badge>
            )}
            {selectedCat && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedCat('')}>
                {categories?.find((c) => c.id === selectedCat)?.name.en} <X className="h-3 w-3" />
              </Badge>
            )}
            {activeTag && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setActiveTag('')}>
                #{activeTag} <X className="h-3 w-3" />
              </Badge>
            )}
            <button
              onClick={() => { setSearch(''); setSelectedCat(''); setActiveTag(''); setSearchParams({}) }}
              className="text-xs text-destructive hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filter sidebar */}
          <aside className={cn('w-56 flex-shrink-0', showFilters ? 'block' : 'hidden lg:block')}>
            <div className="sticky top-20 bg-white rounded-xl border p-4">
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{sorted.length}</span> results
                {q ? ` for "${q}"` : ''}
                {activeTag ? ` tagged #${activeTag}` : ''}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(8).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your filters, sort, or search term</p>
                <button onClick={() => { setSearch(''); setSelectedCat(''); setActiveTag(''); setSortBy('relevance') }}
                  className="mt-4 text-sm text-brand-600 hover:underline">
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
