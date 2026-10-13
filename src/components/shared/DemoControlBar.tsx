import { useState } from 'react'
import { Settings, X, ChevronDown, Play, Pause, RefreshCw, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore, DEMO_ACCOUNTS } from '@/stores/authStore'
import { simulator } from '@/mock/simulator'
import { resetDemoData } from '@/mock/db'
import { useToast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function DemoControlBar() {
  const { t } = useTranslation()
  const { demoBarVisible, setDemoBarVisible, simulatorRunning, setSimulatorRunning, language, setLanguage, currency, setCurrency } = useUIStore()
  const { user, loginAs } = useAuthStore()
  const [expanded, setExpanded] = useState(false)
  const { toast } = useToast()

  if (!demoBarVisible) {
    return (
      <button
        onClick={() => setDemoBarVisible(true)}
        className="fixed bottom-20 md:bottom-4 left-4 z-[150] w-9 h-9 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
        title="Show Demo Bar"
      >
        <Settings className="h-4 w-4" />
      </button>
    )
  }

  function toggleSimulator() {
    if (simulatorRunning) {
      simulator.stop()
      setSimulatorRunning(false)
      toast({ title: 'Simulator paused', variant: 'warning' })
    } else {
      simulator.start()
      setSimulatorRunning(true)
      toast({ title: 'Simulator running', description: 'Generating live events', variant: 'success' })
    }
  }

  function handleSimulate(type: 'order' | 'stock' | 'payment') {
    if (type === 'order') { simulator.triggerNewOrder(); toast({ title: '🛍 New order simulated!', variant: 'success' }) }
    if (type === 'stock') { simulator.triggerStockAlert(); toast({ title: '⚠️ Stock alert triggered', variant: 'warning' }) }
    if (type === 'payment') { simulator.triggerPayment(); toast({ title: '💳 Payment simulated', variant: 'success' }) }
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-[150] select-none">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden w-72 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide">DEMO CONTROL BAR</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-gray-700 rounded">
              <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
            </button>
            <button onClick={() => setDemoBarVisible(false)} className="p-1 hover:bg-gray-700 rounded">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Quick role switch */}
        <div className="px-3 py-2">
          <p className="text-xs text-gray-400 mb-1.5">Active Role</p>
          <div className="flex flex-wrap gap-1">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                onClick={() => { loginAs(acc.id); toast({ title: `Switched to ${acc.role}`, description: acc.phone ?? acc.email, variant: 'default' }) }}
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium transition-colors',
                  user?.id === acc.id ? 'bg-brand-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        {expanded && (
          <>
            {/* Language + Currency */}
            <div className="px-3 py-2 border-t border-gray-700 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Language</p>
                <div className="flex gap-1">
                  {(['en', 'am'] as const).map((lang) => (
                    <button key={lang} onClick={() => setLanguage(lang)}
                      className={cn('px-2 py-0.5 rounded text-xs', language === lang ? 'bg-brand-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}>
                      {lang === 'en' ? 'EN' : 'AM'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Currency</p>
                <div className="flex gap-1">
                  {(['ETB', 'USD'] as const).map((cur) => (
                    <button key={cur} onClick={() => setCurrency(cur)}
                      className={cn('px-2 py-0.5 rounded text-xs', currency === cur ? 'bg-brand-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}>
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulator */}
            <div className="px-3 py-2 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">Event Simulator</p>
                <button onClick={toggleSimulator}
                  className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-xs', simulatorRunning ? 'bg-green-700 text-green-200' : 'bg-gray-700 text-gray-300')}>
                  {simulatorRunning ? <><Play className="h-2.5 w-2.5" /> Running</> : <><Pause className="h-2.5 w-2.5" /> Paused</>}
                </button>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => handleSimulate('order')} className="flex-1 py-1 rounded text-xs bg-blue-800 hover:bg-blue-700 text-blue-200 flex items-center justify-center gap-1">
                  <Zap className="h-2.5 w-2.5" /> Order
                </button>
                <button onClick={() => handleSimulate('stock')} className="flex-1 py-1 rounded text-xs bg-yellow-800 hover:bg-yellow-700 text-yellow-200 flex items-center justify-center gap-1">
                  <Zap className="h-2.5 w-2.5" /> Stock
                </button>
                <button onClick={() => handleSimulate('payment')} className="flex-1 py-1 rounded text-xs bg-green-800 hover:bg-green-700 text-green-200 flex items-center justify-center gap-1">
                  <Zap className="h-2.5 w-2.5" /> Pay
                </button>
              </div>
            </div>

            {/* Reset */}
            <div className="px-3 py-2 border-t border-gray-700">
              <button
                onClick={() => { if (confirm('Reset all demo data? The page will reload.')) resetDemoData() }}
                className="w-full py-1.5 rounded text-xs bg-red-900 hover:bg-red-800 text-red-200 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3 w-3" /> Reset Demo Data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
