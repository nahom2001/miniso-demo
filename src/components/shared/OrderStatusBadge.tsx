import type { OrderStatus } from '@/domain/types'
import { Badge } from '@/components/ui/badge'

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'outline' }> = {
  placed: { label: 'Placed', variant: 'secondary' },
  paid: { label: 'Paid', variant: 'info' },
  packed: { label: 'Packed', variant: 'warning' },
  shipped: { label: 'Shipped', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  returned: { label: 'Returned', variant: 'outline' },
  refunded: { label: 'Refunded', variant: 'outline' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
