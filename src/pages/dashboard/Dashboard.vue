<!--
  Dashboard.vue - Ana Dashboard Sayfasi
  ======================================
  Admin panelinin ana sayfasidir. Dort sekmeden olusur:
  1. Genel Bakis: KPI kartlari, chartlar ve aktivite akisi
  2. Canli Harita: Kurye takip haritasi (Leaflet + SSE)
  3. Fiyatlama: Fiyat kurallari ve surge yonetimi
  4. Algoritma: Rotalama, dispatch, optimizasyon, partner ve servis durumu
-->
<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Package, MapPin, Truck, CheckCircle, Clock, Wallet, XCircle, Star,
  Plus, Route, FileText, AlertTriangle, Building2, CalendarDays, FolderKanban,
  LayoutDashboard, Navigation, Search, Layers, X, Zap, Coffee, WifiOff,
  Users, Activity, Bell, ChevronRight, Map as MapIcon,
  DollarSign, TrendingUp, RefreshCw, Cpu, Play, Globe, Sliders, Settings,
} from 'lucide-vue-next'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import {
  getStats, getOrders, getCouriers, getRoutes, getEventHistory, connectEventStream,
  getPricingRules, getSurgeStatus, addPricingRule, deletePricingRule,
  getAlgorithmConfig, updateAlgorithmConfig, runDispatch, runDispatchOsrm,
  batchReroute, getOsrmHealth, getVroomHealth,
} from '@/services/api'
import { ORDER_STATUSES } from '@/constants/menu'
import { timeAgo, formatCurrency, formatNumber } from '@/utils'
import { useCopilotContextStore } from '@/stores/copilotContext'

// Chart.js modullerini kaydet
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

const copilotCtx = useCopilotContextStore()

// Doughnut chart renk paleti
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#6b7280']

// ========== TAB (route-based) ==========
const ROUTE_TAB_MAP = {
  '/live-map': 'map',
  '/pricing': 'pricing',
  '/algorithm': 'algorithm',
}
// activeTab will be set after router is initialized below

// ========== FILTRE SECENEKLERI ==========

const PROJECTS = ['Tumu', 'Istanbul Ana Dagitim', 'Ankara Bolge', 'Izmir Sahil', 'Antalya Turizm', 'Bursa Sanayi', 'Express Teslimat', 'Gida Dagitim', 'E-Ticaret Lojistik']
const BRANCHES = ['Tumu', 'Kadikoy', 'Besiktas', 'Sisli', 'Uskudar', 'Bakirkoy', 'Atasehir', 'Maltepe', 'Pendik', 'Umraniye', 'Sariyer']

// ========== REACTIVE STATE ==========

const selectedProject = ref('Tumu')
const selectedBranch = ref('Tumu')
const selectedDateStart = ref(new Date().toISOString().split('T')[0])
const selectedDateEnd = ref(new Date().toISOString().split('T')[0])

const loading = ref(true)
const error = ref(null)
const kpis = ref(null)
const weeklyData = ref([])
const hourlyData = ref([])
const statusDist = ref([])
const activities = ref([])
const router = useRouter()
const currentRoute = router.currentRoute
const activeTab = computed(() => ROUTE_TAB_MAP[currentRoute.value.path] || 'overview')

// ========== HARITA STATE ==========

const mapCouriers = ref([])
const mapOrders = ref([])
const mapRouteList = ref([])
const mapEvents = ref([])
const mapTab = ref('couriers') // sol panel tab: couriers | orders | routes | events
const mapSearchQuery = ref('')
const mapStatusFilter = ref('all')
const mapSelectedCourier = ref(null)
const mapDetailOpen = ref(false)
const mapLayers = ref({ couriers: true, routes: true })
const mapLayerMenuOpen = ref(false)
const mapContainer = ref(null)
let leafletMap = null
const courierMarkers = {}
const routePolylines = {}

const MAP_STATUS_LABELS = { online: 'Musait', delivering: 'Dagitimda', break: 'Mola', offline: 'Offline' }
const MAP_STATUS_COLORS = { online: 'bg-green-500', delivering: 'bg-blue-500', break: 'bg-yellow-500', offline: 'bg-gray-400' }
const MAP_STATUS_TEXT = { online: 'text-green-600', delivering: 'text-blue-600', break: 'text-yellow-600', offline: 'text-gray-500' }
const MAP_STATUS_BG = { online: 'bg-green-100 text-green-700', delivering: 'bg-blue-100 text-blue-700', break: 'bg-yellow-100 text-yellow-700', offline: 'bg-gray-100 text-gray-500' }
const MARKER_COLORS = { online: '#22c55e', delivering: '#3b82f6', break: '#eab308', offline: '#9ca3af' }

const mapTabs = [
  { key: 'couriers', label: 'Kuryeler', icon: Users },
  { key: 'orders', label: 'Siparisler', icon: Package },
  { key: 'routes', label: 'Rotalar', icon: Route },
  { key: 'events', label: 'Olaylar', icon: Activity },
]

// ========== VERI YUKLEME ==========

function computeStatusDistribution(orders) {
  const counts = {}
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

async function loadDashboardData() {
  loading.value = true
  error.value = null
  try {
    const [statsRes, ordersRes, couriersRes, routesRes, eventsRes] = await Promise.all([
      getStats(),
      getOrders(),
      getCouriers(),
      getRoutes(),
      getEventHistory(20),
    ])

    if (statsRes.ok && statsRes.data) {
      const s = statsRes.data
      const o = s.orders || {}
      const r = s.routes || {}
      const c = s.couriers || {}
      const cancelPct = o.total > 0 ? parseFloat(((o.cancelled || 0) / o.total * 100).toFixed(1)) : 0
      kpis.value = {
        todayOrders: { value: o.total || 0, change: 12, sparkline: [45, 52, 38, 65, 55, 70, o.total || 60] },
        activeRoutes: { value: r.active || 0, change: 5, sparkline: [8, 12, 10, 15, 11, 14, r.active || 12] },
        onlineCouriers: { value: c.idle || 0, total: c.total || 0, change: 3, sparkline: [20, 18, 22, 25, 19, 24, c.idle || 22] },
        deliveryRate: { value: o.total > 0 ? Math.round((o.delivered || 0) / o.total * 100) : 0, change: 2, sparkline: [92, 94, 91, 95, 93, 96, 95] },
        avgDeliveryTime: { value: 32, change: -8, sparkline: [38, 35, 40, 33, 36, 34, 32] },
        dailyRevenue: { value: 24500, change: 15, sparkline: [18000, 21000, 19500, 22000, 20500, 23000, 24500] },
        cancelRate: { value: cancelPct, change: -2, sparkline: [4.5, 3.8, 5.2, 3.1, 4.0, 3.5, cancelPct || 3.2] },
        customerRating: { value: 4.6, change: 1, sparkline: [4.2, 4.3, 4.4, 4.5, 4.4, 4.5, 4.6] },
      }
    } else {
      kpis.value = {
        todayOrders: { value: 0, change: 0, sparkline: [0, 0, 0, 0, 0] },
        activeRoutes: { value: 0, change: 0, sparkline: [0, 0, 0, 0, 0] },
        onlineCouriers: { value: 0, total: 0, change: 0, sparkline: [0, 0, 0, 0, 0] },
        deliveryRate: { value: 0, change: 0, sparkline: [0, 0, 0, 0, 0] },
        avgDeliveryTime: { value: 0, change: 0, sparkline: [0, 0, 0, 0, 0] },
        dailyRevenue: { value: 0, change: 0, sparkline: [0, 0, 0, 0, 0] },
        cancelRate: { value: 0, change: 0, sparkline: [0, 0, 0, 0, 0] },
        customerRating: { value: '-', change: 0, sparkline: [0, 0, 0, 0, 0] },
      }
    }

    if (ordersRes.ok) {
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.orders || []
      statusDist.value = computeStatusDistribution(orders)
      activities.value = orders
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 15)
        .map(o => ({
          id: o.id,
          type: o.status === 'delivered' ? 'delivery' : o.status === 'cancelled' ? 'cancel' : 'order',
          title: o.status === 'delivered' ? 'Teslimat tamamlandi' : o.status === 'cancelled' ? 'Siparis iptal' : 'Siparis',
          desc: `${o.customerName || o.customer?.name || 'Musteri'} — ${o.origin?.name || o.originId || ''} (${o.status})`,
          time: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        }))
      mapOrders.value = orders
    }

    // Harita kurye verileri
    if (couriersRes.ok) {
      const raw = Array.isArray(couriersRes.data) ? couriersRes.data : couriersRes.data?.couriers || []
      mapCouriers.value = raw.map(normalizeCourier)
    }

    // Harita rota verileri
    if (routesRes.ok) {
      const raw = Array.isArray(routesRes.data) ? routesRes.data : routesRes.data?.routes || []
      mapRouteList.value = raw.map(normalizeRoute)
    }

    // Harita olay verileri
    if (eventsRes.ok) {
      const raw = Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data?.events || []
      mapEvents.value = raw.map(normalizeEvent)
    }

    if (!weeklyData.value.length) weeklyData.value = []
    if (!hourlyData.value.length) hourlyData.value = []
  } catch (err) {
    console.error('Dashboard veri hatasi:', err)
    error.value = 'Veri yuklenemedi'
  } finally {
    loading.value = false
  }
}

// ========== HARITA NORMALIZERS ==========

function normalizeCourier(c, i) {
  const name = c.name || `Kurye ${i + 1}`
  return {
    id: c.id || c.courierId || `courier-${i + 1}`,
    name,
    avatar: name.split(' ').map(w => w.charAt(0)).join('').slice(0, 2),
    status: c.status || 'offline',
    lat: c.lat ?? c.latitude ?? (40.95 + Math.random() * 0.12),
    lng: c.lng ?? c.longitude ?? (28.95 + Math.random() * 0.16),
    district: c.district || c.zone || '',
    address: c.address || '',
    ordersCount: c.ordersCount ?? c.activeOrders ?? 0,
    deliveriesToday: c.deliveriesToday ?? c.completedToday ?? 0,
    avgDeliveryTime: c.avgDeliveryTime ?? 20,
    rating: c.rating ?? '4.5',
    speed: c.speed ?? 0,
    lastUpdate: c.lastUpdate || 'simdi',
    platform: c.platform || 'Android 14',
    appVersion: c.appVersion || 'v3.0.0',
    battery: c.battery ?? 80,
    stops: c.stops || [],
  }
}

function normalizeRoute(r, i) {
  const totalStops = r.totalStops ?? r.stops?.length ?? 0
  const completedStops = r.completedStops ?? r.stops?.filter(s => s.status === 'completed').length ?? 0
  return {
    id: r.id || `route-${i + 1}`,
    name: r.name || `Rota ${i + 1}`,
    courierId: r.courierId || r.courier_id || '',
    courierName: r.courierName || r.courier_name || '',
    totalStops,
    completedStops,
    orderCount: r.orderCount ?? r.orders?.length ?? totalStops,
    progress: totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0,
  }
}

function normalizeEvent(e, i) {
  const type = e.type || e.event_type || 'unknown'
  let title = '', description = ''
  if (type === 'courier_location') {
    title = 'Konum guncellendi'
    description = e.courierName || e.courier_name || `Kurye #${e.courierId || e.courier_id || ''}`
  } else if (type === 'order_status') {
    title = `Siparis durumu: ${e.status || e.newStatus || ''}`
    description = e.orderName || e.order_name || `Siparis #${e.orderId || e.order_id || ''}`
  } else if (type === 'courier_status') {
    title = `Kurye durumu: ${MAP_STATUS_LABELS[e.status || e.newStatus] || e.status || ''}`
    description = e.courierName || e.courier_name || `Kurye #${e.courierId || e.courier_id || ''}`
  } else {
    title = e.title || type
    description = e.description || e.message || ''
  }
  const timestamp = e.timestamp || e.created_at || e.time || ''
  let timeStr = 'simdi'
  if (timestamp) {
    try { timeStr = new Date(timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) } catch { /* */ }
  }
  return { id: e.id || `event-${i}`, type, title, description, time: timeStr }
}

// ========== ROUTE COLORS ==========
const ROUTE_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#00bcd4', '#d35400', '#8e44ad',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#feca57',
  '#ff6348', '#7bed9f', '#70a1ff', '#eccc68', '#a29bfe',
  '#fd79a8', '#00cec9', '#6c5ce7', '#fab1a0', '#55efc4',
  '#0984e3', '#e17055', '#00b894', '#fdcb6e', '#636e72',
]
const MODE_COLORS = { instant: '#e74c3c', standard: '#3498db', flex: '#2ecc71', same_day: '#9b59b6' }

const mapSelectedRouteId = ref(null)
const orderMarkersMap = {}
const storeMarkersMap = {}

function createStoreIcon(brand) {
  const colors = { CepteSok: '#ff6b35', Migros: '#f7931e', A101: '#e74c3c' }
  const color = colors[brand] || '#334155'
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;border-radius:6px;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;color:#fff;">${brand.slice(0,2).toUpperCase()}</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18],
  })
}

function createStepIcon(stepNumber, color, type, opacity, isSelected) {
  const size = isSelected ? 26 : 22
  const fontSize = isSelected ? 11 : 10
  const borderRadius = type === 'pickup' ? '4px' : '50%'
  const label = type === 'pickup' ? `P${stepNumber}` : `${stepNumber}`
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:${borderRadius};background:${color};border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 ${isSelected?10:4}px ${color}80;display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;font-weight:bold;color:#fff;opacity:${opacity};font-family:monospace;">${label}</div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2],
  })
}

function createCourierIcon(status) {
  const color = status === 'online' ? '#2ecc71' : status === 'delivering' ? '#e74c3c' : status === 'break' ? '#f39c12' : '#95a5a6'
  return L.divIcon({
    className: '',
    html: `<div style="width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:16px solid ${color};filter:drop-shadow(0 0 4px rgba(0,0,0,0.5));"></div>`,
    iconSize: [18, 16], iconAnchor: [9, 16],
  })
}

// ========== LEAFLET MAP ==========

function initMap() {
  if (!mapContainer.value || leafletMap) return
  leafletMap = L.map(mapContainer.value, { center: [41.0082, 29.0291], zoom: 12, zoomControl: true })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(leafletMap)
  updateMapMarkers()
  updateRoutePolylines()
  fitMapBounds()
}

function destroyMap() {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
    Object.keys(courierMarkers).forEach(k => delete courierMarkers[k])
    Object.keys(routePolylines).forEach(k => delete routePolylines[k])
    Object.keys(orderMarkersMap).forEach(k => delete orderMarkersMap[k])
    Object.keys(storeMarkersMap).forEach(k => delete storeMarkersMap[k])
  }
}

function fitMapBounds() {
  if (!leafletMap) return
  const points = []
  mapCouriers.value.forEach(c => points.push([c.lat, c.lng]))
  mapOrders.value.forEach(o => {
    const lat = o.lat ?? o.deliveryLocation?.lat
    const lng = o.lng ?? o.deliveryLocation?.lng
    if (lat && lng) points.push([lat, lng])
  })
  if (points.length > 1) {
    try { leafletMap.fitBounds(L.latLngBounds(points), { padding: [30, 30] }) } catch {}
  }
}

function updateMapMarkers() {
  if (!leafletMap) return

  // Remove stale courier markers
  const currentIds = new Set(mapCouriers.value.map(c => c.id))
  Object.keys(courierMarkers).forEach(id => {
    if (!currentIds.has(id)) { leafletMap.removeLayer(courierMarkers[id]); delete courierMarkers[id] }
  })

  mapCouriers.value.forEach(courier => {
    const icon = createCourierIcon(courier.status)
    const popupHtml = `<div style="font-family:sans-serif;min-width:140px;font-size:12px">
      <strong style="font-size:13px">${courier.name}</strong><br/>
      <span style="color:${MARKER_COLORS[courier.status]||'#999'}">${MAP_STATUS_LABELS[courier.status]||courier.status}</span><br/>
      ${courier.hasCooler ? '<span style="color:#2563eb;font-size:10px">Sogutuculu</span><br/>' : ''}
      ${courier.ordersCount > 0 ? `<span>${courier.ordersCount} aktif siparis</span>` : ''}
    </div>`
    if (courierMarkers[courier.id]) {
      courierMarkers[courier.id].setLatLng([courier.lat, courier.lng])
      courierMarkers[courier.id].setIcon(icon)
    } else {
      const marker = L.marker([courier.lat, courier.lng], { icon })
      marker.bindPopup(popupHtml)
      marker.on('click', () => handleMapCourierSelect(courier))
      marker.addTo(leafletMap)
      courierMarkers[courier.id] = marker
    }
  })

  // Pending order markers
  Object.keys(orderMarkersMap).forEach(id => { leafletMap.removeLayer(orderMarkersMap[id]); delete orderMarkersMap[id] })
  mapOrders.value.forEach(order => {
    const lat = order.lat ?? order.deliveryLocation?.lat ?? (40.9 + Math.random() * 0.2)
    const lng = order.lng ?? order.deliveryLocation?.lng ?? (28.9 + Math.random() * 0.3)
    if (order.status !== 'pending' && order.status !== 'pool') return
    const mode = order.mode || 'standard'
    const mColor = MODE_COLORS[mode] || '#95a5a6'
    const marker = L.circleMarker([lat, lng], {
      radius: 5, color: order.isFrozen ? '#2980b9' : mColor,
      fillColor: order.isFrozen ? '#3498db' : mColor, fillOpacity: 0.7, weight: 1,
    })
    const popupHtml = `<div style="font-family:sans-serif;min-width:150px;font-size:12px">
      <strong>${order.customerName || order.name || 'Musteri'}</strong><br/>
      <span style="color:${mColor};font-weight:bold">${(mode).toUpperCase()}</span> | ${order.deci||'?'} desi<br/>
      ${order.isFrozen ? '<span style="color:#2563eb;font-weight:bold">FRIGO</span><br/>' : ''}
      Magaza: ${order.origin?.name || order.originId || '-'}
    </div>`
    marker.bindPopup(popupHtml)
    marker.addTo(leafletMap)
    orderMarkersMap[order.id] = marker
  })
}

function updateRoutePolylines() {
  if (!leafletMap) return
  Object.keys(routePolylines).forEach(id => {
    if (Array.isArray(routePolylines[id])) routePolylines[id].forEach(l => leafletMap.removeLayer(l))
    else leafletMap.removeLayer(routePolylines[id])
    delete routePolylines[id]
  })
  if (!mapLayers.value.routes) return

  mapCouriers.value.filter(c => c.status === 'delivering' && c.stops?.length > 0).forEach((courier, cIdx) => {
    const color = ROUTE_COLORS[cIdx % ROUTE_COLORS.length]
    const isSelected = mapSelectedCourier.value?.id === courier.id || mapSelectedRouteId.value === courier.id
    const opacity = mapSelectedCourier.value ? (isSelected ? 1 : 0.12) : 0.8
    const weight = isSelected ? 5 : 2.5

    const points = [[courier.lat, courier.lng]]
    const layers = []
    courier.stops.filter(s => s.status !== 'completed').forEach((stop, idx) => {
      const lat = stop.lat ?? (courier.lat + Math.sin(idx * 1.8) * 0.01)
      const lng = stop.lng ?? (courier.lng + Math.cos(idx * 1.3) * 0.015)
      points.push([lat, lng])

      // Step marker
      const type = stop.type || 'delivery'
      const stepNum = idx + 1
      const stepIcon = createStepIcon(stepNum, color, type, opacity, isSelected)
      const arrStr = stop.eta || ''
      const popupHtml = `<div style="font-family:sans-serif;min-width:160px;font-size:12px">
        <strong>Adim ${stepNum}: ${type==='pickup'?'TOPLAMA':'TESLIMAT'}</strong><hr style="margin:4px 0;border:none;border-top:1px solid #ddd"/>
        ${type==='pickup' ? `Magaza: <strong>${stop.name||'-'}</strong>` : `Musteri: <strong>${stop.name||'-'}</strong>`}
        ${arrStr ? `<br/>Varis: <strong>${arrStr}</strong>` : ''}
      </div>`
      const stepMarker = L.marker([lat, lng], { icon: stepIcon, zIndexOffset: isSelected ? 1000+idx : idx })
      stepMarker.bindPopup(popupHtml)
      stepMarker.addTo(leafletMap)
      layers.push(stepMarker)
    })

    if (points.length > 1) {
      const poly = L.polyline(points, { color, weight, opacity })
      poly.addTo(leafletMap)
      layers.push(poly)
    }
    routePolylines[courier.id] = layers
  })
}

function handleMapCourierSelect(courier) {
  if (!courier) return
  mapSelectedCourier.value = courier
  mapDetailOpen.value = true
  if (courierMarkers[courier.id] && leafletMap) courierMarkers[courier.id].openPopup()
  updateRoutePolylines()
}

function handleMapCloseDetail() {
  mapDetailOpen.value = false
  mapSelectedCourier.value = null
  updateRoutePolylines()
}

function focusCourierOnMap(courier) {
  if (!leafletMap || !courier) return
  leafletMap.setView([courier.lat, courier.lng], 16, { animate: true })
}

function toggleMapLayer(key) {
  mapLayers.value = { ...mapLayers.value, [key]: !mapLayers.value[key] }
}

function selectCourierByName(name) {
  const c = mapCouriers.value.find(cr => cr.name === name)
  if (c) handleMapCourierSelect(c)
}

function selectCourierById(id) {
  const c = mapCouriers.value.find(cr => cr.id === id)
  if (c) handleMapCourierSelect(c)
}

// Watch tab -> init/destroy map
watch(activeTab, async (tab, oldTab) => {
  if (tab === 'map') {
    await nextTick()
    initMap()
  } else if (oldTab === 'map') {
    destroyMap()
  }
})

// Watch map data changes
watch(mapCouriers, () => {
  if (mapLayers.value.couriers) updateMapMarkers()
  updateRoutePolylines()
}, { deep: true })

watch(() => mapLayers.value.couriers, (visible) => {
  Object.values(courierMarkers).forEach(marker => {
    if (visible) { if (!leafletMap?.hasLayer(marker)) marker.addTo(leafletMap) }
    else { if (leafletMap?.hasLayer(marker)) leafletMap.removeLayer(marker) }
  })
})

watch(() => mapLayers.value.routes, () => updateRoutePolylines())

// ========== HARITA COMPUTED ==========

const mapStatusCounts = computed(() =>
  mapCouriers.value.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc }, { online: 0, delivering: 0, break: 0, offline: 0 })
)

const mapStatusFilterOptions = computed(() => [
  { key: 'all', label: 'Tumu', count: mapCouriers.value.length },
  { key: 'online', label: 'Musait', count: mapStatusCounts.value.online },
  { key: 'delivering', label: 'Dagitimda', count: mapStatusCounts.value.delivering },
  { key: 'break', label: 'Mola', count: mapStatusCounts.value.break },
  { key: 'offline', label: 'Offline', count: mapStatusCounts.value.offline },
])

const filteredMapCouriers = computed(() =>
  mapCouriers.value.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(mapSearchQuery.value.toLowerCase()) || c.district.toLowerCase().includes(mapSearchQuery.value.toLowerCase())
    const matchStatus = mapStatusFilter.value === 'all' || c.status === mapStatusFilter.value
    return matchSearch && matchStatus
  })
)

const filteredMapOrders = computed(() => {
  const fromStops = mapCouriers.value.filter(c => c.status === 'delivering').flatMap(c => c.stops.map(s => ({ ...s, courierName: c.name, courierId: c.id })))
  const all = [...fromStops]
  const stopIds = new Set(fromStops.map(o => o.id))
  mapOrders.value.forEach(o => {
    if (!stopIds.has(o.id)) all.push({ id: o.id, name: o.name || o.customerName || `Siparis #${o.id}`, address: o.address || o.deliveryAddress || '', status: o.status || 'pending', eta: o.eta || '', courierName: o.courierName || o.courier_name || '' })
  })
  return all.filter(o => !mapSearchQuery.value || (o.name || '').toLowerCase().includes(mapSearchQuery.value.toLowerCase()) || (o.courierName || '').toLowerCase().includes(mapSearchQuery.value.toLowerCase()))
})

