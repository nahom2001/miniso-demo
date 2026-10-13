import { useState, useEffect } from 'react'
import { ArrowRightLeft, Activity, RefreshCw, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { erpBus } from '@/mock/erpBus'
import { db } from '@/mock/db'
import * as seed from '@/mock/seed'
import { formatPrice } from '@/config/currencies'
import { formatDateTime, timeAgo } from '@/lib/utils'
import type { SyncLogEntry } from '@/domain/types'
import { brand } from '@/config/brand.config'

export function ErpSimulatorPage() {
  const [syncLog, setSyncLog] = useState<SyncLogEntry[]>(() => db.syncLog.slice(0, 20))
  const [erpInventory, setErpInventory] = useState(() =>
    seed.products.slice(0, 15).map((p) => ({ ...p, erpQty: Math.floor(Math.random() * 200 + 50) }))
  )
  const [salesLedger, setSalesLedger] = useState(() => seed.orders.slice(0, 20))
  const [payments, setPayments] = useState(() => seed.payments.slice(0, 20))
  const [liveEvent, setLiveEvent] = useState<string | null>(null)

  // Listen for cross-tab events
  useEffect(() => {
    const unsub = erpBus.on((event) => {
      setLiveEvent(`${event.type} received`)
      setSyncLog([...db.syncLog.slice(0, 20)])
      if (event.type === 'ORDER_CREATED') {
        setSalesLedger([...db.orders.slice(0, 20)])
      }
      if (event.type === 'PAYMENT_SETTLED') {
        setPayments((prev) => [...prev.slice(0, 19)])
      }
      if (event.type === 'STOCK_UPDATED') {
        setErpInventory((prev) => prev.map((p) =>
          p.id === event.variantId.replace('default-', '') ? { ...p, erpQty: event.qty } : p
        ))
      }
      setTimeout(() => setLiveEvent(null), 3000)
    })
    return () => { unsub() }
  }, [])

  function simulateErpStockUpdate(productId: string) {
    const newQty = Math.floor(Math.random() * 100 + 50)
    setErpInventory((prev) => prev.map((p) => p.id === productId ? { ...p, erpQty: newQty } : p))
    erpBus.emit({ type: 'STOCK_UPDATED', variantId: `default-${productId}`, qty: newQty, locationId: 'online' })
  }

  function simulateFailure() {
    const entry: SyncLogEntry = {
      id: `sync-fail-${Date.now()}`,
      direction: 'erp→storefront',
      entity: 'inventory',
      entityId: 'demo',
      status: 'failed',
      ts: new Date().toISOString(),
      payload: { error: 'Connection timeout', retryIn: 30 },
      retryCount: 1,
    }
    db.syncLog.unshift(entry)
    setSyncLog([...db.syncLog.slice(0, 20)])
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800 sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">ERP</div>
            <div>
              <p className="font-bold text-sm">Client ERP Simulator</p>
              <p className="text-xs text-gray-400">{brand.name} Integration Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {liveEvent && (
              <div className="flex items-center gap-2 bg-green-900/50 border border-green-700 rounded-lg px-3 py-1.5 text-xs text-green-400 animate-fade-in">
                <Activity className="h-3 w-3 animate-pulse" />
                {liveEvent}
              </div>
            )}
            <Link to="/admin" className="text-sm text-gray-400 hover:text-white">← Admin</Link>
            <Link to="/" className="text-sm text-gray-400 hover:text-white">Storefront</Link>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Sync status bar */}
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="font-semibold">Live Sync Status</h2>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:text-white" onClick={simulateFailure}>
                Simulate Failure
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => erpBus.emit({ type: 'SYNC_REQUEST' })}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Force Sync
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-3 flex-shrink-0">
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">{syncLog.filter((s) => s.status === 'success').length}</p>
                <p className="text-xs text-gray-400">Success</p>
              </div>
            </div>
            <ArrowRightLeft className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-3 flex-shrink-0">
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{syncLog.filter((s) => s.status === 'failed').length}</p>
                <p className="text-xs text-gray-400">Failed</p>
              </div>
            </div>
            <div className="flex-1 flex items-center">
              <div className="w-full flex flex-col items-center gap-0.5">
                <div className="flex items-center w-full gap-2">
                  <div className="text-xs text-gray-500 w-20 text-right">Storefront</div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-brand-600 to-blue-600 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-800 animate-pulse" />
                  </div>
                  <div className="text-xs text-gray-500 w-12">ERP</div>
                </div>
                <p className="text-xs text-green-400">BroadcastChannel — open in 2 tabs to see real-time sync</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="inventory" className="text-white">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">Inventory</TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">Sales Ledger</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">Payments</TabsTrigger>
            <TabsTrigger value="synclog" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">Sync Log</TabsTrigger>
          </TabsList>

          {/* Inventory */}
          <TabsContent value="inventory">
            <div className="rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold">ERP Inventory</h3>
                <p className="text-xs text-gray-400">Changes here sync to Storefront availability</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700 bg-gray-700/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-400">Product</th>
                      <th className="text-center p-3 font-medium text-gray-400">ERP Qty</th>
                      <th className="text-center p-3 font-medium text-gray-400">Storefront</th>
                      <th className="text-center p-3 font-medium text-gray-400">Sync Status</th>
                      <th className="text-right p-3 font-medium text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {erpInventory.map((p) => {
                      const storefrontQty = db.stockItems.find((s) => s.variantId === `default-${p.id}` && s.locationId === 'online')?.qty ?? 0
                      const inSync = Math.abs(p.erpQty - storefrontQty) <= 5
                      return (
                        <tr key={p.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover bg-gray-700" />
                              <span className="text-xs">{p.name.en}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold text-blue-400">{p.erpQty}</td>
                          <td className="p-3 text-center text-gray-300">{storefrontQty}</td>
                          <td className="p-3 text-center">
                            {inSync
                              ? <span className="text-green-400 text-xs flex items-center justify-center gap-1"><CheckCircle className="h-3 w-3" /> Synced</span>
                              : <span className="text-yellow-400 text-xs flex items-center justify-center gap-1"><XCircle className="h-3 w-3" /> Drift</span>
                            }
                          </td>
                          <td className="p-3 text-right">
                            <Button size="xs" className="bg-blue-700 hover:bg-blue-600 text-white" onClick={() => simulateErpStockUpdate(p.id)}>
                              Update →
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Sales Ledger */}
          <TabsContent value="sales">
            <div className="rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold">Sales Ledger — Online Orders</h3>
                <p className="text-xs text-gray-400 mt-0.5">New orders from storefront appear here in real-time</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700 bg-gray-700/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-400">Order #</th>
                      <th className="text-left p-3 font-medium text-gray-400">Customer</th>
                      <th className="text-left p-3 font-medium text-gray-400 hidden md:table-cell">Date</th>
                      <th className="text-right p-3 font-medium text-gray-400">Amount</th>
                      <th className="text-center p-3 font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {salesLedger.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-700/30">
                        <td className="p-3 font-mono text-blue-400 text-xs">{o.number}</td>
                        <td className="p-3 text-gray-300 text-xs">{o.customerName}</td>
                        <td className="p-3 text-gray-400 text-xs hidden md:table-cell">{formatDateTime(o.createdAt)}</td>
                        <td className="p-3 text-right font-bold text-green-400">{formatPrice(o.totals.total, o.totals.currency)}</td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'delivered' ? 'bg-green-900/50 text-green-400' : o.status === 'cancelled' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'} capitalize`}>{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <div className="rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold">Payment Settlements</h3>
                <p className="text-xs text-gray-400 mt-0.5">Reconciliation view — matched/unmatched payments</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700 bg-gray-700/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-400">Ref</th>
                      <th className="text-left p-3 font-medium text-gray-400 hidden md:table-cell">Method</th>
                      <th className="text-right p-3 font-medium text-gray-400">Amount</th>
                      <th className="text-center p-3 font-medium text-gray-400">Status</th>
                      <th className="text-center p-3 font-medium text-gray-400">Reconciliation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {payments.map((p, i) => (
                      <tr key={p.id} className="hover:bg-gray-700/30">
                        <td className="p-3 font-mono text-xs text-gray-300">{p.gatewayRef}</td>
                        <td className="p-3 text-gray-400 capitalize text-xs hidden md:table-cell">{p.method.replace('_', ' ')}</td>
                        <td className="p-3 text-right font-bold text-green-400 text-xs">{formatPrice(p.amount, p.currency)}</td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${p.status === 'completed' ? 'bg-green-900/50 text-green-400' : p.status === 'failed' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}`}>{p.status}</span>
                        </td>
                        <td className="p-3 text-center">
                          {i % 5 === 4
                            ? <span className="text-xs text-yellow-400 flex items-center justify-center gap-1"><XCircle className="h-3 w-3" /> Unmatched</span>
                            : <span className="text-xs text-green-400 flex items-center justify-center gap-1"><CheckCircle className="h-3 w-3" /> Matched</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Sync Log */}
          <TabsContent value="synclog">
            <div className="rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold">Sync Log</h3>
                <Button size="xs" className="bg-gray-700 hover:bg-gray-600 text-xs" onClick={() => setSyncLog([...db.syncLog.slice(0, 20)])}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                </Button>
              </div>
              <div className="divide-y divide-gray-700">
                {syncLog.map((entry) => (
                  <div key={entry.id} className="p-4 flex items-start gap-3 hover:bg-gray-700/30 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${entry.status === 'success' ? 'bg-green-500' : entry.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{timeAgo(entry.ts)}</span>
                        <span className="flex items-center gap-1 text-xs">
                          {entry.direction === 'storefront→erp'
                            ? <><span className="text-brand-400">Storefront</span><ArrowRight className="h-3 w-3 text-gray-500" /><span className="text-blue-400">ERP</span></>
                            : <><span className="text-blue-400">ERP</span><ArrowLeft className="h-3 w-3 text-gray-500" /><span className="text-brand-400">Storefront</span></>
                          }
                        </span>
                        <Badge variant={entry.status === 'success' ? 'success' : entry.status === 'failed' ? 'destructive' : 'warning'} className="text-xs capitalize">{entry.status}</Badge>
                        <span className="text-xs text-gray-500 capitalize">{entry.entity}</span>
                        {entry.retryCount > 0 && <span className="text-xs text-yellow-500">Retries: {entry.retryCount}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
