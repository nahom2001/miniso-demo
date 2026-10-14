import { useParams, useLocation, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Printer, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/config/currencies'
import { useUIStore } from '@/stores/uiStore'
import { brand } from '@/config/brand.config'
import type { Order } from '@/domain/types'

const PAYMENT_LABELS: Record<string, string> = {
  telebirr:         'Telebirr',
  cbe_birr:         'CBE Birr',
  card:             'Credit / Debit Card',
  bank_transfer:    'Bank Transfer',
  cash_on_delivery: 'Cash on Delivery',
}

// Derives a readable payment method from the payment ID stored on the order
function getPaymentLabel(order: Order): string {
  // paymentId format is "pay-checkout-<timestamp>" or "pay-<n>"
  // We stored method on the order via checkout, but it's not in the type.
  // Fall back to a readable default.
  return PAYMENT_LABELS[order.channel] ?? 'Online Payment'
}

export function OrderConfirmationPage() {
  const { orderId } = useParams()
  const { state } = useLocation() as { state: { order: Order; outcome: 'success' | 'fail' | 'pending' } }
  const currency = useUIStore((s) => s.currency)

  // Trigger browser print — the CSS handles what shows
  function handlePrint() {
    window.print()
  }

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
  const orderDate = new Date(order.createdAt)

  const outcomeConfig = {
    success: {
      icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      title: 'Order Confirmed',
      desc: `Thank you! Your order ${order.number} has been placed successfully.`,
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      pill: 'bg-green-400/30 text-green-100',
      pillLabel: '✓ Payment Confirmed',
    },
    fail: {
      icon: <XCircle className="h-12 w-12 text-red-500" />,
      title: 'Payment Failed',
      desc: `Payment for order ${order.number} could not be processed. Please try again.`,
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      pill: 'bg-red-400/30 text-red-100',
      pillLabel: '✗ Payment Failed',
    },
    pending: {
      icon: <Clock className="h-12 w-12 text-yellow-500" />,
      title: 'Payment Pending',
      desc: `Order ${order.number} is awaiting payment confirmation.`,
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      pill: 'bg-yellow-400/30 text-yellow-100',
      pillLabel: '⏳ Awaiting Payment',
    },
  }[outcome]

  const paymentStatus = outcome === 'success' ? 'Confirmed' : outcome === 'fail' ? 'Failed' : 'Pending'
  const paymentStatusColor = outcome === 'success' ? 'text-green-600' : outcome === 'fail' ? 'text-red-600' : 'text-yellow-600'

  return (
    <>
      {/*
        Print styles: scoped inside a <style> tag so they are self-contained
        and don't depend on index.css ordering.

        Strategy:
        - Add class "printing" to <body> via JS before print (window.print handles this
          natively via @media print).
        - Hide every sibling of #receipt-print using print media query.
        - The StorefrontLayout wraps everything in a flex column — we hide its
          header/footer/nav children, then show only the receipt.
      */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 14mm;
          }

          /* Force colours */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide the entire app shell and show only the receipt */
          body > #root {
            display: block !important;
          }

          /* Hide storefront header, footer, mobile nav, demo bar */
          body > #root header,
          body > #root footer,
          body > #root nav,
          body > #root .demo-control-bar,
          body > #root [class*="DemoControlBar"] {
            display: none !important;
          }

          /* Hide everything inside <main> except receipt */
          .screen-only {
            display: none !important;
          }

          /* Make main padding-free */
          main {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Receipt card takes full width, no rounded corners */
          #receipt-print {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            page-break-inside: avoid;
          }

          /* Brand header keeps its colour */
          .receipt-brand-header {
            background-color: #c0392b !important;
            color: white !important;
          }

          /* Table */
          .receipt-items-table {
            width: 100%;
            border-collapse: collapse;
          }
          .receipt-items-table th {
            background-color: #f9fafb !important;
            color: #6b7280 !important;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 6px 10px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
          }
          .receipt-items-table th:last-child,
          .receipt-items-table td:last-child { text-align: right; }
          .receipt-items-table th:nth-child(2),
          .receipt-items-table td:nth-child(2) { text-align: center; }
          .receipt-items-table td {
            padding: 7px 10px;
            font-size: 10pt;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: top;
          }

          /* Hide product thumbnails to save ink */
          .item-thumbnail { display: none !important; }

          /* Totals section */
          .receipt-totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 10pt;
            padding: 3px 0;
          }
          .receipt-totals-final {
            display: flex;
            justify-content: space-between;
            font-size: 13pt;
            font-weight: 700;
            border-top: 2px solid #111;
            padding-top: 5px;
            margin-top: 3px;
          }

          /* Footer */
          .receipt-doc-footer {
            border-top: 1px solid #e5e7eb !important;
            margin-top: 16px;
            padding-top: 10px;
            text-align: center;
            font-size: 8.5pt;
            color: #9ca3af;
          }
        }
      `}</style>

      <StorefrontLayout>
        <div className="container max-w-2xl mx-auto px-4 py-12 pb-24 md:pb-12">

          {/* Status banner — screen only */}
          <div className={`screen-only rounded-2xl border p-6 mb-8 text-center ${outcomeConfig.bg}`}>
            <div className="flex justify-center mb-3">{outcomeConfig.icon}</div>
            <h1 className={`text-2xl font-bold mb-1 ${outcomeConfig.text}`}>{outcomeConfig.title}</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{outcomeConfig.desc}</p>
          </div>

          {/* ── Receipt ──────────────────────────────────────────────────── */}
          <div id="receipt-print" className="rounded-2xl border bg-white overflow-hidden shadow-sm mb-6">

            {/* Brand header */}
            <div className="receipt-brand-header bg-brand-600 text-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0">M</div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{brand.name}</p>
                    <p className="text-xs text-white/70">{brand.address}</p>
                    <p className="text-xs text-white/70">support@miniso.et</p>
                  </div>
                </div>
                <div className="text-right text-sm flex-shrink-0">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">Tax Receipt</p>
                  <p className="font-bold text-xl">{order.number}</p>
                  <p className="text-white/80 text-xs">
                    {orderDate.toLocaleDateString('en-ET', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-white/70 text-xs">
                    {orderDate.toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${outcomeConfig.pill}`}>
                  {outcomeConfig.pillLabel}
                </span>
                <span className="text-xs text-white/60">
                  Ref: <span className="font-mono">{order.paymentId}</span>
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* Items table */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" /> Items Ordered
                </h3>
                <table className="receipt-items-table w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="text-left py-2.5 px-3 font-semibold">Description</th>
                      <th className="text-center py-2.5 px-3 font-semibold">Qty</th>
                      <th className="text-right py-2.5 px-3 font-semibold">Unit Price</th>
                      <th className="text-right py-2.5 px-3 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt=""
                              className="item-thumbnail w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                            />
                            <div>
                              <p className="font-medium text-sm">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-sm tabular-nums">{item.qty}</td>
                        <td className="py-3 px-3 text-right text-sm tabular-nums">{formatPrice(item.unitPrice, currency)}</td>
                        <td className="py-3 px-3 text-right text-sm font-semibold tabular-nums">{formatPrice(item.total, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end border-t pt-4">
                <div className="w-full max-w-xs space-y-1.5 text-sm">
                  <div className="receipt-totals-row flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatPrice(order.totals.subtotal, currency)}</span>
                  </div>
                  {order.totals.discount > 0 && (
                    <div className="receipt-totals-row flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="tabular-nums">−{formatPrice(order.totals.discount, currency)}</span>
                    </div>
                  )}
                  <div className="receipt-totals-row flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="tabular-nums">{formatPrice(order.totals.shipping, currency)}</span>
                  </div>
                  <div className="receipt-totals-row flex justify-between text-muted-foreground">
                    <span>VAT (15%)</span>
                    <span className="tabular-nums">{formatPrice(order.totals.vat, currency)}</span>
                  </div>
                  <div className="receipt-totals-final flex justify-between font-bold text-base border-t-2 border-gray-900 pt-2 mt-2">
                    <span>Total Paid</span>
                    <span className="text-brand-600 text-lg tabular-nums">{formatPrice(order.totals.total, currency)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{order.totals.currency} · Prices include VAT</p>
                </div>
              </div>

              {/* Delivery + Payment */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Delivery Address
                  </h4>
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold">{order.address.fullName}</p>
                    <p className="text-muted-foreground">{order.address.phone}</p>
                    {order.address.detail && <p className="text-muted-foreground">{order.address.detail}</p>}
                    <p className="text-muted-foreground">{order.address.subCity}, {order.address.city}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Payment
                  </h4>
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold">{getPaymentLabel(order)}</p>
                    <p className="text-muted-foreground">
                      Status:{' '}
                      <span className={`font-medium ${paymentStatusColor}`}>{paymentStatus}</span>
                    </p>
                    <p className="text-muted-foreground text-xs font-mono break-all">{order.paymentId}</p>
                    <p className="text-muted-foreground capitalize">Channel: {order.channel}</p>
                  </div>
                </div>
              </div>

              {/* Receipt footer */}
              <div className="receipt-doc-footer border-t pt-4 text-center text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-gray-700">{brand.name} · {brand.address}</p>
                <p>For support: <span className="font-medium">support@miniso.et</span></p>
                <p>Returns accepted within 14 days of delivery with this receipt as proof of purchase.</p>
                <p className="text-gray-400 mt-2">
                  Computer-generated receipt · Printed {new Date().toLocaleDateString('en-ET', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>

            </div>
          </div>

          {/* Action buttons — screen only */}
          <div className="screen-only flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
            {outcome === 'success' && (
              <Button asChild variant="outline" className="gap-2">
                <Link to="/account/orders">Track Order <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            )}
            {outcome === 'fail' && (
              <Button asChild variant="brand">
                <Link to="/checkout">Try Again</Link>
              </Button>
            )}
            <Button asChild variant="brand" className="gap-2">
              <Link to="/">Continue Shopping <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

        </div>
      </StorefrontLayout>
    </>
  )
}
