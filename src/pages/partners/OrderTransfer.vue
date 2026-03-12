<template>
  <div class="pb-28">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <button
        @click="router.push('/partners')"
        class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
      >
        <ArrowLeft :size="20" class="text-slate-600 dark:text-slate-300" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Siparis Aktarim</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Bekleyen siparisleri harici partnerlere aktar
        </p>
      </div>
    </div>

    <!-- Filter / Search Bar -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4 shadow-sm">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[220px]">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            :value="search"
            @input="onSearchInput"
            placeholder="Siparis no veya ilce ara..."
            class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          :value="typeFilter"
          @change="onTypeFilterChange"
          class="px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="">Tum Tipler</option>
          <option value="Express">Express</option>
          <option value="Standart">Standart</option>
        </select>
        <button class="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
          <Filter :size="14" /> Filtreler
        </button>
      </div>
    </div>

    <!-- Pending Transfer Orders -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
      <!-- Table header info -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <Package :size="18" class="text-primary" />
          <h2 class="text-base font-semibold text-slate-800 dark:text-white">
            Aktarim Bekleyen Siparisler
          </h2>
          <span class="px-2.5 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
            {{ filteredOrders.length }} siparis
          </span>
        </div>
        <span v-if="selectedCount > 0" class="text-sm font-medium text-primary">
          Secili: {{ selectedCount }} siparis
        </span>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th class="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectAll"
                  @change="handleSelectAll"
                  class="cursor-pointer accent-primary"
                  title="Tumunu Sec"
                />
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                Siparis No
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                Ilce
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                Tutar
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                Tip
              </th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                Bekleme
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in paginatedOrders"
              :key="order.id"
              @click="toggleOrder(order.id)"
              :class="[
                'border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors cursor-pointer',
                selectedOrders.includes(order.id) ? 'bg-primary/5 dark:bg-primary/10' : ''
              ]"
            >
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedOrders.includes(order.id)"
                  @change="toggleOrder(order.id)"
                  @click.stop
                  class="cursor-pointer accent-primary"
                />
              </td>
              <td class="px-4 py-3 font-medium text-slate-800 dark:text-white">
                #{{ order.id }}
              </td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">
                {{ order.district }}
              </td>
              <td class="px-4 py-3 font-medium text-slate-800 dark:text-white">
                {{ order.amount.toLocaleString('tr-TR') }} TL
              </td>
              <td class="px-4 py-3">
                <span :class="[
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                  order.type === 'Express'
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                ]">
                  <AlertTriangle v-if="order.type === 'Express'" :size="12" />
                  {{ order.type }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <Clock :size="14" :class="
                    order.waitMinutes >= 20 ? 'text-red-500' : order.waitMinutes >= 10 ? 'text-yellow-500' : 'text-slate-400'
                  " />
                  <span :class="[
                    'text-sm',
                    order.waitMinutes >= 20 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-600 dark:text-slate-300'
                  ]">
                    {{ order.waitMinutes }} dk
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
        <span class="text-sm text-slate-500 dark:text-slate-400">
          {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, filteredOrders.length) }} / {{ filteredOrders.length }}
        </span>
        <div class="flex items-center gap-1">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft :size="16" class="text-slate-600 dark:text-slate-300" />
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'w-8 h-8 rounded text-sm cursor-pointer',
              page === currentPage
                ? 'bg-primary text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight :size="16" class="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </div>

    <!-- Partner Selection (shown when orders are selected) -->
    <div v-if="selectedCount > 0" class="mb-6">
      <h2 class="text-base font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
        <Send :size="18" class="text-primary" />
        Partner Sec
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          v-for="partner in partnerList"
          :key="partner.id"
          @click="selectedPartner = partner.id"
          :class="[
            'relative text-left p-5 rounded-xl transition-all cursor-pointer',
            selectedPartner === partner.id
              ? 'border-2 border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
              : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
          ]"
        >
          <div v-if="selectedPartner === partner.id" class="absolute top-3 right-3">
            <CheckCircle :size="20" class="text-primary" />
          </div>

          <h3 class="text-base font-bold text-slate-800 dark:text-white mb-3">
            {{ partner.name }}
          </h3>

          <div class="flex items-center gap-2 mb-3">
            <span :class="['w-2.5 h-2.5 rounded-full', partner.statusDot]" />
            <span :class="['text-sm font-medium', partner.statusColor]">
              {{ partner.statusLabel }}
            </span>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock :size="14" /> ETA
              </span>
              <span class="font-semibold text-slate-700 dark:text-slate-200">
                {{ partner.eta }} dk
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Package :size="14" /> Maliyet
              </span>
              <span class="font-semibold text-slate-700 dark:text-slate-200">
                {{ partner.cost.toLocaleString('tr-TR') }} TL
              </span>
            </div>
          </div>

          <!-- Per-order cost hint -->
          <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p class="text-xs text-slate-400 dark:text-slate-500">
              Toplam: {{ (partner.cost * selectedCount).toLocaleString('tr-TR') }} TL ({{ selectedCount }} siparis)
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- Transfer Summary Bar (fixed bottom) -->
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <!-- Selected order count -->
          <div class="flex items-center gap-2">
            <Package :size="18" class="text-primary" />
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Secili Siparis</p>
              <p class="text-sm font-bold text-slate-800 dark:text-white">{{ selectedCount }} siparis</p>
            </div>
          </div>

          <div class="w-px h-10 bg-slate-200 dark:bg-slate-600" />

          <!-- Estimated total cost -->
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Tahmini Toplam Maliyet</p>
            <p class="text-sm font-bold text-slate-800 dark:text-white">
              {{ selectedPartner
                ? `${estimatedTotalCost.toLocaleString('tr-TR')} TL`
                : 'Partner secin' }}
            </p>
          </div>

          <div class="w-px h-10 bg-slate-200 dark:bg-slate-600" />

          <!-- Estimated savings -->
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Tahmini Tasarruf (vs Bringo)</p>
            <p :class="[
              'text-sm font-bold',
              selectedPartner && estimatedSavings > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-slate-800 dark:text-white'
            ]">
              {{ selectedPartner
                ? `${estimatedSavings > 0 ? '+' : ''}${estimatedSavings.toLocaleString('tr-TR')} TL`
                : '-' }}
            </p>
          </div>
        </div>

        <button
          @click="handleTransfer"
          :disabled="!selectedPartner"
          :class="[
            'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer',
            selectedPartner
              ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          ]"
        >
          <Send :size="16" />
          Secilenleri Aktar
        </button>
      </div>
    </div>

    <!-- Transfer Success Modal -->
    <div
      v-if="showSuccessModal && selectedPartnerData"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center relative">
        <!-- Close button -->
        <button
          @click="handleCloseModal"
          class="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
        >
          <X :size="18" class="text-slate-400" />
        </button>

        <!-- Success icon -->
        <div class="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle :size="32" class="text-green-500" />
        </div>

        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Aktarim Basarili!
        </h3>
        <p class="text-slate-500 dark:text-slate-400 mb-6">
          Siparisler basariyla aktarildi.
        </p>

        <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3 mb-6 text-left">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">Aktarilan Siparis</span>
            <span class="font-semibold text-slate-800 dark:text-white">{{ selectedCount }} siparis</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">Partner</span>
            <span class="font-semibold text-slate-800 dark:text-white">{{ selectedPartnerData.name }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">Tahmini Teslimat</span>
            <span class="font-semibold text-slate-800 dark:text-white">{{ selectedPartnerData.eta }} dakika</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">Toplam Maliyet</span>
            <span class="font-semibold text-slate-800 dark:text-white">
              {{ estimatedTotalCost.toLocaleString('tr-TR') }} TL
            </span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="handleCloseModal"
            class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
          >
            Kapat
          </button>
          <button
            @click="handleCloseModal(); router.push('/partners')"
            class="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark cursor-pointer"
          >
            Partnerlere Don
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Send, Package, Clock, AlertTriangle, CheckCircle,
  Search, Filter, ChevronLeft, ChevronRight, X
} from 'lucide-vue-next'
import { getOrders, getPartners, transferOrders } from '@/services/api'

