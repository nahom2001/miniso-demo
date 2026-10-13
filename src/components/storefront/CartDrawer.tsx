import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, Tag, ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/config/currencies'
import { db } from '@/mock/db'
import { useToast } from '@/components/ui/toast'

export function CartDrawer() {
  const { t } = useTranslation()
  const { items, isOpen, setOpen, removeItem, updateQty, couponCode, applyCoupon, removeCoupon, getTotals } = useCartStore()
  const currency = useUIStore((s) => s.currency)
  const language = useUIStore((s) => s.language)
  const [couponInput, setCouponInput] = useState('')
  const { toast } = useToast()
  const totals = getTotals()

  function handleApplyCoupon() {
    const result = applyCoupon(couponInput)
    toast({ title: result.success ? '🎉 Coupon applied!' : 'Invalid coupon', description: result.message, variant: result.success ? 'success' : 'destructive' })
    if (result.success) setCouponInput('')
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t('cart.title')}
            {items.length > 0 && <span className="text-sm font-normal text-muted-foreground">({items.length})</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">{t('cart.empty')}</p>
            <Button variant="brand" onClick={() => setOpen(false)} asChild>
              <Link to="/">{t('cart.continueShopping')}</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => {
                const product = db.products.find((p) => p.id === item.productId)
                if (!product) return null
                return (
                  <div key={item.variantId} className="flex gap-3">
                    <img src={product.images[0]} alt={product.name.en} className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{product.name[language]}</p>
                      <p className="text-sm text-brand-600 font-semibold mt-0.5">{formatPrice(item.unitPrice, currency)}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center border rounded-md">
                          <button onClick={() => updateQty(item.variantId, item.qty - 1)} className="p-1 hover:bg-gray-50">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.qty}</span>
                          <button onClick={() => updateQty(item.variantId, item.qty + 1)} className="p-1 hover:bg-gray-50">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.variantId)} className="text-destructive hover:text-destructive/80 p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0">{formatPrice(item.unitPrice * item.qty, currency)}</p>
                  </div>
                )
              })}
            </div>

            {/* Coupon */}
            <div className="px-6 py-3 border-t">
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{couponCode} applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-destructive underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder={t('cart.coupon')} className="h-9 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()} />
                  <Button variant="outline" size="sm" onClick={handleApplyCoupon}>{t('cart.applyCoupon')}</Button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t bg-gray-50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span>{formatPrice(totals.subtotal, currency)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('cart.discount')}</span>
                  <span>−{formatPrice(totals.discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.shipping')}</span>
                <span>{formatPrice(totals.shipping, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.vat')}</span>
                <span>{formatPrice(totals.vat, currency)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>{t('cart.total')}</span>
                <span className="text-brand-600">{formatPrice(totals.total, currency)}</span>
              </div>
            </div>

            <div className="px-6 pb-6 pt-3">
              <Button variant="brand" size="lg" className="w-full" asChild onClick={() => setOpen(false)}>
                <Link to="/checkout">{t('cart.checkout')}</Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setOpen(false)}>
                {t('cart.continueShopping')}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
