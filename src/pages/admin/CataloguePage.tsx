import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import { Plus, Search, Edit, Eye, Download, ImagePlus, Trash2, GripVertical, Star, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { getProducts, getCategories } from '@/mock/services/products'
import { formatPrice } from '@/config/currencies'
import { db } from '@/mock/db'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import type { Product } from '@/domain/types'

// ── Image editor sub-component ───────────────────────────────────────────────
function ImageEditor({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const [urlInput, setUrlInput] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [dragItem, setDragItem] = useState<number | null>(null)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File reading helpers ──────────────────────────────────────────────────
  function readFilesAsDataURLs(files: FileList | File[]): Promise<string[]> {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    return Promise.all(
      list.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
      )
    )
  }

  async function handleFiles(files: FileList | File[]) {
    if (!files || files.length === 0) return
    setUploading(true)
    const dataUrls = await readFilesAsDataURLs(files)
    onChange([...images, ...dataUrls])
    setUploading(false)
  }

  // ── Drop zone handlers ────────────────────────────────────────────────────
  function onDropZoneDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDropZoneActive(true)
  }
  function onDropZoneDragLeave() { setDropZoneActive(false) }
  async function onDropZoneDrop(e: React.DragEvent) {
    e.preventDefault()
    setDropZoneActive(false)
    await handleFiles(e.dataTransfer.files)
  }

  // ── URL helpers ───────────────────────────────────────────────────────────
  function addUrl() {
    const url = urlInput.trim()
    if (!url) return
    if (images.includes(url)) { setPreviewError(true); return }
    onChange([...images, url])
    setUrlInput('')
    setPreview(null)
    setPreviewError(false)
  }

  // ── List reorder helpers ──────────────────────────────────────────────────
  function remove(idx: number) { onChange(images.filter((_, i) => i !== idx)) }

  function moveUp(idx: number) {
    if (idx === 0) return
    const next = [...images];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    onChange(next)
  }

  function moveDown(idx: number) {
    if (idx === images.length - 1) return
    const next = [...images];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    onChange(next)
  }

  function setPrimary(idx: number) {
    if (idx === 0) return
    const next = [...images]
    const [item] = next.splice(idx, 1)
    next.unshift(item)
    onChange(next)
  }

  function onRowDragStart(idx: number) { setDragItem(idx) }
  function onRowDragEnter(idx: number) { setDragOver(idx) }
  function onRowDragEnd() {
    if (dragItem === null || dragOver === null || dragItem === dragOver) {
      setDragItem(null); setDragOver(null); return
    }
    const next = [...images]
    const [item] = next.splice(dragItem, 1)
    next.splice(dragOver, 0, item)
    onChange(next)
    setDragItem(null); setDragOver(null)
  }

  return (
    <div className="space-y-4">

      {/* ── Upload drop zone ─────────────────────────────────────────────── */}
      <div
        onDragOver={onDropZoneDragOver}
        onDragLeave={onDropZoneDragLeave}
        onDrop={onDropZoneDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none',
          dropZoneActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-brand-600">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium">Processing images…</span>
          </div>
        ) : (
          <>
            <ImagePlus className={cn('h-8 w-8 mx-auto mb-2', dropZoneActive ? 'text-brand-500' : 'text-gray-400')} />
            <p className="text-sm font-medium text-gray-700">
              {dropZoneActive ? 'Drop to upload' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — multiple files supported</p>
          </>
        )}
      </div>

      {/* ── Existing image list ───────────────────────────────────────────── */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {images.length} image{images.length !== 1 ? 's' : ''} — drag to reorder
          </p>
          {images.map((img, idx) => (
            <div
              key={`${img}-${idx}`}
              draggable
              onDragStart={() => onRowDragStart(idx)}
              onDragEnter={() => onRowDragEnter(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={onRowDragEnd}
              className={cn(
                'flex items-center gap-3 p-2 rounded-xl border bg-white transition-all cursor-grab active:cursor-grabbing',
                dragOver === idx && dragItem !== idx ? 'border-brand-500 bg-brand-50' : 'border-gray-200',
                dragItem === idx ? 'opacity-40' : ''
              )}
            >
              <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
              <img
                src={img}
                alt=""
                className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/200/200' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {img.startsWith('data:') ? `[uploaded file] ${(img.length / 1024).toFixed(0)} KB` : img}
                </p>
                {idx === 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-yellow-600 font-medium">Primary image</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {idx !== 0 && (
                  <Button size="xs" variant="ghost" onClick={() => setPrimary(idx)} title="Set as primary"
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button size="xs" variant="ghost" onClick={() => moveUp(idx)} disabled={idx === 0} title="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button size="xs" variant="ghost" onClick={() => moveDown(idx)} disabled={idx === images.length - 1} title="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                {!img.startsWith('data:') && (
                  <a href={img} target="_blank" rel="noopener noreferrer">
                    <Button size="xs" variant="ghost" title="Open in new tab">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                <Button size="xs" variant="ghost" onClick={() => remove(idx)}
                  className="text-destructive hover:text-destructive hover:bg-red-50" title="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add by URL ───────────────────────────────────────────────────── */}
      <div className="space-y-2 pt-1 border-t">
        <Label className="text-xs text-muted-foreground">Or add by URL</Label>
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setPreview(e.target.value.trim() || null); setPreviewError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && addUrl()}
            placeholder="https://example.com/image.jpg"
            className="text-sm h-9"
          />
          <Button variant="brand" size="sm" onClick={addUrl} disabled={!urlInput.trim()}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
        {preview && (
          <div className="flex items-center gap-3 p-2 border rounded-xl bg-gray-50">
            <img src={preview} alt="preview"
              className="w-12 h-12 rounded-lg object-cover bg-gray-200 flex-shrink-0"
              onError={() => setPreviewError(true)} />
            {previewError
              ? <p className="text-xs text-destructive">Could not load image — check the URL</p>
              : <p className="text-xs text-muted-foreground">Preview — press Add to save</p>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function CataloguePage() {
  const [search, setSearch] = useState('')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editImages, setEditImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [generatingCount, setGeneratingCount] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => getProducts() })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.en.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  )

  function openEdit(product: Product) {
    setEditProduct(product)
    setEditImages([...product.images])
  }

  function closeEdit() {
    setEditProduct(null)
    setEditImages([])
  }

  async function saveImages() {
    if (!editProduct) return
    if (editImages.length === 0) {
      toast({ title: 'Add at least one image', variant: 'destructive' })
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500)) // simulate latency

    const idx = db.products.findIndex((p) => p.id === editProduct.id)
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], images: editImages }
      db.save()
    }

    await queryClient.invalidateQueries({ queryKey: ['products'] })
    setSaving(false)
    toast({ title: 'Images updated', description: `${editImages.length} image${editImages.length !== 1 ? 's' : ''} saved for "${editProduct.name.en}"`, variant: 'success' })
    closeEdit()
  }

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
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or SKU…"
                  className="pl-9 h-9"
                />
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
                        <th className="text-center p-3 font-medium text-muted-foreground hidden sm:table-cell">Images</th>
                        <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Category</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Price (ETB)</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.slice(0, 50).map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {/* Image stack preview */}
                              <div className="relative w-9 h-9 flex-shrink-0">
                                {p.images[1] && (
                                  <img
                                    src={p.images[1]}
                                    alt=""
                                    className="absolute top-1 left-1 w-8 h-8 rounded-md object-cover bg-gray-100 opacity-60"
                                  />
                                )}
                                <img
                                  src={p.images[0]}
                                  alt=""
                                  className="absolute top-0 left-0 w-8 h-8 rounded-md object-cover bg-gray-100 border border-white"
                                />
                              </div>
                              <div>
                                <p className="font-medium line-clamp-1">{p.name.en}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{p.name.am}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground font-mono text-xs hidden md:table-cell">{p.sku}</td>
                          <td className="p-3 text-center hidden sm:table-cell">
                            <button
                              onClick={() => openEdit(p)}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-600 transition-colors group"
                            >
                              <ImagePlus className="h-3.5 w-3.5 group-hover:text-brand-600" />
                              {p.images.length}
                            </button>
                          </td>
                          <td className="p-3 hidden lg:table-cell">
                            <Badge variant="secondary" className="text-xs">
                              {p.categoryIds[0]?.replace('cat-', 'Cat ') ?? '—'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center font-medium">{formatPrice(p.prices.ETB, 'ETB')}</td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'secondary'}
                              className="text-xs capitalize"
                            >
                              {p.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/product/${p.seo.slug}`} target="_blank">
                                <Button size="sm" variant="ghost" title="Preview on storefront">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEdit(p)}
                                title="Edit images"
                                className="gap-1.5"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="hidden sm:inline">Images</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length > 50 && (
                    <div className="p-3 text-center text-sm text-muted-foreground border-t">
                      Showing 50 of {filtered.length} products
                    </div>
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

      {/* ── Image edit dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!editProduct} onOpenChange={(open) => { if (!open) closeEdit() }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-brand-600" />
              Edit Images
            </DialogTitle>
            {editProduct && (
              <p className="text-sm text-muted-foreground pt-0.5">
                {editProduct.name.en} · <span className="font-mono">{editProduct.sku}</span>
              </p>
            )}
          </DialogHeader>

          {/* Scrollable image editor */}
          <div className="flex-1 overflow-y-auto pr-1 -mr-1">
            <ImageEditor images={editImages} onChange={setEditImages} />
          </div>

          <DialogFooter className="pt-4 border-t mt-2">
            <p className="text-xs text-muted-foreground mr-auto">
              {editImages.length} image{editImages.length !== 1 ? 's' : ''} · First image is the primary
            </p>
            <Button variant="outline" onClick={closeEdit}>Cancel</Button>
            <Button variant="brand" loading={saving} onClick={saveImages}>
              Save Images
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
