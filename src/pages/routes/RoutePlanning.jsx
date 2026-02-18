import { useState } from 'react'
import {
  Search,
  Filter,
  GripVertical,
  Plus,
  Minus,
  MapPin,
  Navigation,
  Clock,
  Package,
  Truck,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Trash2,
  Save,
  Layers,
  Zap,
  ArrowRight,
  X,
  Route,
} from 'lucide-react'

// --- Mock Data ---
const DISTRICTS = [
  'Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Bakırköy',
  'Fatih', 'Beyoğlu', 'Ataşehir', 'Maltepe', 'Kartal',
  'Sarıyer', 'Pendik', 'Bağcılar', 'Zeytinburnu', 'Esenler',
]

const PRIORITIES = ['normal', 'yüksek', 'acil']

const COURIER_NAMES = [
  'Ahmet Yılmaz', 'Mehmet Demir', 'Ali Kaya', 'Hasan Çelik', 'Hüseyin Şahin',
  'Murat Öztürk', 'İbrahim Arslan', 'Mustafa Doğan', 'Emre Kılıç', 'Osman Aydın',
  'Burak Yıldız', 'Serkan Koç', 'Fatih Erdoğan', 'Kadir Özkan', 'Cem Aksoy',
]

const VEHICLE_TYPES = {
  'Ahmet Yılmaz': 'Motosiklet',
  'Mehmet Demir': 'Minivan',
  'Ali Kaya': 'Motosiklet',
  'Hasan Çelik': 'Kamyonet',
  'Hüseyin Şahin': 'Motosiklet',
  'Murat Öztürk': 'Minivan',
  'İbrahim Arslan': 'Motosiklet',
  'Mustafa Doğan': 'Kamyonet',
  'Emre Kılıç': 'Motosiklet',
  'Osman Aydın': 'Minivan',
  'Burak Yıldız': 'Motosiklet',
  'Serkan Koç': 'Kamyonet',
  'Fatih Erdoğan': 'Motosiklet',
  'Kadir Özkan': 'Minivan',
  'Cem Aksoy': 'Motosiklet',
}

const CUSTOMER_NAMES = [
  'Ayşe Korkmaz', 'Fatma Yıldırım', 'Zeynep Acar', 'Elif Polat', 'Seda Taş',
  'Merve Güneş', 'Deniz Özdemir', 'Gül Akın', 'Burcu Uzun', 'Sibel Çetin',
  'Kemal Bulut', 'Tuncay Aktaş', 'Volkan Sezer', 'Barış Coşkun', 'Tolga Karaca',
  'Derya Aslan', 'Pınar Güler', 'Canan Şen', 'Berna Tekin', 'Gökhan Bayrak',
  'Ufuk Ateş', 'Şule Tuncer', 'Yasemin Kurt', 'Levent Duman', 'Ece Başaran',
]

const STREETS = [
  'Bağdat Cad.', 'İstiklal Cad.', 'Moda Cad.', 'Bahariye Cad.', 'Halaskargazi Cad.',
  'Rumeli Cad.', 'Nispetiye Cad.', 'Teşvikiye Cad.', 'Abdi İpekçi Cad.', 'Valikonağı Cad.',
]

function generateOrders(count) {
  const orders = []
  for (let i = 1; i <= count; i++) {
    orders.push({
      id: `SIP-${String(1000 + i).padStart(4, '0')}`,
      customer: CUSTOMER_NAMES[(i - 1) % CUSTOMER_NAMES.length],
      district: DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)],
      address: `${STREETS[Math.floor(Math.random() * STREETS.length)]} No:${Math.floor(Math.random() * 120) + 1}`,
      amount: Math.floor(Math.random() * 900 + 100),
      priority: PRIORITIES[Math.floor(Math.random() * 3)],
      mapX: 80 + Math.random() * 640,
      mapY: 40 + Math.random() * 340,
    })
  }
  return orders
}

const INITIAL_ORDERS = generateOrders(25)

const INITIAL_ROUTE_IDS = INITIAL_ORDERS.slice(0, 8).map((o) => o.id)

