<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Analitik</h1>
        <p class="text-sm text-slate-500 mt-1">Finansal performans ve operasyonel metrikler</p>
      </div>
      <div class="flex gap-2">
        <select
          v-model="period"
          class="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="week">Bu Hafta</option>
          <option value="month">Bu Ay</option>
          <option value="quarter">Bu Ceyrek</option>
          <option value="year">Bu Yil</option>
        </select>
        <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors cursor-pointer">
          <Download :size="16" /> Rapor Indir
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        v-for="(kpi, idx) in kpis"
        :key="idx"
        class="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow"
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
        <p class="text-lg font-bold text-slate-800">{{ formatValue(kpi) }}</p>
        <p class="text-xs text-slate-500 mt-1">{{ kpi.label }}</p>
      </div>
    </div>

    <!-- Courier Profitability Table -->
    <div class="bg-white rounded-xl border border-slate-100 overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-semibold text-slate-800 flex items-center gap-2">
          <Truck :size="18" class="text-slate-500" /> Kurye Karlilik Analizi
        </h3>
        <span class="text-xs text-slate-400">{{ courierProfitability.length }} kurye</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-4 py-3 font-medium text-slate-600">#</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Teslimat</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Gelir</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Maliyet</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Net Kar</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Marj %</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Zamaninda</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Puan</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(c, idx) in courierProfitability"
              :key="c.name"
              class="border-b border-slate-50 hover:bg-slate-50/50"
            >
              <td class="px-4 py-3 text-slate-400 font-medium">{{ idx + 1 }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck :size="12" class="text-primary" />
                  </div>
                  <span class="font-medium text-slate-800">{{ c.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center text-slate-600">{{ formatNumber(c.deliveries) }}</td>
              <td class="px-4 py-3 text-right text-slate-700">{{ formatCurrency(c.revenue) }}</td>
              <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(c.cost) }}</td>
              <td class="px-4 py-3 text-right font-semibold text-slate-800">{{ formatCurrency(c.netProfit) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-bold', marginColorCourier(c.margin)]">%{{ c.margin }}</span>
              </td>
              <td class="px-4 py-3 text-center text-slate-600">%{{ c.onTimeRate }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <Star :size="12" class="text-amber-400" fill="currentColor" />
                  <span class="text-slate-700">{{ c.rating }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Project P&L Table -->
    <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-semibold text-slate-800 flex items-center gap-2">
          <BarChart3 :size="18" class="text-slate-500" /> Proje Kar/Zarar Tablosu
        </h3>
        <span class="text-xs text-slate-400">{{ projectPnL.length }} proje</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-4 py-3 font-medium text-slate-600">Proje</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Siparis</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Gelir</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Kurye Maliyeti</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Ops. Maliyeti</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Diger</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Toplam Maliyet</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Net Kar</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Marj %</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in projectPnL"
              :key="p.name"
              class="border-b border-slate-50 hover:bg-slate-50/50"
            >
              <td class="px-4 py-3 font-medium text-slate-800">{{ p.name }}</td>
              <td class="px-4 py-3 text-center text-slate-600">{{ formatNumber(p.orders) }}</td>
              <td class="px-4 py-3 text-right text-green-600 font-medium">{{ formatCurrency(p.revenue) }}</td>
              <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(p.courierCost) }}</td>
              <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(p.opsCost) }}</td>
              <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(p.otherCost) }}</td>
              <td class="px-4 py-3 text-right text-red-500 font-medium">{{ formatCurrency(p.totalCost) }}</td>
              <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(p.netProfit) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-bold', marginColorProject(p.margin)]">%{{ p.margin }}</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-slate-50 border-t-2 border-slate-200">
              <td class="px-4 py-3 font-bold text-slate-800">TOPLAM</td>
              <td class="px-4 py-3 text-center font-bold text-slate-700">{{ formatNumber(projectPnL.reduce((s, p) => s + p.orders, 0)) }}</td>
              <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatCurrency(totalRevenue) }}</td>
              <td class="px-4 py-3 text-right font-medium text-slate-600">{{ formatCurrency(projectPnL.reduce((s, p) => s + p.courierCost, 0)) }}</td>
              <td class="px-4 py-3 text-right font-medium text-slate-600">{{ formatCurrency(projectPnL.reduce((s, p) => s + p.opsCost, 0)) }}</td>
              <td class="px-4 py-3 text-right font-medium text-slate-600">{{ formatCurrency(projectPnL.reduce((s, p) => s + p.otherCost, 0)) }}</td>
              <td class="px-4 py-3 text-right font-bold text-red-600">{{ formatCurrency(totalCost) }}</td>
              <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(totalNetProfit) }}</td>
              <td class="px-4 py-3 text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50">
                  %{{ totalRevenue > 0 ? (totalNetProfit / totalRevenue * 100).toFixed(1) : '0' }}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Truck, Package,
  Users, Target, Clock, Star, Download, Calendar, ChevronDown,
  ArrowUpRight, ArrowDownRight, Percent
} from 'lucide-vue-next'
import { formatCurrency, formatNumber } from '@/utils'

