import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Printer, CheckCircle, Package, Truck } from 'lucide-react'
import { useState } from 'react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { getOrder, updateOrderStatus, addOrderNote } from '@/mock/services/orders'
import { formatPrice } from '@/config/currencies'
import { formatDateTime } from '@/lib/utils'
import type { OrderStatus } from '@/domain/types'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const STATUS_FLOW: OrderStatus[] = ['placed', 'paid', 'packed', 'shipped', 'delivered']

export function OrderDetailPage() {
  const { orderId } = useParams()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [note, setNote] = useState('')

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  })

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(orderId!, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['order', orderId] }); toast({ title: 'Status updated', variant: 'success' }) },
  })

  const noteMutation = useMutation({
    mutationFn: (text: string) => addOrderNote(orderId!, text, user?.id ?? ''),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['order', orderId] }); setNote('') },
  })

  if (isLoading || !order) return <AdminLayout><div className="p-8 text-center text-muted-foreground">Loading order…</div></AdminLayout>

  const currentStatusIdx = STATUS_FLOW.indexOf(order.status)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin/orders"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-xl font-bold">Order {order.number}</h1>
              <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Print</Button>
          </div>
        </div>

        {/* Status timeline */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Order Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {STATUS_FLOW.map((s, i) => {
                const done = i <= currentStatusIdx
                const current = i === currentStatusIdx
                return (
                  <div key={s} className="flex items-center gap-2 flex-shrink-0">
                    <div className={cn('flex flex-col items-center gap-1')}>
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2',
                        done ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-400 border-gray-200')}>
                        {done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={cn('text-xs capitalize font-medium', current ? 'text-brand-600' : done ? 'text-gray-700' : 'text-gray-400')}>{s}</span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && <div className={cn('h-0.5 w-8 mb-4', done && i < currentStatusIdx ? 'bg-brand-600' : 'bg-gray-200')} />}
                  </div>
                )
              })}
            </div>

            {/* Advance status */}
            {currentStatusIdx < STATUS_FLOW.length - 1 && order.status !== 'cancelled' && (
              <div className="flex gap-2 mt-4 flex-wrap">
                <Button size="sm" variant="brand" onClick={() => statusMutation.mutate(STATUS_FLOW[currentStatusIdx + 1])} loading={statusMutation.isPending}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark as {STATUS_FLOW[currentStatusIdx + 1]}
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => statusMutation.mutate('cancelled')}>
                  Cancel Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" /> Order Items</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty} × {formatPrice(item.unitPrice, order.totals.currency)}</p>
                    </div>
                    <p className="text-sm font-bold">{formatPrice(item.total, order.totals.currency)}</p>
                  </div>
                ))}
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.totals.subtotal, order.totals.currency)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(order.totals.shipping, order.totals.currency)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span>{formatPrice(order.totals.vat, order.totals.currency)}</span></div>
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-brand-600">{formatPrice(order.totals.total, order.totals.currency)}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Internal Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {order.notes.length === 0 ? <p className="text-sm text-muted-foreground">No notes yet</p> : order.notes.map((n) => (
                  <div key={n.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.ts)}</p>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="h-9" onKeyDown={(e) => e.key === 'Enter' && note && noteMutation.mutate(note)} />
                  <Button size="sm" variant="outline" disabled={!note} onClick={() => noteMutation.mutate(note)}>Add</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Customer</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" /> Delivery</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.address.fullName}</p>
                <p className="text-muted-foreground">{order.address.detail}</p>
                <p className="text-muted-foreground">{order.address.subCity}, {order.address.city}</p>
                <p className="text-muted-foreground">{order.address.phone}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {order.timeline.map((t, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium capitalize">{t.status}</p>
                      <p className="text-muted-foreground">{formatDateTime(t.ts)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
