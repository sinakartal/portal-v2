import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Package, CheckCircle, Shield, Clock, Copy, Check, RefreshCw } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { KPICard } from '../../components/ui/KPICard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { OrderTrendChart } from '../../components/charts/OrderTrendChart'
import { SLAChart } from '../../components/charts/SLAChart'
import { portalClient } from '../../api/portal-client'
import { useToast } from '../../components/ui/Toast'

const tabs = [
  { key: 'overview', label: 'Genel Bakis' },
  { key: 'orders', label: 'Siparisler' },
  { key: 'sla', label: 'SLA' },
  { key: 'billing', label: 'Faturalama' },
  { key: 'settings', label: 'Ayarlar' },
]

// Mock trend data
const mockTrend = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 6 + i)
  return { date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }), orders: Math.floor(Math.random() * 50) + 20, delivered: Math.floor(Math.random() * 40) + 15 }
})

export function TenantDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [tab, setTab] = useState('overview')
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!projectId) return
    portalClient.getTenant(projectId).then((res) => {
      if (res.success) setDetail(res.data)
      setLoading(false)
    })
  }, [projectId])

  const handleRegenKey = async () => {
    if (!projectId || !confirm('API key yenilenecek. Eski key gecersiz olacak. Devam?')) return
    const res = await portalClient.regenerateKey(projectId)
    if (res.success) {
      toast('success', `Yeni API Key: ${res.data.apiKey}`)
    } else {
      toast('error', res.error || 'Hata')
    }
  }

  if (loading) return <Skeleton variant="kpi" count={4} />

  const config = detail?.config
  const apiKey = detail?.apiKey
  const stats = detail?.stats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center text-accent font-bold text-lg">
            {config?.projectName?.[0] || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{config?.projectName}</h1>
            <div className="flex gap-2 mt-1">
              <Badge status={config?.apiTier}>{config?.apiTier}</Badge>
              <span className="text-xs text-text-muted">{projectId}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <KPICard icon={Package} label="Toplam Siparis" value={stats?.orders?.total || 0} />
            <KPICard icon={CheckCircle} label="Teslim" value={stats?.orders?.delivered || 0} />
            <KPICard icon={Shield} label="SLA" value={`%${stats?.sla?.percent || 0}`} />
            <KPICard icon={Clock} label="Ort. Sure" value="28dk" />
          </div>
          <Card>
            <h3 className="text-sm font-medium text-text-secondary mb-4">Siparis Trendi (Son 7 Gun)</h3>
            <OrderTrendChart data={mockTrend} />
          </Card>
        </div>
      )}

      {tab === 'orders' && (
        <Card>
          <p className="text-text-muted text-sm">Siparis listesi Algoritma baglantisi ile yuklenir.</p>
        </Card>
      )}

      {tab === 'sla' && (
        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-1 flex flex-col items-center justify-center">
            <SLAChart onTrack={85} warning={10} breached={5} size={180} />
            <div className="flex gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />On Track: 85</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Warning: 10</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Breached: 5</span>
            </div>
          </Card>
          <Card className="col-span-2">
            <h3 className="text-sm font-medium text-text-secondary mb-4">SLA Ihlalleri</h3>
            <p className="text-text-muted text-sm">Algoritma baglantisi ile yuklenir.</p>
          </Card>
        </div>
      )}

      {tab === 'billing' && (
        <div className="grid grid-cols-3 gap-4">
          <KPICard icon={Package} label="Toplam Fatura" value="$8,450" />
          <KPICard icon={CheckCircle} label="Siparis Sayisi" value="342" />
          <KPICard icon={Clock} label="Ort. Maliyet/Siparis" value="$24.7" />
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-medium text-text-secondary mb-3">API Key</h3>
            <div className="flex items-center gap-3">
              <code className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary">
                {apiKey?.prefix || 'N/A'}
              </code>
              <button onClick={() => { navigator.clipboard.writeText(apiKey?.prefix || ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="p-2 hover:bg-bg-tertiary rounded-lg text-text-muted cursor-pointer">
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
              <Button variant="danger" size="sm" onClick={handleRegenKey}><RefreshCw size={14} /> Yenile</Button>
              {apiKey?.isRevoked && <Badge variant="error">Revoked</Badge>}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Branding</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Logo URL" value={config?.logoUrl || ''} readOnly />
              <Input label="Primary Color" value={config?.primaryColor || '#f97316'} readOnly />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Webhook</h3>
            {detail?.webhook ? (
              <div className="space-y-2">
                <p className="text-sm text-text-primary">URL: {detail.webhook.url}</p>
                <p className="text-sm text-text-secondary">Events: {detail.webhook.events?.join(', ') || '-'}</p>
                <Badge variant={detail.webhook.isActive ? 'success' : 'error'}>{detail.webhook.isActive ? 'Aktif' : 'Pasif'}</Badge>
              </div>
            ) : (
              <p className="text-text-muted text-sm">Webhook yapilandirilmamis.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
