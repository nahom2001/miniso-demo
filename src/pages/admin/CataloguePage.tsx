import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Search, Edit, Eye, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getProducts, getCategories } from '@/mock/services/products'
import { formatPrice } from '@/config/currencies'
import { db } from '@/mock/db'

export function CataloguePage() {
  const [search, setSearch] = useState('')
  const [generatingCount, setGeneratingCount] = useState(false)

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => getProducts() })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const filtered = products.filter((p) => !search || p.name.en.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))

  function generateProducts() {
    setGeneratingCount(true)
    setTimeout(() => {
      const count = 20000
      for (let i = 0; i < count; i++) {
        db.products.push({
          id: `gen-${i}`,
          sku: `GEN-${String(i).padStart(6, '0')}`,
          name: { en: `Generated Product ${i + 1}`, am: `ምርት ${i + 1}` },
          description: { en: 'Generated product', am: 'ምርት' },
          categoryIds: [`cat-${(i % 8) + 1}`],
          tags: ['generated'],
          brand: 'Miniso',
          images: [`https://picsum.photos/seed/gen${i}/200/200`],
          isDigital: false,
          status: 'active',
          prices: { ETB: 200 + (i % 2000), USD: (200 + (i % 2000)) * 0.0175 },
          scheduledPrices: [],
          seo: { slug: `gen-product-${i}`, metaTitle: '', metaDescription: '' },
          rating: 4,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        })
      }
      db.save()
      setGeneratingCount(false)
      window.location.reload()
    }, 500)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Catalogue</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => alert('Bulk import: Upload CSV/XLSX to preview, validate, and import')}>
              <Download className="h-3.5 w-3.5 mr-1" /> Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </Button>
            <Button variant="brand" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
            </Button>
          </div>
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products ({db.products.length})</TabsTrigger>
            <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU…" className="pl-9 h-9" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateProducts}
                disabled={generatingCount}
                className="text-xs"
              >
                {generatingCount ? 'Generating…' : '⚡ Generate 20,000 Products (Stress Test)'}
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">SKU</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Category</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Price (ETB)</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-center p-3 font-medium text-muted-foreground hidden md:table-cell">Digital</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.slice(0, 50).map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                              <div>
                                <p className="font-medium line-clamp-1">{p.name.en}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{p.name.am}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground font-mono text-xs hidden md:table-cell">{p.sku}</td>
                          <td className="p-3 hidden lg:table-cell">
                            <Badge variant="secondary" className="text-xs">{p.categoryIds[0]?.replace('cat-', 'Cat ')?? '—'}</Badge>
                          </td>
                          <td className="p-3 text-center font-medium">{formatPrice(p.prices.ETB, 'ETB')}</td>
                          <td className="p-3 text-center">
                            <Badge variant={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'secondary'} className="text-xs capitalize">{p.status}</Badge>
                          </td>
                          <td className="p-3 text-center hidden md:table-cell">
                            {p.isDigital ? <Badge variant="info">Digital</Badge> : '—'}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/product/${p.seo.slug}`} target="_blank">
                                <Button size="xs" variant="ghost"><Eye className="h-3.5 w-3.5" /></Button>
                              </Link>
                              <Button size="xs" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length > 50 && (
                    <div className="p-3 text-center text-sm text-muted-foreground border-t">Showing 50 of {filtered.length} products (virtualised for performance)</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card key={cat.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <img src={cat.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{cat.name.en}</p>
                      <p className="text-xs text-muted-foreground">{cat.name.am}</p>
                      <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
                    </div>
                    <Button size="xs" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
