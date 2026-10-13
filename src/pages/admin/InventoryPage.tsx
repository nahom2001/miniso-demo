import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AlertTriangle, Plus, Minus } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getStockItems, adjustStock, getLowStockItems } from '@/mock/services/inventory'
import { formatDate } from '@/lib/utils'
import { db } from '@/mock/db'
import type { AdjustmentReason } from '@/domain/types'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'

const REASON_OPTIONS: AdjustmentReason[] = ['damage', 'recount', 'return', 'transfer', 'initial', 'other']
const LOCATIONS = ['online', 'bole', 'piassa', 'megenagna'] as const

export function InventoryPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [adjustDialog, setAdjustDialog] = useState<{ variantId: string; locationId: string } | null>(null)
  const [delta, setDelta] = useState(0)
  const [reason, setReason] = useState<AdjustmentReason>('recount')
  const [note, setNote] = useState('')

  const { data: lowStock } = useQuery({ queryKey: ['low-stock'], queryFn: getLowStockItems })
  const { data: stockItems } = useQuery({ queryKey: ['stock-items'], queryFn: () => getStockItems() })

  const mutation = useMutation({
    mutationFn: () => adjustStock(adjustDialog!.variantId, adjustDialog!.locationId as typeof LOCATIONS[number], delta, reason, user?.id ?? '', note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-items'] })
      qc.invalidateQueries({ queryKey: ['low-stock'] })
      toast({ title: 'Stock adjusted', variant: 'success' })
      setAdjustDialog(null)
    },
  })

  // Group stock items by product
  const byProduct: Record<string, typeof stockItems> = {}
  stockItems?.forEach((s) => {
    const prodId = s.variantId.replace('default-', '')
    if (!byProduct[prodId]) byProduct[prodId] = []
    byProduct[prodId]!.push(s)
  })

  const productList = Object.entries(byProduct).slice(0, 30).map(([prodId, items]) => {
    const prod = db.products.find((p) => p.id === prodId)
    const totalQty = items!.reduce((s, i) => s + i.qty, 0)
    const isLow = items!.some((i) => i.qty <= i.lowThreshold)
    return { prodId, prod, items, totalQty, isLow }
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventory</h1>
        </div>

        {/* Low stock alert */}
        {lowStock && lowStock.length > 0 && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">{lowStock.length} items running low</p>
              <p className="text-sm text-yellow-700 mt-1">{lowStock.slice(0, 3).map((i) => i.productName).join(', ')}{lowStock.length > 3 ? ` and ${lowStock.length - 3} more` : ''}</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="stock">
          <TabsList>
            <TabsTrigger value="stock">Stock Levels</TabsTrigger>
            <TabsTrigger value="low">Low Stock ({lowStock?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="locations">By Location</TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                        {LOCATIONS.map((l) => <th key={l} className="text-center p-3 font-medium text-muted-foreground capitalize hidden md:table-cell">{l}</th>)}
                        <th className="text-center p-3 font-medium text-muted-foreground">Total</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {productList.map(({ prodId, prod, items, totalQty, isLow }) => (
                        <tr key={prodId} className="hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img src={prod?.images[0]} alt="" className="w-8 h-8 rounded object-cover bg-gray-100" />
                              <span className="font-medium text-xs line-clamp-2 max-w-[140px]">{prod?.name.en}</span>
                            </div>
                          </td>
                          {LOCATIONS.map((loc) => {
                            const item = items!.find((i) => i.locationId === loc)
                            return (
                              <td key={loc} className="p-3 text-center hidden md:table-cell">
                                <span className={item && item.qty <= item.lowThreshold ? 'text-yellow-600 font-bold' : ''}>{item?.qty ?? 0}</span>
                              </td>
                            )
                          })}
                          <td className="p-3 text-center font-bold">{totalQty}</td>
                          <td className="p-3 text-center">
                            {isLow ? <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />Low</Badge> : <Badge variant="success">OK</Badge>}
                          </td>
                          <td className="p-3 text-right">
                            <Button size="xs" variant="outline" onClick={() => { setAdjustDialog({ variantId: `default-${prodId}`, locationId: 'online' }); setDelta(0) }}>
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Location</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Qty</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Threshold</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(lowStock ?? []).map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-3 font-medium">{item.productName}</td>
                          <td className="p-3 text-center capitalize">{item.locationId}</td>
                          <td className="p-3 text-center font-bold text-yellow-600">{item.qty}</td>
                          <td className="p-3 text-center text-muted-foreground">{item.lowThreshold}</td>
                          <td className="p-3 text-right">
                            <Button size="xs" variant="outline" onClick={() => { setAdjustDialog({ variantId: item.variantId, locationId: item.locationId }); setDelta(0) }}>
                              Restock
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {LOCATIONS.map((loc) => {
                const items = stockItems?.filter((s) => s.locationId === loc) ?? []
                const total = items.reduce((s, i) => s + i.qty, 0)
                const low = items.filter((i) => i.qty <= i.lowThreshold).length
                return (
                  <Card key={loc}>
                    <CardHeader>
                      <CardTitle className="capitalize text-base">{loc}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total units</p>
                      {low > 0 && <p className="text-xs text-yellow-600 mt-2 font-medium">{low} items low</p>}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Adjust dialog */}
      <Dialog open={!!adjustDialog} onOpenChange={() => setAdjustDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Adjustment (+ or −)</label>
              <div className="flex items-center gap-3 mt-1">
                <Button variant="outline" size="sm" onClick={() => setDelta(delta - 1)}><Minus className="h-3.5 w-3.5" /></Button>
                <Input type="number" value={delta} onChange={(e) => setDelta(+e.target.value)} className="text-center w-24" />
                <Button variant="outline" size="sm" onClick={() => setDelta(delta + 1)}><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Select value={reason} onValueChange={(v) => setReason(v as AdjustmentReason)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Note (optional)</label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1" placeholder="Additional context…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(null)}>Cancel</Button>
            <Button variant="brand" loading={mutation.isPending} onClick={() => mutation.mutate()}>Save Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
