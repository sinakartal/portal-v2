<!--
  Dashboard.vue - Ana Dashboard Sayfasi
  ======================================
  Admin panelinin ana sayfasidir. Genel bakis ve anlik metrikleri gosterir.

  Ozellikler:
  - Proje, sube ve tarih araligi filtreleri (tum ekrani etkiler)
  - 8 adet KPI karti (siparis, rota, kurye, teslim orani, sure, gelir, iptal, puan)
  - Haftalik siparis trendi chart'i (Line - bu hafta vs gecen hafta)
  - Teslimat durumu dagilimi chart'i (Doughnut)
  - Saatlik yogunluk chart'i (Bar)
  - Son aktiviteler akisi (siparis, teslimat, kurye, uyari, iptal)
  - Tum kartlar ve chart'lar tiklanabilir (ilgili sayfaya yonlendirir)

  Filtre mantigi:
  - Filtre degistiginde loadDashboardData() cagirilir
  - filterSeed() ile deterministik bir carpan uretilir (ayni filtre = ayni sonuc)
  - KPI, chart ve aktivite verileri bu carpanla olceklenir

  Not: Tum veriler mockData.js'den gelir, API entegrasyonunda degistirilecek.
-->
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Package, MapPin, Truck, CheckCircle, Clock, Wallet, XCircle, Star, Plus, Route, FileText, AlertTriangle, Building2, CalendarDays, FolderKanban } from 'lucide-vue-next'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { generateKPIs, generateWeeklyData, generateHourlyData, generateOrders, generateStatusDistribution } from '@/services/mockData'
import { ORDER_STATUSES } from '@/constants/menu'
import { timeAgo } from '@/utils'

// Chart.js modullerini kaydet
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

// Doughnut chart renk paleti
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#6b7280']

// ========== FILTRE SECENEKLERI ==========

const PROJECTS = ['Tumu', 'Istanbul Ana Dagitim', 'Ankara Bolge', 'Izmir Sahil', 'Antalya Turizm', 'Bursa Sanayi', 'Express Teslimat', 'Gida Dagitim', 'E-Ticaret Lojistik']
const BRANCHES = ['Tumu', 'Kadikoy', 'Besiktas', 'Sisli', 'Uskudar', 'Bakirkoy', 'Atasehir', 'Maltepe', 'Pendik', 'Umraniye', 'Sariyer']

// ========== REACTIVE STATE ==========

const selectedProject = ref('Tumu')                                    // Secili proje filtresi
const selectedBranch = ref('Tumu')                                     // Secili sube filtresi
const selectedDateStart = ref(new Date().toISOString().split('T')[0])  // Baslangic tarihi
const selectedDateEnd = ref(new Date().toISOString().split('T')[0])    // Bitis tarihi

const kpis = ref(null)         // KPI karti verileri
const weeklyData = ref([])     // Haftalik trend chart verisi
const hourlyData = ref([])     // Saatlik yogunluk chart verisi
const statusDist = ref([])     // Durum dagilimi (Doughnut chart)
const activities = ref([])     // Son aktiviteler listesi
const router = useRouter()

// ========== VERI YUKLEME ==========

/**
 * Filtre degerlerinden deterministik bir seed uretir.
 * Ayni filtre kombinasyonu her zaman ayni sonucu verir.
 * Bu sayede filtre degistiginde veriler tutarli sekilde degisir.
 */
function filterSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return (Math.abs(h) % 100) / 100
}

/**
 * Dashboard verilerini yukler ve filtrelere gore olcekler.
 * - Filtre seciliyse verileri 0.3-1.0 arasinda bir carpanla kucultur
 * - "Tumu" seciliyse veriler tam boyutta gosterilir
 * TODO: API entegrasyonunda filtreler query param olarak gonderilecek
 */
