import { useState, useEffect } from 'react'
import { Copy, Check, Send } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { portalClient } from '../../api/portal-client'
import { useToast } from '../../components/ui/Toast'
import type { TenantConfig, WebhookLog } from '../../types'

const tabs = [
  { key: 'api', label: 'API' },
  { key: 'webhook', label: 'Webhook' },
  { key: 'branding', label: 'Branding' },
  { key: 'general', label: 'Genel' },
]

const webhookEvents = [
  'order.created', 'order.assigned', 'order.picked_up',
  'order.delivered', 'order.cancelled', 'order.sla_warning', 'order.sla_breach',
]

export function SettingsPage() {
  const [tab, setTab] = useState('api')
  const [config, setConfig] = useState<TenantConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    portalClient.getTenantConfig().then((res) => {
      if (res.success && res.data) {
        setConfig(res.data)
        setWebhookUrl(res.data.webhookUrl || '')
        setSelectedEvents(res.data.webhookEvents || [])
      }
      setLoading(false)
    })
  }, [])

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const saveWebhook = async () => {
    setSaving(true)
    const res = await portalClient.updateTenantConfig({ webhookUrl, webhookEvents: selectedEvents })
    setSaving(false)
    if (res.success) {
      toast('success', 'Webhook ayarlari kaydedildi')
      setConfig(res.data)
    } else {
      toast('error', res.error || 'Kaydetme basarisiz')
    }
  }

  const testWebhook = async () => {
    const res = await portalClient.testWebhook()
    if (res.success) {
      toast('success', 'Test webhook gonderildi')
    } else {
      toast('error', res.error || 'Test basarisiz')
    }
  }

  const saveBranding = async () => {
    if (!config) return
    setSaving(true)
    const res = await portalClient.updateTenantConfig({
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      logoUrl: config.logoUrl,
    })
    setSaving(false)
    if (res.success) toast('success', 'Branding kaydedildi')
    else toast('error', res.error || 'Hata')
  }

  const toggleEvent = (e: string) => {
    setSelectedEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])
  }

  if (loading) return <Skeleton variant="card" count={2} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Ayarlar</h1>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'api' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-medium text-text-secondary mb-3">API Key</h3>
            <div className="flex items-center gap-3 bg-bg-primary border border-border rounded-lg p-3">
              <code className="text-sm font-mono text-text-primary flex-1">brg_live_****...****</code>
              <Badge status={config?.apiTier || 'starter'}>{config?.apiTier}</Badge>
            </div>
            <p className="text-xs text-text-muted mt-2">Rate limit: {config?.apiTier === 'enterprise' ? 1000 : config?.apiTier === 'growth' ? 300 : 60} istek/dakika</p>
          </Card>
        </div>
      )}

      {tab === 'webhook' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Webhook Yapilandirmasi</h3>
            <div className="space-y-4">
              <Input label="Callback URL" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://api.example.com/webhooks/bringo" />

              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Events</p>
                <div className="grid grid-cols-2 gap-2">
                  {webhookEvents.map((e) => (
                    <label key={e} className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-tertiary cursor-pointer">
                      <input type="checkbox" checked={selectedEvents.includes(e)} onChange={() => toggleEvent(e)} className="rounded accent-accent" />
                      <span className="text-sm text-text-primary">{e}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveWebhook} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
                <Button variant="secondary" onClick={testWebhook}><Send size={14} /> Test Webhook Gonder</Button>
              </div>
            </div>
          </Card>

          {config?.webhookSecret && (
            <Card>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Webhook Secret</h3>
              <div className="flex items-center gap-2">
                <code className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary">whsec_****...****</code>
                <button onClick={() => copyText(config.webhookSecret || '', 'wh')} className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted cursor-pointer">
                  {copied === 'wh' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'branding' && (
        <Card>
          <h3 className="text-sm font-medium text-text-secondary mb-3">Marka Gorselleri</h3>
          <div className="space-y-4">
            <Input label="Logo URL" value={config?.logoUrl || ''} onChange={(e) => setConfig(c => c ? { ...c, logoUrl: e.target.value } : c)} placeholder="https://..." />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={config?.primaryColor || '#f97316'} onChange={(e) => setConfig(c => c ? { ...c, primaryColor: e.target.value } : c)} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <Input value={config?.primaryColor || ''} onChange={(e) => setConfig(c => c ? { ...c, primaryColor: e.target.value } : c)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Secondary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={config?.secondaryColor || '#1a1a2e'} onChange={(e) => setConfig(c => c ? { ...c, secondaryColor: e.target.value } : c)} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <Input value={config?.secondaryColor || ''} onChange={(e) => setConfig(c => c ? { ...c, secondaryColor: e.target.value } : c)} />
                </div>
              </div>
            </div>
            <Button onClick={saveBranding} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
          </div>
        </Card>
      )}

      {tab === 'general' && (
        <Card>
          <h3 className="text-sm font-medium text-text-secondary mb-3">Genel Bilgiler</h3>
          <div className="space-y-4">
            <Input label="Sirket Adi" value={config?.projectName || ''} readOnly />
            <Input label="E-posta" value={config?.contactEmail || ''} onChange={(e) => setConfig(c => c ? { ...c, contactEmail: e.target.value } : c)} />
            <Input label="Telefon" value={config?.contactPhone || ''} onChange={(e) => setConfig(c => c ? { ...c, contactPhone: e.target.value } : c)} />
            <Button onClick={async () => {
              const res = await portalClient.updateTenantConfig({ contactEmail: config?.contactEmail, contactPhone: config?.contactPhone })
              toast(res.success ? 'success' : 'error', res.success ? 'Kaydedildi' : 'Hata')
            }}>Kaydet</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
