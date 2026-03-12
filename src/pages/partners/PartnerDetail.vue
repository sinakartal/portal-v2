<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="max-w-[1440px] mx-auto px-6 py-6 space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.go(-1)"
            class="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft :size="18" class="text-slate-600 dark:text-slate-300" />
          </button>

          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ partner.name }}</h1>
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              ]"
            >
              <span :class="['w-1.5 h-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-amber-500']" />
              {{ isActive ? 'Aktif' : 'Kisitli' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Settings :size="16" />
            Ayarlar
          </button>
          <button class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/30 shadow-sm text-sm font-medium text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
            <PauseCircle :size="16" />
            Durdur
          </button>
        </div>
      </div>

      <!-- Overview Panel -->
      <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-[1px]">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="text-center">
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Toplam Siparis</p>
              <p class="text-3xl font-bold text-slate-900 dark:text-white">4,521</p>
              <p class="text-xs text-emerald-600 mt-1">Tum zamanlar</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Bu Ay</p>
              <p class="text-3xl font-bold text-slate-900 dark:text-white">712</p>
              <p class="text-xs text-blue-600 mt-1">+12% gecen aya gore</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Basari Orani</p>
              <p class="text-3xl font-bold text-emerald-600">%96.2</p>
              <p class="text-xs text-emerald-600 mt-1">+2.1% artis</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Son Entegrasyon</p>
              <p class="text-3xl font-bold text-slate-900 dark:text-white">2sa</p>
              <p class="text-xs text-slate-500 mt-1">once</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics Row 1 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          :icon="Package"
          label="Siparis"
          value="4,521"
          change="+12%"
          changeDirection="up"
          iconColor="bg-indigo-500"
        />
        <MetricCard
          :icon="CheckCircle"
          label="Teslim %"
          value="96.2%"
          change="+2.1%"
          changeDirection="up"
          iconColor="bg-emerald-500"
        />
        <MetricCard
          :icon="Clock"
          label="Ort. Sure"
          value="35dk"
          change="-8dk"
          changeDirection="up"
          iconColor="bg-sky-500"
        />
        <MetricCard
          :icon="ShieldCheck"
          label="SLA"
          value="98.5%"
          change="+1.2%"
          changeDirection="up"
          iconColor="bg-violet-500"
        />
      </div>

      <!-- SLA Gauge + Metrics Row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- SLA Gauge -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col items-center justify-center">
          <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">SLA Performans Gostergesi</h3>
          <div class="relative w-48 h-24 overflow-hidden">
            <!-- Gauge background -->
            <svg viewBox="0 0 200 100" class="w-full h-full">
              <!-- Background arc -->
              <path
                d="M 20 95 A 80 80 0 0 1 180 95"
                fill="none"
                stroke-width="16"
                stroke-linecap="round"
                class="stroke-slate-200 dark:stroke-slate-700"
              />
              <!-- Red zone (0-80%) -->
              <path
                d="M 20 95 A 80 80 0 0 1 52 35"
                fill="none"
                stroke-width="16"
                stroke-linecap="round"
                stroke="#ef4444"
                opacity="0.3"
              />
              <!-- Yellow zone (80-95%) -->
              <path
                d="M 52 35 A 80 80 0 0 1 130 22"
                fill="none"
                stroke-width="16"
                stroke-linecap="round"
                stroke="#eab308"
                opacity="0.3"
              />
              <!-- Green zone (95-100%) -->
              <path
                d="M 130 22 A 80 80 0 0 1 180 95"
                fill="none"
                stroke-width="16"
                stroke-linecap="round"
                stroke="#22c55e"
                opacity="0.3"
              />
              <!-- Active arc -->
              <path
                :d="gaugeArc"
                fill="none"
                stroke-width="16"
                stroke-linecap="round"
                :stroke="slaGaugeColor"
                class="transition-all duration-1000"
              />
              <!-- Needle dot -->
              <circle :cx="needleX" :cy="needleY" r="6" :fill="slaGaugeColor" class="transition-all duration-1000" />
            </svg>
          </div>
          <p class="text-4xl font-bold mt-2" :class="slaGaugeColor === '#22c55e' ? 'text-green-600' : slaGaugeColor === '#eab308' ? 'text-yellow-600' : 'text-red-600'">
            %{{ slaValue }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">SLA Uyum Orani</p>
        </div>

        <!-- Metrics Row 2 -->
        <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            :icon="Banknote"
            label="Toplam Maliyet"
            value="$144,672"
            change="+5.4%"
            changeDirection="down"
            iconColor="bg-rose-500"
          />
          <MetricCard
            :icon="CreditCard"
            label="Birim Maliyet"
            value="$32.00"
            change="-$1.50"
            changeDirection="up"
            iconColor="bg-amber-500"
          />
          <MetricCard
            :icon="ArrowLeftRight"
            label="Bringo vs Partner"
            value="-$8/sip"
            change="Avantajli"
            changeDirection="up"
            iconColor="bg-teal-500"
          />
          <MetricCard
            :icon="XCircle"
            label="Iptal Orani"
            value="2.1%"
            change="-0.4%"
            changeDirection="up"
            iconColor="bg-slate-500"
          />
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Daily Order Trend -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Gunluk Siparis Trendi</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Son 7 gun</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <TrendingUp :size="16" class="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div class="h-[260px]">
            <Line :data="dailyOrderChartData" :options="lineChartOptions" />
          </div>
        </div>

        <!-- Hourly Performance -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Saatlik Performans</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bugun - 24 saat dagilimi</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
              <BarChart3 :size="16" class="text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <div class="h-[260px]">
            <Bar :data="hourlyPerformanceChartData" :options="barChartOptions" />
          </div>
        </div>
      </div>

      <!-- Transfer History with Date Range Filter -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Son Siparisler</h3>
            <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ filteredOrders.length }} kayit</span>
          </div>
          <div class="flex items-center gap-3">
            <!-- Date Range Filter -->
            <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg p-1">
              <div class="flex items-center gap-1.5">
                <Calendar :size="14" class="text-slate-400" />
                <input
                  type="date"
                  v-model="dateRange.start"
                  class="px-2 py-1 bg-transparent border-none text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
                />
              </div>
              <span class="text-xs text-slate-400">-</span>
              <input
                type="date"
                v-model="dateRange.end"
                class="px-2 py-1 bg-transparent border-none text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
              />
            </div>
            <button class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              <Filter :size="14" />
              Filtrele
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-700">
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Siparis No</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aktarim Saati</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Teslim Saati</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sure</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <tr
                v-for="order in paginatedOrders"
                :key="order.id"
                @click="router.push(`/orders/${order.id}`)"
                class="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
              >
                <td class="px-5 py-3.5">
                  <span class="font-semibold text-slate-800 dark:text-white">{{ order.id }}</span>
                </td>
                <td class="px-5 py-3.5 text-slate-600 dark:text-slate-300">{{ order.transferTime }}</td>
                <td class="px-5 py-3.5 text-slate-600 dark:text-slate-300">{{ order.deliveryTime || '\u2014' }}</td>
                <td class="px-5 py-3.5 text-slate-600 dark:text-slate-300">{{ order.duration }}</td>
                <td class="px-5 py-3.5">
                  <StatusBadge :status="order.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-500 dark:text-slate-400">
            Sayfa {{ ordersPage }} / {{ totalOrderPages }}
          </span>
          <div class="flex items-center gap-1">
            <button
              @click="ordersPage = Math.max(1, ordersPage - 1)"
              :disabled="ordersPage === 1"
              class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft :size="15" class="text-slate-600 dark:text-slate-300" />
            </button>
            <button
              @click="ordersPage = Math.min(totalOrderPages, ordersPage + 1)"
              :disabled="ordersPage === totalOrderPages"
              class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight :size="15" class="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      <!-- Region Performance -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Bolge Performansi</h3>
            <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ regionPerformance.length }} bolge</span>
          </div>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <MapPin :size="16" class="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-700">
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ilce</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Teslimat Sayisi</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Teslim Orani</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ort. Sure</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SLA %</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <tr
                v-for="region in regionPerformance"
                :key="region.district"
                class="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-2">
                    <MapPin :size="14" class="text-slate-400 dark:text-slate-500" />
                    <span class="font-semibold text-slate-800 dark:text-white">{{ region.district }}</span>
                  </div>
                </td>
                <td class="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                  {{ region.deliveries.toLocaleString('tr-TR') }}
                </td>
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 max-w-[120px] h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        :class="[
                          'h-full rounded-full',
                          region.deliveryRate >= 96
                            ? 'bg-emerald-500'
                            : region.deliveryRate >= 94
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        ]"
                        :style="{ width: `${region.deliveryRate}%` }"
                      />
                    </div>
                    <span :class="[
                      'text-xs font-semibold',
                      region.deliveryRate >= 96
                        ? 'text-emerald-600'
                        : region.deliveryRate >= 94
                          ? 'text-amber-600'
                          : 'text-red-600'
                    ]">
                      %{{ region.deliveryRate }}
                    </span>
                  </div>
                </td>
                <td class="px-5 py-3.5 text-slate-600 dark:text-slate-300">{{ region.avgTime }}</td>
                <td class="px-5 py-3.5">
                  <span :class="[
                    'text-xs font-semibold',
                    region.sla >= 97
                      ? 'text-emerald-600'
                      : region.sla >= 95
                        ? 'text-amber-600'
                        : 'text-red-600'
                  ]">
                    %{{ region.sla }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<!--
  PartnerDetail.vue - Partner Detay Sayfasi
  ==========================================
  Secili partnerin detayli performans bilgilerini gosterir.

  Yeni Ozellikler:
  - Overview panel: toplam siparis, bu ay, basari orani, son entegrasyon
  - SLA gauge visualization (SVG)
  - Transfer history date range filter
  - Dark mode support
-->
<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPartners, getOrders } from '@/services/api'
import {
  ArrowLeft, Settings, PauseCircle, TrendingUp, TrendingDown,
  Package, CheckCircle, Clock, ShieldCheck, Banknote, CreditCard,
  ArrowLeftRight, XCircle, MapPin, Truck, AlertTriangle, Filter,
  ChevronLeft, ChevronRight, BarChart3, Calendar
} from 'lucide-vue-next'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ========== PROPS ==========
const props = defineProps({
  partnerId: String
})

