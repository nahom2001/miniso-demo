import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ id, title, description, variant, onDismiss }: { id: string; title: string; description?: string; variant: 'default' | 'success' | 'destructive' | 'warning'; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const icons = {
    default: <Info className="h-4 w-4 text-blue-500" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    destructive: <AlertCircle className="h-4 w-4 text-red-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  }

  const styles = {
    default: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    destructive: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50',
  }

  return (
    <div className={cn('pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-fade-in', styles[variant])}>
      {icons[variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const addToast = useUIStore((s) => s.addToast)
  return {
    toast: (props: { title: string; description?: string; variant?: 'default' | 'success' | 'destructive' | 'warning' }) =>
      addToast({ variant: 'default', ...props }),
  }
}