const mapStatusCards = computed(() => [
  { key: 'online', icon: Zap, label: 'Musait', count: mapStatusCounts.value.online, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { key: 'delivering', icon: Navigation, label: 'Dagitimda', count: mapStatusCounts.value.delivering, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { key: 'break', icon: Coffee, label: 'Mola', count: mapStatusCounts.value.break, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { key: 'offline', icon: WifiOff, label: 'Offline', count: mapStatusCounts.value.offline, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
])

const mapLayerOptions = [
  { key: 'couriers', label: 'Kuryeler', icon: Users },
  { key: 'routes', label: 'Rotalar', icon: Route },
]

// ========== FIYATLAMA STATE ==========

const pricingRules = ref([])
const surgeData = ref({ active: false, multiplier: 1.0, zones: [] })
const newRule = ref({ name: '', type: 'per_delivery', value: 0, condition: '' })
const showAddRule = ref(false)
const pricingParamsSaving = ref(false)

// ========== FIYATLAMA PARAMETRELERI ==========
const pricingParams = reactive({
  baseFee: 15,
  perKmFee: 4.5,
  perKmAfter: 3,
  maxKmFee: 60,
  // Mod bazli siparis basi ucretler
  modeFees: { instant: 35, standard: 20, flex: 12 },
  // Servis segmenti (Uber-style tiers)
  serviceTiers: {
    standard: { label: 'Standart', multiplier: 1.0, courierMinScore: 0, description: 'Normal teslimat' },
    premium: { label: 'Premium', multiplier: 1.4, courierMinScore: 7, description: 'Deneyimli kuryeler, oncelikli rotalama' },
    vip: { label: 'VIP', multiplier: 2.0, courierMinScore: 9, description: 'En iyi kuryeler, garantili hiz' },
  },
  // Proje bazli ek ucretler
  projectSurcharges: {
    'Istanbul Ana Dagitim': 0,
    'Ankara Bolge': 3,
    'Izmir Sahil': 2,
    'Antalya Turizm': 5,
    'Bursa Sanayi': 2,
    'Express Teslimat': 8,
    'Gida Dagitim': 4,
    'E-Ticaret Lojistik': 1,
  },
  zoneMultipliers: { A: 1.0, B: 1.2, C: 1.5, D: 2.0 },
  peakHourMultiplier: 1.3,
  nightMultiplier: 1.5,
  weekendMultiplier: 1.15,
  heavyPackageFee: 8,
  heavyThreshold: 10,
  frozenFee: 5,
  expressMultiplier: 1.8,
  surgeEnabled: true,
  surgeThreshold: 30,
  surgeMax: 2.5,
  surgeDamping: 0.5,
})

async function savePricingParams() {
  pricingParamsSaving.value = true
  try {
    await updateAlgorithmConfig({ pricingParams: { ...pricingParams, zoneMultipliers: { ...pricingParams.zoneMultipliers } } })
  } catch { /* best-effort */ }
  finally { pricingParamsSaving.value = false }
}

const ruleTypeLabels = {
  per_delivery: 'Teslimat Basi',
  surcharge: 'Ek Ucret',
  multiplier: 'Carpan',
  flat: 'Sabit',
}

async function loadPricingRules() {
  const res = await getPricingRules()
  if (res.ok && res.data) {
    pricingRules.value = Array.isArray(res.data) ? res.data : res.data.rules || []
  }
  if (pricingRules.value.length === 0) {
    pricingRules.value = [
      { _id: 'rule-1', name: 'Standart Teslimat', type: 'per_delivery', value: 28, condition: 'mesafe < 5km', isActive: true },
      { _id: 'rule-2', name: 'Uzun Mesafe', type: 'per_delivery', value: 42, condition: 'mesafe >= 5km', isActive: true },
      { _id: 'rule-3', name: 'Gece Ek Ucreti', type: 'surcharge', value: 8, condition: 'saat >= 22:00', isActive: true },
      { _id: 'rule-4', name: 'Hafta Sonu', type: 'multiplier', value: 1.3, condition: 'cumartesi/pazar', isActive: false },
      { _id: 'rule-5', name: 'Agir Paket', type: 'surcharge', value: 15, condition: 'agirlik > 10kg', isActive: true },
    ]
  }
}

async function loadSurgeData() {
  const res = await getSurgeStatus()
  if (res.ok && res.data) {
    surgeData.value = res.data
  } else {
    surgeData.value = {
      active: true, multiplier: 1.5, reason: 'Yuksek talep - oglen saatleri',
      zones: [
        { name: 'Kadikoy', multiplier: 1.8, orderCount: 45 },
        { name: 'Besiktas', multiplier: 1.5, orderCount: 32 },
        { name: 'Sisli', multiplier: 1.3, orderCount: 28 },
        { name: 'Uskudar', multiplier: 1.0, orderCount: 15 },
      ],
    }
  }
}

async function handleAddRule() {
  try {
    const res = await addPricingRule(newRule.value)
    if (res.ok && res.data?._id) {
      pricingRules.value.push({ ...newRule.value, _id: res.data._id, isActive: true })
    } else {
      pricingRules.value.push({ ...newRule.value, _id: `rule-${Date.now()}`, isActive: true })
    }
  } catch {
    pricingRules.value.push({ ...newRule.value, _id: `rule-${Date.now()}`, isActive: true })
  }
  newRule.value = { name: '', type: 'per_delivery', value: 0, condition: '' }
  showAddRule.value = false
}

async function handleDeleteRule(ruleId) {
  pricingRules.value = pricingRules.value.filter(r => r._id !== ruleId)
  try { await deletePricingRule(ruleId) } catch { /* silently fail */ }
}

async function toggleRule(rule) {
  rule.isActive = !rule.isActive
  try { await addPricingRule({ ...rule }) } catch { /* persist best-effort */ }
}

// ========== ALGORITMA STATE ==========

const algoViewMode = ref('simulator') // 'simulator' | 'algorithms' | 'config'

// ========== ALGORITMA SECIMI ==========
const ALGORITHMS = [
  { id: 'hungarian', name: 'Hungarian Algorithm', category: 'Atama', complexity: 'Orta', icon: '🇭🇺',
    description: 'Bipartite matching ile optimal kurye-siparis eslemesi. O(n³) karmasiklik.',
    companies: 'Uber, Grab, GoJek',
    params: { maxDistance: 15, costWeight: 0.6, timeWeight: 0.4 },
    bestFor: 'Az sayıda kurye ve sipariş ile optimal eşleme' },
  { id: 'greedy_nearest', name: 'Greedy Nearest Neighbor', category: 'Atama', complexity: 'Basit', icon: '📍',
    description: 'Her siparis icin en yakin musait kuryeyi ata. Hizli ama suboptimal.',
    companies: 'Tookan, Shipday',
    params: { maxDistance: 20 },
    bestFor: 'Hızlı atama gereken yüksek hacimli operasyonlar' },
  { id: 'auction', name: 'Auction-Based Assignment', category: 'Atama', complexity: 'Orta', icon: '🔨',
    description: 'Kuryeler siparis icin "teklif" verir, en uygun teklif kazanir.',
    companies: 'DoorDash, Deliveroo',
    params: { bidTimeout: 30, minBidders: 3 },
    bestFor: 'Kurye tercihlerini dikkate alan dağıtım' },
  { id: 'clarke_wright', name: 'Clarke-Wright Savings', category: 'Rotalama', complexity: 'Orta', icon: '💰',
    description: 'Tasarruf matrisine gore rota birlestirme. Klasik VRP cozumu.',
    companies: 'UPS, FedEx, Bringg',
    params: { savingsThreshold: 0.1, maxRouteSize: 15 },
    bestFor: 'Çok duraklı rota planlaması' },
  { id: 'or_tools_vrp', name: 'Google OR-Tools VRP', category: 'Rotalama', complexity: 'Karmasik', icon: '🔧',
    description: 'Google constraint programming solver. CVRPTW (kapasiteli + zaman pencereli).',
    companies: 'OptimoRoute, Routific, Circuit',
    params: { timeLimit: 30, vehicleCapacity: 20, maxRouteTime: 480 },
    bestFor: 'Karmaşık kısıtlarla optimal rota çözümü' },
  { id: 'vroom_solver', name: 'VROOM Solver', category: 'Rotalama', complexity: 'Karmasik', icon: '⚡',
    description: 'Acik kaynak VRP solver. Hizli heuristik + lokal arama. OSRM entegreli.',
    companies: 'Bringo, Open-source projeler',
    params: { explorationLevel: 5, threads: 4 },
    bestFor: 'Hızlı çözüm gereken büyük ölçekli VRP' },
  { id: '2opt', name: '2-Opt Local Search', category: 'Optimizasyon', complexity: 'Basit', icon: '🔄',
    description: 'Mevcut rotada 2 kenar degistirerek iyilestirme. Post-optimization icin ideal.',
    companies: 'LogiNext, Track-POD',
    params: { maxIterations: 1000, improvementThreshold: 0.01 },
    bestFor: 'Mevcut rotaları hızlı iyileştirme' },
  { id: '3opt', name: '3-Opt / Or-Opt', category: 'Optimizasyon', complexity: 'Orta', icon: '🔃',
    description: '3 kenar degistirme + segment tasima. 2-opt\'tan daha iyi sonuc, daha yavas.',
    companies: 'Locus.sh, FarEye',
    params: { maxIterations: 500 },
    bestFor: 'Derin optimizasyon gereken durumlar' },
  { id: 'simulated_annealing', name: 'Simulated Annealing', category: 'Optimizasyon', complexity: 'Orta', icon: '🌡',
    description: 'Metalurji benzeri sicaklik tabanlı arama. Lokal optimumdan kacabilir.',
    companies: 'Meituan, JD Logistics',
    params: { initialTemp: 1000, coolingRate: 0.995, minTemp: 1 },
    bestFor: 'Global optimuma yakın çözümler' },
  { id: 'genetic', name: 'Genetic Algorithm', category: 'Optimizasyon', complexity: 'Karmasik', icon: '🧬',
    description: 'Evrimsel hesaplama. Populasyon, crossover, mutasyon ile cozum arama.',
    companies: 'Cainiao (Alibaba), iFood',
    params: { populationSize: 100, generations: 500, mutationRate: 0.1, crossoverRate: 0.8 },
    bestFor: 'Çok amaçlı optimizasyon problemleri' },
  { id: 'ant_colony', name: 'Ant Colony Optimization', category: 'Optimizasyon', complexity: 'Karmasik', icon: '🐜',
    description: 'Karinca kolonisi feromon tabanlı yol bulma. TSP/VRP icin etkili.',
    companies: 'Swiggy, Zomato',
    params: { antCount: 50, evaporationRate: 0.5, alpha: 1, beta: 2 },
    bestFor: 'Dinamik ortamlarda sürekli optimizasyon' },
  { id: 'rl_dqn', name: 'Deep Q-Network (DQN)', category: 'Makine Ogrenmesi', complexity: 'Karmasik', icon: '🤖',
    description: 'Reinforcement learning ile dinamik dispatch. State-action-reward modeli.',
    companies: 'Meituan, DiDi',
    params: { learningRate: 0.001, gamma: 0.99, epsilon: 0.1, batchSize: 64 },
    bestFor: 'Dinamik sipariş akışında gerçek zamanlı karar' },
  { id: 'rl_ppo', name: 'PPO (Proximal Policy Optimization)', category: 'Makine Ogrenmesi', complexity: 'Karmasik', icon: '🧠',
    description: 'Policy gradient RL. DQN\'den daha stabil egitim. Continuous action space.',
    companies: 'Uber Eats, Grab',
    params: { learningRate: 0.0003, clipRange: 0.2, epochs: 10, gamma: 0.99 },
    bestFor: 'Sürekli öğrenen dispatch politikası' },
  { id: 'demand_prediction', name: 'Demand Prediction (LSTM)', category: 'Makine Ogrenmesi', complexity: 'Karmasik', icon: '📊',
    description: 'LSTM ile bolge bazli talep tahmini. Proaktif kurye konumlandirma.',
    companies: 'Getir, Glovo, Rappi',
    params: { lookbackHours: 24, predictionHorizon: 60, zones: 10 },
    bestFor: 'Talep tahmini ve proaktif kurye dağılımı' },
  { id: 'eta_ml', name: 'ML-Based ETA Prediction', category: 'Makine Ogrenmesi', complexity: 'Orta', icon: '⏱',
    description: 'GBM/XGBoost ile teslimat suresi tahmini. Trafik, hava durumu, gun/saat feature.',
    companies: 'Bolt Food, Wolt, Yemeksepeti',
    params: { modelType: 'xgboost' },
    bestFor: 'Doğru ETA tahmini ve müşteri memnuniyeti' },
  { id: 'zone_cascade', name: 'Zone-Based Cascade', category: 'Hibrit', complexity: 'Orta', icon: '🎯',
    description: 'Bolge bazli filtreleme + cascade teklif. Oncelik ve zaman limiti ile.',
    companies: 'Bringo, Lalamove, Getir',
    params: { maxCascadeSteps: 5, offerTimeout: 45, zonePriority: true },
    bestFor: 'Bölge bazlı operasyonlarda hızlı atama' },
  { id: 'batch_dispatch', name: 'Batch + Optimize', category: 'Hibrit', complexity: 'Orta', icon: '📦',
    description: 'Siparisleri zaman penceresinde biriktir, toplu optimize et, sonra dagit.',
    companies: 'DoorDash, Deliveroo, Glovo',
    params: { batchWindowSec: 120, minBatchSize: 5, maxBatchSize: 30 },
    bestFor: 'Yüksek hacimli dönemlerde verimli gruplama' },
  { id: 'multi_objective', name: 'Multi-Objective Optimizer', category: 'Hibrit', complexity: 'Karmasik', icon: '⚖',
    description: 'Maliyet + sure + memnuniyet + kurye yuku dengeleme. Pareto-optimal cozumler.',
    companies: 'Locus.sh, FarEye, Dispatch Science',
    params: { costWeight: 0.3, timeWeight: 0.3, satisfactionWeight: 0.2, balanceWeight: 0.2 },
    bestFor: 'Birden fazla hedefi dengeleyen çok boyutlu optimizasyon' },
  { id: 'bringo_adaptive', name: 'Bringo Adaptive AI', category: 'Hibrit', complexity: 'Karmasik', icon: '🧪',
    description: 'Gecmis simulasyonlardan ogrenen adaptif algoritma. Her siparis profiline ozel agirliklar gelistirir.',
    companies: 'Bringo (Ozel)',
    params: {},
    bestFor: 'Zamanla ogrenerek en verimli stratejiyi otomatik secen sistem' },
]

const ALGO_CATEGORIES = ['Atama', 'Rotalama', 'Optimizasyon', 'Makine Ogrenmesi', 'Hibrit']

// Load saved selections from localStorage
const savedAlgos = (() => {
  try { return JSON.parse(localStorage.getItem('bringo_selected_algorithms') || 'null') } catch { return null }
})()
const savedParams = (() => {
  try { return JSON.parse(localStorage.getItem('bringo_algo_params') || 'null') } catch { return null }
})()

const selectedAlgorithms = reactive(savedAlgos || {
  assignment: 'hungarian',
  routing: 'clarke_wright',
  optimization: '2opt',
  ml: null,
  hybrid: null,
})

// Editable params for selected algorithms (deep copy on select)
const algoParamEdits = reactive(savedParams || {})

function getAlgoById(id) { return ALGORITHMS.find(a => a.id === id) || null }
function getCategoryAlgos(cat) { return ALGORITHMS.filter(a => a.category === cat) }

function persistAlgoSelection() {
  localStorage.setItem('bringo_selected_algorithms', JSON.stringify({ ...selectedAlgorithms }))
  localStorage.setItem('bringo_algo_params', JSON.stringify({ ...algoParamEdits }))
}

function selectAlgorithm(role, id) {
  selectedAlgorithms[role] = id
  const algo = getAlgoById(id)
  if (algo) algoParamEdits[id] = JSON.parse(JSON.stringify(algo.params))
  persistAlgoSelection()
}

function applySuggestion(combo) {
  if (combo.assignment) {
    const hybridIds = ['zone_cascade', 'batch_dispatch', 'multi_objective']
    if (hybridIds.includes(combo.assignment)) {
      selectAlgorithm('hybrid', combo.assignment)
    } else {
      selectedAlgorithms.hybrid = null
      selectAlgorithm('assignment', combo.assignment)
    }
  }
  if (combo.routing) selectAlgorithm('routing', combo.routing)
  if (combo.optimization) selectAlgorithm('optimization', combo.optimization)
  // Re-run simulation with new algos
  // Reset orders to pending first
  algoSimOrders.value = algoSimOrders.value.map(o => ({ ...o, status: 'pending', routeId: null }))
  algoSimRoutes.value = []
  nextTick(() => simulateRoutes())
}

function complexityColor(c) {
  if (c === 'Basit') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (c === 'Orta') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

function roleName(role) {
  const map = { assignment: 'Atama', routing: 'Rotalama', optimization: 'Optimizasyon', ml: 'ML', hybrid: 'Hibrit' }
  return map[role] || role
}

function categoryRole(cat) {
  if (cat === 'Atama') return 'assignment'
  if (cat === 'Rotalama') return 'routing'
  if (cat === 'Optimizasyon') return 'optimization'
  if (cat === 'Makine Ogrenmesi') return 'ml'
  if (cat === 'Hibrit') return 'hybrid'
  return null
}

const pipelineSaving = ref(false)
async function savePipeline() {
  pipelineSaving.value = true
  try {
    await updateAlgorithmConfig({ selectedAlgorithms: { ...selectedAlgorithms }, algoParamEdits: JSON.parse(JSON.stringify(algoParamEdits)) })
    persistAlgoSelection()
    showAlgoToast('Pipeline kaydedildi')
  } catch { showAlgoToast('Kaydetme hatasi', 'error') }
  finally { pipelineSaving.value = false }
}

// Test order modal
const showTestOrderModal = ref(false)
const testOrderForm = reactive({
  customerName: '', address: '', mode: 'standard', deci: 10, frozen: false, deadlineMin: 90,
})
function openTestOrderModal() {
  testOrderForm.customerName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]
  testOrderForm.address = ''
  testOrderForm.mode = 'standard'
  testOrderForm.deci = Math.floor(Math.random() * 25) + 5
  testOrderForm.frozen = false
  testOrderForm.deadlineMin = 90
  showTestOrderModal.value = true
}
function submitTestOrder() {
  const store = ISTANBUL_STORES[Math.floor(Math.random() * ISTANBUL_STORES.length)]
  const now = Date.now()
  const mode = testOrderForm.mode

  // Mod bazli zaman kriterleri
  let deadline, deliveryWindow = null
  if (mode === 'instant') {
    // Express: 30-60 dk
    const deadlineMin = 30 + Math.floor(Math.random() * 31)
    deadline = now + deadlineMin * 60000
  } else if (mode === 'standard') {
    // Slotlu: 2 saatlik pencere, 1-3 saat sonra
    const slotOffsetH = 1 + Math.floor(Math.random() * 3)
    const slotStart = Math.ceil((now + slotOffsetH * 3600000) / 3600000) * 3600000
    const slotEnd = slotStart + 2 * 3600000
    deadline = slotEnd
    deliveryWindow = { start: slotStart, end: slotEnd }
  } else {
    // Flex: 3-8 saat esnek
    const deadlineH = 3 + Math.floor(Math.random() * 6)
    deadline = now + deadlineH * 3600000
    deliveryWindow = { start: now + 3600000, end: deadline }
  }

  algoSimOrders.value.push({
    id: `order-manual-${Date.now()}`,
    originId: store.id,
    origin: { id: store.id, name: store.name, brand: store.brand },
    mode,
    status: 'pending',
    isFrozen: testOrderForm.frozen,
    deci: testOrderForm.deci,
    deliveryLocation: {
      lat: store.lat + (Math.random() - 0.5) * 0.04,
      lng: store.lng + (Math.random() - 0.5) * 0.06,
    },
    customerName: testOrderForm.customerName || 'Manuel Musteri',
    createdAt: now,
    deadline,
    deliveryWindow,
    routeId: null,
  })
  showTestOrderModal.value = false
  nextTick(() => updateAlgoMap())
}

const algoTab = ref('dispatch')
const algoLoading = ref(false)
const algoToast = reactive({ show: false, message: '', type: 'success' })
const showAlgoToast = (message, type = 'success') => {
  algoToast.show = true; algoToast.message = message; algoToast.type = type
  setTimeout(() => { algoToast.show = false }, 3000)
}

const algoSaving = reactive({ dispatch: false, partners: false })
const algoDispatching = reactive({ manual: false, osrm: false, reroute: false })
const lastDispatchResult = ref(null)
const healthLoading = ref(false)

const osrmHealth = reactive({ status: 'unknown', endpoint: '', responseTime: '', lastCheck: '' })
const vroomHealth = reactive({ status: 'unknown', endpoint: '', responseTime: '', lastCheck: '' })

const algoDispatch = reactive({ poolDispatch: true, zoneDispatch: true, cascadeOffers: false, maxOfferTimeout: 60 })
const algoMixedMode = reactive({
  enabled: false,
  proximityM: 2000,
  maxCompanions: 3,
  batchDurationMin: 15,
})
const algoPartners = ref([
  { id: 1, name: 'Yurticikargo', type: 'Kargo', enabled: true },
  { id: 2, name: 'Aras Kargo', type: 'Kargo', enabled: true },
  { id: 3, name: 'Scotty', type: 'Kurye', enabled: false },
  { id: 4, name: 'Getir Kuryesi', type: 'Kurye', enabled: true },
])

const algoTabs = [
  { id: 'dispatch', label: 'Dispatch', icon: Zap },
  { id: 'optimization', label: 'Optimizasyon', icon: Cpu },
  { id: 'partners', label: 'Partnerler', icon: Truck },
  { id: 'health', label: 'Servis Durumu', icon: Activity },
]

// ========== ALGORITHM SIMULATOR STATE ==========

const algoSimOrders = ref([])
const algoSimCouriers = ref([])
const algoSimRoutes = ref([])
const algoSimOffers = ref([])
const algoSimOrderTab = ref('all')
const algoSimSelectedRouteId = ref(null)
const algoSimBaseTime = ref(Date.now())
const algoSimSliderMin = ref(0)
const algoSimStats = ref(null)
const algoSimReasons = ref([])
const algoSimReasonsOpen = ref(false)
const algoSimSuggestions = ref([])
const algoSimSuggestionsOpen = ref(false)

// ─── AUTO-PILOT & LEARNING ───
const algoAutoPilot = ref(false)
const algoAutoSearching = ref(false)
const algoAutoResult = ref(null) // { bestCombo, bestScore, trialCount, improvement }
const algoLearningHistory = ref(loadLearningHistory())

function loadLearningHistory() {
  try { return JSON.parse(localStorage.getItem('bringo_algo_learning') || '[]') } catch { return [] }
}
function saveLearningHistory() {
  // Son 200 kayit tut
  const trimmed = algoLearningHistory.value.slice(-200)
  algoLearningHistory.value = trimmed
  localStorage.setItem('bringo_algo_learning', JSON.stringify(trimmed))
}
function getOrderProfile(orders) {
  const express = orders.filter(o => o.mode === 'instant').length
  const standard = orders.filter(o => o.mode === 'standard').length
  const flex = orders.filter(o => o.mode === 'flex').length
  const total = orders.length
  // Profil: oran bazli kumeleme (yuvarlama ile benzer profiller eslesir)
  const eRatio = Math.round((express / total) * 10) / 10
  const sRatio = Math.round((standard / total) * 10) / 10
  return `e${eRatio}_s${sRatio}_n${total <= 10 ? 'S' : total <= 25 ? 'M' : total <= 50 ? 'L' : 'XL'}`
}
function getLearningInsight(profile) {
  const relevant = algoLearningHistory.value.filter(h => h.profile === profile)
  if (relevant.length === 0) return null
  // En iyi sonucu bul
  relevant.sort((a, b) => b.score - a.score || a.totalRoutes - b.totalRoutes)
  return relevant[0]
}
let algoSimCountdownTimer = null
const algoSimNow = ref(Date.now())

// Siparis tipi sayilari (kullanici doldurur)
const simOrderCounts = reactive({ express: null, slotlu: null, flex: null })
const simCourierCount = ref(null)

// Dispatch sonucu popup
// showDispatchResult removed - routes shown directly in side panel
let algoMapContainer = null
let algoLeafletMap = null
const algoMapContainerRef = ref(null)
const algoCourierMarkers = {}
const algoRoutePolylines = {}
const algoOrderMarkers = {}

const ISTANBUL_STORES = [
  { id: 'store-ceptesok-kadikoy', name: 'CepteSok Kadikoy', brand: 'CepteSok', lat: 40.9828, lng: 29.0771 },
  { id: 'store-migros-atasehir', name: 'Migros Atasehir', brand: 'Migros', lat: 40.9923, lng: 29.1244 },
  { id: 'store-a101-umraniye', name: 'A101 Umraniye', brand: 'A101', lat: 41.0189, lng: 29.1200 },
]

const MOCK_NAMES = ['Ahmet Yilmaz','Fatma Kaya','Mehmet Demir','Ayse Celik','Ali Sahin','Zeynep Arslan','Mustafa Kurt','Emine Yildiz','Hasan Ozturk','Hatice Dogan','Ibrahim Aydin','Elif Polat','Huseyin Koc','Meryem Sen','Osman Acar']

function generateMockOrders(counts) {
  // counts: { express: number, slotlu: number, flex: number }
  const now = Date.now()
  const orders = []
  let idx = 0
  const tierPool = ['standard','standard','standard','standard','premium','premium','vip'] // %57 std, %29 prem, %14 vip
  const projectPool = PROJECTS.filter(p => p !== 'Tumu')
  const pickTier = () => tierPool[Math.floor(Math.random() * tierPool.length)]
  const pickProject = () => projectPool[Math.floor(Math.random() * projectPool.length)]

  // ─── EXPRESS (instant) — acil teslimat, 30-60 dk deadline ───
  for (let i = 0; i < (counts.express || 0); i++) {
    const store = ISTANBUL_STORES[Math.floor(Math.random() * ISTANBUL_STORES.length)]
    const deadlineMin = 30 + Math.floor(Math.random() * 31) // 30-60 dk
    const createdAgo = Math.floor(Math.random() * 10) * 60000 // 0-10 dk once olusturuldu (yeni gelmis)
    orders.push({
      id: `order-${Date.now()}-${idx}`,
      originId: store.id,
      origin: { id: store.id, name: store.name, brand: store.brand, project: pickProject() },
      mode: 'instant',
      serviceTier: Math.random() < 0.4 ? 'premium' : Math.random() < 0.3 ? 'vip' : 'standard', // express genelde premium/vip
      status: 'pending',
      isFrozen: Math.random() < 0.15,
      deci: Math.floor(Math.random() * 20) + 3,
      deliveryLocation: {
        lat: store.lat + (Math.random() - 0.5) * 0.03,
        lng: store.lng + (Math.random() - 0.5) * 0.04,
      },
      customerName: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
      createdAt: now - createdAgo,
      deadline: now + deadlineMin * 60000,
      deliveryWindow: null,
      routeId: null,
    })
    idx++
  }

  // ─── SLOTLU (standard) — 2 saatlik teslimat penceresi, 1-4 saat sonra ───
  for (let i = 0; i < (counts.slotlu || 0); i++) {
    const store = ISTANBUL_STORES[Math.floor(Math.random() * ISTANBUL_STORES.length)]
    const createdAgo = Math.floor(Math.random() * 30) * 60000 // 0-30 dk once
    // Slot baslangici: simdi + 1-4 saat arasi (tam saate yuvarla)
    const slotOffsetHours = 1 + Math.floor(Math.random() * 4) // 1, 2, 3, 4 saat sonra
    const slotStartRaw = now + slotOffsetHours * 3600000
    // Tam saate yuvarla (ornegin 14:00, 15:00)
    const slotStart = Math.ceil(slotStartRaw / 3600000) * 3600000
    const slotDuration = 2 * 3600000 // 2 saatlik pencere
    const slotEnd = slotStart + slotDuration
    orders.push({
      id: `order-${Date.now()}-${idx}`,
      originId: store.id,
      origin: { id: store.id, name: store.name, brand: store.brand, project: pickProject() },
      mode: 'standard',
      serviceTier: pickTier(),
      status: 'pending',
      isFrozen: Math.random() < 0.2,
      deci: Math.floor(Math.random() * 30) + 5,
      deliveryLocation: {
        lat: store.lat + (Math.random() - 0.5) * 0.05,
        lng: store.lng + (Math.random() - 0.5) * 0.07,
      },
      customerName: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
      createdAt: now - createdAgo,
      deadline: slotEnd,
      deliveryWindow: { start: slotStart, end: slotEnd },
      routeId: null,
    })
    idx++
  }

  // ─── FLEX — genis zaman dilimi, 3-8 saat, esnek teslimat ───
  for (let i = 0; i < (counts.flex || 0); i++) {
    const store = ISTANBUL_STORES[Math.floor(Math.random() * ISTANBUL_STORES.length)]
    const createdAgo = Math.floor(Math.random() * 60) * 60000 // 0-60 dk once
    const deadlineHours = 3 + Math.floor(Math.random() * 6) // 3-8 saat
    // Flex icin genis pencere: simdi + 1 saat ile deadline arasi
    const windowStart = now + 3600000 // en erken 1 saat sonra
    const windowEnd = now + deadlineHours * 3600000
    orders.push({
      id: `order-${Date.now()}-${idx}`,
      originId: store.id,
      origin: { id: store.id, name: store.name, brand: store.brand, project: pickProject() },
      mode: 'flex',
      serviceTier: Math.random() < 0.7 ? 'standard' : 'premium', // flex genelde standart
      status: 'pending',
      isFrozen: Math.random() < 0.25,
      deci: Math.floor(Math.random() * 35) + 5,
      deliveryLocation: {
        lat: store.lat + (Math.random() - 0.5) * 0.06,
        lng: store.lng + (Math.random() - 0.5) * 0.08,
      },
      customerName: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
      createdAt: now - createdAgo,
      deadline: windowEnd,
      deliveryWindow: { start: windowStart, end: windowEnd },
      routeId: null,
    })
    idx++
  }

  return orders
}

function generateMockCouriers(count) {
  const names = ['Burak T.','Cem K.','Deniz A.','Emre Y.','Furkan S.','Gorkem B.','Haluk D.','Ilker M.','Kemal P.','Levent C.']
  return Array.from({ length: count }, (_, i) => ({
    id: `courier-sim-${i}`,
    name: names[i % names.length],
    status: 'idle',
    location: { lat: 40.98 + (Math.random()-0.5)*0.06, lng: 29.05 + (Math.random()-0.5)*0.1 },
    hasCooler: Math.random() < 0.3,
    currentRouteId: null,
    acceptRate: 0.7 + Math.random() * 0.3,
  }))
}

function handleAlgoGenerate() {
  const express = parseInt(simOrderCounts.express) || 0
  const slotlu = parseInt(simOrderCounts.slotlu) || 0
  const flex = parseInt(simOrderCounts.flex) || 0
  const total = express + slotlu + flex
  if (total === 0) { showAlgoToast('En az 1 siparis giriniz', 'error'); return }
  const courierCount = parseInt(simCourierCount.value) || Math.max(3, Math.ceil(total / 4))
  try {
    algoSimOrders.value = generateMockOrders({ express, slotlu, flex })
    algoSimCouriers.value = generateMockCouriers(courierCount)
    algoSimRoutes.value = []
    algoSimOffers.value = []
    algoSimStats.value = null
    algoSimReasons.value = []
    algoSimSuggestions.value = []
    algoSimSelectedRouteId.value = null
    if (algoLeafletMap) drawAlgoMap(true)
    else console.warn('algoLeafletMap is null in handleAlgoGenerate')
  } catch (e) {
    console.error('Generate hata:', e)
    showAlgoToast('Hata: ' + e.message, 'error')
  }
}

function handleAlgoReset() {
  algoSimOrders.value = []
  algoSimCouriers.value = []
  algoSimRoutes.value = []
  algoSimOffers.value = []
  algoSimStats.value = null
  algoSimReasons.value = []
  algoSimSuggestions.value = []
  algoSimSelectedRouteId.value = null
  algoSimSliderMin.value = 0
  algoSimBaseTime.value = Date.now()
  simOrderCounts.express = null
  simOrderCounts.slotlu = null
  simOrderCounts.flex = null
  simCourierCount.value = null
  if (algoLeafletMap) drawAlgoMap(true)
}

function handleAlgoDispatch() {
  if (algoSimOrders.value.length === 0) return
  handleAutoDispatch()
}

function saveTrialToHistory() {
  if (!algoSimStats.value || !algoSimStats.value.efficiencyScore) return
  const orders = algoSimOrders.value
  const profile = getOrderProfile(orders)
  const s = algoSimStats.value
  const routes = algoSimRoutes.value
  const avgCourierScore = routes.length > 0
    ? Math.round(routes.reduce((sum, r) => sum + (r.courierScore || 0), 0) / routes.length * 2) / 2
    : 0
  algoLearningHistory.value.push({
    ts: Date.now(),
    profile,
    combo: { ...s.algorithms },
    score: s.efficiencyScore,
    courierScore: avgCourierScore,
    totalRoutes: s.totalRoutes,
    totalOrders: parseInt(s.totalOrders),
    totalKm: parseFloat(s.totalKm),
    avgKmPerOrder: parseFloat(s.avgKmPerOrder),
  })
  saveLearningHistory()
}

function handleAutoDispatch() {
  const orders = [...algoSimOrders.value]
  const couriers = [...algoSimCouriers.value]
  if (!orders.length || !couriers.length) return

  algoDispatching.manual = true
  algoAutoSearching.value = true
  algoAutoResult.value = null

  // Gecmis verisinden bu profil icin en iyi bilinen combo var mi?
  const profile = getOrderProfile(orders)
  const pastBest = getLearningInsight(profile)

  const assignOptions = ['hungarian', 'greedy_nearest', 'auction', 'zone_cascade', 'batch_dispatch', 'multi_objective']
  const routeOptions = ['clarke_wright', 'or_tools_vrp', 'vroom_solver']
  const optOptions = ['2opt', '3opt', 'simulated_annealing']
  // genetic ve ant_colony agir — sadece gecmiste iyi sonuc verdilerse ekle
  const pastOpts = algoLearningHistory.value.filter(h => h.score >= 8).map(h => h.combo.optimization)
  if (pastOpts.includes('genetic')) optOptions.push('genetic')
  if (pastOpts.includes('ant_colony')) optOptions.push('ant_colony')

  // Tum combolar
  const allCombos = []
  for (const a of assignOptions) {
    for (const r of routeOptions) {
      for (const o of optOptions) {
        allCombos.push({ a, r, o })
      }
    }
  }

  // Gecmis verisine gore sirala — daha once iyi sonuc veren combolar once
  const comboScoreCache = {}
  algoLearningHistory.value.forEach(h => {
    const key = `${h.combo.assignment}|${h.combo.routing}|${h.combo.optimization}`
    // Kombine skor: verimlilik + kurye puani
    const combined = (h.score || 0) * 0.6 + (h.courierScore || 0) * 0.4
    if (!comboScoreCache[key] || combined > comboScoreCache[key]) {
      comboScoreCache[key] = combined
    }
  })
  allCombos.sort((a, b) => {
    const sa = comboScoreCache[`${a.a}|${a.r}|${a.o}`] || 0
    const sb = comboScoreCache[`${b.a}|${b.r}|${b.o}`] || 0
    return sb - sa
  })

  // Snapshot
  const trialOrders = orders.map(o => ({ ...o }))
  const trialCouriers = couriers.map(c => ({ ...c }))

  // Chunked async execution — her chunk 10 combo test eder
  let best = null
  let trialCount = 0
  let chunkIdx = 0
  const CHUNK_SIZE = 10

  function runChunk() {
    const start = chunkIdx * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, allCombos.length)
    for (let i = start; i < end; i++) {
      const { a, r, o } = allCombos[i]
      try {
        const result = runSimulationTrial(trialOrders, trialCouriers, a, r, o)
        if (result && (!best || result.combinedScore > best.combinedScore || (result.combinedScore === best.combinedScore && result.totalKm < best.totalKm))) {
          best = result
        }
        trialCount++
      } catch (_) { trialCount++ }
    }
    chunkIdx++
    if (end < allCombos.length) {
      setTimeout(runChunk, 0)
    } else {
      // Tum testler bitti — en iyiyi uygula
      finishAutoDispatch(best, trialCount, pastBest, profile)
    }
  }
  setTimeout(runChunk, 0)
}

function finishAutoDispatch(best, trialCount, pastBest, profile) {
  if (!best) {
    algoAutoSearching.value = false
    algoDispatching.manual = false
    showAlgoToast('Hicbir kombinasyon sonuc uretmedi', 'error')
    return
  }

  // En iyi combo'yu uygula
  const hybridIds = ['zone_cascade', 'batch_dispatch', 'multi_objective']
  if (hybridIds.includes(best.assignAlgo)) {
    selectAlgorithm('hybrid', best.assignAlgo)
  } else {
    selectedAlgorithms.hybrid = null
    selectAlgorithm('assignment', best.assignAlgo)
  }
  selectAlgorithm('routing', best.routeAlgo)
  selectAlgorithm('optimization', best.optAlgo)

  // Orders'i pending'e dondur ve simulate et
  algoSimOrders.value = algoSimOrders.value.map(o => ({ ...o, status: 'pending', routeId: null }))
  algoSimRoutes.value = []

  const improvement = pastBest ? best.score - pastBest.score : 0

  algoAutoResult.value = {
    bestCombo: { assignment: best.assignAlgo, routing: best.routeAlgo, optimization: best.optAlgo },
    bestScore: best.score,
    courierScore: best.courierScore,
    combinedScore: best.combinedScore,
    trialCount,
    improvement,
    totalRoutes: best.totalRoutes,
    fromLearning: pastBest != null,
  }

  nextTick(() => {
    try {
      simulateRoutes()
      // Sonucu ogrenme gecmisine kaydet
      saveTrialToHistory()
      const aName = getAlgoById(best.assignAlgo)?.name || best.assignAlgo
      const rName = getAlgoById(best.routeAlgo)?.name || best.routeAlgo
      const oName = getAlgoById(best.optAlgo)?.name || best.optAlgo
      showAlgoToast(`AI secti: ${aName} → ${rName} → ${oName} (${best.score}/10)`, 'success')
    } catch (e) {
      showAlgoToast('Auto-dispatch hatasi: ' + e.message, 'error')
    } finally {
      algoAutoSearching.value = false
      algoDispatching.manual = false
    }
  })
}

// ─── AI Route Pricing — siparis, km, sure, bolge katsayilari ile rota fiyati ───
function calculateRoutePrice(orderGroup, totalKm, totalTimeSec) {
  const p = pricingParams
  const orderCount = orderGroup.length
  const totalMin = totalTimeSec / 60

  // Her siparis icin fiyat hesapla
  let totalPrice = 0
  for (const order of orderGroup) {
    // 1. Mod bazli temel ucret (express / slotlu / flex)
    let orderPrice = p.modeFees?.[order.mode] ?? p.baseFee

    // 2. Siparis basina km payi
    const kmShare = totalKm / orderCount
    const billableKm = Math.max(0, kmShare - p.perKmAfter)
    orderPrice += Math.min(billableKm * p.perKmFee, p.maxKmFee)

    // 3. Servis segmenti (standard / premium / vip)
    const tier = order.serviceTier || 'standard'
    const tierConfig = p.serviceTiers?.[tier]
    if (tierConfig) orderPrice *= tierConfig.multiplier

    // 4. Proje bazli ek ucret
    const projectName = order.origin?.project || order.project || null
    if (projectName && p.projectSurcharges?.[projectName]) {
      orderPrice += p.projectSurcharges[projectName]
    }

    // 5. Frigo ek ucreti
    if (order.isFrozen) orderPrice += p.frozenFee

    // 6. Agir paket
    if ((order.deci || 0) >= p.heavyThreshold) orderPrice += p.heavyPackageFee

    // 7. Bolge katsayisi — merkeze uzaklik bazli (Istanbul merkez: 41.0082, 28.9784)
    const dist = haversine(order.deliveryLocation.lat, order.deliveryLocation.lng, 41.0082, 28.9784)
    const zone = dist <= 5 ? 'A' : dist <= 12 ? 'B' : dist <= 22 ? 'C' : 'D'
    orderPrice *= (p.zoneMultipliers[zone] || 1.0)

    // 8. Zaman carpani (simule zaman)
    const h = new Date(order.createdAt || Date.now()).getHours()
    if (h >= 22 || h < 6) orderPrice *= p.nightMultiplier
    else if ((h >= 11 && h < 14) || (h >= 18 && h < 21)) orderPrice *= p.peakHourMultiplier

    totalPrice += orderPrice
  }

  // AI Katsayilari — rota verimliligine gore indirim/artis
  const densityFactor = orderCount >= 8 ? 0.88 : orderCount >= 5 ? 0.92 : orderCount >= 3 ? 0.96 : 1.0
  const speedFactor = totalMin <= 30 ? 1.05 : totalMin <= 60 ? 1.0 : totalMin <= 120 ? 0.98 : 0.95
  const kmPerOrder = totalKm / orderCount
  const efficiencyFactor = kmPerOrder <= 1.5 ? 0.90 : kmPerOrder <= 3 ? 0.95 : kmPerOrder <= 5 ? 1.0 : 1.05

  totalPrice *= densityFactor * speedFactor * efficiencyFactor

  return Math.round(totalPrice * 100) / 100
}

// ─── Merge: tekli atamalari en yakin rotaya birlestir ───
function mergeAssignments(assignments) {
  // Pas 1: Tekli rotalari cok-siparisli rotalara tasi
  let mergePass = 0
  while (mergePass < 3) {
    const singles = []
    const multis = []
    assignments.forEach((group, idx) => {
      if (group.length === 1) singles.push(idx)
      else if (group.length >= 2) multis.push(idx)
    })
    if (singles.length === 0 || multis.length === 0) break
    let merged = false
    for (const si of singles) {
      const so = assignments[si][0]
      let bestTarget = -1, bestDist = Infinity
      for (const mi of multis) {
        if (assignments[mi].length >= 10) continue
        let totalD = 0
        for (const o of assignments[mi]) {
          totalD += haversine(so.deliveryLocation.lat, so.deliveryLocation.lng, o.deliveryLocation.lat, o.deliveryLocation.lng)
        }
        const avgD = totalD / assignments[mi].length
        if (avgD < bestDist) { bestDist = avgD; bestTarget = mi }
      }
      if (bestTarget >= 0 && bestDist < 8) {
        assignments[bestTarget].push(so)
        assignments[si] = []
        merged = true
      }
    }
    if (!merged) break
    mergePass++
  }
  // Pas 2: Kalan tekli rotalari birbirleriyle esle
  const remainingSingles = []
  assignments.forEach((group, idx) => { if (group.length === 1) remainingSingles.push(idx) })
  while (remainingSingles.length >= 2) {
    const aIdx = remainingSingles.shift()
    let bestPair = -1, bestDist = Infinity
    for (let i = 0; i < remainingSingles.length; i++) {
      const bIdx = remainingSingles[i]
      const d = haversine(
        assignments[aIdx][0].deliveryLocation.lat, assignments[aIdx][0].deliveryLocation.lng,
        assignments[bIdx][0].deliveryLocation.lat, assignments[bIdx][0].deliveryLocation.lng
      )
      if (d < bestDist) { bestDist = d; bestPair = i }
    }
    if (bestPair >= 0 && bestDist < 12) {
      const bIdx = remainingSingles.splice(bestPair, 1)[0]
      assignments[aIdx].push(...assignments[bIdx])
      assignments[bIdx] = []
    }
  }
}

// ─── Lightweight simulation trial (no UI side effects) ───
function runSimulationTrial(orders, couriers, assignAlgo, routeAlgo, optAlgo) {
  const assignParams = algoParamEdits[assignAlgo] || getAlgoById(assignAlgo)?.params || {}
  const routeParams = algoParamEdits[routeAlgo] || getAlgoById(routeAlgo)?.params || {}
  const optParams = algoParamEdits[optAlgo] || getAlgoById(optAlgo)?.params || {}
  const now = algoSimBaseTime.value

  const assignments = assignOrdersToCouriers(orders, couriers, assignAlgo, assignParams)
  // Merge tekli rotalari
  mergeAssignments(assignments, orders)

  const routes = []
  let totalCourierScore = 0
  for (const [, orderGroup] of assignments.entries()) {
    if (orderGroup.length === 0) continue
    const waypoints = buildRouteWaypoints(orderGroup, routeAlgo, routeParams, now)
    const optimized = optimizeWaypoints(waypoints, optAlgo, optParams)
    const lastTime = optimized.length > 0 ? optimized[optimized.length - 1].departureTime : now
    const totalKm = computeRouteDistance(optimized)
    const totalTimeSec = Math.round((lastTime - now) / 1000)
    const orderCount = orderGroup.length
    const kmPerOrderVal = totalKm / orderCount

    // Kurye puani (trial icin)
    let cs = 0
    const minPerOrder = (totalTimeSec / 60) / orderCount
    cs += minPerOrder <= 8 ? 2.5 : minPerOrder <= 12 ? 2 : minPerOrder <= 18 ? 1.5 : minPerOrder <= 25 ? 1 : 0.5
    cs += kmPerOrderVal <= 1.5 ? 2.5 : kmPerOrderVal <= 2.5 ? 2 : kmPerOrderVal <= 4 ? 1.5 : kmPerOrderVal <= 6 ? 1 : 0.5
    cs += orderCount >= 6 ? 2.5 : orderCount >= 4 ? 2 : orderCount >= 3 ? 1.5 : orderCount >= 2 ? 1 : 0.5
    const deliveries = optimized.filter(w => w.type === 'delivery')
    const deadlineOrders = orderGroup.filter(o => o.deadline)
    if (deadlineOrders.length > 0 && deliveries.length > 0) {
      let met = 0
      deliveries.forEach(wp => { const o = orderGroup.find(x => x.id === wp.orderId); if (o?.deadline && wp.arrivalTime <= o.deadline) met++ })
      const rate = met / deliveries.length
      cs += rate >= 0.95 ? 2.5 : rate >= 0.8 ? 2 : rate >= 0.6 ? 1.5 : rate >= 0.4 ? 1 : 0.5
    } else { cs += 2 }
    totalCourierScore += cs

    routes.push({
      orderIds: orderGroup.map(o => o.id),
      originIds: [...new Set(orderGroup.map(o => o.originId))],
      totalDistanceKm: totalKm,
      totalTimeSec,
      avgAddedKmPerOrder: totalKm / orderCount * (0.3 + Math.random() * 0.4),
      kmPerOrder: kmPerOrderVal,
      courierScore: Math.round(cs * 2) / 2,
    })
  }
  if (routes.length === 0) return null

  const totalRoutes = routes.length
  const avgAddedKm = routes.reduce((s,r) => s + r.avgAddedKmPerOrder, 0) / totalRoutes
  const avgSipRota = orders.length / totalRoutes
  const avgKmSip = routes.reduce((s,r) => s + r.kmPerOrder, 0) / totalRoutes
  const totalKmAll = routes.reduce((s, r) => s + r.totalDistanceKm, 0)
  const avgCourierScore = Math.round((totalCourierScore / totalRoutes) * 2) / 2

  const routeOrderCounts = routes.map(r => r.orderIds.length)
  const maxLoad = Math.max(...routeOrderCounts)
  const minLoad = Math.min(...routeOrderCounts)
  const loadRatio = maxLoad > 0 ? minLoad / maxLoad : 1
  const utilizationRatio = totalRoutes / couriers.length

  let score = 0
  score += avgSipRota >= 6 ? 2 : avgSipRota >= 4 ? 1.5 : avgSipRota >= 3 ? 1 : avgSipRota >= 2 ? 0.5 : 0
  score += avgKmSip <= 1.2 ? 2 : avgKmSip <= 2 ? 1.5 : avgKmSip <= 3 ? 1 : avgKmSip <= 5 ? 0.5 : 0
  score += loadRatio >= 0.7 ? 2 : loadRatio >= 0.5 ? 1.5 : loadRatio >= 0.3 ? 1 : 0.5
  score += avgAddedKm <= 0.5 ? 2 : avgAddedKm <= 0.8 ? 1.5 : avgAddedKm <= 1.2 ? 1 : avgAddedKm <= 2 ? 0.5 : 0
  score += (utilizationRatio >= 0.7 && utilizationRatio <= 1.0) ? 2 : utilizationRatio >= 0.5 ? 1.5 : utilizationRatio >= 0.3 ? 1 : utilizationRatio > 1.0 ? 1 : 0.5
  score = Math.round(score * 2) / 2

  // Kombine skor: verimlilik (%60) + kurye puani (%40)
  const combinedScore = Math.round((score * 0.6 + avgCourierScore * 0.4) * 2) / 2

  return { totalRoutes, score, courierScore: avgCourierScore, combinedScore, totalKm: totalKmAll, avgKmPerOrder: avgKmSip, avgOrdersPerRoute: avgSipRota, assignAlgo, routeAlgo, optAlgo }
}

function simulateRoutes() {
  const orders = [...algoSimOrders.value]
  const couriers = [...algoSimCouriers.value]
  if (!orders.length || !couriers.length) return

  // Get selected algorithm params
  let assignAlgo = selectedAlgorithms.assignment || 'hungarian'
  let routeAlgo = selectedAlgorithms.routing || 'clarke_wright'
  const optAlgo = selectedAlgorithms.optimization || '2opt'
  const hybridAlgo = selectedAlgorithms.hybrid || null

  // Hybrid overrides
  if (hybridAlgo === 'zone_cascade') {
    assignAlgo = 'zone_cascade' // zone-based assignment
  } else if (hybridAlgo === 'batch_dispatch') {
    assignAlgo = 'batch_dispatch' // batch grouping
  } else if (hybridAlgo === 'multi_objective') {
    assignAlgo = 'multi_objective' // multi-objective balancing
  }

  const assignParams = algoParamEdits[hybridAlgo || assignAlgo] || getAlgoById(hybridAlgo || assignAlgo)?.params || getAlgoById(assignAlgo)?.params || {}
  const routeParams = algoParamEdits[routeAlgo] || getAlgoById(routeAlgo)?.params || {}
  const optParams = algoParamEdits[optAlgo] || getAlgoById(optAlgo)?.params || {}

  // ─── STEP 1: ASSIGNMENT — group orders to couriers ───
  const assignments = assignOrdersToCouriers(orders, couriers, assignAlgo, assignParams)

  // ─── STEP 1.5: MERGE — tekli rotalari en yakin rotaya birlestir ───
  mergeAssignments(assignments)

  // ─── STEP 2: ROUTING — build waypoint sequences per route ───
  const routes = []
  const orderUpdates = new Map()
  let routeIdx = 0

  for (const [courierIdx, orderGroup] of assignments.entries()) {
    if (orderGroup.length === 0) continue
    const courier = couriers[courierIdx % couriers.length]
    const color = ROUTE_COLORS[routeIdx % ROUTE_COLORS.length]
    const now = algoSimBaseTime.value

    // Build waypoints using routing algorithm
    const waypoints = buildRouteWaypoints(orderGroup, routeAlgo, routeParams, now)

    // ─── STEP 3: OPTIMIZATION — improve waypoint order ───
    const optimized = optimizeWaypoints(waypoints, optAlgo, optParams)

    const lastTime = optimized.length > 0 ? optimized[optimized.length - 1].departureTime : now
    const totalKm = computeRouteDistance(optimized)
    const routeId = `route-sim-${routeIdx}`

    const totalTimeSec = Math.round((lastTime - now) / 1000)
    const orderCount = orderGroup.length
    const kmPerOrderVal = totalKm / orderCount
    const avgAddedKm = totalKm / orderCount * (0.3 + Math.random() * 0.4)

    // ─── KURYE PUANI (10 uzerinden) ───
    // Kuryenin bu rotayi ne kadar verimli/hizli tamamlayacagi
    let courierScore = 0
    // 1. Hiz puani (2.5p) — toplam sure kisaysa yuksek
    const totalMin = totalTimeSec / 60
    const minPerOrder = totalMin / orderCount
    courierScore += minPerOrder <= 8 ? 2.5 : minPerOrder <= 12 ? 2 : minPerOrder <= 18 ? 1.5 : minPerOrder <= 25 ? 1 : 0.5
    // 2. Mesafe verimliligi (2.5p) — km/siparis dusukse iyi
    courierScore += kmPerOrderVal <= 1.5 ? 2.5 : kmPerOrderVal <= 2.5 ? 2 : kmPerOrderVal <= 4 ? 1.5 : kmPerOrderVal <= 6 ? 1 : 0.5
    // 3. Siparis yogunlugu (2.5p) — cok siparis = kurye icin iyi kazanc
    courierScore += orderCount >= 6 ? 2.5 : orderCount >= 4 ? 2 : orderCount >= 3 ? 1.5 : orderCount >= 2 ? 1 : 0.5
    // 4. Zaman uyumu (2.5p) — deadline + pencere uyumu
    const deliveries = optimized.filter(w => w.type === 'delivery')
    let onTimeMet = 0
    let onTimeTotal = deliveries.length
    if (deliveries.length > 0) {
      deliveries.forEach(wp => {
        const order = orderGroup.find(o => o.id === wp.orderId)
        if (!order) return
        let ok = true
        // Deadline kontrolu
        if (order.deadline && wp.arrivalTime > order.deadline) ok = false
        // Pencere kontrolu — slotlu siparislerde pencere baslangicinden once teslimat yapilmamali
        if (order.deliveryWindow?.start && wp.arrivalTime < order.deliveryWindow.start) ok = false
        if (ok) onTimeMet++
      })
      const timeRate = onTimeMet / deliveries.length
      courierScore += timeRate >= 0.95 ? 2.5 : timeRate >= 0.8 ? 2 : timeRate >= 0.6 ? 1.5 : timeRate >= 0.4 ? 1 : 0.5
    } else {
      courierScore += 2
    }
    const onTimeRate = onTimeTotal > 0 ? Math.round(onTimeMet / onTimeTotal * 100) : 100
    courierScore = Math.round(courierScore * 2) / 2

    // ─── ROTA FIYATI ───
    const routePrice = calculateRoutePrice(orderGroup, totalKm, totalTimeSec)

    routes.push({
      id: routeId, status: 'assigned', isFrozen: orderGroup.some(o => o.isFrozen),
      waypoints: optimized, orderIds: orderGroup.map(o => o.id),
      originIds: [...new Set(orderGroup.map(o => o.originId))],
      totalDistanceKm: totalKm,
      totalTimeSec,
      totalDeci: orderGroup.reduce((s, o) => s + (o.deci||0), 0),
      density: orderCount / Math.max(1, totalKm),
      avgAddedKmPerOrder: avgAddedKm,
      kmPerOrder: kmPerOrderVal,
      estimatedEarning: orderCount * 28 + totalKm * 2,
      routePrice,
      onTimeRate,
      courierId: courier.id, color,
      courierScore,
      algorithm: { assignment: assignAlgo, routing: routeAlgo, optimization: optAlgo },
    })

    orderGroup.forEach(o => orderUpdates.set(o.id, { status: 'dispatched', routeId }))
    routeIdx++
  }

  // ─── STEP 4: ON-TIME ENFORCEMENT — %95 zamaninda teslimat garanti ───
  // Rotalari agresif bol: toplam oran %95 olana kadar devam et
  const MIN_ON_TIME_RATE = 95

  // Yardimci: bir rotanin on-time oranini hesapla
  function calcRouteOnTime(route) {
    const dels = route.waypoints.filter(w => w.type === 'delivery')
    if (dels.length === 0) return 100
    let met = 0
    dels.forEach(wp => {
      const order = orders.find(o => o.id === wp.orderId)
      if (!order) { met++; return }
      let ok = true
      if (order.deadline && wp.arrivalTime > order.deadline) ok = false
      if (order.deliveryWindow?.start && wp.arrivalTime < order.deliveryWindow.start) ok = false
      if (ok) met++
    })
    return Math.round(met / dels.length * 100)
  }

  // Yardimci: siparis grubundan yeni rota olustur
  function buildNewRoute(orderGroup, rid) {
    const wp = buildRouteWaypoints(orderGroup, routeAlgo, routeParams, algoSimBaseTime.value)
    const opt = optimizeWaypoints(wp, optAlgo, optParams)
    const km = computeRouteDistance(opt)
    const timeSec = opt.length > 0 ? Math.round((opt[opt.length-1].departureTime - algoSimBaseTime.value)/1000) : 0
    const newRoute = {
      id: rid, status: 'assigned', isFrozen: orderGroup.some(o => o.isFrozen),
      waypoints: opt, orderIds: orderGroup.map(o => o.id),
      originIds: [...new Set(orderGroup.map(o => o.originId))],
      totalDistanceKm: km, totalTimeSec: timeSec,
      totalDeci: orderGroup.reduce((s, o) => s + (o.deci||0), 0),
      density: orderGroup.length / Math.max(1, km),
      avgAddedKmPerOrder: km / orderGroup.length * 0.4,
      kmPerOrder: km / orderGroup.length,
      estimatedEarning: orderGroup.length * 28 + km * 2,
      routePrice: calculateRoutePrice(orderGroup, km, timeSec),
      onTimeRate: 0,
      courierId: couriers[routeIdx % couriers.length].id,
      color: ROUTE_COLORS[routeIdx % ROUTE_COLORS.length],
      courierScore: 0,
      algorithm: { assignment: assignAlgo, routing: routeAlgo, optimization: optAlgo },
    }
    newRoute.onTimeRate = calcRouteOnTime(newRoute)
    return newRoute
  }

  // Ilk hesaplama
  routes.forEach(r => { r.onTimeRate = calcRouteOnTime(r) })

  for (let enforcementPass = 0; enforcementPass < 10; enforcementPass++) {
    // Toplam on-time hesapla
    let totalDel = 0, totalOk = 0
    routes.forEach(r => {
      const c = r.orderIds.length
      totalDel += c
      totalOk += Math.round(c * r.onTimeRate / 100)
    })
    const globalRate = totalDel > 0 ? (totalOk / totalDel * 100) : 100
    if (globalRate >= MIN_ON_TIME_RATE) break

    // En kotu rotayi bul (en dusuk on-time, 2+ siparis)
    let worstIdx = -1, worstRate = 100
    routes.forEach((r, i) => {
      if (r.onTimeRate < worstRate && r.orderIds.length >= 2) {
        worstRate = r.onTimeRate
        worstIdx = i
      }
    })
    if (worstIdx === -1) break // bolunecek rota kalmadi (hepsi tek siparis)

    const worstRoute = routes[worstIdx]
    const routeOrders = orders.filter(o => worstRoute.orderIds.includes(o.id))

    // Rotayi ikiye bol: ilk yari ve ikinci yari
    const half = Math.ceil(routeOrders.length / 2)
    const group1 = routeOrders.slice(0, half)
    const group2 = routeOrders.slice(half)

    // Mevcut rotayi group1 ile guncelle
    const rebuilt1 = buildNewRoute(group1, worstRoute.id)
    rebuilt1.courierId = worstRoute.courierId
    rebuilt1.color = worstRoute.color
    routes[worstIdx] = rebuilt1

    // group2 icin yeni rota olustur
    if (group2.length > 0) {
      routeIdx++
      const newRouteId = `route-sim-${routeIdx}`
      const rebuilt2 = buildNewRoute(group2, newRouteId)
      routes.push(rebuilt2)
      group2.forEach(o => orderUpdates.set(o.id, { status: 'dispatched', routeId: newRouteId }))
    }
  }

  // Single batch update
  algoSimOrders.value = algoSimOrders.value.map(o => {
    const upd = orderUpdates.get(o.id)
    return upd ? { ...o, ...upd } : o
  })
  algoSimRoutes.value = routes

  // Compute stats
  const totalRoutes = routes.length
  if (totalRoutes === 0) return
  const avgAddedKm = routes.reduce((s,r) => s + r.avgAddedKmPerOrder, 0) / totalRoutes
  const avgSipRota = orders.length / totalRoutes
  const avgKmSip = routes.reduce((s,r) => s + r.kmPerOrder, 0) / totalRoutes
  const multiOrigin = routes.filter(r => r.originIds.length > 1).length / totalRoutes * 100
  const totalKmAll = routes.reduce((s, r) => s + r.totalDistanceKm, 0)
  const totalTimeAll = routes.reduce((s, r) => s + r.totalTimeSec, 0)
  const totalEarning = routes.reduce((s, r) => s + r.estimatedEarning, 0)
  const totalPrice = routes.reduce((s, r) => s + (r.routePrice || 0), 0)
  const avgOnTimeRate = Math.round(routes.reduce((s, r) => s + (r.onTimeRate || 0), 0) / totalRoutes)
  algoSimStats.value = {
    totalRoutes, avgAddedKmPerOrder: avgAddedKm.toFixed(2), avgOrdersPerRoute: avgSipRota.toFixed(1),
    avgKmPerOrder: avgKmSip.toFixed(2), multiOriginRate: Math.round(multiOrigin),
    totalOrders: orders.length, totalKm: totalKmAll.toFixed(1), totalTimeSec: totalTimeAll, totalEarning: totalEarning.toFixed(0),
    totalPrice: totalPrice.toFixed(0),
    onTimeRate: avgOnTimeRate,
    algorithms: { assignment: assignAlgo, routing: routeAlgo, optimization: optAlgo },
  }

  // ─── ROUTE REASONING — neden boyle rotalandi? ───
  const reasons = []
  const modeCount = { instant: 0, standard: 0, flex: 0 }
  orders.forEach(o => { if (modeCount[o.mode] !== undefined) modeCount[o.mode]++ })

  // Genel ozet
  reasons.push({ type: 'info', text: `${orders.length} siparis ${couriers.length} kurye icin ${totalRoutes} rotaya ayrildi.` })

  // Mod dagilimi
  const modeParts = []
  if (modeCount.instant > 0) modeParts.push(`${modeCount.instant} express`)
  if (modeCount.standard > 0) modeParts.push(`${modeCount.standard} standart`)
  if (modeCount.flex > 0) modeParts.push(`${modeCount.flex} flex`)
  if (modeParts.length > 1) {
    reasons.push({ type: 'info', text: `Siparis dagilimi: ${modeParts.join(', ')}.` })
  }

  // Express zaman kisiti analizi
  if (modeCount.instant > 0) {
    const expressRoutes = routes.filter(r => {
      const rOrders = orders.filter(o => r.orderIds.includes(o.id))
      return rOrders.some(o => o.mode === 'instant')
    })
    const pureExpressRoutes = expressRoutes.filter(r => {
      const rOrders = orders.filter(o => r.orderIds.includes(o.id))
      return rOrders.every(o => o.mode === 'instant')
    })
    const mixedRoutes = expressRoutes.length - pureExpressRoutes.length
    if (pureExpressRoutes.length > 0) {
      reasons.push({ type: 'warning', text: `${pureExpressRoutes.length} rota sadece express siparis iceriyor — zaman kisiti nedeniyle diger siparislerle birlestirilemedi.` })
    }
    if (mixedRoutes > 0) {
      reasons.push({ type: 'success', text: `${mixedRoutes} rotada express ve standart siparisler basariyla birlestirildi.` })
    }
  }

  // Kurye basi yuk dengesi
  const routeOrderCounts = routes.map(r => r.orderIds.length)
  const maxLoad = Math.max(...routeOrderCounts)
  const minLoad = Math.min(...routeOrderCounts)
  if (maxLoad > minLoad * 2 && maxLoad > 3) {
    reasons.push({ type: 'warning', text: `Yuk dengesizligi: en yogun rota ${maxLoad} siparis, en hafif ${minLoad} siparis tasiyir.` })
  } else if (totalRoutes > 1) {
    reasons.push({ type: 'success', text: `Yuk dengeli: rotalar arasi siparis farki dusuk (${minLoad}-${maxLoad}).` })
  }

  // Multi-origin analizi
  const multiOriginRoutes = routes.filter(r => r.originIds.length > 1)
  if (multiOriginRoutes.length > 0) {
    reasons.push({ type: 'info', text: `${multiOriginRoutes.length} rota birden fazla noktadan toplama yapiyor — toplam mesafeyi artirabilir ama siparis yogunlugunu yukseltir.` })
  }

  // Uzun rota uyarisi
  const longRoutes = routes.filter(r => r.totalDistanceKm > 15)
  if (longRoutes.length > 0) {
    reasons.push({ type: 'warning', text: `${longRoutes.length} rota 15 km'den uzun — kurye memnuniyeti ve teslim suresi olumsuz etkilenebilir.` })
  }

  // ─── Az siparisli ve kisa sureli rotalarin detayli analizi ───
  const shortRoutes = routes.filter(r => r.orderIds.length <= 2)
  const quickRoutes = routes.filter(r => r.totalTimeSec < 600) // 10 dk altı

  if (shortRoutes.length > 0) {
    reasons.push({ type: 'warning', text: `${shortRoutes.length} rota 2 veya daha az siparis iceriyor — kurye kapasitesi dusuk kullaniliyor.` })
    // Her kisa rotanin nedenini analiz et
    shortRoutes.forEach((r, si) => {
      const rIdx = routes.indexOf(r) + 1
      const rOrders = orders.filter(o => r.orderIds.includes(o.id))
      const explanations = []

      // Neden 1: Express siparis izolasyonu
      const hasExpress = rOrders.some(o => o.mode === 'instant')
      const allExpress = rOrders.every(o => o.mode === 'instant')
      if (allExpress) {
        explanations.push('sadece express siparis — zaman kisiti nedeniyle baska siparislerle birlestirilemedi')
      } else if (hasExpress) {
        explanations.push('express siparis iceriyor — sinirli birlestirme yapildi')
      }

      // Neden 2: Cografi izolasyon — diger rotalardaki siparislere uzak
      if (!hasExpress) {
        const otherRoutes = routes.filter(or => or.id !== r.id)
        if (otherRoutes.length > 0) {
          const rDeliveries = rOrders.map(o => o.deliveryLocation)
          let minDistToOther = Infinity
          for (const or of otherRoutes) {
            const orOrders = orders.filter(o => or.orderIds.includes(o.id))
            for (const rd of rDeliveries) {
              for (const od of orOrders) {
                const d = haversine(rd.lat, rd.lng, od.deliveryLocation.lat, od.deliveryLocation.lng)
                if (d < minDistToOther) minDistToOther = d
              }
            }
          }
          if (minDistToOther > 5) {
            explanations.push(`en yakin diger rotaya ${minDistToOther.toFixed(1)} km uzakta — cografi olarak izole bolge`)
          } else if (minDistToOther > 2) {
            explanations.push(`diger rotalara mesafe ${minDistToOther.toFixed(1)} km — birlestirme mesafe sinirini asar`)
          }
        }
      }

      // Neden 3: Deadline/pencere uyumsuzlugu
      const tightDeadline = rOrders.filter(o => o.deadline && (o.deadline - Date.now()) < 45 * 60 * 1000)
      if (tightDeadline.length > 0 && !allExpress) {
        explanations.push(`${tightDeadline.length} siparisin deadline'i cok yakin — ekstra siparis eklenirse gecikme riski`)
      }
      // Slotlu siparisler farkli zaman pencerelerinde olabilir
      const slottedOrders = rOrders.filter(o => o.deliveryWindow)
      if (slottedOrders.length > 0) {
        const windows = slottedOrders.map(o => ({ s: o.deliveryWindow.start, e: o.deliveryWindow.end }))
        const uniqueWindows = new Set(windows.map(w => `${Math.floor(w.s/3600000)}`))
        if (uniqueWindows.size > 1) {
          explanations.push(`${uniqueWindows.size} farkli teslimat penceresi — kuryenin bekleme suresi artabilir`)
        }
      }

      // Neden 4: Farkli origin
      if (r.originIds.length > 1 && rOrders.length <= 2) {
        explanations.push('farkli toplanma noktalari — ayni rotada birden fazla magaza, siparis sayisi dusuk kalir')
      }

      // Neden 5: Frigo/ozel kosul
      if (r.isFrozen) {
        explanations.push('soguk zincir (frigo) siparisi — sadece uyumlu siparislerle birlesebilir')
      }

      // Neden 6: Kurye kapasitesi tukenmis (kurye zaten dolu baskalarinda)
      if (!explanations.length) {
        explanations.push('mevcut kuryeler arasinda dengeli dagilim sonucu kalan siparisler bu rotaya atandi')
      }

      if (si < 3) { // ilk 3 kisa rotanin nedenini goster (spam onleme)
        reasons.push({ type: 'info', text: `Rota #${rIdx} (${rOrders.length} sip): ${explanations.join('; ')}.` })
      }
    })
    if (shortRoutes.length > 3) {
      reasons.push({ type: 'info', text: `...ve ${shortRoutes.length - 3} kisa rota daha benzer nedenlerle olusturuldu.` })
    }
  }

  // Kisa sureli rotalar
  if (quickRoutes.length > 0) {
    reasons.push({ type: 'info', text: `${quickRoutes.length} rota 10 dakikadan kisa surede tamamlanabiliyor.` })
    quickRoutes.forEach((r, qi) => {
      if (qi >= 3) return
      const rIdx = routes.indexOf(r) + 1
      const rOrders = orders.filter(o => r.orderIds.includes(o.id))
      const durMin = Math.round(r.totalTimeSec / 60)
      const explanations = []

      // Neden: Yakin mesafe
      if (r.totalDistanceKm < 2) {
        explanations.push(`toplam mesafe sadece ${r.totalDistanceKm.toFixed(1)} km — siparisler birbirine cok yakin`)
      }

      // Neden: Tek origin, tek teslimat
      if (r.originIds.length === 1 && rOrders.length === 1) {
        explanations.push('tek magaza, tek teslimat — rota dogal olarak kisa')
      }

      // Neden: Express hiz onceligi
      const allExp = rOrders.every(o => o.mode === 'instant')
      if (allExp) {
        explanations.push('express siparisler — hizli teslim onceligi nedeniyle az siparis gruplandı')
      }

      if (!explanations.length) {
        explanations.push('siparisler cografi olarak yakin konumda')
      }

      reasons.push({ type: 'info', text: `Rota #${rIdx} (${durMin} dk, ${r.totalDistanceKm.toFixed(1)} km): ${explanations.join('; ')}.` })
    })
    if (quickRoutes.length > 3) {
      reasons.push({ type: 'info', text: `...ve ${quickRoutes.length - 3} kisa sureli rota daha.` })
    }
  }

  // Algoritma secimi aciklamasi
  const algoExplanations = {
    greedy_nearest: 'En yakin kurye atamasi: hiz odakli ama yuk dengesi zayif olabilir.',
    hungarian: 'Dengeli atama (Hungarian): maliyet ve yuk dengesini optimize eder.',
    auction: 'Ihale tabanli: kuryeler teklif verir, rekabetci atama saglar.',
    zone_cascade: 'Bolge tabanli: cografi kumeleme ile yakin siparisler gruplanir.',
    batch_dispatch: 'Toplu dispatch: zaman pencerelerine gore gruplar, yogun saatlerde etkili.',
    multi_objective: 'Cok amacli: maliyet, sure, denge ve memnuniyet birlikte optimize edilir.',
  }
  if (algoExplanations[assignAlgo]) {
    reasons.push({ type: 'algo', text: algoExplanations[assignAlgo] })
  }

  // Kapasite analizi
  if (orders.length > couriers.length * 8) {
    reasons.push({ type: 'warning', text: `Kurye basina ortalama ${avgSipRota.toFixed(0)} siparis — yuksek yogunluk, daha fazla kurye eklenmesi dusunulebilir.` })
  }

  // ─── VERİMLİLİK PUANI (10 üzerinden) ───
  // 5 kriter, her biri 2 puan
  let effScore = 0

  // 1. Siparis/rota yogunlugu (2 puan) — yuksek = iyi
  const densityScore = avgSipRota >= 6 ? 2 : avgSipRota >= 4 ? 1.5 : avgSipRota >= 3 ? 1 : avgSipRota >= 2 ? 0.5 : 0
  effScore += densityScore

  // 2. Km/siparis verimliligi (2 puan) — dusuk = iyi
  const kmScore = avgKmSip <= 1.2 ? 2 : avgKmSip <= 2 ? 1.5 : avgKmSip <= 3 ? 1 : avgKmSip <= 5 ? 0.5 : 0
  effScore += kmScore

  // 3. Yuk dengesi (2 puan) — dengeli = iyi
  const loadRatio = maxLoad > 0 ? minLoad / maxLoad : 1
  const balanceScore = loadRatio >= 0.7 ? 2 : loadRatio >= 0.5 ? 1.5 : loadRatio >= 0.3 ? 1 : 0.5
  effScore += balanceScore

  // 4. Ek km/siparis (2 puan) — dusuk = iyi
  const addedKmScore = avgAddedKm <= 0.5 ? 2 : avgAddedKm <= 0.8 ? 1.5 : avgAddedKm <= 1.2 ? 1 : avgAddedKm <= 2 ? 0.5 : 0
  effScore += addedKmScore

  // 5. Kurye kullanim orani (2 puan) — rota/kurye orani ideal = iyi
  const utilizationRatio = totalRoutes / couriers.length
  const utilScore = utilizationRatio >= 0.7 && utilizationRatio <= 1.0 ? 2
    : utilizationRatio >= 0.5 ? 1.5
    : utilizationRatio >= 0.3 ? 1
    : utilizationRatio > 1.0 ? 1 : 0.5
  effScore += utilScore

  // Yarim puan yuvarla
  effScore = Math.round(effScore * 2) / 2

  algoSimStats.value.efficiencyScore = effScore
  algoSimStats.value.efficiencyBreakdown = {
    density: densityScore,
    kmPerOrder: kmScore,
    balance: balanceScore,
    addedKm: addedKmScore,
    utilization: utilScore,
  }

  // Puana gore yorum
  const scoreComment = effScore >= 9 ? 'Mukemmel verimlilik — maliyet ve kapasite optimal.'
    : effScore >= 7.5 ? 'Iyi verimlilik — kucuk iyilestirmeler mumkun.'
    : effScore >= 6 ? 'Orta verimlilik — bazi rotalarda optimizasyon potansiyeli var.'
    : effScore >= 4 ? 'Dusuk verimlilik — algoritma veya kurye sayisi gozden gecirilmeli.'
    : 'Cok dusuk verimlilik — rotalama stratejisi yeniden degerlendirilmeli.'
  reasons.push({ type: effScore >= 7.5 ? 'success' : effScore >= 5 ? 'warning' : 'warning', text: `Verimlilik puani: ${effScore}/10 — ${scoreComment}` })

  algoSimReasons.value = reasons
  algoSimReasonsOpen.value = true

  algoSimSuggestions.value = []
  algoSimSuggestionsOpen.value = false

  // ─── ALTERNATİF ALGORİTMA ÖNERİLERİ (arka planda) ───
  // Tek eksen degistirerek test et (90 combo yerine ~12 trial — UI donmaz)
  const assignOptions = ['hungarian', 'greedy_nearest', 'auction', 'zone_cascade', 'batch_dispatch', 'multi_objective']
  const routeOptions = ['clarke_wright', 'or_tools_vrp', 'vroom_solver']
  const optOptions = ['2opt', '3opt', 'simulated_annealing', 'genetic', 'ant_colony']

  const trialCombos = []
  // Sadece atama degistir
  for (const a of assignOptions) {
    if (a !== assignAlgo) trialCombos.push({ a, r: routeAlgo, o: optAlgo })
  }
  // Sadece rotalama degistir
  for (const r of routeOptions) {
    if (r !== routeAlgo) trialCombos.push({ a: assignAlgo, r, o: optAlgo })
  }
  // Sadece optimizasyon degistir
  for (const o of optOptions) {
    if (o !== optAlgo) trialCombos.push({ a: assignAlgo, r: routeAlgo, o })
  }

  // Snapshot orders for async trial
  const trialOrders = orders.map(o => ({ ...o }))
  const trialCouriers = couriers.map(c => ({ ...c }))
  const capturedEffScore = effScore
  const capturedTotalRoutes = totalRoutes
  const capturedTotalKmAll = totalKmAll
  const capturedAssignAlgo = assignAlgo
  const capturedRouteAlgo = routeAlgo
  const capturedOptAlgo = optAlgo

  setTimeout(() => {
    const trials = []
    for (const combo of trialCombos) {
      try {
        const result = runSimulationTrial(trialOrders, trialCouriers, combo.a, combo.r, combo.o)
        if (result) trials.push(result)
      } catch (_) { /* skip broken combos */ }
    }

    // En iyi alternatifleri bul
    const betterTrials = trials.filter(t => t.score > capturedEffScore).sort((a, b) => b.score - a.score || a.totalRoutes - b.totalRoutes)
    const sameScoreBetter = trials.filter(t => t.score === capturedEffScore && (t.totalRoutes < capturedTotalRoutes || t.totalKm < capturedTotalKmAll))
      .sort((a, b) => a.totalRoutes - b.totalRoutes || a.totalKm - b.totalKm)

    const suggestions = []
    const algoName = (id) => getAlgoById(id)?.name || id

    const topBetter = betterTrials.slice(0, 3)
    for (const t of topBetter) {
      const parts = []
      if (t.assignAlgo !== capturedAssignAlgo) parts.push(`atama: ${algoName(t.assignAlgo)}`)
      if (t.routeAlgo !== capturedRouteAlgo) parts.push(`rotalama: ${algoName(t.routeAlgo)}`)
      if (t.optAlgo !== capturedOptAlgo) parts.push(`optimizasyon: ${algoName(t.optAlgo)}`)
      const change = parts.join(', ')
      const routeDiff = t.totalRoutes - capturedTotalRoutes
      const routeText = routeDiff < 0 ? `${Math.abs(routeDiff)} daha az rota` : routeDiff > 0 ? `${routeDiff} daha fazla rota` : 'ayni rota sayisi'
      suggestions.push({
        type: 'better',
        score: t.score,
        totalRoutes: t.totalRoutes,
        totalKm: t.totalKm.toFixed(1),
        text: `${change} kullansaydiniz → ${t.totalRoutes} rota, puan ${t.score}/10 (${routeText})`,
        combo: { assignment: t.assignAlgo, routing: t.routeAlgo, optimization: t.optAlgo },
      })
    }

    if (sameScoreBetter.length > 0 && topBetter.length < 3) {
      const t = sameScoreBetter[0]
      const parts = []
      if (t.assignAlgo !== capturedAssignAlgo) parts.push(`atama: ${algoName(t.assignAlgo)}`)
      if (t.routeAlgo !== capturedRouteAlgo) parts.push(`rotalama: ${algoName(t.routeAlgo)}`)
      if (t.optAlgo !== capturedOptAlgo) parts.push(`optimizasyon: ${algoName(t.optAlgo)}`)
      const change = parts.join(', ')
      const kmDiff = (capturedTotalKmAll - t.totalKm).toFixed(1)
      suggestions.push({
        type: 'equal',
        score: t.score,
        totalRoutes: t.totalRoutes,
        totalKm: t.totalKm.toFixed(1),
        text: `${change} ile ayni puan (${t.score}/10) ama ${t.totalRoutes < capturedTotalRoutes ? (capturedTotalRoutes - t.totalRoutes) + ' daha az rota' : kmDiff + ' km daha kisa'}`,
        combo: { assignment: t.assignAlgo, routing: t.routeAlgo, optimization: t.optAlgo },
      })
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'optimal',
        score: capturedEffScore,
        text: `Mevcut kombinasyon (${capturedEffScore}/10) test edilen ${trials.length} alternatif arasinda en iyi sonucu veriyor.`,
        combo: null,
      })
    }

    algoSimSuggestions.value = suggestions
    algoSimSuggestionsOpen.value = true
  }, 50)

  if (algoLeafletMap) drawAlgoMap(true)
}

// ─── Assignment Strategies ───────────────────────────────────────
// Siparisleri aciliyet sirasina gore sirala: kalan sure az olan once
function sortByUrgency(orders) {
  const now = Date.now()
  return [...orders].sort((a, b) => {
    // Express her zaman once
    if (a.mode === 'instant' && b.mode !== 'instant') return -1
    if (b.mode === 'instant' && a.mode !== 'instant') return 1
    // Sonra kalan sure (deadline - now)
    const aRemain = (a.deadline || Infinity) - now
    const bRemain = (b.deadline || Infinity) - now
    // Slotlu siparislerde pencere baslangicini da dikkate al
    const aWindowStart = a.deliveryWindow?.start || a.deadline || Infinity
    const bWindowStart = b.deliveryWindow?.start || b.deadline || Infinity
    // Pencere baslangici yaklasan once gelmeli
    if (Math.abs(aWindowStart - bWindowStart) > 1800000) return aWindowStart - bWindowStart
    return aRemain - bRemain
  })
}

// Siparisin aciliyet katsayisi
function getUrgencyScore(order) {
  const now = Date.now()
  const remain = ((order.deadline || now + 3600000) - now) / 60000 // dakika
  if (order.mode === 'instant') return remain <= 30 ? 3.0 : 2.5
  if (order.mode === 'standard' && order.deliveryWindow) {
    const windowStart = (order.deliveryWindow.start - now) / 60000
    if (windowStart <= 30) return 2.0 // pencere basliyor, acil
    if (windowStart <= 60) return 1.5
    return 1.0
  }
  // flex
  return remain <= 120 ? 0.8 : 0.5
}

function assignOrdersToCouriers(orders, couriers, algo, params) {
  const n = couriers.length
  const assignments = Array.from({ length: n }, () => [])
  // Tum algoritmalarda aciliyet siralamasi uygula
  const sortedOrders = sortByUrgency(orders)

  if (algo === 'greedy_nearest') {
    // Nearest neighbor: each order goes to nearest available courier
    const courierLoads = new Array(n).fill(0)
    const maxDist = params.maxDistance || 20
    sortedOrders.forEach(order => {
      let bestIdx = 0, bestDist = Infinity
      const urgency = getUrgencyScore(order)
      couriers.forEach((c, ci) => {
        const d = haversine(c.location.lat, c.location.lng, order.deliveryLocation.lat, order.deliveryLocation.lng)
        const load = courierLoads[ci]
        const score = d / urgency + load * 2 // acil siparisler mesafe toleransini artir
        if (d <= maxDist && score < bestDist) { bestDist = score; bestIdx = ci }
      })
      assignments[bestIdx].push(order)
      courierLoads[bestIdx]++
    })
  } else if (algo === 'auction') {
    // Auction: simulate bidding — couriers bid based on distance + capacity + urgency
    const courierLoads = new Array(n).fill(0)
    const minBidders = params.minBidders || 3
    sortedOrders.forEach(order => {
      const urgency = getUrgencyScore(order)
      const bids = couriers.map((c, ci) => {
        const d = haversine(c.location.lat, c.location.lng, order.deliveryLocation.lat, order.deliveryLocation.lng)
        return { ci, bid: (d / urgency) * (1 + courierLoads[ci] * 0.3) + Math.random() * 0.5 }
      })
      bids.sort((a, b) => a.bid - b.bid)
      const winner = bids[0]
      assignments[winner.ci].push(order)
      courierLoads[winner.ci]++
    })
  } else if (algo === 'zone_cascade') {
    // Zone-Based Cascade: group by geographic zones, cascade assign
    const zones = {}
    sortedOrders.forEach(order => {
      const zoneKey = `${Math.floor(order.deliveryLocation.lat * 20)}_${Math.floor(order.deliveryLocation.lng * 20)}`
      if (!zones[zoneKey]) zones[zoneKey] = []
      zones[zoneKey].push(order)
    })
    const zoneBatches = Object.values(zones).sort((a, b) => b.length - a.length)
    let ci = 0
    zoneBatches.forEach(batch => {
      // Assign entire zone to one courier if possible
      const maxSteps = params.maxCascadeSteps || 5
      if (batch.length <= maxSteps) {
        assignments[ci % n].push(...batch)
        ci++
      } else {
        // Split zone evenly
        const half = Math.ceil(batch.length / 2)
        assignments[ci % n].push(...batch.slice(0, half))
        ci++
        assignments[ci % n].push(...batch.slice(half))
        ci++
      }
    })
  } else if (algo === 'batch_dispatch') {
    // Batch: group by delivery window, then distribute evenly
    const batchSize = params.maxBatchSize || 30
    const minBatch = params.minBatchSize || 5
    // Siparis moduna gore grupla: express once, sonra slotlu (pencere baslangicina gore), sonra flex
    const sorted = sortByUrgency(orders)
    const batches = []
    for (let i = 0; i < sorted.length; i += batchSize) {
      batches.push(sorted.slice(i, i + batchSize))
    }
    let ci = 0
    batches.forEach(batch => {
      const perCourier = Math.max(minBatch, Math.ceil(batch.length / Math.max(1, n - ci)))
      for (let i = 0; i < batch.length; i += perCourier) {
        assignments[ci % n].push(...batch.slice(i, i + perCourier))
        ci++
      }
    })
  } else if (algo === 'multi_objective') {
    // Multi-objective: balance cost, time, load, and satisfaction
    const wCost = params.costWeight || 0.3
    const wTime = params.timeWeight || 0.3
    const wSat = params.satisfactionWeight || 0.2
    const wBal = params.balanceWeight || 0.2
    const courierLoads = new Array(n).fill(0)
    const courierKm = new Array(n).fill(0)
    sortedOrders.forEach(order => {
      let bestIdx = 0, bestScore = Infinity
      const urgency = getUrgencyScore(order)
      couriers.forEach((c, ci) => {
        const dist = haversine(c.location.lat, c.location.lng, order.deliveryLocation.lat, order.deliveryLocation.lng)
        const costScore = dist * wCost
        const timeScore = (1 / urgency) * wTime
        const loadImbalance = courierLoads[ci] / Math.max(1, orders.length / n) * wBal
        const satScore = (courierLoads[ci] > orders.length / n * 1.5 ? 2 : 0) * wSat
        const score = costScore + timeScore + loadImbalance + satScore
        if (score < bestScore) { bestScore = score; bestIdx = ci }
      })
      assignments[bestIdx].push(order)
      courierLoads[bestIdx]++
      courierKm[bestIdx] += haversine(couriers[bestIdx].location.lat, couriers[bestIdx].location.lng, order.deliveryLocation.lat, order.deliveryLocation.lng)
    })
  } else {
    // Hungarian-style: balanced assignment by solving cost matrix greedily
    const costWeight = params.costWeight || 0.6
    const timeWeight = params.timeWeight || 0.4
    const courierLoads = new Array(n).fill(0)
    sortedOrders.forEach(order => {
      let bestIdx = 0, bestCost = Infinity
      const urgency = getUrgencyScore(order)
      couriers.forEach((c, ci) => {
        const dist = haversine(c.location.lat, c.location.lng, order.deliveryLocation.lat, order.deliveryLocation.lng)
        const cost = dist / urgency * costWeight + courierLoads[ci] * 3 * timeWeight
        if (cost < bestCost) { bestCost = cost; bestIdx = ci }
      })
      assignments[bestIdx].push(order)
      courierLoads[bestIdx]++
    })
  }

  return assignments
}

// ─── Routing Strategies ──────────────────────────────────────────
function buildRouteWaypoints(orderGroup, algo, params, now) {
  const waypoints = []
  let time = now

  if (algo === 'or_tools_vrp' || algo === 'vroom_solver') {
    // Sort by geographic cluster — nearest neighbor chain
    const remaining = [...orderGroup]
    const sorted = []
    let current = { lat: 41.0, lng: 29.05 } // depot
    while (remaining.length > 0) {
      let bestIdx = 0, bestDist = Infinity
      remaining.forEach((o, i) => {
        const d = haversine(current.lat, current.lng, o.deliveryLocation.lat, o.deliveryLocation.lng)
        if (d < bestDist) { bestDist = d; bestIdx = i }
      })
      sorted.push(remaining.splice(bestIdx, 1)[0])
      current = sorted[sorted.length - 1].deliveryLocation
    }
    orderGroup = sorted
  } else if (algo === 'clarke_wright') {
    // Clarke-Wright savings: merge routes by savings metric
    const depot = { lat: 41.0, lng: 29.05 }
    const savings = []
    for (let i = 0; i < orderGroup.length; i++) {
      for (let j = i + 1; j < orderGroup.length; j++) {
        const di = haversine(depot.lat, depot.lng, orderGroup[i].deliveryLocation.lat, orderGroup[i].deliveryLocation.lng)
        const dj = haversine(depot.lat, depot.lng, orderGroup[j].deliveryLocation.lat, orderGroup[j].deliveryLocation.lng)
        const dij = haversine(orderGroup[i].deliveryLocation.lat, orderGroup[i].deliveryLocation.lng, orderGroup[j].deliveryLocation.lat, orderGroup[j].deliveryLocation.lng)
        savings.push({ i, j, saving: di + dj - dij })
      }
    }
    savings.sort((a, b) => b.saving - a.saving)
    const order = new Array(orderGroup.length).fill(-1)
    let pos = 0
    savings.forEach(s => {
      if (order[s.i] === -1 && order[s.j] === -1) {
        order[s.i] = pos++
        order[s.j] = pos++
      } else if (order[s.i] === -1) {
        order[s.i] = pos++
      } else if (order[s.j] === -1) {
        order[s.j] = pos++
      }
    })
    orderGroup.forEach((_, i) => { if (order[i] === -1) order[i] = pos++ })
    const indexed = orderGroup.map((o, i) => ({ o, idx: order[i] }))
    indexed.sort((a, b) => a.idx - b.idx)
    orderGroup = indexed.map(x => x.o)
  }
  // else: default order (sequential)

  // Build waypoints: pickups first, then deliveries
  const seen = new Set()
  orderGroup.forEach(order => {
    const store = ISTANBUL_STORES.find(s => s.id === order.originId) || ISTANBUL_STORES[0]
    if (!seen.has(order.originId)) {
      seen.add(order.originId)
      waypoints.push({ type: 'pickup', location: { lat: store.lat, lng: store.lng }, orderId: order.id, originId: order.originId, arrivalTime: time, departureTime: time + 600000, deadline: time + 900000 })
      time += 600000
    }
  })
  // Teslimat siralamasi: express once, sonra slotlu (pencere baslangicina gore), sonra flex
  const deliveryOrder = [...orderGroup].sort((a, b) => {
    // Express her zaman ilk
    if (a.mode === 'instant' && b.mode !== 'instant') return -1
    if (b.mode === 'instant' && a.mode !== 'instant') return 1
    // Slotlu: pencere baslangicina gore
    const aStart = a.deliveryWindow?.start || a.deadline || Infinity
    const bStart = b.deliveryWindow?.start || b.deadline || Infinity
    return aStart - bStart
  })

  deliveryOrder.forEach((order) => {
    // Bir onceki noktadan bu teslimat noktasina surus suresi (haversine bazli)
    const prevLoc = waypoints.length > 0 ? waypoints[waypoints.length - 1].location : { lat: 41.0, lng: 29.05 }
    const distKm = haversine(prevLoc.lat, prevLoc.lng, order.deliveryLocation.lat, order.deliveryLocation.lng)
    const driveTimeMs = Math.max(180000, distKm / 25 * 3600000) // min 3dk, ort 25km/h
    const serviceTimeMs = 120000 // 2dk teslimat suresi
    let arrivalTime = time + driveTimeMs

    // Slotlu siparis: pencere henuz baslamadiysa bekle
    if (order.deliveryWindow?.start && arrivalTime < order.deliveryWindow.start) {
      arrivalTime = order.deliveryWindow.start + Math.floor(Math.random() * 300000)
    }

    time = arrivalTime + serviceTimeMs // bir sonraki teslimat icin baslangic zamani
    waypoints.push({
      type: 'delivery', location: order.deliveryLocation, orderId: order.id, originId: order.originId,
      arrivalTime, departureTime: arrivalTime + serviceTimeMs, deadline: order.deadline,
      deliveryWindow: order.deliveryWindow || null,
    })
  })

  return waypoints
}

// ─── Optimization Strategies ─────────────────────────────────────
function optimizeWaypoints(waypoints, algo, params) {
  const deliveries = waypoints.filter(w => w.type === 'delivery')
  const pickups = waypoints.filter(w => w.type === 'pickup')
  if (deliveries.length <= 2) return waypoints

  if (algo === '2opt' || algo === '3opt') {
    // 2-opt: swap pairs to reduce total distance
    const maxIter = params.maxIterations || 500
    const threshold = params.improvementThreshold || 0.01
    let improved = true, iter = 0
    while (improved && iter < maxIter) {
      improved = false
      for (let i = 0; i < deliveries.length - 1; i++) {
        for (let j = i + 1; j < deliveries.length; j++) {
          const before = segDist(deliveries, i, j)
          // Reverse segment
          const reversed = [...deliveries]
          const seg = reversed.splice(i, j - i + 1).reverse()
          reversed.splice(i, 0, ...seg)
          const after = segDist(reversed, i, j)
          if (after < before - threshold) {
            deliveries.splice(0, deliveries.length, ...reversed)
            improved = true
          }
        }
      }
      iter++
    }
  } else if (algo === 'simulated_annealing') {
    // Simulated annealing
    let temp = params.initialTemp || 1000
    const cooling = params.coolingRate || 0.995
    const minTemp = params.minTemp || 1
    while (temp > minTemp) {
      const i = Math.floor(Math.random() * deliveries.length)
      const j = Math.floor(Math.random() * deliveries.length)
      if (i === j) { temp *= cooling; continue }
      const before = totalDeliveryDist(deliveries)
      ;[deliveries[i], deliveries[j]] = [deliveries[j], deliveries[i]]
      const after = totalDeliveryDist(deliveries)
      if (after > before && Math.random() > Math.exp((before - after) / temp)) {
        ;[deliveries[i], deliveries[j]] = [deliveries[j], deliveries[i]] // revert
      }
      temp *= cooling
    }
  } else if (algo === 'genetic') {
    // Simple genetic: generate permutations, keep best
    const popSize = Math.min(params.populationSize || 50, 50)
    const gens = Math.min(params.generations || 100, 100)
    let population = Array.from({ length: popSize }, () => shuffle([...deliveries]))
    for (let g = 0; g < gens; g++) {
      population.sort((a, b) => totalDeliveryDist(a) - totalDeliveryDist(b))
      const elite = population.slice(0, Math.ceil(popSize / 4))
      const newPop = [...elite]
      while (newPop.length < popSize) {
        const parent = elite[Math.floor(Math.random() * elite.length)]
        const child = [...parent]
        // Mutation: swap two random positions
        const a = Math.floor(Math.random() * child.length)
        const b = Math.floor(Math.random() * child.length)
        ;[child[a], child[b]] = [child[b], child[a]]
        newPop.push(child)
      }
      population = newPop
    }
    population.sort((a, b) => totalDeliveryDist(a) - totalDeliveryDist(b))
    deliveries.splice(0, deliveries.length, ...population[0])
  } else if (algo === 'ant_colony') {
    // ACO simplified
    const ants = params.antCount || 30
    const evap = params.evaporationRate || 0.5
    const n = deliveries.length
    const pheromone = Array.from({ length: n }, () => new Array(n).fill(1))
    let best = [...deliveries], bestDist = totalDeliveryDist(best)
    for (let iter = 0; iter < Math.min(ants, 30); iter++) {
      const path = [0]
      const visited = new Set([0])
      while (path.length < n) {
        const curr = path[path.length - 1]
        let probs = []
        for (let j = 0; j < n; j++) {
          if (visited.has(j)) continue
          const d = haversine(deliveries[curr].location.lat, deliveries[curr].location.lng, deliveries[j].location.lat, deliveries[j].location.lng) || 0.1
          probs.push({ j, p: pheromone[curr][j] / d })
        }
        const sum = probs.reduce((s, x) => s + x.p, 0)
        let r = Math.random() * sum, chosen = probs[0]?.j || 0
        for (const pr of probs) { r -= pr.p; if (r <= 0) { chosen = pr.j; break } }
        path.push(chosen)
        visited.add(chosen)
      }
      const reordered = path.map(i => deliveries[i])
      const d = totalDeliveryDist(reordered)
      if (d < bestDist) { best = reordered; bestDist = d }
      // Update pheromones
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) pheromone[i][j] *= (1 - evap)
      for (let i = 0; i < path.length - 1; i++) pheromone[path[i]][path[i+1]] += 1 / (bestDist || 1)
    }
    deliveries.splice(0, deliveries.length, ...best)
  }

  // Recalculate times on optimized delivery sequence
  let time = pickups.length > 0 ? pickups[pickups.length - 1].departureTime : Date.now()
  deliveries.forEach((wp, i) => {
    time += 300000 + i * 120000
    wp.arrivalTime = time
    wp.departureTime = time + 60000
  })

  return [...pickups, ...deliveries]
}

