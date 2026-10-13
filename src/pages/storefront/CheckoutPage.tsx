import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle, CreditCard, Smartphone, Building2, Truck,
  ArrowLeft, MapPin, Banknote,
} from 'lucide-react'
import { StorefrontLayout } from '@/components/shared/StorefrontLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/config/currencies'
import { erpBus } from '@/mock/erpBus'
import { db } from '@/mock/db'
import type { Order, OrderStatus, PaymentMethod } from '@/domain/types'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import * as seed from '@/mock/seed'

type Step = 'contact' | 'delivery' | 'payment' | 'review'
const STEPS: Step[] = ['contact', 'delivery', 'payment', 'review']
const STEP_LABELS: Record<Step, string> = {
  contact: 'Contact',
  delivery: 'Delivery',
  payment: 'Payment',
  review: 'Review',
}

// Sub-cities of Addis Ababa per proposal delivery zone data
const SUB_CITIES = [
  'Bole', 'Kirkos', 'Yeka', 'Nifas Silk-Lafto', 'Kolfe Keranio',
  'Gulele', 'Lideta', 'Akaki Kality', 'Arada', 'Lemi Kura',
]

interface PaymentOption {
  id: PaymentMethod
  label: string
  description: string
  icon: React.ReactNode
  tbc?: boolean
  primary?: boolean
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'telebirr',
    label: 'Telebirr',
    description: 'Pay via Ethio Telecom mobile money',
    icon: <Smartphone className="h-5 w-5" />,
    primary: true,
  },
  {
    id: 'cbe_birr',
    label: 'CBE Birr',
    description: 'Commercial Bank of Ethiopia mobile banking',
    icon: <Building2 className="h-5 w-5" />,
    primary: true,
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard or local bank card',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Direct bank transfer with reference number',
    icon: <Banknote className="h-5 w-5" />,
  },
  {
    id: 'cash_on_delivery',
    label: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives',
    icon: <Truck className="h-5 w-5" />,
  },
]