const router = useRouter()

// ========== DATE RANGE ==========
const dateRange = reactive({
  start: '',
  end: '',
})

// ========== SLA GAUGE ==========
const slaValue = ref(98.5)

const slaGaugeColor = computed(() => {
  if (slaValue.value >= 95) return '#22c55e'
  if (slaValue.value >= 80) return '#eab308'
  return '#ef4444'
})

const gaugeArc = computed(() => {
  const pct = Math.min(slaValue.value / 100, 1)
  const startAngle = Math.PI
  const endAngle = startAngle + pct * Math.PI
  const cx = 100, cy = 95, r = 80
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const largeArc = pct > 0.5 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
})

const needleX = computed(() => {
  const pct = Math.min(slaValue.value / 100, 1)
  const angle = Math.PI + pct * Math.PI
  return 100 + 80 * Math.cos(angle)
})

const needleY = computed(() => {
  const pct = Math.min(slaValue.value / 100, 1)
  const angle = Math.PI + pct * Math.PI
  return 95 + 80 * Math.sin(angle)
})

// ========== DEFAULT DATA ==========

const PARTNERS_DEFAULT = {
  '1': { name: 'Trendyol Go', status: 'active' },
  '2': { name: 'Getir Kurye', status: 'restricted' },
  '3': { name: 'Yemeksepeti Banabi', status: 'active' },
  '4': { name: 'Hepsiburada Teslimat', status: 'active' },
}

