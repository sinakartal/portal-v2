<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getCouriers, getOrders } from '@/services/api'
import { RefreshCw, Truck, Package, MapPin, Filter, Maximize2 } from 'lucide-vue-next'

const auth = useAuthStore()
let map = null
let courierMarkers = []
let orderMarkers = []
let refreshTimer = null

const loading = ref(true)
const error = ref('')
const lastUpdate = ref(null)
const showCouriers = ref(true)
const showOrders = ref(true)
const fullscreen = ref(false)

const couriers = ref([])
const orders = ref([])

const stats = computed(() => ({
  totalCouriers: couriers.value.length,
  activeCouriers: couriers.value.filter(c => c.status === 'delivering' || c.status === 'busy' || c.status === 'active').length,
  totalOrders: orders.value.length,
  pendingOrders: orders.value.filter(o => o.status === 'pending' || o.status === 'new').length,
}))

function getStatusColor(status) {
  const colors = {
    delivering: '#10b981', busy: '#10b981', active: '#10b981',
    idle: '#6b7280', available: '#6b7280',
    returning: '#f59e0b',
    in_transit: '#3b82f6', dispatched: '#3b82f6', assigned: '#3b82f6',
    pending: '#f59e0b', new: '#f59e0b',
    ready_for_pickup: '#8b5cf6',
  }
  return colors[status] || '#6b7280'
}

function getModeIcon(mode) {
  return mode === 'instant' || mode === 'express' ? '⚡' : mode === 'flex' ? '🕐' : '📦'
}

// Gerçek API'den veri çek
async function fetchData() {
  try {
    const [cRes, oRes] = await Promise.all([getCouriers(), getOrders()])

    if (cRes.ok) {
      const rawCouriers = Array.isArray(cRes.data) ? cRes.data : cRes.data?.couriers || []
      couriers.value = rawCouriers
        .filter(c => c.location?.lat || c.lat)
        .map(c => ({
          id: c.id || c.courierId,
          name: c.name || c.courierName || `Kurye ${c.id}`,
          lat: c.location?.lat || c.lat,
          lng: c.location?.lng || c.lng,
          status: c.status || 'idle',
          activeOrders: c.activeOrders || c.currentOrderCount || 0,
        }))
    }

    if (oRes.ok) {
      const rawOrders = Array.isArray(oRes.data) ? oRes.data : oRes.data?.orders || []
      orders.value = rawOrders
        .filter(o => (o.deliveryLocation?.lat || o.lat) && o.status !== 'delivered' && o.status !== 'cancelled')
        .map(o => ({
          id: o.id || o.orderId,
          lat: o.deliveryLocation?.lat || o.lat,
          lng: o.deliveryLocation?.lng || o.lng,
          status: o.status,
          mode: o.mode || 'standard',
        }))
    }

    lastUpdate.value = new Date()
    error.value = ''
  } catch (e) {
    error.value = 'Veri alınamadı: ' + e.message
    console.warn('[LiveMap] API hatası:', e)
  }
}

