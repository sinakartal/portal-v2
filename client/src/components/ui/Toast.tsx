import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface ToastItem {
  id: number
  type: 'success' | 'error' | 'warning'
  message: string
}

interface ToastContextType {
  toast: (type: ToastItem['type'], message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((type: ToastItem['type'], message: string) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons = { success: CheckCircle, warning: AlertTriangle, error: XCircle }
  const colors = { success: 'border-green-500/30 text-green-400', warning: 'border-amber-500/30 text-amber-400', error: 'border-red-500/30 text-red-400' }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 w-80">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <div key={t.id} className={`flex items-start gap-3 p-3 bg-bg-secondary border ${colors[t.type]} rounded-lg shadow-xl animate-slide-in`}>
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm text-text-primary flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-text-muted hover:text-text-secondary cursor-pointer"><X size={14} /></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
