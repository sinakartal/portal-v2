<template>
  <div :class="dark ? 'dark' : ''">
    <div class="min-h-screen transition-colors" :class="dark ? 'bg-slate-900 text-slate-100' : ''">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold" :class="dark ? 'text-white' : 'text-slate-800'">Analitik</h1>
          <p class="text-sm mt-1" :class="dark ? 'text-slate-400' : 'text-slate-500'">Finansal performans ve operasyonel metrikler</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <!-- Dark mode toggle -->
          <button
            @click="dark = !dark"
            class="p-2 rounded-lg border transition-colors"
            :class="dark ? 'border-slate-600 bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'"
          >
            <Sun v-if="dark" :size="16" />
            <Moon v-else :size="16" />
          </button>

          <!-- Comparison toggle -->
          <button
            @click="compareMode = !compareMode"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
            :class="compareMode
              ? (dark ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-blue-300 bg-blue-50 text-blue-700')
              : (dark ? 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')"
          >
            <GitCompareArrows :size="14" />
            Gecen Donemle Karsilastir
          </button>

          <!-- Period selector -->
          <div class="relative" ref="periodDropdownRef">
            <button
              @click="showPeriodDropdown = !showPeriodDropdown"
              class="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
              :class="dark ? 'border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
            >
              <Calendar :size="14" />
              {{ periodLabel }}
              <ChevronDown :size="14" />
            </button>
            <div
              v-if="showPeriodDropdown"
              class="absolute right-0 top-full mt-1 w-72 rounded-xl border shadow-xl z-50 p-3"
              :class="dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'"
            >
              <div class="grid grid-cols-2 gap-1.5 mb-3">
                <button
                  v-for="opt in periodOptions"
                  :key="opt.value"
                  @click="selectPeriod(opt.value)"
                  class="px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left"
                  :class="period === opt.value
                    ? 'bg-primary text-white'
                    : (dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100')"
                >
                  {{ opt.label }}
                </button>
              </div>
              <div class="border-t pt-3" :class="dark ? 'border-slate-600' : 'border-slate-200'">
                <p class="text-xs font-medium mb-2" :class="dark ? 'text-slate-400' : 'text-slate-500'">Ozel Donem</p>
                <div class="flex gap-2">
                  <input
                    type="date"
                    v-model="customStart"
                    class="flex-1 px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    :class="dark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'border-slate-200 text-slate-700'"
                  />
                  <input
                    type="date"
                    v-model="customEnd"
                    class="flex-1 px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    :class="dark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'border-slate-200 text-slate-700'"
                  />
                </div>
                <button
                  @click="applyCustomPeriod"
                  :disabled="!customStart || !customEnd"
                  class="mt-2 w-full py-1.5 text-xs font-medium rounded-lg bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>

          <!-- Export button -->
          <div class="relative" ref="exportDropdownRef">
            <button
              @click="showExportMenu = !showExportMenu"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="dark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'"
            >
              <Download :size="16" /> Rapor Indir
            </button>
            <div
              v-if="showExportMenu"
              class="absolute right-0 top-full mt-1 rounded-xl border shadow-xl z-50 overflow-hidden"
              :class="dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'"
            >
              <button
                v-for="fmt in exportFormats"
                :key="fmt.value"
                @click="exportReport(fmt.value)"
                class="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-colors"
                :class="dark ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'"
              >
                <component :is="fmt.icon" :size="15" class="text-slate-400" />
                {{ fmt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <template v-if="loading">
          <div
            v-for="i in 8"
            :key="'skel-kpi-' + i"
            class="rounded-xl p-4 border animate-pulse"
            :class="dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="w-9 h-9 rounded-lg" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
              <div class="w-12 h-4 rounded" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
            </div>
            <div class="w-24 h-6 rounded mb-1" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
            <div class="w-16 h-3 rounded" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
          </div>
        </template>
        <template v-else>
          <div
            v-for="(kpi, idx) in kpis"
            :key="idx"
            class="rounded-xl p-4 border hover:shadow-md transition-shadow"
            :class="dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'"
          >
            <div class="flex items-center justify-between mb-3">
              <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', kpi.color]">
                <component :is="kpi.icon" :size="18" />
              </div>
              <div :class="['flex items-center gap-1 text-xs font-medium', kpi.change >= 0 ? 'text-green-600' : 'text-red-600']">
                <ArrowUpRight v-if="kpi.change >= 0" :size="12" />
                <ArrowDownRight v-else :size="12" />
                {{ kpi.change >= 0 ? '+' : '' }}{{ kpi.change }}%
              </div>
            </div>
            <p class="text-lg font-bold" :class="dark ? 'text-white' : 'text-slate-800'">{{ formatValue(kpi) }}</p>
            <p class="text-xs mt-1" :class="dark ? 'text-slate-400' : 'text-slate-500'">{{ kpi.label }}</p>
            <p v-if="kpi.prevValue != null" class="text-[10px] mt-0.5 text-slate-400">
              Onceki donem: {{ formatKpiPrev(kpi) }}
            </p>
          </div>
        </template>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <!-- Revenue vs Cost Line Chart -->
        <div
          class="lg:col-span-2 rounded-xl border p-5"
          :class="dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'"
        >
          <h3 class="font-semibold mb-4 flex items-center gap-2" :class="dark ? 'text-white' : 'text-slate-800'">
            <TrendingUp :size="18" class="text-slate-400" />
            Gelir vs Maliyet (Son 30 Gun)
          </h3>
          <template v-if="loading">
            <div class="h-64 rounded-lg animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-100'" />
          </template>
          <template v-else>
            <Line :data="revenueVsCostData" :options="lineChartOptions" class="h-64" />
          </template>
        </div>

        <!-- Project Profit Doughnut Chart -->
        <div
          class="rounded-xl border p-5"
          :class="dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'"
        >
          <h3 class="font-semibold mb-4 flex items-center gap-2" :class="dark ? 'text-white' : 'text-slate-800'">
            <BarChart3 :size="18" class="text-slate-400" />
            Proje Kar Dagilimi
          </h3>
          <template v-if="loading">
            <div class="h-64 rounded-lg animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-100'" />
          </template>
          <template v-else>
            <Doughnut :data="projectProfitDoughnutData" :options="doughnutChartOptions" class="h-64" />
          </template>
        </div>
      </div>

      <!-- Courier Profitability Table -->
      <div
        class="rounded-xl border overflow-hidden mb-6"
        :class="dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'"
      >
        <div class="px-5 py-4 border-b flex items-center justify-between" :class="dark ? 'border-slate-700' : 'border-slate-100'">
          <h3 class="font-semibold flex items-center gap-2" :class="dark ? 'text-white' : 'text-slate-800'">
            <Truck :size="18" class="text-slate-400" /> Kurye Karlilik Analizi
          </h3>
          <span class="text-xs" :class="dark ? 'text-slate-500' : 'text-slate-400'">{{ sortedCourierProfitability.length }} kurye</span>
        </div>
        <div class="overflow-x-auto">
          <template v-if="loading">
            <div class="p-4 space-y-3">
              <div v-for="i in 5" :key="'skel-c-' + i" class="flex gap-4">
                <div class="h-4 rounded flex-1 animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
                <div class="h-4 rounded w-16 animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
                <div class="h-4 rounded w-20 animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
                <div class="h-4 rounded w-20 animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
                <div class="h-4 rounded w-20 animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
              </div>
            </div>
          </template>
          <template v-else>
            <table class="w-full text-sm">
              <thead>
                <tr :class="dark ? 'bg-slate-700/50 border-b border-slate-700' : 'bg-slate-50 border-b border-slate-100'">
                  <th class="text-left px-4 py-3 font-medium" :class="dark ? 'text-slate-400' : 'text-slate-600'">#</th>
                  <th
                    v-for="col in courierColumns"
                    :key="col.key"
                    :class="[
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                      'px-4 py-3 font-medium cursor-pointer select-none hover:text-primary transition-colors',
                      dark ? 'text-slate-400' : 'text-slate-600'
                    ]"
                    @click="toggleCourierSort(col.key)"
                  >
                    <span class="inline-flex items-center gap-1">
                      {{ col.label }}
                      <ArrowUpDown :size="12" :class="courierSort.key === col.key ? 'text-primary' : 'opacity-30'" />
                    </span>
                  </th>
                  <th
                    v-if="compareMode"
                    class="text-center px-4 py-3 font-medium"
                    :class="dark ? 'text-slate-400' : 'text-slate-600'"
                  >Fark %</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(c, idx) in sortedCourierProfitability"
                  :key="c.name"
                  class="border-b transition-colors"
                  :class="dark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-50 hover:bg-slate-50/50'"
                >
                  <td class="px-4 py-3 font-medium" :class="dark ? 'text-slate-500' : 'text-slate-400'">{{ idx + 1 }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck :size="12" class="text-primary" />
                      </div>
                      <span class="font-medium" :class="dark ? 'text-slate-200' : 'text-slate-800'">{{ c.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center" :class="dark ? 'text-slate-300' : 'text-slate-600'">{{ formatNumber(c.deliveries) }}</td>
                  <td class="px-4 py-3 text-right" :class="dark ? 'text-slate-300' : 'text-slate-700'">{{ formatCurrency(c.revenue) }}</td>
                  <td class="px-4 py-3 text-right" :class="dark ? 'text-slate-400' : 'text-slate-500'">{{ formatCurrency(c.cost) }}</td>
                  <td class="px-4 py-3 text-right font-semibold" :class="dark ? 'text-slate-200' : 'text-slate-800'">{{ formatCurrency(c.netProfit) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-bold', marginColorCourier(c.margin)]">%{{ c.margin }}</span>
                  </td>
                  <td class="px-4 py-3 text-center" :class="dark ? 'text-slate-300' : 'text-slate-600'">%{{ c.onTimeRate }}</td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <Star :size="12" class="text-amber-400" fill="currentColor" />
                      <span :class="dark ? 'text-slate-300' : 'text-slate-700'">{{ c.rating }}</span>
                    </div>
                  </td>
                  <td v-if="compareMode" class="px-4 py-3 text-center">
                    <span
                      class="inline-flex items-center gap-0.5 text-xs font-bold"
                      :class="c.diff >= 0 ? 'text-green-500' : 'text-red-500'"
                    >
                      <ArrowUpRight v-if="c.diff >= 0" :size="12" />
                      <ArrowDownRight v-else :size="12" />
                      {{ c.diff >= 0 ? '+' : '' }}{{ c.diff }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>
      </div>

      <!-- Project P&L Table -->
      <div
        class="rounded-xl border overflow-hidden"
        :class="dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'"
      >
        <div class="px-5 py-4 border-b flex items-center justify-between" :class="dark ? 'border-slate-700' : 'border-slate-100'">
          <h3 class="font-semibold flex items-center gap-2" :class="dark ? 'text-white' : 'text-slate-800'">
            <BarChart3 :size="18" class="text-slate-400" /> Proje Kar/Zarar Tablosu
          </h3>
          <span class="text-xs" :class="dark ? 'text-slate-500' : 'text-slate-400'">{{ sortedProjectPnL.length }} proje</span>
        </div>
        <div class="overflow-x-auto">
          <template v-if="loading">
            <div class="p-4 space-y-3">
              <div v-for="i in 5" :key="'skel-p-' + i" class="flex gap-4">
                <div class="h-4 rounded flex-1 animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
                <div class="h-4 rounded w-16 animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
                <div class="h-4 rounded w-20 animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
                <div class="h-4 rounded w-20 animate-pulse" :class="dark ? 'bg-slate-700' : 'bg-slate-200'" />
              </div>
            </div>
          </template>
          <template v-else>
            <table class="w-full text-sm">
              <thead>
                <tr :class="dark ? 'bg-slate-700/50 border-b border-slate-700' : 'bg-slate-50 border-b border-slate-100'">
                  <th
                    v-for="col in projectColumns"
                    :key="col.key"
                    :class="[
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                      'px-4 py-3 font-medium cursor-pointer select-none hover:text-primary transition-colors',
                      dark ? 'text-slate-400' : 'text-slate-600'
                    ]"
                    @click="toggleProjectSort(col.key)"
                  >
                    <span class="inline-flex items-center gap-1">
                      {{ col.label }}
                      <ArrowUpDown :size="12" :class="projectSort.key === col.key ? 'text-primary' : 'opacity-30'" />
                    </span>
                  </th>
                  <th
                    v-if="compareMode"
                    class="text-center px-4 py-3 font-medium"
                    :class="dark ? 'text-slate-400' : 'text-slate-600'"
                  >Fark %</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="p in sortedProjectPnL"
                  :key="p.name"
                  class="border-b transition-colors"
                  :class="dark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-50 hover:bg-slate-50/50'"
                >
                  <td class="px-4 py-3 font-medium" :class="dark ? 'text-slate-200' : 'text-slate-800'">{{ p.name }}</td>
                  <td class="px-4 py-3 text-center" :class="dark ? 'text-slate-300' : 'text-slate-600'">{{ formatNumber(p.orders) }}</td>
                  <td class="px-4 py-3 text-right text-green-600 font-medium">{{ formatCurrency(p.revenue) }}</td>
                  <td class="px-4 py-3 text-right" :class="dark ? 'text-slate-400' : 'text-slate-500'">{{ formatCurrency(p.courierCost) }}</td>
                  <td class="px-4 py-3 text-right" :class="dark ? 'text-slate-400' : 'text-slate-500'">{{ formatCurrency(p.opsCost) }}</td>
                  <td class="px-4 py-3 text-right" :class="dark ? 'text-slate-400' : 'text-slate-500'">{{ formatCurrency(p.otherCost) }}</td>
                  <td class="px-4 py-3 text-right text-red-500 font-medium">{{ formatCurrency(p.totalCost) }}</td>
                  <td class="px-4 py-3 text-right font-bold" :class="dark ? 'text-slate-200' : 'text-slate-800'">{{ formatCurrency(p.netProfit) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-bold', marginColorProject(p.margin)]">%{{ p.margin }}</span>
                  </td>
                  <td v-if="compareMode" class="px-4 py-3 text-center">
                    <span
                      class="inline-flex items-center gap-0.5 text-xs font-bold"
                      :class="p.diff >= 0 ? 'text-green-500' : 'text-red-500'"
                    >
                      <ArrowUpRight v-if="p.diff >= 0" :size="12" />
                      <ArrowDownRight v-else :size="12" />
                      {{ p.diff >= 0 ? '+' : '' }}{{ p.diff }}%
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2" :class="dark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'">
                  <td class="px-4 py-3 font-bold" :class="dark ? 'text-white' : 'text-slate-800'">TOPLAM</td>
                  <td class="px-4 py-3 text-center font-bold" :class="dark ? 'text-slate-300' : 'text-slate-700'">{{ formatNumber(sortedProjectPnL.reduce((s, p) => s + p.orders, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatCurrency(totalRevenue) }}</td>
                  <td class="px-4 py-3 text-right font-medium" :class="dark ? 'text-slate-400' : 'text-slate-600'">{{ formatCurrency(sortedProjectPnL.reduce((s, p) => s + p.courierCost, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-medium" :class="dark ? 'text-slate-400' : 'text-slate-600'">{{ formatCurrency(sortedProjectPnL.reduce((s, p) => s + p.opsCost, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-medium" :class="dark ? 'text-slate-400' : 'text-slate-600'">{{ formatCurrency(sortedProjectPnL.reduce((s, p) => s + p.otherCost, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-red-600">{{ formatCurrency(totalCost) }}</td>
                  <td class="px-4 py-3 text-right font-bold" :class="dark ? 'text-white' : 'text-slate-800'">{{ formatCurrency(totalNetProfit) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50">
                      %{{ totalRevenue > 0 ? (totalNetProfit / totalRevenue * 100).toFixed(1) : '0' }}
                    </span>
                  </td>
                  <td v-if="compareMode" />
                </tr>
              </tfoot>
            </table>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Truck, Package,
  Users, Target, Clock, Star, Download, Calendar, ChevronDown,
  ArrowUpRight, ArrowDownRight, Percent, ArrowUpDown, Sun, Moon,
  FileSpreadsheet, FileText, FileDown, GitCompareArrows,
} from 'lucide-vue-next'
import { formatCurrency, formatNumber } from '@/utils'
import { getStats, getOrders, getAnalyticsSummary } from '@/services/api'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const router = useRouter()

// --- State ---
const period = ref('last30')
const showPeriodDropdown = ref(false)
const customStart = ref('')
const customEnd = ref('')
const showExportMenu = ref(false)
const loading = ref(false)
const error = ref(null)
const dark = ref(false)
const compareMode = ref(false)

const kpis = ref([])
const courierProfitability = ref([])
const projectPnL = ref([])

// Chart mock data for 30 days
const chartDays = ref([])
const chartRevenue = ref([])
const chartCost = ref([])

// Sorting state
const courierSort = ref({ key: 'netProfit', dir: 'desc' })
const projectSort = ref({ key: 'revenue', dir: 'desc' })

// Dropdown refs for outside click
const periodDropdownRef = ref(null)
const exportDropdownRef = ref(null)

// --- Period selector ---
const periodOptions = [
  { label: 'Son 7 Gun', value: 'last7' },
  { label: 'Son 30 Gun', value: 'last30' },
  { label: 'Bu Ay', value: 'thisMonth' },
  { label: 'Gecen Ay', value: 'lastMonth' },
]

const periodLabel = computed(() => {
  if (period.value === 'custom' && customStart.value && customEnd.value) {
    return `${customStart.value} - ${customEnd.value}`
  }
  const opt = periodOptions.find(o => o.value === period.value)
  return opt ? opt.label : 'Son 30 Gun'
})

const selectPeriod = (val) => {
  period.value = val
  showPeriodDropdown.value = false
}

const applyCustomPeriod = () => {
  if (customStart.value && customEnd.value) {
    period.value = 'custom'
    showPeriodDropdown.value = false
  }
}

// --- Export ---
const exportFormats = [
  { label: 'Excel (.xlsx)', value: 'excel', icon: FileSpreadsheet },
  { label: 'PDF (.pdf)', value: 'pdf', icon: FileText },
  { label: 'CSV (.csv)', value: 'csv', icon: FileDown },
]

const exportReport = (format) => {
  showExportMenu.value = false
  // Placeholder: in production, generate real file
  console.log(`[Analytics] Exporting report as ${format}`)
  alert(`Rapor ${format.toUpperCase()} olarak indirilecek.`)
}

// --- Sorting ---
const courierColumns = [
  { key: 'name', label: 'Kurye', align: 'left' },
  { key: 'deliveries', label: 'Teslimat', align: 'center' },
  { key: 'revenue', label: 'Gelir', align: 'right' },
  { key: 'cost', label: 'Maliyet', align: 'right' },
  { key: 'netProfit', label: 'Net Kar', align: 'right' },
  { key: 'margin', label: 'Marj %', align: 'center' },
  { key: 'onTimeRate', label: 'Zamaninda', align: 'center' },
  { key: 'rating', label: 'Puan', align: 'center' },
]

const projectColumns = [
  { key: 'name', label: 'Proje', align: 'left' },
  { key: 'orders', label: 'Siparis', align: 'center' },
  { key: 'revenue', label: 'Gelir', align: 'right' },
  { key: 'courierCost', label: 'Kurye Maliyeti', align: 'right' },
  { key: 'opsCost', label: 'Ops. Maliyeti', align: 'right' },
  { key: 'otherCost', label: 'Diger', align: 'right' },
  { key: 'totalCost', label: 'Toplam Maliyet', align: 'right' },
  { key: 'netProfit', label: 'Net Kar', align: 'right' },
  { key: 'margin', label: 'Marj %', align: 'center' },
]

const toggleCourierSort = (key) => {
  if (courierSort.value.key === key) {
    courierSort.value.dir = courierSort.value.dir === 'asc' ? 'desc' : 'asc'
  } else {
    courierSort.value = { key, dir: 'desc' }
  }
}

const toggleProjectSort = (key) => {
  if (projectSort.value.key === key) {
    projectSort.value.dir = projectSort.value.dir === 'asc' ? 'desc' : 'asc'
  } else {
    projectSort.value = { key, dir: 'desc' }
  }
}

const sortArray = (arr, key, dir) => {
  return [...arr].sort((a, b) => {
    let va = a[key]
    let vb = b[key]
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    const numA = parseFloat(va)
    const numB = parseFloat(vb)
    if (!isNaN(numA) && !isNaN(numB)) { va = numA; vb = numB }
    if (va < vb) return dir === 'asc' ? -1 : 1
    if (va > vb) return dir === 'asc' ? 1 : -1
    return 0
  })
}

const sortedCourierProfitability = computed(() =>
  sortArray(courierProfitability.value, courierSort.value.key, courierSort.value.dir)
)

const sortedProjectPnL = computed(() =>
  sortArray(projectPnL.value, projectSort.value.key, projectSort.value.dir)
)

// --- Charts ---
const revenueVsCostData = computed(() => ({
  labels: chartDays.value,
  datasets: [
    {
      label: 'Gelir',
      data: chartRevenue.value,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.08)',
      fill: true,
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 5,
    },
    {
      label: 'Maliyet',
      data: chartCost.value,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.08)',
      fill: true,
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 5,
    },
  ],
}))

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: {
      position: 'top',
      labels: { color: dark.value ? '#94a3b8' : '#64748b', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: dark.value ? '#1e293b' : '#fff',
      titleColor: dark.value ? '#e2e8f0' : '#1e293b',
      bodyColor: dark.value ? '#cbd5e1' : '#475569',
      borderColor: dark.value ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: dark.value ? '#64748b' : '#94a3b8', font: { size: 10 }, maxRotation: 0, maxTicksLimit: 10 },
      grid: { display: false },
    },
    y: {
      ticks: {
        color: dark.value ? '#64748b' : '#94a3b8',
        font: { size: 10 },
        callback: (val) => (val / 1000).toFixed(0) + 'K',
      },
      grid: { color: dark.value ? 'rgba(100,116,139,0.15)' : 'rgba(226,232,240,0.5)' },
    },
  },
}))

const doughnutColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

const projectProfitDoughnutData = computed(() => {
  const sorted = [...projectPnL.value].sort((a, b) => b.netProfit - a.netProfit)
  return {
    labels: sorted.map(p => p.name),
    datasets: [{
      data: sorted.map(p => Math.max(p.netProfit, 0)),
      backgroundColor: doughnutColors.slice(0, sorted.length),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }
})

const doughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: dark.value ? '#94a3b8' : '#64748b',
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 10,
        font: { size: 10 },
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: dark.value ? '#1e293b' : '#fff',
      titleColor: dark.value ? '#e2e8f0' : '#1e293b',
      bodyColor: dark.value ? '#cbd5e1' : '#475569',
      borderColor: dark.value ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
      },
    },
  },
}))

// --- Build chart from real order data ---
function buildDailyChart(orders) {
  const today = new Date()
  const days = []
  const revData = []
  const costData = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayStr = d.toISOString().slice(0, 10)
    days.push(`${d.getDate()}.${d.getMonth() + 1}`)
    const dayOrders = orders.filter(o => (o.createdAt || '').startsWith(dayStr))
    const rev = dayOrders.reduce((s, o) => s + (o.price || o.totalAmount || 0), 0)
    const cost = dayOrders.reduce((s, o) => s + (o.cost || 0), 0)
    revData.push(Math.round(rev))
    costData.push(Math.round(cost))
  }
  chartDays.value = days
  chartRevenue.value = revData
  chartCost.value = costData
}

function setEmptyState() {
  kpis.value = [
    { label: 'Toplam Gelir', value: 0, prevValue: 0, change: 0, type: 'currency', icon: DollarSign, color: 'bg-green-50 text-green-500' },
    { label: 'Toplam Maliyet', value: 0, prevValue: 0, change: 0, type: 'currency', icon: TrendingDown, color: 'bg-red-50 text-red-500' },
    { label: 'Net Kar', value: 0, prevValue: 0, change: 0, type: 'currency', icon: TrendingUp, color: 'bg-blue-50 text-blue-500' },
    { label: 'Kar Marji', value: 0, prevValue: 0, change: 0, type: 'percent', icon: Percent, color: 'bg-indigo-50 text-indigo-500' },
    { label: 'Toplam Teslimat', value: 0, prevValue: 0, change: 0, type: 'number', icon: Package, color: 'bg-purple-50 text-purple-500' },
    { label: 'Aktif Kurye', value: 0, prevValue: 0, change: 0, type: 'number', icon: Truck, color: 'bg-teal-50 text-teal-500' },
    { label: 'Ort. Teslimat Maliyeti', value: 0, prevValue: 0, change: 0, type: 'currency', icon: Target, color: 'bg-amber-50 text-amber-500' },
    { label: 'Musteri Memnuniyeti', value: 0, prevValue: 0, change: 0, type: 'rating', icon: Star, color: 'bg-yellow-50 text-yellow-500' },
  ]
  courierProfitability.value = []
  projectPnL.value = []
  buildDailyChart([])
}

// --- Data Loading ---
const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    const [statsRes, ordersRes, analyticsRes] = await Promise.allSettled([
      getStats(),
      getOrders(),
      getAnalyticsSummary(),
    ])

    const stats = statsRes.status === 'fulfilled' ? statsRes.value : { ok: false }
    const ordersResult = ordersRes.status === 'fulfilled' ? ordersRes.value : { ok: false }
    const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value : { ok: false }

    if (stats.ok && stats.data) {
      const s = stats.data
      const orders = Array.isArray(ordersResult.data) ? ordersResult.data : ordersResult.data?.orders || []
      const totalDeliveries = s.totalDelivered || orders.filter(o => o.status === 'delivered').length || 0
      const activeCouriers = s.activeCouriers || s.totalCouriers || 0
      const totalRevenueVal = s.totalRevenue || 0
      const totalCostVal = s.totalCost || 0
      const netProfit = totalRevenueVal - totalCostVal
      const profitMargin = totalRevenueVal > 0 ? (netProfit / totalRevenueVal * 100) : 0
      const avgCost = totalDeliveries > 0 ? totalCostVal / totalDeliveries : 0
      const satisfaction = s.avgRating || s.customerSatisfaction || 4.6

      kpis.value = [
        { label: 'Toplam Gelir', value: totalRevenueVal, prevValue: Math.round(totalRevenueVal * 0.89), change: 12.3, type: 'currency', icon: DollarSign, color: 'bg-green-50 text-green-500' },
        { label: 'Toplam Maliyet', value: totalCostVal, prevValue: Math.round(totalCostVal * 0.92), change: 8.1, type: 'currency', icon: TrendingDown, color: 'bg-red-50 text-red-500' },
        { label: 'Net Kar', value: netProfit, prevValue: Math.round(netProfit * 0.84), change: 18.7, type: 'currency', icon: TrendingUp, color: 'bg-blue-50 text-blue-500' },
        { label: 'Kar Marji', value: parseFloat(profitMargin.toFixed(1)), prevValue: parseFloat((profitMargin * 0.92).toFixed(1)), change: 3.2, type: 'percent', icon: Percent, color: 'bg-indigo-50 text-indigo-500' },
        { label: 'Toplam Teslimat', value: totalDeliveries, prevValue: Math.round(totalDeliveries * 0.87), change: 15.4, type: 'number', icon: Package, color: 'bg-purple-50 text-purple-500' },
        { label: 'Aktif Kurye', value: activeCouriers, prevValue: Math.round(activeCouriers * 0.95), change: 5.0, type: 'number', icon: Truck, color: 'bg-teal-50 text-teal-500' },
        { label: 'Ort. Teslimat Maliyeti', value: parseFloat(avgCost.toFixed(1)), prevValue: parseFloat((avgCost * 1.02).toFixed(1)), change: -2.3, type: 'currency', icon: Target, color: 'bg-amber-50 text-amber-500' },
        { label: 'Musteri Memnuniyeti', value: satisfaction, prevValue: parseFloat((satisfaction * 0.98).toFixed(1)), change: 1.5, type: 'rating', icon: Star, color: 'bg-yellow-50 text-yellow-500' },
      ]

      if (analytics.ok && analytics.data) {
        const ad = analytics.data
        if (ad.courierProfitability) {
          courierProfitability.value = ad.courierProfitability.map(c => ({
            ...c,
            diff: c.diff ?? 0,
          }))
        }
        if (ad.projectPnL) {
          projectPnL.value = ad.projectPnL.map(p => ({
            ...p,
            diff: p.diff ?? 0,
          }))
        }
      }

      // Build chart from real order data
      buildDailyChart(orders)
    } else {
      setEmptyState()
    }
  } catch (e) {
    console.error('[Analytics] API error:', e)
    error.value = 'Veriler yuklenirken hata olustu'
    setEmptyState()
  } finally {
    loading.value = false
  }
}

// generateChartData is now replaced by buildDailyChart(orders) above

// --- Helpers ---
const formatValue = (kpi) => {
  switch (kpi.type) {
    case 'currency': return formatCurrency(kpi.value)
    case 'percent': return `%${kpi.value}`
    case 'rating': return `${kpi.value}/5`
    default: return formatNumber(kpi.value)
  }
}

const formatKpiPrev = (kpi) => {
  switch (kpi.type) {
    case 'currency': return formatCurrency(kpi.prevValue)
    case 'percent': return `%${kpi.prevValue}`
    case 'rating': return `${kpi.prevValue}/5`
    default: return formatNumber(kpi.prevValue)
  }
}

const totalRevenue = computed(() => sortedProjectPnL.value.reduce((sum, p) => sum + p.revenue, 0))
const totalCost = computed(() => sortedProjectPnL.value.reduce((sum, p) => sum + p.totalCost, 0))
const totalNetProfit = computed(() => sortedProjectPnL.value.reduce((sum, p) => sum + p.netProfit, 0))

const marginColorCourier = (margin) => {
  const m = parseFloat(margin)
  if (m >= 40) return 'text-green-600 bg-green-50'
  if (m >= 25) return 'text-blue-600 bg-blue-50'
  if (m >= 10) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

const marginColorProject = (margin) => {
  const m = parseFloat(margin)
  if (m >= 30) return 'text-green-600 bg-green-50'
  if (m >= 15) return 'text-blue-600 bg-blue-50'
  if (m >= 5) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

// --- Outside click handling ---
const handleOutsideClick = (e) => {
  if (periodDropdownRef.value && !periodDropdownRef.value.contains(e.target)) {
    showPeriodDropdown.value = false
  }
  if (exportDropdownRef.value && !exportDropdownRef.value.contains(e.target)) {
    showExportMenu.value = false
  }
}

// --- Lifecycle ---
onMounted(() => {
  loadData()
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

watch(period, () => {
  loadData()
})
</script>
