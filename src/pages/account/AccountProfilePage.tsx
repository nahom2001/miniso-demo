import { useState } from 'react'
import { User, Mail, Globe, DollarSign, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useToast } from '@/components/ui/toast'

export function AccountProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { setLanguage, setCurrency } = useUIStore()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [locale, setLocale] = useState<'en' | 'am'>(user?.locale ?? 'en')
  const [cur, setCur] = useState<'ETB' | 'USD'>(user?.currencyPref ?? 'ETB')
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    updateUser({ name, locale, currencyPref: cur })
    setLanguage(locale)
    setCurrency(cur)
    setSaving(false)
    toast({ title: 'Profile updated', variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">My Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-2xl font-bold text-white">
              {user?.name[0]}
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{user?.role} account</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
                <Input value={email} disabled className="bg-gray-50 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Email cannot be changed in demo</p>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Language</Label>
                <Select value={locale} onValueChange={(v) => setLocale(v as 'en' | 'am')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Currency</Label>
                <Select value={cur} onValueChange={(v) => setCur(v as 'ETB' | 'USD')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETB">ETB — Ethiopian Birr</SelectItem>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" variant="brand" loading={saving}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Order updates (email)', defaultOn: true },
            { label: 'Order updates (SMS)', defaultOn: false, tbc: true },
            { label: 'Promotions & campaigns (email)', defaultOn: true },
            { label: 'Low-stock alerts (in-app)', defaultOn: true },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-1">
              <div>
                <span className="text-sm">{pref.label}</span>
                {pref.tbc && <span className="ml-2 text-xs border border-dashed border-orange-400 text-orange-600 px-1.5 py-0.5 rounded">TBC</span>}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={pref.defaultOn} className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
