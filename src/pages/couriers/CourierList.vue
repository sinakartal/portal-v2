<template>
  <div class="dark:bg-slate-900 min-h-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Kuryeler</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ filtered.length }} kurye listeleniyor</p>
      </div>
      <div class="flex gap-2">
        <!-- View Toggle -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
          <button
            @click="viewMode = 'list'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            ]"
          >
            <List :size="14" /> Liste
          </button>
          <button
            @click="viewMode = 'map'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer',
              viewMode === 'map'
                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            ]"
          >
            <MapIcon :size="14" /> Harita
          </button>
        </div>
        <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
          <Download :size="16" /> Export
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <Plus :size="16" /> Yeni Kurye
        </button>
      </div>
    </div>

    <!-- Status Summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
      <button
        v-for="([key, val]) in Object.entries(COURIER_STATUSES)"
        :key="key"
        @click="statusFilter = statusFilter === key ? '' : key"
        :class="[
          'flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer',
          statusFilter === key
            ? 'border-primary bg-primary/5 dark:bg-primary/10'
            : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
        ]"
      >
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: val.color }" />
          <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ val.label }}</span>
        </div>
        <span class="text-sm font-bold text-slate-800 dark:text-white">{{ statusCounts[key] || 0 }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            v-model="search"
            placeholder="Kurye adi, telefon, bolge, plaka ara..."
            class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="">Tum Durumlar</option>
          <option v-for="([key, val]) in Object.entries(COURIER_STATUSES)" :key="key" :value="key">{{ val.label }}</option>
        </select>
        <button @click="search = ''; statusFilter = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
          <RefreshCw :size="14" /> Sifirla
        </button>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div class="p-4 space-y-4">
        <div v-for="i in 8" :key="i" class="flex items-center gap-4 animate-pulse">
          <div class="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
            <div class="h-3 bg-slate-100 dark:bg-slate-600 rounded w-1/6" />
          </div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
          <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          <div class="h-3 bg-slate-100 dark:bg-slate-600 rounded w-24" />
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
      <p class="text-red-600 dark:text-red-400 font-medium">{{ error }}</p>
    </div>

    <!-- Map View -->
    <div v-else-if="viewMode === 'map'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div ref="mapContainer" class="w-full h-[600px]" />
    </div>

    <!-- List View -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Kurye</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Telefon</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Durum</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Arac</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Bolge</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Performans</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Toplam Teslimat</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Puan</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Son Gorulme</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Islem</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="courier in paginatedCouriers"
              :key="courier._id"
              class="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <!-- Kurye -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck :size="16" class="text-primary" />
                  </div>
                  <div>
                    <p class="font-medium text-slate-800 dark:text-slate-100 cursor-pointer hover:text-primary dark:hover:text-primary" @click="router.push(`/couriers/${courier._id}`)">{{ courier.name }}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500">{{ courier.vehicle.plate }}</p>
                  </div>
                </div>
              </td>
              <!-- Telefon -->
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ courier.phone }}</td>
              <!-- Durum -->
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :style="{ backgroundColor: getStatus(courier).bg, color: getStatus(courier).color }"
                >
                  {{ getStatus(courier).label }}
                </span>
              </td>
              <!-- Arac -->
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ courier.vehicle.type }}</td>
              <!-- Bolge -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <MapPin :size="12" class="text-slate-400 dark:text-slate-500" />
                  {{ courier.region }}
                </div>
              </td>
              <!-- Performans with mini progress bar -->
              <td class="px-4 py-3">
                <div class="flex flex-col items-center gap-1">
                  <span :class="['text-xs font-bold', getScoreTextColor(courier.performanceScore)]">
                    {{ courier.performanceScore }}
                  </span>
                  <div class="w-16 h-1.5 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :style="{ width: `${courier.performanceScore}%`, backgroundColor: getScoreBarColor(courier.performanceScore) }"
                    />
                  </div>
                </div>
              </td>
              <!-- Toplam Teslimat -->
              <td class="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                {{ formatNumber(courier.totalDeliveries) }}
              </td>
              <!-- Puan -->
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <Star :size="12" class="text-amber-400" fill="currentColor" />
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ courier.rating }}</span>
                </div>
              </td>
              <!-- Son Gorulme -->
              <td class="px-4 py-3">
                <span
                  :class="[
                    'text-xs font-medium',
                    isLastSeenOld(courier.lastSeen) ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                  ]"
                >
                  {{ courier.lastSeen ? timeAgo(courier.lastSeen) : '-' }}
                </span>
              </td>
              <!-- Hizli Aksiyonlar -->
              <td class="px-4 py-3">
                <div class="flex justify-center relative">
                  <button
                    @click.stop="toggleMenu(courier._id)"
                    class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded cursor-pointer transition-colors"
                  >
                    <MoreHorizontal :size="16" class="text-slate-500 dark:text-slate-400" />
                  </button>
                  <!-- Dropdown menu -->
                  <Transition
                    enter-active-class="transition ease-out duration-100"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <div
                      v-if="openMenuId === courier._id"
                      class="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg py-1"
                    >
                      <button
                        @click="router.push(`/couriers/${courier._id}`); openMenuId = null"
                        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer"
                      >
                        <Eye :size="14" /> Detay
                      </button>
                      <button
                        @click="showOnMap(courier); openMenuId = null"
                        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer"
                      >
                        <MapPin :size="14" /> Konumu Gor
                      </button>
                      <button
                        @click="setOffline(courier); openMenuId = null"
                        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                      >
                        <WifiOff :size="14" /> Offline Yap
                      </button>
                    </div>
                  </Transition>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
        <span class="text-sm text-slate-500 dark:text-slate-400">
          {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, filtered.length) }} / {{ filtered.length }}
        </span>
        <div class="flex items-center gap-1">
          <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer text-slate-600 dark:text-slate-300">
            <ChevronLeft :size="16" />
          </button>
          <template v-for="i in Math.min(5, totalPages)" :key="i">
            <button
              v-if="getPageNumber(i) <= totalPages"
              @click="currentPage = getPageNumber(i)"
              :class="['w-8 h-8 rounded text-sm cursor-pointer', getPageNumber(i) === currentPage ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300']"
            >
              {{ getPageNumber(i) }}
            </button>
          </template>
          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer text-slate-600 dark:text-slate-300">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Search, Download, RefreshCw, Eye,
  ChevronLeft, ChevronRight, Truck, Star, MapPin,
  MoreHorizontal, WifiOff, List, Map as MapIcon
} from 'lucide-vue-next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCouriers } from '@/services/api'
import { COURIER_STATUSES } from '@/constants/menu'
import { formatNumber, timeAgo } from '@/utils'

