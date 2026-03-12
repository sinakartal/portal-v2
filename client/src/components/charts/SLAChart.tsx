import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface SLAChartProps {
  onTrack: number
  warning: number
  breached: number
  size?: number
}

const COLORS = ['#22c55e', '#f59e0b', '#ef4444']

export function SLAChart({ onTrack, warning, breached, size = 160 }: SLAChartProps) {
  const data = [
    { name: 'On Track', value: onTrack },
    { name: 'Warning', value: warning },
    { name: 'Breached', value: breached },
  ].filter(d => d.value > 0)

  const total = onTrack + warning + breached
  const percent = total > 0 ? Math.round((onTrack / total) * 100) : 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" paddingAngle={2} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">%{percent}</p>
          <p className="text-[10px] text-text-muted">SLA</p>
        </div>
      </div>
    </div>
  )
}
