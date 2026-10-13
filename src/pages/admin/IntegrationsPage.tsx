import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Code2 } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { IntegrationStatus } from '@/domain/types'
import { useToast } from '@/components/ui/toast'
import { timeAgo } from '@/lib/utils'

const integrations: IntegrationStatus[] = [
  { id: 'erp', name: 'Client ERP System', type: 'erp', status: 'connected', lastSync: new Date(Date.now() - 60000).toISOString() },
  { id: 'telebirr', name: 'Telebirr Payment', type: 'payment', status: 'not_configured', },
  { id: 'cbe', name: 'CBE Birr', type: 'payment', status: 'not_configured' },
  { id: 'stripe', name: 'Stripe (Cards)', type: 'payment', status: 'connected', lastSync: new Date(Date.now() - 120000).toISOString() },
  { id: 'sms', name: 'Afromessage SMS', type: 'sms', status: 'not_configured' },
  { id: 'email', name: 'SendGrid Email', type: 'email', status: 'connected', lastSync: new Date(Date.now() - 300000).toISOString() },
  { id: 'delivery1', name: 'Addis Courier', type: 'delivery', status: 'connected', lastSync: new Date(Date.now() - 600000).toISOString() },
  { id: 'delivery2', name: 'Ethiopia Post', type: 'delivery', status: 'error' },
]

const apiEndpoints = [
  { method: 'GET', path: '/api/v1/products', desc: 'List products', example: '{ "data": [...], "meta": { "total": 60, "page": 1 } }' },
  { method: 'POST', path: '/api/v1/orders', desc: 'Create order', example: '{ "customerId": "...", "items": [...], "currency": "ETB" }' },
  { method: 'GET', path: '/api/v1/inventory/{variantId}', desc: 'Get stock level', example: '{ "qty": 45, "locationId": "online" }' },
  { method: 'POST', path: '/api/v1/webhooks/erp/stock', desc: 'ERP stock update webhook', example: '{ "variantId": "...", "qty": 100, "locationId": "bole" }' },
  { method: 'GET', path: '/api/v1/orders/{id}/status', desc: 'Order status', example: '{ "status": "shipped", "timeline": [...] }' },
]

export function IntegrationsPage() {
  const { toast } = useToast()
  const [testing, setTesting] = useState<string | null>(null)

  async function testConnection(id: string) {
    setTesting(id)
    await new Promise((r) => setTimeout(r, 1200))
    setTesting(null)
    toast({ title: 'Connection test successful', description: 'API responded in 145ms', variant: 'success' })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Integrations & API</h1>

        <Tabs defaultValue="integrations">
          <TabsList>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="api">API Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations">
            <div className="grid md:grid-cols-2 gap-4">
              {integrations.map((int) => (
                <Card key={int.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{int.name}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{int.type.replace('_', ' ')}</p>
                      </div>
                      <Badge
                        variant={int.status === 'connected' ? 'success' : int.status === 'error' ? 'destructive' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {int.status === 'connected' && <CheckCircle className="h-3 w-3" />}
                        {int.status === 'error' && <XCircle className="h-3 w-3" />}
                        {int.status === 'not_configured' && <AlertCircle className="h-3 w-3" />}
                        {int.status === 'connected' ? 'Connected' : int.status === 'error' ? 'Error' : 'Not configured'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {int.lastSync ? `Last sync: ${timeAgo(int.lastSync)}` : 'Never synced'}
                      </p>
                      <Button size="xs" variant="outline" loading={testing === int.id} onClick={() => testConnection(int.id)}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Test
                      </Button>
                    </div>
                    {int.status !== 'connected' && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="tbc" className="text-xs">Demo / TBC — Configure in settings</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-brand-600" />
                  <CardTitle className="text-base">REST API Reference</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Base URL: <code className="bg-gray-100 px-1 rounded text-xs">https://api.miniso.et/api/v1</code></p>
              </CardHeader>
              <CardContent className="space-y-3">
                {apiEndpoints.map((ep, i) => (
                  <div key={i} className="rounded-xl border overflow-hidden">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border-b">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${ep.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{ep.method}</span>
                      <code className="text-sm font-mono flex-1">{ep.path}</code>
                      <span className="text-xs text-muted-foreground hidden md:block">{ep.desc}</span>
                    </div>
                    <div className="p-3 bg-gray-900 text-green-400 text-xs font-mono overflow-x-auto">
                      <pre>{ep.example}</pre>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
