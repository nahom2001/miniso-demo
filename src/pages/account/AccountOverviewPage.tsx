import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, Heart, MapPin, ShoppingBag, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { getOrders } from '@/mock/services/orders'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/config/currencies'
import { formatDate } from '@/lib/utils'

export function AccountOverviewPage() {
  const { user } = useAuthStore()
  const currency = useUIStore((s) => s.currency)
  const { data: orders = [] } = useQuery({
    queryKey: ['customer-orders', user?.id],
    queryFn: () => getOrders({ customerId: user?.id }),
    enabled: !!user,
  })

  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totals.total, 0)
  const delivered = orders.filter(o => o.status === 'delivered').length
  const pending = orders.filter(o => ['placed', 'paid', 'packed', 'shipped'].includes(o.status)).length

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: <Package className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Delivered', value: delivered, icon: <TrendingUp className="h-5 w-5 text-green-600" />, bg: 'bg-green-50' },
    { label: 'In Progress', value: pending, icon: <Clock className="h-5 w-5 text-yellow-600" />, bg: 'bg-yellow-50' },
    { label: 'Total Spent', value: formatPrice(totalSpent, currency), icon: <ShoppingBag className="h-5 w-5 text-brand-600" />, bg: 'bg-brand-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Here's a summary of your account activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link to="/account/orders" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground mb-3">No orders yet</p>
              <Button asChild variant="brand" size="sm"><Link to="/">Start Shopping</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 4).map((order) => (
              <Link key={order.id} to={`/account/orders/${order.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex gap-1.5">
                      {order.items.slice(0, 3).map((item, i) => (
                        <img key={i} src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{order.number}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)} · {order.items.length} item(s)</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                    <p className="font-bold text-sm hidden sm:block">{formatPrice(order.totals.total, currency)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/account/wishlist">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center">
                <Heart className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Wishlist</p>
                <p className="text-xs text-muted-foreground">5 saved items</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/account/addresses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Addresses</p>
                <p className="text-xs text-muted-foreground">Manage delivery</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
