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
  const orderDate = new Date(order.createdAt)

  const STATUS = {
    success: {
      icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      title: 'Order Confirmed',
      desc: `Thank you! Your order ${order.number} has been placed successfully.`,
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
    },
    fail: {
      icon: <XCircle className="h-12 w-12 text-red-500" />,
      title: 'Payment Failed',
      desc: `Payment for order ${order.number} could not be processed. Please try again.`,
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
    },
    pending: {
      icon: <Clock className="h-12 w-12 text-yellow-500" />,
      title: 'Payment Pending',
      desc: `Order ${order.number} is awaiting payment confirmation. We'll notify you shortly.`,
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
    },
  }[outcome]

  return (
    <>
      {/* ── Print stylesheet injected inline ───────────────────────────────── */}
      <style>{`
        @media print {
          /* Hide everything except the receipt */
          body > *:not(#print-root) { display: none !important; }
          #print-root { display: block !important; }

          /* Hide nav, footer, buttons, status banner */
          header, footer, nav,
          .no-print,
          [data-no-print] { display: none !important; }

          /* Reset page */
          @page {
            size: A4;
            margin: 16mm 14mm;
          }

          body {
            background: white !important;
            color: #111 !important;
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
            font-size: 11pt !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Show only the receipt card */
          #receipt-print {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Brand header: keep colour */
          .receipt-header {
            background-color: #c0392b !important;
            color: white !important;
            padding: 20px 24px !important;
            margin-bottom: 0 !important;
          }

          /* Table styling */
          .receipt-table { width: 100%; border-collapse: collapse; }
          .receipt-table th {
            background-color: #f3f4f6 !important;
            border-bottom: 1px solid #e5e7eb;
            padding: 6px 10px;
            text-align: left;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
          }
          .receipt-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 10pt;
            vertical-align: middle;
          }
          .receipt-table tr:last-child td { border-bottom: none; }

          /* Totals */
          .totals-row { padding: 4px 0; font-size: 10pt; }
          .totals-final { font-size: 13pt; font-weight: 700; border-top: 2px solid #111; padding-top: 6px; margin-top: 4px; }

          /* Footer rule */
          .receipt-footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            margin-top: 20px;
            font-size: 8.5pt;
            color: #6b7280;
            text-align: center;
          }

          /* Hide images in print items table (save ink) */
          .item-img { display: none !important; }

          /* Watermark for non-success */
          .print-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 72pt;
            font-weight: 900;
            opacity: 0.06;
            pointer-events: none;
            z-index: 9999;
          }
        }
      `}</style>

      <StorefrontLayout>
        <div className="container max-w-2xl mx-auto px-4 py-12 pb-24 md:pb-12">

          {/* Status banner — hidden in print */}
          <div className={`no-print rounded-2xl border p-6 mb-8 text-center ${STATUS.bg}`}>
            <div className="flex justify-center mb-3">{STATUS.icon}</div>
            <h1 className={`text-2xl font-bold mb-1 ${STATUS.text}`}>{STATUS.title}</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{STATUS.desc}</p>
          </div>

          {/* ── Receipt card (screen + print) ───────────────────────────── */}
          <div
            id="receipt-print"
            className="rounded-2xl border bg-white overflow-hidden shadow-sm mb-6"
          >
            {/* Brand header */}
            <div className="receipt-header bg-brand-600 text-white p-6">
              <div className="flex items-start justify-between gap-4">
                {/* Brand */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0">
                    M
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{brand.name}</p>
                    <p className="text-xs text-white/70">{brand.address}</p>
                    <p className="text-xs text-white/70">{brand.phone ?? 'support@miniso.et'}</p>
                  </div>
                </div>

                {/* Receipt meta */}
                <div className="text-right text-sm flex-shrink-0">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">Receipt</p>
                  <p className="font-bold text-lg">{order.number}</p>
                  <p className="text-white/80 text-xs">
                    {orderDate.toLocaleDateString('en-ET', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-white/70 text-xs">
                    {orderDate.toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  outcome === 'success' ? 'bg-green-400/30 text-green-100'
                  : outcome === 'fail'  ? 'bg-red-400/30 text-red-100'
                  : 'bg-yellow-400/30 text-yellow-100'
                }`}>
                  {outcome === 'success' ? '✓ Payment Confirmed'
                   : outcome === 'fail'  ? '✗ Payment Failed'
                   : '⏳ Awaiting Payment'}
                </span>
                <span className="text-xs text-white/60">
                  via {PAYMENT_LABELS[order.paymentId?.split('-')[0] ?? ''] ?? 'Online Payment'}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Items table ─────────────────────────────────────────── */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" /> Items Ordered
                </h3>
                <table className="receipt-table w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="text-left py-2 px-3 font-medium rounded-l-lg">Item</th>
                      <th className="text-center py-2 px-3 font-medium">Qty</th>
                      <th className="text-right py-2 px-3 font-medium">Unit Price</th>
                      <th className="text-right py-2 px-3 font-medium rounded-r-lg">Total</th>
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
                              className="item-img w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                            />
                            <div>
                              <p className="font-medium text-sm leading-tight">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">{item.qty}</td>
                        <td className="py-3 px-3 text-right text-sm">{formatPrice(item.unitPrice, currency)}</td>
                        <td className="py-3 px-3 text-right text-sm font-semibold">{formatPrice(item.total, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Totals ──────────────────────────────────────────────── */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.totals.subtotal, currency)}</span>
                  </div>
                  {order.totals.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>−{formatPrice(order.totals.discount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{formatPrice(order.totals.shipping, currency)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT (15%)</span>
                    <span>{formatPrice(order.totals.vat, currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t-2 border-gray-900 pt-2 mt-2">
                    <span>Total Paid</span>
                    <span className="text-brand-600 text-lg">{formatPrice(order.totals.total, currency)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {order.totals.currency} · incl. VAT
                  </p>
                </div>
              </div>

              {/* ── Delivery + Payment info ──────────────────────────────── */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Delivery Address
                  </h4>
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold">{order.address.fullName}</p>
                    <p className="text-muted-foreground">{order.address.phone}</p>
                    {order.address.detail && (
                      <p className="text-muted-foreground">{order.address.detail}</p>
                    )}
                    <p className="text-muted-foreground">
                      {order.address.subCity}, {order.address.city}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Payment Details
                  </h4>
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold">
                      {PAYMENT_LABELS[order.paymentId?.split('-')[0] ?? ''] ?? 'Online Payment'}
                    </p>
                    <p className="text-muted-foreground">Status:{' '}
                      <span className={
                        outcome === 'success' ? 'text-green-600 font-medium'
                        : outcome === 'fail'  ? 'text-red-600 font-medium'
                        : 'text-yellow-600 font-medium'
                      }>
                        {outcome === 'success' ? 'Confirmed' : outcome === 'fail' ? 'Failed' : 'Pending'}
                      </span>
                    </p>
                    <p className="text-muted-foreground">Ref: <span className="font-mono text-xs">{order.paymentId}</span></p>
                    <p className="text-muted-foreground">Channel: {order.channel === 'online' ? 'Online Store' : order.channel}</p>
                  </div>
                </div>
              </div>

              {/* ── Receipt footer ───────────────────────────────────────── */}
              <div className="receipt-footer border-t pt-5 text-center">
                <p className="text-xs font-semibold text-gray-700 mb-1">{brand.name}</p>
                <p className="text-xs text-muted-foreground">{brand.address}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  For support, visit <span className="font-medium">miniso.et</span> or contact us at{' '}
                  <span className="font-medium">support@miniso.et</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Returns accepted within 14 days of delivery with proof of purchase.
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  This is a computer-generated receipt. Printed on{' '}
                  {new Date().toLocaleDateString('en-ET', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>

            </div>
          </div>

          {/* ── Action buttons (hidden in print) ────────────────────────── */}
          <div className="no-print flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
            {outcome === 'success' && (
              <Button asChild variant="outline" className="gap-2">
                <Link to="/account/orders">
                  Track Order <ArrowRight className="h-4 w-4" />
                </Link>
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
