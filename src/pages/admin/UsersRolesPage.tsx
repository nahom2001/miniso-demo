import { useState } from 'react'
import { Shield, Users, Check, Minus } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { db } from '@/mock/db'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { Role } from '@/domain/types'

// ─── Permission definitions ───────────────────────────────────────────────────

const MODULES = [
  {
    label: 'Storefront',
    permissions: [
      { id: 'browse',       label: 'Browse & Search' },
      { id: 'view_product', label: 'View Products' },
      { id: 'checkout',     label: 'Checkout' },
    ],
  },
  {
    label: 'Orders',
    permissions: [
      { id: 'view_orders',   label: 'View Orders' },
      { id: 'manage_orders', label: 'Manage Orders' },
      { id: 'manage_refunds', label: 'Process Refunds' },
      { id: 'approve_refunds', label: 'Approve Refunds' },
    ],
  },
  {
    label: 'Catalogue & Inventory',
    permissions: [
      { id: 'manage_inventory', label: 'Manage Inventory' },
      { id: 'manage_catalogue', label: 'Edit Catalogue' },
    ],
  },
  {
    label: 'Customers',
    permissions: [
      { id: 'view_customers',   label: 'View Customers' },
      { id: 'manage_customers', label: 'Manage Customers' },
    ],
  },
  {
    label: 'Marketing',
    permissions: [
      { id: 'manage_banners',   label: 'Banners' },
      { id: 'manage_campaigns', label: 'Campaigns' },
      { id: 'manage_coupons',   label: 'Coupons' },
      { id: 'moderate_reviews', label: 'Reviews' },
      { id: 'manage_seo',       label: 'SEO' },
    ],
  },
  {
    label: 'Reports & Finance',
    permissions: [
      { id: 'view_dashboard', label: 'Dashboard' },
      { id: 'view_reports',   label: 'Reports' },
      { id: 'view_payments',  label: 'Payments' },
    ],
  },
]

const ALL_PERMISSIONS = MODULES.flatMap((m) => m.permissions.map((p) => p.id))

const ROLES: Role[] = ['guest', 'customer', 'staff', 'marketing', 'finance', 'manager', 'admin']

const DEFAULT_MATRIX: Record<Role, string[]> = {
  guest:     ['browse', 'view_product'],
  customer:  ['browse', 'view_product', 'checkout', 'view_orders'],
  staff:     ['browse', 'view_product', 'view_orders', 'manage_orders', 'manage_inventory', 'view_customers', 'view_dashboard'],
  marketing: ['browse', 'view_dashboard', 'manage_banners', 'manage_campaigns', 'manage_coupons', 'view_reports', 'manage_seo', 'moderate_reviews'],
  finance:   ['view_dashboard', 'view_orders', 'manage_refunds', 'view_reports', 'view_payments'],
  manager:   ['browse', 'view_dashboard', 'manage_orders', 'manage_inventory', 'manage_catalogue', 'manage_customers', 'manage_refunds', 'approve_refunds', 'view_reports', 'manage_banners', 'manage_campaigns', 'manage_coupons'],
  admin:     ALL_PERMISSIONS,
}

