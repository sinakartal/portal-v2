import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: number; isPositive: boolean }
}

export function KPICard({ icon: Icon, label, value, trend }: KPICardProps) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
          <Icon size={18} className="text-accent" />
        </div>
        <span className="text-text-muted text-[13px]">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-[28px] font-bold text-text-primary leading-none">{value}</span>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            %{Math.abs(trend.value)}
          </span>
        )}
      </div>
    </div>
  )
}
