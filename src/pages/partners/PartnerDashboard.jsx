import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Settings, BarChart3, TrendingUp, TrendingDown, Clock, DollarSign,
  Truck, Eye, Pause, Play, AlertTriangle, CheckCircle, ArrowRightLeft,
  X, Package, Activity, ChevronRight, Shield
} from 'lucide-react'

// ---- Mock Data ----

const SUMMARY = [
  {
    title: 'Aktarilan',
    value: '342',
    sub: '3 partner',
    icon: ArrowRightLeft,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Teslim Orani',
    value: '%94.8',
    sub: '+2.1%',
    subColor: 'text-green-600',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Ort. Sure',
    value: '38 dk',
    sub: '-5 dk',
    subColor: 'text-green-600',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    title: 'Maliyet',
    value: '\u20BA12,450',
    sub: '\u20BA36.4/sip',
    icon: DollarSign,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
]

const PARTNERS = [
  {
    id: 'trendyol-go',
    name: 'Trendyol Go',
    status: 'active',
    statusLabel: 'Aktif',
    orders: 156,
    deliveryRate: 96.2,
    avgTime: 35,
    costPerOrder: 32,
    sla: 98.5,
    warning: null,
  },
  {
    id: 'paket-taxi',
    name: 'Paket Taxi',
    status: 'active',
    statusLabel: 'Aktif',
    orders: 128,
    deliveryRate: 93.8,
    avgTime: 42,
    costPerOrder: 38,
    sla: 95.2,
    warning: null,
  },
  {
    id: 'getir-kurye',
    name: 'Getir Kurye',
    status: 'limited',
    statusLabel: 'Kisitli',
    orders: 58,
    deliveryRate: 91.4,
    avgTime: 48,
    costPerOrder: 45,
    sla: 88.7,
    warning: 'SLA dusuk',
  },
]

const ACTIVITY_FEED = [
  {
    id: 1,
    time: '14:32',
    partner: 'Trendyol Go',
    event: '12 siparis aktarildi',
    status: 'success',
  },
  {
    id: 2,
    time: '14:28',
    partner: 'Paket Taxi',
    event: 'Siparis BRN-3847 teslim edildi',
    status: 'success',
  },
  {
    id: 3,
    time: '14:25',
    partner: 'Getir Kurye',
    event: 'SLA uyarisi - ortalama sure 48dk',
    status: 'warning',
  },
  {
    id: 4,
    time: '14:20',
    partner: 'Trendyol Go',
    event: 'Siparis BRN-3842 teslim edildi',
    status: 'success',
  },
  {
    id: 5,
    time: '14:15',
    partner: 'Paket Taxi',
    event: '8 siparis aktarildi',
    status: 'success',
  },
  {
    id: 6,
    time: '14:10',
    partner: 'Getir Kurye',
    event: 'Siparis BRN-3839 gecikmeli',
    status: 'error',
  },
  {
    id: 7,
    time: '14:05',
    partner: 'Trendyol Go',
    event: 'Siparis BRN-3835 teslim edildi',
    status: 'success',
  },
  {
    id: 8,
    time: '13:58',
    partner: 'Paket Taxi',
    event: 'Siparis BRN-3831 teslim edildi',
    status: 'success',
  },
]

const STATUS_STYLES = {
  active: {
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
  limited: {
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  error: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
}

const FEED_DOT = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

// ---- Component ----

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const [showAddModal, setShowAddModal] = useState(false)
  const [partnerPaused, setPartnerPaused] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    apiUrl: '',
    apiKey: '',
  })

  const togglePause = (id) => {
    setPartnerPaused((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddPartner = (e) => {
    e.preventDefault()
    setShowAddModal(false)
    setFormData({ name: '', code: '', apiUrl: '', apiKey: '' })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            3PL Partner Yonetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Partner entegrasyonlari ve performans takibi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus size={16} /> Partner Ekle
          </button>
          <button
            onClick={() => navigate('/partners/rules')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Settings size={16} /> Kurallar
          </button>
          <button
            onClick={() => navigate('/partners/compare')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <BarChart3 size={16} /> Karsilastir
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {SUMMARY.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}
                >
                  <Icon size={18} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {card.value}
              </p>
              <p
                className={`text-xs mt-1 ${card.subColor || 'text-slate-400 dark:text-slate-500'}`}
              >
                {card.sub}
              </p>
            </div>
          )
        })}
      </div>

      {/* Active Partners */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Aktif Partnerler
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Activity size={12} /> Canli
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {PARTNERS.map((partner) => {
            const style = STATUS_STYLES[partner.status]
            const isPaused = partnerPaused[partner.id]
            const slaColor =
              partner.sla >= 95
                ? 'text-green-600'
                : partner.sla >= 90
                  ? 'text-yellow-600'
                  : 'text-red-600'
            const slaBg =
              partner.sla >= 95
                ? 'bg-green-50'
                : partner.sla >= 90
                  ? 'bg-yellow-50'
                  : 'bg-red-50'

            return (
              <div
                key={partner.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm ${isPaused ? 'border-slate-300 dark:border-slate-600 opacity-60' : 'border-slate-200 dark:border-slate-700'}`}
              >
                {/* Card Header */}
                <div className="p-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <Truck size={20} className="text-slate-600 dark:text-slate-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {partner.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${style.dot} ${!isPaused ? 'animate-pulse' : ''}`}
                          />
                          <span
                            className={`text-xs font-medium px-1.5 py-0.5 rounded border ${style.badge}`}
                          >
                            {isPaused ? 'Durduruldu' : partner.statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                    {partner.warning && !isPaused && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        <AlertTriangle size={12} />
                        {partner.warning}
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Siparis
                      </p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">
                        {partner.orders}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Teslim Orani
                      </p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1">
                        %{partner.deliveryRate}
                        {partner.deliveryRate >= 95 ? (
                          <TrendingUp size={14} className="text-green-500" />
                        ) : (
                          <TrendingDown size={14} className="text-amber-500" />
                        )}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Ort. Sure
                      </p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">
                        {partner.avgTime} dk
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Maliyet
                      </p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">
                        {'\u20BA'}{partner.costPerOrder}/sip
                      </p>
                    </div>
                  </div>

                  {/* SLA Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Shield size={12} /> SLA Uyumu
                      </span>
                      <span className={`text-xs font-bold ${slaColor}`}>
                        %{partner.sla}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${slaBg.replace('bg-', 'bg-').replace('50', '500')}`}
                        style={{
                          width: `${partner.sla}%`,
                          backgroundColor:
                            partner.sla >= 95
                              ? '#22c55e'
                              : partner.sla >= 90
                                ? '#eab308'
                                : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => navigate(`/partners/${partner.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Eye size={14} /> Detay
                  </button>
                  <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />
                  <button
                    onClick={() => navigate(`/partners/${partner.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Settings size={14} /> Ayarlar
                  </button>
                  <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />
                  <button
                    onClick={() => togglePause(partner.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors cursor-pointer ${isPaused ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                  >
                    {isPaused ? (
                      <>
                        <Play size={14} /> Devam
                      </>
                    ) : (
                      <>
                        <Pause size={14} /> Durdur
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            Canli Aktivite
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Canli
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {ACTIVITY_FEED.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${FEED_DOT[item.status]}`}
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono w-12 flex-shrink-0">
                  {item.time}
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 w-28 flex-shrink-0">
                  {item.partner}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                  {item.event}
                </span>
                <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Yeni Partner Ekle
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    3PL partner entegrasyon bilgilerini girin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddPartner} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Partner Adi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="ornegin: Yurticikargo Express"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Partner Kodu
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleFormChange('code', e.target.value)}
                  placeholder="ornegin: YURTICI-EXP"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  API URL
                </label>
                <input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) => handleFormChange('apiUrl', e.target.value)}
                  placeholder="https://api.partner.com/v1"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => handleFormChange('apiKey', e.target.value)}
                  placeholder="API anahtarinizi girin"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Iptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Plus size={16} /> Partner Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