const PRIORITY_CONFIG = {
  normal: { label: 'Normal', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  yüksek: { label: 'Yüksek', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  acil: { label: 'Acil', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
}

// --- Component ---
export default function RoutePlanning() {
  const [orders] = useState(INITIAL_ORDERS)
  const [routeOrderIds, setRouteOrderIds] = useState(INITIAL_ROUTE_IDS)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [selectedCourier, setSelectedCourier] = useState(COURIER_NAMES[0])
  const [optimizing, setOptimizing] = useState(false)
  const [optimized, setOptimized] = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const [layerPins, setLayerPins] = useState(true)
  const [layerRoute, setLayerRoute] = useState(true)
  const [layerCourier, setLayerCourier] = useState(true)
  const [stopStatuses, setStopStatuses] = useState(() => {
    const m = {}
    INITIAL_ROUTE_IDS.forEach((id, i) => {
      if (i < 2) m[id] = 'completed'
      else if (i === 2) m[id] = 'active'
      else m[id] = 'pending'
    })
    return m
  })

  // Derived
  const routeOrders = routeOrderIds.map((id) => orders.find((o) => o.id === id)).filter(Boolean)
  const unassignedOrders = orders.filter((o) => !routeOrderIds.includes(o.id))

  const filteredUnassigned = unassignedOrders.filter((o) => {
    const matchSearch =
      !searchTerm ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.district.toLowerCase().includes(searchTerm.toLowerCase())
    const matchDistrict = !filterDistrict || o.district === filterDistrict
    const matchPriority = !filterPriority || o.priority === filterPriority
    return matchSearch && matchDistrict && matchPriority
  })

  const availableDistricts = [...new Set(unassignedOrders.map((o) => o.district))].sort()

  // Stats
  const baseDistance = 12.5
  const baseTime = 105
  const distancePerStop = 1.6
  const timePerStop = 13
  const totalDistance = routeOrders.length > 0 ? (baseDistance + (routeOrders.length - 8) * distancePerStop).toFixed(1) : '0.0'
  const totalMinutes = routeOrders.length > 0 ? baseTime + (routeOrders.length - 8) * timePerStop : 0
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60
  const timeStr = totalHours > 0 ? `${totalHours}s ${Math.abs(totalMins)}dk` : `${totalMins}dk`

  // Optimization comparison
  const preOptDistance = (parseFloat(totalDistance) * 1.35).toFixed(1)
  const preOptTime = Math.round(totalMinutes * 1.35)
  const preOptHours = Math.floor(preOptTime / 60)
  const preOptMins = preOptTime % 60
  const preOptTimeStr = preOptHours > 0 ? `${preOptHours}s ${preOptMins}dk` : `${preOptMins}dk`

  // Actions
  const addToRoute = (orderId) => {
    if (!routeOrderIds.includes(orderId)) {
      setRouteOrderIds((prev) => [...prev, orderId])
      setStopStatuses((prev) => ({ ...prev, [orderId]: 'pending' }))
      setOptimized(false)
    }
  }

  const removeFromRoute = (orderId) => {
    setRouteOrderIds((prev) => prev.filter((id) => id !== orderId))
    setStopStatuses((prev) => {
      const copy = { ...prev }
      delete copy[orderId]
      return copy
    })
    setOptimized(false)
  }

  const moveStop = (index, direction) => {
    const newIds = [...routeOrderIds]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newIds.length) return
    ;[newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]]
    setRouteOrderIds(newIds)
    setOptimized(false)
  }

  const clearRoute = () => {
    setRouteOrderIds([])
    setStopStatuses({})
    setOptimized(false)
  }

  const handleOptimize = () => {
    setOptimizing(true)
    setTimeout(() => {
      // Simulate route optimization by shuffling
      const shuffled = [...routeOrderIds].sort(() => Math.random() - 0.5)
      setRouteOrderIds(shuffled)
      setOptimizing(false)
      setOptimized(true)
    }, 2000)
  }

  // Map helpers
  const courierPos = routeOrders.length > 2 ? { x: routeOrders[2].mapX, y: routeOrders[2].mapY } : { x: 400, y: 200 }

  const getStatusIcon = (status) => {
    if (status === 'completed') return <span className="text-emerald-500 font-bold text-sm">&#10003;</span>
    if (status === 'active') return <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse" />
    return <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 inline-block" />
  }

  const getEta = (index) => {
    const base = new Date()
    base.setHours(9, 0, 0, 0)
    base.setMinutes(base.getMinutes() + index * timePerStop)
    return `${String(base.getHours()).padStart(2, '0')}:${String(base.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ===== LEFT PANEL: UNASSIGNED ORDERS ===== */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Atanmamış Siparişler</h2>
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              {filteredUnassigned.length}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Sipariş, müşteri, bölge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-3 py-2 border-b border-slate-100 flex gap-2">
          <div className="relative flex-1">
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full appearance-none pl-2 pr-6 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
            >
              <option value="">Bölge</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative flex-1">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full appearance-none pl-2 pr-6 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
            >
              <option value="">Öncelik</option>
              <option value="normal">Normal</option>
              <option value="yüksek">Yüksek</option>
              <option value="acil">Acil</option>
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Order Cards */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {filteredUnassigned.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Sipariş bulunamadı
            </div>
          )}
          {filteredUnassigned.map((order) => {
            const pri = PRIORITY_CONFIG[order.priority]
            return (
              <div
                key={order.id}
                onClick={() => addToRoute(order.id)}
                className="group relative bg-white border border-slate-150 rounded-lg p-2.5 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all duration-150"
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0 group-hover:text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${pri.bg} ${pri.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                        {pri.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">{order.customer}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {order.district}
                      </span>
                      <span className="text-xs font-medium text-slate-700">{order.amount} &#8378;</span>
                    </div>
                  </div>
                </div>
                {/* Hover add button */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom count */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Toplam</span>
            <span className="font-semibold text-slate-700">{filteredUnassigned.length} sipariş</span>
          </div>
        </div>
      </div>

      {/* ===== CENTER PANEL: MAP SIMULATION ===== */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map grid background */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
            <pattern id="gridLg" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#f8fafc" />
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#gridLg)" />

          {/* Route polyline */}
          {layerRoute && routeOrders.length > 1 && (
            <polyline
              points={routeOrders.map((o) => `${o.mapX},${o.mapY}`).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 4"
              opacity="0.7"
            />
          )}

          {/* Unassigned pins */}
          {layerPins &&
            orders
              .filter((o) => !routeOrderIds.includes(o.id))
              .map((order) => (
                <g key={order.id} onClick={() => addToRoute(order.id)} className="cursor-pointer">
                  <circle cx={order.mapX} cy={order.mapY} r="10" fill="#ef4444" opacity="0.15" />
                  <circle cx={order.mapX} cy={order.mapY} r="6" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                </g>
              ))}

          {/* Route pins (blue, numbered) */}
          {layerPins &&
            routeOrders.map((order, i) => (
              <g key={order.id}>
                <circle cx={order.mapX} cy={order.mapY} r="14" fill="#3b82f6" opacity="0.15" />
                <circle cx={order.mapX} cy={order.mapY} r="10" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                <text x={order.mapX} y={order.mapY + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                  {i + 1}
                </text>
              </g>
            ))}

          {/* Courier marker */}
          {layerCourier && routeOrders.length > 0 && (
            <g>
              <circle cx={courierPos.x} cy={courierPos.y} r="20" fill="#8b5cf6" opacity="0.12">
                <animate attributeName="r" values="18;24;18" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={courierPos.x} cy={courierPos.y} r="8" fill="#8b5cf6" stroke="#fff" strokeWidth="2.5" />
              <polygon
                points={`${courierPos.x},${courierPos.y - 14} ${courierPos.x - 5},${courierPos.y - 6} ${courierPos.x + 5},${courierPos.y - 6}`}
                fill="#8b5cf6"
                stroke="#fff"
                strokeWidth="1"
              />
            </g>
          )}
        </svg>

        {/* Layer toggles */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="w-9 h-9 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>
          {showLayers && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-lg border border-slate-200 p-2 space-y-1">
              <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs text-slate-600">
                <input type="checkbox" checked={layerPins} onChange={(e) => setLayerPins(e.target.checked)} className="rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
                Sipariş Pinleri
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs text-slate-600">
                <input type="checkbox" checked={layerRoute} onChange={(e) => setLayerRoute(e.target.checked)} className="rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
                Rota Çizgisi
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs text-slate-600">
                <input type="checkbox" checked={layerCourier} onChange={(e) => setLayerCourier(e.target.checked)} className="rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
                Kurye Konumu
              </label>
            </div>
          )}
        </div>

        {/* Route stats overlay */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Route className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Mesafe</p>
                  <p className="text-sm font-bold text-slate-800">{totalDistance} km</p>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Süre</p>
                  <p className="text-sm font-bold text-slate-800">{timeStr}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Durak</p>
                  <p className="text-sm font-bold text-slate-800">{routeOrders.length}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <button
                onClick={handleOptimize}
                disabled={optimizing || routeOrders.length < 2}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {optimizing ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    Optimize Ediliyor...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Optimize Et
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Legend overlay */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow border border-slate-200 px-3 py-2">
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              Atanmamış
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              Rotada
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              Kurye
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL: ROUTE DETAIL ===== */}
      <div className="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-800">Rota Detay</h2>
          </div>
        </div>

        {/* Courier selector */}
        <div className="px-4 py-3 border-b border-slate-100 space-y-2">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Kurye</label>
          <select
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            className="w-full appearance-none px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
          >
            {COURIER_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Truck className="w-3.5 h-3.5" />
            <span>{VEHICLE_TYPES[selectedCourier] || 'Motosiklet'}</span>
          </div>
        </div>

        {/* Stops list */}
        <div className="px-4 py-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Duraklar</span>
            <span className="text-[11px] text-slate-400">{routeOrders.length} durak</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {routeOrders.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Navigation className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Henüz durak eklenmedi.</p>
              <p className="mt-1 text-slate-300">Soldan sipariş ekleyin</p>
            </div>
          )}
          {routeOrders.map((order, index) => {
            const status = stopStatuses[order.id] || 'pending'
            return (
              <div
                key={order.id}
                className={`relative rounded-lg border p-2.5 transition-all duration-150 ${
                  status === 'active'
                    ? 'border-blue-300 bg-blue-50/50 shadow-sm'
                    : status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-150 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : status === 'active'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(status)}
                        <span className="text-xs font-semibold text-slate-700">{order.id}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {getEta(index)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">{order.customer}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{order.address}, {order.district}</p>
                  </div>
                  <div className="flex flex-col gap-0.5 ml-1">
                    <button
                      onClick={() => moveStop(index, -1)}
                      disabled={index === 0}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveStop(index, 1)}
                      disabled={index === routeOrders.length - 1}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromRoute(order.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Route summary */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Mesafe</p>
              <p className="text-sm font-bold text-slate-700">{totalDistance} km</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Süre</p>
              <p className="text-sm font-bold text-slate-700">{timeStr}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Durak</p>
              <p className="text-sm font-bold text-slate-700">{routeOrders.length}</p>
            </div>
          </div>

          {/* Before/After Comparison */}
          {optimized && routeOrders.length > 1 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-700">Optimizasyon Sonucu</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Mesafe</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 line-through">{preOptDistance} km</span>
                    <ArrowRight className="w-3 h-3 text-emerald-500" />
                    <span className="font-semibold text-emerald-700">{totalDistance} km</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Süre</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 line-through">{preOptTimeStr}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-500" />
                    <span className="font-semibold text-emerald-700">{timeStr}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-200">
                  <span className="text-emerald-600 font-medium">Tasarruf</span>
                  <span className="font-bold text-emerald-700">%26 iyileşme</span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={clearRoute}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Temizle
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 shadow-sm transition-all">
              <Save className="w-3.5 h-3.5" />
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
