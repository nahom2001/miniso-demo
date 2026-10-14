import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Heart, Star, ChevronRight, ZoomIn, CheckCircle, AlertCircle, Package, Truck, RotateCcw } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { db } from '@/mock/db'

const VAT_RATE = 0.15

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

  const selectedVariant = variants?.find((v) =>
    Object.entries(selectedOptions).every(([k, val]) => v.options[k] === val)
  )
  const basePrice = selectedVariant?.prices.ETB ?? product.prices.ETB
  const vatAmount = basePrice * VAT_RATE
  const totalPerUnit = basePrice + vatAmount
  const lineTotal = totalPerUnit * qty

  const optionKeys = variants && variants.length > 0 ? Object.keys(variants[0].options) : []
  const optionValues = optionKeys.reduce<Record<string, string[]>>((acc, key) => {
    acc[key] = [...new Set(variants?.map((v) => v.options[key]) ?? [])]
    return acc
  }, {})

  // Stock level from mock DB
  const stockItem = db.stockItems.find(
    (s) => s.variantId === (selectedVariant?.id ?? `default-${product.id}`) && s.locationId === 'online'
  )
  const stockQty = stockItem?.qty ?? 0
  const lowThreshold = stockItem?.lowThreshold ?? 10
  const stockStatus =
    product.isDigital ? 'digital'
    : stockQty === 0 ? 'out'
    : stockQty <= lowThreshold ? 'low'
    : 'in'

  function handleAddToCart() {
    if (stockStatus === 'out') return
    addItem({
      variantId: selectedVariant?.id ?? `default-${product!.id}`,
      productId: product!.id,
      qty,
      unitPrice: basePrice,
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
          <Link to={`/category/${product.categoryIds[0]?.replace('cat-', '')}`} className="hover:text-foreground capitalize">
            {product.categoryIds[0]?.replace('cat-', 'Category ')}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground line-clamp-1">{name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 mb-16">

          {/* ── Gallery ──────────────────────────────────────────────── */}
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
              <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white shadow-sm">
                <ZoomIn className="h-4 w-4" />
              </button>
              {product.isDigital && <Badge variant="info" className="absolute top-3 left-3">Digital</Badge>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                    i === selectedImage ? 'border-brand-600' : 'border-transparent hover:border-gray-300'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Product info ─────────────────────────────────────────── */}
          <div className="flex flex-col">
            <div className="mb-1 flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{product.brand}</Badge>
              {product.isDigital && <Badge variant="tbc">Digital Delivery</Badge>}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>

            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={product.rating} showValue />
              <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>

              {/* Real-time stock badge */}
              {stockStatus === 'in' && (
                <span className="flex items-center gap-1 text-xs text-green-700 font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <CheckCircle className="h-3 w-3" /> In Stock
                </span>
              )}
              {stockStatus === 'low' && (
                <span className="flex items-center gap-1 text-xs text-orange-700 font-medium bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 animate-pulse">
                  <AlertCircle className="h-3 w-3" /> Only {stockQty} left
                </span>
              )}
              {stockStatus === 'out' && (
                <span className="flex items-center gap-1 text-xs text-red-700 font-medium bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <AlertCircle className="h-3 w-3" /> Out of Stock
                </span>
              )}
              {stockStatus === 'digital' && (
                <span className="flex items-center gap-1 text-xs text-blue-700 font-medium bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  <Package className="h-3 w-3" /> Instant Delivery
                </span>
              )}
            </div>

            {/* Variant selectors */}
            {optionKeys.map((key) => (
              <div key={key} className="mb-4">
                <p className="text-sm font-medium mb-2">
                  {key}:{' '}
                  <span className="text-muted-foreground font-normal">
                    {selectedOptions[key] ?? <span className="text-orange-500 text-xs">Select {key}</span>}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {optionValues[key].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [key]: val }))}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                        selectedOptions[key] === val
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                          : 'border-gray-200 hover:border-gray-400 text-gray-700'
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mb-5">
              <p className="text-sm font-medium mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2 hover:bg-gray-50 text-lg font-light transition-colors border-r"
                  >−</button>
                  <span className="w-12 text-center font-semibold text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(stockQty || 99, qty + 1))}
                    className="px-4 py-2 hover:bg-gray-50 text-lg font-light transition-colors border-l"
                    disabled={stockStatus === 'out'}
                  >+</button>
                </div>
                {stockStatus === 'low' && (
                  <span className="text-xs text-orange-600">Max {stockQty} available</span>
                )}
              </div>
            </div>

            {/* ── Price + VAT breakdown ─────────────────────────────── */}
            <div className="bg-gray-50 rounded-xl border p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Item price × {qty}</span>
                <span>{formatPrice(basePrice * qty, currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>VAT (15%)</span>
                <span>{formatPrice(vatAmount * qty, currency)}</span>
              </div>
              {qty > 1 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Per unit (inc. VAT)</span>
                  <span>{formatPrice(totalPerUnit, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                <span>Total</span>
                <span className="text-brand-600 text-xl">{formatPrice(lineTotal, currency)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-5">
              <Button
                size="lg"
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
                onClick={handleAddToCart}
                disabled={stockStatus === 'out'}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {stockStatus === 'out' ? 'Out of Stock' : t('product.addToCart')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setWishlist(!wishlist)
                  toast({ title: wishlist ? 'Removed from wishlist' : '❤️ Added to wishlist', variant: 'success' })
                }}
                className={cn(wishlist && 'border-red-300 text-red-500')}
              >
                <Heart className={cn('h-5 w-5', wishlist && 'fill-red-500 text-red-500')} />
              </Button>
            </div>

            {/* Delivery reassurances */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: <Truck className="h-4 w-4" />, text: 'Free delivery over Br 1,500' },
                { icon: <RotateCcw className="h-4 w-4" />, text: 'Returns within 14 days' },
                { icon: <Package className="h-4 w-4" />, text: 'Packed & tracked' },
              ].map((item) => (
                <div key={item.text} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 border text-center">
                  <span className="text-brand-600">{item.icon}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {product.description[language]}
            </p>

            {/* Meta */}
            <div className="pt-4 border-t space-y-1 text-xs text-muted-foreground">
              <p>SKU: <span className="font-medium text-foreground font-mono">{product.sku}</span></p>
              <p>Tags:
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${tag}`}
                    className="ml-1 text-brand-600 hover:underline"
                  >
                    #{tag}
                  </Link>
                ))}
              </p>
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

        {/* Related products */}
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
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoom(false)}
        >
          <img
            src={product.images[selectedImage]}
            alt={name}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}
    </StorefrontLayout>
  )
}
