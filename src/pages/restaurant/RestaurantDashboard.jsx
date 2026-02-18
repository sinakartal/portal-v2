import { useState } from 'react'
import {
  Store,
  Package,
  Truck,
  Clock,
  UserPlus,
  MapPin,
  Phone,
  Send,
  Star,
  Crown,
  ChevronRight,
  X,
  Settings,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                         */
/* ------------------------------------------------------------------ */

const SUMMARY = [
  { label: 'Siparis', value: 87, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Kendi Kurye', value: 62, extra: '%71', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Havuza Atilan', value: 25, extra: '%29', icon: Send, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Ort. Teslimat', value: '28 dk', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const TABS = [
  { key: 'yeni', label: 'Yeni', count: 5 },
  { key: 'hazirlaniyor', label: 'Hazirlaniyor', count: 8 },
  { key: 'hazir', label: 'Hazir', count: 3 },
  { key: 'yolda', label: 'Yolda', count: 12 },
]

const ORDERS = {
  yeni: [
    { id: 'BRN-4521', customer: 'Ahmet Yilmaz', district: 'Kadikoy', amount: 245, timeAgo: '2 dk once' },
    { id: 'BRN-4522', customer: 'Zeynep Kara', district: 'Besiktas', amount: 180, timeAgo: '5 dk once' },
    { id: 'BRN-4523', customer: 'Murat Demir', district: 'Uskudar', amount: 320, timeAgo: '8 dk once' },
    { id: 'BRN-4524', customer: 'Selin Ozturk', district: 'Sisli', amount: 150, timeAgo: '12 dk once' },
    { id: 'BRN-4525', customer: 'Emre Can', district: 'Beyoglu', amount: 275, timeAgo: '15 dk once' },
  ],
  hazirlaniyor: [
    { id: 'BRN-4510', customer: 'Hakan Celik', district: 'Kadikoy', amount: 190, courier: 'Mehmet K.' },
    { id: 'BRN-4511', customer: 'Deniz Aksoy', district: 'Moda', amount: 310, courier: 'Ali V.' },
    { id: 'BRN-4512', customer: 'Burak Sahin', district: 'Besiktas', amount: 165, courier: null },
    { id: 'BRN-4513', customer: 'Elif Yildiz', district: 'Uskudar', amount: 420, courier: 'Veli T.' },
    { id: 'BRN-4514', customer: 'Caner Polat', district: 'Sisli', amount: 230, courier: null },
  ],
  hazir: [
    { id: 'BRN-4501', customer: 'Aysegul Korkmaz', district: 'Kadikoy', amount: 280, courierEta: 3 },
    { id: 'BRN-4502', customer: 'Tuncay Eren', district: 'Moda', amount: 195, courierEta: 7 },
    { id: 'BRN-4503', customer: 'Pinar Arslan', district: 'Besiktas', amount: 345, courierEta: 5 },
  ],
  yolda: [
    { id: 'BRN-4480', customer: 'Sinan Kartal', district: 'Kadikoy', amount: 210, eta: '12 dk' },
    { id: 'BRN-4481', customer: 'Merve Dogan', district: 'Uskudar', amount: 175, eta: '8 dk' },
    { id: 'BRN-4482', customer: 'Ozan Tekin', district: 'Besiktas', amount: 290, eta: '18 dk' },
    { id: 'BRN-4483', customer: 'Irem Basaran', district: 'Moda', amount: 360, eta: '5 dk' },
    { id: 'BRN-4484', customer: 'Kerem Aydin', district: 'Sisli', amount: 140, eta: '22 dk' },
  ],
}

const COURIERS = [
  { name: 'Mehmet K.', online: true, orders: 2, location: "Kadikoy'de" },
  { name: 'Ali V.', online: true, orders: 3, location: "Besiktas'ta" },
  { name: 'Veli T.', online: true, orders: 1, location: "Moda'da" },
  { name: 'Ayse D.', online: false, orders: 0, location: null },
]

const POOL_REASONS = [
  'Kuryem musait degil',
  'Bolge cok uzak',
  'Yogunluk cok fazla',
  'Diger',
]

const POOL_PARTNERS = [
  { name: 'Bringo', recommended: true, eta: '25 dk', price: 28 },
  { name: 'Trendyol Go', recommended: false, eta: '30 dk', price: 32 },
  { name: 'Paket Taxi', recommended: false, eta: '40 dk', price: 38 },
]

/* ------------------------------------------------------------------ */
/*  STATUS DOT HELPER                                                 */
/* ------------------------------------------------------------------ */

const dotColor = {
  yeni: 'bg-red-500',
  hazirlaniyor: 'bg-yellow-400',
  hazir: 'bg-green-500',
  yolda: 'bg-blue-500',
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState('yeni')
  const [showPoolModal, setShowPoolModal] = useState(false)
  const [poolOrder, setPoolOrder] = useState(null)
  const [poolReason, setPoolReason] = useState(POOL_REASONS[0])
  const [selectedPartner, setSelectedPartner] = useState('Bringo')

  const openPoolModal = (order) => {
    setPoolOrder(order)
    setPoolReason(POOL_REASONS[0])
    setSelectedPartner('Bringo')
    setShowPoolModal(true)
  }

  /* ---- RENDER ---------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* ---------- HEADER ----------------------------------------- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽</span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Lezzet Cafe</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Acik
          </span>
        </div>
        <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition">
          <Settings size={20} />
        </button>
      </div>

      {/* ---------- SUMMARY CARDS ---------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`${s.bg} rounded-lg p-3`}>
                <Icon size={22} className={s.color} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-800">
                  {s.value}
                  {s.extra && (
                    <span className="ml-1 text-sm font-medium text-slate-400">({s.extra})</span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ---------- LIVE ORDERS ------------------------------------ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-4 border-b border-slate-100 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isActive ? 'bg-white' : dotColor[tab.key]}`}
                />
                {tab.label} ({tab.count})
              </button>
            )
          })}
        </div>

        {/* Order cards */}
        <div className="divide-y divide-slate-100">
          {/* ---- YENI ---- */}
          {activeTab === 'yeni' &&
            ORDERS.yeni.map((o) => (
              <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dotColor.yeni} shrink-0`} />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {o.id}{' '}
                      <span className="font-normal text-slate-500">- {o.customer}</span>
                    </p>
                    <p className="text-sm text-slate-400">
                      {o.district} &middot; {o.amount} TL &middot; {o.timeAgo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition">
                    Onayla + Kurye Ata
                  </button>
                  <button
                    onClick={() => openPoolModal(o)}
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition"
                  >
                    Havuza At
                  </button>
                </div>
              </div>
            ))}

          {/* ---- HAZIRLANIYOR ---- */}
          {activeTab === 'hazirlaniyor' &&
            ORDERS.hazirlaniyor.map((o) => (
              <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dotColor.hazirlaniyor} shrink-0`} />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {o.id}{' '}
                      <span className="font-normal text-slate-500">- {o.customer}</span>
                    </p>
                    <p className="text-sm text-slate-400">
                      {o.district} &middot; {o.amount} TL
                    </p>
                  </div>
                </div>
                <div className="sm:shrink-0">
                  {o.courier ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <Truck size={14} />
                      {o.courier}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      <Send size={14} />
                      Bringo havuz
                    </span>
                  )}
                </div>
              </div>
            ))}

          {/* ---- HAZIR ---- */}
          {activeTab === 'hazir' &&
            ORDERS.hazir.map((o) => (
              <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dotColor.hazir} shrink-0`} />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {o.id}{' '}
                      <span className="font-normal text-slate-500">- {o.customer}</span>
                    </p>
                    <p className="text-sm text-slate-400">
                      {o.district} &middot; {o.amount} TL
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:shrink-0">
                  <Clock size={14} />
                  Kurye geliyor: {o.courierEta} dk
                </span>
              </div>
            ))}

          {/* ---- YOLDA ---- */}
          {activeTab === 'yolda' &&
            ORDERS.yolda.map((o) => (
              <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dotColor.yolda} shrink-0`} />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {o.id}{' '}
                      <span className="font-normal text-slate-500">- {o.customer}</span>
                    </p>
                    <p className="text-sm text-slate-400">
                      {o.district} &middot; {o.amount} TL
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 sm:shrink-0">
                  <MapPin size={14} />
                  Tahmini: {o.eta}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* ---------- MY COURIERS ------------------------------------ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Kendi Kuryelerim{' '}
            <span className="text-sm font-normal text-slate-400">(3 aktif)</span>
          </h2>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark transition">
            <UserPlus size={14} />
            Kurye Ekle
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {COURIERS.map((c) => (
            <div
              key={c.name}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {c.name}{' '}
                    {c.online ? (
                      <span className="text-xs text-emerald-600">🟢 Online</span>
                    ) : (
                      <span className="text-xs text-slate-400">⚫ Offline</span>
                    )}
                  </p>
                  {c.online && (
                    <p className="text-sm text-slate-400">
                      {c.orders} siparis &middot; {c.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                {c.online ? (
                  <>
                    <button className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 transition">
                      <MapPin size={16} />
                    </button>
                    <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition">
                      Ata
                    </button>
                  </>
                ) : (
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition">
                    <Phone size={14} />
                    Ara
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- PLAN BADGE ------------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 p-2">
            <Crown size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Ucretsiz Plan</p>
            <p className="text-xs text-slate-400">Aylik 50 havuz siparisi hakki</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md transition">
          <Star size={16} />
          Pro'ya Gec - 999 TL/ay
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ---------- POOL MODAL ------------------------------------- */}
      {showPoolModal && poolOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h3 className="text-lg font-semibold text-slate-800">Havuza At</h3>
              <button
                onClick={() => setShowPoolModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-4">
              {/* Order info */}
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="font-semibold text-slate-800">{poolOrder.id}</p>
                <p className="text-sm text-slate-500">
                  {poolOrder.customer} &middot; {poolOrder.district} &middot; {poolOrder.amount} TL
                </p>
              </div>

              {/* Reason */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Havuza Atma Nedeni</p>
                <div className="space-y-2">
                  {POOL_REASONS.map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"
                    >
                      <input
                        type="radio"
                        name="poolReason"
                        checked={poolReason === r}
                        onChange={() => setPoolReason(r)}
                        className="accent-primary"
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>

              {/* Partner options */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Partner Sec</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {POOL_PARTNERS.map((p) => {
                    const isSelected = selectedPartner === p.name
                    return (
                      <button
                        key={p.name}
                        onClick={() => setSelectedPartner(p.name)}
                        className={`relative rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {p.recommended && (
                          <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            onerilen
                          </span>
                        )}
                        <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-400 mt-1">ETA: {p.eta}</p>
                        <p className="text-sm font-bold text-slate-700 mt-1">{p.price} TL</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-4">
              <button
                onClick={() => setShowPoolModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Iptal
              </button>
              <button
                onClick={() => setShowPoolModal(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition"
              >
                <Send size={16} />
                Gonder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