const router = useRouter()

// ---- Mock Data ----

// Fallback mock data (used as default until API responds)
const MOCK_ORDERS = [
  { id: 'BRN-4530', district: 'Kadikoy', amount: 285, type: 'Express', waitMinutes: 15 },
  { id: 'BRN-4531', district: 'Besiktas', amount: 192, type: 'Standart', waitMinutes: 8 },
  { id: 'BRN-4532', district: 'Uskudar', amount: 410, type: 'Express', waitMinutes: 22 },
  { id: 'BRN-4533', district: 'Sisli', amount: 167, type: 'Standart', waitMinutes: 5 },
  { id: 'BRN-4534', district: 'Atasehir', amount: 324, type: 'Express', waitMinutes: 18 },
  { id: 'BRN-4535', district: 'Maltepe', amount: 145, type: 'Standart', waitMinutes: 12 },
  { id: 'BRN-4536', district: 'Kadikoy', amount: 520, type: 'Express', waitMinutes: 25 },
  { id: 'BRN-4537', district: 'Bakirkoy', amount: 230, type: 'Standart', waitMinutes: 3 },
  { id: 'BRN-4538', district: 'Beyoglu', amount: 378, type: 'Express', waitMinutes: 30 },
  { id: 'BRN-4539', district: 'Sariyer', amount: 198, type: 'Standart', waitMinutes: 7 },
  { id: 'BRN-4540', district: 'Fatih', amount: 265, type: 'Express', waitMinutes: 14 },
  { id: 'BRN-4541', district: 'Kartal', amount: 155, type: 'Standart', waitMinutes: 9 },
  { id: 'BRN-4542', district: 'Pendik', amount: 440, type: 'Express', waitMinutes: 20 },
  { id: 'BRN-4543', district: 'Umraniye', amount: 310, type: 'Standart', waitMinutes: 6 },
  { id: 'BRN-4544', district: 'Kadikoy', amount: 175, type: 'Express', waitMinutes: 28 },
  { id: 'BRN-4545', district: 'Beykoz', amount: 290, type: 'Standart', waitMinutes: 4 },
  { id: 'BRN-4546', district: 'Eyupsultan', amount: 365, type: 'Express', waitMinutes: 16 },
  { id: 'BRN-4547', district: 'Gaziosmanpasa', amount: 128, type: 'Standart', waitMinutes: 11 },
  { id: 'BRN-4548', district: 'Sultangazi', amount: 480, type: 'Express', waitMinutes: 19 },
  { id: 'BRN-4549', district: 'Beylikduzu', amount: 210, type: 'Standart', waitMinutes: 2 },
  { id: 'BRN-4550', district: 'Cekmekoy', amount: 335, type: 'Express', waitMinutes: 27 },
  { id: 'BRN-4551', district: 'Tuzla', amount: 190, type: 'Standart', waitMinutes: 10 },
  { id: 'BRN-4552', district: 'Esenyurt', amount: 425, type: 'Express', waitMinutes: 23 },
]

