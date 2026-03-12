import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Package, Truck, MapPin, CheckCircle2, Clock, Phone } from 'lucide-react'
import { Timeline } from '../../components/ui/Timeline'
import { portalClient } from '../../api/portal-client'
import type { TrackingData } from '../../types'

const statusIcons: Record<string, { icon: typeof Package; color: string; pulse: boolean }> = {
  pending: { icon: Clock, color: '#71717a', pulse: false },
  dispatched: { icon: Package, color: '#3b82f6', pulse: false },
  assigned: { icon: Truck, color: '#f97316', pulse: true },
  picked_up: { icon: MapPin, color: '#a855f7', pulse: false },
  in_transit: { icon: Truck, color: '#3b82f6', pulse: true },
  delivered: { icon: CheckCircle2, color: '#22c55e', pulse: false },
}

export function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) return
    portalClient.getTracking(orderId).then((res) => {
      if (res.success && res.data) {
        setData(res.data)
        // Apply brand colors
        if (res.data.branding?.primaryColor) {
          document.documentElement.style.setProperty('--brand-primary', res.data.branding.primaryColor)
        }
      } else {
        setError(res.error || 'Siparis bulunamadi')
      }
      setLoading(false)
    })
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Yukleniyor...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center">
          <Package size={48} className="text-text-muted mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text-primary mb-2">Siparis Bulunamadi</h1>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      </div>
    )
  }

  const statusInfo = statusIcons[data.status] || statusIcons.pending
  const StatusIcon = statusInfo.icon
  const brandColor = data.branding?.primaryColor || '#f97316'

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[480px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6 p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${brandColor}15, ${brandColor}05)` }}>
          {data.branding?.logoUrl ? (
            <img src={data.branding.logoUrl} alt="" className="h-8 mx-auto mb-2" />
          ) : (
            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>
              {data.branding?.projectName?.[0] || 'B'}
            </div>
          )}
          <p className="text-sm font-medium text-text-primary">{data.branding?.projectName || 'Bringo'}</p>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${statusInfo.pulse ? 'animate-pulse' : ''}`} style={{ backgroundColor: `${statusInfo.color}20` }}>
            <StatusIcon size={28} style={{ color: statusInfo.color }} />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-1">{data.statusLabel}</h1>
          {data.estimatedDelivery && data.status !== 'delivered' && (
            <p className="text-sm text-text-muted">
              Tahmini varis: {new Date(data.estimatedDelivery).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 mb-4">
          <Timeline events={data.timeline} />
        </div>

        {/* Courier */}
        {data.courier && (
          <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center">
                <Truck size={18} className="text-text-muted" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{data.courier.name}</p>
                <p className="text-xs text-text-muted">{data.courier.phone}</p>
              </div>
              <a href={`tel:${data.courier.phone}`} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}>
                <Phone size={16} style={{ color: brandColor }} />
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-text-muted mt-8">Powered by Bringo</p>
      </div>
    </div>
  )
}
