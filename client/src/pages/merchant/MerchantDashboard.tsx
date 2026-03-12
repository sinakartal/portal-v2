import { useState, useEffect } from 'react'
import { Package, CheckCircle, Shield, Clock } from 'lucide-react'
import { KPICard } from '../../components/ui/KPICard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { SLAChart } from '../../components/charts/SLAChart'
import { portalClient } from '../../api/portal-client'
import { useAuth } from '../../context/AuthContext'
import { usePolling } from '../../hooks/usePolling'
import type { KPIData, Order } from '../../types'

const statusLabels: Record<string, string> = {
  pending: 'Bekliyor', dispatched: 'Rotalandi', assigned: 'Atandi',
  picked_up: 'Alindi', in_transit: 'Yolda', delivered: 'Teslim Edildi', cancelled: 'Iptal',
}

export function MerchantDashboard() {
  const { tenant } = useAuth()
  const [stats, setStats] = useState<KPIData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const [sRes, oRes] = await Promise.all([
      portalClient.getTenantStats(),
      portalClient.getTenantOrders({ limit: '10' }),
    ])
    if (sRes.success) setStats(sRes.data)
    if (oRes.success) setOrders(oRes.data?.orders || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])
  usePolling(fetchData)

  if (loading) return <Skeleton variant="kpi" count={4} />

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Gunaydin' : hour < 18 ? 'Iyi gunler' : 'Iyi aksamlar'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{greeting}, {tenant?.projectName}</h1>
          <p className="text-sm text-text-muted mt-1">
            Bugun {stats?.orders?.delivered || 0} siparis teslim edildi, SLA %{stats?.sla?.percent || 0}
          </p>
        </div>
        <p className="text-sm text-text-muted">{now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard icon={Package} label="Bugun Siparis" value={stats?.orders?.total || 0} trend={{ value: 8, isPositive: true }} />
        <KPICard icon={CheckCircle} label="Teslim Edilen" value={stats?.orders?.delivered || 0} trend={{ value: 5, isPositive: true }} />
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 flex items-center gap-4">
          <SLAChart onTrack={stats?.sla?.percent || 0} warning={stats?.sla?.warning || 0} breached={stats?.sla?.breached || 0} size={64} />
          <div>
            <p className="text-text-muted text-[13px]">SLA Uyumu</p>
            <p className="text-2xl font-bold text-text-primary">%{stats?.sla?.percent || 0}</p>
            <p className="text-[10px] text-text-muted">Hedef: %{stats?.sla?.target || 95}</p>
          </div>
        </div>
        <KPICard icon={Clock} label="Ort. Teslimat" value="28dk" trend={{ value: 2, isPositive: true }} />
      </div>

      {/* Live Order Flow */}
      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Canli Siparis Akisi</h2>
        <div className="space-y-3">
          {orders.length === 0 && <p className="text-text-muted text-sm py-4 text-center">Aktif siparis yok</p>}
          {orders.map((order) => (
            <div key={order.orderId} className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer">
              <Badge status={order.status} size="md">{statusLabels[order.status] || order.status}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{order.externalOrderId || order.orderId}</p>
                <p className="text-xs text-text-muted">{order.delivery?.customerName || '-'}</p>
              </div>
              <div className="text-right">
                {order.estimatedDelivery && (
                  <p className="text-xs text-text-secondary">ETA: {new Date(order.estimatedDelivery).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                )}
                {order.courier && <p className="text-xs text-text-muted">{order.courier.name}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <p className="text-xs text-green-400 font-medium mb-1">Multi-Tenant Tasarruf</p>
          <p className="text-2xl font-bold text-green-400">$1,240</p>
          <p className="text-xs text-text-muted mt-1">Bu ay tasarrufunuz</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted font-medium mb-1">Sonraki Fatura</p>
          <p className="text-2xl font-bold text-text-primary">$8,450</p>
          <p className="text-xs text-text-muted mt-1">Tahmini tutar</p>
        </Card>
      </div>
    </div>
  )
}