// ─── Geo & Utility helpers ───────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function computeRouteDistance(waypoints) {
  let km = 0
  for (let i = 1; i < waypoints.length; i++) {
    km += haversine(waypoints[i-1].location.lat, waypoints[i-1].location.lng, waypoints[i].location.lat, waypoints[i].location.lng)
  }
  return Math.max(km, 0.5)
}

function totalDeliveryDist(dels) {
  let d = 0
  for (let i = 1; i < dels.length; i++) {
    d += haversine(dels[i-1].location.lat, dels[i-1].location.lng, dels[i].location.lat, dels[i].location.lng)
  }
  return d
}

function segDist(arr, i, j) {
  let d = 0
  for (let k = i; k < j && k < arr.length - 1; k++) {
    d += haversine(arr[k].location.lat, arr[k].location.lng, arr[k+1].location.lat, arr[k+1].location.lng)
  }
  return d
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ========== ALGO MAP ==========

function initAlgoMap() {
  if (!algoMapContainerRef.value || algoLeafletMap) return
  algoLeafletMap = L.map(algoMapContainerRef.value, { center: [41.0, 29.05], zoom: 12, zoomControl: true })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 19,
  }).addTo(algoLeafletMap)

  // Add store markers
  ISTANBUL_STORES.forEach(store => {
    const icon = createStoreIcon(store.brand)
    const m = L.marker([store.lat, store.lng], { icon })
    m.bindPopup(`<strong>${store.name}</strong><br/>${store.brand}`)
    m.addTo(algoLeafletMap)
  })

  // Fix rendering issues
  setTimeout(() => { algoLeafletMap && algoLeafletMap.invalidateSize() }, 100)

  updateAlgoMap()
}

