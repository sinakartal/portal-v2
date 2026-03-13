<template>
  <div class="flex flex-col h-[calc(100vh-72px)] overflow-hidden">

    <!-- ——— ÜST KPI BAR ——— -->
    <div class="flex items-center gap-4 px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
      <div v-for="kpi in kpiCards" :key="kpi.label"
        class="flex items-center gap-3 px-4 py-2 rounded-xl border border-slate-100 bg-slate-50">
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', kpi.iconBg]">
          <component :is="kpi.icon" :size="16" :class="kpi.iconColor" />
        </div>
        <div>
          <p class="text-lg font-bold text-slate-800 leading-none">{{ kpi.value }}</p>
          <p class="text-[10px] text-slate-500 mt-0.5">{{ kpi.label }}</p>
        </div>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button @click="loadData"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <RefreshCw :size="13" :class="loading ? 'animate-spin' : ''" /> Yenile
        </button>
        <button @click="handleDispatch"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
          <Play :size="13" /> Dispatch Calistir
        </button>
      </div>
    </div>

    <!-- ——— ANA LAYOUT ——— -->
    <div class="flex flex-1 overflow-hidden">

      <!-- ——— SOL PANEL ——— -->
      <div class="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">

        <!-- Panel baslik + tab -->
        <div class="px-4 py-3 border-b border-slate-200">
          <div class="flex bg-slate-100 rounded-lg p-0.5">
            <button v-for="tab in panelTabs" :key="tab.key" @click="activePanel = tab.key"
              :class="['flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                activePanel === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
              <component :is="tab.icon" :size="12" />
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Arama -->
        <div class="px-3 py-2 border-b border-slate-100">
          <div class="relative">
            <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input v-model="searchQuery" type="text" placeholder="Ara..."
              class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <!-- Panel icerigi -->
        <div class="flex-1 overflow-y-auto">

          <!-- ROTALAR TAB -->
          <template v-if="activePanel === 'routes'">
            <div v-if="filteredRoutes.length === 0" class="px-4 py-8 text-center text-xs text-slate-400">
              Rota bulunamadi
            </div>
            <div v-for="(route, rIdx) in filteredRoutes" :key="route._id"
              :class="['px-3 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors',
                selectedRoute?._id === route._id ? 'bg-primary/5 border-l-2 border-l-primary' : '']"
              :style="{ borderLeft: selectedRoute?._id !== route._id ? `3px solid ${ROUTE_COLORS[rIdx % ROUTE_COLORS.length]}` : undefined }"
              @click="selectRoute(route)">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-bold text-slate-800">{{ route.routeNumber }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  :style="{ backgroundColor: routeStatuses[route.status]?.bg, color: routeStatuses[route.status]?.color }">
                  {{ routeStatuses[route.status]?.label }}
                </span>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck :size="11" class="text-primary" />
                </div>
                <span class="text-xs text-slate-700 truncate">{{ route.courier }}</span>
                <span class="text-[10px] text-slate-400 ml-auto flex-shrink-0">{{ route.region }}</span>
              </div>
              <!-- Ilerleme bar -->
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all"
                    :class="getProgressColor(route.progress)"
                    :style="{ width: `${route.progress}%` }" />
                </div>
                <span class="text-[10px] text-slate-500 w-8 text-right">%{{ route.progress }}</span>
              </div>
              <!-- Stop sayaci -->
              <div class="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                <span><Package :size="10" class="inline mr-0.5" />{{ route.completedStops }}/{{ route.orderCount }} durak</span>
                <span v-if="route.eta"><Clock :size="10" class="inline mr-0.5" />{{ formatETA(route.eta) }}</span>
              </div>
            </div>
          </template>

          <!-- KURYELER TAB -->
          <template v-else-if="activePanel === 'couriers'">
            <div v-if="filteredCouriers.length === 0" class="px-4 py-8 text-center text-xs text-slate-400">
              Kurye bulunamadi
            </div>
            <button v-for="courier in filteredCouriers" :key="courier.id"
              :class="['w-full flex items-center gap-3 px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left cursor-pointer',
                selectedCourier?.id === courier.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : '']"
              @click="selectCourier(courier)">
              <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0', MAP_STATUS_COLORS[courier.status]]">
                {{ courier.avatar }}
              </div>
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

          <!-- BEKLEYENLER TAB -->
          <template v-else-if="activePanel === 'pending'">
            <div v-if="pendingOrders.length === 0" class="px-4 py-8 text-center text-xs text-slate-400">
              Bekleyen siparis yok
            </div>
            <div v-for="order in pendingOrders" :key="order.id"
              class="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50">
              <div class="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Package :size="13" class="text-amber-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-900 truncate">{{ order.customerName || order.name || order.id }}</p>
                <p class="text-[10px] text-slate-400 truncate">{{ order.address || order.deliveryAddress || '-' }}</p>
              </div>
              <span class="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium flex-shrink-0">
                Bekliyor
              </span>
            </div>
          </template>

          <!-- OLAYLAR TAB -->
          <template v-else-if="activePanel === 'events'">
            <div v-if="events.length === 0" class="px-4 py-8 text-center text-xs text-slate-400">
              Henuz olay yok
            </div>
            <div v-for="(ev, idx) in events" :key="ev.id || idx"
              class="flex gap-2 px-3 py-2 border-b border-slate-100">
              <div :class="['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                ev.type === 'courier_location' ? 'bg-blue-100 text-blue-600' :
                ev.type === 'order_status' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500']">
                <Navigation v-if="ev.type === 'courier_location'" :size="11" />
                <Package v-else-if="ev.type === 'order_status'" :size="11" />
                <Bell v-else :size="11" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-800 truncate">{{ ev.title }}</p>
                <p class="text-[10px] text-slate-400">{{ ev.time }}</p>
              </div>
            </div>
          </template>

        </div>
      </div>

      <!-- ——— MERKEZ — LEAFLET HARITA ——— -->
      <div class="flex-1 relative overflow-hidden">

        <!-- Floating status kartlari -->
        <div class="absolute top-3 left-3 flex gap-1.5 z-[1000]">
          <div v-for="card in statusCards" :key="card.key"
            :class="['flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm cursor-pointer transition-opacity',
              card.bg, statusFilter && statusFilter !== card.key ? 'opacity-40' : '']"
            @click="statusFilter = statusFilter === card.key ? null : card.key">
            <span :class="card.color"><component :is="card.icon" :size="13" /></span>
            <div>
              <p :class="['text-base font-bold leading-none', card.color]">{{ card.count }}</p>
              <p class="text-[9px] text-slate-500 mt-0.5">{{ card.label }}</p>
            </div>
          </div>
        </div>

        <!-- Harita katman toggle -->
        <div class="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow px-3 py-2.5 text-[10px] space-y-1.5">
          <p class="font-bold text-slate-700 text-[11px] mb-1">Katmanlar</p>
          <label v-for="layer in layerOptions" :key="layer.key" class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="layers[layer.key]" class="rounded" />
            <span class="text-slate-600">{{ layer.label }}</span>
          </label>
        </div>

        <!-- Canli gosterge -->
        <div class="absolute bottom-3 left-3 z-[1000] flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 border border-slate-200 rounded-lg shadow text-[10px] text-slate-600">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Canli · SSE
        </div>

        <!-- Harita container -->
        <div ref="mapContainer" style="height: 100%; width: 100%;" />
      </div>

      <!-- ——— SAĞ PANEL — SEÇİLİ ROTA / KURYE DETAYI ——— -->
      <transition name="slide-right">
        <div v-if="selectedRoute || selectedCourier"
          class="w-72 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div>
              <p class="text-sm font-bold text-slate-800">
                {{ selectedRoute ? selectedRoute.routeNumber : selectedCourier?.name }}
              </p>
              <p class="text-[10px] text-slate-500">
                {{ selectedRoute ? selectedRoute.region : MAP_STATUS_LABELS[selectedCourier?.status] }}
              </p>
            </div>
            <button @click="selectedRoute = null; selectedCourier = null"
              class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
              <X :size="14" />
            </button>
          </div>

          <!-- Rota detayi -->
          <div v-if="selectedRoute" class="flex-1 overflow-y-auto">
            <!-- Ilerleme -->
            <div class="px-4 py-3 border-b border-slate-100">
              <div class="flex justify-between text-xs text-slate-600 mb-1.5">
                <span>{{ selectedRoute.completedStops }} / {{ selectedRoute.orderCount }} teslim</span>
                <span class="font-bold">%{{ selectedRoute.progress }}</span>
              </div>
              <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div :class="['h-full rounded-full transition-all', getProgressColor(selectedRoute.progress)]"
                  :style="{ width: `${selectedRoute.progress}%` }" />
              </div>
              <div class="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                <span><Truck :size="10" class="inline mr-0.5" />{{ selectedRoute.courier }}</span>
                <span v-if="selectedRoute.totalDistance">{{ selectedRoute.totalDistance }} km</span>
              </div>
            </div>

            <!-- Eylemler -->
            <div class="px-4 py-2 border-b border-slate-100 flex gap-2">
              <button @click="handleReoptimize(selectedRoute)"
                :class="['flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer',
                  actionLoading === 'reoptimize' ? 'opacity-50' : 'hover:bg-slate-50']"
                :disabled="actionLoading === 'reoptimize'">
                <RotateCw :size="12" :class="actionLoading === 'reoptimize' ? 'animate-spin' : ''" />
                Optimize Et
              </button>
              <button v-if="selectedRoute.status === 'active'" @click="handlePauseRoute(selectedRoute)"
                class="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-lg border hover:bg-slate-50 cursor-pointer">
                <Pause :size="12" /> Durdur
              </button>
              <button v-else-if="selectedRoute.status === 'paused'" @click="handleResumeRoute(selectedRoute)"
                class="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-lg border hover:bg-green-50 text-green-700 cursor-pointer">
                <Play :size="12" /> Devam
              </button>
            </div>

            <!-- Stop listesi -->
            <div class="px-4 py-2">
              <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Durak Sirasi</p>
              <div v-if="!selectedRoute.stops || selectedRoute.stops.length === 0"
                class="text-xs text-slate-400 py-3 text-center">Durak bilgisi yok</div>
              <div v-for="(stop, sIdx) in selectedRoute.stops" :key="stop.id"
                class="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
                <span :class="['flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  stop.status === 'delivered' ? 'bg-green-500 text-white' :
                  stop.status === 'in_transit' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600']">
                  {{ sIdx + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-slate-800 truncate">{{ stop.customer }}</p>
                  <p class="text-[10px] text-slate-400 truncate">{{ stop.address }}</p>
                  <p v-if="stop.eta" class="text-[10px] text-slate-400">
                    <Clock :size="9" class="inline mr-0.5" />{{ formatETA(stop.eta) }}
                  </p>
                </div>
                <button v-if="stop.status === 'pending'" @click="handleRemoveStop(stop.id)"
                  class="w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 flex-shrink-0 cursor-pointer">
                  <X :size="11" />
                </button>
              </div>
            </div>
          </div>

          <!-- Kurye detayi -->
          <div v-else-if="selectedCourier" class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div class="flex items-center gap-3">
              <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white', MAP_STATUS_COLORS[selectedCourier.status]]">
                {{ selectedCourier.avatar }}
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800">{{ selectedCourier.name }}</p>
                <p :class="['text-xs font-medium', MAP_STATUS_TEXT[selectedCourier.status]]">
                  {{ MAP_STATUS_LABELS[selectedCourier.status] }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div class="bg-slate-50 rounded-lg p-2">
                <p class="text-slate-400">Aktif Siparis</p>
                <p class="font-bold text-slate-800">{{ selectedCourier.ordersCount }}</p>
              </div>
              <div class="bg-slate-50 rounded-lg p-2">
                <p class="text-slate-400">Bugun Teslim</p>
                <p class="font-bold text-slate-800">{{ selectedCourier.deliveriesToday }}</p>
              </div>
              <div class="bg-slate-50 rounded-lg p-2">
                <p class="text-slate-400">Ort. Sure</p>
                <p class="font-bold text-slate-800">{{ selectedCourier.avgDeliveryTime }} dk</p>
              </div>
              <div class="bg-slate-50 rounded-lg p-2">
                <p class="text-slate-400">Batarya</p>
                <p class="font-bold text-slate-800">%{{ selectedCourier.battery }}</p>
              </div>
            </div>
            <button @click="focusOnMap(selectedCourier)"
              class="w-full py-2 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors cursor-pointer">
              <MapPin :size="12" class="inline mr-1" /> Haritada Goster
            </button>
          </div>

          <!-- Feedback mesaji -->
          <div v-if="actionMessage" class="px-4 py-2 bg-green-50 border-t border-green-100 text-xs text-green-700">
            {{ actionMessage }}
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  RefreshCw, Play, Pause, Search, Truck, Package, Clock, MapPin,
  ChevronRight, Navigation, Bell, X, RotateCw, Route, Users,
  Activity
} from 'lucide-vue-next'
import {
  getRoutes, getCouriers, getOrders, getEventHistory,
  reoptimizeRoute, removeOrderFromRoute, runDispatch,
  connectEventStream
} from '@/services/api'
import L from 'leaflet'

// —— Sabitler ——————————————————————————————————————————————————————
const ROUTE_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#00bcd4', '#d35400', '#8e44ad',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce',
]

const MAP_STATUS_LABELS  = { online: 'Musait', delivering: 'Dagitimda', break: 'Mola', offline: 'Offline' }
const MAP_STATUS_COLORS  = { online: 'bg-green-500', delivering: 'bg-blue-500', break: 'bg-yellow-500', offline: 'bg-gray-400' }
const MAP_STATUS_TEXT    = { online: 'text-green-600', delivering: 'text-blue-600', break: 'text-yellow-600', offline: 'text-gray-500' }
const MARKER_COLORS      = { online: '#22c55e', delivering: '#3b82f6', break: '#eab308', offline: '#9ca3af' }

const routeStatuses = {
  active:    { label: 'Aktif',      color: '#10b981', bg: '#d1fae5' },
  paused:    { label: 'Durduruldu', color: '#f59e0b', bg: '#fef3c7' },
  completed: { label: 'Tamamlandi', color: '#6366f1', bg: '#e0e7ff' },
  cancelled: { label: 'Iptal',      color: '#ef4444', bg: '#fee2e2' },
}

const panelTabs = [
  { key: 'routes',   label: 'Rotalar',   icon: Route },
  { key: 'couriers', label: 'Kuryeler',  icon: Users },
  { key: 'pending',  label: 'Bekleyen',  icon: Package },
  { key: 'events',   label: 'Olaylar',   icon: Activity },
]

const layerOptions = [
  { key: 'couriers', label: 'Kuryeler' },
  { key: 'routes',   label: 'Rotalar'  },
  { key: 'orders',   label: 'Siparisler' },
]

// —— State ————————————————————————————————————————————————————————
const routes       = ref([])
const couriers     = ref([])
const allOrders    = ref([])
const events       = ref([])
const loading      = ref(false)
const activePanel  = ref('routes')
const searchQuery  = ref('')
const statusFilter = ref(null)
const selectedRoute   = ref(null)
const selectedCourier = ref(null)
const actionLoading   = ref('')
const actionMessage   = ref('')
const layers = ref({ couriers: true, routes: true, orders: true })

// Harita
const mapContainer = ref(null)
let leafletMap     = null
const courierMarkers = {}
const routePolylines = {}
const orderMarkers   = {}
let sseConn = null

// —— Computed —————————————————————————————————————————————————————
const filteredRoutes = computed(() =>
  routes.value.filter(r => {
    if (!searchQuery.value) return true
    const q = searchQuery.value.toLowerCase()
    return r.routeNumber?.toLowerCase().includes(q) ||
           r.courier?.toLowerCase().includes(q) ||
           r.region?.toLowerCase().includes(q)
  })
)

const filteredCouriers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  let list = couriers.value
  if (statusFilter.value) list = list.filter(c => c.status === statusFilter.value)
  if (q) list = list.filter(c => c.name.toLowerCase().includes(q))
  return list
})

