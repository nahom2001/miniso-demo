import { useState } from 'react'
import { Settings, Palette, Truck, CreditCard, Bell, Globe, HeadphonesIcon } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { brand } from '@/config/brand.config'
import * as seed from '@/mock/seed'
import { useToast } from '@/components/ui/toast'

export function SettingsPage() {
  const { toast } = useToast()
  const [storeName, setStoreName] = useState<string>(brand.name)
  const [storeEmail, setStoreEmail] = useState<string>(brand.email)
  const [storePhone, setStorePhone] = useState<string>(brand.phone)

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="branding">
          <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
            <TabsTrigger value="branding" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><Palette className="h-3.5 w-3.5 mr-1" /> Branding</TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><Truck className="h-3.5 w-3.5 mr-1" /> Delivery</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><CreditCard className="h-3.5 w-3.5 mr-1" /> Payments</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><Bell className="h-3.5 w-3.5 mr-1" /> Notifications</TabsTrigger>
            <TabsTrigger value="localization" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><Globe className="h-3.5 w-3.5 mr-1" /> Localization</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white"><HeadphonesIcon className="h-3.5 w-3.5 mr-1" /> Support</TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card>
              <CardHeader><CardTitle className="text-sm">Store Identity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Store Name</Label><Input className="mt-1" value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
                  <div><Label>Email</Label><Input className="mt-1" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} /></div>
                  <div><Label>Phone</Label><Input className="mt-1" value={storePhone} onChange={e => setStorePhone(e.target.value)} /></div>
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" defaultValue={brand.primaryColor} className="w-10 h-10 rounded cursor-pointer border p-1" />
                      <Input defaultValue={brand.primaryColor} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Logo</Label>
                  <div className="mt-1 border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground hover:border-brand-300 transition-colors cursor-pointer">
                    <p className="text-sm">Click to upload logo (SVG, PNG, JPG)</p>
                    <p className="text-xs mt-1">Current: {brand.logo}</p>
                  </div>
                </div>
                <Button variant="brand" onClick={() => toast({ title: 'Settings saved', variant: 'success' })}>Save Branding</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Delivery Zones</CardTitle>
                  <Button size="sm" variant="brand">Add Zone</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50"><tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">Zone</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Rate (ETB)</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">ETA (days)</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {seed.deliveryZones.map(z => (
                      <tr key={z.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{z.name}</td>
                        <td className="p-3 text-center">{z.rate}</td>
                        <td className="p-3 text-center">{z.etaDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle className="text-sm">Payment Methods</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Credit / Debit Card', enabled: true },
                  { name: 'Telebirr', enabled: false, tbc: true },
                  { name: 'CBE Birr', enabled: false, tbc: true },
                  { name: 'Bank Transfer', enabled: true },
                  { name: 'Cash on Delivery', enabled: true },
                ].map(pm => (
                  <div key={pm.name} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{pm.name}</span>
                      {pm.tbc && <Badge variant="tbc">TBC</Badge>}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={pm.enabled} className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle className="text-sm">Notification Channels</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'In-app notifications', enabled: true },
                  { name: 'Email (SendGrid)', enabled: true },
                  { name: 'SMS (Afromessage)', enabled: false, tbc: true },
                ].map(ch => (
                  <div key={ch.name} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{ch.name}</span>
                      {ch.tbc && <Badge variant="tbc">TBC</Badge>}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={ch.enabled} className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localization">
            <Card>
              <CardHeader><CardTitle className="text-sm">Languages & Currencies</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Active Languages</p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-green-50 border-green-200">
                      <span className="font-medium text-sm">English</span>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-green-50 border-green-200">
                      <span className="font-medium text-sm">አማርኛ</span>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 border-dashed text-muted-foreground">
                      <span className="text-sm">+ Add Language</span>
                      <Badge variant="tbc">TBC</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Active Currencies</p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-green-50 border-green-200">
                      <span className="font-medium text-sm">ETB (Birr)</span>
                    </div>
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-green-50 border-green-200">
                      <span className="font-medium text-sm">USD</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>VAT Rate</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input defaultValue="15" type="number" className="w-24" />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <Button variant="brand" onClick={() => toast({ title: 'Localization saved', variant: 'success' })}>Save</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="support">
            <div className="space-y-4">
              {/* Free support period */}
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-green-800">Free Support Period</CardTitle>
                    <Badge variant="success">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-green-700 space-y-1">
                  <p><strong>Duration:</strong> 30 days post-training completion</p>
                  <p><strong>Includes:</strong> Bug fixes, minor issue resolution, system setup assistance</p>
                  <p><strong>Cost:</strong> Free</p>
                </CardContent>
              </Card>

              {/* Support packages */}
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ongoing Support Packages</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Basic */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Basic Support</CardTitle>
                      <Badge variant="secondary">Monthly</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-2xl font-bold text-brand-600">
                      Br 10,000 <span className="text-sm font-normal text-muted-foreground">/ month</span>
                    </p>
                    <ul className="text-sm space-y-1.5 text-muted-foreground">
                      {[
                        'Customer support via email & chat',
                        'Guidance on platform usage',
                        'Minor issue resolution',
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => toast({ title: 'Request sent to ConDigital', variant: 'success' })}>
                      Select Basic
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium */}
                <Card className="border-brand-300 ring-1 ring-brand-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Premium Support</CardTitle>
                      <Badge variant="info">Recommended</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-2xl font-bold text-brand-600">
                      Br 20,000 <span className="text-sm font-normal text-muted-foreground">/ month</span>
                    </p>
                    <ul className="text-sm space-y-1.5 text-muted-foreground">
                      {[
                        'All Basic features',
                        'Major bug fixes',
                        'Quarterly system review',
                        'Reporting & optimization',
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="text-brand-600 mt-0.5 flex-shrink-0">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Button variant="brand" size="sm" className="w-full" onClick={() => toast({ title: 'Request sent to ConDigital', variant: 'success' })}>
                      Select Premium
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Training */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Training Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">On-site / Remote Training</p>
                      <p className="text-muted-foreground text-xs">Role-based training with physical &amp; digital materials provided</p>
                    </div>
                    <p className="font-bold text-brand-600 flex-shrink-0 ml-4">Br 100 / hr</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Schedule coordinated between ConDigital project manager and client-side project manager.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: 'Training request submitted', variant: 'success' })}>
                    Request Training Session
                  </Button>
                </CardContent>
              </Card>

              {/* Developer contact */}
              <Card className="bg-gray-900 text-white border-0">
                <CardContent className="pt-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-sm">ConDigital Technologies PLC</p>
                    <p className="text-gray-400 text-xs mt-0.5">TIN: 0074798943 · Addis Ababa, Ethiopia</p>
                  </div>
                  <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 flex-shrink-0"
                    onClick={() => toast({ title: 'Contact ConDigital', description: 'Redirecting to support portal…', variant: 'default' })}>
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </AdminLayout>
  )
}
