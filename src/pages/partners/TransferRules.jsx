import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Settings, Plus, Zap, MapPin, Clock, Rocket,
  Edit, Trash2, GripVertical, ToggleLeft, ToggleRight, X,
} from 'lucide-react'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PRIORITY_ORDER = [
  { id: 1, name: 'Bringo' },
  { id: 2, name: 'Trendyol' },
  { id: 3, name: 'Paket Taxi' },
  { id: 4, name: 'Getir' },
]

const PARTNER_OPTIONS = ['Trendyol Go', 'Getir Kurye', 'Paket Taxi', 'Bringo', 'En hızlı ETA veren partner']

const CONDITION_FIELDS = [
  { value: 'capacity', label: 'Kurye Kapasitesi' },
  { value: 'zone', label: 'Teslimat Bölgesi' },
  { value: 'time', label: 'Saat Aralığı' },
  { value: 'pending_orders', label: 'Bekleyen Sipariş' },
  { value: 'order_type', label: 'Sipariş Tipi' },
  { value: 'eta', label: 'Bringo ETA' },
]

const CONDITION_OPERATORS = [
  { value: 'lt', label: '< Küçüktür' },
  { value: 'gt', label: '> Büyüktür' },
  { value: 'eq', label: '= Eşittir' },
  { value: 'gte', label: '>= Büyük Eşit' },
  { value: 'lte', label: '<= Küçük Eşit' },
  { value: 'in', label: 'İçinde' },
]

const ZONE_OPTIONS = [
  'Esenyurt', 'Silivri', 'Çatalca', 'Beşiktaş', 'Kadıköy',
  'Üsküdar', 'Bakırköy', 'Beylikdüzü', 'Sarıyer', 'Maltepe',
]

const INITIAL_RULES = [
  {
    id: 1,
    name: 'Kapasite Aşımı',
    active: true,
    icon: 'zap',
    color: 'amber',
    condition: 'Bringo kurye kapasitesi < %20',
    action: 'Yeni siparişleri Trendyol Go\'ya aktar',
    extra: { label: 'Limit', value: 'Max 50 sipariş/saat' },
    triggerCount: 23,
  },
  {
    id: 2,
    name: 'Uzak Bölge',
    active: true,
    icon: 'mappin',
    color: 'blue',
    condition: 'Teslimat bölgesi = Esenyurt, Silivri, Çatalca',
    action: 'Direkt Getir Kurye\'ye aktar',
    extra: { label: 'Neden', value: 'Bringo bu bölgelerde operasyon yok' },
    triggerCount: 8,
  },
  {
    id: 3,
    name: 'Peak Saat Desteği',
    active: true,
    icon: 'clock',
    color: 'purple',
    condition: 'Saat 12:00-14:00 VE bekleyen sipariş > 100',
    action: '%30 siparişi Paket Taxi\'ye aktar',
    extra: null,
    triggerCount: 2,
  },
  {
    id: 4,
    name: 'Express Sipariş',
    active: true,
    icon: 'rocket',
    color: 'rose',
    condition: 'Sipariş tipi = Express VE Bringo ETA > 45 dk',
    action: 'En hızlı ETA veren partnere aktar',
    extra: null,
    triggerCount: 15,
  },
]

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const iconMap = {
  zap: Zap,
  mappin: MapPin,
  clock: Clock,
  rocket: Rocket,
}