const pendingOrders = computed(() =>
  allOrders.value.filter(o => o.status === 'pending' || o.status === 'pool')
)

const kpiCards = computed(() => [
  { label: 'Aktif Rota',     value: routes.value.filter(r => r.status === 'active').length,    icon: Route,   iconBg: 'bg-green-50',  iconColor: 'text-green-500' },
  { label: 'Toplam Siparis', value: routes.value.reduce((s, r) => s + (r.orderCount || 0), 0), icon: Package, iconBg: 'bg-blue-50',   iconColor: 'text-blue-500'  },
  { label: 'Online Kurye',   value: couriers.value.filter(c => c.status !== 'offline').length, icon: Users,   iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500'},
  { label: 'Bekleyen',       value: pendingOrders.value.length,                                 icon: Clock,   iconBg: 'bg-amber-50',  iconColor: 'text-amber-500' },
])

const statusCounts = computed(() =>
  couriers.value.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc },
    { online: 0, delivering: 0, break: 0, offline: 0 })
)

const statusCards = computed(() => [
  { key: 'online',    label: 'Musait',    count: statusCounts.value.online,    icon: Navigation, color: 'text-green-600', bg: 'bg-green-50 border-green-200'   },
  { key: 'delivering',label: 'Dagitimda', count: statusCounts.value.delivering,icon: Truck,      color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200'     },
  { key: 'break',     label: 'Mola',      count: statusCounts.value.break,     icon: Clock,      color: 'text-yellow-600',bg: 'bg-yellow-50 border-yellow-200' },
  { key: 'offline',   label: 'Offline',   count: statusCounts.value.offline,   icon: X,          color: 'text-gray-500',  bg: 'bg-gray-50 border-gray-200'     },
])

// —— Data loading —————————————————————————————————————————————————
async function loadData() {
  loading.value = true
  try {
    const [rRes, cRes, oRes, eRes] = await Promise.all([
      getRoutes(), getCouriers(), getOrders(), getEventHistory(50),
    ])

    if (rRes.ok) {
      const raw = Array.isArray(rRes.data) ? rRes.data : rRes.data?.routes || []
      routes.value = raw.map((r, i) => normalizeRoute(r, i))
    }

    if (cRes.ok) {
      const raw = Array.isArray(cRes.data) ? cRes.data : cRes.data?.couriers || []
      couriers.value = raw.map((c, i) => normalizeCourier(c, i))
    }

    if (oRes.ok) {
      allOrders.value = Array.isArray(oRes.data) ? oRes.data : oRes.data?.orders || []
    }

    if (eRes.ok) {
      const raw = Array.isArray(eRes.data) ? eRes.data : eRes.data?.events || []
      events.value = raw.map((e, i) => normalizeEvent(e, i))
    }
  } catch (err) {
    console.error('[RouteList] Veri yuklenemedi:', err.message)
  } finally {
    loading.value = false
  }
}

// —— Normalizasyon ————————————————————————————————————————————————
function normalizeCourier(c, i) {
  const name = c.name || `Kurye ${i + 1}`
  return {
    id: c.id || c.courierId || `courier-${i}`,
    name,
    avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2),
    status: c.status || 'offline',
    lat: c.lat ?? c.latitude  ?? (40.95 + Math.random() * 0.12),
    lng: c.lng ?? c.longitude ?? (28.95 + Math.random() * 0.16),
    district: c.district || '',
    ordersCount: c.ordersCount ?? c.activeOrders ?? 0,
    deliveriesToday: c.deliveriesToday ?? 0,
    avgDeliveryTime: c.avgDeliveryTime ?? 0,
    battery: c.battery ?? 100,
    stops: c.stops || [],
  }
}