function loadDashboardData() {
  // Filtrelerden deterministik carpan hesapla
  const seed = filterSeed(selectedProject.value + selectedBranch.value + selectedDateStart.value + selectedDateEnd.value)
  const mult = selectedProject.value === 'Tumu' && selectedBranch.value === 'Tumu' ? 1 : 0.3 + seed * 0.7

  // KPI verilerini olustur ve carpanla olcekle
  const baseKpis = generateKPIs()
  kpis.value = {
    todayOrders: { ...baseKpis.todayOrders, value: Math.round(baseKpis.todayOrders.value * mult) },
    activeRoutes: { ...baseKpis.activeRoutes, value: Math.round(baseKpis.activeRoutes.value * mult) },
    onlineCouriers: { ...baseKpis.onlineCouriers, value: Math.round(baseKpis.onlineCouriers.value * mult), total: Math.round(baseKpis.onlineCouriers.total * mult) },
    deliveryRate: baseKpis.deliveryRate,
    avgDeliveryTime: baseKpis.avgDeliveryTime,
    dailyRevenue: { ...baseKpis.dailyRevenue, value: Math.round(baseKpis.dailyRevenue.value * mult) },
    cancelRate: baseKpis.cancelRate,
    customerRating: baseKpis.customerRating,
  }

  // Haftalik chart verisini olcekle
  weeklyData.value = generateWeeklyData().map(d => ({
    ...d,
    buHafta: Math.round(d.buHafta * mult),
    gecenHafta: Math.round(d.gecenHafta * mult),
  }))

  // Saatlik chart verisini olcekle
  hourlyData.value = generateHourlyData().map(d => ({
    ...d,
    siparis: Math.round(d.siparis * mult),
    ortalama: Math.round(d.ortalama * mult),
  }))

  // Durum dagilimi - proje filtresine gore filtrele
  const orders = generateOrders(200)
  const filtered = selectedProject.value === 'Tumu' ? orders : orders.filter(o => o.project === selectedProject.value)
  statusDist.value = generateStatusDistribution(filtered.length ? filtered : orders)

  // Aktivite akisini olustur (sube ismiyle)
  const brLabel = selectedBranch.value !== 'Tumu' ? selectedBranch.value : 'Kadikoy'
  activities.value = [
    { id: 1, type: 'order', title: 'Yeni siparis alindi', desc: `BRN-001247 - Ahmet Yilmaz - ${brLabel}`, time: new Date(Date.now() - 120000).toISOString() },
    { id: 2, type: 'delivery', title: 'Teslimat tamamlandi', desc: `BRN-001243 - Serkan Acar - ${brLabel}`, time: new Date(Date.now() - 300000).toISOString() },
    { id: 3, type: 'courier', title: 'Kurye online oldu', desc: `Murat Yildirim - ${brLabel}`, time: new Date(Date.now() - 900000).toISOString() },
    { id: 4, type: 'warning', title: 'SLA uyarisi', desc: `${Math.round(5 * mult)} siparis SLA limitine yaklasiyor`, time: new Date(Date.now() - 1800000).toISOString() },
    { id: 5, type: 'delivery', title: 'Teslimat tamamlandi', desc: `BRN-001240 - Hakan Tekin - ${brLabel}`, time: new Date(Date.now() - 3600000).toISOString() },
    { id: 6, type: 'cancel', title: 'Siparis iptal edildi', desc: 'BRN-001238 - Musteri talebi', time: new Date(Date.now() - 5400000).toISOString() },
    { id: 7, type: 'order', title: 'Toplu siparis yuklendi', desc: `${Math.round(25 * mult)} siparis - ${selectedProject.value === 'Tumu' ? 'E-Ticaret Lojistik' : selectedProject.value}`, time: new Date(Date.now() - 7200000).toISOString() },
    { id: 8, type: 'warning', title: 'Kurye GPS kaybi', desc: `Volkan Aslan - ${brLabel} - 10 dk dir sinyal yok`, time: new Date(Date.now() - 600000).toISOString() },
  ]
}

// ========== LIFECYCLE ==========

// Sayfa yuklendiginde verileri getir
onMounted(() => {
  loadDashboardData()
})

// Filtreler degistiginde verileri yeniden yukle
watch([selectedProject, selectedBranch, selectedDateStart, selectedDateEnd], () => {
  loadDashboardData()
})

// ========== AKTIVITE AKISI ==========

