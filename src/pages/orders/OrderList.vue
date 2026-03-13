<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Download, RefreshCw, Eye, UserPlus, ChevronLeft, ChevronRight, Zap, MoreHorizontal, MapPin, XCircle, Package, ArrowUpDown, Cpu } from 'lucide-vue-next'
import { getOrders, dispatchOrder } from '@/services/api'
import { ORDER_STATUSES } from '@/constants/menu'
import { formatCurrency, formatDate } from '@/utils'

const router = useRouter()

const orders = ref([])
const search = ref('')
const statusTab = ref('all')
const currentPage = ref(1)
const selectedOrders = ref([])
const perPage = 25
const loading = ref(true)
const error = ref(null)
const sortBy = ref('createdAt')
const sortDir = ref('desc')
const openActionMenu = ref(null)

// Proje ve Sube filtreleri
const projectFilter = ref('all')
const branchFilter = ref('all')

const PROJECTS_LIST = [
  'Tumu',
  'Istanbul Ana Dagitim', 'Ankara Bolge', 'Izmir Sahil',
  'Antalya Turizm', 'Bursa Sanayi', 'Express Teslimat',
  'Gida Dagitim', 'E-Ticaret Lojistik'
]

const branchList = computed(() => {
  const branches = new Set(['Tumu'])
  orders.value.forEach(o => {
    if (o.origin?.branch) branches.add(o.origin.branch)
    if (o.branch) branches.add(o.branch)
  })
  return Array.from(branches)
})

// Status tabs — operasyonel bakis acisi
const STATUS_TABS = [
  { key: 'all',       label: 'Tumu' },
  { key: 'unrouted',  label: 'Rotalanmamis',  statuses: ['pending', 'confirmed', 'processing', 'preparing'],
    description: 'Henuz bir rotaya atanmamis siparisler' },
  { key: 'routed',    label: 'Rotalandi',      statuses: ['dispatched'],
    description: 'Rotaya atandi, kurye henuz almadi' },
  { key: 'in_transit',label: 'Dagitimda',      statuses: ['picked_up', 'assigned', 'in_transit', 'arriving', 'at_location', 'attempting_delivery'],
    description: 'Kurye uzerinde, teslimatta' },
  { key: 'delivered', label: 'Teslim Edildi',  statuses: ['delivered', 'partially_delivered'],
    description: 'Basariyla teslim edildi' },
  { key: 'failed',    label: 'Teslim Edilemedi', statuses: ['failed_delivery', 'refused', 'returned'],
    description: 'Teslim basarisiz veya iade' },
  { key: 'cancelled', label: 'Iptal',           statuses: ['cancelled'],
    description: 'Iptal edildi' },
]

async function loadOrders() {
  loading.value = true
  error.value = null
  try {
    const res = await getOrders()
    if (res.ok) {
      orders.value = Array.isArray(res.data) ? res.data : res.data?.orders || []
    }
  } catch (err) {
    error.value = 'Siparisler yuklenemedi'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
  window.addEventListener('bringo:dispatch-committed', handleDispatchEvent)
})

onUnmounted(() => {
  window.removeEventListener('bringo:dispatch-committed', handleDispatchEvent)
})

function handleDispatchEvent(e) {
  loadOrders()
  dispatchMessage.value = `Algoritma ${e.detail.routeCount} rota olusturdu — ${e.detail.orderCount} siparis guncellendi`
  setTimeout(() => { dispatchMessage.value = '' }, 5000)
}

