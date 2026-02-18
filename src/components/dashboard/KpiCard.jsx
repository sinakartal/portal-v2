import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils'

export default function KpiCard({ title, value, change, icon: Icon, type = 'number', suffix = '' }) {
  const isPositive = change >= 0
  const displayValue = type === 'currency' ? formatCurrency(value) : type === 'percent' ? `%${value}` : `${formatNumber(value)}${suffix}`

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon size={20} className="text-primary" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{isPositive ? '+' : ''}{change}%</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{displayValue}</p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
    </div>
  )
}
