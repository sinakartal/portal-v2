<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">
          3PL Partner Yonetimi
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Partner entegrasyonlari ve performans takibi
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="showAddModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus :size="16" /> Partner Ekle
        </button>
        <button
          @click="router.push('/partners/rules')"
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Settings :size="16" /> Kurallar
        </button>
        <button
          @click="router.push('/partners/compare')"
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <BarChart3 :size="16" /> Karsilastir
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        v-for="card in SUMMARY"
        :key="card.title"
        class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-slate-500 dark:text-slate-400">
            {{ card.title }}
          </span>
          <div
            :class="`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`"
          >
            <component :is="card.icon" :size="18" :class="card.color" />
          </div>
        </div>
        <p class="text-2xl font-bold text-slate-800 dark:text-white">
          {{ card.value }}
        </p>
        <p
          :class="`text-xs mt-1 ${card.subColor || 'text-slate-400 dark:text-slate-500'}`"
        >
          {{ card.sub }}
        </p>
      </div>
    </div>

    <!-- Active Partners -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
          Aktif Partnerler
        </h2>
        <span class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Activity :size="12" /> Canli
        </span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          v-for="partner in PARTNERS"
          :key="partner.id"
          :class="[
            'bg-white dark:bg-slate-800 rounded-xl border shadow-sm',
            partnerPaused[partner.id]
              ? 'border-slate-300 dark:border-slate-600 opacity-60'
              : 'border-slate-200 dark:border-slate-700'
          ]"
        >
          <!-- Card Header -->
          <div class="p-5 pb-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <Truck :size="20" class="text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h3 class="font-semibold text-slate-800 dark:text-white">
                    {{ partner.name }}
                  </h3>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span
                      :class="[
                        'w-2 h-2 rounded-full',
                        STATUS_STYLES[partner.status].dot,
                        !partnerPaused[partner.id] ? 'animate-pulse' : ''
                      ]"
                    />
                    <span
                      :class="`text-xs font-medium px-1.5 py-0.5 rounded border ${STATUS_STYLES[partner.status].badge}`"
                    >
                      {{ partnerPaused[partner.id] ? 'Durduruldu' : partner.statusLabel }}
                    </span>
                  </div>
                </div>
              </div>
              <div
                v-if="partner.warning && !partnerPaused[partner.id]"
                class="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg"
              >
                <AlertTriangle :size="12" />
                {{ partner.warning }}
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Siparis
                </p>
                <p class="text-lg font-bold text-slate-800 dark:text-white">
                  {{ partner.orders }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Teslim Orani
                </p>
                <p class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  %{{ partner.deliveryRate }}
                  <TrendingUp v-if="partner.deliveryRate >= 95" :size="14" class="text-green-500" />
                  <TrendingDown v-else :size="14" class="text-amber-500" />
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Ort. Sure
                </p>
                <p class="text-lg font-bold text-slate-800 dark:text-white">
                  {{ partner.avgTime }} dk
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Maliyet
                </p>
                <p class="text-lg font-bold text-slate-800 dark:text-white">
                  &#8378;{{ partner.costPerOrder }}/sip
                </p>
              </div>
            </div>

            <!-- SLA Bar -->
            <div class="mt-4">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Shield :size="12" /> SLA Uyumu
                </span>
                <span :class="`text-xs font-bold ${getSlaColor(partner.sla)}`">
                  %{{ partner.sla }}
                </span>
              </div>
              <div class="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :style="{
                    width: `${partner.sla}%`,
                    backgroundColor:
                      partner.sla >= 95
                        ? '#22c55e'
                        : partner.sla >= 90
                          ? '#eab308'
                          : '#ef4444',
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="flex items-center border-t border-slate-100 dark:border-slate-700">
            <button
              @click="router.push(`/partners/${partner.id}`)"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Eye :size="14" /> Detay
            </button>
            <div class="w-px h-8 bg-slate-100 dark:bg-slate-700" />
            <button
              @click="router.push(`/partners/${partner.id}`)"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Settings :size="14" /> Ayarlar
            </button>
            <div class="w-px h-8 bg-slate-100 dark:bg-slate-700" />
            <button
              @click="togglePause(partner.id)"
              :class="[
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors cursor-pointer',
                partnerPaused[partner.id]
                  ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              ]"
            >
              <template v-if="partnerPaused[partner.id]">
                <Play :size="14" /> Devam
              </template>
              <template v-else>
                <Pause :size="14" /> Durdur
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Activity Feed -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex items-center justify-between p-5 pb-3">
        <h2 class="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Activity :size="18" class="text-primary" />
          Canli Aktivite
        </h2>
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Canli
        </div>
      </div>
      <div class="px-5 pb-5">
        <div class="space-y-3 max-h-[320px] overflow-y-auto">
          <div
            v-for="item in ACTIVITY_FEED"
            :key="item.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span
              :class="`w-2.5 h-2.5 rounded-full flex-shrink-0 ${FEED_DOT[item.status]}`"
            />
            <span class="text-xs text-slate-400 dark:text-slate-500 font-mono w-12 flex-shrink-0">
              {{ item.time }}
            </span>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200 w-28 flex-shrink-0">
              {{ item.partner }}
            </span>
            <span class="text-sm text-slate-600 dark:text-slate-300 flex-1">
              {{ item.event }}
            </span>
            <ChevronRight :size="14" class="text-slate-300 dark:text-slate-600 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>

    <!-- Add Partner Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="showAddModal = false"
      />
      <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg mx-4">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package :size="20" class="text-primary" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-800 dark:text-white">
                Yeni Partner Ekle
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                3PL partner entegrasyon bilgilerini girin
              </p>
            </div>
          </div>
          <button
            @click="showAddModal = false"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X :size="18" class="text-slate-400" />
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleAddPartner" class="p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Partner Adi
            </label>
            <input
              type="text"
              v-model="formData.name"
              placeholder="ornegin: Yurticikargo Express"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Partner Kodu
            </label>
            <input
              type="text"
              v-model="formData.code"
              placeholder="ornegin: YURTICI-EXP"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              API URL
            </label>
            <input
              type="url"
              v-model="formData.apiUrl"
              placeholder="https://api.partner.com/v1"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-xs"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              API Key
            </label>
            <input
              type="password"
              v-model="formData.apiKey"
              placeholder="API anahtarinizi girin"
              class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Iptal
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <Plus :size="16" /> Partner Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Settings, BarChart3, TrendingUp, TrendingDown, Clock, DollarSign,
  Truck, Eye, Pause, Play, AlertTriangle, CheckCircle, ArrowRightLeft,
  X, Package, Activity, ChevronRight, Shield
} from 'lucide-vue-next'