const router = useRouter()
const period = ref('month')
const kpis = ref([])
const courierProfitability = ref([])
const projectPnL = ref([])

const generateData = () => {
  kpis.value = [
    { label: 'Toplam Gelir', value: 847520, change: 12.3, type: 'currency', icon: DollarSign, color: 'bg-green-50 text-green-500' },
    { label: 'Toplam Maliyet', value: 523180, change: 8.1, type: 'currency', icon: TrendingDown, color: 'bg-red-50 text-red-500' },
    { label: 'Net Kar', value: 324340, change: 18.7, type: 'currency', icon: TrendingUp, color: 'bg-blue-50 text-blue-500' },
    { label: 'Kar Marji', value: 38.3, change: 3.2, type: 'percent', icon: Percent, color: 'bg-indigo-50 text-indigo-500' },
    { label: 'Toplam Teslimat', value: 12847, change: 15.4, type: 'number', icon: Package, color: 'bg-purple-50 text-purple-500' },
    { label: 'Aktif Kurye', value: 42, change: 5.0, type: 'number', icon: Truck, color: 'bg-teal-50 text-teal-500' },
    { label: 'Ort. Teslimat Maliyeti', value: 40.7, change: -2.3, type: 'currency', icon: Target, color: 'bg-amber-50 text-amber-500' },
    { label: 'Musteri Memnuniyeti', value: 4.6, change: 1.5, type: 'rating', icon: Star, color: 'bg-yellow-50 text-yellow-500' },
  ]

  const courierNames = [
    'Serkan Acar', 'Murat Yildirim', 'Hakan Tekin', 'Kemal Bas',
    'Selim Dursun', 'Taner Gul', 'Volkan Aslan', 'Cem Ozkan',
    'Baris Ay', 'Erkan Sahin', 'Firat Kocer', 'Deniz Uysal',
    'Caner Aktas', 'Onur Cevik', 'Tolga Eren'
  ]

  courierProfitability.value = courierNames.map(name => {
    const deliveries = Math.floor(Math.random() * 300) + 100
    const revenue = deliveries * (Math.random() * 30 + 50)
    const cost = deliveries * (Math.random() * 20 + 25)
    const netProfit = revenue - cost
    const margin = (netProfit / revenue * 100)
    return {
      name,
      deliveries,
      revenue: Math.round(revenue),
      cost: Math.round(cost),
      netProfit: Math.round(netProfit),
      margin: margin.toFixed(1),
      onTimeRate: Math.floor(Math.random() * 15) + 85,
      rating: (Math.random() * 1.2 + 3.8).toFixed(1),
    }
  }).sort((a, b) => b.netProfit - a.netProfit)

  const projects = [
    'Istanbul Ana Dagitim', 'Ankara Bolge', 'Izmir Sahil', 'Antalya Turizm',
    'Bursa Sanayi', 'Express Teslimat', 'Gida Dagitim', 'E-Ticaret Lojistik'
  ]

  projectPnL.value = projects.map(name => {
    const orders = Math.floor(Math.random() * 2000) + 500
    const revenue = orders * (Math.random() * 40 + 60)
    const courierCost = orders * (Math.random() * 15 + 20)
    const opsCost = orders * (Math.random() * 5 + 8)
    const otherCost = orders * (Math.random() * 3 + 2)
    const totalCost = courierCost + opsCost + otherCost
    const netProfit = revenue - totalCost
    const margin = (netProfit / revenue * 100)
    return {
      name,
      orders,
      revenue: Math.round(revenue),
      courierCost: Math.round(courierCost),
      opsCost: Math.round(opsCost),
      otherCost: Math.round(otherCost),
      totalCost: Math.round(totalCost),
      netProfit: Math.round(netProfit),
      margin: margin.toFixed(1),
    }
  }).sort((a, b) => b.revenue - a.revenue)
}

// Initial load
generateData()

// Re-generate when period changes
watch(period, () => {
  generateData()
})

const formatValue = (kpi) => {
  switch (kpi.type) {
    case 'currency': return formatCurrency(kpi.value)
    case 'percent': return `%${kpi.value}`
    case 'rating': return `${kpi.value}/5`
    default: return formatNumber(kpi.value)
  }
}

const totalRevenue = computed(() => projectPnL.value.reduce((sum, p) => sum + p.revenue, 0))
const totalCost = computed(() => projectPnL.value.reduce((sum, p) => sum + p.totalCost, 0))
const totalNetProfit = computed(() => projectPnL.value.reduce((sum, p) => sum + p.netProfit, 0))

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
</script>