function destroyAlgoMap() {
  if (algoLeafletMap) {
    algoLeafletMap.remove()
    algoLeafletMap = null
    Object.keys(algoCourierMarkers).forEach(k => delete algoCourierMarkers[k])
    Object.keys(algoRoutePolylines).forEach(k => delete algoRoutePolylines[k])
    Object.keys(algoOrderMarkers).forEach(k => delete algoOrderMarkers[k])
  }
}

const MODE_LABELS = { instant: 'Express', standard: 'Slotlu', flex: 'Esnek', same_day: 'Gun Ici' }

// Build a routeId->color lookup from orders
function getOrderRouteColor(order) {
  if (!order.routeId) return null
  const route = algoSimRoutes.value.find(r => r.id === order.routeId)
  return route?.color || null
}

// Find the step number for an order within its route
function getOrderStepInRoute(order) {
  if (!order.routeId) return null
  const route = algoSimRoutes.value.find(r => r.id === order.routeId)
  if (!route) return null
  let deliveryIdx = 0
  for (const wp of route.waypoints) {
    if (wp.type === 'delivery') deliveryIdx++
    if (wp.orderId === order.id && wp.type === 'delivery') return deliveryIdx
  }
  return null
}

function drawAlgoMap(fitBounds) {
  const map = algoLeafletMap
  if (!map) return

  // Clear previous dynamic layers
  Object.keys(algoOrderMarkers).forEach(id => { try { map.removeLayer(algoOrderMarkers[id]) } catch(e) {} delete algoOrderMarkers[id] })
  Object.keys(algoRoutePolylines).forEach(id => {
    try { if (Array.isArray(algoRoutePolylines[id])) algoRoutePolylines[id].forEach(l => map.removeLayer(l)) } catch(e) {}
    delete algoRoutePolylines[id]
  })

  const allPoints = []
  const selectedId = algoSimSelectedRouteId.value
  const orders = algoSimOrders.value
  const routes = algoSimRoutes.value

  // ---- PENDING ORDERS (before dispatch - colored circles) ----
  orders.forEach(order => {
    if (order.status !== 'pending') return
    const { lat, lng } = order.deliveryLocation
    allPoints.push([lat, lng])
    const mColor = MODE_COLORS[order.mode] || '#95a5a6'

    const glow = L.circleMarker([lat, lng], { radius: 9, color: mColor, fillColor: mColor, fillOpacity: 0.15, weight: 0 })
    glow.addTo(map)
    algoOrderMarkers[order.id + '-glow'] = glow

    const m = L.circleMarker([lat, lng], { radius: 5, color: '#fff', fillColor: mColor, fillOpacity: 0.9, weight: 1.5 })
    m.bindPopup(`<b>${order.customerName}</b><br/>${MODE_LABELS[order.mode]} - ${order.deci} desi`)
    m.addTo(map)
    algoOrderMarkers[order.id] = m
  })

  // ---- ROUTES: polylines + step markers ----
  const orderMap = new Map(orders.map(o => [o.id, o]))

  routes.forEach((route, idx) => {
    const color = route.color || ROUTE_COLORS[idx % ROUTE_COLORS.length]
    const isSelected = selectedId === route.id
    const opacity = selectedId ? (isSelected ? 1 : 0.15) : 0.85
    const weight = isSelected ? 5 : 3
    const layers = []

    // Collect coordinates from waypoints
    const coords = []
    route.waypoints.forEach(wp => {
      coords.push([wp.location.lat, wp.location.lng])
    })
    coords.forEach(c => allPoints.push(c))

    // Draw polyline
    if (coords.length > 1) {
      if (isSelected) {
        const shadow = L.polyline(coords, { color: '#000', weight: weight + 4, opacity: 0.15 })
        shadow.addTo(map)
        layers.push(shadow)
      }
      const poly = L.polyline(coords, { color, weight, opacity, lineCap: 'round', lineJoin: 'round' })
      poly.on('click', () => { algoSimSelectedRouteId.value = algoSimSelectedRouteId.value === route.id ? null : route.id })
      poly.addTo(map)
      layers.push(poly)
    }

    // Draw step markers on waypoints
    let deliveryNum = 0
    route.waypoints.forEach((wp, wIdx) => {
      const isPickup = wp.type === 'pickup'
      if (!isPickup) deliveryNum++
      const markerOpacity = selectedId ? (isSelected ? 1 : 0.2) : 1
      const label = isPickup ? 'P' : String(deliveryNum)
      const size = isSelected ? 26 : 22
      const fontSize = isSelected ? 11 : 10
      const borderRadius = isPickup ? '4px' : '50%'

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;border-radius:${borderRadius};background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;font-weight:bold;color:#fff;opacity:${markerOpacity};font-family:system-ui;">${label}</div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
      })

      const m = L.marker([wp.location.lat, wp.location.lng], { icon, zIndexOffset: isSelected ? 1000 + wIdx : 100 + wIdx })
      const order = orderMap.get(wp.orderId)
      if (isPickup) {
        const storeName = ISTANBUL_STORES.find(s => s.id === wp.originId)?.name || 'Magaza'
        m.bindPopup(`<b>TOPLAMA</b><br/>${storeName}`)
      } else if (order) {
        m.bindPopup(`<b>${order.customerName}</b><br/>${MODE_LABELS[order.mode] || ''} - ${order.deci} desi`)
      }
      m.addTo(map)
      layers.push(m)
    })

    algoRoutePolylines[route.id] = layers
  })

  // Include stores in bounds
  ISTANBUL_STORES.forEach(s => allPoints.push([s.lat, s.lng]))

  // Fit bounds
  if (fitBounds && allPoints.length > 0) {
    map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 14 })
  }

  // Zoom to selected route
  if (selectedId) {
    const sr = routes.find(r => r.id === selectedId)
    if (sr && sr.waypoints.length > 0) {
      const pts = sr.waypoints.map(w => [w.location.lat, w.location.lng])
      map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 15 })
    }
  }
}

