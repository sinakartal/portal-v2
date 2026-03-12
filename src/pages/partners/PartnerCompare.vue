<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-sm text-slate-500">Veriler yukleniyor...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center py-20">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
        <p class="text-red-600 font-medium mb-1">Hata</p>
        <p class="text-sm text-red-500">{{ error }}</p>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <button
        @click="router.push('/partners')"
        class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <ArrowLeft :size="18" class="text-slate-600" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Partner Karsilastirma</h1>
        <p class="text-sm text-slate-500 mt-0.5">Tum partnerlerin performans karsilastirmasi</p>
      </div>
    </div>

    <!-- Performance Comparison Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
        <BarChart3 :size="18" class="text-slate-500" />
        <h3 class="font-semibold text-slate-800">Performans Karsilastirmasi</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left px-4 py-3 font-medium text-slate-600 w-36">Metrik</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">
                <span class="inline-flex items-center gap-1">Bringo <span class="text-xs text-slate-400">(Kendi)</span></span>
              </th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Trendyol Go</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Paket Taxi</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Getir Kurye</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 w-32">En Iyi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in performanceData"
              :key="row.metric"
              :class="['border-b border-slate-100', idx % 2 === 1 ? 'bg-slate-50/50' : '']"
            >
              <td class="px-4 py-3 font-medium text-slate-700">{{ row.metric }}</td>
              <td
                v-for="key in ['bringo', 'trendyol', 'paketTaxi', 'getir']"
                :key="key"
                :class="['px-4 py-3 text-center', getCellStyle(row, key)]"
              >
                <span class="inline-flex items-center gap-1">
                  {{ formatCellValue(row, key) }}
                  <Trophy v-if="key === row.bestKey" :size="14" class="text-green-600" />
                </span>
              </td>
              <td class="px-4 py-3 text-center text-slate-500 text-xs font-medium">
                <span
                  v-if="row.best"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold"
                >
                  {{ row.best }}
                </span>
                <span v-else class="text-slate-300">&mdash;</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Region-Based Comparison Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
        <MapPin :size="18" class="text-slate-500" />
        <h3 class="font-semibold text-slate-800">Bolge Bazli Karsilastirma</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left px-4 py-3 font-medium text-slate-600">Bolge</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">En Iyi Partner</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Teslim %</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Neden</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in regionData"
              :key="row.region"
              :class="['border-b border-slate-100', idx % 2 === 1 ? 'bg-slate-50/50' : '']"
            >
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-2 font-medium text-slate-700">
                  <MapPin :size="14" class="text-slate-400" />
                  {{ row.region }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  <Trophy :size="12" />
                  {{ row.bestPartner }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="[
                  'px-2 py-0.5 rounded-full text-xs font-bold',
                  row.deliveryRate >= 96
                    ? 'text-green-600 bg-green-50'
                    : row.deliveryRate >= 93
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-amber-600 bg-amber-50'
                ]">
                  %{{ row.deliveryRate }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500 text-xs">{{ row.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- AI Recommendations -->
    <div class="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-5">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
          <Lightbulb :size="18" class="text-blue-600" />
        </div>
        <div>
          <h3 class="font-semibold text-slate-800">AI Onerileri</h3>
          <p class="text-xs text-slate-500">Yapay zeka tabanli optimizasyon onerileri</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="(rec, idx) in recommendations"
          :key="idx"
          class="flex items-start gap-3 bg-white rounded-lg border border-blue-100 p-4"
        >
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <component :is="rec.icon" :size="16" :class="rec.color" />
          </div>
          <p class="text-sm text-slate-700 leading-relaxed">{{ rec.text }}</p>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPartners, getTransferCompare } from '@/services/api'
import {
  ArrowLeft,
  Trophy,
  Lightbulb,
  TrendingUp,
  MapPin,
  BarChart3,
  Zap
} from 'lucide-vue-next'

const router = useRouter()

const loading = ref(true)
const error = ref('')

// ---- Default Data (fallback) ----

const performanceData = ref([
  {
    metric: 'Siparis',
    bringo: '12,450',
    trendyol: '4,521',
    paketTaxi: '3,842',
    getir: '1,245',
    best: null,
    bestKey: null,
    worstKey: null,
    type: 'info',
  },
  {
    metric: 'Teslim %',
    bringo: 94.2,
    trendyol: 96.2,
    paketTaxi: 93.8,
    getir: 91.4,
    best: 'Trendyol Go',
    bestKey: 'trendyol',
    worstKey: 'getir',
    type: 'higher',
  },
  {
    metric: 'Ort. Sure',
    bringo: '42dk',
    trendyol: '35dk',
    paketTaxi: '42dk',
    getir: '48dk',
    best: 'Trendyol Go',
    bestKey: 'trendyol',
    worstKey: 'getir',
    type: 'lower',
  },
  {
    metric: 'SLA Uyum %',
    bringo: 96.5,
    trendyol: 98.5,
    paketTaxi: 95.2,
    getir: 88.7,
    best: 'Trendyol Go',
    bestKey: 'trendyol',
    worstKey: 'getir',
    type: 'higher',
  },
  {
    metric: 'Birim Maliyet',
    bringo: 28,
    trendyol: 32,
    paketTaxi: 38,
    getir: 45,
    best: 'Bringo',
    bestKey: 'bringo',
    worstKey: 'getir',
    type: 'cost',
  },
  {
    metric: 'Iptal %',
    bringo: 2.8,
    trendyol: 2.1,
    paketTaxi: 3.2,
    getir: 4.5,
    best: 'Trendyol Go',
    bestKey: 'trendyol',
    worstKey: 'getir',
    type: 'lower',
  },
])

const regionData = ref([
  { region: 'Kadikoy', bestPartner: 'Trendyol Go', deliveryRate: 98.2, reason: 'Yogun kurye agi ve kisa mesafe optimizasyonu' },
  { region: 'Besiktas', bestPartner: 'Trendyol Go', deliveryRate: 97.5, reason: 'Yuksek musteri yogunlugu ve deneyimli kuryeler' },
  { region: 'Sisli', bestPartner: 'Paket Taxi', deliveryRate: 95.8, reason: 'Trafik bilgisi ve alternatif rota kullanimi' },
  { region: 'Uskudar', bestPartner: 'Bringo', deliveryRate: 96.2, reason: 'Yerel depo yakinligi ve hizli dagitim' },
  { region: 'Esenyurt', bestPartner: 'Getir Kurye', deliveryRate: 89.2, reason: 'Genis kapsama alani ancak dusuk performans' },
])

// ---- Fetch API Data ----

onMounted(async () => {
  try {
    loading.value = true
    const [partnersRes, compareRes] = await Promise.all([
      getPartners(),
      getTransferCompare(),
    ])
    loading.value = false

    if (partnersRes.ok && partnersRes.data) {
      const partners = Array.isArray(partnersRes.data) ? partnersRes.data : partnersRes.data.partners || []
      if (partners.length > 0) {
        // If API returns structured performance data, use it
        if (partnersRes.data.performanceData) {
          performanceData.value = partnersRes.data.performanceData
        }
      }
    }

    if (compareRes.ok && compareRes.data) {
      // If API returns region comparison data, use it
      if (Array.isArray(compareRes.data)) {
        regionData.value = compareRes.data
      } else if (compareRes.data.regions) {
        regionData.value = compareRes.data.regions
      }
    }
  } catch (e) {
    loading.value = false
    error.value = 'Veri yuklenirken bir hata olustu: ' + (e.message || 'Bilinmeyen hata')
  }
})

const recommendations = [
  {
    text: "Kadikoy'de Trendyol Go'ya %20 daha fazla aktar",
    icon: TrendingUp,
    color: 'text-green-600',
  },
  {
    text: 'Getir Kurye Esenyurt disinda kullanilmamali',
    icon: Zap,
    color: 'text-red-500',
  },
  {
    text: 'Peak saatlerde (12-14) Paket Taxi tercih edilmeli',
    icon: BarChart3,
    color: 'text-amber-600',
  },
  {
    text: '15,000 TL/ay tasarruf potansiyeli tespit edildi',
    icon: Trophy,
    color: 'text-emerald-600',
  },
]

// ---- Helper Functions ----

function formatCellValue(row, key) {
  if (row.type === 'info') return row[key]
  if (row.type === 'cost') return `\u20BA${row[key]}`
  if (row.type === 'lower') return row[key]
  return row[key]
}

function getCellStyle(row, key) {
  if (!row.bestKey) return ''
  if (key === row.bestKey) return 'bg-green-50 text-green-700 font-semibold'
  if (key === row.worstKey) return 'bg-red-50 text-red-500'
  return ''
}
</script>
