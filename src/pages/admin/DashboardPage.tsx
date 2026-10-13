import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ShoppingCart, Package, AlertTriangle, RefreshCw, DollarSign, Eye, Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { getDashboardStats } from '@/mock/services/orders'
import { simulator } from '@/mock/simulator'
import { formatPrice } from '@/config/currencies'
import { timeAgo } from '@/lib/utils'
import { db } from '@/mock/db'

const COLORS = ['#e31c1c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

export function DashboardPage() {
  const { t } = useTranslation()
  const [activityFeed, setActivityFeed] = useState(() => db.notifications.slice(0, 8))
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30')

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 15000,
  })

  // Listen to simulator events for live feed
  useEffect(() => {
    const unsub = simulator.on(() => {
      setActivityFeed([...db.notifications.slice(0, 8)])
      refetch()
    })
    return () => { unsub() }
  }, [refetch])

  const kpis = stats ? [
    { label: "Today's Sales", value: formatPrice(stats.todaySales, 'ETB'), icon: <DollarSign className="h-5 w-5" />, color: 'text-green-600', bg: 'bg-green-50', change: '+12%' },
    { label: 'Orders Today', value: stats.todayOrderCount, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50', change: '+5%' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-purple-600', bg: 'bg-purple-50', change: '+0.3%' },
    { label: 'Average Basket', value: formatPrice(stats.avgBasket, 'ETB'), icon: <Eye className="h-5 w-5" />, color: 'text-orange-600', bg: 'bg-orange-50', change: '-2%' },
    { label: 'Low Stock Items', value: stats.lowStock, icon: <AlertTriangle className="h-5 w-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50', change: '+3' },
    { label: 'Pending Refunds', value: stats.pendingRefunds, icon: <RefreshCw className="h-5 w-5" />, color: 'text-red-600', bg: 'bg-red-50', change: '0' },
  ] : []

  const chartData = stats?.salesChart.slice(-Number(period)) ?? []

  const byStatusData = Object.entries(stats?.byStatus ?? {}).map(([k, v]) => ({ name: k, value: v }))

  const byCatData = Object.entries(stats?.byCat ?? {}).slice(0, 6).map(([k, v], i) => ({
    name: `Category ${k.replace('cat-', '')}`,
    value: Math.round(v as number),
  }))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
            <p className="text-muted-foreground text-sm">Welcome back — here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
            <Activity className="h-3 w-3 animate-pulse" /> Live
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array(6).fill(null).map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-16" /></CardContent></Card>)
            : kpis.map((kpi) => (
              <Card key={kpi.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color} mb-3`}>
                    {kpi.icon}
                  </div>
                  <p className="text-xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                  <p className={`text-xs mt-1 font-medium ${kpi.change.startsWith('+') ? 'text-green-600' : kpi.change.startsWith('-') ? 'text-red-500' : 'text-muted-foreground'}`}>{kpi.change} vs yesterday</p>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sales over time */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sales Over Time</CardTitle>
                <div className="flex gap-1">
                  {(['7', '30', '90'] as const).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${period === p ? 'bg-brand-600 text-white' : 'text-muted-foreground hover:bg-gray-100'}`}>
                      {p}d
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e31c1c" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#e31c1c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v: number) => formatPrice(v, 'ETB')} labelFormatter={(l) => l} />
                  <Area type="monotone" dataKey="value" stroke="#e31c1c" fill="url(#salesGrad)" strokeWidth={2} name="Sales" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders by status */}
          <Card>
            <CardHeader><CardTitle className="text-base">Orders by Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {byStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top categories */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Sales by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byCatData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v: number) => formatPrice(v, 'ETB')} />
                  <Bar dataKey="value" fill="#e31c1c" radius={[0, 4, 4, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Live feed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Live Activity</CardTitle>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-48 overflow-y-auto">
              {activityFeed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : activityFeed.map((n) => (
                <div key={n.id} className="flex gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-gray-300' : 'bg-brand-600'}`} />
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-muted-foreground line-clamp-1">{n.body}</p>
                    <p className="text-muted-foreground">{timeAgo(n.ts)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent orders table */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">Order</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {db.orders.slice(0, 8).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-brand-600">{order.number}</td>
                      <td className="p-3">{order.customerName}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="p-3 text-right font-medium">{formatPrice(order.totals.total, order.totals.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
