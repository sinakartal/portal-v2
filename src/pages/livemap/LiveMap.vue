<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RefreshCw, Truck, Package, MapPin, Filter, Maximize2 } from 'lucide-vue-next'

const auth = useAuthStore()
let map = null
let courierMarkers = []
let orderMarkers = []
let refreshTimer = null

const loading = ref(true)
const lastUpdate = ref(null)
const showCouriers = ref(true)
const showOrders = ref(true)
const fullscreen = ref(false)

// Mock courier data (will be replaced with real API)
const couriers = ref([
  { id: 'C001', name: 'Ahmet Y.', lat: 41.0082, lng: 28.9784, status: 'delivering', activeOrders: 3 },
  { id: 'C002', name: 'Mehmet K.', lat: 41.0150, lng: 29.0100, status: 'idle', activeOrders: 0 },
  { id: 'C003', name: 'Ali D.', lat: 40.9900, lng: 28.9500, status: 'delivering', activeOrders: 2 },
  { id: 'C004', name: 'Veli S.', lat: 41.0300, lng: 29.0300, status: 'returning', activeOrders: 1 },
  { id: 'C005', name: 'Hasan T.', lat: 41.0050, lng: 28.9900, status: 'delivering', activeOrders: 4 },
  { id: 'C006', name: 'Burak E.', lat: 40.9800, lng: 29.0200, status: 'idle', activeOrders: 0 },
])

const orders = ref([
  { id: 'ORD-101', lat: 41.0120, lng: 28.9850, status: 'in_transit', mode: 'express' },
  { id: 'ORD-102', lat: 41.0200, lng: 29.0050, status: 'pending', mode: 'standard' },
  { id: 'ORD-103', lat: 40.9950, lng: 28.9600, status: 'in_transit', mode: 'standard' },
  { id: 'ORD-104', lat: 41.0250, lng: 29.0250, status: 'ready_for_pickup', mode: 'express' },
  { id: 'ORD-105', lat: 41.0000, lng: 28.9750, status: 'pending', mode: 'flex' },
])

const stats = computed(() => ({
  totalCouriers: couriers.value.length,
  activeCouriers: couriers.value.filter(c => c.status === 'delivering').length,
  totalOrders: orders.value.length,
  pendingOrders: orders.value.filter(o => o.status === 'pending').length,
}))

function getStatusColor(status) {
  const colors = {
    delivering: '#10b981',
    idle: '#6b7280',
    returning: '#f59e0b',
    in_transit: '#3b82f6',
    pending: '#f59e0b',
    ready_for_pickup: '#8b5cf6',
  }
  return colors[status] || '#6b7280'
}

function getModeIcon(mode) {
  return mode === 'express' ? '⚡' : mode === 'flex' ? '🕐' : '📦'
}

async function initMap() {
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  map = L.map('live-map-container', {
    center: [41.0082, 28.9784],
    zoom: 13,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  updateMarkers()
  loading.value = false
  lastUpdate.value = new Date()
}

function updateMarkers() {
  if (!map) return
  const L = window.L || require('leaflet')

  // Clear old markers
  courierMarkers.forEach(m => map.removeLayer(m))
  orderMarkers.forEach(m => map.removeLayer(m))
  courierMarkers = []
  orderMarkers = []

  // Courier markers
  if (showCouriers.value) {
    couriers.value.forEach(c => {
      const color = getStatusColor(c.status)
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:32px;height:32px;background:${color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;">🏍️</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      const marker = L.marker([c.lat, c.lng], { icon })
        .bindPopup(`<b>${c.name}</b><br>Durum: ${c.status}<br>Aktif Siparis: ${c.activeOrders}`)
        .addTo(map)
      courierMarkers.push(marker)
    })
  }

  // Order markers
  if (showOrders.value) {
    orders.value.forEach(o => {
      const color = getStatusColor(o.status)
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
}

function simulateMovement() {
  couriers.value.forEach(c => {
    if (c.status === 'delivering') {
      c.lat += (Math.random() - 0.5) * 0.002
      c.lng += (Math.random() - 0.5) * 0.002
    }
  })
  updateMarkers()
  lastUpdate.value = new Date()
}

function refresh() {
  simulateMovement()
}

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value
  setTimeout(() => map?.invalidateSize(), 300)
}

onMounted(() => {
  initMap()
  refreshTimer = setInterval(simulateMovement, 5000)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
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
      :style="{ height: fullscreen ? 'calc(100vh - 220px)' : '600px' }"
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