function normalizeRoute(r, i) {
  const totalStops     = r.totalStops ?? r.stops?.length ?? r.orderCount ?? 0
  const completedStops = r.completedStops ?? r.stops?.filter(s => s.status === 'delivered' || s.status === 'completed').length ?? 0
  return {
    _id: r._id || r.id || `route-${i}`,
    routeNumber: r.routeNumber || r.name || `RT-${i + 1}`,
    courier: r.courier || r.courierName || '',
    courierId: r.courierId || r.courier_id || '',
    region: r.region || r.district || r.zone || '',
    orderCount: totalStops,
    completedStops,
    maxCapacity: r.maxCapacity || 15,
    progress: totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0,
    status: r.status || 'active',
    totalDistance: r.totalDistance || '',
    eta: r.eta || '',
    stops: r.stops || [],
  }
}

function normalizeEvent(e, i) {
  const type = e.type || e.event_type || 'unknown'
  const ts   = e.timestamp || e.created_at || ''
  let timeStr = 'simdi'
  try { if (ts) timeStr = new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) } catch {}
  return {
    id: e.id || `ev-${i}`,
    type,
    title: e.title || (type === 'courier_location' ? 'Konum guncellendi' : type === 'order_status' ? `Siparis: ${e.status || ''}` : type),
    time: timeStr,
  }
}

