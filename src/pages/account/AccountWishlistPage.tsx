import { useState } from 'react'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/config/currencies'
import { useToast } from '@/components/ui/toast'
import * as seed from '@/mock/seed'

export function AccountWishlistPage() {
  const { user } = useAuthStore()
  const currency = useUIStore((s) => s.currency)
  const language = useUIStore((s) => s.language)
  const addItem = useCartStore((s) => s.addItem)
  const { toast } = useToast()

  const initialItems = user ? (seed.wishlists[user.id] ?? seed.wishlists['usr-customer'] ?? []) : []
  const [wishlistIds, setWishlistIds] = useState<string[]>(initialItems.map(w => w.productId))

  const products = wishlistIds.map(id => seed.products.find(p => p.id === id)).filter(Boolean) as typeof seed.products

  function remove(productId: string) {
    setWishlistIds(prev => prev.filter(id => id !== productId))
    toast({ title: 'Removed from wishlist', variant: 'default' })
  }

  function moveToCart(productId: string) {
    const prod = seed.products.find(p => p.id === productId)
    if (!prod) return
    addItem({ variantId: `default-${productId}`, productId, qty: 1, unitPrice: prod.prices.ETB })
    remove(productId)
    toast({ title: 'Added to cart', variant: 'success' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Wishlist ({products.length})</h1>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-sm mb-4">Save items you love to buy them later</p>
            <Button asChild variant="brand" size="sm"><Link to="/">Browse Products</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative aspect-square">
                <Link to={`/product/${product.seo.slug}`}>
                  <img src={product.images[0]} alt={product.name.en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
                <button
                  onClick={() => remove(product.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow text-red-500 hover:bg-white transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <CardContent className="p-3">
                <Link to={`/product/${product.seo.slug}`}>
                  <p className="text-sm font-medium line-clamp-2 hover:text-brand-600 transition-colors">{product.name[language]}</p>
                </Link>
                <p className="font-bold text-brand-600 text-sm mt-1">{formatPrice(product.prices.ETB, currency)}</p>
                <Button
                  size="sm"
                  className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white"
                  onClick={() => moveToCart(product.id)}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
