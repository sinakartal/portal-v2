import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Package, CheckCircle, Shield, Bike, Play, Database } from 'lucide-react'
import { KPICard } from '../../components/ui/KPICard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Skeleton } from '../../components/ui/Skeleton'
import { portalClient } from '../../api/portal-client'
import { usePolling } from '../../hooks/usePolling'

export function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchData = async () => {
    const [ovRes, tRes] = await Promise.all([
      portalClient.getAdminOverview(),
      portalClient.getTenants(),
    ])
    if (ovRes.success) setOverview(ovRes.data)
    if (tRes.success) setTenants(tRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])
  usePolling(fetchData)

  if (loading) return <Skeleton variant="kpi" count={4} />

  const columns: Column<any>[] = [
    { key: 'projectName', header: 'Marka Adi', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent-subtle flex items-center justify-center text-accent text-xs font-bold">{r.projectName?.[0]}</div>
        <span className="font-medium text-text-primary">{r.projectName}</span>
      </div>
    )},
    { key: 'tier', header: 'Tier', render: (r) => <Badge status={r.tier}>{r.tier}</Badge> },
    { key: 'webhookConfigured', header: 'Webhook', render: (r) => (
      <span className={`text-xs ${r.webhookConfigured ? 'text-green-400' : 'text-text-muted'}`}>{r.webhookConfigured ? 'Aktif' : '-'}</span>
    )},
    { key: 'apiKeyRevoked', header: 'Durum', render: (r) => (
      <Badge variant={r.apiKeyRevoked ? 'error' : 'success'}>{r.apiKeyRevoked ? 'Pasif' : 'Aktif'}</Badge>
    )},
    { key: 'createdAt', header: 'Olusturulma', render: (r) => (
      <span className="text-text-muted text-xs">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm"><Play size={14} /> Dispatch Calistir</Button>
          <Button variant="secondary" size="sm"><Database size={14} /> Test Verisi Uret</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard icon={Building2} label="Aktif Tenant" value={overview?.totalTenants || 0} />
        <KPICard icon={Package} label="Toplam Siparis" value={overview?.totalOrders || 0} trend={{ value: 5, isPositive: true }} />
        <KPICard icon={CheckCircle} label="Teslim Edilen" value={overview?.totalDeliveries || 0} trend={{ value: 3, isPositive: true }} />
        <KPICard icon={Shield} label="Genel SLA" value={`%${overview?.avgSLA || 0}`} />
        <KPICard icon={Bike} label="Aktif API Key" value={overview?.activeApiKeys || 0} />
      </div>

      {/* Tenant Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Tenant'lar</h2>
          <Button size="sm" onClick={() => navigate('/admin/tenants')}>+ Yeni Tenant</Button>
        </div>
        <DataTable columns={columns} data={tenants} onRowClick={(r) => navigate(`/admin/tenants/${r.projectId}`)} />
      </Card>
    </div>
  )
}
