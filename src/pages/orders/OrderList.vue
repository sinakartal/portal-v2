<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Siparisler</h1>
        <p class="text-sm text-slate-500 mt-1">{{ filtered.length }} siparis listeleniyor</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors cursor-pointer">
          <Download :size="16" /> Export
        </button>
        <button @click="router.push('/orders/new')" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <Plus :size="16" /> Yeni Siparis
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-4 mb-4">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            v-model="search"
            placeholder="Siparis no, musteri, telefon ara..."
            class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="">Tum Durumlar</option>
          <option v-for="(val, key) in ORDER_STATUSES" :key="key" :value="key">{{ val.label }}</option>
        </select>
        <button class="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
          <Filter :size="14" /> Filtreler
        </button>
        <button @click="search = ''; statusFilter = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
          <RefreshCw :size="14" /> Sifirla
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedOrders.length > 0" class="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between">
      <span class="text-sm text-primary font-medium">{{ selectedOrders.length }} siparis secildi</span>
      <div class="flex gap-2">
        <button class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium cursor-pointer">Rotaya Ekle</button>
        <button class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium cursor-pointer">Kurye Ata</button>
        <button class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium cursor-pointer">Durum Guncelle</button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="w-10 px-4 py-3">
                <input type="checkbox" :checked="selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0" @change="toggleSelectAll" class="cursor-pointer" />
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Siparis No</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Musteri</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Adres</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Tutar</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Oncelik</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Tarih</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in paginatedOrders" :key="order._id" class="border-b border-slate-50 hover:bg-slate-50/50">
              <td class="px-4 py-3">
                <input type="checkbox" :checked="selectedOrders.includes(order._id)" @change="toggleSelect(order._id)" class="cursor-pointer" />
              </td>
              <td class="px-4 py-3 font-medium text-primary cursor-pointer" @click="router.push(`/orders/${order._id}`)">{{ order.orderNumber }}</td>
              <td class="px-4 py-3">
                <div>
                  <p class="font-medium text-slate-700">{{ order.customer.name }}</p>
                  <p class="text-xs text-slate-400">{{ order.customer.phone }}</p>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600 max-w-[200px] truncate">{{ order.customer.address }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :style="{ backgroundColor: getStatus(order.status).bg, color: getStatus(order.status).color }"
                >
                  {{ getStatus(order.status).label }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ order.courier || '-' }}</td>
              <td class="px-4 py-3 font-medium text-slate-700">{{ formatCurrency(order.totalPrice) }}</td>
              <td class="px-4 py-3">
                <span :class="`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[order.priority]}`">
                  {{ priorityLabels[order.priority] }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(order.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-center gap-1">
                  <button @click="router.push(`/orders/${order._id}`)" class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay"><Eye :size="14" class="text-slate-500" /></button>
                  <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Duzenle"><Edit2 :size="14" class="text-slate-500" /></button>
                  <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Kurye Ata"><UserPlus :size="14" class="text-slate-500" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100">
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
              :class="`w-8 h-8 rounded text-sm cursor-pointer ${getPageNumber(i) === currentPage ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`"
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
import { Plus, Search, Filter, Download, RefreshCw, Eye, Edit2, UserPlus, XCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { generateOrders } from '@/services/mockData'
import { ORDER_STATUSES } from '@/constants/menu'
import { formatCurrency, formatDate } from '@/utils'

const router = useRouter()

const orders = ref([])
const filtered = ref([])
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const selectedOrders = ref([])
const perPage = 25

onMounted(() => {
  const data = generateOrders(200)
  orders.value = data
  filtered.value = data
})

watch([search, statusFilter, orders], () => {
  let result = [...orders.value]
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(o =>
      o.orderNumber.toLowerCase().includes(s) ||
      o.customer.name.toLowerCase().includes(s) ||
      o.customer.phone.includes(s) ||
      o.customer.address.toLowerCase().includes(s)
    )
  }
  if (statusFilter.value) {
    result = result.filter(o => o.status === statusFilter.value)
  }
  filtered.value = result
  currentPage.value = 1
})

const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))
const paginatedOrders = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

const toggleSelect = (id) => {
  if (selectedOrders.value.includes(id)) {
    selectedOrders.value = selectedOrders.value.filter(x => x !== id)
  } else {
    selectedOrders.value = [...selectedOrders.value, id]
  }
}

const toggleSelectAll = () => {
  if (selectedOrders.value.length === paginatedOrders.value.length) {
    selectedOrders.value = []
  } else {
    selectedOrders.value = paginatedOrders.value.map(o => o._id)
  }
}

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  normal: 'bg-blue-50 text-blue-600',
  high: 'bg-orange-50 text-orange-600',
  urgent: 'bg-red-50 text-red-600',
}

const priorityLabels = { low: 'Dusuk', normal: 'Normal', high: 'Yuksek', urgent: 'Acil' }

const getStatus = (status) => {
  return ORDER_STATUSES[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' }
}

const getPageNumber = (i) => {
  return Math.max(1, Math.min(currentPage.value - 2, totalPages.value - 4)) + (i - 1)
}
</script>
