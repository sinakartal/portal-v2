<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <BarChart3 class="w-6 h-6 text-blue-600" />
        Raporlar
      </h1>
      <div class="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
        <Calendar class="w-4 h-4 text-slate-400 ml-2" />
        <button
          v-for="option in dateRangeOptions"
          :key="option.key"
          @click="dateRange = option.key"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            dateRange === option.key
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">Toplam Siparis</span>
          <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <BarChart3 class="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p class="text-2xl font-bold text-slate-800">542</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">Kendi Kurye</span>
          <div class="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Users class="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <p class="text-2xl font-bold text-slate-800">387</p>
          <span class="text-sm font-medium text-emerald-600">%71</span>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">Havuz Siparis</span>
          <div class="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
            <Truck class="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <p class="text-2xl font-bold text-slate-800">155</p>
          <span class="text-sm font-medium text-orange-600">%29</span>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">Havuz Maliyeti</span>
          <div class="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
            <DollarSign class="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <p class="text-2xl font-bold text-slate-800">&#8378;4,340</p>
      </div>
    </div>

    <!-- Tables Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Courier Performance Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 class="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Users class="w-5 h-5 text-blue-500" />
          Kurye Performansi
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">Kurye</th>
                <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">Teslimat</th>
                <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">Ort.Sure</th>
                <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Puan</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(courier, idx) in courierData"
                :key="idx"
                class="border-b border-slate-50 last:border-0"
              >
                <td class="py-3 pr-3">
                  <span class="font-medium text-slate-700">{{ courier.name }}</span>
                </td>
                <td class="py-3 pr-3">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-slate-700 w-8">{{ courier.deliveries }}</span>
                    <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-blue-500 rounded-full transition-all"
                        :style="{ width: `${(courier.deliveries / maxDeliveries) * 100}%` }"
                      />
                    </div>
                  </div>
                </td>
                <td class="py-3 pr-3">
                  <span class="text-sm text-slate-600">{{ courier.avgTime }} dk</span>
                </td>
                <td class="py-3">
                  <span class="text-sm text-slate-700 flex items-center gap-1">
                    <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
                    {{ courier.rating }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pool Partner Performance Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 class="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Truck class="w-5 h-5 text-orange-500" />
          Havuz Partner Performansi
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">Partner</th>
                <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">Siparis</th>
                <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">Ort.Sure</th>
                <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">Maliyet</th>
                <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">SLA</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(partner, idx) in poolPartnerData"
                :key="idx"
                class="border-b border-slate-50 last:border-0"
              >
                <td class="py-3 pr-3">
                  <span class="font-medium text-slate-700">{{ partner.name }}</span>
                </td>
                <td class="py-3 pr-3">
                  <span class="text-sm font-semibold text-slate-700">{{ partner.orders }}</span>
                </td>
                <td class="py-3 pr-3">
                  <span class="text-sm text-slate-600">{{ partner.avgTime }} dk</span>
                </td>
                <td class="py-3 pr-3">
                  <span class="text-sm font-semibold text-slate-700">&#8378;{{ partner.cost.toLocaleString('tr-TR') }}</span>
                </td>
                <td class="py-3">
                  <span
                    :class="[
                      'text-sm font-semibold',
                      partner.sla >= 97 ? 'text-emerald-600' : partner.sla >= 95 ? 'text-amber-600' : 'text-red-500'
                    ]"
                  >
                    %{{ partner.sla }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Weekly Order Trend - Stacked Bar Chart -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 class="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <BarChart3 class="w-5 h-5 text-indigo-500" />
          Haftalik Siparis Trendi
        </h2>
        <div style="height: 280px">
          <Bar :data="weeklyChartData" :options="barChartOptions" />
        </div>
      </div>

      <!-- Delivery Time Distribution - Line Chart -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 class="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <TrendingUp class="w-5 h-5 text-emerald-500" />
          Teslimat Suresi Dagilimi
        </h2>
        <div style="height: 280px">
          <Line :data="hourlyChartData" :options="lineChartOptions" />
        </div>
      </div>
    </div>

    <!-- AI Recommendation Card -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-5 flex items-start gap-3">
      <div class="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb class="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <p class="font-semibold text-amber-800 mb-1">Oneri</p>
        <p class="text-amber-700 text-sm">
          Paket Taxi yerine daha fazla Bringo kullanin — Aylik
          <span class="font-semibold">&#8378;850 tasarruf</span>
          potansiyeli
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line } from 'vue-chartjs'
import {
  BarChart3,
  TrendingUp,
  Users,
  Truck,
  Star,
  Lightbulb,
  Calendar,
  DollarSign,
} from 'lucide-vue-next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const weeklyTrendData = [
  { day: 'Pzt', kendiKurye: 62, havuz: 18 },
  { day: 'Sal', kendiKurye: 55, havuz: 22 },
  { day: 'Car', kendiKurye: 58, havuz: 20 },
  { day: 'Per', kendiKurye: 60, havuz: 25 },
  { day: 'Cum', kendiKurye: 70, havuz: 30 },
  { day: 'Cmt', kendiKurye: 48, havuz: 22 },
  { day: 'Paz', kendiKurye: 34, havuz: 18 },
]