// Aktivite tipine gore ikon ve renk eslestirmesi
const activityIcons = {
  order: { bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-500', icon: Package },
  delivery: { bg: 'bg-green-50 dark:bg-green-900/30', color: 'text-green-500', icon: CheckCircle },
  courier: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-500', icon: Truck },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', color: 'text-yellow-500', icon: AlertTriangle },
  cancel: { bg: 'bg-red-50 dark:bg-red-900/30', color: 'text-red-500', icon: XCircle },
}

// Aktiviteye tiklaninca yonlendirilecek sayfa
const activityLink = (type) => {
  switch (type) {
    case 'order': return '/orders'
    case 'delivery': return '/tracking'
    case 'courier': return '/couriers'
    case 'warning': return '/analytics'
    case 'cancel': return '/orders'
    default: return '/orders'
  }
}

// ========== CHART VERILERI (vue-chartjs) ==========

// Haftalik siparis trendi - Line chart (bu hafta vs gecen hafta)
const weeklyChartData = computed(() => ({
  labels: weeklyData.value.map(d => d.name),
  datasets: [
    {
      label: 'Bu Hafta',
      data: weeklyData.value.map(d => d.buHafta),
      borderColor: '#6366f1',
      backgroundColor: '#6366f1',
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.4,
    },
    {
      label: 'Gecen Hafta',
      data: weeklyData.value.map(d => d.gecenHafta),
      borderColor: '#cbd5e1',
      backgroundColor: '#cbd5e1',
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.4,
    },
  ],
}))

const weeklyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12 } },
    },
    y: {
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: { font: { size: 12 } },
    },
  },
}

// Teslimat durumu dagilimi - Doughnut chart
const pieChartData = computed(() => {
  const sliced = statusDist.value.slice(0, 7)
  return {
    labels: sliced.map(s => ORDER_STATUSES[s.name]?.label || s.name),
    datasets: [
      {
        data: sliced.map(s => s.value),
        backgroundColor: sliced.map((_, i) => PIE_COLORS[i % PIE_COLORS.length]),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }
})

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
}

// Saatlik yogunluk - Bar chart
const hourlyChartData = computed(() => ({
  labels: hourlyData.value.map(d => d.name),
  datasets: [
    {
      label: 'Siparis',
      data: hourlyData.value.map(d => d.siparis),
      backgroundColor: '#6366f1',
      borderRadius: 4,
    },
    {
      label: 'Ortalama',
      data: hourlyData.value.map(d => d.ortalama),
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
    },
  ],
}))

const hourlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
    y: {
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: { font: { size: 12 } },
    },
  },
}
</script>