// —— Harita ———————————————————————————————————————————————————————
function createCourierIcon(status) {
  const color = MARKER_COLORS[status] || '#9ca3af'
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
    </div>`,
    className: '', iconSize: [28, 28], iconAnchor: [14, 14],
  })
}

function initMap() {
  if (!mapContainer.value || leafletMap) return
  leafletMap = L.map(mapContainer.value, { center: [41.0082, 29.0291], zoom: 12 })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 19,
  }).addTo(leafletMap)
  updateMarkers()
  updatePolylines()
  fitBounds()
}

function destroyMap() {
  if (leafletMap) { leafletMap.remove(); leafletMap = null }
  Object.keys(courierMarkers).forEach(k => delete courierMarkers[k])
  Object.keys(routePolylines).forEach(k => delete routePolylines[k])
  Object.keys(orderMarkers).forEach(k => delete orderMarkers[k])
}

function fitBounds() {
  if (!leafletMap) return
  const pts = []
  couriers.value.forEach(c => pts.push([c.lat, c.lng]))
  if (pts.length > 1) try { leafletMap.fitBounds(L.latLngBounds(pts), { padding: [40, 40] }) } catch {}
}

function updateMarkers() {
  if (!leafletMap) return

  // Kurye markerlari
  if (layers.value.couriers) {
    couriers.value.forEach(c => {
      const icon = createCourierIcon(c.status)
      if (courierMarkers[c.id]) {
        courierMarkers[c.id].setLatLng([c.lat, c.lng]).setIcon(icon)
      } else {
        const m = L.marker([c.lat, c.lng], { icon })
        m.bindPopup(`<strong>${c.name}</strong><br/>${MAP_STATUS_LABELS[c.status]}`)
        m.on('click', () => selectCourier(c))
        m.addTo(leafletMap)
        courierMarkers[c.id] = m
      }
    })
  } else {
    Object.values(courierMarkers).forEach(m => leafletMap.removeLayer(m))
  }

  // Bekleyen siparis markerlari
  Object.values(orderMarkers).forEach(m => leafletMap.removeLayer(m))
  Object.keys(orderMarkers).forEach(k => delete orderMarkers[k])
  if (layers.value.orders) {
    allOrders.value.filter(o => o.status === 'pending' || o.status === 'pool').forEach(o => {
      const lat = o.lat ?? o.deliveryLocation?.lat
      const lng = o.lng ?? o.deliveryLocation?.lng
      if (!lat || !lng) return
      const m = L.circleMarker([lat, lng], { radius: 5, color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: 0.8, weight: 1.5 })
      m.bindPopup(`<strong>${o.customerName || o.name || 'Siparis'}</strong><br/>Bekliyor`)
      m.addTo(leafletMap)
      orderMarkers[o.id] = m
    })
  }
}

function updatePolylines() {
  if (!leafletMap) return
  Object.values(routePolylines).forEach(layerItems => {
    if (Array.isArray(layerItems)) layerItems.forEach(l => leafletMap.removeLayer(l))
    else leafletMap.removeLayer(layerItems)
  })
  Object.keys(routePolylines).forEach(k => delete routePolylines[k])

  if (!layers.value.routes) return

  couriers.value.filter(c => c.status === 'delivering' && c.stops?.length > 0).forEach((c, cIdx) => {
    const color   = ROUTE_COLORS[cIdx % ROUTE_COLORS.length]
    const isSelected = selectedCourier.value?.id === c.id || selectedRoute.value?.courierId === c.id
    const opacity = selectedCourier.value || selectedRoute.value ? (isSelected ? 1 : 0.15) : 0.7
    const weight  = isSelected ? 5 : 2.5
    const pts     = [[c.lat, c.lng]]
    const items   = []

    c.stops.filter(s => s.status !== 'completed').forEach((stop, idx) => {
      const slat = stop.lat ?? (c.lat + Math.sin(idx * 1.8) * 0.01)
      const slng = stop.lng ?? (c.lng + Math.cos(idx * 1.3) * 0.015)
      pts.push([slat, slng])
      const icon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:2px solid white;color:white;font-size:9px;font-weight:bold;display:flex;align-items:center;justify-content:center;opacity:${opacity}">${idx + 1}</div>`,
        className: '', iconSize: [20, 20], iconAnchor: [10, 10],
      })
      const sm = L.marker([slat, slng], { icon }).addTo(leafletMap)
      sm.bindPopup(`<strong>Durak ${idx + 1}</strong><br/>${stop.customer || stop.name || ''}`)
      items.push(sm)
    })

    if (pts.length > 1) {
      const poly = L.polyline(pts, { color, weight, opacity }).addTo(leafletMap)
      items.push(poly)
    }
    routePolylines[c.id] = items
  })
}