// Wrapper that ensures map exists
function updateAlgoMap(fitBounds = true) {
  if (!algoLeafletMap) return
  drawAlgoMap(fitBounds)
}

watch(algoSimSelectedRouteId, () => {
  if (algoLeafletMap) drawAlgoMap(false)
})

// Sync simulation data to copilot context store
watch([algoSimOrders, algoSimRoutes, algoSimCouriers, algoSimStats], () => {
  copilotCtx.setSimulationData({
    orders: algoSimOrders.value,
    routes: algoSimRoutes.value,
    couriers: algoSimCouriers.value,
    stats: algoSimStats.value,
    algorithms: { ...selectedAlgorithms },
  })
})

// Computed for order panel filtered list
const algoSimFilteredOrders = computed(() => {
  const tab = algoSimOrderTab.value
  return algoSimOrders.value.filter(o => {
    if (tab === 'all') return true
    if (tab === 'pending') return o.status === 'pending'
    if (tab === 'dispatched') return o.status === 'dispatched' || o.status === 'assigned'
    if (tab === 'delivered') return o.status === 'delivered'
    return true
  })
})

const algoSimOrderCounts = computed(() => ({
  all: algoSimOrders.value.length,
  pending: algoSimOrders.value.filter(o => o.status === 'pending').length,
  dispatched: algoSimOrders.value.filter(o => o.status === 'dispatched' || o.status === 'assigned').length,
  delivered: algoSimOrders.value.filter(o => o.status === 'delivered').length,
}))

// Algo tab watch
watch(activeTab, async (tab, oldTab) => {
  if (tab === 'algorithm') {
    await nextTick()
    initTabMap()
  } else if (oldTab === 'algorithm') {
    destroyAlgoMap()
    if (algoSimCountdownTimer) { clearInterval(algoSimCountdownTimer); algoSimCountdownTimer = null }
  }
})

// Re-init map when switching back to simulator view
watch(algoViewMode, async (mode, oldMode) => {
  if (mode === 'simulator' && activeTab.value === 'algorithm') {
    destroyAlgoMap()
    await nextTick()
    initTabMap()
  } else if (oldMode === 'simulator') {
    destroyAlgoMap()
  }
})

function algoCountdownColor(deadline) {
  const remaining = deadline - algoSimNow.value
  const min = remaining / 60000
  if (remaining <= 0) return 'text-red-600'
  if (min < 15) return 'text-red-500'
  if (min < 30) return 'text-amber-500'
  return 'text-green-600'
}

function algoCountdownText(deadline) {
  const remaining = deadline - algoSimNow.value
  if (remaining <= 0) return 'BITTI'
  const min = Math.floor(remaining / 60000)
  const sec = Math.floor((remaining % 60000) / 1000)
  return `${min}:${String(sec).padStart(2,'0')}`
}

function handleAlgoSlider(e) {
  algoSimSliderMin.value = parseInt(e.target.value)
  algoSimBaseTime.value = Date.now() + algoSimSliderMin.value * 60000
}

function algoSimTimeStr() {
  return new Date(algoSimBaseTime.value).toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' })
}

// Pricing calculator (parametric model)
const pricingCalcInput = reactive({
  mesafe: 3, agirlik: 5, saat: 14,
  zone: 'A', mode: 'standard', haftaSonu: false, frozen: false,
})

const pricingCalcResult = computed(() => {
  const p = pricingParams
  const breakdown = []

  // Base fee
  breakdown.push({ name: 'Temel Ucret', value: p.baseFee, label: `${p.baseFee} TL` })

  // Km fee
  const billableKm = Math.max(0, pricingCalcInput.mesafe - p.perKmAfter)
  const rawKmFee = billableKm * p.perKmFee
  const kmFee = Math.min(rawKmFee, p.maxKmFee)
  breakdown.push({ name: `Km Ucreti (${billableKm.toFixed(1)} km x ${p.perKmFee} TL)`, value: kmFee, label: `${kmFee.toFixed(2)} TL` })

  let subtotal = p.baseFee + kmFee

  // Zone multiplier
  const zoneMultiplier = p.zoneMultipliers[pricingCalcInput.zone] || 1.0
  if (zoneMultiplier !== 1.0) {
    breakdown.push({ name: `Zone ${pricingCalcInput.zone} Primi`, value: null, label: `x${zoneMultiplier}`, isMul: true })
  }
  subtotal *= zoneMultiplier

  // Time multiplier
  const h = pricingCalcInput.saat
  let timeMul = 1.0
  let timeName = ''
  if (h >= 22 || h < 6) { timeMul = p.nightMultiplier; timeName = 'Gece Primi' }
  else if ((h >= 11 && h < 14) || (h >= 18 && h < 21)) { timeMul = p.peakHourMultiplier; timeName = 'Yogun Saat Primi' }
  if (timeMul !== 1.0) {
    breakdown.push({ name: timeName, value: null, label: `x${timeMul}`, isMul: true })
    subtotal *= timeMul
  }

  // Weekend multiplier
  if (pricingCalcInput.haftaSonu && p.weekendMultiplier !== 1.0) {
    breakdown.push({ name: 'Hafta Sonu Primi', value: null, label: `x${p.weekendMultiplier}`, isMul: true })
    subtotal *= p.weekendMultiplier
  }

  // Mode multiplier
  let modeMul = 1.0
  if (pricingCalcInput.mode === 'express' || pricingCalcInput.mode === 'instant') modeMul = p.expressMultiplier
  if (modeMul !== 1.0) {
    breakdown.push({ name: 'Express Primi', value: null, label: `x${modeMul}`, isMul: true })
    subtotal *= modeMul
  }

  // Heavy package
  if (pricingCalcInput.agirlik > p.heavyThreshold) {
    breakdown.push({ name: `Agir Paket (+${p.heavyThreshold}kg)`, value: p.heavyPackageFee, label: `+${p.heavyPackageFee} TL` })
    subtotal += p.heavyPackageFee
  }

  // Frozen
  if (pricingCalcInput.frozen) {
    breakdown.push({ name: 'Soguk Zincir', value: p.frozenFee, label: `+${p.frozenFee} TL` })
    subtotal += p.frozenFee
  }

  return { total: subtotal.toFixed(2), breakdown }
})

// Surge zone mini-map
const surgeMapContainerRef = ref(null)
let surgeLeafletMap = null

async function initSurgeMap() {
  if (!surgeMapContainerRef.value || surgeLeafletMap) return
  surgeLeafletMap = L.map(surgeMapContainerRef.value, { center: [41.0082, 29.0291], zoom: 11, zoomControl: false, attributionControl: false })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(surgeLeafletMap)
  drawSurgeZones()
}

const ZONE_COORDS = { Kadikoy: [40.9828, 29.0771], Besiktas: [41.0430, 29.0060], Sisli: [41.0601, 28.9877], Uskudar: [41.0233, 29.0149] }

function drawSurgeZones() {
  if (!surgeLeafletMap) return
  surgeData.value.zones?.forEach(zone => {
    const coords = ZONE_COORDS[zone.name] || [41.0, 29.0]
    const radius = 500 + zone.orderCount * 15
    const color = zone.multiplier >= 1.5 ? '#ef4444' : zone.multiplier >= 1.2 ? '#f59e0b' : '#22c55e'
    L.circle(coords, { radius, color, fillColor: color, fillOpacity: 0.3, weight: 2 })
      .bindPopup(`<strong>${zone.name}</strong><br/>x${zone.multiplier} | ${zone.orderCount} siparis`)
      .addTo(surgeLeafletMap)
  })
}

watch(activeTab, async (tab, oldTab) => {
  if (tab === 'pricing') {
    await nextTick()
    initSurgeMap()
  } else if (oldTab === 'pricing' && surgeLeafletMap) {
    surgeLeafletMap.remove()
    surgeLeafletMap = null
  }
})

async function loadAlgorithmConfig() {
  algoLoading.value = true
  try {
    const res = await getAlgorithmConfig()
    if (res.ok && res.data) {
      const config = res.data
      if (config.dispatch) Object.keys(config.dispatch).forEach(key => { if (key in algoDispatch) algoDispatch[key] = config.dispatch[key] })
      if (config.mixedMode) {
        if (config.mixedMode.mixedModeEnabled !== undefined) algoMixedMode.enabled = config.mixedMode.mixedModeEnabled
        if (config.mixedMode.mixedModeProximityM !== undefined) algoMixedMode.proximityM = config.mixedMode.mixedModeProximityM
        if (config.mixedMode.mixedModeMaxCompanions !== undefined) algoMixedMode.maxCompanions = config.mixedMode.mixedModeMaxCompanions
        if (config.mixedMode.slotBatchDurationEstimateMs !== undefined) algoMixedMode.batchDurationMin = Math.round(config.mixedMode.slotBatchDurationEstimateMs / 60000)
      }
      if (config.partners && Array.isArray(config.partners)) algoPartners.value = config.partners
    }
  } catch (e) { console.error('[Algorithm] Config load error:', e) }
  finally { algoLoading.value = false }
}

async function saveAlgoSection(section) {
  algoSaving[section] = true
  try {
    const configData = {
      dispatch: { ...algoDispatch },
      mixedMode: {
        mixedModeEnabled: algoMixedMode.enabled,
        mixedModeProximityM: algoMixedMode.proximityM,
        mixedModeMaxCompanions: algoMixedMode.maxCompanions,
        slotBatchDurationEstimateMs: algoMixedMode.batchDurationMin * 60 * 1000,
      },
      partners: algoPartners.value.map((p, i) => ({ ...p, priority: i + 1 })),
    }
    const res = await updateAlgorithmConfig(configData)
    showAlgoToast(res.ok ? 'Ayarlar basariyla kaydedildi' : 'Ayarlar kaydedildi (lokal)')
  } catch (e) { showAlgoToast('Kaydetme hatasi olustu', 'error') }
  finally { algoSaving[section] = false }
}

async function handleRunAlgoDispatch(type) {
  algoDispatching[type] = true
  const startTime = Date.now()
  const typeLabels = { manual: 'Manual Dispatch', osrm: 'OSRM Dispatch', reroute: 'Batch Reroute' }
  try {
    let res
    if (type === 'manual') res = await runDispatch()
    else if (type === 'osrm') res = await runDispatchOsrm()
    else res = await batchReroute()
    const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's'
    const now = new Date().toLocaleTimeString('tr-TR')
    lastDispatchResult.value = { type: typeLabels[type], success: res.ok, duration, time: now }
    showAlgoToast(res.ok ? `${typeLabels[type]} basariyla tamamlandi` : `${typeLabels[type]} basarisiz oldu`, res.ok ? 'success' : 'error')
  } catch (e) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's'
    lastDispatchResult.value = { type: typeLabels[type], success: false, duration, time: new Date().toLocaleTimeString('tr-TR') }
    showAlgoToast(`${typeLabels[type]} hatasi`, 'error')
  } finally { algoDispatching[type] = false }
}

function movePartner(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= algoPartners.value.length) return
  const arr = [...algoPartners.value]
  ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
  algoPartners.value = arr
}

async function checkHealth() {
  healthLoading.value = true
  const now = new Date().toLocaleTimeString('tr-TR')
  try {
    const [osrmRes, vroomRes] = await Promise.allSettled([getOsrmHealth(), getVroomHealth()])
    if (osrmRes.status === 'fulfilled' && osrmRes.value.ok) {
      const d = osrmRes.value.data || {}
      Object.assign(osrmHealth, { status: 'ok', endpoint: d.endpoint || 'localhost:5000', responseTime: d.responseTime || '-', lastCheck: now })
    } else { osrmHealth.status = 'error'; osrmHealth.lastCheck = now }
    if (vroomRes.status === 'fulfilled' && vroomRes.value.ok) {
      const d = vroomRes.value.data || {}
      Object.assign(vroomHealth, { status: 'ok', endpoint: d.endpoint || 'localhost:3000', responseTime: d.responseTime || '-', lastCheck: now })
    } else { vroomHealth.status = 'error'; vroomHealth.lastCheck = now }
  } catch (e) { osrmHealth.status = 'error'; vroomHealth.status = 'error'; osrmHealth.lastCheck = now; vroomHealth.lastCheck = now }
  finally { healthLoading.value = false }
}

// ========== LIFECYCLE ==========

let refreshInterval = null
let sseConnection = null

const pricingLoaded = ref(false)
const algorithmLoaded = ref(false)

// Lazy-load pricing/algorithm data when tab is first activated
watch(activeTab, (tab) => {
  if (tab === 'pricing' && !pricingLoaded.value) {
    pricingLoaded.value = true
    loadPricingRules()
    loadSurgeData()
  }
  if (tab === 'algorithm' && !algorithmLoaded.value) {
    algorithmLoaded.value = true
    loadAlgorithmConfig()
    checkHealth()
  }
}, { immediate: true })

onMounted(() => {
  loadDashboardData()
  refreshInterval = setInterval(loadDashboardData, 30000)
  // Init maps for non-overview tabs (they don't wait for loading)
  if (activeTab.value !== 'overview') {
    algoMapInitRetries = 0
    nextTick(() => initTabMap())
  }
  sseConnection = connectEventStream((event) => {
    // Dashboard aktivite akisi
    if (event.event?.startsWith('order:') || event.type?.startsWith('order:')) {
      const eventName = event.event || event.type || ''
      activities.value.unshift({
        id: `sse-${Date.now()}`,
        type: eventName.includes('delivered') ? 'delivery' : eventName.includes('cancel') ? 'cancel' : 'order',
        title: eventName,
        desc: `${event.data?.orderId || event.orderId || ''}`,
        time: new Date().toISOString(),
      })
      if (activities.value.length > 20) activities.value.pop()
    }

    // Harita SSE guncellemeleri
    const type = event.type || event.event_type
    const data = event.payload || event.data || event

    if (type === 'courier_location' || type === 'location_update') {
      const id = data.courierId || data.courier_id || data.id
      const lat = data.lat ?? data.latitude
      const lng = data.lng ?? data.longitude
      if (id && lat != null && lng != null) {
        mapCouriers.value = mapCouriers.value.map(c => c.id === id ? { ...c, lat, lng } : c)
        if (courierMarkers[id]) courierMarkers[id].setLatLng([lat, lng])
        if (mapSelectedCourier.value?.id === id) mapSelectedCourier.value = { ...mapSelectedCourier.value, lat, lng }
      }
    }

    if (type === 'courier_status') {
      const id = data.courierId || data.courier_id || data.id
      const newStatus = data.status || data.newStatus
      if (id && newStatus) {
        mapCouriers.value = mapCouriers.value.map(c => c.id === id ? { ...c, status: newStatus } : c)
        if (courierMarkers[id]) courierMarkers[id].setIcon(createCourierIcon(newStatus))
        if (mapSelectedCourier.value?.id === id) mapSelectedCourier.value = { ...mapSelectedCourier.value, status: newStatus }
      }
    }

    // Harita olay timeline'i
    if (type) {
      const normalized = normalizeEvent({ ...data, type }, mapEvents.value.length)
      mapEvents.value = [normalized, ...mapEvents.value].slice(0, 200)
    }
  })

})

// Initialize maps when DOM is available
let algoMapInitRetries = 0
function initTabMap() {
  const tab = activeTab.value
  if (tab === 'map') { initMap(); return }
  if (tab === 'pricing') { initSurgeMap(); return }
  if (tab === 'algorithm' && algoViewMode.value === 'simulator') {
    if (algoMapContainerRef.value && !algoLeafletMap) {
      algoMapInitRetries = 0
      initAlgoMap()
      if (!algoSimCountdownTimer) algoSimCountdownTimer = setInterval(() => { algoSimNow.value = Date.now() }, 1000)
    } else if (!algoLeafletMap && algoMapInitRetries < 30) {
      algoMapInitRetries++
      setTimeout(initTabMap, 100)
    }
  }
}
// For overview/map/pricing tabs that depend on dashboard data
watch(loading, async (isLoading) => {
  if (!isLoading) {
    await nextTick()
    if (activeTab.value === 'map' || activeTab.value === 'pricing') {
      initTabMap()
    }
  }
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (sseConnection) sseConnection.close()
  if (algoSimCountdownTimer) clearInterval(algoSimCountdownTimer)
  destroyMap()
  destroyAlgoMap()
  if (surgeLeafletMap) { surgeLeafletMap.remove(); surgeLeafletMap = null }
})

// Filtreler degistiginde verileri yeniden yukle
watch([selectedProject, selectedBranch, selectedDateStart, selectedDateEnd], () => {
  loadDashboardData()
})

// ========== AKTIVITE AKISI ==========

const activityIcons = {
  order: { bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-500', icon: Package },
  delivery: { bg: 'bg-green-50 dark:bg-green-900/30', color: 'text-green-500', icon: CheckCircle },
  courier: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-500', icon: Truck },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', color: 'text-yellow-500', icon: AlertTriangle },
  cancel: { bg: 'bg-red-50 dark:bg-red-900/30', color: 'text-red-500', icon: XCircle },
}

const activityLink = (type) => {
  switch (type) {
    case 'order': return '/orders'
    case 'delivery': return '/orders'
    case 'courier': return '/couriers'
    case 'warning': return '/analytics'
    case 'cancel': return '/orders'
    default: return '/orders'
  }
}

// ========== CHART VERILERI ==========

const weeklyChartData = computed(() => ({
  labels: weeklyData.value.map(d => d.name),
  datasets: [
    { label: 'Bu Hafta', data: weeklyData.value.map(d => d.buHafta), borderColor: '#6366f1', backgroundColor: '#6366f1', borderWidth: 2, pointRadius: 4, tension: 0.4 },
    { label: 'Gecen Hafta', data: weeklyData.value.map(d => d.gecenHafta), borderColor: '#cbd5e1', backgroundColor: '#cbd5e1', borderWidth: 2, pointRadius: 4, tension: 0.4 },
  ],
}))

const weeklyChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: true }, tooltip: { enabled: true } },
  scales: { x: { grid: { display: false }, ticks: { font: { size: 12 } } }, y: { grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { size: 12 } } } },
}

const pieChartData = computed(() => {
  const sliced = statusDist.value.slice(0, 7)
  return {
    labels: sliced.map(s => ORDER_STATUSES[s.name]?.label || s.name),
    datasets: [{ data: sliced.map(s => s.value), backgroundColor: sliced.map((_, i) => PIE_COLORS[i % PIE_COLORS.length]), borderWidth: 2, borderColor: '#ffffff' }],
  }
})

const pieChartOptions = { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false }, tooltip: { enabled: true } } }

const hourlyChartData = computed(() => ({
  labels: hourlyData.value.map(d => d.name),
  datasets: [
    { label: 'Siparis', data: hourlyData.value.map(d => d.siparis), backgroundColor: '#6366f1', borderRadius: 4 },
    { label: 'Ortalama', data: hourlyData.value.map(d => d.ortalama), backgroundColor: '#e2e8f0', borderRadius: 4 },
  ],
}))

const hourlyChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: true }, tooltip: { enabled: true } },
  scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { size: 12 } } } },
}
</script>

