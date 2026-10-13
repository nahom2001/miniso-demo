import { useState } from 'react'
import { Search, Activity } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import * as seed from '@/mock/seed'
import { db } from '@/mock/db'
import { formatDateTime } from '@/lib/utils'

const ACTION_COLORS: Record<string, string> = {
  UPDATE_ORDER:    'bg-blue-100 text-blue-700',
  APPROVE_REFUND:  'bg-green-100 text-green-700',
  ADJUST_STOCK:    'bg-yellow-100 text-yellow-700',
  LOGIN:           'bg-gray-100 text-gray-700',
  CREATE_COUPON:   'bg-purple-100 text-purple-700',
  SEND_CAMPAIGN:   'bg-pink-100 text-pink-700',
}

export function AuditLogPage() {
  const [search, setSearch] = useState('')

  const entries = [...db.auditLog].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  const filtered = entries.filter(e =>
    !search ||
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.entity.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold">Audit Log</h1>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by action or entity…" className="pl-9 h-9" />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map(entry => {
                const user = db.users.find(u => u.id === entry.userId)
                const color = ACTION_COLORS[entry.action] ?? 'bg-gray-100 text-gray-700'
                return (
                  <div key={entry.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {user?.name[0] ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${color}`}>{entry.action}</span>
                        <span className="text-xs text-muted-foreground">on</span>
                        <span className="text-xs font-medium">{entry.entity}</span>
                        <span className="text-xs text-muted-foreground">by</span>
                        <span className="text-xs font-medium">{user?.name ?? entry.userId}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(entry.ts)}</p>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No entries found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
