import { useState, useEffect } from 'react'
import { CreditCard, Package, TrendingDown, Tag } from 'lucide-react'
import { KPICard } from '../../components/ui/KPICard'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { portalClient } from '../../api/portal-client'

export function BillingPage() {
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portalClient.getTenantInvoices().then((res) => {
      if (res.success) setInvoice(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Skeleton variant="kpi" count={3} />

  const totalAmount = invoice?.totalAmount || 0
  const totalOrders = invoice?.totalOrders || 0
  const unitPrice = invoice?.unitPrice || 0
  const savings = Math.round(totalAmount * 0.17)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Faturalama</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard icon={CreditCard} label="Toplam Fatura" value={`$${totalAmount.toLocaleString('tr-TR')}`} />
        <KPICard icon={Package} label="Siparis Sayisi" value={totalOrders} />
        <KPICard icon={TrendingDown} label="Ort. Maliyet/Siparis" value={`$${unitPrice.toFixed(1)}`} />
      </div>

      {/* Savings */}
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Tag size={20} className="text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-400 mb-3">Multi-Tenant Tasarruf</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-text-muted text-xs mb-1">Ayri rotalansaydi</p>
                <p className="text-lg font-bold text-text-primary">${(totalAmount + savings).toLocaleString('tr-TR')}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">Birlesik fatura</p>
                <p className="text-lg font-bold text-text-primary">${totalAmount.toLocaleString('tr-TR')}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">Tasarrufunuz</p>
                <p className="text-lg font-bold text-green-400">${savings.toLocaleString('tr-TR')} (%17)</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '17%' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Billing model info */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center">
            <CreditCard size={16} className="text-text-muted" />
          </div>
          <div>
            <p className="text-sm text-text-primary">Faturalama modeli: Teslimat basi ${unitPrice}</p>
            <p className="text-xs text-text-muted mt-0.5">Faturalama modelinizi degistirmek icin Bringo ile iletisime gecin.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