const MOCK_PARTNERS = [
  { id: 'trendyol', name: 'TRENDYOL GO', status: 'available', statusLabel: 'Musait', statusColor: 'text-green-500', statusDot: 'bg-green-500', eta: 25, cost: 96 },
  { id: 'paket', name: 'PAKET TAXI', status: 'available', statusLabel: 'Musait', statusColor: 'text-green-500', statusDot: 'bg-green-500', eta: 35, cost: 114 },
  { id: 'getir', name: 'GETIR KURYE', status: 'busy', statusLabel: 'Yogun', statusColor: 'text-yellow-500', statusDot: 'bg-yellow-500', eta: 50, cost: 135 },
]

// Reactive refs initialized with mock data as fallback
const allOrders = ref([...MOCK_ORDERS])
const partnerList = ref([...MOCK_PARTNERS])

const BRINGO_AVG_COST = 148

// ---- State ----

const selectedOrders = ref([])
const selectedPartner = ref(null)
const showSuccessModal = ref(false)
const selectAll = ref(false)
const search = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const perPage = 10

// ---- Computed (replaces useMemo) ----

const filteredOrders = computed(() => {
  let result = [...allOrders.value]
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(o =>
      o.id.toLowerCase().includes(s) ||
      o.district.toLowerCase().includes(s)
    )
  }
  if (typeFilter.value) {
    result = result.filter(o => o.type === typeFilter.value)
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / perPage))

