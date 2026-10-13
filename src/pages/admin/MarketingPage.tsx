import { useState } from 'react'
import { Tag, Image, Mail, Search, Star, BarChart3, Plus } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import * as seed from '@/mock/seed'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

export function MarketingPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState(seed.reviews)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Marketing</h1>
        </div>

        <Tabs defaultValue="coupons">
          <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
            <TabsTrigger value="coupons" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><Tag className="h-3.5 w-3.5 mr-1" /> Coupons</TabsTrigger>
            <TabsTrigger value="banners" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><Image className="h-3.5 w-3.5 mr-1" /> Banners</TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><Mail className="h-3.5 w-3.5 mr-1" /> Campaigns</TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><Search className="h-3.5 w-3.5 mr-1" /> SEO</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><Star className="h-3.5 w-3.5 mr-1" /> Reviews</TabsTrigger>
          </TabsList>

          {/* Coupons */}
          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Coupons</CardTitle>
                  <Button size="sm" variant="brand"><Plus className="h-3.5 w-3.5 mr-1" /> Create Coupon</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Code</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Value</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Min Basket</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Usage</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Expires</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {seed.coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-brand-600">{c.code}</td>
                        <td className="p-3 capitalize">{c.type}</td>
                        <td className="p-3 font-medium">{c.type === 'percentage' ? `${c.value}%` : `Br ${c.value}`}</td>
                        <td className="p-3 text-muted-foreground hidden md:table-cell">Br {c.minBasket}</td>
                        <td className="p-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-200 w-16">
                              <div className="h-full rounded-full bg-brand-500" style={{ width: `${(c.used / c.usageLimit) * 100}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{c.used}/{c.usageLimit}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground hidden md:table-cell">{formatDate(c.expiresAt)}</td>
                        <td className="p-3"><Badge variant={c.active ? 'success' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banners */}
          <TabsContent value="banners">
            <div className="grid md:grid-cols-2 gap-4">
              {seed.banners.map((b) => (
                <Card key={b.id} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-4">
                      <div className="text-white">
                        <p className="font-bold">{b.title}</p>
                        <p className="text-sm text-white/80">{b.subtitle}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={b.active ? 'success' : 'secondary'}>{b.active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Order: {b.order} · {formatDate(b.startDate)} – {formatDate(b.endDate)}</p>
                    <Button size="xs" variant="outline">Edit</Button>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed flex items-center justify-center h-48 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="text-center text-muted-foreground">
                  <Plus className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Add Banner</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns */}
          <TabsContent value="campaigns">
            <div className="space-y-4">
              <Button size="sm" variant="brand"><Plus className="h-3.5 w-3.5 mr-1" /> New Campaign</Button>
              {seed.campaigns.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{c.name}</p>
                          <Badge variant={c.channel === 'email' ? 'info' : 'default'} className="capitalize">{c.channel}</Badge>
                          <Badge variant={c.status === 'sent' ? 'success' : 'secondary'} className="capitalize">{c.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Segment: <span className="capitalize">{c.segment.replace('_', ' ')}</span></p>
                        {c.sentAt && <p className="text-xs text-muted-foreground">Sent: {formatDate(c.sentAt)}</p>}
                      </div>
                      <Button size="xs" variant="outline">{c.status === 'draft' ? 'Send' : 'Duplicate'}</Button>
                    </div>
                    {c.status === 'sent' && (
                      <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3">
                        <div className="text-center">
                          <p className="text-lg font-bold">{c.stats.sent.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Sent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{Math.round(c.stats.opened / c.stats.sent * 100)}%</p>
                          <p className="text-xs text-muted-foreground">Open rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{Math.round(c.stats.clicked / c.stats.sent * 100)}%</p>
                          <p className="text-xs text-muted-foreground">Click rate</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo">
            <Card>
              <CardHeader><CardTitle className="text-sm">SEO Overview</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Edit meta titles, descriptions and slugs per product and category.</p>
                <div className="space-y-3">
                  {seed.products.slice(0, 5).map((p) => (
                    <div key={p.id} className="p-3 border rounded-lg hover:border-brand-300 transition-colors">
                      <div className="text-blue-600 text-sm font-medium mb-0.5 truncate">miniso.et › {p.seo.slug}</div>
                      <div className="text-base font-medium text-gray-900 mb-0.5 truncate">{p.seo.metaTitle}</div>
                      <div className="text-sm text-muted-foreground truncate">{p.seo.metaDescription || p.description.en.slice(0, 120)}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`h-1.5 w-6 rounded-full ${i < 3 ? 'bg-green-500' : 'bg-gray-200'}`} />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">SEO Score: 60/100</span>
                        </div>
                        <Button size="xs" variant="outline">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Product</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Rating</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Review</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reviews.map((r) => {
                      const prod = seed.products.find((p) => p.id === r.productId)
                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium">{r.userName}</td>
                          <td className="p-3 text-muted-foreground hidden md:table-cell line-clamp-1">{prod?.name.en}</td>
                          <td className="p-3">{'⭐'.repeat(r.rating)}</td>
                          <td className="p-3 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{r.text}</td>
                          <td className="p-3"><Badge variant={r.status === 'approved' ? 'success' : r.status === 'pending' ? 'warning' : 'destructive'} className="capitalize">{r.status}</Badge></td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              {r.status === 'pending' && (
                                <>
                                  <Button size="xs" variant="ghost" className="text-green-600" onClick={() => { setReviews(reviews.map((rv) => rv.id === r.id ? { ...rv, status: 'approved' } : rv)); toast({ title: 'Review approved', variant: 'success' }) }}>Approve</Button>
                                  <Button size="xs" variant="ghost" className="text-destructive" onClick={() => { setReviews(reviews.map((rv) => rv.id === r.id ? { ...rv, status: 'rejected' } : rv)); toast({ title: 'Review rejected' }) }}>Reject</Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
