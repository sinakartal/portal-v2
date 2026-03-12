import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { SLAChart } from '../../components/charts/SLAChart'
import { portalClient } from '../../api/portal-client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts'
import type { KPIData } from '../../types'

// Mock SLA trend
const mockSLATrend = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 6 + i)
  return { date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }), sla: Math.floor(Math.random() * 8) + 92 }
})

export function SLAPage() {
  const [stats, setStats] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portalClient.getTenantStats().then((res) => {
      if (res.success) setStats(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Skeleton variant="kpi" count={4} />

  const sla = stats?.sla || { percent: 0, target: 95, isAboveTarget: false, breached: 0, warning: 0 }
  const onTrack = Math.max(0, (stats?.orders?.total || 100) - sla.breached - sla.warning)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">SLA Monitor</h1>

      {/* Big SLA Card */}
      <Card className="flex items-center gap-8">
        <SLAChart onTrack={onTrack} warning={sla.warning} breached={sla.breached} size={180} />
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-4xl font-bold text-text-primary">%{sla.percent}</p>
            <p className="text-sm text-text-muted mt-1">SLA Uyumu</p>
            <p className={`text-xs mt-1 ${sla.isAboveTarget ? 'text-green-400' : 'text-red-400'}`}>
              Hedef: %{sla.target} {sla.isAboveTarget ? '(Uzerinde)' : '(Altinda)'}
            </p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-xl font-bold text-green-400">{onTrack}</p>
              <p className="text-xs text-text-muted">On Track</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-400">{sla.warning}</p>
              <p className="text-xs text-text-muted">Warning</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-400">{sla.breached}</p>
              <p className="text-xs text-text-muted">Breached</p>
            </div>
          </div>
        </div>
      </Card>

      {/* SLA Trend */}
      <Card>
        <h2 className="text-sm font-medium text-text-secondary mb-4">SLA Trendi (Son 7 Gun)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={mockSLATrend}>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
            <YAxis domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} width={32} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} />
            <ReferenceLine y={95} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Hedef %95', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
            <Area type="monotone" dataKey="sla" fill="rgba(59, 130, 246, 0.1)" stroke="transparent" />
            <Line type="monotone" dataKey="sla" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="SLA %" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Breach list placeholder */}
      <Card>
        <h2 className="text-sm font-medium text-text-secondary mb-4">Ihlal Listesi</h2>
        <div className="space-y-2">
          {sla.breached === 0 && sla.warning === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">Ihlal yok - harika!</p>
          ) : (
            <p className="text-text-muted text-sm">Algoritma baglantisi ile detayli ihlal listesi yuklenir.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