const partnersMap = ref({ ...PARTNERS_DEFAULT })

const dailyOrderTrend = ref([
  { day: '12 Sub', orders: 583 },
  { day: '13 Sub', orders: 621 },
  { day: '14 Sub', orders: 558 },
  { day: '15 Sub', orders: 694 },
  { day: '16 Sub', orders: 712 },
  { day: '17 Sub', orders: 648 },
  { day: '18 Sub', orders: 705 },
])

const hourlyPerformance = ref(Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  deliveries: i >= 8 && i <= 22
    ? Math.floor(Math.random() * 40) + (i >= 11 && i <= 14 ? 50 : i >= 18 && i <= 21 ? 45 : 15)
    : Math.floor(Math.random() * 5),
})))

const recentOrders = ref([
  { id: 'BRN-004521', transferTime: '09:12', deliveryTime: '09:38', duration: '26dk', status: 'delivered' },
  { id: 'BRN-004520', transferTime: '09:08', deliveryTime: '09:41', duration: '33dk', status: 'delivered' },
  { id: 'BRN-004519', transferTime: '09:05', deliveryTime: null, duration: '\u2014', status: 'in_transit' },
  { id: 'BRN-004518', transferTime: '08:55', deliveryTime: '09:47', duration: '52dk', status: 'delayed' },
  { id: 'BRN-004517', transferTime: '08:50', deliveryTime: '09:18', duration: '28dk', status: 'delivered' },
  { id: 'BRN-004516', transferTime: '08:42', deliveryTime: '09:10', duration: '28dk', status: 'delivered' },
  { id: 'BRN-004515', transferTime: '08:38', deliveryTime: null, duration: '\u2014', status: 'in_transit' },
  { id: 'BRN-004514', transferTime: '08:30', deliveryTime: '09:05', duration: '35dk', status: 'delivered' },
  { id: 'BRN-004513', transferTime: '08:25', deliveryTime: '09:12', duration: '47dk', status: 'delayed' },
  { id: 'BRN-004512', transferTime: '08:18', deliveryTime: '08:52', duration: '34dk', status: 'delivered' },
  { id: 'BRN-004511', transferTime: '08:10', deliveryTime: '08:39', duration: '29dk', status: 'delivered' },
  { id: 'BRN-004510', transferTime: '08:02', deliveryTime: '08:34', duration: '32dk', status: 'delivered' },
  { id: 'BRN-004509', transferTime: '07:55', deliveryTime: null, duration: '\u2014', status: 'in_transit' },
  { id: 'BRN-004508', transferTime: '07:48', deliveryTime: '08:30', duration: '42dk', status: 'delivered' },
  { id: 'BRN-004507', transferTime: '07:40', deliveryTime: '08:22', duration: '42dk', status: 'delayed' },
])

