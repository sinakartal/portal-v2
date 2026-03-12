<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Nakit Risk Takip</h1>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span class="text-xs font-semibold text-red-700 dark:text-red-400">CANLI</span>
      </div>
    </div>

    <!-- High Risk Alert Banner (risk score > 70) -->
    <div v-if="!loading && highRiskCouriers.length > 0" class="mb-6 bg-red-50 dark:bg-red-900/15 border border-red-300 dark:border-red-800 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
          <AlertTriangle :size="20" class="text-red-600 dark:text-red-400" />
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-bold text-red-800 dark:text-red-300 mb-1">Yuksek Risk Uyarisi - {{ highRiskCouriers.length }} Kurye</h3>
          <p class="text-xs text-red-600 dark:text-red-400 mb-3">Asagidaki kuryelerin risk skoru 70'in uzerinde. Acil aksiyon alinmasi onerilir.</p>
          <div class="flex flex-wrap gap-2">
            <div v-for="c in highRiskCouriers" :key="c.id" class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 rounded-lg">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" :class="c.riskScore >= 90 ? 'bg-red-600 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'">
                {{ c.riskScore }}
              </div>
              <span class="text-xs font-medium text-slate-800 dark:text-white">{{ c.name }}</span>
              <span class="text-[10px] text-red-600 font-semibold">{{ fmt(c.cash) }}</span>
              <button @click="alertModal = c" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded cursor-pointer">
                <Phone :size="12" class="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk Level Cards -->
    <div class="grid grid-cols-4 gap-4 mb-3">
      <template v-if="loading">
        <div v-for="i in 4" :key="'rsk-sk-'+i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div class="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
          <div class="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
          <div class="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </template>
      <template v-else>
        <button
          v-for="r in RISK_LEVELS"
          :key="r.key"
          @click="selectedRisk = selectedRisk === r.key ? null : r.key"
          :class="['bg-white dark:bg-slate-900 rounded-xl border p-5 cursor-pointer transition-all text-left', selectedRisk === r.key ? `${r.border} ring-2 ring-offset-1` : 'border-slate-200 dark:border-slate-700 hover:border-slate-300']"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div :class="['w-3 h-3 rounded-full', r.color]" />
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ r.label }}</span>
            </div>
            <span class="text-[10px] text-slate-400">({{ r.range }})</span>
          </div>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ r.count }} <span class="text-sm font-normal text-slate-400">kurye</span></p>
          <p :class="['text-sm font-semibold mt-1', r.text]">{{ fmt(r.amount) }}</p>
        </button>
      </template>
    </div>
    <div class="text-center mb-6">
      <span class="text-sm text-slate-500 dark:text-slate-400">Toplam Sahada Nakit: </span>
      <span class="text-lg font-bold text-slate-800 dark:text-white">{{ fmt(totalFieldCash) }}</span>
    </div>

    <!-- Risk Score Gauges per Courier -->
    <div v-if="!loading" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Shield :size="16" /> Risk Skor Tablosu (0-100)</h3>
        <span class="text-[11px] text-slate-400">Her kurye icin nakit bazli risk degerlendirmesi</span>
      </div>
      <div class="grid grid-cols-5 gap-3">
        <div v-for="c in riskScoreCouriers" :key="c.id" :class="['relative rounded-xl border p-4 text-center transition-all', c.riskScore >= 70 ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : c.riskScore >= 40 ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/30 dark:bg-yellow-900/5' : 'border-slate-200 dark:border-slate-700']">
          <!-- Gauge -->
          <div class="relative w-16 h-16 mx-auto mb-2">
            <svg class="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke-width="5" class="stroke-slate-200 dark:stroke-slate-700" />
              <circle cx="32" cy="32" r="28" fill="none" stroke-width="5" stroke-linecap="round"
                :stroke-dasharray="`${c.riskScore * 1.76} 176`"
                :class="c.riskScore >= 70 ? 'stroke-red-500' : c.riskScore >= 40 ? 'stroke-yellow-500' : 'stroke-green-500'" />
            </svg>
            <span :class="['absolute inset-0 flex items-center justify-center text-sm font-bold', c.riskScore >= 70 ? 'text-red-600 dark:text-red-400' : c.riskScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400']">{{ c.riskScore }}</span>
          </div>
          <p class="text-xs font-medium text-slate-800 dark:text-white truncate">{{ c.name }}</p>
          <p class="text-[10px] text-slate-400">{{ fmt(c.cash) }}</p>
          <!-- Cash vs Expected comparison -->
          <div class="mt-2 space-y-1">
            <div class="flex justify-between text-[10px]">
              <span class="text-slate-400">Beklenen</span>
              <span class="text-slate-600 dark:text-slate-400">{{ fmt(c.expectedRevenue) }}</span>
            </div>
            <div class="flex justify-between text-[10px]">
              <span class="text-slate-400">Eldeki</span>
              <span :class="c.cashGap > c.gapThreshold ? 'text-red-600 font-semibold' : 'text-slate-600 dark:text-slate-400'">{{ fmt(c.cash) }}</span>
            </div>
            <div v-if="c.cashGap > c.gapThreshold" class="flex items-center justify-center gap-1 mt-1">
              <AlertTriangle :size="10" class="text-red-500" />
              <span class="text-[9px] font-bold text-red-600 dark:text-red-400">FARK: {{ fmt(c.cashGap) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Critical Couriers -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800 overflow-hidden mb-6">
      <div class="px-5 py-3 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
        <AlertTriangle :size="16" class="text-red-600" />
        <h3 class="text-sm font-bold text-red-800 dark:text-red-300">Kritik Kuryeler (>5K veya >3 saat)</h3>
      </div>
      <template v-if="loading">
        <div class="p-4 space-y-3">
          <div v-for="i in 4" :key="'crit-sk-'+i" class="flex items-center gap-4 py-2">
            <div class="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </template>
      <template v-else>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800">
              <th v-for="h in ['', 'Kurye', 'Nakit', 'Sure', 'Konum', 'Islem']" :key="h" class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in couriers" :key="c.id" :class="['border-b border-slate-50 dark:border-slate-800/50', c.cash >= 10000 ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-orange-50/30 dark:bg-orange-900/5']">
              <td class="px-4 py-2.5 text-center">{{ c.icon }}</td>
              <td class="px-4 py-2.5 font-medium text-slate-800 dark:text-white">{{ c.name }}</td>
              <td class="px-4 py-2.5 font-bold text-red-600">{{ fmt(c.cash) }}</td>
              <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">{{ c.duration }}</td>
              <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">{{ c.location }}</td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-1">
                  <button class="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer" title="Ara"><Phone :size="14" class="text-blue-600" /></button>
                  <button @click="alertModal = c" class="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg cursor-pointer" title="Uyari"><AlertTriangle :size="14" class="text-red-600" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button class="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-blue-100"><PhoneCall :size="13" /> Toplu Ara</button>
          <button class="flex items-center gap-1.5 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-purple-100"><Send :size="13" /> Toplu SMS</button>
          <button class="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-emerald-100"><MapPin :size="13" /> Haritada Gor</button>
        </div>
      </template>
    </div>

    <!-- Map + Chart row -->
    <div class="grid grid-cols-2 gap-5 mb-6">
      <!-- Simulated Map -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <MapPin :size="14" class="text-slate-400" />
          <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Nakit Tasima Haritasi</span>
        </div>
        <template v-if="loading">
          <div class="h-72 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <div class="text-center">
              <div class="w-10 h-10 mx-auto mb-2 border-2 border-slate-300 dark:border-slate-600 border-t-primary rounded-full animate-spin" />
              <span class="text-xs text-slate-400">Harita yukleniyor...</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="relative h-72 bg-slate-100 dark:bg-slate-800">
            <!-- Grid -->
            <svg class="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
              <line v-for="i in 7" :key="'h'+i" x1="0" :y1="`${(i) * 12.5}%`" x2="100%" :y2="`${(i) * 12.5}%`" stroke="currentColor" stroke-width="0.5" class="text-slate-400" />
              <line v-for="i in 9" :key="'v'+i" :x1="`${(i) * 10}%`" y1="0" :x2="`${(i) * 10}%`" y2="100%" stroke="currentColor" stroke-width="0.5" class="text-slate-400" />
            </svg>

            <!-- Heat zones -->
            <div class="absolute w-32 h-32 rounded-full bg-red-400/15 blur-xl" :style="{ left: '25%', top: '30%' }" />
            <div class="absolute w-24 h-24 rounded-full bg-yellow-400/15 blur-xl" :style="{ left: '55%', top: '50%' }" />
            <div class="absolute w-20 h-20 rounded-full bg-orange-400/10 blur-xl" :style="{ left: '70%', top: '25%' }" />

            <!-- Courier dots -->
            <div
              v-for="c in MAP_COURIERS"
              :key="c.id"
              :class="['absolute rounded-full', colorMap[c.risk], sizeMap[c.risk], c.risk === 'critical' ? 'animate-pulse' : '']"
              :style="{ left: `${c.x}%`, top: `${c.y}%` }"
              :title="fmt(c.cash)"
            />

            <!-- Legend -->
            <div class="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <div v-for="l in mapLegend" :key="l.label" class="flex items-center gap-1.5">
                <div :class="['w-2 h-2 rounded-full', l.color]" />
                <span class="text-[10px] text-slate-600 dark:text-slate-400">{{ l.label }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Hourly Chart -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Saatlik Tahsilat vs Teslim</span>
        </div>
        <template v-if="loading">
          <div class="p-4 h-72 flex items-center justify-center">
            <div class="text-center">
              <div class="w-10 h-10 mx-auto mb-2 border-2 border-slate-300 dark:border-slate-600 border-t-primary rounded-full animate-spin" />
              <span class="text-xs text-slate-400">Grafik yukleniyor...</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="p-4 h-72">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
        </template>
      </div>
    </div>

    <!-- Alert Settings -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Bell :size="16" /> Otomatik Uyarilar</h3>
      <template v-if="loading">
        <div class="space-y-2.5">
          <div v-for="i in 5" :key="'alert-sk-'+i" class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div class="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="space-y-2.5">
          <label v-for="(a, i) in alerts" :key="i" class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <input type="checkbox" :checked="a.checked" @change="alerts[i] = { ...a, checked: !a.checked }" class="accent-primary" />
            <span class="text-sm text-slate-700 dark:text-slate-300">{{ a.text }}</span>
          </label>
        </div>
      </template>
    </div>

    <!-- Alert Modal -->
    <div v-if="alertModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="alertModal = null" />
      <div class="relative w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        <div class="px-6 py-4 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-t-2xl flex items-center gap-2">
          <AlertTriangle :size="18" class="text-red-600" />
          <h3 class="font-bold text-red-800 dark:text-red-300">Nakit Limit Uyarisi</h3>
          <button @click="alertModal = null" class="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg cursor-pointer"><X :size="16" class="text-red-500" /></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-slate-500">Kurye:</span><span class="font-semibold text-slate-800 dark:text-white">{{ alertModal.name }}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Nakit:</span><span class="font-bold text-red-600">{{ fmt(alertModal.cash) }} <span class="text-xs text-slate-400">(Limit: 10,000)</span></span></div>
            <div class="flex justify-between"><span class="text-slate-500">Sure:</span><span class="text-slate-700 dark:text-slate-300">{{ alertModal.duration }}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Konum:</span><span class="text-slate-700 dark:text-slate-300">{{ alertModal.location }}</span></div>
          </div>

          <div>
            <p class="text-xs font-semibold text-slate-500 mb-2 uppercase">Son Tahsilatlar</p>
            <div class="space-y-1.5">
              <div v-for="(t, i) in recentTransactions" :key="i" class="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 dark:bg-slate-800 rounded">
                <span class="font-mono text-slate-600 dark:text-slate-400">{{ t.order }}</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{ fmt(t.amount) }}</span>
                <span class="text-slate-400">{{ t.time }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-blue-100"><Phone :size="14" /> Kuryeyi Ara</button>
            <button class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-purple-100"><MessageSquare :size="14" /> SMS Gonder</button>
            <button class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-emerald-100"><MapPin :size="14" /> Konum</button>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <button @click="alertModal = null" class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Daha Sonra Hatirlat</button>
          <button @click="alertModal = null" class="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><Eye :size="16" /> Kontrol Et</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  AlertTriangle, Phone, MessageSquare, MapPin, X, Shield,
  Bell, Eye, PhoneCall, Send, Radio
} from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip as ChartTooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend)

const fmt = (n) => '\u20BA' + n.toLocaleString('tr-TR')

// ========== LOADING STATE ==========
const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1200)
})

