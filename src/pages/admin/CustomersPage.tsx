import { useState } from 'react'
import { Search, Mail, ShoppingBag } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { db } from '@/mock/db'
import { formatDate } from '@/lib/utils'
import { formatPrice } from '@/config/currencies'

export function CustomersPage() {
  const [search, setSearch] = useState('')

  const customers = db.users.filter(u => u.role === 'customer')
  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  )

  // Compute order stats per customer
  const stats = filtered.map(c => {
    const orders = db.orders.filter(o => o.customerId === c.id)
    const totalSpent = orders.reduce((s, o) => s + o.totals.total, 0)
    return { ...c, orderCount: orders.length, totalSpent }
  })

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customers ({customers.length})</h1>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="pl-9 h-9" />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Language</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Orders</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.slice(0, 50).map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {c.name[0]}
                          </div>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{formatDate(c.createdAt)}</td>
                      <td className="p-3 hidden lg:table-cell">
                        <Badge variant="outline" className="text-xs uppercase">{c.locale}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{c.orderCount}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold">{c.totalSpent > 0 ? formatPrice(c.totalSpent, 'ETB') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.length > 50 && (
                <div className="p-3 text-center text-sm text-muted-foreground border-t">
                  Showing 50 of {stats.length} customers
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
