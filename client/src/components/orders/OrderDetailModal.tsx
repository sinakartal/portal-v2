import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { OrderTimeline } from './OrderTimeline'
import type { Order } from '../../types'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

const statusLabels: Record<string, string> = {
  pending: 'Bekliyor', dispatched: 'Rotalandi', assigned: 'Atandi',
  picked_up: 'Alindi', in_transit: 'Yolda', delivered: 'Teslim Edildi', cancelled: 'Iptal',
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!order) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Siparis Detayi" size="lg">
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Info */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-text-muted mb-1">Ext. Order ID</p>
            <p className="text-lg font-bold text-text-primary font-mono">{order.externalOrderId || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Bringo ID</p>
            <p className="text-sm text-text-secondary font-mono">{order.orderId}</p>
          </div>
          <div>
            <Badge status={order.status} size="md">{statusLabels[order.status] || order.status}</Badge>
          </div>
          {order.origin && (
            <div>
              <p className="text-xs text-text-muted mb-1">Magaza</p>
              <p className="text-sm text-text-primary">{order.origin.name}</p>
            </div>
          )}
          {order.delivery && (
            <div>
              <p className="text-xs text-text-muted mb-1">Musteri</p>
              <p className="text-sm text-text-primary">{order.delivery.customerName}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-text-muted mb-1">Mod</p>
            <Badge variant={order.mode === 'instant' ? 'warning' : order.mode === 'flex' ? 'info' : 'neutral'} size="md">
              {order.mode}
            </Badge>
          </div>
          {order.courier && (
            <div>
              <p className="text-xs text-text-muted mb-1">Kurye</p>
              <p className="text-sm text-text-primary">{order.courier.name}</p>
              <p className="text-xs text-text-muted">{order.courier.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-text-muted mb-1">Olusturulma</p>
            <p className="text-sm text-text-secondary">
              {order.createdAt ? new Date(order.createdAt).toLocaleString('tr-TR') : '-'}
            </p>
          </div>
        </div>

        {/* Right: Timeline */}
        <div>
          <p className="text-xs text-text-muted mb-3 uppercase tracking-wider">Durum Akisi</p>
          <OrderTimeline events={order.timeline} status={order.status} />
        </div>
      </div>
    </Modal>
  )
}