export function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, getTotals, clearCart } = useCartStore()
  const currency = useUIStore((s) => s.currency)
  const language = useUIStore((s) => s.language)
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('contact')
  const [loading, setLoading] = useState(false)
  const [paymentOutcome, setPaymentOutcome] = useState<'success' | 'fail' | 'pending'>('success')

  const [form, setForm] = useState({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    city: 'Addis Ababa',
    subCity: 'Bole',
    woreda: '1',
    detail: '',
    deliveryZoneId: 'zone-1',
    paymentMethod: 'telebirr' as PaymentMethod,
  })

  const totals = getTotals()
  const currentStepIndex = STEPS.indexOf(step)
  const selectedZone = seed.deliveryZones.find((z) => z.id === form.deliveryZoneId)

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handlePlaceOrder() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))

    const orderId = `ord-checkout-${Date.now()}`
    const orderNumber = `MIN-${20000 + db.orders.length}`
    const order: Order = {
      id: orderId,
      number: orderNumber,
      customerId: user?.id ?? null,
      customerName: form.fullName,
      customerEmail: user?.email ?? '',
      items: items.map((i) => {
        const prod = db.products.find((p) => p.id === i.productId)!
        return {
          variantId: i.variantId,
          productId: i.productId,
          productName: prod?.name.en ?? i.productId,
          variantLabel: 'Default',
          image: prod?.images[0] ?? '',
          qty: i.qty,
          unitPrice: i.unitPrice,
          total: i.unitPrice * i.qty,
        }
      }),
      totals: { ...totals, currency },
      status: paymentOutcome === 'success' ? 'paid' : 'placed',
      timeline: [
        { status: 'placed', ts: new Date().toISOString() },
        ...(paymentOutcome === 'success'
          ? [{ status: 'paid' as OrderStatus, ts: new Date().toISOString() }]
          : []),
      ],
      paymentId: `pay-checkout-${Date.now()}`,
      deliveryZoneId: form.deliveryZoneId,
      partnerId: null,
      notes: [],
      address: {
        label: 'Shipping',
        fullName: form.fullName,
        phone: form.phone,
        city: form.city,
        subCity: form.subCity,
        woreda: form.woreda,
        detail: form.detail,
      },
      channel: 'online',
      createdAt: new Date().toISOString(),
    }

    db.orders.unshift(order)
    db.save()

    erpBus.emit({ type: 'ORDER_CREATED', orderId: order.id, orderNumber: order.number, total: totals.total })
    if (paymentOutcome === 'success') {
      erpBus.emit({ type: 'PAYMENT_SETTLED', paymentId: order.paymentId, orderId: order.id, amount: totals.total })
    }

    clearCart()
    setLoading(false)
    navigate(`/order-confirmation/${orderId}`, { state: { order, outcome: paymentOutcome } })
  }

  return (
    <StorefrontLayout>
      <div className="container max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold mb-6">{t('checkout.title')}</h1>

        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                  i < currentStepIndex ? 'bg-green-500 text-white' :
                  i === currentStepIndex ? 'bg-brand-600 text-white' :
                  'bg-gray-200 text-gray-500'
                )}>
                  {i < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn(
                  'hidden sm:block text-xs font-medium',
                  i === currentStepIndex ? 'text-brand-600' : 'text-muted-foreground'
                )}>
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mb-4 mx-1',
                  i < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* ── Step 1: Contact ─────────────────────────────── */}
            {step === 'contact' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('checkout.contact')}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>{t('checkout.fullName')} <span className="text-destructive">*</span></Label>
                    <Input
                      className="mt-1"
                      value={form.fullName}
                      onChange={(e) => setField('fullName', e.target.value)}
                      placeholder="Abebe Kebede"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="flex items-center gap-1">
                      {t('checkout.phone')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className="mt-1"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="+251 9XX XXX XXX"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for SMS order updates and delivery coordination
                    </p>
                  </div>
                </div>
                <Button variant="brand" onClick={() => setStep('delivery')}>
                  Continue to Delivery
                </Button>
              </div>
            )}

            {/* ── Step 2: Delivery ────────────────────────────── */}
            {step === 'delivery' && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">{t('checkout.delivery')}</h2>

                {/* Delivery zone selector */}
                <div>
                  <Label className="mb-2 block">Delivery Zone</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {seed.deliveryZones.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setField('deliveryZoneId', zone.id)}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                          form.deliveryZoneId === zone.id
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200 hover:border-gray-400'
                        )}
                      >
                        <MapPin className={cn(
                          'h-4 w-4 mt-0.5 flex-shrink-0',
                          form.deliveryZoneId === zone.id ? 'text-brand-600' : 'text-muted-foreground'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{zone.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(zone.rate, 'ETB')} · {zone.etaDays === 1 ? 'Same day' : `${zone.etaDays} days`}
                          </p>
                        </div>
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5',
                          form.deliveryZoneId === zone.id ? 'border-brand-600 bg-brand-600' : 'border-gray-300'
                        )} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address details */}
                <div>
                  <Label className="mb-2 block">Delivery Address</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">{t('checkout.city')}</Label>
                      <Input className="mt-1" value={form.city} onChange={(e) => setField('city', e.target.value)} />
                    </div>

                    {/* Sub-city selector buttons */}
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground mb-2 block">{t('checkout.subCity')}</Label>
                      <div className="flex flex-wrap gap-2">
                        {SUB_CITIES.map((sc) => (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => setField('subCity', sc)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                              form.subCity === sc
                                ? 'bg-brand-600 text-white border-brand-600'
                                : 'border-gray-300 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                            )}
                          >
                            {sc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">{t('checkout.woreda')}</Label>
                      <Input
                        className="mt-1"
                        value={form.woreda}
                        onChange={(e) => setField('woreda', e.target.value)}
                        placeholder="e.g. 03"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">{t('checkout.address')}</Label>
                      <Input
                        className="mt-1"
                        value={form.detail}
                        onChange={(e) => setField('detail', e.target.value)}
                        placeholder="Street, building name, floor…"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('contact')}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button variant="brand" onClick={() => setStep('payment')}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Payment ─────────────────────────────── */}
            {step === 'payment' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('checkout.payment')}</h2>

                <div className="space-y-2">
                  {PAYMENT_OPTIONS.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setField('paymentMethod', pm.id)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                        form.paymentMethod === pm.id
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-400'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        form.paymentMethod === pm.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                      )}>
                        {pm.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{pm.label}</span>
                          {pm.primary && (
                            <Badge variant="success" className="text-xs">Recommended</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{pm.description}</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                        form.paymentMethod === pm.id ? 'border-brand-600' : 'border-gray-300'
                      )}>
                        {form.paymentMethod === pm.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Demo outcome selector */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                  <p className="font-semibold text-amber-800 mb-2">Demo: Select payment outcome</p>
                  <div className="flex gap-2">
                    {(['success', 'fail', 'pending'] as const).map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setPaymentOutcome(o)}
                        className={cn(
                          'px-3 py-1 rounded-lg font-medium capitalize border transition-all',
                          paymentOutcome === o
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-amber-700 border-amber-300 hover:border-amber-500'
                        )}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('delivery')}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button variant="brand" onClick={() => setStep('review')}>
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 4: Review ──────────────────────────────── */}
            {step === 'review' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Review Your Order</h2>

                {/* Contact summary */}
                <div className="rounded-xl border p-4 space-y-1 text-sm">
                  <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">Contact</p>
                  <p>{form.fullName}</p>
                  <p className="text-muted-foreground">{form.phone}</p>
                </div>

                {/* Delivery summary */}
                <div className="rounded-xl border p-4 space-y-1 text-sm">
                  <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">Delivery</p>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-600" />
                    {form.city}, {form.subCity}, Woreda {form.woreda}
                  </p>
                  {form.detail && <p className="text-muted-foreground">{form.detail}</p>}
                  {selectedZone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Zone: {selectedZone.name} · {formatPrice(selectedZone.rate, 'ETB')} shipping
                    </p>
                  )}
                </div>

                {/* Payment summary */}
                <div className="rounded-xl border p-4 text-sm">
                  <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">Payment</p>
                  <p className="flex items-center gap-2">
                    {PAYMENT_OPTIONS.find((p) => p.id === form.paymentMethod)?.icon}
                    {PAYMENT_OPTIONS.find((p) => p.id === form.paymentMethod)?.label}
                  </p>
                </div>

                {/* Items */}
                <div className="rounded-xl border divide-y">
                  {items.map((item) => {
                    const prod = db.products.find((p) => p.id === item.productId)
                    return (
                      <div key={item.variantId} className="flex gap-3 p-4">
                        <img
                          src={prod?.images[0]}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {prod?.name[language] ?? prod?.name.en}
                          </p>
                          <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                        </div>
                        <p className="text-sm font-bold flex-shrink-0">
                          {formatPrice(item.unitPrice * item.qty, currency)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('payment')}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button variant="brand" loading={loading} onClick={handlePlaceOrder} size="lg">
                    {t('checkout.placeOrder')} · {formatPrice(totals.total, currency)}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary sidebar ────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-gray-50 p-4 sticky top-20">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totals.subtotal, currency)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−{formatPrice(totals.discount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(totals.shipping, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (15%)</span>
                  <span>{formatPrice(totals.vat, currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                  <span>Total</span>
                  <span className="text-brand-600">{formatPrice(totals.total, currency)}</span>
                </div>
              </div>

              {/* Selected payment method callout */}
              {step === 'review' && (
                <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700">
                  <p className="font-semibold mb-0.5">
                    {PAYMENT_OPTIONS.find((p) => p.id === form.paymentMethod)?.label}
                  </p>
                  <p>{PAYMENT_OPTIONS.find((p) => p.id === form.paymentMethod)?.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