const colorMap = {
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TransferRules() {
  const navigate = useNavigate()

  // General settings state
  const [autoTransfer, setAutoTransfer] = useState(true)
  const [fallbackEnabled, setFallbackEnabled] = useState(true)
  const [minSla, setMinSla] = useState(90)
  const [priorities] = useState(PRIORITY_ORDER)

  // Rules state
  const [rules, setRules] = useState(INITIAL_RULES)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [modalForm, setModalForm] = useState({
    name: '',
    conditions: [{ field: 'capacity', operator: 'lt', value: '' }],
    partner: PARTNER_OPTIONS[0],
    limit: '',
    zones: [],
    timeStart: '',
    timeEnd: '',
  })

  const resetModal = () => {
    setEditingRule(null)
    setModalForm({
      name: '',
      conditions: [{ field: 'capacity', operator: 'lt', value: '' }],
      partner: PARTNER_OPTIONS[0],
      limit: '',
      zones: [],
      timeStart: '',
      timeEnd: '',
    })
  }

  const openCreateModal = () => {
    resetModal()
    setModalOpen(true)
  }

  const openEditModal = (rule) => {
    setEditingRule(rule)
    setModalForm({
      name: rule.name,
      conditions: [{ field: 'capacity', operator: 'lt', value: '20' }],
      partner: PARTNER_OPTIONS[0],
      limit: '50',
      zones: ['Esenyurt'],
      timeStart: '12:00',
      timeEnd: '14:00',
    })
    setModalOpen(true)
  }

  const handleSaveRule = () => {
    if (editingRule) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id ? { ...r, name: modalForm.name } : r
        )
      )
    } else {
      const newRule = {
        id: Date.now(),
        name: modalForm.name || 'Yeni Kural',
        active: true,
        icon: 'zap',
        color: 'amber',
        condition: 'Özel koşul',
        action: `${modalForm.partner}'e aktar`,
        extra: modalForm.limit
          ? { label: 'Limit', value: `Max ${modalForm.limit} sipariş/saat` }
          : null,
        triggerCount: 0,
      }
      setRules((prev) => [...prev, newRule])
    }
    setModalOpen(false)
    resetModal()
  }

  const toggleRule = (id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    )
  }

  const deleteRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  const addCondition = () => {
    setModalForm((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { field: 'capacity', operator: 'lt', value: '' },
      ],
    }))
  }

  const updateCondition = (index, key, value) => {
    setModalForm((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c, i) =>
        i === index ? { ...c, [key]: value } : c
      ),
    }))
  }

  const removeCondition = (index) => {
    setModalForm((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }))
  }

  const toggleZone = (zone) => {
    setModalForm((prev) => ({
      ...prev,
      zones: prev.zones.includes(zone)
        ? prev.zones.filter((z) => z !== zone)
        : [...prev.zones, zone],
    }))
  }

  // ─── Toggle Component ────────────────────────────────────────────────────────

  const Toggle = ({ enabled, onToggle, label }) => (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 group"
    >
      {enabled ? (
        <ToggleRight className="w-8 h-8 text-green-500 group-hover:text-green-600 transition-colors" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-slate-300 group-hover:text-slate-400 transition-colors" />
      )}
      <span className="text-sm text-slate-700">{label}</span>
    </button>
  )

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/partners')}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Otomatik Aktarım Kuralları
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Partner aktarım kurallarını yönetin
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Kural
        </button>
      </div>

      {/* General Settings Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Genel Ayarlar
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <Toggle
              enabled={autoTransfer}
              onToggle={() => setAutoTransfer(!autoTransfer)}
              label={
                <span>
                  Otomatik aktarım:{' '}
                  <span
                    className={`font-semibold ${
                      autoTransfer ? 'text-green-600' : 'text-slate-400'
                    }`}
                  >
                    {autoTransfer ? 'Açık' : 'Kapalı'}
                  </span>
                </span>
              }
            />

            <Toggle
              enabled={fallbackEnabled}
              onToggle={() => setFallbackEnabled(!fallbackEnabled)}
              label="Fallback: Bringo kurye müsait değilse aktar"
            />

            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-700 whitespace-nowrap">
                Min SLA:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">%</span>
                <input
                  type="number"
                  value={minSla}
                  onChange={(e) => setMinSla(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-slate-500">
                  altı partnere aktarma
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Priority Order */}
          <div>
            <p className="text-sm font-medium text-slate-600 mb-3">
              Öncelik Sıralaması
            </p>
            <div className="space-y-2">
              {priorities.map((partner, index) => (
                <div
                  key={partner.id}
                  className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-200 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-slate-300 cursor-grab group-hover:text-slate-400 transition-colors" />
                  <span className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-xs font-bold text-slate-500 border border-slate-200">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {partner.name}
                  </span>
                  {index < priorities.length - 1 && (
                    <span className="text-slate-300 text-xs ml-auto">
                      &rarr;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Aktarım Kuralları
          </h2>
          <span className="text-sm text-slate-500">
            {rules.filter((r) => r.active).length} aktif /{' '}
            {rules.length} toplam
          </span>
        </div>

        {rules.map((rule) => {
          const IconComp = iconMap[rule.icon] || Zap
          const colors = colorMap[rule.color] || colorMap.amber

          return (
            <div
              key={rule.id}
              className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md ${
                rule.active
                  ? 'border-l-4 border-l-green-500'
                  : 'border-l-4 border-l-slate-300'
              }`}
            >
              <div className="p-5">
                {/* Rule Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}
                    >
                      <IconComp className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {rule.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${colors.badge}`}
                      >
                        Bugün: {rule.triggerCount} kez tetiklendi
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="p-1"
                      title={rule.active ? 'Devre dışı bırak' : 'Aktifleştir'}
                    >
                      {rule.active ? (
                        <ToggleRight className="w-7 h-7 text-green-500 hover:text-green-600 transition-colors" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-300 hover:text-slate-400 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Rule Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16 pt-0.5 shrink-0">
                      Koşul
                    </span>
                    <span className="text-sm text-slate-600">
                      {rule.condition}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16 pt-0.5 shrink-0">
                      Aksiyon
                    </span>
                    <span className="text-sm text-slate-700 font-medium">
                      {rule.action}
                    </span>
                  </div>
                  {rule.extra && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16 pt-0.5 shrink-0">
                        {rule.extra.label}
                      </span>
                      <span className="text-sm text-slate-600">
                        {rule.extra.value}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rule Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create / Edit Rule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setModalOpen(false)
              resetModal()
            }}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                {editingRule ? 'Kuralı Düzenle' : 'Yeni Kural Oluştur'}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false)
                  resetModal()
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Kural Adı */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kural Adı
                </label>
                <input
                  type="text"
                  value={modalForm.name}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Örn: Kapasite Aşımı Kuralı"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                />
              </div>

              {/* Koşullar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Koşullar
                </label>
                <div className="space-y-3">
                  {modalForm.conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={cond.field}
                        onChange={(e) =>
                          updateCondition(idx, 'field', e.target.value)
                        }
                        className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {CONDITION_FIELDS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={cond.operator}
                        onChange={(e) =>
                          updateCondition(idx, 'operator', e.target.value)
                        }
                        className="w-40 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {CONDITION_OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={cond.value}
                        onChange={(e) =>
                          updateCondition(idx, 'value', e.target.value)
                        }
                        placeholder="Değer"
                        className="w-28 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {modalForm.conditions.length > 1 && (
                        <button
                          onClick={() => removeCondition(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addCondition}
                  className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Koşul Ekle
                </button>
              </div>

              {/* Aksiyon */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Aksiyon
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Partner
                    </label>
                    <select
                      value={modalForm.partner}
                      onChange={(e) =>
                        setModalForm((prev) => ({
                          ...prev,
                          partner: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {PARTNER_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Limit (sipariş/saat)
                    </label>
                    <input
                      type="number"
                      value={modalForm.limit}
                      onChange={(e) =>
                        setModalForm((prev) => ({
                          ...prev,
                          limit: e.target.value,
                        }))
                      }
                      placeholder="Örn: 50"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Kısıtlar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Kısıtlar
                </label>

                {/* Bölge Multi-select */}
                <div className="mb-4">
                  <label className="block text-xs text-slate-500 mb-2">
                    Bölge
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ZONE_OPTIONS.map((zone) => (
                      <button
                        key={zone}
                        onClick={() => toggleZone(zone)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          modalForm.zones.includes(zone)
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saat Aralığı */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">
                    Saat Aralığı
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={modalForm.timeStart}
                      onChange={(e) =>
                        setModalForm((prev) => ({
                          ...prev,
                          timeStart: e.target.value,
                        }))
                      }
                      className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-slate-400">-</span>
                    <input
                      type="time"
                      value={modalForm.timeEnd}
                      onChange={(e) =>
                        setModalForm((prev) => ({
                          ...prev,
                          timeEnd: e.target.value,
                        }))
                      }
                      className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setModalOpen(false)
                  resetModal()
                }}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSaveRule}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
