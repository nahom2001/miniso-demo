import { useParams, useLocation, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Printer, Package } from 'lucide-react'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/config/currencies'
import { useUIStore } from '@/stores/uiStore'
import { brand } from '@/config/brand.config'
import type { Order } from '@/domain/types'

export function OrderConfirmationPage() {
  const { orderId } = useParams()
  const { state } = useLocation() as { state: { order: Order; outcome: 'success' | 'fail' | 'pending' } }
  const currency = useUIStore((s) => s.currency)

  if (!state?.order) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Link to="/" className="text-brand-600 hover:underline mt-4 block">Back to Home</Link>
        </div>
      </StorefrontLayout>
    )
  }

  const { order, outcome } = state

  const iconMap = {
    success: <CheckCircle className="h-16 w-16 text-green-500" />,
    fail: <XCircle className="h-16 w-16 text-destructive" />,
    pending: <Clock className="h-16 w-16 text-yellow-500" />,
  }
  const titleMap = {
    success: 'Order Confirmed! 🎉',
    fail: 'Payment Failed',
    pending: 'Payment Pending',
  }
  const descMap = {
    success: `Your order ${order.number} has been placed successfully. You'll receive a confirmation email shortly.`,
    fail: `Payment for order ${order.number} could not be processed. Please try again.`,
    pending: `Your order ${order.number} is awaiting payment confirmation.`,
  }

  return (
    <StorefrontLayout>
      <div className="container max-w-2xl mx-auto px-4 py-12">
        {/* Status */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">{iconMap[outcome]}</div>
          <h1 className="text-3xl font-bold mb-2">{titleMap[outcome]}</h1>
          <p className="text-muted-foreground">{descMap[outcome]}</p>
        </div>

        {/* Receipt */}
        <div className="rounded-2xl border bg-white overflow-hidden mb-6 print:shadow-none" id="receipt">
          {/* Header */}
          <div className="bg-brand-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">M</div>
                <div>
                  <p className="font-bold">{brand.name}</p>
                  <p className="text-xs text-white/70">{brand.address}</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold">{order.number}</p>
                <p className="text-white/70">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Package className="h-4 w-4" /> Items Ordered</h3>
            <div className="space-y-3 mb-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.total, currency)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.totals.subtotal, currency)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(order.totals.shipping, currency)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">VAT (15%)</span><span>{formatPrice(order.totals.vat, currency)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span><span className="text-brand-600">{formatPrice(order.totals.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="px-6 pb-6">
            <div className="rounded-xl bg-gray-50 p-4">
              <h4 className="text-sm font-semibold mb-2">Delivery Address</h4>
              <p className="text-sm">{order.address.fullName}</p>
              <p className="text-sm text-muted-foreground">{order.address.detail}, {order.address.subCity}, {order.address.city}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print Receipt
          </Button>
          {outcome === 'success' && (
            <Button asChild variant="outline">
              <Link to={`/account/orders`}>Track Order</Link>
            </Button>
          )}
          {outcome === 'fail' && (
            <Button asChild variant="brand">
              <Link to="/checkout">Try Again</Link>
            </Button>
          )}
          <Button asChild variant="brand">
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </StorefrontLayout>
  )
}
