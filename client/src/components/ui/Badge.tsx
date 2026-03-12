const variants = {
  success: 'bg-green-500/10 text-green-400',
  warning: 'bg-amber-500/10 text-amber-400',
  error: 'bg-red-500/10 text-red-400',
  info: 'bg-blue-500/10 text-blue-400',
  neutral: 'bg-zinc-800 text-zinc-400',
  purple: 'bg-purple-500/10 text-purple-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  accent: 'bg-accent-subtle text-accent',
}

const statusMap: Record<string, keyof typeof variants> = {
  pending: 'neutral',
  dispatched: 'info',
  assigned: 'warning',
  picked_up: 'purple',
  in_transit: 'cyan',
  delivered: 'success',
  cancelled: 'error',
  sla_warning: 'warning',
  sla_breach: 'error',
  active: 'success',
  paused: 'warning',
  inactive: 'neutral',
  starter: 'neutral',
  growth: 'info',
  enterprise: 'accent',
}

interface BadgeProps {
  variant?: keyof typeof variants
  status?: string
  size?: 'sm' | 'md'
  children: React.ReactNode
}

export function Badge({ variant, status, size = 'sm', children }: BadgeProps) {
  const v = variant || (status ? statusMap[status] : 'neutral') || 'neutral'
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span className={`inline-flex items-center rounded-md font-medium ${sizeClass} ${variants[v]}`}>
      {children}
    </span>
  )
}
