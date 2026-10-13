import { useState } from 'react'
import { Shield, CheckCircle, X } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { db } from '@/mock/db'
import type { Role } from '@/domain/types'
import { formatDate } from '@/lib/utils'

type Permission = string
const ALL_PERMISSIONS: Permission[] = [
  'browse', 'view_product', 'view_cart', 'checkout',
  'view_orders', 'manage_orders', 'view_customers', 'manage_customers',
  'view_dashboard', 'manage_inventory', 'manage_marketing',
  'manage_banners', 'manage_campaigns', 'manage_coupons',
  'view_reports', 'manage_seo', 'moderate_reviews',
  'manage_refunds', 'approve_refunds', 'view_payments',
]

const PERMISSIONS_BY_ROLE: Record<Role, Permission[]> = {
  guest:     ['browse', 'view_product', 'view_cart'],
  customer:  ['browse', 'view_product', 'view_cart', 'checkout', 'view_orders'],
  staff:     ['browse', 'view_product', 'view_cart', 'view_orders', 'manage_orders', 'manage_inventory', 'view_customers', 'view_dashboard'],
  marketing: ['browse', 'view_dashboard', 'manage_marketing', 'manage_banners', 'manage_campaigns', 'manage_coupons', 'view_reports', 'manage_seo', 'moderate_reviews'],
  finance:   ['view_dashboard', 'view_orders', 'manage_refunds', 'view_reports', 'view_payments'],
  manager:   ['browse', 'view_dashboard', 'manage_orders', 'manage_inventory', 'manage_customers', 'manage_refunds', 'approve_refunds', 'view_reports', 'manage_marketing'],
  admin:     ALL_PERMISSIONS,
}

const ROLE_COLORS: Record<Role, string> = {
  guest:     'bg-gray-100 text-gray-700',
  customer:  'bg-blue-100 text-blue-700',
  staff:     'bg-green-100 text-green-700',
  marketing: 'bg-purple-100 text-purple-700',
  finance:   'bg-yellow-100 text-yellow-700',
  manager:   'bg-orange-100 text-orange-700',
  admin:     'bg-red-100 text-red-700',
}

export function UsersRolesPage() {
  const staff = db.users.filter(u => u.role !== 'customer' && u.role !== 'guest')

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold">Users & Roles</h1>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Staff Users ({staff.length})</TabsTrigger>
            <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Language</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Since</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {staff.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <Badge variant="outline" className="text-xs uppercase">{u.locale}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground hidden lg:table-cell">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader><CardTitle className="text-sm">Role × Permission Matrix</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground w-44">Permission</th>
                        {(['guest', 'customer', 'staff', 'marketing', 'finance', 'manager', 'admin'] as Role[]).map(r => (
                          <th key={r} className="p-3 font-medium capitalize text-center">
                            <span className={`px-2 py-1 rounded-full ${ROLE_COLORS[r]}`}>{r}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {ALL_PERMISSIONS.map(perm => (
                        <tr key={perm} className="hover:bg-gray-50">
                          <td className="p-3 font-mono text-gray-700">{perm}</td>
                          {(['guest', 'customer', 'staff', 'marketing', 'finance', 'manager', 'admin'] as Role[]).map(r => {
                            const has = PERMISSIONS_BY_ROLE[r].includes(perm) || r === 'admin'
                            return (
                              <td key={r} className="p-3 text-center">
                                {has
                                  ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                  : <X className="h-3.5 w-3.5 text-gray-300 mx-auto" />
                                }
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
