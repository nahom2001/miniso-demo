import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Product } from '@/domain/types'
import { formatPrice } from '@/config/currencies'
import { useUIStore } from '@/stores/uiStore'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t } = useTranslation()
  const language = useUIStore((s) => s.language)
  const currency = useUIStore((s) => s.currency)
  const addItem = useCartStore((s) => s.addItem)
  const { toast } = useToast()

  const name = product.name[language] ?? product.name.en
  const price = formatPrice(
    language === 'en' ? product.prices.ETB : product.prices.ETB,
    currency
  )

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      variantId: `default-${product.id}`,
      productId: product.id,
      qty: 1,
      unitPrice: product.prices.ETB,
    })
    toast({ title: t('product.addToCart'), description: name, variant: 'success' })
  }

  return (
    <Link
      to={`/product/${product.seo.slug}`}
      className={cn('group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 block', className)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images[0]}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.isDigital && (
          <Badge variant="info" className="absolute top-2 left-2 text-xs">{t('product.digital')}</Badge>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md" onClick={(e) => e.preventDefault()}>
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
          <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-1" />
            {t('product.addToCart')}
          </Button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground mb-0.5">{product.brand}</p>
        <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">{name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-muted-foreground">{product.rating} ({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-brand-600">{price}</span>
          {product.isDigital && <Badge variant="tbc" className="text-xs">TBC</Badge>}
        </div>
      </div>
    </Link>
  )
}