// Filtered + sorted
const filtered = computed(() => {
  let result = [...orders.value]

  // Status tab filter
  if (statusTab.value !== 'all') {
    const tab = STATUS_TABS.find(t => t.key === statusTab.value)
    if (tab?.statuses) result = result.filter(o => tab.statuses.includes(o.status))
  }

  // Proje filtresi
  if (projectFilter.value && projectFilter.value !== 'all' && projectFilter.value !== 'Tumu') {
    result = result.filter(o =>
      o.project === projectFilter.value ||
      o.origin?.project === projectFilter.value ||
      o.projectName === projectFilter.value
    )
  }

  // Sube filtresi
  if (branchFilter.value && branchFilter.value !== 'all' && branchFilter.value !== 'Tumu') {
    result = result.filter(o =>
      o.branch === branchFilter.value ||
      o.origin?.branch === branchFilter.value
    )
  }

  // Search
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(o =>
      o.orderNumber?.toLowerCase().includes(s) ||
      o.customer?.name?.toLowerCase().includes(s) ||
      o.customer?.phone?.includes(s) ||
      o.customer?.address?.toLowerCase().includes(s)
    )
  }

  // Sort
  result.sort((a, b) => {
    let va, vb
    if (sortBy.value === 'createdAt') { va = new Date(a.createdAt); vb = new Date(b.createdAt) }
    else if (sortBy.value === 'totalPrice') { va = a.totalPrice || 0; vb = b.totalPrice || 0 }
    else if (sortBy.value === 'orderNumber') { va = a.orderNumber; vb = b.orderNumber }
    else if (sortBy.value === 'customer') { va = a.customer?.name || ''; vb = b.customer?.name || '' }
    else { va = a[sortBy.value]; vb = b[sortBy.value] }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

// Tab counts
const tabCounts = computed(() => {
  const counts = {}
  STATUS_TABS.forEach(tab => {
    if (tab.key === 'all') counts.all = orders.value.length
    else counts[tab.key] = orders.value.filter(o => tab.statuses?.includes(o.status)).length
  })
  return counts
})

watch([search, statusTab, projectFilter, branchFilter], () => { currentPage.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginatedOrders = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

const toggleSelect = (id) => {
  if (selectedOrders.value.includes(id)) selectedOrders.value = selectedOrders.value.filter(x => x !== id)
  else selectedOrders.value = [...selectedOrders.value, id]
}
const toggleSelectAll = () => {
  selectedOrders.value = selectedOrders.value.length === paginatedOrders.value.length ? [] : paginatedOrders.value.map(o => o._id)
}

const priorityBorderColors = { urgent: 'border-l-red-500', high: 'border-l-amber-400', normal: 'border-l-transparent', low: 'border-l-transparent' }
const priorityLabels = { low: 'Dusuk', normal: 'Normal', high: 'Yuksek', urgent: 'Acil' }
const priorityColors = { low: 'bg-slate-100 text-slate-600', normal: 'bg-blue-50 text-blue-600', high: 'bg-orange-50 text-orange-600', urgent: 'bg-red-50 text-red-600' }

const getStatus = (status) => ORDER_STATUSES[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' }

const getDistrict = (address) => {
  if (!address) return '-'
  const parts = address.split(',').map(p => p.trim())
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0]
}

const toggleSort = (col) => {
  if (sortBy.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortBy.value = col; sortDir.value = 'desc' }
}

const getPageNumber = (i) => Math.max(1, Math.min(currentPage.value - 2, totalPages.value - 4)) + (i - 1)

// Dispatch
const dispatchLoading = ref(false)
const dispatchMessage = ref('')

async function handleDispatchSingle(orderId) {
  openActionMenu.value = null
  dispatchLoading.value = true; dispatchMessage.value = ''
  await dispatchOrder(orderId)
  dispatchLoading.value = false
  dispatchMessage.value = 'Siparis dispatch edildi'
  setTimeout(() => { dispatchMessage.value = '' }, 3000)
}
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="loading" class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="space-y-2">
        <div class="h-7 w-40 bg-slate-200 rounded animate-pulse" />
        <div class="h-4 w-56 bg-slate-100 rounded animate-pulse" />
      </div>
      <div class="flex gap-2">
        <div class="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
        <div class="h-10 w-28 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    </div>
    <div class="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
      <div v-for="i in 8" :key="i" class="flex gap-4">
        <div class="h-4 w-8 bg-slate-100 rounded animate-pulse" />
        <div class="h-4 flex-1 bg-slate-100 rounded animate-pulse" />
        <div class="h-4 w-24 bg-slate-100 rounded animate-pulse" />
        <div class="h-4 w-20 bg-slate-100 rounded animate-pulse" />
        <div class="h-4 w-16 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center h-64 gap-3">
    <XCircle :size="40" class="text-red-300" />
    <p class="text-red-500 font-medium">{{ error }}</p>
    <button @click="loadOrders" class="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-red-100 transition-colors">
      <RefreshCw :size="14" class="inline mr-1" /> Tekrar Dene
    </button>
  </div>

  <div v-else>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Siparisler</h1>
        <p class="text-sm text-slate-500 mt-1">{{ filtered.length }} siparis listeleniyor</p>
      </div>
      <div class="flex gap-2">
        <button @click="router.push('/algorithm')"
          class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <Cpu :size="16" /> Algoritma ile Dispatch
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
          <Download :size="16" /> Export
        </button>
        <button @click="router.push('/orders/new')"
          class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <Plus :size="16" /> Yeni Siparis
        </button>
      </div>
    </div>

    <!-- Dispatch Message -->
    <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="dispatchMessage" class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center gap-2">
        <Zap :size="16" class="text-emerald-600" />
        <span class="text-sm text-emerald-700 font-medium">{{ dispatchMessage }}</span>
      </div>
    </Transition>

    <!-- Status Tabs + Search + Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">

      <!-- Status Tabs -->
      <div class="flex items-center gap-0 px-4 pt-3 border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
        <button
          v-for="tab in STATUS_TABS" :key="tab.key"
          @click="statusTab = tab.key"
          :class="[
            'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px whitespace-nowrap',
            statusTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
          :title="tab.description"
        >
          <span v-if="tab.key === 'unrouted'"  class="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
          <span v-else-if="tab.key === 'routed'" class="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          <span v-else-if="tab.key === 'in_transit'" class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span v-else-if="tab.key === 'delivered'" class="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          <span v-else-if="tab.key === 'failed'" class="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          <span v-else-if="tab.key === 'cancelled'" class="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />

          {{ tab.label }}

          <span
            :class="[
              'min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full flex items-center justify-center',
              statusTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            ]"
          >
            {{ tabCounts[tab.key] || 0 }}
          </span>
        </button>
      </div>

      <!-- Arama + Proje/Sube Filtresi -->
      <div class="flex items-center gap-3 p-3 flex-wrap">
        <div class="relative flex-1 min-w-[200px]">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" v-model="search"
            placeholder="Siparis no, musteri, telefon veya adres..."
            class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <select v-model="projectFilter"
          class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]">
          <option value="all">Tum Projeler</option>
          <option v-for="p in PROJECTS_LIST.slice(1)" :key="p" :value="p">{{ p }}</option>
        </select>

        <select v-model="branchFilter"
          class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]">
          <option value="all">Tum Subeler</option>
          <option v-for="b in branchList.slice(1)" :key="b" :value="b">{{ b }}</option>
        </select>

        <button
          v-if="search || statusTab !== 'all' || projectFilter !== 'all' || branchFilter !== 'all'"
          @click="search = ''; statusTab = 'all'; projectFilter = 'all'; branchFilter = 'all'"
          class="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw :size="14" /> Sifirla
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
      <div v-if="selectedOrders.length > 0" class="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between">
        <span class="text-sm text-primary font-medium">{{ selectedOrders.length }} siparis secildi</span>
        <div class="flex gap-2">
          <button class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium cursor-pointer">Rotaya Ekle</button>
          <button class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium cursor-pointer">Kurye Ata</button>
          <button class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1">
            <Download :size="13" /> Export Secili
          </button>
        </div>
      </div>
    </Transition>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <th class="w-10 px-4 py-3">
                <input type="checkbox" :checked="selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0" @change="toggleSelectAll" class="cursor-pointer rounded" />
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer select-none" @click="toggleSort('orderNumber')">
                <span class="flex items-center gap-1">Siparis No <ArrowUpDown :size="12" class="text-slate-300" /></span>
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer select-none" @click="toggleSort('customer')">
                <span class="flex items-center gap-1">Musteri <ArrowUpDown :size="12" class="text-slate-300" /></span>
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-500">Ilce</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500">Durum</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500">Kurye</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500">Rota</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer select-none" @click="toggleSort('totalPrice')">
                <span class="flex items-center gap-1">Tutar <ArrowUpDown :size="12" class="text-slate-300" /></span>
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer select-none" @click="toggleSort('createdAt')">
                <span class="flex items-center gap-1">Tarih <ArrowUpDown :size="12" class="text-slate-300" /></span>
              </th>
              <th class="text-center px-4 py-3 font-medium text-slate-500 w-12"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in paginatedOrders" :key="order._id"
              :class="[
                'border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-l-[3px]',
                priorityBorderColors[order.priority] || 'border-l-transparent'
              ]"
            >
              <td class="px-4 py-3">
                <input type="checkbox" :checked="selectedOrders.includes(order._id)" @change="toggleSelect(order._id)" class="cursor-pointer rounded" />
              </td>
              <td class="px-4 py-3 font-medium text-primary cursor-pointer hover:underline" @click="router.push(`/orders/${order._id}`)">
                {{ order.orderNumber }}
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-slate-700 dark:text-slate-200">{{ order.customer?.name }}</p>
                <p class="text-xs text-slate-400">{{ order.customer?.phone }}</p>
              </td>
              <td class="px-4 py-3 text-slate-500" :title="order.customer?.address">
                {{ getDistrict(order.customer?.address) }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium inline-block"
                  :style="{ backgroundColor: getStatus(order.status).bg, color: getStatus(order.status).color }"
                >
                  {{ getStatus(order.status).label }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span v-if="order.courier" class="text-slate-600 dark:text-slate-400">{{ order.courier }}</span>
                <span v-else class="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full text-[10px] font-medium">Atanmadi</span>
              </td>
              <td class="px-4 py-3">
                <div v-if="order.routeId" class="flex items-center gap-1.5">
                  <div class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span class="text-xs font-mono text-blue-600 dark:text-blue-400">
                    {{ order.routeId.slice(-6).toUpperCase() }}
                  </span>
                </div>
                <span v-else class="text-xs text-slate-300 dark:text-slate-600">—</span>
              </td>
              <td class="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{{ formatCurrency(order.totalPrice) }}</td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(order.createdAt) }}</td>
              <td class="px-4 py-3 text-center relative">
                <button @click.stop="openActionMenu = openActionMenu === order._id ? null : order._id" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
                  <MoreHorizontal :size="16" class="text-slate-400" />
                </button>
                <!-- Dropdown menu -->
                <Transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                  <div v-if="openActionMenu === order._id" class="absolute right-4 top-10 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1">
                    <button @click="router.push(`/orders/${order._id}`); openActionMenu = null" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <Eye :size="14" /> Detay
                    </button>
                    <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <UserPlus :size="14" /> Kurye Ata
                    </button>
                    <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <MapPin :size="14" /> Rotaya Ekle
                    </button>
                    <div v-if="['pending', 'confirmed', 'ready_for_pickup'].includes(order.status)">
                      <button @click="handleDispatchSingle(order._id)" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer">
                        <Zap :size="14" /> Dispatch Et
                      </button>
                    </div>
                    <hr class="my-1 border-slate-100 dark:border-slate-700" />
                    <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                      <XCircle :size="14" /> Iptal Et
                    </button>
                  </div>
                </Transition>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="paginatedOrders.length === 0" class="flex flex-col items-center justify-center py-16 px-4">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Package :size="28" class="text-slate-300 dark:text-slate-600" />
        </div>
        <h3 class="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">Siparis bulunamadi</h3>
        <p class="text-sm text-slate-400 mb-4 text-center max-w-xs">Arama kriterlerine uygun siparis yok. Filtreleri degistirmeyi deneyin.</p>
        <button @click="search = ''; statusTab = 'all'; projectFilter = 'all'; branchFilter = 'all'" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          Filtreleri Temizle
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="paginatedOrders.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
        <span class="text-sm text-slate-500">
          {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, filtered.length) }} / {{ filtered.length }}
        </span>
        <div class="flex items-center gap-1">
          <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer">
            <ChevronLeft :size="16" />
          </button>
          <template v-for="i in Math.min(5, totalPages)" :key="i">
            <button
              v-if="getPageNumber(i) <= totalPages"
              @click="currentPage = getPageNumber(i)"
              :class="[
                'w-8 h-8 rounded text-sm cursor-pointer',
                getPageNumber(i) === currentPage ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              ]"
            >
              {{ getPageNumber(i) }}
            </button>
          </template>
          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