async function initMap() {
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  map = L.map('live-map-container', {
    center: [41.0082, 28.9784],
    zoom: 12,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)

  await fetchData()
  updateMarkers()
  loading.value = false
}

function updateMarkers() {
  if (!map) return

  // Mevcut marker'ları temizle
  courierMarkers.forEach(m => map.removeLayer(m))
  orderMarkers.forEach(m => map.removeLayer(m))
  courierMarkers = []
  orderMarkers = []

  if (showCouriers.value) {
    couriers.value.forEach(c => {
      const color = getStatusColor(c.status)
      const L = window.L
      if (!L) return
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:32px;height:32px;background:${color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;">🏍️</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      const marker = L.marker([c.lat, c.lng], { icon })
        .bindPopup(`<b>${c.name}</b><br>Durum: ${c.status}<br>Aktif Sipariş: ${c.activeOrders}`)
        .addTo(map)
      courierMarkers.push(marker)
    })
  }

  if (showOrders.value) {
    orders.value.forEach(o => {
      const color = getStatusColor(o.status)
      const L = window.L
      if (!L) return
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:24px;height:24px;background:${color};border:2px solid white;border-radius:4px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);font-size:12px;">${getModeIcon(o.mode)}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      const marker = L.marker([o.lat, o.lng], { icon })
        .bindPopup(`<b>${o.id}</b><br>Durum: ${o.status}<br>Mod: ${o.mode}`)
        .addTo(map)
      orderMarkers.push(marker)
    })
  }

  // Aktif kurye varsa haritayı onlara ortala
  if (couriers.value.length > 0 && map) {
    const L = window.L
    if (L) {
      const bounds = L.latLngBounds(couriers.value.map(c => [c.lat, c.lng]))
      if (orders.value.length > 0) {
        orders.value.forEach(o => bounds.extend([o.lat, o.lng]))
      }
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }
}

async function refresh() {
  await fetchData()
  updateMarkers()
}

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value
  setTimeout(() => map?.invalidateSize(), 300)
}

// SSE kurye konum güncelleme
function connectSSE() {
  try {
    const evtSource = new EventSource('/algoritma/api/events/stream')
    evtSource.addEventListener('courier_location', (e) => {
      const data = JSON.parse(e.data)
      const courier = couriers.value.find(c => c.id === data.courierId)
      if (courier && data.lat && data.lng) {
        courier.lat = data.lat
        courier.lng = data.lng
        courier.status = data.status || courier.status
        updateMarkers()
        lastUpdate.value = new Date()
      }
    })
    evtSource.addEventListener('order_status', async () => {
      await fetchData()
      updateMarkers()
    })
    evtSource.onerror = () => evtSource.close()
    return evtSource
  } catch {
    return null
  }
}

let sseSource = null

onMounted(async () => {
  await initMap()
  // SSE bağlantısı dene — çalışmazsa polling ile devam et
  sseSource = connectSSE()
  if (!sseSource) {
    refreshTimer = setInterval(refresh, 15000)
  }
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (sseSource) sseSource.close()
  if (map) { map.remove(); map = null }
})
</script>

<template>
  <div :class="fullscreen ? 'fixed inset-0 z-[100] bg-white dark:bg-slate-900' : ''">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4" :class="fullscreen ? 'px-4 pt-4' : ''">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Canli Harita</h1>
        <p class="text-sm text-slate-500">
          Son guncelleme: {{ lastUpdate ? new Date(lastUpdate).toLocaleTimeString('tr-TR') : '—' }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="refresh" class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
          <RefreshCw :size="14" /> Yenile
        </button>
        <button @click="toggleFullscreen" class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
          <Maximize2 :size="14" />
        </button>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="mb-3 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
      {{ error }}
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-4 gap-3 mb-4" :class="fullscreen ? 'px-4' : ''">
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-emerald-600">{{ stats.activeCouriers }}</div>
        <div class="text-xs text-slate-500">Aktif Kurye</div>
      </div>
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-slate-700 dark:text-slate-200">{{ stats.totalCouriers }}</div>
        <div class="text-xs text-slate-500">Toplam Kurye</div>
      </div>
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.totalOrders }}</div>
        <div class="text-xs text-slate-500">Toplam Siparis</div>
      </div>
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-amber-600">{{ stats.pendingOrders }}</div>
        <div class="text-xs text-slate-500">Bekleyen</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4 mb-3" :class="fullscreen ? 'px-4' : ''">
      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
        <input type="checkbox" v-model="showCouriers" @change="updateMarkers" class="rounded border-slate-300" />
        <Truck :size="14" /> Kuryeler
      </label>
      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
        <input type="checkbox" v-model="showOrders" @change="updateMarkers" class="rounded border-slate-300" />
        <Package :size="14" /> Siparisler
      </label>
    </div>

    <!-- Map -->
    <div
      id="live-map-container"
      class="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      :class="fullscreen ? 'mx-4 mb-4' : ''"
      :style="{ height: fullscreen ? 'calc(100vh - 260px)' : '600px' }"
    >
      <div v-if="loading" class="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
        <div class="text-slate-500 flex items-center gap-2">
          <RefreshCw :size="16" class="animate-spin" /> Harita yukleniyor...
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.custom-marker {
  background: transparent !important;
  border: none !important;
}
</style>
