import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Copy, Check, AlertTriangle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { portalClient } from '../../api/portal-client'
import { useToast } from '../../components/ui/Toast'

const tierOptions = [
  { key: 'starter', label: 'Starter', desc: '60 istek/dk, Temel ozellikler', color: 'text-zinc-400' },
  { key: 'growth', label: 'Growth', desc: '300 istek/dk, Webhook + Analytics', color: 'text-blue-400' },
  { key: 'enterprise', label: 'Enterprise', desc: '1000 istek/dk, Tam erisim', color: 'text-accent' },
]

export function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newKey, setNewKey] = useState<{ apiKey: string; webhookSecret: string } | null>(null)
  const [copied, setCopied] = useState('')
  const [form, setForm] = useState({ projectId: '', projectName: '', tier: 'starter', contactEmail: '', contactPhone: '' })
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchTenants = async () => {
    const res = await portalClient.getTenants()
    if (res.success) setTenants(res.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchTenants() }, [])

  const handleCreate = async () => {
    if (!form.projectId || !form.projectName) return
    setCreating(true)
    const res = await portalClient.createTenant(form)
    setCreating(false)
    if (res.success) {
      setNewKey({ apiKey: res.data.apiKey, webhookSecret: res.data.webhookSecret })
      toast('success', 'Tenant olusturuldu')
      fetchTenants()
    } else {
      toast('error', res.error || 'Hata olustu')
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) return <Skeleton variant="card" count={3} />

  const onboarding = (t: any) => {
    const steps = [t.apiKeyPrefix, t.webhookConfigured, false, false]
    return steps.filter(Boolean).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Tenant Yonetimi</h1>
        <Button onClick={() => { setShowCreate(true); setNewKey(null); setForm({ projectId: '', projectName: '', tier: 'starter', contactEmail: '', contactPhone: '' }) }}>
          <Plus size={16} /> Yeni Tenant Olustur
        </Button>
      </div>

      {/* Tenant Grid */}
      <div className="grid grid-cols-2 gap-4">
        {tenants.map((t) => (
          <Card key={t.projectId} className="hover:border-border transition-colors cursor-pointer" padding={true}>
            <div onClick={() => navigate(`/admin/tenants/${t.projectId}`)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center text-accent font-bold">{t.projectName?.[0]}</div>
                  <div>
                    <p className="font-semibold text-text-primary">{t.projectName}</p>
                    <Badge status={t.tier}>{t.tier}</Badge>
                  </div>
                </div>
                <Badge variant={t.apiKeyRevoked ? 'error' : 'success'}>{t.apiKeyRevoked ? 'Pasif' : 'Aktif'}</Badge>
              </div>

              {/* Onboarding progress */}
              <div className="mt-3 pt-3 border-t border-border-subtle">
                <div className="flex gap-1">
                  {['API Key', 'Webhook', 'Ilk Siparis', 'Ilk Teslimat'].map((step, i) => (
                    <div key={step} className="flex-1">
                      <div className={`h-1.5 rounded-full ${i < onboarding(t) ? 'bg-accent' : 'bg-bg-tertiary'}`} />
                      <p className="text-[9px] text-text-muted mt-1 text-center">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={newKey ? 'Tenant Olusturuldu' : 'Yeni Tenant Olustur'} size="md">
        {newKey ? (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
              <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">Bu API key'i kopyalayin. Bir daha gosterilmeyecek.</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-muted mb-1.5">API Key</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono break-all">{newKey.apiKey}</code>
                <button onClick={() => copyToClipboard(newKey.apiKey, 'api')} className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted cursor-pointer">
                  {copied === 'api' ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-muted mb-1.5">Webhook Secret</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono break-all">{newKey.webhookSecret}</code>
                <button onClick={() => copyToClipboard(newKey.webhookSecret, 'wh')} className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted cursor-pointer">
                  {copied === 'wh' ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <Button onClick={() => setShowCreate(false)} className="w-full">Tamam</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Marka Adi" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="File Market" />
            <Input label="Proje ID" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} placeholder="file-market" />

            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Tier</p>
              <div className="grid grid-cols-3 gap-2">
                {tierOptions.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setForm({ ...form, tier: t.key })}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${form.tier === t.key ? 'border-accent bg-accent-subtle' : 'border-border-subtle hover:border-border'}`}
                  >
                    <p className={`text-sm font-medium ${t.color}`}>{t.label}</p>
                    <p className="text-[10px] text-text-muted mt-1">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Input label="E-posta" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="info@firma.com" />
            <Input label="Telefon" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="0212 xxx xx xx" />

            <Button onClick={handleCreate} disabled={creating || !form.projectId || !form.projectName} className="w-full">
              {creating ? 'Olusturuluyor...' : 'Tenant Olustur'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
