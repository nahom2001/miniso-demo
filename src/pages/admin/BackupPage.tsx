import { useState } from 'react'
import { Database, Download, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { AdminLayout } from '@/components/shared/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as seed from '@/mock/seed'
import { formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

export function BackupPage() {
  const { toast } = useToast()
  const [backups, setBackups] = useState(seed.backups)
  const [runningBackup, setRunningBackup] = useState(false)
  const [progress, setProgress] = useState(0)
  const [schedule, setSchedule] = useState('daily')

  async function runBackup() {
    setRunningBackup(true)
    setProgress(0)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 150))
      setProgress(i)
    }
    const newBackup = {
      id: `bkp-new-${Date.now()}`,
      ts: new Date().toISOString(),
      size: `${(12 + Math.random() * 3).toFixed(1)} MB`,
      status: 'completed' as const,
      type: 'manual' as const,
    }
    setBackups([newBackup, ...backups])
    setRunningBackup(false)
    toast({ title: 'Backup completed', description: `${newBackup.size} saved successfully`, variant: 'success' })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Backup & Recovery</h1>
          <Button variant="brand" onClick={runBackup} loading={runningBackup}>
            <Database className="h-4 w-4 mr-2" /> Run Backup Now
          </Button>
        </div>

        {/* Progress */}
        {runningBackup && (
          <div className="rounded-xl border bg-blue-50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-4 w-4 text-blue-600 animate-spin" />
              <p className="font-medium text-blue-800">Backup in progress…</p>
              <span className="text-sm text-blue-600">{progress}%</span>
            </div>
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{backups.filter((b) => b.status === 'completed').length}</p>
              <p className="text-sm text-muted-foreground">Successful Backups</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{backups.find((b) => b.status === 'completed')?.ts ? formatDateTime(backups.find((b) => b.status === 'completed')!.ts).split(',')[0] : '—'}</p>
              <p className="text-sm text-muted-foreground">Last Successful Backup</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Backup Schedule</p>
                <Select value={schedule} onValueChange={setSchedule}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every hour</SelectItem>
                    <SelectItem value="6h">Every 6 hours</SelectItem>
                    <SelectItem value="daily">Daily (recommended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Backup History (Last 14)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {backups.slice(0, 14).map((b) => (
                <div key={b.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${b.status === 'completed' ? 'bg-green-100' : b.status === 'failed' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {b.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {b.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                    {b.status === 'running' && <Clock className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{formatDateTime(b.ts)}</p>
                      <Badge variant="outline" className="text-xs capitalize">{b.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.size}</p>
                  </div>
                  <Badge variant={b.status === 'completed' ? 'success' : b.status === 'failed' ? 'destructive' : 'info'} className="capitalize">{b.status}</Badge>
                  <div className="flex gap-1">
                    <Button size="xs" variant="ghost" disabled={b.status !== 'completed'} onClick={() => toast({ title: 'Downloading backup…', variant: 'default' })}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="xs" variant="ghost" disabled={b.status !== 'completed'} onClick={() => { if (confirm('Restore from this backup? All current data will be replaced.')) toast({ title: 'Restore started (demo)', variant: 'warning' }) }}>
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