const router = useRouter()

const couriers = ref([])
const filtered = ref([])
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = 20
const loading = ref(false)
const error = ref(null)
const viewMode = ref('list')
const openMenuId = ref(null)

// Map refs
const mapContainer = ref(null)
let mapInstance = null

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getCouriers()
    if (res.ok) {
      const data = Array.isArray(res.data) ? res.data : res.data?.couriers || []
      couriers.value = data
      filtered.value = data
    } else {
      error.value = res.error || 'Kuryeler yuklenemedi'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }

  // Close dropdown on outside click
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  destroyMap()
  document.removeEventListener('click', handleOutsideClick)
})

function handleOutsideClick() {
  if (openMenuId.value) {
    openMenuId.value = null
  }
}

// ---------- Map logic ----------
watch(viewMode, async (mode) => {
  if (mode === 'map') {
    await nextTick()
    initMap()
  } else {
    destroyMap()
  }
})

function initMap() {
  if (mapInstance || !mapContainer.value) return

  mapInstance = L.map(mapContainer.value).setView([41.0082, 28.9784], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance)

  const statusColors = {
    active: '#10b981',
    pending: '#f59e0b',
    document_review: '#3b82f6',
    training: '#8b5cf6',
    suspended: '#ef4444',
    inactive: '#6b7280'
  }

  filtered.value.forEach(courier => {
    const lat = courier.location?.lat ?? courier.lat ?? 41.0082 + (Math.random() - 0.5) * 0.1
    const lng = courier.location?.lng ?? courier.lng ?? 28.9784 + (Math.random() - 0.5) * 0.2
    const color = statusColors[courier.status] || '#6b7280'

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })

    L.marker([lat, lng], { icon })
      .addTo(mapInstance)
      .bindPopup(`
        <div style="min-width:140px">
          <strong>${courier.name}</strong><br/>
          <span style="font-size:12px;color:${color}">${getStatus(courier).label}</span><br/>
          <span style="font-size:11px;color:#888">${courier.phone}</span>
        </div>
      `)
  })
}

function destroyMap() {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
}

// ---------- Filtering / Pagination ----------
watch([search, statusFilter, couriers], () => {
  let result = [...couriers.value]
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.phone.includes(s) ||
      c.region.toLowerCase().includes(s) ||
      c.vehicle.plate.toLowerCase().includes(s)
    )
  }
  if (statusFilter.value) {
    result = result.filter(c => c.status === statusFilter.value)
  }
  filtered.value = result
  currentPage.value = 1
})

const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))
const paginatedCouriers = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

const statusCounts = computed(() => {
  return couriers.value.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})
})

// ---------- Helpers ----------
function getStatus(courier) {
  return COURIER_STATUSES[courier.status] || { label: courier.status, color: '#6b7280', bg: '#f3f4f6' }
}

function getScoreTextColor(score) {
  if (score >= 90) return 'text-green-600 dark:text-green-400'
  if (score >= 75) return 'text-blue-600 dark:text-blue-400'
  if (score >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBarColor(score) {
  if (score >= 90) return '#16a34a'
  if (score >= 75) return '#2563eb'
  if (score >= 60) return '#d97706'
  return '#dc2626'
}

function isLastSeenOld(lastSeen) {
  if (!lastSeen) return false
  const diffMs = Date.now() - new Date(lastSeen).getTime()
  return diffMs > 30 * 60 * 1000
}

function getPageNumber(i) {
  return Math.max(1, Math.min(currentPage.value - 2, totalPages.value - 4)) + i - 1
}

// ---------- Actions ----------
function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function showOnMap(courier) {
  viewMode.value = 'map'
  // Map will initialize via watcher, then we can fly to courier location after next tick
  nextTick(() => {
    setTimeout(() => {
      if (mapInstance) {
        const lat = courier.location?.lat ?? courier.lat ?? 41.0082
        const lng = courier.location?.lng ?? courier.lng ?? 28.9784
        mapInstance.setView([lat, lng], 15)
      }
    }, 300)
  })
}

function setOffline(courier) {
  // Locally update status for now
  courier.status = 'inactive'
}
</script>
