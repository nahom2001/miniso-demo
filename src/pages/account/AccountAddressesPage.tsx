import { useState } from 'react'
import { MapPin, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/authStore'
import * as seed from '@/mock/seed'
import type { Address } from '@/domain/types'
import { useToast } from '@/components/ui/toast'

export function AccountAddressesPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>(
    seed.addresses.filter(a => a.userId === user?.id).slice(0, 3)
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState({ label: 'Home', fullName: user?.name ?? '', phone: '', city: 'Addis Ababa', subCity: 'Bole', woreda: '3', detail: '' })

  function openNew() { setEditing(null); setForm({ label: 'Home', fullName: user?.name ?? '', phone: '', city: 'Addis Ababa', subCity: 'Bole', woreda: '3', detail: '' }); setDialogOpen(true) }
  function openEdit(a: Address) { setEditing(a); setForm({ label: a.label, fullName: a.fullName, phone: a.phone, city: a.city, subCity: a.subCity, woreda: a.woreda, detail: a.detail }); setDialogOpen(true) }

  function save() {
    if (editing) {
      setAddresses(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a))
      toast({ title: 'Address updated', variant: 'success' })
    } else {
      const newAddr: Address = { id: `addr-new-${Date.now()}`, userId: user?.id ?? '', ...form, isDefault: addresses.length === 0 }
      setAddresses(prev => [...prev, newAddr])
      toast({ title: 'Address added', variant: 'success' })
    }
    setDialogOpen(false)
  }

  function remove(id: string) { setAddresses(prev => prev.filter(a => a.id !== id)) }
  function setDefault(id: string) { setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id }))) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Addresses</h1>
        <Button size="sm" variant="brand" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-1" /> Add Address</Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground mb-3">No saved addresses</p>
            <Button size="sm" variant="brand" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-1" /> Add Address</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className={`relative ${addr.isDefault ? 'border-brand-300 bg-brand-50/30' : ''}`}>
              {addr.isDefault && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3" /> Default
                  </span>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{addr.label}</p>
                    <p className="text-sm">{addr.fullName}</p>
                    <p className="text-sm text-muted-foreground">{addr.phone}</p>
                    <p className="text-sm text-muted-foreground">{addr.detail}, Woreda {addr.woreda}, {addr.subCity}</p>
                    <p className="text-sm text-muted-foreground">{addr.city}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="xs" variant="outline" onClick={() => openEdit(addr)}><Edit2 className="h-3 w-3 mr-1" /> Edit</Button>
                  {!addr.isDefault && <Button size="xs" variant="outline" onClick={() => setDefault(addr.id)}>Set Default</Button>}
                  <Button size="xs" variant="ghost" className="text-destructive" onClick={() => remove(addr.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Address' : 'Add New Address'}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Label>Label</Label><Input className="mt-1" value={form.label} onChange={e => setForm(p => ({...p, label: e.target.value}))} /></div>
            <div><Label>Full Name</Label><Input className="mt-1" value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} /></div>
            <div><Label>Phone</Label><Input className="mt-1" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+251 9xx xxx xxx" /></div>
            <div><Label>Sub City</Label><Input className="mt-1" value={form.subCity} onChange={e => setForm(p => ({...p, subCity: e.target.value}))} /></div>
            <div><Label>Woreda</Label><Input className="mt-1" value={form.woreda} onChange={e => setForm(p => ({...p, woreda: e.target.value}))} /></div>
            <div className="sm:col-span-2"><Label>Detail</Label><Input className="mt-1" value={form.detail} onChange={e => setForm(p => ({...p, detail: e.target.value}))} placeholder="Street, building, landmark…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="brand" onClick={save}>Save Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