const router = useRouter()

// ---- Mock Data ----

const SUMMARY = [
  {
    title: 'Aktarilan',
    value: '342',
    sub: '3 partner',
    icon: ArrowRightLeft,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Teslim Orani',
    value: '%94.8',
    sub: '+2.1%',
    subColor: 'text-green-600',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Ort. Sure',
    value: '38 dk',
    sub: '-5 dk',
    subColor: 'text-green-600',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    title: 'Maliyet',
    value: '\u20BA12,450',
    sub: '\u20BA36.4/sip',
    icon: DollarSign,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
]

const PARTNERS = [
  {
    id: 'trendyol-go',
    name: 'Trendyol Go',
    status: 'active',
    statusLabel: 'Aktif',
    orders: 156,
    deliveryRate: 96.2,
    avgTime: 35,
    costPerOrder: 32,
    sla: 98.5,
    warning: null,
  },
  {
    id: 'paket-taxi',
    name: 'Paket Taxi',
    status: 'active',
    statusLabel: 'Aktif',
    orders: 128,
    deliveryRate: 93.8,
    avgTime: 42,
    costPerOrder: 38,
    sla: 95.2,
    warning: null,
  },
  {
    id: 'getir-kurye',
    name: 'Getir Kurye',
    status: 'limited',
    statusLabel: 'Kisitli',
    orders: 58,
    deliveryRate: 91.4,
    avgTime: 48,
    costPerOrder: 45,
    sla: 88.7,
    warning: 'SLA dusuk',
  },
]

const ACTIVITY_FEED = [
  { id: 1, time: '14:32', partner: 'Trendyol Go', event: '12 siparis aktarildi', status: 'success' },
  { id: 2, time: '14:28', partner: 'Paket Taxi', event: 'Siparis BRN-3847 teslim edildi', status: 'success' },
  { id: 3, time: '14:25', partner: 'Getir Kurye', event: 'SLA uyarisi - ortalama sure 48dk', status: 'warning' },
  { id: 4, time: '14:20', partner: 'Trendyol Go', event: 'Siparis BRN-3842 teslim edildi', status: 'success' },
  { id: 5, time: '14:15', partner: 'Paket Taxi', event: '8 siparis aktarildi', status: 'success' },
  { id: 6, time: '14:10', partner: 'Getir Kurye', event: 'Siparis BRN-3839 gecikmeli', status: 'error' },
  { id: 7, time: '14:05', partner: 'Trendyol Go', event: 'Siparis BRN-3835 teslim edildi', status: 'success' },
  { id: 8, time: '13:58', partner: 'Paket Taxi', event: 'Siparis BRN-3831 teslim edildi', status: 'success' },
]

const STATUS_STYLES = {
  active: {
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
  limited: {
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  error: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
}

const FEED_DOT = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

// ---- State ----

const showAddModal = ref(false)
const partnerPaused = ref({})
const formData = reactive({
  name: '',
  code: '',
  apiUrl: '',
  apiKey: '',
})

// ---- Methods ----

const togglePause = (id) => {
  partnerPaused.value = { ...partnerPaused.value, [id]: !partnerPaused.value[id] }
}

const getSlaColor = (sla) => {
  if (sla >= 95) return 'text-green-600'
  if (sla >= 90) return 'text-yellow-600'
  return 'text-red-600'
}

const handleAddPartner = () => {
  showAddModal.value = false
  formData.name = ''
  formData.code = ''
  formData.apiUrl = ''
  formData.apiKey = ''
}
</script>
