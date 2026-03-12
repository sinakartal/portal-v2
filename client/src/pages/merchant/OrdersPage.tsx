import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Skeleton } from '../../components/ui/Skeleton'
import { OrderDetailModal } from '../../components/orders/OrderDetailModal'
import { EmptyState } from '../../components/ui/EmptyState'
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
      <h1 className="text-2xl font-bold text-text-primary">Siparisler</h1>

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
    </div>
  )
}
