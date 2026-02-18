import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Phone,
  MessageSquare,
  MapPin,
  Navigation,
  Battery,
  Smartphone,
  Clock,
  Package,
  Star,
  ChevronRight,
  Layers,
  X,
  Zap,
  Coffee,
  WifiOff,
  Users,
} from 'lucide-react'

// --- Mock Data Generation ---

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Emre', 'Burak', 'Serkan',
  'Cem', 'Okan', 'Deniz', 'Kaan', 'Tolga',
  'Baran', 'Arda', 'Yusuf', 'Murat', 'Ali',
  'Hakan', 'Onur', 'Uğur', 'Selim', 'Erdem',
]
const LAST_NAMES = [
  'Yılmaz', 'Demir', 'Çelik', 'Kaya', 'Şahin',
  'Öztürk', 'Aydın', 'Arslan', 'Doğan', 'Koç',
  'Kurt', 'Erdoğan', 'Polat', 'Özdemir', 'Aksoy',
  'Kaplan', 'Çetin', 'Korkmaz', 'Taş', 'Güneş',
]
const STATUSES = ['online', 'delivering', 'break', 'offline']
const STATUS_LABELS = {
  online: 'Müsait',
  delivering: 'Dağıtımda',
  break: 'Mola',
  offline: 'Offline',
}
const STATUS_COLORS = {
  online: 'bg-green-500',
  delivering: 'bg-blue-500',
  break: 'bg-yellow-500',
  offline: 'bg-gray-400',
}
const STATUS_TEXT_COLORS = {
  online: 'text-green-600',
  delivering: 'text-blue-600',
  break: 'text-yellow-600',
  offline: 'text-gray-500',
}
const STATUS_BG_LIGHT = {
  online: 'bg-green-100 text-green-700',
  delivering: 'bg-blue-100 text-blue-700',
  break: 'bg-yellow-100 text-yellow-700',
  offline: 'bg-gray-100 text-gray-500',
}

const DISTRICTS = [
  'Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Beyoğlu',
  'Bakırköy', 'Fatih', 'Ataşehir', 'Maltepe', 'Kartal',
  'Sarıyer', 'Pendik', 'Levent', 'Mecidiyeköy', 'Bostancı',
]
const STREETS = [
  'Bağdat Cad.', 'İstiklal Cad.', 'Abdi İpekçi Cad.', 'Nispetiye Cad.',
  'Rumeli Cad.', 'Halaskargazi Cad.', 'Barbaros Blv.', 'Fahrettin Kerim Gökay Cad.',
  'Moda Cad.', 'Bahariye Cad.',
]

const STOP_NAMES = [
  'Ataşehir Migros', 'Kadıköy Çarşı', 'Bostancı AVM', 'Acıbadem Sok.',
  'Fenerbahçe Stadyum', 'Suadiye Sahil', 'Erenköy Park', 'Göztepe Metro',
  'Kozyatağı Plaza', 'İçerenköy Sanayi', 'Ümraniye Center', 'Altunizade Köprüsü',
  'Çamlıca Tepesi', 'Kısıklı Yokuşu', 'Beylerbeyi Sarayı',
]

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateCouriers() {
  const rand = seededRandom(42)
  return Array.from({ length: 20 }, (_, i) => {
    const status = STATUSES[Math.floor(rand() * 4)]
    const stopsCount = 3 + Math.floor(rand() * 5)
    const completedStops = Math.floor(rand() * (stopsCount + 1))
    const stops = Array.from({ length: stopsCount }, (_, si) => ({
      id: `stop-${i}-${si}`,
      name: STOP_NAMES[Math.floor(rand() * STOP_NAMES.length)],
      address: `${STREETS[Math.floor(rand() * STREETS.length)]} No:${Math.floor(rand() * 120) + 1}`,
      status: si < completedStops ? 'completed' : si === completedStops ? 'active' : 'pending',
      eta: si >= completedStops ? `${Math.floor(rand() * 25) + 5} dk` : null,
    }))

    return {
      id: `courier-${i + 1}`,
      name: `${FIRST_NAMES[i]} ${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]}`,
      avatar: FIRST_NAMES[i].charAt(0) + LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)].charAt(0),
      status,
      x: 8 + rand() * 84,
      y: 8 + rand() * 84,
      district: DISTRICTS[Math.floor(rand() * DISTRICTS.length)],
      address: `${STREETS[Math.floor(rand() * STREETS.length)]} No:${Math.floor(rand() * 200) + 1}, ${DISTRICTS[Math.floor(rand() * DISTRICTS.length)]}`,
      ordersCount: status === 'offline' ? 0 : Math.floor(rand() * 8),
      deliveriesToday: Math.floor(rand() * 20) + 2,
      avgDeliveryTime: Math.floor(rand() * 20) + 15,
      rating: (3.5 + rand() * 1.5).toFixed(1),
      speed: status === 'offline' || status === 'break' ? 0 : Math.floor(rand() * 40) + 5,
      lastUpdate: `${Math.floor(rand() * 5) + 1} dk önce`,
      phone: `0532 ${Math.floor(rand() * 900 + 100)} ${Math.floor(rand() * 90 + 10)} ${Math.floor(rand() * 90 + 10)}`,
      platform: rand() > 0.5 ? 'iOS 17.2' : 'Android 14',
      appVersion: `v3.${Math.floor(rand() * 5)}.${Math.floor(rand() * 10)}`,
      battery: Math.floor(rand() * 80) + 15,
      stops,
    }
  })
}

