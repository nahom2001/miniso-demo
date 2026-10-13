import { useState } from 'react'
import { Bell, CheckCheck, Trash2, Package, AlertTriangle, DollarSign, Megaphone } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/mock/db'
import type { Notification, NotificationType } from '@/domain/types'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

const typeIcons: Record<NotificationType, React.ReactNode> = {
  order_placed:    <Package className="h-4 w-4 text-blue-500" />,
  order_paid:      <DollarSign className="h-4 w-4 text-green-500" />,
  order_shipped:   <Package className="h-4 w-4 text-purple-500" />,
  order_delivered: <Package className="h-4 w-4 text-green-600" />,
  low_stock:       <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  refund_approved: <DollarSign className="h-4 w-4 text-orange-500" />,
  campaign_sent:   <Megaphone className="h-4 w-4 text-pink-500" />,
  system:          <Bell className="h-4 w-4 text-gray-500" />,
}

const typeBg: Record<NotificationType, string> = {
  order_placed:    'bg-blue-50',
  order_paid:      'bg-green-50',
  order_shipped:   'bg-purple-50',
  order_delivered: 'bg-green-50',
  low_stock:       'bg-yellow-50',
  refund_approved: 'bg-orange-50',
  campaign_sent:   'bg-pink-50',
  system:          'bg-gray-50',
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(db.notifications)
  const unread = notifications.filter(n => !n.read).length

  function markAllRead() {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    db.notifications.forEach(n => { n.read = true })
  }

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    const n = db.notifications.find(n => n.id === id)
    if (n) n.read = true
  }

  function remove(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unread > 0 && <Badge variant="destructive">{unread} unread</Badge>}
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        <Card>
          {notifications.length === 0 ? (
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">No notifications</p>
            </CardContent>
          ) : (
            <CardContent className="p-0 divide-y">
              {notifications.slice(0, 50).map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={cn(
                    'flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                    !notif.read && 'bg-blue-50/40'
                  )}
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', typeBg[notif.type])}>
                    {typeIcons[notif.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm', !notif.read ? 'font-semibold' : 'font-medium')}>{notif.title}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                        <button
                          onClick={e => { e.stopPropagation(); remove(notif.id) }}
                          className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.ts)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