const hourlyDeliveryData = [
  { saat: '10:00', ortSure: 20 },
  { saat: '11:00', ortSure: 22 },
  { saat: '12:00', ortSure: 30 },
  { saat: '13:00', ortSure: 32 },
  { saat: '14:00', ortSure: 25 },
  { saat: '15:00', ortSure: 21 },
  { saat: '16:00', ortSure: 19 },
  { saat: '17:00', ortSure: 23 },
  { saat: '18:00', ortSure: 28 },
  { saat: '19:00', ortSure: 35 },
  { saat: '20:00', ortSure: 33 },
  { saat: '21:00', ortSure: 27 },
  { saat: '22:00', ortSure: 22 },
]

const courierData = [
  { name: 'Mehmet K.', deliveries: 125, avgTime: 22, rating: 4.9 },
  { name: 'Ali V.', deliveries: 98, avgTime: 25, rating: 4.7 },
  { name: 'Veli T.', deliveries: 87, avgTime: 28, rating: 4.6 },
  { name: 'Hasan C.', deliveries: 72, avgTime: 30, rating: 4.5 },
  { name: 'Zeynep A.', deliveries: 45, avgTime: 18, rating: 4.9 },
]

const poolPartnerData = [
  { name: 'Bringo', orders: 98, avgTime: 26, cost: 2744, sla: 98.2 },
  { name: 'Trendyol Go', orders: 42, avgTime: 30, cost: 1344, sla: 96.5 },
  { name: 'Paket Taxi', orders: 15, avgTime: 38, cost: 570, sla: 93.8 },
]

const dateRangeOptions = [
  { key: 'week', label: 'Bu Hafta' },
  { key: 'month', label: 'Bu Ay' },
  { key: '30days', label: 'Son 30 Gun' },
]

const maxDeliveries = Math.max(...courierData.map((c) => c.deliveries))

const dateRange = ref('week')

// Weekly Bar Chart Data
const weeklyChartData = computed(() => ({
  labels: weeklyTrendData.map((d) => d.day),
  datasets: [
    {
      label: 'Kendi Kurye',
      data: weeklyTrendData.map((d) => d.kendiKurye),
      backgroundColor: '#3b82f6',
      borderRadius: 0,
    },
    {
      label: 'Havuz',
      data: weeklyTrendData.map((d) => d.havuz),
      backgroundColor: '#f97316',
      borderRadius: { topLeft: 4, topRight: 4 },
    },
  ],
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { size: 13 }, color: '#64748b' },
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1e293b',
      bodyColor: '#64748b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 8,
      titleFont: { size: 13 },
      bodyFont: { size: 13 },
    },
  },
  scales: {
    x: {
      stacked: true,
      ticks: { font: { size: 12 }, color: '#64748b' },
      grid: { color: '#e2e8f0' },
    },
    y: {
      stacked: true,
      ticks: { font: { size: 12 }, color: '#64748b' },
      grid: { color: '#e2e8f0' },
    },
  },
}

// Hourly Line Chart Data
const hourlyChartData = computed(() => ({
  labels: hourlyDeliveryData.map((d) => d.saat),
  datasets: [
    {
      label: 'Ort. Sure (dk)',
      data: hourlyDeliveryData.map((d) => d.ortSure),
      borderColor: '#10b981',
      backgroundColor: '#10b981',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#10b981',
      pointHoverRadius: 6,
      tension: 0.4,
    },
  ],
}))

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { size: 13 }, color: '#64748b' },
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1e293b',
      bodyColor: '#64748b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 8,
      titleFont: { size: 13 },
      bodyFont: { size: 13 },
      callbacks: {
        label: (context) => `Ort. Sure: ${context.parsed.y} dk`,
      },
    },
  },
  scales: {
    x: {
      ticks: { font: { size: 12 }, color: '#64748b' },
      grid: { color: '#e2e8f0' },
    },
    y: {
      ticks: {
        font: { size: 12 },
        color: '#64748b',
        callback: (value) => `${value} dk`,
      },
      grid: { color: '#e2e8f0' },
    },
  },
}
</script>