const ROLE_STYLES: Record<Role, { badge: string; dot: string }> = {
  guest:     { badge: 'bg-gray-100 text-gray-600 border-gray-200',     dot: 'bg-gray-400' },
  customer:  { badge: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
  staff:     { badge: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500' },
  marketing: { badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  finance:   { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  manager:   { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  admin:     { badge: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-500' },
}

// ─── Checkbox cell ────────────────────────────────────────────────────────────
function PermCell({
  checked, onChange, disabled,
}: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <td className="text-center p-0">
      <button
        type="button"
        disabled={disabled}
        onClick={onChange}
        className={cn(
          'mx-auto flex h-5 w-5 items-center justify-center rounded border transition-all',
          checked
            ? 'bg-brand-600 border-brand-600 text-white'
            : 'border-gray-300 bg-white hover:border-brand-400',
          disabled && 'opacity-40 cursor-not-allowed'
        )}
        aria-label={checked ? 'Revoke' : 'Grant'}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>
    </td>
  )
}

// ─── Row-select button ────────────────────────────────────────────────────────
function RowToggle({
  permId, matrix, onChange,
}: { permId: string; matrix: Record<Role, string[]>; onChange: (next: Record<Role, string[]>) => void }) {
  const nonAdmin = ROLES.filter((r) => r !== 'admin')
  const allOn = nonAdmin.every((r) => matrix[r].includes(permId))

  function toggleAll() {
    const next = { ...matrix }
    if (allOn) {
      nonAdmin.forEach((r) => { next[r] = next[r].filter((p) => p !== permId) })
    } else {
      nonAdmin.forEach((r) => {
        if (!next[r].includes(permId)) next[r] = [...next[r], permId]
      })
    }
    onChange(next)
  }

  return (
    <button
      type="button"
      onClick={toggleAll}
      className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded border border-gray-300 bg-gray-50 hover:border-brand-400 transition-colors"
      title={allOn ? 'Revoke all' : 'Grant all'}
    >
      {allOn
        ? <Minus className="h-2.5 w-2.5 text-gray-500" />
        : <Check className="h-2.5 w-2.5 text-gray-400" />}
    </button>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export function UsersRolesPage() {
  const [matrix, setMatrix] = useState<Record<Role, string[]>>(DEFAULT_MATRIX)
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()
  const staff = db.users.filter((u) => u.role !== 'customer' && u.role !== 'guest')

  function toggle(role: Role, permId: string) {
    if (role === 'admin') return // admin always has everything
    setMatrix((prev) => {
      const perms = prev[role]
      return {
        ...prev,
        [role]: perms.includes(permId)
          ? perms.filter((p) => p !== permId)
          : [...perms, permId],
      }
    })
    setSaved(false)
  }

  function toggleColumn(role: Role) {
    if (role === 'admin') return
    const allOn = ALL_PERMISSIONS.every((p) => matrix[role].includes(p))
    setMatrix((prev) => ({
      ...prev,
      [role]: allOn ? [] : [...ALL_PERMISSIONS],
    }))
    setSaved(false)
  }

  function save() {
    setSaved(true)
    toast({ title: 'Permissions saved', variant: 'success' })
  }

  function reset() {
    setMatrix(DEFAULT_MATRIX)
    setSaved(false)
    toast({ title: 'Reset to defaults' })
  }

  // Count granted permissions per role (for header badge)
  function grantedCount(role: Role) {
    return role === 'admin' ? ALL_PERMISSIONS.length : matrix[role].length
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" />
            <h1 className="text-2xl font-bold">Users & Roles</h1>
          </div>
        </div>

        <Tabs defaultValue="matrix">
          <TabsList>
            <TabsTrigger value="matrix">Permissions Matrix</TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-3.5 w-3.5 mr-1" />
              Staff Users ({staff.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Permissions matrix ──────────────────────────────────────── */}
          <TabsContent value="matrix">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">

                    {/* Role header row */}
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground w-48 min-w-[11rem]">
                          Module / Permission
                        </th>
                        {ROLES.map((role) => (
                          <th key={role} className="px-3 py-3 text-center min-w-[80px]">
                            <div className="flex flex-col items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleColumn(role)}
                                disabled={role === 'admin'}
                                className={cn(
                                  'px-2.5 py-1 rounded-full text-xs font-semibold border capitalize transition-all',
                                  ROLE_STYLES[role].badge,
                                  role !== 'admin' && 'hover:ring-2 hover:ring-offset-1 hover:ring-brand-300 cursor-pointer',
                                  role === 'admin' && 'cursor-default'
                                )}
                                title={role === 'admin' ? 'Admin always has full access' : 'Click to toggle all'}
                              >
                                {role}
                              </button>
                              <span className="text-[10px] text-muted-foreground tabular-nums">
                                {grantedCount(role)}/{ALL_PERMISSIONS.length}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {MODULES.map((mod) => (
                        <>
                          {/* Module group header */}
                          <tr key={mod.label} className="bg-gray-50/70 border-y border-gray-100">
                            <td
                              colSpan={ROLES.length + 1}
                              className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                            >
                              {mod.label}
                            </td>
                          </tr>

                          {/* Permission rows */}
                          {mod.permissions.map((perm) => (
                            <tr
                              key={perm.id}
                              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-4 py-2.5 text-sm text-gray-700">
                                <div className="flex items-center gap-1">
                                  {perm.label}
                                  <RowToggle
                                    permId={perm.id}
                                    matrix={matrix}
                                    onChange={(next) => { setMatrix(next); setSaved(false) }}
                                  />
                                </div>
                              </td>
                              {ROLES.map((role) => (
                                <PermCell
                                  key={role}
                                  checked={role === 'admin' || matrix[role].includes(perm.id)}
                                  onChange={() => toggle(role, perm.id)}
                                  disabled={role === 'admin'}
                                />
                              ))}
                            </tr>
                          ))}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                  <p className="text-xs text-muted-foreground">
                    Click a role header to grant/revoke all · Click <Minus className="h-3 w-3 inline" /> on a row to toggle across all roles
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={reset}>Reset defaults</Button>
                    <Button variant="brand" size="sm" onClick={save}>
                      {saved ? <><Check className="h-3.5 w-3.5 mr-1" /> Saved</> : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Staff users list ────────────────────────────────────────── */}
          <TabsContent value="users">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Language</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Since</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Permissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {staff.map((u) => {
                      const granted = grantedCount(u.role)
                      const style = ROLE_STYLES[u.role]
                      return (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white', style.dot)}>
                                {u.name[0]}
                              </div>
                              <div>
                                <p className="font-medium">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full capitalize border', style.badge)}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">
                            {u.phone ?? '—'}
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <Badge variant="outline" className="text-xs uppercase">{u.locale}</Badge>
                          </td>
                          <td className="p-3 text-muted-foreground hidden lg:table-cell text-sm">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Mini permission bar */}
                              <div className="hidden sm:flex gap-0.5">
                                {Array.from({ length: ALL_PERMISSIONS.length }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      'w-1.5 h-4 rounded-sm',
                                      i < granted ? style.dot : 'bg-gray-200'
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {granted}/{ALL_PERMISSIONS.length}
                              </span>
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
