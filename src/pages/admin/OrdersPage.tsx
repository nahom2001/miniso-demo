import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Eye, CheckCircle } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getOrders, updateOrderStatus } from '@/mock/services/orders'
import { simulator } from '@/mock/simulator'
import { formatPrice } from '@/config/currencies'
import { formatDate } from '@/lib/utils'
import type { OrderStatus } from '@/domain/types'
import { useToast } from '@/components/ui/toast'

const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'placed', label: 'Placed' },
  { value: 'paid', label: 'Paid' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function OrdersPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all')
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data: orders = [], refetch } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: () => getOrders(activeTab !== 'all' ? { status: activeTab } : {}),
    refetchInterval: 10000,
  })

  useEffect(() => {
    const unsub = simulator.on(() => { refetch() })
    return () => { unsub() }
  }, [refetch])

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast({ title: 'Order updated', variant: 'success' }) },
  })

  const filtered = orders.filter((o) =>
    !search || o.number.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live updates
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OrderStatus | 'all')}>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order # or customer…" className="pl-9 h-9" />
            </div>
          </div>

          <TabsList className="mt-4 flex-wrap h-auto gap-1 bg-transparent p-0">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
                {tab.label}
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1.5">{orders.filter((o) => tab.value === 'all' || o.status === tab.value).length}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">Order</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Channel</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
                      ) : filtered.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <p className="font-medium text-brand-600">{order.number}</p>
                            <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                          </td>
                          <td className="p-3">
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                          </td>
                          <td className="p-3 text-muted-foreground hidden md:table-cell">{formatDate(order.createdAt)}</td>
                          <td className="p-3 hidden lg:table-cell"><Badge variant="outline" className="capitalize">{order.channel}</Badge></td>
                          <td className="p-3"><OrderStatusBadge status={order.status} /></td>
                          <td className="p-3 text-right font-medium">{formatPrice(order.totals.total, order.totals.currency)}</td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/admin/orders/${order.id}`}>
                                <Button size="xs" variant="ghost"><Eye className="h-3.5 w-3.5" /></Button>
                              </Link>
                              {order.status === 'placed' && (
                                <Button size="xs" variant="ghost" className="text-green-600" onClick={() => mutation.mutate({ id: order.id, status: 'paid' })}>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