const MOCK_COURIERS = generateCouriers()

// --- Component ---

export default function LiveTracking() {
  const [activeTab, setActiveTab] = useState('couriers')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCourier, setSelectedCourier] = useState(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [layers, setLayers] = useState({
    couriers: true,
    routes: true,
    traffic: false,
    heatmap: false,
  })
  const [layerMenuOpen, setLayerMenuOpen] = useState(false)
  const [courierPositions, setCourierPositions] = useState(
    MOCK_COURIERS.map((c) => ({ id: c.id, x: c.x, y: c.y }))
  )

  // Simulate small position changes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCourierPositions((prev) =>
        prev.map((p) => {
          const courier = MOCK_COURIERS.find((c) => c.id === p.id)
          if (!courier || courier.status === 'offline' || courier.status === 'break') return p
          return {
            ...p,
            x: Math.max(5, Math.min(95, p.x + (Math.random() - 0.5) * 1.2)),
            y: Math.max(5, Math.min(95, p.y + (Math.random() - 0.5) * 1.2)),
          }
        })
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Status counts
  const statusCounts = MOCK_COURIERS.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    },
    { online: 0, delivering: 0, break: 0, offline: 0 }
  )

  // Filtered couriers
  const filteredCouriers = MOCK_COURIERS.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCourierSelect = (courier) => {
    setSelectedCourier(courier)
    setDetailPanelOpen(true)
  }

  const handleCloseDetail = () => {
    setDetailPanelOpen(false)
    setTimeout(() => setSelectedCourier(null), 300)
  }

  const toggleLayer = (layer) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  // Generate route paths for SVG
  const getRoutePaths = () => {
    if (!layers.routes) return []
    return MOCK_COURIERS
      .filter((c) => c.status === 'delivering')
      .map((c) => {
        const pos = courierPositions.find((p) => p.id === c.id) || { x: c.x, y: c.y }
        const stops = c.stops.filter((s) => s.status !== 'completed')
        if (stops.length < 1) return null
        const points = [
          { x: pos.x, y: pos.y },
          ...stops.map((_, idx) => ({
            x: pos.x + (Math.sin(idx * 1.8 + parseInt(c.id.split('-')[1])) * 12),
            y: pos.y + (Math.cos(idx * 1.3 + parseInt(c.id.split('-')[1])) * 10),
          })),
        ]
        const pathStr = points
          .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
          .join(' ')
        return {
          id: c.id,
          path: pathStr,
          color: selectedCourier?.id === c.id ? '#3b82f6' : '#94a3b8',
        }
      })
      .filter(Boolean)
  }

  // Generate heatmap spots
  const getHeatmapSpots = () => {
    if (!layers.heatmap) return []
    const spots = []
    for (let i = 0; i < 12; i++) {
      spots.push({
        id: `heat-${i}`,
        x: 10 + ((i * 37 + 13) % 80),
        y: 10 + ((i * 29 + 7) % 80),
        size: 60 + (i % 4) * 30,
        opacity: 0.08 + (i % 3) * 0.04,
      })
    }
    return spots
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Canlı Takip</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {MOCK_COURIERS.length} kurye &middot; Son güncelleme: şimdi
          </p>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('couriers')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'couriers'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={15} />
              Kuryeler
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package size={15} />
              Siparişler
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kurye veya bölge ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          {[
            { key: 'all', label: 'Tümü', count: MOCK_COURIERS.length },
            { key: 'online', label: 'Müsait', count: statusCounts.online },
            { key: 'delivering', label: 'Dağıtımda', count: statusCounts.delivering },
            { key: 'break', label: 'Mola', count: statusCounts.break },
            { key: 'offline', label: 'Offline', count: statusCounts.offline },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === f.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Courier / Order List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'couriers' ? (
            filteredCouriers.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Sonuç bulunamadı
              </div>
            ) : (
              filteredCouriers.map((courier) => (
                <button
                  key={courier.id}
                  onClick={() => handleCourierSelect(courier)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    selectedCourier?.id === courier.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                      courier.status === 'online'
                        ? 'bg-green-500'
                        : courier.status === 'delivering'
                        ? 'bg-blue-500'
                        : courier.status === 'break'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  >
                    {courier.avatar}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {courier.name}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[courier.status]}`}
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500 truncate">{courier.district}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs font-medium ${STATUS_TEXT_COLORS[courier.status]}`}>
                        {STATUS_LABELS[courier.status]}
                      </span>
                      {courier.ordersCount > 0 && (
                        <span className="text-xs text-gray-400">
                          {courier.ordersCount} sipariş
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </button>
              ))
            )
          ) : (
            /* Orders Tab - simple order list derived from courier stops */
            MOCK_COURIERS
              .filter((c) => c.status === 'delivering')
              .flatMap((c) =>
                c.stops.map((stop) => ({
                  ...stop,
                  courierName: c.name,
                  courierId: c.id,
                }))
              )
              .filter(
                (order) =>
                  statusFilter === 'all' ||
                  (statusFilter === 'delivering' && order.status === 'active') ||
                  (statusFilter === 'online' && order.status === 'completed') ||
                  (statusFilter === 'break' && order.status === 'pending')
              )
              .filter(
                (order) =>
                  !searchQuery ||
                  order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  order.courierName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    const c = MOCK_COURIERS.find((cr) => cr.name === order.courierName)
                    if (c) handleCourierSelect(c)
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : order.status === 'active'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Package size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.name}</p>
                    <p className="text-xs text-gray-500 truncate">{order.address}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Kurye: {order.courierName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {order.status === 'completed'
                        ? 'Teslim'
                        : order.status === 'active'
                        ? 'Aktif'
                        : 'Bekliyor'}
                    </span>
                    {order.eta && (
                      <p className="text-xs text-gray-400 mt-1">{order.eta}</p>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* CENTER - MAP AREA */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map Grid Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#f1f5f9',
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Simulated streets / roads */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Horizontal roads */}
          <div className="absolute top-[20%] left-0 right-0 h-[3px] bg-gray-300 opacity-50" />
          <div className="absolute top-[45%] left-0 right-0 h-[4px] bg-gray-300 opacity-60" />
          <div className="absolute top-[70%] left-0 right-0 h-[3px] bg-gray-300 opacity-50" />
          {/* Vertical roads */}
          <div className="absolute left-[25%] top-0 bottom-0 w-[3px] bg-gray-300 opacity-50" />
          <div className="absolute left-[55%] top-0 bottom-0 w-[4px] bg-gray-300 opacity-60" />
          <div className="absolute left-[80%] top-0 bottom-0 w-[3px] bg-gray-300 opacity-50" />
          {/* Diagonal */}
          <div
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              background:
                'linear-gradient(135deg, transparent 40%, #cbd5e1 40.5%, #cbd5e1 41%, transparent 41.5%)',
            }}
          />
        </div>

        {/* Traffic overlay */}
        {layers.traffic && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[19%] left-[10%] w-[35%] h-[5px] rounded-full bg-red-400 opacity-40" />
            <div className="absolute top-[44%] left-[30%] w-[25%] h-[5px] rounded-full bg-yellow-400 opacity-40" />
            <div className="absolute top-[69%] left-[50%] w-[30%] h-[5px] rounded-full bg-green-400 opacity-40" />
            <div className="absolute left-[24%] top-[25%] w-[5px] h-[20%] rounded-full bg-yellow-400 opacity-40" />
            <div className="absolute left-[54%] top-[10%] w-[5px] h-[30%] rounded-full bg-red-400 opacity-40" />
            <div className="absolute left-[79%] top-[45%] w-[5px] h-[25%] rounded-full bg-green-400 opacity-40" />
          </div>
        )}

        {/* Heatmap overlay */}
        {layers.heatmap &&
          getHeatmapSpots().map((spot) => (
            <div
              key={spot.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: `${spot.size}px`,
                height: `${spot.size}px`,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, rgba(239,68,68,${spot.opacity + 0.12}) 0%, rgba(239,68,68,${spot.opacity}) 40%, transparent 70%)`,
              }}
            />
          ))}

        {/* Route Lines SVG */}
        {layers.routes && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            {getRoutePaths().map((route) => (
              <path
                key={route.id}
                d={route.path}
                fill="none"
                stroke={route.color}
                strokeWidth="0.3"
                strokeDasharray="1 0.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            ))}
          </svg>
        )}

        {/* Courier Markers */}
        {layers.couriers &&
          courierPositions.map((pos) => {
            const courier = MOCK_COURIERS.find((c) => c.id === pos.id)
            if (!courier) return null
            const isSelected = selectedCourier?.id === courier.id
            return (
              <button
                key={courier.id}
                onClick={() => handleCourierSelect(courier)}
                className="absolute group"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isSelected ? 50 : 10,
                }}
              >
                {/* Pulse ring for selected */}
                {isSelected && (
                  <span className="absolute inset-0 w-10 h-10 -m-2 rounded-full bg-blue-400 opacity-30 animate-ping" />
                )}
                {/* Outer ring */}
                <span
                  className={`block w-6 h-6 rounded-full border-2 border-white shadow-lg transition-transform ${
                    isSelected ? 'scale-150' : 'group-hover:scale-125'
                  } ${STATUS_COLORS[courier.status]}`}
                />
                {/* Tooltip on hover */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                  {courier.name}
                  <span className="block text-gray-400 text-[10px]">
                    {STATUS_LABELS[courier.status]} &middot; {courier.ordersCount} sipariş
                  </span>
                </span>
              </button>
            )
          })}

        {/* Map Controls - Top Left: Status Cards */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          {[
            {
              key: 'online',
              icon: <Zap size={14} />,
              label: 'Müsait',
              count: statusCounts.online,
              color: 'text-green-600',
              bg: 'bg-green-50 border-green-200',
            },
            {
              key: 'delivering',
              icon: <Navigation size={14} />,
              label: 'Dağıtımda',
              count: statusCounts.delivering,
              color: 'text-blue-600',
              bg: 'bg-blue-50 border-blue-200',
            },
            {
              key: 'break',
              icon: <Coffee size={14} />,
              label: 'Mola',
              count: statusCounts.break,
              color: 'text-yellow-600',
              bg: 'bg-yellow-50 border-yellow-200',
            },
            {
              key: 'offline',
              icon: <WifiOff size={14} />,
              label: 'Offline',
              count: statusCounts.offline,
              color: 'text-gray-500',
              bg: 'bg-gray-50 border-gray-200',
            },
          ].map((card) => (
            <div
              key={card.key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm ${card.bg}`}
            >
              <span className={card.color}>{card.icon}</span>
              <div>
                <p className={`text-lg font-bold leading-none ${card.color}`}>{card.count}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map Controls - Top Right: Layer Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <div className="relative">
            <button
              onClick={() => setLayerMenuOpen(!layerMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Layers size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Katmanlar</span>
            </button>
            {layerMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-30">
                {[
                  { key: 'couriers', label: 'Kuryeler', icon: <Users size={15} /> },
                  { key: 'routes', label: 'Rotalar', icon: <Navigation size={15} /> },
                  { key: 'traffic', label: 'Trafik', icon: <Zap size={15} /> },
                  { key: 'heatmap', label: 'Isı Haritası', icon: <MapPin size={15} /> },
                ].map((layer) => (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-gray-500">{layer.icon}</span>
                      <span className="text-sm text-gray-700">{layer.label}</span>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full transition-colors flex items-center ${
                        layers[layer.key] ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <span className="block w-4 h-4 bg-white rounded-full shadow-sm mx-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Center: Zoom hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">
              İstanbul &middot; {MOCK_COURIERS.length} kurye aktif
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Slide Over Detail */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          detailPanelOpen && selectedCourier ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedCourier && (
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">Kurye Detayı</h2>
              <button
                onClick={handleCloseDetail}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Courier Identity */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white ${STATUS_COLORS[selectedCourier.status]}`}
                  >
                    {selectedCourier.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{selectedCourier.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_BG_LIGHT[selectedCourier.status]}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[selectedCourier.status]}`}
                      />
                      {STATUS_LABELS[selectedCourier.status]}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                    <Phone size={15} />
                    Ara
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                    <MessageSquare size={15} />
                    Mesaj
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <Navigation size={15} />
                    Odakla
                  </button>
                </div>
              </div>

              {/* Today Stats */}
              <div className="px-5 py-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Bugünkü Performans
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Package size={18} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{selectedCourier.deliveriesToday}</p>
                    <p className="text-[10px] text-gray-500">Teslimat</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Clock size={18} className="mx-auto text-orange-500 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{selectedCourier.avgDeliveryTime}dk</p>
                    <p className="text-[10px] text-gray-500">Ort. Süre</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Star size={18} className="mx-auto text-yellow-500 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{selectedCourier.rating}</p>
                    <p className="text-[10px] text-gray-500">Puan</p>
                  </div>
                </div>
              </div>

              {/* Active Route */}
              <div className="px-5 py-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Aktif Rota ({selectedCourier.stops.length} durak)
                </h4>
                <div className="space-y-0">
                  {selectedCourier.stops.map((stop, idx) => (
                    <div key={stop.id} className="flex gap-3">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            stop.status === 'completed'
                              ? 'bg-green-500 text-white'
                              : stop.status === 'active'
                              ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {stop.status === 'completed' ? (
                            <span>&#10003;</span>
                          ) : stop.status === 'active' ? (
                            <span className="w-2 h-2 bg-white rounded-full" />
                          ) : (
                            <span className="w-2 h-2 bg-gray-400 rounded-full" />
                          )}
                        </div>
                        {idx < selectedCourier.stops.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 min-h-[24px] ${
                              stop.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-4 flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            stop.status === 'completed'
                              ? 'text-gray-400 line-through'
                              : stop.status === 'active'
                              ? 'text-blue-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {stop.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{stop.address}</p>
                        {stop.eta && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Clock size={10} />
                            {stop.eta}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Info */}
              <div className="px-5 py-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Konum Bilgisi
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800">{selectedCourier.address}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Son güncelleme: {selectedCourier.lastUpdate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Navigation size={16} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800">{selectedCourier.speed} km/s</p>
                      <p className="text-xs text-gray-400">Anlık hız</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div className="px-5 py-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Cihaz Bilgisi
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800">{selectedCourier.platform}</p>
                      <p className="text-xs text-gray-400">Uygulama {selectedCourier.appVersion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Battery size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-800">%{selectedCourier.battery}</p>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${
                            selectedCourier.battery > 50
                              ? 'bg-green-500'
                              : selectedCourier.battery > 20
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedCourier.battery}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay backdrop when detail panel is open on smaller screens */}
      {detailPanelOpen && selectedCourier && (
        <div
          className="fixed inset-0 bg-black/10 z-30 lg:hidden"
          onClick={handleCloseDetail}
        />
      )}
    </div>
  )
}