// —— SSE —————————————————————————————————————————————————————————
function connectSSE() {
  sseConn = connectEventStream((event) => {
    const type = event.type || event.event_type
    const data = event.payload || event.data || event

    if (type === 'courier_location' || type === 'location_update') {
      const id  = data.courierId || data.id
      const lat = data.lat ?? data.latitude
      const lng = data.lng ?? data.longitude
      if (id && lat != null && lng != null) {
        couriers.value = couriers.value.map(c => c.id === id ? { ...c, lat, lng } : c)
        if (courierMarkers[id]) courierMarkers[id].setLatLng([lat, lng])
      }
    }

    if (type === 'courier_status') {
      const id = data.courierId || data.id
      const st = data.status || data.newStatus
      if (id && st) {
        couriers.value = couriers.value.map(c => c.id === id ? { ...c, status: st } : c)
        if (courierMarkers[id]) courierMarkers[id].setIcon(createCourierIcon(st))
      }
    }

    if (type) {
      events.value = [normalizeEvent({ ...data, type }, events.value.length), ...events.value].slice(0, 100)
    }
  })
}

// —— Aksiyonlar ———————————————————————————————————————————————————
function selectRoute(route) {
  selectedRoute.value   = route
  selectedCourier.value = null
  updatePolylines()
  const courier = couriers.value.find(c => c.id === route.courierId)
  if (courier && leafletMap) leafletMap.setView([courier.lat, courier.lng], 14, { animate: true })
}