<template>
  <div v-if="!kpis" class="flex items-center justify-center h-64 text-slate-400">Yukleniyor...</div>
  <div v-else>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Genel bakis ve anlik metrikler</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 text-sm mr-4">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span class="text-slate-500 dark:text-slate-400">Canli</span>
        </div>
        <button
          @click="router.push('/orders/new')"
          class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <Plus :size="16" /> Yeni Siparis
        </button>
        <button
          @click="router.push('/routes/plan')"
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Route :size="16" /> Rota Olustur
        </button>
        <button
          @click="router.push('/analytics')"
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <FileText :size="16" /> Rapor Al
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 mb-6">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <FolderKanban :size="14" class="text-slate-400" />
          <select v-model="selectedProject" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option v-for="p in PROJECTS" :key="p" :value="p">{{ p === 'Tumu' ? 'Tum Projeler' : p }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <Building2 :size="14" class="text-slate-400" />
          <select v-model="selectedBranch" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option v-for="b in BRANCHES" :key="b" :value="b">{{ b === 'Tumu' ? 'Tum Subeler' : b }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <CalendarDays :size="14" class="text-slate-400" />
          <input type="date" v-model="selectedDateStart" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <span class="text-slate-400 text-xs">-</span>
          <input type="date" v-model="selectedDateEnd" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div v-if="selectedProject !== 'Tumu' || selectedBranch !== 'Tumu'" class="ml-auto">
          <button @click="selectedProject = 'Tumu'; selectedBranch = 'Tumu'; selectedDateStart = new Date().toISOString().split('T')[0]; selectedDateEnd = new Date().toISOString().split('T')[0]" class="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
            <XCircle :size="13" /> Filtreleri Temizle
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div @click="router.push('/orders')" class="cursor-pointer">
        <KpiCard title="Bugunku Siparis" :value="kpis.todayOrders.value" :change="kpis.todayOrders.change" :icon="Package" />
      </div>
      <div @click="router.push('/routes')" class="cursor-pointer">
        <KpiCard title="Aktif Rota" :value="kpis.activeRoutes.value" :change="kpis.activeRoutes.change" :icon="MapPin" />
      </div>
      <div @click="router.push('/couriers')" class="cursor-pointer">
        <KpiCard title="Online Kurye" :value="kpis.onlineCouriers.value" :change="kpis.onlineCouriers.change" :icon="Truck" :suffix="'/' + kpis.onlineCouriers.total" />
      </div>
      <div @click="router.push('/analytics')" class="cursor-pointer">
        <KpiCard title="Teslim Orani" :value="kpis.deliveryRate.value" :change="kpis.deliveryRate.change" :icon="CheckCircle" type="percent" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div @click="router.push('/tracking')" class="cursor-pointer">
        <KpiCard title="Ort. Teslim Suresi" :value="kpis.avgDeliveryTime.value" :change="kpis.avgDeliveryTime.change" :icon="Clock" suffix=" dk" />
      </div>
      <div @click="router.push('/finance')" class="cursor-pointer">
        <KpiCard title="Gunluk Gelir" :value="kpis.dailyRevenue.value" :change="kpis.dailyRevenue.change" :icon="Wallet" type="currency" />
      </div>
      <div @click="router.push('/orders')" class="cursor-pointer">
        <KpiCard title="Iptal Orani" :value="kpis.cancelRate.value" :change="kpis.cancelRate.change" :icon="XCircle" type="percent" />
      </div>
      <div @click="router.push('/analytics')" class="cursor-pointer">
        <KpiCard title="Musteri Puani" :value="kpis.customerRating.value" :change="kpis.customerRating.change" :icon="Star" suffix="/5" />
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Weekly Trend -->
      <div @click="router.push('/analytics')" class="bg-white rounded-xl p-5 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
        <h3 class="font-semibold text-slate-800 mb-4">Haftalik Siparis Trendi</h3>
        <div style="height: 280px">
          <Line :data="weeklyChartData" :options="weeklyChartOptions" />
        </div>
      </div>

      <!-- Status Distribution -->
      <div @click="router.push('/orders')" class="bg-white rounded-xl p-5 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
        <h3 class="font-semibold text-slate-800 mb-4">Teslimat Durumu Dagilimi</h3>
        <div style="height: 280px">
          <Doughnut :data="pieChartData" :options="pieChartOptions" />
        </div>
        <div class="flex flex-wrap gap-3 mt-2 justify-center">
          <div v-for="(s, i) in statusDist.slice(0, 5)" :key="s.name" class="flex items-center gap-1.5 text-xs">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: PIE_COLORS[i] }" />
            <span class="text-slate-600">{{ ORDER_STATUSES[s.name]?.label || s.name }}: {{ s.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Hourly Chart -->
      <div @click="router.push('/analytics')" class="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
        <h3 class="font-semibold text-slate-800 mb-4">Saatlik Yogunluk</h3>
        <div style="height: 280px">
          <Bar :data="hourlyChartData" :options="hourlyChartOptions" />
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="bg-white rounded-xl p-5 border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-4">Son Aktiviteler</h3>
        <div class="space-y-4 max-h-[300px] overflow-y-auto">
          <div v-for="a in activities" :key="a.id" @click="router.push(activityLink(a.type))" class="flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 -mx-2 px-2 py-1 rounded-lg transition-colors">
            <div
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                (activityIcons[a.type] || activityIcons.order).bg
              ]"
            >
              <component
                :is="(activityIcons[a.type] || activityIcons.order).icon"
                :size="14"
                :class="(activityIcons[a.type] || activityIcons.order).color"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700">{{ a.title }}</p>
              <p class="text-xs text-slate-500 truncate">{{ a.desc }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ timeAgo(a.time) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