const paginatedOrders = computed(() =>
  filteredOrders.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage)
)

const selectedCount = computed(() => selectedOrders.value.length)

const selectedPartnerData = computed(() =>
  partnerList.value.find(p => p.id === selectedPartner.value)
)

const estimatedTotalCost = computed(() =>
  selectedPartnerData.value ? selectedCount.value * selectedPartnerData.value.cost : 0
)

const estimatedSavings = computed(() =>
  selectedCount.value * BRINGO_AVG_COST - estimatedTotalCost.value
)

// ---- Methods ----

const onSearchInput = (e) => {
  search.value = e.target.value
  currentPage.value = 1
}

const onTypeFilterChange = (e) => {
  typeFilter.value = e.target.value
  currentPage.value = 1
}

const toggleOrder = (id) => {
  if (selectedOrders.value.includes(id)) {
    selectedOrders.value = selectedOrders.value.filter(x => x !== id)
  } else {
    selectedOrders.value = [...selectedOrders.value, id]
  }
  selectAll.value = selectedOrders.value.length === filteredOrders.value.length
}

const handleSelectAll = () => {
  if (selectAll.value) {
    selectedOrders.value = []
    selectAll.value = false
  } else {
    selectedOrders.value = filteredOrders.value.map(o => o.id)
    selectAll.value = true
  }
}

const handleTransfer = async () => {
  if (selectedCount.value > 0 && selectedPartner.value) {
    const res = await transferOrders({
      orderIds: selectedOrders.value,
      partnerId: selectedPartner.value,
    })
    showSuccessModal.value = true
  }
}

const handleCloseModal = () => {
  showSuccessModal.value = false
  selectedOrders.value = []
  selectedPartner.value = null
  selectAll.value = false
}

// ---- Load data from API ----

onMounted(async () => {
  const [ordersRes, partnersRes] = await Promise.all([
    getOrders(),
    getPartners(),
  ])
  if (ordersRes.ok && ordersRes.data) {
    const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.orders || []
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'dispatched')
    if (pending.length > 0) {
      // Map API orders to the format needed (id, district, amount, type, waitMinutes)
      allOrders.value = pending.map(o => ({
        id: o.id || o.orderId,
        district: o.zone || o.district || 'Bilinmiyor',
        amount: o.price || o.cost || 0,
        type: o.mode === 'instant' ? 'Express' : 'Standart',
        waitMinutes: o.createdAt ? Math.round((Date.now() - o.createdAt) / 60000) : 0,
      }))
    }
  }
  if (partnersRes.ok && partnersRes.data) {
    const partners = Array.isArray(partnersRes.data) ? partnersRes.data : partnersRes.data.partners || []
    if (partners.length > 0) {
      partnerList.value = partners.map(p => ({
        id: p.id,
        name: p.name,
        status: p.isActive ? 'available' : 'busy',
        statusLabel: p.isActive ? 'Musait' : 'Yogun',
        statusColor: p.isActive ? 'text-green-500' : 'text-yellow-500',
        statusDot: p.isActive ? 'bg-green-500' : 'bg-yellow-500',
        eta: p.avgEta || 35,
        cost: p.avgCost || 100,
      }))
    }
  }
})
</script>
