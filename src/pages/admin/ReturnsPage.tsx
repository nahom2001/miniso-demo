import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getRefunds, getReturnRequests } from '@/mock/services/orders'
import { formatPrice } from '@/config/currencies'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

export function ReturnsPage() {
  const { toast } = useToast()
  const { data: refunds = [] } = useQuery({ queryKey: ['refunds'], queryFn: getRefunds })
  const { data: returns = [] } = useQuery({ queryKey: ['returns'], queryFn: getReturnRequests })

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Returns & Refunds</h1>

        <Tabs defaultValue="refunds">
          <TabsList>
            <TabsTrigger value="refunds">
              Refunds
              <Badge variant="secondary" className="ml-2 text-xs">{refunds.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="returns">
              Return Requests
              <Badge variant="secondary" className="ml-2 text-xs">{returns.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="refunds">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Order</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Reason</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {refunds.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-brand-600">{r.orderId.replace('ord-', 'MIN-')}</td>
                        <td className="p-3 capitalize">{r.type}</td>
                        <td className="p-3 font-medium">{formatPrice(r.amount, 'ETB')}</td>
                        <td className="p-3 text-muted-foreground hidden md:table-cell line-clamp-1 max-w-[160px]">{r.reason}</td>
                        <td className="p-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                        <td className="p-3">
                          <Badge variant={
                            r.status === 'completed' ? 'success' :
                            r.status === 'approved' ? 'info' :
                            r.status === 'rejected' ? 'destructive' : 'warning'
                          } className="capitalize">{r.status}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            {r.status === 'pending' && (
                              <>
                                <Button size="xs" variant="ghost" className="text-green-600"
                                  onClick={() => toast({ title: 'Refund approved', variant: 'success' })}>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="xs" variant="ghost" className="text-destructive"
                                  onClick={() => toast({ title: 'Refund rejected' })}>
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Order</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Resolution</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {returns.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-brand-600">{r.orderId.replace('ord-', 'MIN-')}</td>
                        <td className="p-3 capitalize">{r.resolution.replace('_', ' ')}</td>
                        <td className="p-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                        <td className="p-3">
                          <Badge variant={
                            r.status === 'approved' ? 'success' :
                            r.status === 'rejected' ? 'destructive' : 'warning'
                          } className="capitalize">{r.status}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            {r.status === 'pending' && (
                              <>
                                <Button size="xs" variant="ghost" className="text-green-600"
                                  onClick={() => toast({ title: 'Return approved', variant: 'success' })}>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="xs" variant="ghost" className="text-destructive"
                                  onClick={() => toast({ title: 'Return rejected' })}>
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
