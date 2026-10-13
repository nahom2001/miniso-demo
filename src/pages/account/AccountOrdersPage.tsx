import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrders } from '@/mock/services/orders'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/config/currencies'
import { formatDate } from '@/lib/utils'

export function AccountOrdersPage() {
  const { user } = useAuthStore()
  const currency = useUIStore((s) => s.currency)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['customer-orders', user?.id],
    queryFn: () => getOrders({ customerId: user?.id }),
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        {Array(3).fill(null).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My Orders ({orders?.length ?? 0})</h1>

      {(!orders || orders.length === 0) ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
            <Button asChild variant="brand" size="sm"><Link to="/">Start Shopping</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} to={`/account/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-brand-600">{order.number}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {order.items.slice(0, 4).map((item, i) => (
                      <img key={i} src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5" /> {order.items.length} item(s)
                    </span>
                    <span className="font-bold">{formatPrice(order.totals.total, currency)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
