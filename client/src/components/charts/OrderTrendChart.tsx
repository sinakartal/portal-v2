import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface OrderTrendChartProps {
  data: { date: string; orders: number; delivered: number }[]
  height?: number
}

export function OrderTrendChart({ data, height = 250 }: OrderTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={4}>
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} width={32} />
        <Tooltip
          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
          itemStyle={{ color: '#fafafa' }}
          labelStyle={{ color: '#a1a1aa' }}
        />
        <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Siparis" />
        <Bar dataKey="delivered" fill="#22c55e" radius={[4, 4, 0, 0]} name="Teslim" />
      </BarChart>
    </ResponsiveContainer>
  )
}