function selectCourier(courier) {
  selectedCourier.value = courier
  selectedRoute.value   = null
  updatePolylines()
  if (leafletMap) leafletMap.setView([courier.lat, courier.lng], 15, { animate: true })
}

function focusOnMap(courier) {
  if (leafletMap) leafletMap.setView([courier.lat, courier.lng], 16, { animate: true })
}

async function handleReoptimize(route) {
  actionLoading.value = 'reoptimize'
  const res = await reoptimizeRoute(route._id)
  actionLoading.value = ''
  actionMessage.value = res.ok ? 'Rota yeniden optimize edildi' : 'Optimizasyon baslatildi (API bekleniyor)'
  setTimeout(() => { actionMessage.value = '' }, 3000)
}

async function handleRemoveStop(stopId) {
  if (!selectedRoute.value) return
  actionLoading.value = 'remove'
  const res = await removeOrderFromRoute(selectedRoute.value._id, stopId)
  actionLoading.value = ''
  if (res.ok && selectedRoute.value) {
    selectedRoute.value.stops = selectedRoute.value.stops.filter(s => s.id !== stopId)
    selectedRoute.value.orderCount = selectedRoute.value.stops.length
  }
  actionMessage.value = 'Durak cikarildi'
  setTimeout(() => { actionMessage.value = '' }, 2000)
}