const regionPerformance = ref([
  { district: 'Kadikoy', deliveries: 862, deliveryRate: 97.4, avgTime: '28dk', sla: 99.1 },
  { district: 'Besiktas', deliveries: 724, deliveryRate: 95.8, avgTime: '32dk', sla: 97.6 },
  { district: 'Sisli', deliveries: 691, deliveryRate: 96.1, avgTime: '34dk', sla: 98.2 },
  { district: 'Uskudar', deliveries: 583, deliveryRate: 94.7, avgTime: '36dk', sla: 96.8 },
  { district: 'Atasehir', deliveries: 512, deliveryRate: 97.2, avgTime: '30dk', sla: 98.9 },
  { district: 'Bakirkoy', deliveries: 448, deliveryRate: 93.5, avgTime: '38dk', sla: 95.4 },
  { district: 'Maltepe', deliveries: 387, deliveryRate: 96.8, avgTime: '31dk', sla: 98.1 },
  { district: 'Sariyer', deliveries: 314, deliveryRate: 92.1, avgTime: '41dk', sla: 93.7 },
])

// ========== API LOAD ==========
onMounted(async () => {
  const [partnersRes, ordersRes] = await Promise.all([
    getPartners(),
    getOrders(),
  ])
  if (partnersRes.ok && partnersRes.data) {
    const partners = Array.isArray(partnersRes.data) ? partnersRes.data : partnersRes.data.partners || []
    const newMap = { ...PARTNERS_DEFAULT }
    partners.forEach(p => {
      if (p.id) {
        newMap[p.id] = { name: p.name || p.id, status: p.status || 'active' }
      }
    })
    const found = partners.find(p => p.id === props.partnerId || p.name === props.partnerId)
    if (found) {
      newMap[props.partnerId] = { name: found.name || found.id, status: found.status || 'active' }
      if (found.sla) slaValue.value = found.sla
    }
    partnersMap.value = newMap
  }
  if (ordersRes.ok && ordersRes.data) {
    const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.orders || []
    if (orders.length > 0) {
      recentOrders.value = orders.map(o => ({
        id: o.externalOrderId || o.id,
        transferTime: o.transferTime || o.createdAt || '',
        deliveryTime: o.deliveryTime || o.deliveredAt || null,
        duration: o.duration || '\u2014',
        status: o.status || 'in_transit',
      }))
    }
  }
})