function seed(i) { return ((i * 6701 + 51297) % 173280) / 173280 }

const RISK_LEVELS = [
  { key: 'normal', label: 'NORMAL', range: '<3K', color: 'bg-green-500', border: 'border-green-200 dark:border-green-800', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', count: 98, amount: 45200 },
  { key: 'attention', label: 'DIKKAT', range: '3K-5K', color: 'bg-yellow-500', border: 'border-yellow-200 dark:border-yellow-800', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', count: 28, amount: 98400 },
  { key: 'risky', label: 'RISKLI', range: '5K-10K', color: 'bg-red-500', border: 'border-red-200 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', count: 12, amount: 78600 },
  { key: 'critical', label: 'KRITIK', range: '>10K', color: 'bg-red-700', border: 'border-red-300 dark:border-red-700', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', count: 4, amount: 52300 },
]

const CRITICAL_COURIERS_INIT = [
  { id: 1, name: 'Mehmet Y.', cash: 15200, duration: '4s 15dk', location: 'Kadikoy', lat: 40.99, lng: 29.03, icon: '!!' },
  { id: 2, name: 'Ayse D.', cash: 12400, duration: '3s 45dk', location: 'Besiktas', lat: 41.04, lng: 29.00, icon: '!!' },
  { id: 3, name: 'Can O.', cash: 10800, duration: '2s 30dk', location: 'Sisli', lat: 41.06, lng: 28.98, icon: '!!' },
  { id: 4, name: 'Veli A.', cash: 8450, duration: '3s 20dk', location: 'Uskudar', lat: 41.02, lng: 29.02, icon: '!' },
  { id: 5, name: 'Hasan M.', cash: 7200, duration: '2s 50dk', location: 'Atasehir', lat: 41.00, lng: 29.10, icon: '!' },
  { id: 6, name: 'Emre K.', cash: 6100, duration: '1s 45dk', location: 'Maltepe', lat: 40.93, lng: 29.13, icon: '!' },
]

const HOURLY_DATA = [
  { hour: '09:00', tahsilat: 8200, teslim: 2100 },
  { hour: '10:00', tahsilat: 15400, teslim: 5200 },
  { hour: '11:00', tahsilat: 22100, teslim: 12400 },
  { hour: '12:00', tahsilat: 18700, teslim: 15800 },
  { hour: '13:00', tahsilat: 25300, teslim: 18200 },
  { hour: '14:00', tahsilat: 28900, teslim: 22500 },
  { hour: '15:00', tahsilat: 21600, teslim: 19800 },
  { hour: '16:00', tahsilat: 16400, teslim: 14200 },
  { hour: '17:00', tahsilat: 12300, teslim: 9800 },
  { hour: '18:00', tahsilat: 8100, teslim: 6500 },
  { hour: '19:00', tahsilat: 4200, teslim: 3200 },
  { hour: '20:00', tahsilat: 2800, teslim: 1800 },
]

const MAP_COURIERS = Array.from({ length: 30 }, (_, i) => {
  const cash = Math.floor(seed(i) * 16000)
  const risk = cash >= 10000 ? 'critical' : cash >= 5000 ? 'risky' : cash >= 3000 ? 'attention' : 'normal'
  return {
    id: i + 1,
    x: 10 + seed(i + 1) * 80,
    y: 10 + seed(i + 2) * 80,
    risk,
    cash,
  }
})

const ALERTS_CONFIG = [
  { text: '5,000 asiminda operatore bildirim', checked: true },
  { text: '10,000 asiminda yoneticiye SMS', checked: true },
  { text: '3 saat nakit tasimada kuryeye hatirlatma', checked: true },
  { text: '4 saat nakit tasimada operatore uyari', checked: true },
  { text: 'GPS kaybinda aninda alarm', checked: true },
]

const selectedRisk = ref(null)
const alertModal = ref(null)
const couriers = ref([...CRITICAL_COURIERS_INIT])
const alerts = ref([...ALERTS_CONFIG])
const liveTick = ref(0)

let timer = null

onMounted(() => {
  timer = setInterval(() => {
    couriers.value = couriers.value.map(c => ({
      ...c,
      cash: c.cash + Math.floor((Math.random() - 0.3) * 500),
    }))
    liveTick.value++
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const totalFieldCash = RISK_LEVELS.reduce((s, r) => s + r.amount, 0)

// ========== RISK SCORE GAUGES ==========

const COURIER_NAMES_FOR_GAUGE = [
  'Mehmet Y.', 'Ayse D.', 'Can O.', 'Veli A.', 'Hasan M.',
  'Emre K.', 'Ali R.', 'Zeynep T.', 'Burak C.', 'Fatma S.',
  'Derya A.', 'Oguz K.', 'Selin B.', 'Kemal U.', 'Nurgul S.',
]

const riskScoreCouriers = computed(() => {
  return COURIER_NAMES_FOR_GAUGE.map((name, i) => {
    const cash = Math.floor(seed(i + 50) * 16000)
    const expectedRevenue = Math.floor(seed(i + 60) * 12000) + 2000
    const cashGap = Math.abs(cash - expectedRevenue)
    const gapThreshold = 3000
    // Risk score: normalize cash level + time factor + gap factor
    const cashFactor = Math.min(cash / 15000, 1) * 50
    const gapFactor = cashGap > gapThreshold ? Math.min((cashGap - gapThreshold) / 5000, 1) * 30 : 0
    const timeFactor = seed(i + 70) * 20
    const riskScore = Math.min(100, Math.round(cashFactor + gapFactor + timeFactor))
    return {
      id: i + 1,
      name,
      cash,
      expectedRevenue,
      cashGap,
      gapThreshold,
      riskScore,
    }
  })
})

// High risk couriers for the alert banner (risk score > 70)
const highRiskCouriers = computed(() => {
  return riskScoreCouriers.value
    .filter(c => c.riskScore > 70)
    .sort((a, b) => b.riskScore - a.riskScore)
})

const colorMap = { normal: 'bg-green-500', attention: 'bg-yellow-500', risky: 'bg-red-500', critical: 'bg-red-700' }
const sizeMap = { normal: 'w-2 h-2', attention: 'w-2.5 h-2.5', risky: 'w-3 h-3', critical: 'w-3.5 h-3.5' }

const mapLegend = [
  { color: 'bg-green-500', label: 'Normal' },
  { color: 'bg-yellow-500', label: 'Dikkat' },
  { color: 'bg-red-500', label: 'Riskli' },
  { color: 'bg-red-700', label: 'Kritik' },
]

const recentTransactions = [
  { order: '#4521', amount: 2450, time: '12:15' },
  { order: '#4522', amount: 3200, time: '12:45' },
  { order: '#4523', amount: 4100, time: '13:30' },
  { order: '#4524', amount: 5450, time: '14:15' },
]

const chartData = {
  labels: HOURLY_DATA.map(d => d.hour),
  datasets: [
    {
      label: 'Tahsilat',
      data: HOURLY_DATA.map(d => d.tahsilat),
      backgroundColor: '#3b82f6',
      borderRadius: { topLeft: 3, topRight: 3 },
    },
    {
      label: 'Teslim',
      data: HOURLY_DATA.map(d => d.teslim),
      backgroundColor: '#10b981',
      borderRadius: { topLeft: 3, topRight: 3 },
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { size: 11 },
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${fmt(context.raw)}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { font: { size: 10 }, color: '#94a3b8' },
      grid: { display: false },
    },
    y: {
      ticks: {
        font: { size: 10 },
        color: '#94a3b8',
        callback: (v) => `\u20BA${(v / 1000).toFixed(0)}K`,
      },
      grid: { color: '#e2e8f0', drawBorder: false },
    },
  },
}
</script>
