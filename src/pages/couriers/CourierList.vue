<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Kuryeler</h1>
        <p class="text-sm text-slate-500 mt-1">{{ filtered.length }} kurye listeleniyor</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors cursor-pointer">
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
          statusFilter === key ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:bg-slate-50'
        ]"
      >
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: val.color }" />
          <span class="text-xs font-medium text-slate-600">{{ val.label }}</span>
        </div>
        <span class="text-sm font-bold text-slate-800">{{ statusCounts[key] || 0 }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-4 mb-4">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            v-model="search"
            placeholder="Kurye adi, telefon, bolge, plaka ara..."
            class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="">Tum Durumlar</option>
          <option v-for="([key, val]) in Object.entries(COURIER_STATUSES)" :key="key" :value="key">{{ val.label }}</option>
        </select>
        <button @click="search = ''; statusFilter = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
          <RefreshCw :size="14" /> Sifirla
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Telefon</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Arac</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Bolge</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Performans</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Toplam Teslimat</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Puan</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="courier in paginatedCouriers"
              :key="courier._id"
              class="border-b border-slate-50 hover:bg-slate-50/50"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck :size="16" class="text-primary" />
                  </div>
                  <div>
                    <p class="font-medium text-slate-800 cursor-pointer hover:text-primary" @click="router.push(`/couriers/${courier._id}`)">{{ courier.name }}</p>
                    <p class="text-xs text-slate-400">{{ courier.vehicle.plate }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ courier.phone }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :style="{ backgroundColor: getStatus(courier).bg, color: getStatus(courier).color }"
                >
                  {{ getStatus(courier).label }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ courier.vehicle.type }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1 text-slate-600">
                  <MapPin :size="12" class="text-slate-400" />
                  {{ courier.region }}
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-bold', getScoreColor(courier.performanceScore)]">
                  {{ courier.performanceScore }}
                </span>
              </td>
              <td class="px-4 py-3 text-center font-medium text-slate-700">
                {{ formatNumber(courier.totalDeliveries) }}
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <Star :size="12" class="text-amber-400" fill="currentColor" />
                  <span class="font-medium text-slate-700">{{ courier.rating }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-center gap-1">
                  <button @click="router.push(`/couriers/${courier._id}`)" class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay">
                    <Eye :size="14" class="text-slate-500" />
                  </button>
                  <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Duzenle">
                    <Edit2 :size="14" class="text-slate-500" />
                  </button>
                  <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Ara">
                    <Phone :size="14" class="text-slate-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <span class="text-sm text-slate-500">
          {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, filtered.length) }} / {{ filtered.length }}
        </span>
        <div class="flex items-center gap-1">
          <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1" class="p-2 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer">
            <ChevronLeft :size="16" />
          </button>
          <template v-for="i in Math.min(5, totalPages)" :key="i">
            <button
              v-if="getPageNumber(i) <= totalPages"
              @click="currentPage = getPageNumber(i)"
              :class="['w-8 h-8 rounded text-sm cursor-pointer', getPageNumber(i) === currentPage ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600']"
            >
              {{ getPageNumber(i) }}
            </button>
          </template>
          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages" class="p-2 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Search, Filter, Download, RefreshCw, Eye, Edit2, Phone,
  ChevronLeft, ChevronRight, Truck, Star, MapPin, Activity
} from 'lucide-vue-next'
import { generateCouriers } from '@/services/mockData'
import { COURIER_STATUSES } from '@/constants/menu'
import { formatNumber, formatDate } from '@/utils'

const router = useRouter()

const couriers = ref([])
const filtered = ref([])
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = 20

onMounted(() => {
  const data = generateCouriers(15)
  couriers.value = data
  filtered.value = data
})

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

function getStatus(courier) {
  return COURIER_STATUSES[courier.status] || { label: courier.status, color: '#6b7280', bg: '#f3f4f6' }
}

function getScoreColor(score) {
  if (score >= 90) return 'text-green-600 bg-green-50'
  if (score >= 75) return 'text-blue-600 bg-blue-50'
  if (score >= 60) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

function getPageNumber(i) {
  return Math.max(1, Math.min(currentPage.value - 2, totalPages.value - 4)) + i - 1
}
</script>
