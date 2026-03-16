import { useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Skeleton } from '../../components/ui/Skeleton'
import { OrderDetailModal } from '../../components/orders/OrderDetailModal'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { portalClient } from '../../api/portal-client'
import type { Order } from '../../types'

const statusLabels: Record<string, string> = {
  pending: 'Bekliyor', dispatched: 'Rotalandi', assigned: 'Atandi',
  picked_up: 'Alindi', in_transit: 'Yolda', delivered: 'Teslim Edildi', cancelled: 'Iptal',
}

const statusOptions = [
  { value: '', label: 'Tumu' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'dispatched', label: 'Rotalanan' },
  { value: 'assigned', label: 'Atanan' },
  { value: 'picked_up', label: 'Alinan' },
  { value: 'delivered', label: 'Teslim' },
  { value: 'cancelled', label: 'Iptal' },
]

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<Order | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    externalOrderId: '',
    customerName: '',
    customerPhone: '',
    address: '',
    lat: '',
    lng: '',
    mode: 'standard',
    deci: '10',
    note: '',
  })
  const limit = 25

  const fetchOrders = async () => {
    setLoading(true)
    const params: Record<string, string> = { page: String(page), limit: String(limit) }
    if (status) params.status = status
    const res = await portalClient.getTenantOrders(params)
    if (res.success) {
      setOrders(res.data?.orders || [])
      setTotal(res.data?.total || 0)
    }
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [status, page])

  const createOrder = async () => {
    if (!form.customerName || !form.address) return
    setCreating(true)
    const res = await portalClient.createOrder({
      externalOrderId: form.externalOrderId || undefined,
      deliveryAddress: {
        address: form.address,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lng: form.lng ? parseFloat(form.lng) : undefined,
      },
      mode: form.mode,
      deci: parseInt(form.deci) || 10,
      note: form.note || undefined,
    })
    setCreating(false)
    if (res.success) {
      setShowCreate(false)
      setForm({ externalOrderId: '', customerName: '', customerPhone: '',
        address: '', lat: '', lng: '', mode: 'standard', deci: '10', note: '' })
      fetchOrders()
    }
  }

  const filtered = search
    ? orders.filter(o => o.orderId.includes(search) || o.externalOrderId?.includes(search) || o.delivery?.customerName?.toLowerCase().includes(search.toLowerCase()))
    : orders

  const columns: Column<Order>[] = [
    { key: 'orderId', header: 'Siparis ID', render: (r) => (
      <span className="font-mono text-xs text-text-primary">{r.orderId?.substring(0, 12)}...</span>
    )},
    { key: 'externalOrderId', header: 'Ext. ID', render: (r) => (
      <span className="text-text-secondary text-xs">{r.externalOrderId || '-'}</span>
    )},
    { key: 'customer', header: 'Musteri', render: (r) => (
      <span className="text-text-primary text-sm">{r.delivery?.customerName || '-'}</span>
    )},
    { key: 'status', header: 'Durum', render: (r) => <Badge status={r.status}>{statusLabels[r.status] || r.status}</Badge> },
    { key: 'courier', header: 'Kurye', render: (r) => (
      <span className="text-text-secondary text-xs">{r.courier?.name || '-'}</span>
    )},
    { key: 'mode', header: 'Mod', render: (r) => <Badge variant="neutral" size="sm">{r.mode}</Badge> },
    { key: 'createdAt', header: 'Tarih', render: (r) => (
      <span className="text-text-muted text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleString('tr-TR') : '-'}</span>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Siparisler</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Yeni Siparis
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-end">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Siparis ID veya musteri ara..."
            className="w-full pl-9 pr-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <Select options={statusOptions} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} />
      </div>

      {/* Table */}
      <Card padding={false}>
        {loading ? (
          <div className="p-5"><Skeleton variant="row" count={8} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Siparis bulunamadi" description="Filtreleri degistirin veya API entegrasyonunuzu tamamlayin." />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(row) => setSelected(row)}
            page={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={setPage}
          />
        )}
      </Card>

      <OrderDetailModal order={selected} isOpen={!!selected} onClose={() => setSelected(null)} />

      {/* Create Order Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Yeni Siparis Olustur">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ext. Siparis ID (opsiyonel)" value={form.externalOrderId}
              onChange={e => setForm(f => ({ ...f, externalOrderId: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Teslimat Modu</label>
              <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary">
                <option value="standard">Standard</option>
                <option value="instant">Express</option>
                <option value="flex">Flex</option>
              </select>
            </div>
          </div>
          <Input label="Musteri Adi *" value={form.customerName}
            onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} />
          <Input label="Telefon" value={form.customerPhone}
            onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} />
          <Input label="Teslimat Adresi *" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Enlem (lat)" value={form.lat}
              onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} placeholder="41.01" />
            <Input label="Boylam (lng)" value={form.lng}
              onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} placeholder="29.02" />
            <Input label="Desi" value={form.deci}
              onChange={e => setForm(f => ({ ...f, deci: e.target.value }))} />
          </div>
          <Input label="Not (opsiyonel)" value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Iptal</Button>
            <Button onClick={createOrder} disabled={creating || !form.customerName || !form.address}>
              {creating ? 'Olusturuluyor...' : 'Siparis Olustur'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
