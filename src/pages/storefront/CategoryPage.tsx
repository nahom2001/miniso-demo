import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { ProductCard } from '@/components/shared/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { getProducts, getCategories } from '@/mock/services/products'
import { useUIStore } from '@/stores/uiStore'
import * as seed from '@/mock/seed'

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const language = useUIStore((s) => s.language)
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const cat = slug ? (categories ?? seed.categories).find((c) => c.slug === slug) : null
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', cat?.id],
    queryFn: () => getProducts(cat ? { categoryId: cat.id } : undefined),
  })

  return (
    <StorefrontLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {cat && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{cat.name[language]}</h1>
            <p className="text-muted-foreground mt-1">{cat.productCount} products</p>
          </div>
        )}
        {!slug && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold">All Categories</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {(categories ?? seed.categories).map((c) => (
                <a key={c.id} href={`/category/${c.slug}`} className="rounded-xl border overflow-hidden hover:shadow-md transition-shadow group">
                  <img src={c.image} alt={c.name.en} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform" />
                  <div className="p-3">
                    <p className="font-semibold">{c.name[language]}</p>
                    <p className="text-xs text-muted-foreground">{c.productCount} products</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        {(cat || slug) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {isLoading
              ? Array(10).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
              : products?.map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        )}
      </div>
    </StorefrontLayout>
  )
}
