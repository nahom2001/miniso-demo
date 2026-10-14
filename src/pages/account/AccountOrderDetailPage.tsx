import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Printer,
  ShoppingBag, CreditCard, PackageCheck, Bike, KeyRound,
} from 'lucide-react'
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

// ── Tracking steps ────────────────────────────────────────────────────────────
interface TrackStep {
  status: OrderStatus | 'handoff'
  label: string
  sub: string
  icon: React.ReactNode
}

const TRACK_STEPS: TrackStep[] = [
  {
    status: 'placed',
    label: 'Order Placed',
    sub: 'Your order has been received',
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    status: 'paid',
    label: 'Payment Confirmed',
    sub: 'Payment verified successfully',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    status: 'packed',
    label: 'Packed & Ready',
    sub: 'Items packed for dispatch',
    icon: <PackageCheck className="h-4 w-4" />,
  },
  {
    status: 'shipped',
    label: 'Out for Delivery',
    sub: 'On the way to your address',
    icon: <Bike className="h-4 w-4" />,
  },
  {
    status: 'delivered',
    label: 'Delivered',
    sub: 'Handed off & complete',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    status: 'handoff',
    label: 'Safe Hand-off',
    sub: 'PIN or signature confirmed',
    icon: <KeyRound className="h-4 w-4" />,
  },
]

const STATUS_ORDER: (OrderStatus | 'handoff')[] = [
  'placed', 'paid', 'packed', 'shipped', 'delivered', 'handoff',
]

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

  const isCancelled = order.status === 'cancelled'
  // Map order status to tracking index
  // delivered also lights up handoff if delivered
  const currentStatusIdx = STATUS_ORDER.indexOf(
    order.status === 'delivered' ? 'handoff' : order.status
  )

  function isStepDone(idx: number) {
    return idx <= currentStatusIdx
  }
  function isStepActive(idx: number) {
    return idx === currentStatusIdx
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
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

      {/* ── Live tracking timeline ─────────────────────────────────────── */}
      {!isCancelled && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-600" /> Live Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop: horizontal */}
            <div className="hidden sm:flex items-start">
              {TRACK_STEPS.map((step, i) => {
                const done   = isStepDone(i)
                const active = isStepActive(i)
                return (
                  <div key={step.status} className="flex items-start flex-1">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      {/* Icon circle */}
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                        done
                          ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100'
                          : active
                          ? 'bg-brand-50 border-brand-400 text-brand-600'
                          : 'bg-white border-gray-200 text-gray-400'
                      )}>
                        {step.icon}
                      </div>
                      {/* Label */}
                      <div className="text-center px-1">
                        <p className={cn(
                          'text-xs font-semibold leading-tight',
                          active ? 'text-brand-600' : done ? 'text-gray-700' : 'text-gray-400'
                        )}>{step.label}</p>
                        <p className={cn(
                          'text-[10px] leading-tight mt-0.5',
                          done ? 'text-muted-foreground' : 'text-gray-300'
                        )}>{step.sub}</p>
                      </div>
                    </div>
                    {/* Connector line */}
                    {i < TRACK_STEPS.length - 1 && (
                      <div className={cn(
                        'h-0.5 flex-1 mt-5 mx-0.5 transition-colors',
                        i < currentStatusIdx ? 'bg-brand-600' : 'bg-gray-200'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Mobile: vertical */}
            <div className="sm:hidden space-y-0">
              {TRACK_STEPS.map((step, i) => {
                const done   = isStepDone(i)
                const active = isStepActive(i)
                return (
                  <div key={step.status} className="flex gap-3">
                    {/* Left col: icon + line */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all',
                        done
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : active
                          ? 'bg-brand-50 border-brand-400 text-brand-600'
                          : 'bg-white border-gray-200 text-gray-300'
                      )}>
                        {step.icon}
                      </div>
                      {i < TRACK_STEPS.length - 1 && (
                        <div className={cn(
                          'w-0.5 flex-1 my-1',
                          i < currentStatusIdx ? 'bg-brand-600' : 'bg-gray-200'
                        )} />
                      )}
                    </div>
                    {/* Right col: text */}
                    <div className={cn('pb-4', i === TRACK_STEPS.length - 1 && 'pb-0')}>
                      <p className={cn(
                        'text-sm font-semibold mt-1.5',
                        active ? 'text-brand-600' : done ? 'text-gray-800' : 'text-gray-400'
                      )}>{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.sub}</p>
                      {/* Timestamp from timeline if available */}
                      {done && order.timeline.find((t) => t.status === step.status) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(order.timeline.find((t) => t.status === step.status)!.ts)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* PIN handoff callout when delivered */}
            {order.status === 'delivered' && (
              <div className="mt-4 flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <KeyRound className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Delivery Complete</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    PIN code or signature was confirmed at handoff. Your order has been safely received.
                  </p>
                </div>
              </div>
            )}

            {/* Out for delivery callout */}
            {order.status === 'shipped' && (
              <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <Bike className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Your order is on the way!</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Expected delivery today or tomorrow. Keep your phone on — the courier will call before arrival.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancelled state */}
      {isCancelled && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">Order Cancelled</p>
              <p className="text-xs text-red-600">This order was cancelled. If you paid, a refund will be processed within 3–5 business days.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order items + price breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" /> Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image} alt={item.productName}
                className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{item.variantLabel} · Qty {item.qty}</p>
                <p className="text-sm font-semibold text-brand-600 mt-0.5">{formatPrice(item.unitPrice, currency)}</p>
              </div>
              <p className="font-bold text-sm flex-shrink-0">{formatPrice(item.total, currency)}</p>
            </div>
          ))}

          <div className="border-t pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{formatPrice(order.totals.subtotal, currency)}</span>
            </div>
            {order.totals.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>−{formatPrice(order.totals.discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span><span>{formatPrice(order.totals.shipping, currency)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (15%)</span><span>{formatPrice(order.totals.vat, currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span className="text-brand-600">{formatPrice(order.totals.total, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery info */}
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
        </CardContent>
      </Card>

      {/* Timeline log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" /> Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {order.timeline.map((entry, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                  {i < order.timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                  )}
                </div>
                <div className="pb-3 last:pb-0">
                  <p className="text-sm font-medium capitalize">{entry.status}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(entry.ts)}</p>
                  {entry.note && <p className="text-xs text-muted-foreground mt-0.5 italic">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
