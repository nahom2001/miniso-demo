import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrder } from '@/mock/services/orders'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/config/currencies'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/domain/types'

const STATUS_FLOW: OrderStatus[] = ['placed', 'paid', 'packed', 'shipped', 'delivered']

export function AccountOrderDetailPage() {
  const { orderId } = useParams()
  const currency = useUIStore((s) => s.currency)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  })

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-60 rounded-xl" />
    </div>
  )

  if (!order) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Order not found</p>
      <Link to="/account/orders" className="text-brand-600 hover:underline text-sm mt-2 block">← Back to orders</Link>
    </div>
  )

  const currentIdx = STATUS_FLOW.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/account/orders">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{order.number}</h1>
            <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-2 overflow-x-auto pb-2">
              {STATUS_FLOW.map((s, i) => {
                const done = i <= currentIdx
                const active = i === currentIdx
                return (
                  <div key={s} className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all',
                        done ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-200'
                             : 'border-gray-200 bg-white text-gray-400'
                      )}>
                        {done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={cn(
                        'text-xs font-medium capitalize',
                        active ? 'text-brand-600' : done ? 'text-gray-700' : 'text-gray-400'
                      )}>{s}</span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={cn(
                        'h-0.5 w-10 mt-[-18px] mx-0.5 transition-colors',
                        i < currentIdx ? 'bg-brand-600' : 'bg-gray-200'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" /> Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image} alt={item.productName} className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{item.variantLabel} · Qty {item.qty}</p>
                <p className="text-sm font-semibold text-brand-600 mt-0.5">{formatPrice(item.unitPrice, currency)}</p>
              </div>
              <p className="font-bold text-sm flex-shrink-0">{formatPrice(item.total, currency)}</p>
            </div>
          ))}

          <div className="border-t pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(order.totals.subtotal, currency)}</span></div>
            {order.totals.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatPrice(order.totals.discount, currency)}</span></div>}
            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{formatPrice(order.totals.shipping, currency)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>VAT (15%)</span><span>{formatPrice(order.totals.vat, currency)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span className="text-brand-600">{formatPrice(order.totals.total, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery address */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Truck className="h-4 w-4" /> Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p className="font-medium">{order.address.fullName}</p>
          <p className="text-muted-foreground">{order.address.phone}</p>
          <p className="text-muted-foreground flex items-start gap-1">
            <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            {order.address.detail}, {order.address.subCity}, {order.address.city}
          </p>
          {order.status === 'shipped' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">Your order is on the way!</p>
              <p className="text-xs text-blue-600">Expected delivery: 1–2 business days</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" /> Order Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1 flex-shrink-0" />
                  {i < order.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium capitalize">{t.status}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(t.ts)}</p>
                  {t.note && <p className="text-xs text-muted-foreground mt-0.5">{t.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
