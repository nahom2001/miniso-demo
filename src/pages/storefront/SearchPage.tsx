import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X } from 'lucide-react'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { ProductCard } from '@/components/shared/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getProducts, getCategories } from '@/mock/services/products'
import { useUIStore } from '@/stores/uiStore'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const catParam = searchParams.get('cat') ?? ''
  const language = useUIStore((s) => s.language)

  const [search, setSearch] = useState(q)
  const [selectedCat, setSelectedCat] = useState(catParam)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating'>('relevance')
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search, selectedCat],
    queryFn: () => getProducts({ search: search || undefined, categoryId: selectedCat || undefined }),
  })

  const sorted = products?.filter((p) => p.prices.ETB >= priceRange[0] && p.prices.ETB <= priceRange[1]).sort((a, b) => {
    if (sortBy === 'price_asc') return a.prices.ETB - b.prices.ETB
    if (sortBy === 'price_desc') return b.prices.ETB - a.prices.ETB
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'rating') return b.rating - a.rating
    return 0
  }) ?? []

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params: Record<string, string> = {}
    if (search) params.q = search
    if (selectedCat) params.cat = selectedCat
    setSearchParams(params)
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-sm">Categories</h3>
        <div className="space-y-1">
          <button onClick={() => setSelectedCat('')}
            className={`w-full text-left text-sm py-1.5 px-2 rounded hover:bg-gray-100 ${!selectedCat ? 'bg-brand-50 text-brand-700 font-medium' : ''}`}>
            All Categories
          </button>
          {categories?.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
              className={`w-full text-left text-sm py-1.5 px-2 rounded hover:bg-gray-100 ${selectedCat === cat.id ? 'bg-brand-50 text-brand-700 font-medium' : ''}`}>
              {cat.name[language]} <span className="text-muted-foreground text-xs">({cat.productCount})</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-sm">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} className="h-8 text-sm" />
          <span className="text-muted-foreground">–</span>
          <Input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} className="h-8 text-sm" />
        </div>
      </div>
    </div>
  )

  return (
    <StorefrontLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="max-w-xl" />
          <Button type="submit" variant="brand">Search</Button>
          <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </form>

        {/* Active filters */}
        {(selectedCat || q) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {q && <Badge variant="secondary" className="gap-1">{q} <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearch(''); setSearchParams({}) }} /></Badge>}
            {selectedCat && (
              <Badge variant="secondary" className="gap-1">
                {categories?.find((c) => c.id === selectedCat)?.name.en}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCat('')} />
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Filter sidebar */}
          <aside className={`w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20">
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{sorted.length} results {q ? `for "${q}"` : ''}</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border rounded-lg px-2 py-1"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(8).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search term</p>
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