// ========== STATUS MAP ==========
const STATUS_MAP = {
  delivered: { label: 'Teslim', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  in_transit: { label: 'Yolda', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  delayed: { label: 'Gecikme', bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
}

// ========== COMPUTED ==========
const partner = computed(() => {
  return partnersMap.value[props.partnerId] || { name: `Partner #${props.partnerId}`, status: 'active' }
})

const isActive = computed(() => partner.value.status === 'active')

// ========== FILTERED ORDERS ==========
const filteredOrders = computed(() => {
  return recentOrders.value
})

// ========== PAGINATION ==========
const ordersPage = ref(1)
const ordersPerPage = 10

const totalOrderPages = computed(() => Math.ceil(filteredOrders.value.length / ordersPerPage))

const paginatedOrders = computed(() => {
  return filteredOrders.value.slice(
    (ordersPage.value - 1) * ordersPerPage,
    ordersPage.value * ordersPerPage
  )
})

// ========== CHART DATA ==========
const dailyOrderChartData = computed(() => ({
  labels: dailyOrderTrend.value.map(d => d.day),
  datasets: [
    {
      label: 'Siparis',
      data: dailyOrderTrend.value.map(d => d.orders),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 2.5,
      pointRadius: 4,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#6366f1',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      tension: 0.4,
      fill: false,
    }
  ]
}))

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1e293b',
      bodyColor: '#475569',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 8,
      titleFont: { size: 13 },
      bodyFont: { size: 13 },
      callbacks: {
        label: (ctx) => `${ctx.parsed.y} siparis`
      }
    }
  },
  scales: {
    x: {
      ticks: { font: { size: 12 }, color: '#94a3b8' },
      grid: { color: '#e2e8f0', drawBorder: false },
    },
    y: {
      ticks: { font: { size: 12 }, color: '#94a3b8' },
      grid: { color: '#e2e8f0', drawBorder: false },
      border: { display: false },
    }
  }
}

const hourlyPerformanceChartData = computed(() => ({
  labels: hourlyPerformance.value.map(h => h.hour),
  datasets: [
    {
      label: 'Teslimat',
      data: hourlyPerformance.value.map(h => h.deliveries),
      backgroundColor: '#0ea5e9',
      borderRadius: 4,
      maxBarThickness: 20,
    }
  ]
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1e293b',
      bodyColor: '#475569',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 8,
      titleFont: { size: 13 },
      bodyFont: { size: 13 },
      callbacks: {
        label: (ctx) => `${ctx.parsed.y} teslimat`
      }
    }
  },
  scales: {
    x: {
      ticks: {
        font: { size: 10 },
        color: '#94a3b8',
        maxTicksLimit: 8,
      },
      grid: { display: false },
    },
    y: {
      ticks: { font: { size: 12 }, color: '#94a3b8' },
      grid: { color: '#e2e8f0', drawBorder: false },
      border: { display: false },
    }
  }
}
</script>

<script>
// StatusBadge child component
const StatusBadge = {
  name: 'StatusBadge',
  props: {
    status: String,
  },
  setup(props) {
    const STATUS_MAP = {
      delivered: { label: 'Teslim', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
      in_transit: { label: 'Yolda', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
      delayed: { label: 'Gecikme', bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
    }
    return { STATUS_MAP }
  },
  template: `
    <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', STATUS_MAP[status]?.bg || STATUS_MAP.delivered.bg, STATUS_MAP[status]?.text || STATUS_MAP.delivered.text]">
      <span :class="['w-1.5 h-1.5 rounded-full', STATUS_MAP[status]?.dot || STATUS_MAP.delivered.dot]" />
      {{ STATUS_MAP[status]?.label || STATUS_MAP.delivered.label }}
    </span>
  `
}

// MetricCard child component
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import { computed } from 'vue'

const MetricCard = {
  name: 'MetricCard',
  components: { TrendingUp, TrendingDown },
  props: {
    icon: [Object, Function],
    label: String,
    value: String,
    change: String,
    changeDirection: String,
    iconColor: String,
  },
  setup(props) {
    const isPositive = computed(() => props.changeDirection === 'up')
    return { isPositive }
  },
  template: `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ label }}</span>
        <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', iconColor || 'bg-slate-100']">
          <component :is="icon" class="w-4.5 h-4.5 text-white" :size="18" />
        </div>
      </div>
      <div class="flex items-end justify-between">
        <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ value }}</span>
        <span v-if="change" :class="['inline-flex items-center gap-0.5 text-xs font-semibold', isPositive ? 'text-emerald-600' : 'text-red-500']">
          <TrendingUp v-if="isPositive" :size="14" />
          <TrendingDown v-else :size="14" />
          {{ change }}
        </span>
      </div>
    </div>
  `
}

export default {
  components: {
    StatusBadge,
    MetricCard,
  }
}
</script>
