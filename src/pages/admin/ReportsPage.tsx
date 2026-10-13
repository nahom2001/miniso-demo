import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Printer } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getDashboardStats } from '@/mock/services/orders'
import { formatPrice } from '@/config/currencies'
import { db } from '@/mock/db'
import * as seed from '@/mock/seed'

const COLORS = ['#e31c1c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

export function ReportsPage() {
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30')
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats })

  const salesData = stats?.salesChart.slice(-Number(dateRange)) ?? []

  // Payment method breakdown
  const paymentBreakdown = Object.entries(
    seed.payments.reduce<Record<string, number>>((acc, p) => {
      acc[p.method] = (acc[p.method] ?? 0) + p.amount
      return acc
    }, {})
  ).map(([method, total]) => ({ method: method.replace('_', ' '), total }))

  // Top products
  const productSales = Object.entries(
    db.orders.flatMap((o) => o.items).reduce<Record<string, number>>((acc, item) => {
      acc[item.productId] = (acc[item.productId] ?? 0) + item.total
      return acc
    }, {})
  ).map(([id, total]) => ({
    name: db.products.find((p) => p.id === id)?.name.en ?? id,
    total,
  })).sort((a, b) => b.total - a.total).slice(0, 10)

  // Customer segments
  const customerData = [
    { name: 'New Customers', value: 234 },
    { name: 'Returning', value: 456 },
    { name: 'VIP (5+ orders)', value: 89 },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reports</h1>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['7', '30', '90'] as const).map((p) => (
                <button key={p} onClick={() => setDateRange(p)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${dateRange === p ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p}d
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1" /> Export</Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-3.5 w-3.5 mr-1" /> Print</Button>
          </div>
        </div>

        <Tabs defaultValue="sales">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: formatPrice(db.orders.reduce((s, o) => s + o.totals.total, 0), 'ETB') },
                { label: 'Total Orders', value: db.orders.length },
                { label: 'Avg Order Value', value: formatPrice(db.orders.reduce((s, o) => s + o.totals.total, 0) / db.orders.length, 'ETB') },
                { label: 'Refunds', value: seed.refunds.length },
              ].map((kpi) => (
                <Card key={kpi.label}>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Revenue Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e31c1c" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#e31c1c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => formatPrice(v, 'ETB')} />
                    <Area type="monotone" dataKey="value" stroke="#e31c1c" fill="url(#rGrad)" strokeWidth={2} name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Top Selling Products</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productSales} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip formatter={(v: number) => formatPrice(v, 'ETB')} />
                    <Bar dataKey="total" fill="#e31c1c" radius={[0, 4, 4, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Customer Segments</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={customerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {customerData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {customerData.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                      <span className="flex-1 text-sm">{s.name}</span>
                      <span className="text-sm font-bold">{s.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Revenue by Payment Method</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={paymentBreakdown} dataKey="total" nameKey="method" cx="50%" cy="50%" outerRadius={80}>
                        {paymentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatPrice(v, 'ETB')} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {paymentBreakdown.map((p, i) => (
                    <div key={p.method} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                      <span className="flex-1 text-sm capitalize">{p.method}</span>
                      <span className="text-sm font-bold">{formatPrice(p.total, 'ETB')}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