function handlePauseRoute(route) {
  route.status = 'paused'
  actionMessage.value = 'Rota durduruldu'
  setTimeout(() => { actionMessage.value = '' }, 2000)
}

function handleResumeRoute(route) {
  route.status = 'active'
  actionMessage.value = 'Rota devam ediyor'
  setTimeout(() => { actionMessage.value = '' }, 2000)
}

async function handleDispatch() {
  const res = await runDispatch()
  actionMessage.value = res.ok ? 'Dispatch calistirildi' : 'Dispatch baslatildi'
  await loadData()
  setTimeout(() => { actionMessage.value = '' }, 3000)
}

// —— Yardimcilar ——————————————————————————————————————————————————
function getProgressColor(progress) {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 50) return 'bg-blue-500'
  if (progress >= 25) return 'bg-amber-500'
  return 'bg-slate-300'
}

function formatETA(eta) {
  try { return new Date(eta).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) } catch { return eta }
}

// —— Watch ————————————————————————————————————————————————————————
watch(couriers, () => { updateMarkers(); updatePolylines() }, { deep: true })
watch(allOrders, () => { updateMarkers() }, { deep: true })
watch(layers, () => { updateMarkers(); updatePolylines() }, { deep: true })
watch([selectedRoute, selectedCourier], () => { updatePolylines() })

// —— Lifecycle ————————————————————————————————————————————————————
onMounted(async () => {
  await loadData()
  await nextTick()
  initMap()
  connectSSE()
})

onUnmounted(() => {
  destroyMap()
  if (sseConn) sseConn.close()
})
</script>

<style scoped>
.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(20px); opacity: 0; }
</style>