<template>
  <!-- Loading/error: only block overview tab, other tabs render immediately -->
  <div v-if="activeTab === 'overview' && loading" class="flex items-center justify-center h-64 text-slate-400">
    <div class="text-center">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      Yukleniyor...
    </div>
  </div>
  <div v-else-if="activeTab === 'overview' && error" class="flex items-center justify-center h-64 text-red-400">
    <div class="text-center">
      <AlertTriangle :size="32" class="mx-auto mb-2" />
      <p>{{ error }}</p>
      <button @click="loadDashboardData" class="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm cursor-pointer">Tekrar Dene</button>
    </div>
  </div>
  <div v-else>
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">
          {{ activeTab === 'overview' ? 'Dashboard' : activeTab === 'map' ? 'Canli Harita' : activeTab === 'pricing' ? 'Fiyatlama' : 'Algoritma' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ activeTab === 'overview' ? 'Genel bakis ve anlik metrikler' : activeTab === 'map' ? 'Kurye ve siparis takip haritasi' : activeTab === 'pricing' ? 'Fiyat kurallari ve surge yonetimi' : 'Rotalama, dispatch ve optimizasyon' }}
        </p>
      </div>
      <div v-if="activeTab === 'overview'" class="flex items-center gap-3">
        <div class="flex items-center gap-2 text-sm mr-4">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span class="text-slate-500 dark:text-slate-400">Canli</span>
        </div>
        <button @click="router.push('/orders/new')" class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer">
          <Plus :size="16" /> Yeni Siparis
        </button>
        <button @click="router.push('/routes/plan')" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <Route :size="16" /> Rota Olustur
        </button>
        <button @click="router.push('/analytics')" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <FileText :size="16" /> Rapor Al
        </button>
      </div>
    </div>

    <!-- Tab navigation is now in sidebar menu -->

    <!-- ==================== GENEL BAKIS TAB ==================== -->
    <div v-if="activeTab === 'overview'">
      <!-- Filters -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 mb-6">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <FolderKanban :size="14" class="text-slate-400" />
            <select v-model="selectedProject" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option v-for="p in PROJECTS" :key="p" :value="p">{{ p === 'Tumu' ? 'Tum Projeler' : p }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <Building2 :size="14" class="text-slate-400" />
            <select v-model="selectedBranch" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option v-for="b in BRANCHES" :key="b" :value="b">{{ b === 'Tumu' ? 'Tum Subeler' : b }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <CalendarDays :size="14" class="text-slate-400" />
            <input type="date" v-model="selectedDateStart" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <span class="text-slate-400 text-xs">-</span>
            <input type="date" v-model="selectedDateEnd" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div v-if="selectedProject !== 'Tumu' || selectedBranch !== 'Tumu'" class="ml-auto">
            <button @click="selectedProject = 'Tumu'; selectedBranch = 'Tumu'; selectedDateStart = new Date().toISOString().split('T')[0]; selectedDateEnd = new Date().toISOString().split('T')[0]" class="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
              <XCircle :size="13" /> Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>

      <!-- Alert Banner -->
      <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="kpis && (parseFloat(kpis.cancelRate.value) > 5)" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
              <AlertTriangle :size="20" class="text-red-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-red-700 dark:text-red-400">Yuksek Iptal Orani Uyarisi</p>
              <p class="text-xs text-red-500 dark:text-red-400/80">Iptal orani %{{ kpis.cancelRate.value }} seviyesinde. Hedef: <%5</p>
            </div>
          </div>
          <button class="px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer">Detay</button>
        </div>
      </Transition>

      <!-- KPI Cards - Primary (large) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div @click="router.push('/orders')" class="cursor-pointer">
          <KpiCard title="Bugunku Siparis" :value="kpis.todayOrders.value" :change="kpis.todayOrders.change" :icon="Package" size="large" :sparkline="kpis.todayOrders.sparkline" />
        </div>
        <div @click="router.push('/routes')" class="cursor-pointer">
          <KpiCard title="Aktif Rota" :value="kpis.activeRoutes.value" :change="kpis.activeRoutes.change" :icon="MapPin" size="large" :sparkline="kpis.activeRoutes.sparkline" />
        </div>
        <div @click="router.push('/couriers')" class="cursor-pointer">
          <KpiCard title="Online Kurye" :value="kpis.onlineCouriers.value" :change="kpis.onlineCouriers.change" :icon="Truck" :suffix="'/' + kpis.onlineCouriers.total" size="large" :sparkline="kpis.onlineCouriers.sparkline" />
        </div>
        <div @click="router.push('/analytics')" class="cursor-pointer">
          <KpiCard title="Teslim Orani" :value="kpis.deliveryRate.value" :change="kpis.deliveryRate.change" :icon="CheckCircle" type="percent" size="large" :sparkline="kpis.deliveryRate.sparkline" />
        </div>
      </div>
      <!-- KPI Cards - Secondary -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div @click="activeTab = 'map'" class="cursor-pointer">
          <KpiCard title="Ort. Teslim Suresi" :value="kpis.avgDeliveryTime.value" :change="kpis.avgDeliveryTime.change" :icon="Clock" suffix=" dk" :sparkline="kpis.avgDeliveryTime.sparkline" />
        </div>
        <div @click="router.push('/finance')" class="cursor-pointer">
          <KpiCard title="Gunluk Gelir" :value="kpis.dailyRevenue.value" :change="kpis.dailyRevenue.change" :icon="Wallet" type="currency" :sparkline="kpis.dailyRevenue.sparkline" />
        </div>
        <div @click="router.push('/orders')" class="cursor-pointer">
          <KpiCard title="Iptal Orani" :value="kpis.cancelRate.value" :change="kpis.cancelRate.change" :icon="XCircle" type="percent" :sparkline="kpis.cancelRate.sparkline" />
        </div>
        <div @click="router.push('/analytics')" class="cursor-pointer">
          <KpiCard title="Musteri Puani" :value="kpis.customerRating.value" :change="kpis.customerRating.change" :icon="Star" suffix="/5" :sparkline="kpis.customerRating.sparkline" />
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div @click="router.push('/analytics')" class="bg-white rounded-xl p-5 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-slate-800 mb-4">Haftalik Siparis Trendi</h3>
          <div style="height: 280px"><Line :data="weeklyChartData" :options="weeklyChartOptions" /></div>
        </div>
        <div @click="router.push('/orders')" class="bg-white rounded-xl p-5 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-slate-800 mb-4">Teslimat Durumu Dagilimi</h3>
          <div style="height: 280px"><Doughnut :data="pieChartData" :options="pieChartOptions" /></div>
          <div class="flex flex-wrap gap-3 mt-2 justify-center">
            <div v-for="(s, i) in statusDist.slice(0, 5)" :key="s.name" class="flex items-center gap-1.5 text-xs">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: PIE_COLORS[i] }" />
              <span class="text-slate-600">{{ ORDER_STATUSES[s.name]?.label || s.name }}: {{ s.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div @click="router.push('/analytics')" class="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-slate-800 mb-4">Saatlik Yogunluk</h3>
          <div style="height: 280px"><Bar :data="hourlyChartData" :options="hourlyChartOptions" /></div>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800 dark:text-white">Son Aktiviteler</h3>
            <div class="flex items-center gap-1.5 text-xs text-green-600">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Canli
            </div>
          </div>
          <div class="space-y-1 max-h-[300px] overflow-y-auto">
            <div
              v-for="a in activities" :key="a.id"
              @click="router.push(activityLink(a.type))"
              :class="[
                'flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 -mx-2 px-2 py-2 rounded-lg transition-colors border-l-[3px]',
                a.type === 'delivery' ? 'border-l-green-400' : a.type === 'cancel' ? 'border-l-red-400' : 'border-l-blue-400'
              ]"
            >
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', (activityIcons[a.type] || activityIcons.order).bg]">
                <component :is="(activityIcons[a.type] || activityIcons.order).icon" :size="14" :class="(activityIcons[a.type] || activityIcons.order).color" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ a.title }}</p>
                  <span class="text-[10px] text-slate-400 flex-shrink-0 tabular-nums">{{ a.time ? new Date(a.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '' }}</span>
                </div>
                <p class="text-xs text-slate-500 truncate">{{ a.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== HARITA TAB ==================== -->
    <div v-else-if="activeTab === 'map'" class="flex flex-col h-[calc(100vh-220px)] bg-gray-50 overflow-hidden rounded-xl border border-slate-200">
      <!-- Stats Bar -->
      <div class="flex items-center gap-4 px-4 py-2 bg-white border-b border-slate-200 text-xs font-medium">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span class="text-slate-600">Canli</span>
        </span>
        <span class="text-slate-400">|</span>
        <span class="text-slate-600">Bekleyen: <strong class="text-slate-900">{{ mapOrders.filter(o=>o.status==='pending'||o.status==='pool').length }}</strong></span>
        <span class="text-slate-400">|</span>
        <span class="text-slate-600">Rota: <strong class="text-slate-900">{{ mapRouteList.length }}</strong></span>
        <span class="text-slate-400">|</span>
        <span class="text-slate-600">Bos Kurye: <strong class="text-slate-900">{{ mapStatusCounts.online }}</strong></span>
        <span class="text-slate-400">|</span>
        <span class="text-slate-600">Dagitimda: <strong class="text-blue-600">{{ mapStatusCounts.delivering }}</strong></span>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- LEFT PANEL -->
        <div class="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
          <div class="px-4 py-3 border-b border-slate-200">
            <h2 class="text-base font-bold text-slate-900">Canli Takip</h2>
            <p class="text-xs text-slate-500 mt-0.5">{{ mapCouriers.length }} kurye &middot; simdi</p>
          </div>

          <!-- Sub Tabs -->
          <div class="px-3 pt-2 pb-1">
            <div class="flex bg-slate-100 rounded-lg p-0.5">
              <button v-for="tab in mapTabs" :key="tab.key" @click="mapTab = tab.key"
                :class="['flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[11px] font-medium transition-all', mapTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
                <component :is="tab.icon" :size="12" />
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Search -->
          <div v-if="mapTab === 'couriers' || mapTab === 'orders'" class="px-3 pb-2">
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" :placeholder="mapTab === 'couriers' ? 'Kurye ara...' : 'Siparis ara...'" v-model="mapSearchQuery"
                class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <!-- Status Filters -->
          <div v-if="mapTab === 'couriers'" class="px-3 pb-2 flex gap-1 flex-wrap">
            <button v-for="f in mapStatusFilterOptions" :key="f.key" @click="mapStatusFilter = f.key"
              :class="['px-2 py-0.5 rounded-full text-[10px] font-medium transition-all', mapStatusFilter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']">
              {{ f.label }} ({{ f.count }})
            </button>
          </div>

          <!-- Tab Content -->
          <div class="flex-1 overflow-y-auto">
            <template v-if="mapTab === 'couriers'">
              <div v-if="filteredMapCouriers.length === 0" class="px-4 py-8 text-center text-xs text-slate-400">Sonuc bulunamadi</div>
              <button v-for="courier in filteredMapCouriers" :key="courier.id" @click="handleMapCourierSelect(courier)"
                :class="['w-full flex items-center gap-3 px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left', mapSelectedCourier?.id === courier.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : '']">
                <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0', MAP_STATUS_COLORS[courier.status]]">{{ courier.avatar }}</div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-slate-900 truncate">{{ courier.name }}</span>
                    <span :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', MAP_STATUS_COLORS[courier.status]]" />
                  </div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span :class="['text-[10px] font-medium', MAP_STATUS_TEXT[courier.status]]">{{ MAP_STATUS_LABELS[courier.status] }}</span>
                    <span v-if="courier.ordersCount > 0" class="text-[10px] text-slate-400">{{ courier.ordersCount }} sip</span>
                  </div>
                </div>
                <ChevronRight :size="14" class="text-slate-300 flex-shrink-0" />
              </button>
            </template>

            <template v-else-if="mapTab === 'orders'">
              <div v-if="filteredMapOrders.length === 0" class="px-4 py-8 text-center text-xs text-slate-400">Siparis bulunamadi</div>
              <div v-for="order in filteredMapOrders" :key="order.id"
                class="flex items-center gap-2 px-3 py-2 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                @click="selectCourierByName(order.courierName)">
                <div :class="['w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0',
                  order.status === 'completed' ? 'bg-green-100 text-green-600' : order.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400']">
                  <Package :size="13" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-slate-900 truncate">{{ order.name }}</p>
                  <p class="text-[10px] text-slate-400 truncate">{{ order.courierName || '-' }}</p>
                </div>
                <span :class="['text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0',
                  order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500']">
                  {{ order.status === 'completed' ? 'Teslim' : order.status === 'active' ? 'Aktif' : 'Bekliyor' }}
                </span>
              </div>
            </template>

            <template v-else-if="mapTab === 'routes'">
              <div v-if="mapRouteList.length === 0" class="px-4 py-8 text-center text-xs text-slate-400">Aktif rota bulunamadi</div>
              <div v-for="(route, rIdx) in mapRouteList" :key="route.id"
                class="px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                :style="{ borderLeft: `3px solid ${ROUTE_COLORS[rIdx % ROUTE_COLORS.length]}` }"
                @click="selectCourierById(route.courierId)">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold text-slate-900">{{ route.name }}</span>
                  <span class="text-[10px] text-slate-400">{{ route.completedStops }}/{{ route.totalStops }}</span>
                </div>
                <p class="text-[10px] text-slate-500 truncate">{{ route.courierName }}</p>
                <div class="w-full h-1 bg-slate-200 rounded-full mt-1.5">
                  <div class="h-full rounded-full transition-all" :style="{ width: `${route.progress}%`, backgroundColor: ROUTE_COLORS[rIdx % ROUTE_COLORS.length] }" />
                </div>
              </div>
            </template>

            <template v-else-if="mapTab === 'events'">
              <div v-if="mapEvents.length === 0" class="px-4 py-8 text-center text-xs text-slate-400">Olay bulunamadi</div>
              <div v-for="(event, idx) in mapEvents" :key="event.id || idx" class="flex gap-2 px-3 py-2 border-b border-slate-100">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  event.type === 'courier_location' ? 'bg-blue-100 text-blue-600' : event.type === 'order_status' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500']">
                  <Navigation v-if="event.type === 'courier_location'" :size="11" />
                  <Package v-else-if="event.type === 'order_status'" :size="11" />
                  <Bell v-else :size="11" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-slate-800 truncate">{{ event.title }}</p>
                  <p class="text-[10px] text-slate-400 truncate">{{ event.time }}</p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- CENTER - LEAFLET MAP -->
        <div class="flex-1 relative overflow-hidden">
          <div ref="mapContainer" style="height: 100%; width: 100%;" />

          <!-- Status Cards -->
          <div class="absolute top-3 left-3 flex gap-1.5 z-[1000]">
            <div v-for="card in mapStatusCards" :key="card.key" :class="['flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm', card.bg]">
              <span :class="card.color"><component :is="card.icon" :size="13" /></span>
              <div>
                <p :class="['text-base font-bold leading-none', card.color]">{{ card.count }}</p>
                <p class="text-[9px] text-slate-500 mt-0.5">{{ card.label }}</p>
              </div>
            </div>
          </div>

          <!-- Legend (top-right) -->
          <div class="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur border border-slate-200 rounded-lg px-3 py-2.5 shadow text-[10px] text-slate-500 space-y-1">
            <div class="font-bold text-slate-800 text-[11px] mb-1">Harita</div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-orange-500 inline-block flex-shrink-0"></span>Magaza</div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-slate-400 inline-block flex-shrink-0"></span>Bekleyen</div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-red-500 inline-block flex-shrink-0"></span>Pickup (P#)</div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500 inline-block flex-shrink-0"></span>Teslimat (#)</div>
            <div class="mt-1 pt-1 border-t border-slate-200 space-y-1">
              <div class="flex items-center gap-1.5">
                <span style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid #2ecc71;display:inline-block;flex-shrink:0"></span>Bos Kurye
              </div>
              <div class="flex items-center gap-1.5">
                <span style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid #e74c3c;display:inline-block;flex-shrink:0"></span>Mesgul
              </div>
            </div>
          </div>

          <!-- Layer Toggle -->
          <div class="absolute bottom-3 right-3 z-[1000]">
            <div class="relative">
              <button @click="mapLayerMenuOpen = !mapLayerMenuOpen" class="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-xs">
                <Layers :size="14" class="text-slate-600" />
                <span class="text-slate-700">Katmanlar</span>
              </button>
              <div v-if="mapLayerMenuOpen" class="absolute right-0 bottom-full mb-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-[1001]">
                <button v-for="layer in mapLayerOptions" :key="layer.key" @click="toggleMapLayer(layer.key)" class="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500"><component :is="layer.icon" :size="13" /></span>
                    <span class="text-xs text-slate-700">{{ layer.label }}</span>
                  </div>
                  <div :class="['w-8 h-4 rounded-full transition-colors flex items-center', mapLayers[layer.key] ? 'bg-blue-500 justify-end' : 'bg-slate-300 justify-start']">
                    <span class="block w-3.5 h-3.5 bg-white rounded-full shadow-sm mx-0.5" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Info -->
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000]">
            <div class="flex items-center gap-1.5 px-3 py-1 bg-white/85 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm">
              <MapPin :size="12" class="text-slate-400" />
              <span class="text-[10px] text-slate-500">Istanbul &middot; {{ mapCouriers.length }} kurye</span>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL - Detail -->
        <transition name="slide-right">
          <div v-if="mapDetailOpen && mapSelectedCourier" class="w-80 flex-shrink-0 bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h2 class="text-sm font-bold text-slate-900">Kurye Detayi</h2>
              <button @click="handleMapCloseDetail" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X :size="16" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto">
              <div class="px-4 py-3 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white', MAP_STATUS_COLORS[mapSelectedCourier.status]]">{{ mapSelectedCourier.avatar }}</div>
                  <div class="flex-1">
                    <h3 class="text-sm font-bold text-slate-900">{{ mapSelectedCourier.name }}</h3>
                    <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1', MAP_STATUS_BG[mapSelectedCourier.status]]">
                      <span :class="['w-1.5 h-1.5 rounded-full', MAP_STATUS_COLORS[mapSelectedCourier.status]]" />
                      {{ MAP_STATUS_LABELS[mapSelectedCourier.status] }}
                    </span>
                  </div>
                </div>
                <button @click="focusCourierOnMap(mapSelectedCourier)" class="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                  <Navigation :size="13" /> Haritada Odakla
                </button>
              </div>
              <div class="px-4 py-3 border-b border-slate-100">
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Performans</h4>
                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-slate-50 rounded-lg p-2 text-center">
                    <p class="text-base font-bold text-slate-900">{{ mapSelectedCourier.deliveriesToday }}</p>
                    <p class="text-[9px] text-slate-500">Teslimat</p>
                  </div>
                  <div class="bg-slate-50 rounded-lg p-2 text-center">
                    <p class="text-base font-bold text-slate-900">{{ mapSelectedCourier.avgDeliveryTime }}dk</p>
                    <p class="text-[9px] text-slate-500">Ort.</p>
                  </div>
                  <div class="bg-slate-50 rounded-lg p-2 text-center">
                    <p class="text-base font-bold text-slate-900">{{ mapSelectedCourier.rating }}</p>
                    <p class="text-[9px] text-slate-500">Puan</p>
                  </div>
                </div>
              </div>
              <div v-if="mapSelectedCourier.stops?.length > 0" class="px-4 py-3 border-b border-slate-100">
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Aktif Rota ({{ mapSelectedCourier.stops.length }} durak)</h4>
                <div class="space-y-0">
                  <div v-for="(stop, idx) in mapSelectedCourier.stops" :key="stop.id || idx" class="flex gap-2">
                    <div class="flex flex-col items-center">
                      <div :class="['w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                        stop.status === 'completed' ? 'bg-green-500 text-white' : stop.status === 'active' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500']">
                        <span v-if="stop.status === 'completed'">✓</span>
                        <span v-else>{{ idx+1 }}</span>
                      </div>
                      <div v-if="idx < mapSelectedCourier.stops.length - 1" class="w-px flex-1 min-h-[16px] bg-slate-200" />
                    </div>
                    <div class="pb-3 flex-1 min-w-0">
                      <p :class="['text-xs font-medium', stop.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700']">{{ stop.name }}</p>
                      <p class="text-[10px] text-slate-400 truncate">{{ stop.address }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="px-4 py-3">
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Konum</h4>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <MapPin :size="13" class="text-slate-400 flex-shrink-0" />
                    <p class="text-xs text-slate-700">{{ mapSelectedCourier.address || mapSelectedCourier.district || 'Istanbul' }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <Navigation :size="13" class="text-slate-400 flex-shrink-0" />
                    <p class="text-xs text-slate-700">{{ mapSelectedCourier.speed }} km/s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <!-- ==================== FIYATLAMA TAB ==================== -->
    <div v-else-if="activeTab === 'pricing'">
      <!-- Top Row: Surge + Mini Map -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Surge Status -->
        <div>
          <div :class="['rounded-xl border p-5 mb-4', surgeData.active ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800']">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', surgeData.active ? 'bg-red-100 dark:bg-red-900/40' : 'bg-green-100 dark:bg-green-900/40']">
                  <TrendingUp :size="20" :class="surgeData.active ? 'text-red-600' : 'text-green-600'" />
                </div>
                <div>
                  <h3 class="font-semibold text-slate-800 dark:text-white">{{ surgeData.active ? 'Surge Fiyatlama Aktif' : 'Normal Fiyatlama' }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ surgeData.active ? surgeData.reason : 'Talep normal seviyede' }}</p>
                </div>
              </div>
              <div v-if="surgeData.active" class="text-right">
                <p class="text-2xl font-bold text-red-600">x{{ surgeData.multiplier }}</p>
                <p class="text-xs text-slate-500">Genel Carpan</p>
              </div>
            </div>
          </div>

          <!-- Zone Table -->
          <div v-if="surgeData.zones?.length" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <h3 class="font-semibold text-slate-800 dark:text-white text-sm">Bolge Bazli Surge</h3>
            </div>
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  <th class="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400 text-xs">#</th>
                  <th class="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400 text-xs">Bolge</th>
                  <th class="text-center px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400 text-xs">Siparis</th>
                  <th class="text-center px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400 text-xs">Carpan</th>
                  <th class="text-center px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400 text-xs">Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(zone, zi) in surgeData.zones" :key="zone.name" class="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td class="px-4 py-2.5 text-xs text-slate-400">{{ zi+1 }}</td>
                  <td class="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300 text-xs">{{ zone.name }}</td>
                  <td class="px-4 py-2.5 text-center text-slate-600 dark:text-slate-400 text-xs">{{ zone.orderCount }}</td>
                  <td class="px-4 py-2.5 text-center">
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-bold', zone.multiplier >= 1.5 ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : zone.multiplier >= 1.2 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400']">
                      x{{ zone.multiplier }}
                    </span>
                  </td>
                  <td class="px-4 py-2.5 text-center">
                    <span :class="['w-2 h-2 rounded-full inline-block', zone.multiplier > 1.0 ? 'bg-red-500 animate-pulse' : 'bg-green-500']" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Surge Mini Map -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 class="font-semibold text-slate-800 dark:text-white text-sm">Surge Bolgesi Haritasi</h3>
            <p class="text-xs text-slate-500 mt-0.5">Renk: yesil &lt;1.2 | amber &lt;1.5 | kirmizi ≥1.5</p>
          </div>
          <div ref="surgeMapContainerRef" style="height: 240px; width: 100%;" />
        </div>
      </div>

      <!-- Fiyat Parametreleri -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Sliders :size="16" class="text-indigo-500" /> Fiyat Parametreleri
          </h3>
          <button @click="savePricingParams" :disabled="pricingParamsSaving" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50">
            <RefreshCw v-if="pricingParamsSaving" :size="13" class="animate-spin" />
            <CheckCircle v-else :size="13" />
            Kaydet
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <!-- Temel -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-1.5">Temel Ucretler</h4>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Siparis Basi Ucret (TL)</label>
              <input v-model.number="pricingParams.baseFee" type="number" step="0.5" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Km Basi Ucret (TL/km)</label>
              <input v-model.number="pricingParams.perKmFee" type="number" step="0.1" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Ucretsiz Km Siniri</label>
              <input v-model.number="pricingParams.perKmAfter" type="number" step="0.5" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Maks. Km Ucreti (TL)</label>
              <input v-model.number="pricingParams.maxKmFee" type="number" step="1" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>

          <!-- Zone -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-1.5">Zone Carpanlari</h4>
            <div v-for="z in ['A','B','C','D']" :key="z">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Zone {{ z }}
                <span class="ml-1 text-[10px]">{{ z==='A'?'(Merkez)':z==='B'?'(Yakin)':z==='C'?'(Uzak)':'(Dis)' }}</span>
              </label>
              <input v-model.number="pricingParams.zoneMultipliers[z]" type="number" step="0.05" min="1" max="5"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>

          <!-- Zaman -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-1.5">Zaman Primleri</h4>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Yogun Saat (11-14 / 18-21)</label>
              <input v-model.number="pricingParams.peakHourMultiplier" type="number" step="0.05" min="1" max="3"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gece Primi (22-06)</label>
              <input v-model.number="pricingParams.nightMultiplier" type="number" step="0.05" min="1" max="3"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Hafta Sonu Primi</label>
              <input v-model.number="pricingParams.weekendMultiplier" type="number" step="0.05" min="1" max="3"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>

          <!-- Ek Parametreler -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-1.5">Ek Parametreler</h4>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Agir Paket Ucreti (TL)</label>
              <input v-model.number="pricingParams.heavyPackageFee" type="number" step="0.5"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Agir Paket Esigi (kg)</label>
              <input v-model.number="pricingParams.heavyThreshold" type="number" step="1"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Soguk Zincir Ucreti (TL)</label>
              <input v-model.number="pricingParams.frozenFee" type="number" step="0.5"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Express Carpan (eski)</label>
              <input v-model.number="pricingParams.expressMultiplier" type="number" step="0.05" min="1" max="5"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>
        </div>

        <!-- Mod Bazli Fiyatlandirma + Servis Segmentleri + Proje Bazli -->
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Mod Bazli Siparis Basi Ucret -->
            <div>
              <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap :size="12" class="text-amber-500" /> Mod Bazli Siparis Ucreti
              </h4>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                  <label class="text-xs text-slate-500 dark:text-slate-400 w-16">Express</label>
                  <input v-model.number="pricingParams.modeFees.instant" type="number" step="1"
                    class="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" />
                  <span class="text-[10px] text-slate-400">TL</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <label class="text-xs text-slate-500 dark:text-slate-400 w-16">Slotlu</label>
                  <input v-model.number="pricingParams.modeFees.standard" type="number" step="1"
                    class="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <span class="text-[10px] text-slate-400">TL</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                  <label class="text-xs text-slate-500 dark:text-slate-400 w-16">Flex</label>
                  <input v-model.number="pricingParams.modeFees.flex" type="number" step="1"
                    class="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  <span class="text-[10px] text-slate-400">TL</span>
                </div>
              </div>
            </div>

            <!-- Servis Segmentleri (Uber-style Tiers) -->
            <div>
              <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Star :size="12" class="text-violet-500" /> Servis Segmentleri
              </h4>
              <div class="space-y-2">
                <div v-for="(tier, key) in pricingParams.serviceTiers" :key="key"
                  class="p-2 rounded-lg border text-[11px]"
                  :class="key === 'vip' ? 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20'
                    : key === 'premium' ? 'border-violet-200 bg-violet-50/50 dark:border-violet-700 dark:bg-violet-950/20'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-600 dark:bg-slate-800/50'">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold" :class="key === 'vip' ? 'text-amber-700 dark:text-amber-400' : key === 'premium' ? 'text-violet-700 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'">
                      {{ tier.label }}
                    </span>
                    <span class="text-[10px] text-slate-400">min kurye: {{ tier.courierMinScore }}/10</span>
                  </div>
                  <div class="text-[10px] text-slate-500 mb-1.5">{{ tier.description }}</div>
                  <div class="flex items-center gap-2">
                    <label class="text-[10px] text-slate-400 w-14">Carpan:</label>
                    <input v-model.number="tier.multiplier" type="number" step="0.1" min="1" max="5"
                      class="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                    <span class="text-[10px] text-slate-400 font-bold">x{{ tier.multiplier }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Proje Bazli Ek Ucretler -->
            <div>
              <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers :size="12" class="text-indigo-500" /> Proje Bazli Ek Ucret
              </h4>
              <div class="space-y-1.5 max-h-[220px] overflow-y-auto">
                <div v-for="proj in PROJECTS.filter(p => p !== 'Tumu')" :key="proj"
                  class="flex items-center gap-2">
                  <label class="text-[11px] text-slate-600 dark:text-slate-400 flex-1 truncate" :title="proj">{{ proj }}</label>
                  <input v-model.number="pricingParams.projectSurcharges[proj]" type="number" step="1" min="0"
                    class="w-16 px-2 py-1 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <span class="text-[10px] text-slate-400">TL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Surge Params Row -->
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Surge Parametreleri</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="flex items-center gap-3">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Surge Aktif</label>
              <button @click="pricingParams.surgeEnabled = !pricingParams.surgeEnabled"
                :class="['w-10 h-6 rounded-full transition-colors flex items-center cursor-pointer', pricingParams.surgeEnabled ? 'bg-red-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start']">
                <span class="block w-4 h-4 bg-white rounded-full shadow-sm mx-1" />
              </button>
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Surge Esligi (siparis)</label>
              <input v-model.number="pricingParams.surgeThreshold" type="number" step="1"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Maks. Surge Carpani</label>
              <input v-model.number="pricingParams.surgeMax" type="number" step="0.1" min="1"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Surge Artis Hizi (0-1)</label>
              <input v-model.number="pricingParams.surgeDamping" type="number" step="0.05" min="0" max="1"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>
        </div>
      </div>

      <!-- Fiyat Hesaplayici -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-5 mb-6">
        <h3 class="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign :size="16" class="text-green-500" /> Fiyat Hesaplayici
          <span class="text-xs text-slate-400 font-normal">Parametrik model</span>
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
          <div>
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Mesafe (km)</label>
            <input v-model.number="pricingCalcInput.mesafe" type="number" step="0.5" min="0"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Agirlik (kg)</label>
            <input v-model.number="pricingCalcInput.agirlik" type="number" step="0.5" min="0"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Saat (0-23)</label>
            <input v-model.number="pricingCalcInput.saat" type="number" min="0" max="23"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Zone</label>
            <select v-model="pricingCalcInput.zone"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/20">
              <option value="A">A - Merkez (x{{ pricingParams.zoneMultipliers.A }})</option>
              <option value="B">B - Yakin (x{{ pricingParams.zoneMultipliers.B }})</option>
              <option value="C">C - Uzak (x{{ pricingParams.zoneMultipliers.C }})</option>
              <option value="D">D - Dis (x{{ pricingParams.zoneMultipliers.D }})</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Mod</label>
            <select v-model="pricingCalcInput.mode"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/20">
              <option value="standard">Standart</option>
              <option value="express">Express</option>
              <option value="instant">Instant</option>
              <option value="same_day">Ayni Gun</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Hafta Sonu</label>
            <div class="flex-1 flex items-center">
              <button @click="pricingCalcInput.haftaSonu = !pricingCalcInput.haftaSonu"
                :class="['w-10 h-6 rounded-full transition-colors flex items-center cursor-pointer', pricingCalcInput.haftaSonu ? 'bg-indigo-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start']">
                <span class="block w-4 h-4 bg-white rounded-full shadow-sm mx-1" />
              </button>
            </div>
          </div>
          <div class="flex flex-col">
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Frigo</label>
            <div class="flex-1 flex items-center">
              <button @click="pricingCalcInput.frozen = !pricingCalcInput.frozen"
                :class="['w-10 h-6 rounded-full transition-colors flex items-center cursor-pointer', pricingCalcInput.frozen ? 'bg-blue-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start']">
                <span class="block w-4 h-4 bg-white rounded-full shadow-sm mx-1" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="pricingCalcResult" class="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3 bg-green-50 dark:bg-green-950/30 border-b border-green-100 dark:border-green-900">
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Toplam Fiyat</span>
            <span class="text-3xl font-bold text-green-600 dark:text-green-400">{{ pricingCalcResult.total }} TL</span>
          </div>
          <div class="divide-y divide-slate-100 dark:divide-slate-700">
            <div v-for="(item, idx) in pricingCalcResult.breakdown" :key="idx" class="flex items-center justify-between px-5 py-2.5">
              <span class="text-sm text-slate-600 dark:text-slate-400">{{ item.name }}</span>
              <span :class="['text-sm font-semibold', item.isMul ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200']">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pricing Rules Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <DollarSign :size="18" class="text-slate-500" /> Fiyat Kurallari
          <span class="text-xs text-slate-400 font-normal">({{ pricingRules.filter(r=>r.isActive).length }} aktif / {{ pricingRules.length }} toplam)</span>
        </h3>
        <button @click="showAddRule = !showAddRule" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <Plus :size="16" /> Kural Ekle
        </button>
      </div>

      <!-- Add Rule Form -->
      <div v-if="showAddRule" class="bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-800 p-4 mb-4">
        <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Yeni Fiyat Kurali</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input v-model="newRule.name" placeholder="Kural adi" class="px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <select v-model="newRule.type" class="px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm cursor-pointer">
            <option value="per_delivery">Teslimat Basi</option>
            <option value="surcharge">Ek Ucret</option>
            <option value="multiplier">Carpan</option>
            <option value="flat">Sabit</option>
          </select>
          <input v-model.number="newRule.value" type="number" placeholder="Deger" class="px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <input v-model="newRule.condition" placeholder="Kosul (orn: mesafe < 5km)" class="px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div class="flex gap-2 mt-3">
          <button @click="handleAddRule" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer">Kaydet</button>
          <button @click="showAddRule = false" class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium cursor-pointer">Iptal</button>
        </div>
      </div>

      <!-- Rules Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-xs">#</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-xs">Kural Adi</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-xs">Tip</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-xs">Deger</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-xs">Kosul</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-xs">Durum</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-xs">Islem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rule, ri) in pricingRules" :key="rule._id" class="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td class="px-4 py-3 text-xs text-slate-400">{{ ri+1 }}</td>
              <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 text-xs">{{ rule.name }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <DollarSign v-if="rule.type==='per_delivery'" :size="12" class="text-indigo-500" />
                  <TrendingUp v-else-if="rule.type==='multiplier'" :size="12" class="text-amber-500" />
                  <Plus v-else-if="rule.type==='surcharge'" :size="12" class="text-green-500" />
                  <span class="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-medium">{{ ruleTypeLabels[rule.type] || rule.type }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300 text-xs">
                {{ rule.type === 'multiplier' ? `x${rule.value}` : `${rule.value} TL` }}
              </td>
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400 text-[10px]">{{ rule.condition || '-' }}</td>
              <td class="px-4 py-3 text-center">
                <button @click="toggleRule(rule)" :class="['w-9 h-5 rounded-full transition-colors flex items-center cursor-pointer', rule.isActive ? 'bg-green-500 justify-end' : 'bg-slate-300 justify-start']">
                  <span class="block w-3.5 h-3.5 bg-white rounded-full shadow-sm mx-0.5" />
                </button>
              </td>
              <td class="px-4 py-3 text-center">
                <button @click="handleDeleteRule(rule._id)" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded cursor-pointer">
                  <XCircle :size="14" class="text-red-400" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== ALGORITMA TAB ==================== -->
    <div v-else-if="activeTab === 'algorithm'">
      <!-- Toast -->
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-2 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition-all duration-200 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-2 opacity-0">
        <div v-if="algoToast.show" :class="['fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium', algoToast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200']">
          <CheckCircle v-if="algoToast.type === 'success'" :size="16" />
          <XCircle v-else :size="16" />
          {{ algoToast.message }}
        </div>
      </Transition>

      <!-- ===== VIEW MODE SWITCHER ===== -->
      <div class="flex items-center gap-1 mb-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 w-fit">
        <button v-for="vm in [{id:'simulator',label:'Simulator',icon:Play},{id:'algorithms',label:'Algoritma Secimi',icon:Cpu},{id:'config',label:'Yapilandirma',icon:Settings}]"
          :key="vm.id" @click="algoViewMode = vm.id"
          :class="['flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer', algoViewMode === vm.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800']">
          <component :is="vm.icon" :size="14" /> {{ vm.label }}
        </button>
      </div>

      <!-- ===== ALGORITMA SECIMI VIEW ===== -->
      <div v-if="algoViewMode === 'algorithms'">
        <!-- Active Pipeline Summary -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Zap :size="14" class="text-amber-500" /> Aktif Pipeline
          </h3>
          <div class="flex items-center gap-2 flex-wrap">
            <template v-for="(role, ridx) in ['assignment','routing','optimization','ml','hybrid']" :key="role">
              <div :class="['flex items-center gap-2 px-3 py-2 rounded-lg border text-sm', selectedAlgorithms[role] ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50']">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{{ roleName(role) }}</span>
                <span v-if="selectedAlgorithms[role]" class="font-medium text-indigo-700 dark:text-indigo-300 text-xs">
                  {{ getAlgoById(selectedAlgorithms[role])?.icon }} {{ getAlgoById(selectedAlgorithms[role])?.name }}
                </span>
                <span v-else class="text-slate-400 text-xs italic">Secilmedi</span>
              </div>
              <span v-if="ridx < 4" class="text-slate-300 dark:text-slate-600 font-bold">→</span>
            </template>
            <button @click="savePipeline" :disabled="pipelineSaving" class="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50">
              <RefreshCw v-if="pipelineSaving" :size="13" class="animate-spin" />
              <CheckCircle v-else :size="13" />
              Pipeline Kaydet
            </button>
          </div>
        </div>

        <!-- Algorithm Category Sections -->
        <div class="space-y-6">
          <div v-for="cat in ALGO_CATEGORIES" :key="cat">
            <div class="flex items-center gap-3 mb-3">
              <h3 class="font-bold text-slate-800 dark:text-white text-base">{{ cat }}</h3>
              <span v-if="categoryRole(cat)" class="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">
                Aktif: {{ getAlgoById(selectedAlgorithms[categoryRole(cat)])?.name || 'Secilmedi' }}
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <div v-for="algo in getCategoryAlgos(cat)" :key="algo.id"
                :class="['rounded-xl border p-4 cursor-pointer transition-all', selectedAlgorithms[categoryRole(cat)] === algo.id ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 shadow-md' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm']"
                @click="categoryRole(cat) && selectAlgorithm(categoryRole(cat), algo.id)">
                <!-- Header -->
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{{ algo.icon }}</span>
                    <div>
                      <h4 class="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{{ algo.name }}</h4>
                      <span :class="['inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5', complexityColor(algo.complexity)]">{{ algo.complexity }}</span>
                    </div>
                  </div>
                  <div v-if="categoryRole(cat)" :class="['w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors', selectedAlgorithms[categoryRole(cat)] === algo.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600']">
                    <div v-if="selectedAlgorithms[categoryRole(cat)] === algo.id" class="w-full h-full rounded-full bg-white scale-50" />
                  </div>
                </div>
                <!-- Description -->
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">{{ algo.description }}</p>
                <!-- Companies -->
                <p class="text-[10px] text-slate-400 dark:text-slate-500 mb-2">
                  <span class="font-semibold">Kullananlar:</span> {{ algo.companies }}
                </p>
                <!-- Best for -->
                <p class="text-[10px] text-indigo-600 dark:text-indigo-400 italic">{{ algo.bestFor }}</p>

                <!-- Editable params when selected -->
                <div v-if="categoryRole(cat) && selectedAlgorithms[categoryRole(cat)] === algo.id && algoParamEdits[algo.id]"
                  class="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800 space-y-2"
                  @click.stop>
                  <p class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Parametreler</p>
                  <div v-for="(val, key) in algoParamEdits[algo.id]" :key="key" class="flex items-center gap-2">
                    <label class="text-[10px] text-slate-500 dark:text-slate-400 flex-1 truncate">{{ key }}</label>
                    <template v-if="typeof val === 'boolean'">
                      <button @click="algoParamEdits[algo.id][key] = !algoParamEdits[algo.id][key]; persistAlgoSelection()"
                        :class="['w-7 h-4 rounded-full transition-colors flex items-center cursor-pointer', val ? 'bg-indigo-500 justify-end' : 'bg-slate-300 justify-start']">
                        <span class="block w-3 h-3 bg-white rounded-full shadow-sm mx-0.5" />
                      </button>
                    </template>
                    <template v-else-if="typeof val === 'number'">
                      <input v-model.number="algoParamEdits[algo.id][key]" type="number" @change="persistAlgoSelection()"
                        class="w-20 px-2 py-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </template>
                    <template v-else>
                      <input v-model="algoParamEdits[algo.id][key]" @change="persistAlgoSelection()"
                        class="w-20 px-2 py-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SIMULATOR VIEW ===== -->
      <div v-else-if="algoViewMode === 'simulator'">
        <!-- Control Panel Bar -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-3 flex items-center gap-4 flex-wrap">
          <!-- 3 Siparis Tipi -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              <label class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Express</label>
              <input v-model="simOrderCounts.express" type="number" min="0" placeholder="0"
                class="w-14 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-300 text-center focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400" />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              <label class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Slotlu</label>
              <input v-model="simOrderCounts.slotlu" type="number" min="0" placeholder="0"
                class="w-14 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              <label class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Flex</label>
              <input v-model="simOrderCounts.flex" type="number" min="0" placeholder="0"
                class="w-14 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-300 text-center focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400" />
            </div>
          </div>

          <div class="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

          <!-- Kurye -->
          <div class="flex items-center gap-1.5">
            <Truck :size="13" class="text-slate-400" />
            <label class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Kurye</label>
            <input v-model="simCourierCount" type="number" min="1" placeholder="Oto"
              class="w-14 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-300 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          </div>

          <div class="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

          <!-- Buttons -->
          <button @click="handleAlgoGenerate" :disabled="algoDispatching.manual"
            class="px-4 py-1.5 bg-slate-800 dark:bg-slate-600 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-900 dark:hover:bg-slate-500 disabled:opacity-50 transition-colors">
            Uret
          </button>
          <button @click="handleAlgoDispatch" :disabled="algoDispatching.manual || algoSimOrders.length === 0"
            class="px-5 py-1.5 bg-violet-600 shadow-violet-500/20 hover:bg-violet-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors">
            <RefreshCw v-if="algoAutoSearching" :size="12" class="animate-spin" />
            <Zap v-else :size="12" />
            AI Dispatch
          </button>
          <button @click="handleAlgoReset"
            class="px-3 py-1.5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-lg text-xs cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 transition-colors">
            Sifirla
          </button>

          <!-- Ogrenme durumu -->
          <div v-if="algoLearningHistory.length > 0" class="flex items-center gap-1.5">
            <span class="text-[10px] font-semibold text-violet-600 dark:text-violet-400">🧠 {{ algoLearningHistory.length }} deneyim</span>
          </div>

          <!-- Toplam & Algo indicator -->
          <div class="ml-auto flex items-center gap-3">
            <span v-if="algoSimOrders.length > 0" class="text-xs text-slate-500 dark:text-slate-400">
              Toplam: <strong class="text-slate-700 dark:text-slate-200">{{ algoSimOrders.length }}</strong> siparis
            </span>
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg text-[10px]">
              <Cpu :size="11" class="text-violet-500" />
              <span class="text-violet-600 dark:text-violet-400 font-medium">
                <template v-if="algoAutoResult">
                  {{ getAlgoById(algoAutoResult.bestCombo.assignment)?.name || algoAutoResult.bestCombo.assignment }}
                  → {{ getAlgoById(algoAutoResult.bestCombo.routing)?.name || algoAutoResult.bestCombo.routing }}
                  → {{ getAlgoById(algoAutoResult.bestCombo.optimization)?.name || algoAutoResult.bestCombo.optimization }}
                </template>
                <template v-else>AI Otomatik Secim</template>
              </span>
            </div>
          </div>
        </div>

        <!-- KPI Cards - only show after dispatch -->
        <div v-if="algoSimStats && algoSimStats.totalRoutes > 0" class="flex items-center gap-2 mb-3">
          <div class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center min-w-[80px]">
            <div class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">Ek km/sip</div>
            <div class="text-sm font-bold" :style="{ color: parseFloat(algoSimStats.avgAddedKmPerOrder) <= 0.8 ? '#16a34a' : parseFloat(algoSimStats.avgAddedKmPerOrder) <= 1.5 ? '#d97706' : '#dc2626' }">{{ algoSimStats.avgAddedKmPerOrder }}</div>
          </div>
          <div class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center min-w-[80px]">
            <div class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">Sip/rota</div>
            <div class="text-sm font-bold" :style="{ color: parseFloat(algoSimStats.avgOrdersPerRoute) >= 5 ? '#16a34a' : parseFloat(algoSimStats.avgOrdersPerRoute) >= 3 ? '#d97706' : '#dc2626' }">{{ algoSimStats.avgOrdersPerRoute }}</div>
          </div>
          <div class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center min-w-[80px]">
            <div class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">Km/sip</div>
            <div class="text-sm font-bold" :style="{ color: parseFloat(algoSimStats.avgKmPerOrder) <= 1.5 ? '#16a34a' : parseFloat(algoSimStats.avgKmPerOrder) <= 3 ? '#d97706' : '#dc2626' }">{{ algoSimStats.avgKmPerOrder }}</div>
          </div>
          <div class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center min-w-[80px]">
            <div class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">Multi-origin</div>
            <div class="text-sm font-bold" :style="{ color: algoSimStats.multiOriginRate >= 30 ? '#16a34a' : '#d97706' }">%{{ algoSimStats.multiOriginRate }}</div>
          </div>
          <div class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center min-w-[80px]">
            <div class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">Toplam Rota</div>
            <div class="text-sm font-bold text-slate-700 dark:text-white">{{ algoSimStats.totalRoutes }}</div>
          </div>
          <!-- Verimlilik Puani -->
          <div v-if="algoSimStats.efficiencyScore != null" class="px-3 py-1.5 rounded-lg text-center min-w-[90px] border-2 relative group cursor-default"
            :class="{
              'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700': algoSimStats.efficiencyScore >= 7.5,
              'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700': algoSimStats.efficiencyScore >= 5 && algoSimStats.efficiencyScore < 7.5,
              'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700': algoSimStats.efficiencyScore < 5,
            }">
            <div class="text-[10px] whitespace-nowrap font-medium"
              :class="{
                'text-emerald-600 dark:text-emerald-400': algoSimStats.efficiencyScore >= 7.5,
                'text-amber-600 dark:text-amber-400': algoSimStats.efficiencyScore >= 5 && algoSimStats.efficiencyScore < 7.5,
                'text-red-600 dark:text-red-400': algoSimStats.efficiencyScore < 5,
              }">Verimlilik</div>
            <div class="text-base font-black"
              :class="{
                'text-emerald-700 dark:text-emerald-300': algoSimStats.efficiencyScore >= 7.5,
                'text-amber-700 dark:text-amber-300': algoSimStats.efficiencyScore >= 5 && algoSimStats.efficiencyScore < 7.5,
                'text-red-700 dark:text-red-300': algoSimStats.efficiencyScore < 5,
              }">{{ algoSimStats.efficiencyScore }}<span class="text-[10px] font-medium opacity-60">/10</span></div>
            <!-- Tooltip: breakdown -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
              <div class="bg-slate-800 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                <div class="font-semibold mb-1.5 text-[11px]">Puan Detayi</div>
                <div class="space-y-1">
                  <div class="flex justify-between gap-4"><span class="text-slate-300">Siparis yogunlugu</span><span class="font-bold">{{ algoSimStats.efficiencyBreakdown?.density }}/2</span></div>
                  <div class="flex justify-between gap-4"><span class="text-slate-300">Km/siparis</span><span class="font-bold">{{ algoSimStats.efficiencyBreakdown?.kmPerOrder }}/2</span></div>
                  <div class="flex justify-between gap-4"><span class="text-slate-300">Yuk dengesi</span><span class="font-bold">{{ algoSimStats.efficiencyBreakdown?.balance }}/2</span></div>
                  <div class="flex justify-between gap-4"><span class="text-slate-300">Ek km/siparis</span><span class="font-bold">{{ algoSimStats.efficiencyBreakdown?.addedKm }}/2</span></div>
                  <div class="flex justify-between gap-4"><span class="text-slate-300">Kurye kullanimi</span><span class="font-bold">{{ algoSimStats.efficiencyBreakdown?.utilization }}/2</span></div>
                </div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          </div>
          <!-- Ort. Kurye Puani -->
          <div v-if="algoSimRoutes.length > 0" class="px-3 py-1.5 rounded-lg text-center min-w-[80px] border-2"
            :class="{
              'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700': (algoSimRoutes.reduce((s,r) => s + (r.courierScore||0), 0) / algoSimRoutes.length) >= 7.5,
              'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700': (algoSimRoutes.reduce((s,r) => s + (r.courierScore||0), 0) / algoSimRoutes.length) >= 5 && (algoSimRoutes.reduce((s,r) => s + (r.courierScore||0), 0) / algoSimRoutes.length) < 7.5,
              'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700': (algoSimRoutes.reduce((s,r) => s + (r.courierScore||0), 0) / algoSimRoutes.length) < 5,
            }">
            <div class="text-[10px] whitespace-nowrap font-medium"
              :class="{
                'text-emerald-600 dark:text-emerald-400': (algoSimRoutes.reduce((s,r) => s + (r.courierScore||0), 0) / algoSimRoutes.length) >= 7.5,
                'text-amber-600 dark:text-amber-400': (algoSimRoutes.reduce((s,r) => s + (r.courierScore||0), 0) / algoSimRoutes.length) < 7.5,
              }">Kurye Puan</div>
            <div class="text-base font-black"
              :class="{
                'text-emerald-700 dark:text-emerald-300': (algoSimRoutes.reduce((s,r) => s + (r.courierScore||0), 0) / algoSimRoutes.length) >= 7.5,
                'text-amber-700 dark:text-amber-300': (algoSimRoutes.reduce((s,r) => s + (r.courierScore||0), 0) / algoSimRoutes.length) < 7.5,
              }">{{ (algoSimRoutes.reduce((s,r) => s + (r.courierScore||0), 0) / algoSimRoutes.length).toFixed(1) }}<span class="text-[10px] font-medium opacity-60">/10</span></div>
          </div>
          <!-- Toplam Fiyat -->
          <div v-if="algoSimStats.totalPrice" class="px-3 py-1.5 rounded-lg text-center min-w-[80px] border-2 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700">
            <div class="text-[10px] whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">Toplam Fiyat</div>
            <div class="text-base font-black text-emerald-700 dark:text-emerald-300">{{ algoSimStats.totalPrice }}<span class="text-[10px] font-medium opacity-60">TL</span></div>
          </div>
          <!-- Zamaninda Teslimat Orani -->
          <div v-if="algoSimStats.onTimeRate != null" class="px-3 py-1.5 rounded-lg text-center min-w-[90px] border-2"
            :class="{
              'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700': algoSimStats.onTimeRate >= 90,
              'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700': algoSimStats.onTimeRate >= 70 && algoSimStats.onTimeRate < 90,
              'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700': algoSimStats.onTimeRate < 70,
            }">
            <div class="text-[10px] whitespace-nowrap font-medium"
              :class="{
                'text-emerald-600 dark:text-emerald-400': algoSimStats.onTimeRate >= 90,
                'text-amber-600 dark:text-amber-400': algoSimStats.onTimeRate >= 70 && algoSimStats.onTimeRate < 90,
                'text-red-600 dark:text-red-400': algoSimStats.onTimeRate < 70,
              }">Zamaninda</div>
            <div class="text-base font-black"
              :class="{
                'text-emerald-700 dark:text-emerald-300': algoSimStats.onTimeRate >= 90,
                'text-amber-700 dark:text-amber-300': algoSimStats.onTimeRate >= 70 && algoSimStats.onTimeRate < 90,
                'text-red-700 dark:text-red-300': algoSimStats.onTimeRate < 70,
              }">{{ algoSimStats.onTimeRate }}<span class="text-[10px] font-medium opacity-60">%</span></div>
          </div>
        </div>

        <!-- AI Auto-Pilot Sonucu -->
        <div v-if="algoAutoResult" class="mb-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-800 rounded-xl p-3">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-violet-500 text-sm">🧪</span>
            <span class="text-xs font-bold text-violet-700 dark:text-violet-300">AI Otomatik Secim</span>
            <span class="text-[10px] text-violet-500 dark:text-violet-400">{{ algoAutoResult.trialCount }} kombinasyon test edildi</span>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 dark:text-slate-400">Atama:</span>
              <span class="text-[11px] font-bold text-violet-700 dark:text-violet-300">{{ getAlgoById(algoAutoResult.bestCombo.assignment)?.name || algoAutoResult.bestCombo.assignment }}</span>
            </div>
            <span class="text-slate-300 dark:text-slate-600">→</span>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 dark:text-slate-400">Rotalama:</span>
              <span class="text-[11px] font-bold text-violet-700 dark:text-violet-300">{{ getAlgoById(algoAutoResult.bestCombo.routing)?.name || algoAutoResult.bestCombo.routing }}</span>
            </div>
            <span class="text-slate-300 dark:text-slate-600">→</span>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-500 dark:text-slate-400">Optimizasyon:</span>
              <span class="text-[11px] font-bold text-violet-700 dark:text-violet-300">{{ getAlgoById(algoAutoResult.bestCombo.optimization)?.name || algoAutoResult.bestCombo.optimization }}</span>
            </div>
            <div class="ml-auto flex items-center gap-2">
              <span v-if="algoAutoResult.fromLearning" class="text-[9px] px-1.5 py-0.5 bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300 rounded-full font-medium">Gecmisten ogrendi</span>
              <span class="text-[10px] font-bold" :class="algoAutoResult.bestScore >= 8 ? 'text-emerald-600' : algoAutoResult.bestScore >= 6 ? 'text-amber-600' : 'text-red-600'">
                Verimlilik: {{ algoAutoResult.bestScore }}/10
              </span>
              <span v-if="algoAutoResult.courierScore" class="text-[10px] font-bold" :class="algoAutoResult.courierScore >= 8 ? 'text-emerald-600' : algoAutoResult.courierScore >= 6 ? 'text-amber-600' : 'text-red-600'">
                Kurye: {{ algoAutoResult.courierScore }}/10
              </span>
              <span class="text-[10px] text-slate-400">{{ algoAutoResult.totalRoutes }} rota</span>
            </div>
          </div>
          <div v-if="algoLearningHistory.length >= 3" class="mt-2 pt-2 border-t border-violet-200/60 dark:border-violet-700/40 flex items-center gap-3">
            <span class="text-[10px] text-violet-500 dark:text-violet-400">Ogrenme durumu:</span>
            <div class="flex-1 bg-violet-200/50 dark:bg-violet-800/30 rounded-full h-1.5">
              <div class="bg-violet-500 h-1.5 rounded-full transition-all" :style="{ width: Math.min(100, algoLearningHistory.length / 2) + '%' }"></div>
            </div>
            <span class="text-[10px] font-medium text-violet-600 dark:text-violet-400">{{ algoLearningHistory.length }}/200</span>
            <button @click="algoLearningHistory = []; saveLearningHistory(); algoAutoResult = null"
              class="text-[9px] text-slate-400 hover:text-red-500 cursor-pointer transition-colors">Sifirla</button>
          </div>
        </div>

        <!-- Rotalama Analizi -->
        <div v-if="algoSimReasons.length > 0" class="mb-3">
          <button @click="algoSimReasonsOpen = !algoSimReasonsOpen"
            class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">
            <ChevronRight :size="14" :class="['transition-transform', algoSimReasonsOpen ? 'rotate-90' : '']" />
            Rotalama Analizi
            <span class="text-[10px] font-normal text-slate-400">({{ algoSimReasons.length }} bulgu)</span>
          </button>
          <div v-if="algoSimReasonsOpen" class="mt-2 space-y-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 max-h-[180px] overflow-y-auto">
            <div v-for="(reason, ri) in algoSimReasons" :key="ri"
              class="flex items-start gap-2 text-[11px] leading-relaxed">
              <span class="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-blue-400': reason.type === 'info',
                  'bg-amber-400': reason.type === 'warning',
                  'bg-emerald-400': reason.type === 'success',
                  'bg-violet-400': reason.type === 'algo',
                }"></span>
              <span :class="{
                'text-slate-600 dark:text-slate-300': reason.type === 'info',
                'text-amber-700 dark:text-amber-300': reason.type === 'warning',
                'text-emerald-700 dark:text-emerald-300': reason.type === 'success',
                'text-violet-700 dark:text-violet-300': reason.type === 'algo',
              }">{{ reason.text }}</span>
            </div>
          </div>
        </div>

        <!-- Algoritma Onerileri -->
        <div v-if="algoSimSuggestions.length > 0" class="mb-3">
          <button @click="algoSimSuggestionsOpen = !algoSimSuggestionsOpen"
            class="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors cursor-pointer">
            <ChevronRight :size="14" :class="['transition-transform', algoSimSuggestionsOpen ? 'rotate-90' : '']" />
            Algoritma Onerileri
            <span class="text-[10px] font-normal text-slate-400">({{ algoSimSuggestions.filter(s => s.type !== 'optimal').length }} oneri)</span>
          </button>
          <div v-if="algoSimSuggestionsOpen" class="mt-2 space-y-2 bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/30 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 max-h-[220px] overflow-y-auto">
            <div v-for="(sug, si) in algoSimSuggestions" :key="si"
              class="flex items-start gap-2 text-[11px] leading-relaxed rounded-lg p-2 transition-colors"
              :class="{
                'bg-white/80 dark:bg-slate-800/60 border border-emerald-200 dark:border-emerald-800': sug.type === 'better',
                'bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700': sug.type === 'equal',
                'bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800': sug.type === 'optimal',
              }">
              <span class="flex-shrink-0 mt-0.5">
                <span v-if="sug.type === 'better'" class="text-emerald-500 font-bold text-xs">▲</span>
                <span v-else-if="sug.type === 'equal'" class="text-blue-400 font-bold text-xs">═</span>
                <span v-else class="text-emerald-500 font-bold text-xs">✓</span>
              </span>
              <div class="flex-1 min-w-0">
                <span :class="{
                  'text-emerald-800 dark:text-emerald-200': sug.type === 'better' || sug.type === 'optimal',
                  'text-slate-600 dark:text-slate-300': sug.type === 'equal',
                }">{{ sug.text }}</span>
                <div v-if="sug.type === 'better'" class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{{ sug.score }}/10</span>
                  <span class="text-[10px] text-slate-400">{{ sug.totalKm }} km</span>
                  <button v-if="sug.combo" @click="applySuggestion(sug.combo)"
                    class="ml-auto text-[10px] px-2 py-0.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-semibold cursor-pointer transition-colors">
                    Uygula
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3-Panel Layout (full page) -->
        <div class="flex h-[calc(100vh-260px)] min-h-[500px] gap-0 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-4">

          <!-- LEFT: Order Panel -->
          <div class="w-56 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col">
            <div class="px-3 py-2 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <span class="text-sm font-bold text-gray-700 dark:text-slate-300">Siparisler</span>
              <div class="flex items-center gap-1">
                <span class="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{{ algoSimOrders.length }}</span>
                <button @click="openTestOrderModal" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer" title="Test Siparis Olustur">
                  <Plus :size="13" class="text-indigo-500" />
                </button>
              </div>
            </div>
            <!-- Order Tabs -->
            <div class="flex border-b border-gray-200 dark:border-slate-700">
              <button v-for="t in [{key:'all',label:'Tumu'},{key:'pending',label:'Havuz'},{key:'dispatched',label:'Rotalandi'},{key:'delivered',label:'Teslim'}]"
                :key="t.key" @click="algoSimOrderTab = t.key"
                :class="['flex-1 py-1.5 text-[10px] font-medium transition-colors', algoSimOrderTab === t.key ? 'text-red-600 border-b-2 border-red-500 bg-red-50/50 dark:bg-red-950/20' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300']">
                {{ t.label }}
                <span v-if="algoSimOrderCounts[t.key] > 0" class="ml-0.5 opacity-60">({{ algoSimOrderCounts[t.key] }})</span>
              </button>
            </div>
            <!-- Order List -->
            <div class="flex-1 overflow-y-auto p-1.5 space-y-1">
              <div v-if="algoSimFilteredOrders.length === 0" class="text-center py-8 px-3">
                <Package :size="20" class="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p class="text-[10px] text-slate-400 dark:text-slate-500">Siparis yok</p>
              </div>
              <div v-for="order in algoSimFilteredOrders" :key="order.id"
                class="rounded-lg cursor-pointer p-2 transition-all hover:shadow-sm"
                :style="{
                  backgroundColor: order.status === 'pending' ? '#fff' : '#f8fafc',
                  borderLeft: `3px solid ${getOrderRouteColor(order) || MODE_COLORS[order.mode] || '#6b7280'}`,
                  border: `1px solid ${order.status === 'pending' ? '#e2e8f0' : '#f1f5f9'}`,
                  borderLeftWidth: '3px',
                  borderLeftColor: getOrderRouteColor(order) || MODE_COLORS[order.mode] || '#6b7280',
                }"
                @click="order.routeId && (algoSimSelectedRouteId = order.routeId)">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1 min-w-0">
                    <span v-if="getOrderStepInRoute(order)" class="text-[8px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      :style="{ backgroundColor: getOrderRouteColor(order) || '#6b7280' }">
                      {{ getOrderStepInRoute(order) }}
                    </span>
                    <span class="text-[10px] text-slate-800 dark:text-slate-200 font-semibold truncate">{{ order.customerName }}</span>
                  </div>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0" :style="{ backgroundColor: (MODE_COLORS[order.mode]||'#6b7280')+'12', color: MODE_COLORS[order.mode]||'#6b7280' }">
                    {{ MODE_LABELS[order.mode] || order.mode }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-[9px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{{ order.origin?.brand || order.originId?.slice(0,8) }}</span>
                  <span class="text-[9px] text-slate-400">{{ order.deci }}desi</span>
                  <span v-if="order.isFrozen" class="text-[9px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded">FRIGO</span>
                  <span v-if="order.serviceTier && order.serviceTier !== 'standard'" class="text-[8px] font-bold px-1 py-0.5 rounded"
                    :class="order.serviceTier === 'vip' ? 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' : 'text-violet-700 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30'">
                    {{ order.serviceTier === 'vip' ? 'VIP' : 'PREM' }}
                  </span>
                </div>
                <div class="flex items-center justify-between mt-1 gap-1">
                  <span :class="['font-mono text-[9px] font-medium', algoCountdownColor(order.deadline)]">{{ algoCountdownText(order.deadline) }}</span>
                  <span v-if="order.deliveryWindow" class="text-[8px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-1 py-0.5 rounded font-medium">
                    {{ new Date(order.deliveryWindow.start).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}) }}-{{ new Date(order.deliveryWindow.end).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}) }}
                  </span>
                  <span v-if="order.routeId" class="text-[8px] font-medium px-1.5 py-0.5 rounded-full" :style="{ backgroundColor: (getOrderRouteColor(order)||'#6b7280')+'15', color: getOrderRouteColor(order)||'#6b7280' }">
                    Rota #{{ algoSimRoutes.findIndex(r => r.id === order.routeId) + 1 }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- CENTER: Map -->
          <div class="flex-1 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
            <div ref="algoMapContainerRef" style="height: 100%; width: 100%;" />

            <!-- Empty state overlay -->
            <div v-if="algoSimOrders.length === 0 && algoSimRoutes.length === 0" class="absolute inset-0 z-[900] flex items-center justify-center pointer-events-none">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/80 dark:bg-slate-700/80 backdrop-blur flex items-center justify-center shadow-lg">
                  <MapIcon :size="28" class="text-slate-400" />
                </div>
                <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Siparis sayilarini girin ve Uret butonuna basin</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Harita uzerinde siparisler ve rotalar gorunecek</p>
              </div>
            </div>

            <!-- Legend -->
            <div class="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-lg text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
              <div class="font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1.5 flex items-center gap-1.5">
                <Layers :size="11" class="text-indigo-500" /> Harita
              </div>
              <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-orange-500 inline-block shadow-sm"></span> Magaza</div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full inline-block shadow-sm" style="background: radial-gradient(circle, #e74c3c 40%, #3498db 60%)"></span> Siparis
              </div>
              <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded inline-block bg-amber-500 shadow-sm"></span> Toplama</div>
              <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full inline-block bg-blue-500 shadow-sm"></span> Teslimat</div>
              <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded inline-block shadow-sm" style="background:linear-gradient(135deg,#e74c3c,#3498db)"></span> Rota</div>
            </div>

            <!-- Order count overlay -->
            <div v-if="algoSimOrders.length > 0" class="absolute bottom-3 left-3 z-[1000] flex items-center gap-2">
              <div v-if="algoSimOrderCounts.pending > 0" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-sm flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span class="text-[10px] font-medium text-slate-600 dark:text-slate-300">{{ algoSimOrderCounts.pending }} bekleyen</span>
              </div>
              <div v-if="algoSimOrderCounts.dispatched > 0" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-sm flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                <span class="text-[10px] font-medium text-slate-600 dark:text-slate-300">{{ algoSimOrderCounts.dispatched }} rotalandi</span>
              </div>
            </div>
          </div>

          <!-- RIGHT: Route Cards -->
          <div class="w-72 flex-shrink-0 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
            <div class="px-3 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Rotalar</span>
                <span class="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">{{ algoSimRoutes.length }}</span>
              </div>
              <span v-if="algoSimSelectedRouteId" @click="algoSimSelectedRouteId = null" class="text-[10px] text-indigo-600 cursor-pointer hover:underline font-medium">Tumu</span>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1.5">
              <div v-if="algoSimRoutes.length === 0" class="text-center py-10 px-4">
                <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Route :size="20" class="text-slate-400" />
                </div>
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Rota yok</p>
                <p class="text-[10px] text-slate-400 dark:text-slate-500">Siparisleri uretip Dispatch Et butonuna basin</p>
              </div>

              <!-- Route Cards -->
              <div v-for="(route, rIdx) in algoSimRoutes" :key="route.id"
                @click="algoSimSelectedRouteId = algoSimSelectedRouteId === route.id ? null : route.id"
                class="rounded-xl cursor-pointer transition-all overflow-hidden"
                :class="algoSimSelectedRouteId === route.id ? 'shadow-lg ring-1' : 'hover:shadow-sm'"
                :style="{
                  backgroundColor: algoSimSelectedRouteId === route.id ? (route.color||'#6b7280')+'08' : '#fff',
                  border: `1px solid ${algoSimSelectedRouteId === route.id ? (route.color||'#6b7280')+'40' : '#e5e7eb'}`,
                  borderLeftWidth: '4px',
                  borderLeftColor: route.color || '#6b7280',
                  '--tw-ring-color': (route.color || '#6b7280') + '30',
                }">

                <!-- Collapsed: Compact header row -->
                <div class="px-3 py-2.5 flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: route.color }" />
                  <span class="text-slate-800 dark:text-white font-bold text-xs">Rota #{{ rIdx + 1 }}</span>
                  <span v-if="route.isFrozen" class="text-[8px] px-1 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-600 font-semibold">FRIGO</span>
                  <!-- Kurye Puani -->
                  <span v-if="route.courierScore" class="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    :class="route.courierScore >= 8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : route.courierScore >= 6 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                    {{ route.courierScore }}/10
                  </span>
                  <div class="flex items-center gap-2 ml-auto text-[10px] text-slate-500 dark:text-slate-400">
                    <span><strong class="text-slate-700 dark:text-slate-200">{{ route.orderIds.length }}</strong> sip</span>
                    <span><strong class="text-slate-700 dark:text-slate-200">{{ route.totalDistanceKm.toFixed(1) }}</strong>km</span>
                    <span><strong class="text-slate-700 dark:text-slate-200">{{ Math.round(route.totalTimeSec/60) }}</strong>dk</span>
                    <span><strong class="text-emerald-600 dark:text-emerald-400">{{ (route.routePrice || 0).toFixed(0) }}</strong><span class="text-[8px]">TL</span></span>
                  </div>
                  <ChevronRight :size="12" class="text-slate-300 flex-shrink-0 transition-transform" :class="algoSimSelectedRouteId === route.id ? 'rotate-90' : ''" />
                </div>

                <!-- Expanded: Details + Timeline (only when selected) -->
                <template v-if="algoSimSelectedRouteId === route.id">
                  <!-- Metrics Grid -->
                  <div class="mx-3 mb-2 grid grid-cols-4 gap-x-2 gap-y-1 text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-100 dark:border-slate-600">
                    <div>Desi <strong class="text-slate-800 dark:text-white">{{ route.totalDeci }}</strong></div>
                    <div>Ek km <strong :style="{ color: route.avgAddedKmPerOrder <= 0.8 ? '#16a34a' : route.avgAddedKmPerOrder <= 1.5 ? '#d97706' : '#dc2626' }">{{ route.avgAddedKmPerOrder.toFixed(2) }}</strong></div>
                    <div>Kazanc <strong class="text-amber-600">{{ route.estimatedEarning.toFixed(0) }}TL</strong></div>
                    <div>Fiyat <strong class="text-emerald-600 dark:text-emerald-400">{{ (route.routePrice || 0).toFixed(0) }}TL</strong></div>
                  </div>
                  <!-- Fiyat Detay -->
                  <div class="mx-3 mb-2 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-[10px]">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold text-emerald-700 dark:text-emerald-400">Rota Fiyati: {{ (route.routePrice || 0).toFixed(2) }} TL</span>
                      <span class="text-slate-400">{{ ((route.routePrice || 0) / route.orderIds.length).toFixed(1) }} TL/sip</span>
                    </div>
                    <div class="text-[9px] text-slate-500 dark:text-slate-400">
                      Katsayilar: {{ route.orderIds.length }} sip x temel + {{ route.totalDistanceKm.toFixed(1) }}km mesafe + {{ Math.round(route.totalTimeSec/60) }}dk sure + bolge primi
                    </div>
                  </div>
                  <!-- Zamaninda Teslimat -->
                  <div class="mx-3 mb-2 p-2 rounded-lg border text-[10px]"
                    :class="route.onTimeRate >= 90 ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : route.onTimeRate >= 70 ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'">
                    <div class="flex items-center justify-between">
                      <span class="font-bold"
                        :class="route.onTimeRate >= 90 ? 'text-emerald-700 dark:text-emerald-400'
                          : route.onTimeRate >= 70 ? 'text-amber-700 dark:text-amber-400'
                          : 'text-red-700 dark:text-red-400'">
                        Zamaninda Teslimat: %{{ route.onTimeRate }}
                      </span>
                      <span class="text-slate-400">{{ route.onTimeRate >= 90 ? 'Basarili' : route.onTimeRate >= 70 ? 'Kabul edilebilir' : 'Iyilestirmeli' }}</span>
                    </div>
                  </div>
                  <!-- Kurye Puani Detay + Algoritma -->
                  <div class="mx-3 mb-2 p-2 rounded-lg border text-[10px]"
                    :class="route.courierScore >= 8 ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                      : route.courierScore >= 6 ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                      : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800'">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold" :class="route.courierScore >= 8 ? 'text-emerald-700 dark:text-emerald-400' : route.courierScore >= 6 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'">
                        Kurye Puani: {{ route.courierScore }}/10
                      </span>
                      <span class="text-slate-400">{{ route.courierScore >= 8 ? 'Hizli & verimli' : route.courierScore >= 6 ? 'Kabul edilebilir' : 'Iyilestirmeli' }}</span>
                    </div>
                    <div class="text-[9px] text-slate-500 dark:text-slate-400">
                      <span class="font-medium">Algoritma:</span>
                      {{ getAlgoById(route.algorithm?.assignment)?.name || route.algorithm?.assignment }}
                      → {{ getAlgoById(route.algorithm?.routing)?.name || route.algorithm?.routing }}
                      → {{ getAlgoById(route.algorithm?.optimization)?.name || route.algorithm?.optimization }}
                    </div>
                  </div>

                  <!-- Timeline -->
                  <div class="mx-3 mb-3 border-t border-slate-200 dark:border-slate-600 pt-2">
                    <div class="text-[9px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Navigation :size="9" /> Rota Adimlari
                    </div>
                    <div v-for="(wp, wIdx) in route.waypoints" :key="wIdx" class="flex text-[10px] relative">
                      <div class="w-6 flex flex-col items-center flex-shrink-0">
                        <div v-if="wIdx > 0" class="w-0.5 h-1" :style="{ backgroundColor: route.color, opacity: 0.3 }" />
                        <div v-if="wIdx > 0 && wp.arrivalTime && route.waypoints[wIdx-1]?.departureTime" class="text-[7px] text-slate-400 my-0.5 whitespace-nowrap">
                          {{ Math.round((wp.arrivalTime - route.waypoints[wIdx-1].departureTime) / 60000) }}dk
                        </div>
                        <div class="w-5 h-5 flex items-center justify-center font-bold text-white text-[8px] font-mono flex-shrink-0"
                          :style="{ borderRadius: wp.type === 'pickup' ? '4px' : '50%', backgroundColor: route.color, boxShadow: `0 0 4px ${route.color}40` }">
                          {{ wp.type === 'pickup' ? 'P' : wIdx + 1 }}
                        </div>
                        <div v-if="wIdx < route.waypoints.length - 1" class="w-0.5 flex-1 min-h-[6px]" :style="{ backgroundColor: route.color, opacity: 0.15 }" />
                      </div>
                      <div class="pl-2 pb-1.5 flex-1 min-h-[24px] flex flex-col justify-center">
                        <div class="flex items-center gap-1.5">
                          <span v-if="wp.type === 'pickup'" class="text-amber-600 font-bold text-[9px]">TOPLA</span>
                          <span v-else class="text-blue-600 font-bold text-[9px]">TESLIM</span>
                          <span class="text-slate-600 dark:text-slate-300 text-[9px] font-medium">
                            {{ wp.type === 'pickup'
                              ? (ISTANBUL_STORES.find(s => s.id === wp.originId)?.brand || wp.originId?.slice(0,8))
                              : (algoSimOrders.find(o => o.id === wp.orderId)?.customerName || '?')
                            }}
                          </span>
                          <span class="text-slate-400 text-[8px] ml-auto">{{ new Date(wp.arrivalTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }}</span>
                        </div>
                        <!-- Delivery details -->
                        <template v-if="wp.type === 'delivery'">
                          <div class="flex items-center gap-1 mt-0.5">
                            <span class="text-[8px] px-1 py-0.5 rounded" :style="{ backgroundColor: (MODE_COLORS[algoSimOrders.find(o => o.id === wp.orderId)?.mode] || '#666') + '12', color: MODE_COLORS[algoSimOrders.find(o => o.id === wp.orderId)?.mode] || '#666' }">
                              {{ MODE_LABELS[algoSimOrders.find(o => o.id === wp.orderId)?.mode] || '' }}
                            </span>
                            <span class="text-[8px] text-slate-400">{{ algoSimOrders.find(o => o.id === wp.orderId)?.deci || 0 }}desi</span>
                            <span v-if="algoSimOrders.find(o => o.id === wp.orderId)?.isFrozen" class="text-[8px] text-blue-600 font-bold">FRIGO</span>
                          </div>
                          <!-- Zaman bilgileri: planlanan vs deadline -->
                          <div class="flex items-center gap-1.5 mt-0.5 text-[8px]">
                            <span class="text-slate-400">Plan:</span>
                            <span class="font-bold text-slate-700 dark:text-slate-200">{{ new Date(wp.arrivalTime).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}) }}</span>
                            <span class="text-slate-300 dark:text-slate-600">|</span>
                            <span class="text-slate-400">Son:</span>
                            <span class="font-bold" :style="{ color: wp.arrivalTime > wp.deadline ? '#ef4444' : '#64748b' }">{{ new Date(wp.deadline).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}) }}</span>
                            <span v-if="wp.deliveryWindow" class="text-slate-300 dark:text-slate-600">|</span>
                            <span v-if="wp.deliveryWindow" class="text-indigo-500 font-medium">
                              {{ new Date(wp.deliveryWindow.start).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}) }}-{{ new Date(wp.deliveryWindow.end).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}) }}
                            </span>
                          </div>
                          <div v-if="wp.deadline" class="flex items-center gap-1.5 mt-0.5">
                            <div class="flex-1 h-[3px] bg-slate-200 rounded-full overflow-hidden">
                              <div class="h-full rounded-full"
                                :style="{
                                  width: `${Math.max(0, Math.min(100, (wp.deadline - wp.arrivalTime) / (wp.deadline - (wp.arrivalTime - 1800000)) * 100))}%`,
                                  backgroundColor: wp.arrivalTime > wp.deadline ? '#ef4444'
                                    : (wp.deliveryWindow?.start && wp.arrivalTime < wp.deliveryWindow.start) ? '#f59e0b'
                                    : (wp.deadline - wp.arrivalTime) > 1800000 ? '#22c55e' : '#f59e0b'
                                }" />
                            </div>
                            <span v-if="wp.arrivalTime > wp.deadline" class="text-[8px] text-red-600 font-bold">GECIKME</span>
                            <span v-else-if="wp.deliveryWindow?.start && wp.arrivalTime < wp.deliveryWindow.start" class="text-[8px] text-amber-600 font-bold">ERKEN</span>
                            <span v-else class="text-[8px] font-bold" :style="{ color: (wp.deadline - wp.arrivalTime) > 1800000 ? '#22c55e' : '#f59e0b' }">TAMAM</span>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ===== CONFIG VIEW ===== -->
      <div v-else-if="algoViewMode === 'config'">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="border-b border-slate-200 dark:border-slate-700">
            <div class="flex gap-0 overflow-x-auto">
              <button v-for="tab in algoTabs" :key="tab.id" @click="algoTab = tab.id"
                :class="['flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap', algoTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']">
                <component :is="tab.icon" :size="14" /> {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="p-5" v-if="algoLoading">
            <div class="flex items-center justify-center py-12">
              <RefreshCw :size="22" class="text-primary animate-spin" />
              <span class="ml-3 text-sm text-slate-500">Yukleniyor...</span>
            </div>
          </div>

          <template v-else>
            <!-- Dispatch -->
            <div v-if="algoTab === 'dispatch'" class="max-w-3xl p-5 space-y-6">

              <!-- ─── Genel Dispatch Ayarlari ─── -->
              <div>
                <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <Zap :size="15" class="text-primary" /> Genel Dispatch Ayarlari
                </h3>
                <div class="space-y-1">
                  <label class="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <div><span class="text-sm font-medium text-slate-700 dark:text-slate-300">Pool Dispatch</span><p class="text-xs text-slate-400">Havuz tabanli dagitim</p></div>
                    <div class="relative">
                      <input type="checkbox" v-model="algoDispatch.poolDispatch" class="sr-only peer" />
                      <div class="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
                      <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                    </div>
                  </label>
                  <label class="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <div><span class="text-sm font-medium text-slate-700 dark:text-slate-300">Zone Dispatch</span><p class="text-xs text-slate-400">Bolge tabanli dagitim</p></div>
                    <div class="relative">
                      <input type="checkbox" v-model="algoDispatch.zoneDispatch" class="sr-only peer" />
                      <div class="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
                      <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                    </div>
                  </label>
                  <label class="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <div><span class="text-sm font-medium text-slate-700 dark:text-slate-300">Cascade Teklifler</span><p class="text-xs text-slate-400">Reddedilen teklifi siradakine ilet</p></div>
                    <div class="relative">
                      <input type="checkbox" v-model="algoDispatch.cascadeOffers" class="sr-only peer" />
                      <div class="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
                      <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                    </div>
                  </label>
                  <div class="px-3 py-2">
                    <div class="flex justify-between mb-1"><span class="text-sm font-medium text-slate-700 dark:text-slate-300">Maks. Teklif Suresi</span><span class="text-sm font-semibold text-primary">{{ algoDispatch.maxOfferTimeout }}sn</span></div>
                    <input type="range" v-model.number="algoDispatch.maxOfferTimeout" min="15" max="300" step="5" class="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-primary" />
                  </div>
                </div>
              </div>

              <!-- ─── Ayirici ─── -->
              <div class="border-t border-slate-200 dark:border-slate-700" />

              <!-- ─── Karisik Mod (Mixed-Mode Dispatch) ─── -->
              <div>
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Layers :size="15" class="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-800 dark:text-white">Karisik Mod Dispatch</h3>
                    <p class="text-[11px] text-slate-400">Express + Standard + Flex siparisleri ayni rotada birlestir</p>
                  </div>
                </div>

                <!-- Ana Toggle -->
                <label class="flex items-center justify-between py-3 px-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800 cursor-pointer mb-4">
                  <div>
                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Karisik Mod Aktif</span>
                    <p class="text-xs text-slate-400 mt-0.5">Express tetikleyiciler yakinlardaki slot siparisleri otomatik ceksin</p>
                  </div>
                  <div class="relative">
                    <input type="checkbox" v-model="algoMixedMode.enabled" class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-200 peer-checked:bg-violet-500 rounded-full transition-colors cursor-pointer" />
                    <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
                  </div>
                </label>

                <!-- Detay Ayarlar (aciksa) -->
                <div v-if="algoMixedMode.enabled" class="space-y-3 pl-2 border-l-2 border-violet-200 dark:border-violet-800 ml-2">
                  <!-- Yakinlik Mesafesi -->
                  <div class="pl-4">
                    <div class="flex justify-between mb-1">
                      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Yakinlik Mesafesi</span>
                      <span class="text-sm font-bold text-violet-600">{{ (algoMixedMode.proximityM / 1000).toFixed(1) }} km</span>
                    </div>
                    <input type="range" v-model.number="algoMixedMode.proximityM" min="500" max="5000" step="100" class="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-violet-500" />
                    <div class="flex justify-between mt-0.5">
                      <span class="text-[10px] text-slate-400">500m</span>
                      <span class="text-[10px] text-slate-400">5km</span>
                    </div>
                  </div>

                  <!-- Max Companion -->
                  <div class="pl-4">
                    <div class="flex justify-between mb-1">
                      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Maks. Companion</span>
                      <span class="text-sm font-bold text-violet-600">{{ algoMixedMode.maxCompanions }}</span>
                    </div>
                    <input type="range" v-model.number="algoMixedMode.maxCompanions" min="1" max="8" step="1" class="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-violet-500" />
                    <div class="flex justify-between mt-0.5">
                      <span class="text-[10px] text-slate-400">1</span>
                      <span class="text-[10px] text-slate-400">8</span>
                    </div>
                  </div>

                  <!-- Batch Suresi -->
                  <div class="pl-4">
                    <div class="flex justify-between mb-1">
                      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Batch Suresi Tahmini</span>
                      <span class="text-sm font-bold text-violet-600">{{ algoMixedMode.batchDurationMin }} dk</span>
                    </div>
                    <input type="range" v-model.number="algoMixedMode.batchDurationMin" min="5" max="60" step="5" class="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-violet-500" />
                    <div class="flex justify-between mt-0.5">
                      <span class="text-[10px] text-slate-400">5dk</span>
                      <span class="text-[10px] text-slate-400">60dk</span>
                    </div>
                  </div>

                  <!-- Uyari -->
                  <div class="pl-4">
                    <div class="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                      <AlertTriangle :size="13" class="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p class="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                        Sadece deadline uyumlu siparisler companion olarak eklenir. Express teslimden sonra yetisemeyecek siparisler otomatik reddedilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ─── Kaydet ─── -->
              <div class="flex justify-end pt-2">
                <button @click="saveAlgoSection('dispatch')" :disabled="algoSaving.dispatch" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50">
                  <RefreshCw v-if="algoSaving.dispatch" :size="13" class="animate-spin" /><Settings v-else :size="13" /> Kaydet
                </button>
              </div>
            </div>

            <!-- Optimizasyon -->
            <div v-if="algoTab === 'optimization'" class="p-5 space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                  <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2"><Play :size="18" class="text-blue-600" /></div>
                  <h4 class="text-sm font-semibold text-slate-800 dark:text-white mb-1">Manual Dispatch</h4>
                  <p class="text-xs text-slate-400 mb-3">Temel algoritma</p>
                  <button @click="handleRunAlgoDispatch('manual')" :disabled="algoDispatching.manual" class="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50">
                    <RefreshCw v-if="algoDispatching.manual" :size="13" class="animate-spin" /><Play v-else :size="13" /> Calistir
                  </button>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                  <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2"><Globe :size="18" class="text-green-600" /></div>
                  <h4 class="text-sm font-semibold text-slate-800 dark:text-white mb-1">OSRM Dispatch</h4>
                  <p class="text-xs text-slate-400 mb-3">Gercek mesafe</p>
                  <button @click="handleRunAlgoDispatch('osrm')" :disabled="algoDispatching.osrm" class="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50">
                    <RefreshCw v-if="algoDispatching.osrm" :size="13" class="animate-spin" /><Globe v-else :size="13" /> Calistir
                  </button>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                  <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-2"><RefreshCw :size="18" class="text-amber-600" /></div>
                  <h4 class="text-sm font-semibold text-slate-800 dark:text-white mb-1">Batch Reroute</h4>
                  <p class="text-xs text-slate-400 mb-3">Toplu yeniden optimizasyon</p>
                  <button @click="handleRunAlgoDispatch('reroute')" :disabled="algoDispatching.reroute" class="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50">
                    <RefreshCw :size="13" :class="algoDispatching.reroute ? 'animate-spin' : ''" /> Calistir
                  </button>
                </div>
              </div>
              <div v-if="lastDispatchResult" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                <h4 class="font-semibold text-slate-800 dark:text-white text-sm mb-3">Son Dispatch Sonucu</h4>
                <div class="grid grid-cols-4 gap-3">
                  <div class="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-center"><p class="text-[10px] text-slate-400">Tip</p><p class="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{{ lastDispatchResult.type }}</p></div>
                  <div class="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-center"><p class="text-[10px] text-slate-400">Durum</p><p :class="['text-xs font-semibold mt-0.5', lastDispatchResult.success ? 'text-green-600' : 'text-red-600']">{{ lastDispatchResult.success ? 'Basarili' : 'Basarisiz' }}</p></div>
                  <div class="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-center"><p class="text-[10px] text-slate-400">Sure</p><p class="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{{ lastDispatchResult.duration }}</p></div>
                  <div class="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-center"><p class="text-[10px] text-slate-400">Zaman</p><p class="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{{ lastDispatchResult.time }}</p></div>
                </div>
              </div>
            </div>

            <!-- Partners -->
            <div v-if="algoTab === 'partners'" class="p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm"><Truck :size="16" /> Partner Transfer Kurallari</h3>
                <p class="text-xs text-slate-400">{{ algoPartners.filter(p => p.enabled).length }}/{{ algoPartners.length }} aktif</p>
              </div>
              <div class="space-y-2">
                <div v-for="(partner, index) in algoPartners" :key="partner.id"
                  class="flex items-center justify-between p-3 rounded-xl border transition-colors"
                  :class="partner.enabled ? 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800' : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'">
                  <div class="flex items-center gap-3">
                    <div class="flex flex-col items-center gap-0.5">
                      <button @click="movePartner(index,-1)" :disabled="index===0" class="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer disabled:opacity-20"><Sliders :size="11" class="text-slate-400 rotate-180" /></button>
                      <span class="text-[10px] font-bold text-slate-300">{{ index+1 }}</span>
                      <button @click="movePartner(index,1)" :disabled="index===algoPartners.length-1" class="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer disabled:opacity-20"><Sliders :size="11" class="text-slate-400" /></button>
                    </div>
                    <div>
                      <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ partner.name }}</span>
                      <p class="text-xs text-slate-400">{{ partner.type }}</p>
                    </div>
                  </div>
                  <div class="relative">
                    <input type="checkbox" v-model="partner.enabled" class="sr-only peer" />
                    <div class="w-9 h-5 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" @click="partner.enabled = !partner.enabled" />
                    <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm pointer-events-none" />
                  </div>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <button @click="saveAlgoSection('partners')" :disabled="algoSaving.partners" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50">
                  <RefreshCw v-if="algoSaving.partners" :size="13" class="animate-spin" /><Settings v-else :size="13" /> Kaydet
                </button>
              </div>
            </div>

            <!-- Health -->
            <div v-if="algoTab === 'health'" class="p-5 max-w-3xl">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm"><Activity :size="16" /> Servis Durumu</h3>
                <button @click="checkHealth" :disabled="healthLoading" class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg cursor-pointer transition-colors disabled:opacity-50">
                  <RefreshCw :size="13" :class="{ 'animate-spin': healthLoading }" /> Yenile
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2.5">
                      <div :class="['w-9 h-9 rounded-full flex items-center justify-center', osrmHealth.status==='ok' ? 'bg-green-50' : 'bg-red-50']">
                        <Globe :size="18" :class="osrmHealth.status==='ok' ? 'text-green-600' : 'text-red-500'" />
                      </div>
                      <div><h4 class="text-sm font-semibold text-slate-800 dark:text-white">OSRM Engine</h4><p class="text-xs text-slate-400">Rotalama</p></div>
                    </div>
                    <span :class="['flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', osrmHealth.status==='ok' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600']">
                      <CheckCircle v-if="osrmHealth.status==='ok'" :size="11" /><XCircle v-else :size="11" />
                      {{ osrmHealth.status==='ok' ? 'Aktif' : 'Baglanti Yok' }}
                    </span>
                  </div>
                  <div class="space-y-1.5 text-xs">
                    <div class="flex justify-between"><span class="text-slate-400">Endpoint</span><span class="text-slate-600 dark:text-slate-300 font-mono text-[10px]">{{ osrmHealth.endpoint||'-' }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Yanit</span><span class="text-slate-600 dark:text-slate-300">{{ osrmHealth.responseTime||'-' }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Son kontrol</span><span class="text-slate-600 dark:text-slate-300">{{ osrmHealth.lastCheck||'-' }}</span></div>
                  </div>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2.5">
                      <div :class="['w-9 h-9 rounded-full flex items-center justify-center', vroomHealth.status==='ok' ? 'bg-green-50' : 'bg-red-50']">
                        <Cpu :size="18" :class="vroomHealth.status==='ok' ? 'text-green-600' : 'text-red-500'" />
                      </div>
                      <div><h4 class="text-sm font-semibold text-slate-800 dark:text-white">VROOM Solver</h4><p class="text-xs text-slate-400">Optimizasyon</p></div>
                    </div>
                    <span :class="['flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', vroomHealth.status==='ok' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600']">
                      <CheckCircle v-if="vroomHealth.status==='ok'" :size="11" /><XCircle v-else :size="11" />
                      {{ vroomHealth.status==='ok' ? 'Aktif' : 'Baglanti Yok' }}
                    </span>
                  </div>
                  <div class="space-y-1.5 text-xs">
                    <div class="flex justify-between"><span class="text-slate-400">Endpoint</span><span class="text-slate-600 dark:text-slate-300 font-mono text-[10px]">{{ vroomHealth.endpoint||'-' }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Yanit</span><span class="text-slate-600 dark:text-slate-300">{{ vroomHealth.responseTime||'-' }}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Son kontrol</span><span class="text-slate-600 dark:text-slate-300">{{ vroomHealth.lastCheck||'-' }}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Test Order Modal -->
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showTestOrderModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="showTestOrderModal = false">
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
            <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Plus :size="16" class="text-indigo-500" /> Test Siparis Olustur
              </h3>
              <button @click="showTestOrderModal = false" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                <X :size="16" class="text-slate-400" />
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Musteri Adi</label>
                <input v-model="testOrderForm.customerName" type="text" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Teslimat Modu</label>
                  <select v-model="testOrderForm.mode" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm cursor-pointer focus:outline-none">
                    <option value="instant">Instant</option>
                    <option value="standard">Standart</option>
                    <option value="flex">Esnek</option>
                    <option value="same_day">Ayni Gun</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Desi</label>
                  <input v-model.number="testOrderForm.deci" type="number" min="1" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Teslimat Suresi (dakika)</label>
                <input v-model.number="testOrderForm.deadlineMin" type="number" min="10" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Soguk Zincir (Frigo)</span>
                <button @click="testOrderForm.frozen = !testOrderForm.frozen"
                  :class="['w-10 h-6 rounded-full transition-colors flex items-center cursor-pointer', testOrderForm.frozen ? 'bg-blue-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start']">
                  <span class="block w-4 h-4 bg-white rounded-full shadow-sm mx-1" />
                </button>
              </div>
            </div>
            <div class="flex gap-2 px-5 pb-5">
              <button @click="submitTestOrder" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors">Siparis Ekle</button>
              <button @click="showTestOrderModal = false" class="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Iptal</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
