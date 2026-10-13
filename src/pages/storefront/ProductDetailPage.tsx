import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Heart, Star, ChevronRight, ZoomIn } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { StarRating } from '@/components/shared/StarRating'
import { ProductCard } from '@/components/shared/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getProduct, getVariants, getReviews, getProducts } from '@/mock/services/products'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/config/currencies'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const language = useUIStore((s) => s.language)
  const currency = useUIStore((s) => s.currency)
  const addItem = useCartStore((s) => s.addItem)
  const { toast } = useToast()

  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [zoom, setZoom] = useState(false)
  const [wishlist, setWishlist] = useState(false)

  // Find product by slug
  const { data: allProducts } = useQuery({ queryKey: ['products'], queryFn: () => getProducts() })
  const product = allProducts?.find((p) => p.seo.slug === slug)

  const { data: variants } = useQuery({
    queryKey: ['variants', product?.id],
    queryFn: () => getVariants(product!.id),
    enabled: !!product,
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => getReviews(product!.id),
    enabled: !!product,
  })

  const { data: related } = useQuery({
    queryKey: ['related', product?.categoryIds[0]],
    queryFn: () => getProducts({ categoryId: product!.categoryIds[0] }),
    enabled: !!product,
  })

  if (!product) {
    return (
      <StorefrontLayout>
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    )
  }

  // Determine selected variant
  const selectedVariant = variants?.find((v) =>
    Object.entries(selectedOptions).every(([k, val]) => v.options[k] === val)
  )
  const price = selectedVariant
    ? formatPrice(selectedVariant.prices.ETB, currency)
    : formatPrice(product.prices.ETB, currency)

  // Unique option keys
  const optionKeys = variants && variants.length > 0
    ? Object.keys(variants[0].options)
    : []
  const optionValues = optionKeys.reduce<Record<string, string[]>>((acc, key) => {
    acc[key] = [...new Set(variants?.map((v) => v.options[key]) ?? [])]
    return acc
  }, {})

  function handleAddToCart() {
    addItem({
      variantId: selectedVariant?.id ?? `default-${product!.id}`,
      productId: product!.id,
      qty,
      unitPrice: selectedVariant?.prices.ETB ?? product!.prices.ETB,
    })
    toast({ title: t('product.addToCart'), description: product!.name[language], variant: 'success' })
  }

  const name = product.name[language]

  return (
    <StorefrontLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/category/${product.seo.slug}`} className="hover:text-foreground capitalize">{product.categoryIds[0]?.replace('cat-', 'Category ')}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground line-clamp-1">{name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Gallery */}
          <div className="space-y-3">
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 cursor-zoom-in"
              onClick={() => setZoom(true)}
            >
              <img
                src={product.images[selectedImage]}
                alt={name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white">
                <ZoomIn className="h-4 w-4" />
              </button>
              {product.isDigital && <Badge variant="info" className="absolute top-3 left-3">Digital</Badge>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === selectedImage ? 'border-brand-600' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="secondary">{product.brand}</Badge>
              {product.isDigital && <Badge variant="tbc">TBC — Digital Delivery</Badge>}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} showValue />
              <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">In Stock</span>
            </div>

            <div className="text-3xl font-bold text-brand-600 mb-6">{price}</div>

            {/* Variant selectors */}
            {optionKeys.map((key) => (
              <div key={key} className="mb-4">
                <p className="text-sm font-medium mb-2">{key}: <span className="text-muted-foreground">{selectedOptions[key] ?? 'Select'}</span></p>
                <div className="flex flex-wrap gap-2">
                  {optionValues[key].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [key]: val }))}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        selectedOptions[key] === val
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-50 text-lg">−</button>
                  <span className="w-12 text-center font-medium">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-gray-50 text-lg">+</button>
                </div>
                <span className="text-sm text-muted-foreground">Only 12 left</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button size="lg" className="flex-1 bg-brand-600 hover:bg-brand-700 text-white" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t('product.addToCart')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => { setWishlist(!wishlist); toast({ title: wishlist ? 'Removed from wishlist' : '❤️ Added to wishlist', variant: 'success' }) }}
                className={wishlist ? 'border-red-300 text-red-500' : ''}
              >
                <Heart className={`h-5 w-5 ${wishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description[language]}</p>
            </div>

            {/* Meta */}
            <div className="mt-4 pt-4 border-t space-y-1 text-xs text-muted-foreground">
              <p>SKU: <span className="font-medium text-foreground">{product.sku}</span></p>
              <p>Tags: {product.tags.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              {t('product.reviews')} ({reviews.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {reviews.slice(0, 6).map((r) => (
                <div key={r.id} className="p-4 rounded-xl border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                        {r.userName[0]}
                      </div>
                      <span className="text-sm font-medium">{r.userName}</span>
                    </div>
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(r.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related && related.length > 1 && (
          <section>
            <h2 className="text-xl font-bold mb-6">{t('product.relatedProducts')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {related.filter((p) => p.id !== product.id).slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Zoom modal */}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <img src={product.images[selectedImage]} alt={name} className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </StorefrontLayout>
  )
}
