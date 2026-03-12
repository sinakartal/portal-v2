<template>
  <!-- Skeleton Loading State -->
  <div v-if="loading" class="space-y-6 animate-pulse">
    <div class="flex items-center gap-4">
      <div class="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      <div class="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      <div class="space-y-2">
        <div class="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
    <div class="flex gap-4 border-b border-slate-200 dark:border-slate-700 pb-3">
      <div v-for="n in 4" :key="n" class="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="n in 4" :key="n" class="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
    </div>
  </div>

  <!-- No Data -->
  <div v-else-if="!courier" class="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
    Kurye bulunamadi.
  </div>

  <!-- Main Content -->
  <div v-else>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.push('/couriers')" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft :size="20" class="text-slate-600 dark:text-slate-300" />
        </button>
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <Truck :size="24" class="text-primary" />
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ courier.name }}</h1>
              <span class="px-2.5 py-1 rounded-full text-xs font-medium" :style="{ backgroundColor: status.bg, color: status.color }">
                {{ status.label }}
              </span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
              <span class="flex items-center gap-1"><Phone :size="12" /> {{ courier.phone }}</span>
              <span class="flex items-center gap-1"><MapPin :size="12" /> {{ courier.region }}</span>
              <span class="flex items-center gap-1"><Star :size="12" class="text-amber-400" fill="currentColor" /> {{ courier.customerRating }}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
          <Phone :size="14" /> Ara
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <Edit2 :size="14" /> Duzenle
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200 dark:border-slate-700 mb-6">
      <div class="flex gap-0">
        <button
          v-for="tab in computedTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- General Tab -->
    <div v-if="activeTab === 'general'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Personal Info -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 class="font-semibold text-slate-800 dark:text-slate-100 mb-4">Kisisel Bilgiler</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Ad Soyad</span>
            <span class="text-slate-800 dark:text-slate-100 font-medium">{{ courier.name }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Telefon</span>
            <span class="text-slate-800 dark:text-slate-100">{{ courier.phone }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">E-posta</span>
            <span class="text-slate-800 dark:text-slate-100">{{ courier.email }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">TC Kimlik No</span>
            <span class="text-slate-800 dark:text-slate-100">{{ courier.tcNo }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Dogum Tarihi</span>
            <span class="text-slate-800 dark:text-slate-100">{{ formatDate(courier.birthDate) }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Adres</span>
            <span class="text-slate-800 dark:text-slate-100 text-right max-w-[250px]">{{ courier.address }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-slate-500 dark:text-slate-400">Kayit Tarihi</span>
            <span class="text-slate-800 dark:text-slate-100">{{ formatDate(courier.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Vehicle Info -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 class="font-semibold text-slate-800 dark:text-slate-100 mb-4">Arac Bilgileri</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Arac Tipi</span>
            <span class="text-slate-800 dark:text-slate-100 font-medium">{{ courier.vehicle.type }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Plaka</span>
            <span class="text-slate-800 dark:text-slate-100">{{ courier.vehicle.plate }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Marka/Model</span>
            <span class="text-slate-800 dark:text-slate-100">{{ courier.vehicle.brand }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Yil</span>
            <span class="text-slate-800 dark:text-slate-100">{{ courier.vehicle.year }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-slate-500 dark:text-slate-400">Renk</span>
            <span class="text-slate-800 dark:text-slate-100">{{ courier.vehicle.color }}</span>
          </div>
        </div>
      </div>

      <!-- Region Info -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 class="font-semibold text-slate-800 dark:text-slate-100 mb-4">Bolge Bilgileri</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Ana Bolge</span>
            <span class="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{{ courier.region }}</span>
          </div>
          <div class="py-2">
            <span class="text-slate-500 dark:text-slate-400 block mb-2">Ek Bolgeler</span>
            <div class="flex flex-wrap gap-2">
              <span v-for="r in courier.secondaryRegions" :key="r" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">{{ r }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank & Documents -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 class="font-semibold text-slate-800 dark:text-slate-100 mb-4">Banka ve Evraklar</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Banka</span>
            <span class="text-slate-800 dark:text-slate-100">{{ courier.bankInfo.bankName }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">IBAN</span>
            <span class="text-slate-800 dark:text-slate-100 text-xs">{{ courier.bankInfo.iban }}</span>
          </div>

          <!-- Evrak Durumu - Horizontal Progress Tracker -->
          <div class="pt-2">
            <span class="text-slate-500 dark:text-slate-400 block mb-4">Evrak Durumu</span>
            <div class="flex items-center gap-0 overflow-x-auto pb-2">
              <template v-for="(doc, idx) in documentList" :key="doc.key">
                <!-- Step -->
                <div class="flex flex-col items-center min-w-[80px]">
                  <div
                    :class="[
                      'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors',
                      courier.documents[doc.key]
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-600 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-500 dark:text-red-400'
                    ]"
                  >
                    <CheckCircle v-if="courier.documents[doc.key]" :size="16" />
                    <XCircle v-else :size="16" />
                  </div>
                  <span class="text-xs text-slate-600 dark:text-slate-400 mt-1.5 text-center leading-tight">{{ doc.label }}</span>
                  <button
                    v-if="!courier.documents[doc.key]"
                    @click="handleDocUpload(doc.key)"
                    class="mt-1 text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    Yukle
                  </button>
                </div>
                <!-- Connector line -->
                <div
                  v-if="idx < documentList.length - 1"
                  :class="[
                    'h-0.5 flex-1 min-w-[16px] mt-[-18px]',
                    courier.documents[doc.key] && courier.documents[documentList[idx + 1]?.key]
                      ? 'bg-green-400 dark:bg-green-600'
                      : 'bg-slate-200 dark:bg-slate-600'
                  ]"
                ></div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Tab -->
    <div v-if="activeTab === 'performance'">
      <!-- Score Gauge and KPIs -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Score Gauge -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
          <h3 class="font-semibold text-slate-800 dark:text-slate-100 mb-4">Performans Skoru</h3>
          <div class="relative w-40 h-40">
            <svg class="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" class="text-slate-100 dark:text-slate-700" stroke-width="12" />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                :class="scoreTrackColor"
                stroke-width="12"
                stroke-linecap="round"
                :stroke-dasharray="`${2 * Math.PI * 70 * courier.performanceScore / 100} ${2 * Math.PI * 70}`"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span :class="['text-4xl font-bold', scoreColor]">{{ courier.performanceScore }}</span>
              <span class="text-xs text-slate-400 dark:text-slate-500 mt-1">/ 100</span>
            </div>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-3">
            {{ performanceLabel }}
          </p>
          <!-- Gauge Delta -->
          <div class="mt-2 flex items-center gap-1.5">
            <TrendingUp v-if="scoreDelta >= 0" :size="14" class="text-green-500" />
            <TrendingDown v-else :size="14" class="text-red-500" />
            <span
              :class="[
                'text-sm font-medium',
                scoreDelta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              ]"
            >
              Gecen Aya Gore: {{ scoreDelta >= 0 ? '+' : '' }}{{ scoreDelta }} puan
            </span>
          </div>
        </div>

        <!-- Delivery KPIs -->
        <div class="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="(kpi, idx) in kpiList" :key="idx" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
            <div class="flex items-center gap-2 mb-2">
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', kpi.color]">
                <component :is="kpi.icon" :size="16" />
              </div>
            </div>
            <p class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ kpi.value }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ kpi.label }}</p>
          </div>
        </div>
      </div>

      <!-- Earnings -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 class="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Award :size="18" class="text-slate-500 dark:text-slate-400" /> Kazanc Ozeti
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(courier.earnings.today) }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Bugun</p>
          </div>
          <div class="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(courier.earnings.week) }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Bu Hafta</p>
          </div>
          <div class="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(courier.earnings.month) }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Bu Ay</p>
          </div>
          <div class="text-center p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
            <p class="text-lg font-bold text-primary">{{ formatCurrency(courier.earnings.total) }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Toplam</p>
          </div>
        </div>

        <!-- Earnings Bar Chart -->
        <div class="mt-2">
          <h4 class="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">Haftalik Kazanc Grafigi</h4>
          <div class="h-64">
            <Bar :data="earningsChartData" :options="earningsChartOptions" />
          </div>
        </div>
      </div>
    </div>

    <!-- Delivery History Tab -->
    <div v-if="activeTab === 'history'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <!-- Period Filters -->
      <div class="flex items-center gap-2 px-4 pt-4 pb-2">
        <button
          v-for="pf in periodFilters"
          :key="pf.id"
          @click="historyPeriod = pf.id"
          :class="[
            'px-4 py-1.5 text-sm rounded-full font-medium transition-colors cursor-pointer',
            historyPeriod === pf.id
              ? 'bg-primary text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          ]"
        >
          {{ pf.label }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-600">
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Siparis No</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Musteri</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Bolge</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Durum</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Sure</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Tutar</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Puan</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Tarih</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="delivery in filteredHistory"
              :key="delivery._id"
              class="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
            >
              <td class="px-4 py-3 font-medium text-primary cursor-pointer" @click="router.push(`/orders/${delivery._id}`)">
                {{ delivery.orderNumber }}
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ delivery.customer }}</td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ delivery.address }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :style="{ backgroundColor: getDeliveryStatus(delivery).bg, color: getDeliveryStatus(delivery).color }"
                >
                  {{ getDeliveryStatus(delivery).label }}
                </span>
              </td>
              <td class="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{{ delivery.deliveryTime }} dk</td>
              <td class="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">{{ formatCurrency(delivery.amount) }}</td>
              <td class="px-4 py-3 text-center">
                <div v-if="delivery.rating" class="flex items-center justify-center gap-1">
                  <Star :size="12" class="text-amber-400" fill="currentColor" />
                  <span class="text-slate-700 dark:text-slate-300">{{ delivery.rating }}</span>
                </div>
                <span v-else class="text-slate-400 dark:text-slate-500">-</span>
              </td>
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ formatDateTime(delivery.completedAt) }}</td>
            </tr>
          </tbody>
          <!-- Summary Row -->
          <tfoot>
            <tr class="bg-slate-50 dark:bg-slate-700/50 border-t-2 border-slate-200 dark:border-slate-600 font-semibold">
              <td class="px-4 py-3 text-slate-700 dark:text-slate-200" colspan="4">
                Toplam: {{ filteredHistory.length }} teslimat
              </td>
              <td class="px-4 py-3 text-center text-slate-700 dark:text-slate-200">
                {{ filteredHistory.length ? Math.round(filteredHistory.reduce((s, d) => s + d.deliveryTime, 0) / filteredHistory.length) : 0 }} dk ort.
              </td>
              <td class="px-4 py-3 text-right text-slate-800 dark:text-slate-100">
                {{ formatCurrency(filteredHistory.reduce((s, d) => s + d.amount, 0)) }}
              </td>
              <td class="px-4 py-3 text-center text-slate-700 dark:text-slate-200">
                {{ averageRating }}
              </td>
              <td class="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Active Orders Tab -->
    <div v-if="activeTab === 'active'" class="space-y-4">
      <div v-if="activeOrders.length === 0" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-12 text-center">
        <Package :size="40" class="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p class="text-slate-500 dark:text-slate-400">Aktif siparis bulunmuyor.</p>
      </div>
      <div
        v-for="order in activeOrders"
        :key="order._id"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer"
        @click="router.push(`/orders/${order._id}`)"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Package :size="18" class="text-blue-500" />
          </div>
          <div>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ order.orderNumber }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ order.customer }} - {{ order.address }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span
            class="px-2.5 py-1 rounded-full text-xs font-medium"
            :style="{ backgroundColor: getDeliveryStatus(order).bg, color: getDeliveryStatus(order).color }"
          >
            {{ getDeliveryStatus(order).label }}
          </span>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ formatCurrency(order.amount) }}</span>
          <ChevronRight :size="16" class="text-slate-400" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Truck, Phone, MapPin, Star, Calendar, Clock, Package,
  CheckCircle, XCircle, TrendingUp, TrendingDown, Award, Target, ThumbsUp,
  Edit2, Ban, Mail, AlertTriangle, ChevronRight, Upload
} from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { getCouriers } from '@/services/api'
import { COURIER_STATUSES, ORDER_STATUSES } from '@/constants/menu'
import { formatNumber, formatDate, formatDateTime, formatCurrency } from '@/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  courierId: String
})

const router = useRouter()
const activeTab = ref('general')
const courier = ref(null)
const deliveryHistory = ref([])
const activeOrders = ref([])
const loading = ref(true)
const error = ref(null)
const historyPeriod = ref('all')

// Score delta mock (difference from last month)
const scoreDelta = ref(3)

const baseTabs = [
  { id: 'general', label: 'Genel Bilgiler' },
  { id: 'performance', label: 'Performans' },
  { id: 'history', label: 'Teslimat Gecmisi' },
]

const periodFilters = [
  { id: 'week', label: 'Bu Hafta' },
  { id: 'month', label: 'Bu Ay' },
  { id: 'all', label: 'Tumu' },
]

const computedTabs = computed(() => {
  const tabs = [...baseTabs]
  if (courier.value && (courier.value.status === 'active' || courier.value.status === 'delivering')) {
    tabs.push({ id: 'active', label: `Aktif Siparisler (${activeOrders.value.length})` })
  }
  return tabs
})

const documentList = [
  { key: 'idCard', label: 'Kimlik' },
  { key: 'driverLicense', label: 'Ehliyet' },
  { key: 'vehicleRegistration', label: 'Ruhsat' },
  { key: 'criminalRecord', label: 'Sabika Kaydi' },
  { key: 'sgk', label: 'SGK' },
]

// Weekly earnings mock data for chart
const weeklyEarnings = ref([
  { week: '4 Hafta Once', amount: 1850 },
  { week: '3 Hafta Once', amount: 2100 },
  { week: '2 Hafta Once', amount: 1960 },
  { week: 'Bu Hafta', amount: 2340 },
])

const earningsChartData = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    labels: weeklyEarnings.value.map(w => w.week),
    datasets: [
      {
        label: 'Kazanc (TL)',
        data: weeklyEarnings.value.map(w => w.amount),
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.7)' : 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      }
    ]
  }
})

const earningsChartOptions = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 0.8)'
  const textColor = isDark ? '#94a3b8' : '#64748b'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${formatCurrency(ctx.raw)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor, callback: (v) => `${v} TL` }
      },
      x: {
        grid: { display: false },
        ticks: { color: textColor }
      }
    }
  }
})

// Filtered delivery history based on period
const filteredHistory = computed(() => {
  const now = new Date()
  if (historyPeriod.value === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 3600000)
    return deliveryHistory.value.filter(d => new Date(d.completedAt) >= weekAgo)
  }
  if (historyPeriod.value === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 3600000)
    return deliveryHistory.value.filter(d => new Date(d.completedAt) >= monthAgo)
  }
  return deliveryHistory.value
})

const averageRating = computed(() => {
  const rated = filteredHistory.value.filter(d => d.rating)
  if (!rated.length) return '-'
  const avg = rated.reduce((s, d) => s + parseFloat(d.rating), 0) / rated.length
  return avg.toFixed(1)
})

onMounted(async () => {
  loading.value = true
  error.value = null

  // Try API first
  try {
    const res = await getCouriers()
    if (res.ok) {
      const couriers = Array.isArray(res.data) ? res.data : res.data?.couriers || []
      const found = couriers.find(c => c._id === props.courierId || c.id === props.courierId)
      if (found) {
        courier.value = found
        loading.value = false
        return
      }
    }
  } catch (err) {
    console.warn('[CourierDetail] API hatasi, mock veriye donuluyor:', err.message)
  }

  // Fallback to mock data
  const mockCourier = {
    _id: props.courierId,
    name: 'Serkan Acar',
    phone: '0535 234 5678',
    email: 'serkan.acar@email.com',
    tcNo: '12345678901',
    birthDate: '1992-05-15',
    status: 'active',
    vehicle: {
      type: 'Motosiklet',
      plate: '34 AB 1234',
      brand: 'Honda PCX',
      year: 2023,
      color: 'Siyah',
    },
    region: 'Kadikoy',
    secondaryRegions: ['Uskudar', 'Atasehir', 'Maltepe'],
    address: 'Caferaga Mah. Moda Cad. No:45 D:3 Kadikoy/Istanbul',
    bankInfo: {
      bankName: 'Ziraat Bankasi',
      iban: 'TR12 0001 0012 3456 7890 1234 56',
    },
    documents: {
      idCard: true,
      driverLicense: true,
      vehicleRegistration: true,
      criminalRecord: false,
      sgk: true,
    },
    performanceScore: 92,
    totalDeliveries: 1847,
    todayDeliveries: 14,
    weekDeliveries: 78,
    monthDeliveries: 312,
    onTimeRate: 96.2,
    successRate: 98.1,
    averageDeliveryTime: 28,
    customerRating: 4.7,
    totalRatings: 423,
    cancelRate: 1.2,
    complaints: 3,
    earnings: {
      today: 420,
      week: 2340,
      month: 9360,
      total: 84240,
    },
    lastActive: new Date(Date.now() - 300000).toISOString(),
    createdAt: '2025-03-15T10:00:00Z',
  }
  courier.value = mockCourier

  // Mock score delta
  scoreDelta.value = 3

  // Mock weekly earnings
  weeklyEarnings.value = [
    { week: '4 Hafta Once', amount: 1850 },
    { week: '3 Hafta Once', amount: 2100 },
    { week: '2 Hafta Once', amount: 1960 },
    { week: 'Bu Hafta', amount: 2340 },
  ]

  const history = Array.from({ length: 30 }, (_, i) => ({
    _id: `del-${i}`,
    orderNumber: `BRN-${String(1200 + i).padStart(6, '0')}`,
    customer: ['Ahmet Yilmaz', 'Mehmet Kaya', 'Fatma Demir', 'Ayse Celik', 'Ali Sahin'][i % 5],
    address: ['Kadikoy', 'Uskudar', 'Atasehir', 'Maltepe', 'Besiktas'][i % 5],
    status: i < 25 ? 'delivered' : i < 28 ? 'in_transit' : 'failed_delivery',
    deliveryTime: Math.floor(Math.random() * 20) + 15,
    amount: Math.floor(Math.random() * 500) + 100,
    rating: i < 25 ? (Math.random() * 1.5 + 3.5).toFixed(1) : null,
    completedAt: new Date(Date.now() - i * 3600000 * 2).toISOString(),
  }))
  deliveryHistory.value = history

  // Mock active orders (for active/delivering couriers)
  activeOrders.value = [
    {
      _id: 'active-1',
      orderNumber: 'BRN-001245',
      customer: 'Zeynep Koc',
      address: 'Kadikoy',
      status: 'in_transit',
      amount: 245,
    },
    {
      _id: 'active-2',
      orderNumber: 'BRN-001246',
      customer: 'Burak Yildiz',
      address: 'Uskudar',
      status: 'picked_up',
      amount: 180,
    },
    {
      _id: 'active-3',
      orderNumber: 'BRN-001247',
      customer: 'Selin Arslan',
      address: 'Atasehir',
      status: 'assigned',
      amount: 320,
    },
  ]

  loading.value = false
})

const status = computed(() => {
  if (!courier.value) return { label: '', color: '#6b7280', bg: '#f3f4f6' }
  return COURIER_STATUSES[courier.value.status] || { label: courier.value.status, color: '#6b7280', bg: '#f3f4f6' }
})

const scoreColor = computed(() => {
  if (!courier.value) return ''
  if (courier.value.performanceScore >= 90) return 'text-green-500'
  if (courier.value.performanceScore >= 75) return 'text-blue-500'
  if (courier.value.performanceScore >= 60) return 'text-amber-500'
  return 'text-red-500'
})

const scoreTrackColor = computed(() => {
  if (!courier.value) return ''
  if (courier.value.performanceScore >= 90) return 'stroke-green-500'
  if (courier.value.performanceScore >= 75) return 'stroke-blue-500'
  if (courier.value.performanceScore >= 60) return 'stroke-amber-500'
  return 'stroke-red-500'
})

const performanceLabel = computed(() => {
  if (!courier.value) return ''
  if (courier.value.performanceScore >= 90) return 'Mukemmel Performans'
  if (courier.value.performanceScore >= 75) return 'Iyi Performans'
  if (courier.value.performanceScore >= 60) return 'Ortalama Performans'
  return 'Gelistirilmeli'
})

const kpiList = computed(() => {
  if (!courier.value) return []
  return [
    { label: 'Toplam Teslimat', value: formatNumber(courier.value.totalDeliveries), icon: Package, color: 'bg-blue-50 text-blue-500 dark:bg-blue-900/30' },
    { label: 'Bugun', value: courier.value.todayDeliveries, icon: Target, color: 'bg-green-50 text-green-500 dark:bg-green-900/30' },
    { label: 'Bu Hafta', value: courier.value.weekDeliveries, icon: TrendingUp, color: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30' },
    { label: 'Bu Ay', value: courier.value.monthDeliveries, icon: Calendar, color: 'bg-purple-50 text-purple-500 dark:bg-purple-900/30' },
    { label: 'Zamaninda Teslimat', value: `%${courier.value.onTimeRate}`, icon: Clock, color: 'bg-teal-50 text-teal-500 dark:bg-teal-900/30' },
    { label: 'Basari Orani', value: `%${courier.value.successRate}`, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30' },
    { label: 'Ort. Teslimat Suresi', value: `${courier.value.averageDeliveryTime} dk`, icon: Clock, color: 'bg-amber-50 text-amber-500 dark:bg-amber-900/30' },
    { label: 'Musteri Puani', value: `${courier.value.customerRating}/5`, icon: Star, color: 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900/30' },
    { label: 'Iptal Orani', value: `%${courier.value.cancelRate}`, icon: XCircle, color: 'bg-red-50 text-red-500 dark:bg-red-900/30' },
  ]
})

function getDeliveryStatus(delivery) {
  return ORDER_STATUSES[delivery.status] || { label: delivery.status, color: '#6b7280', bg: '#f3f4f6' }
}

function handleDocUpload(docKey) {
  // Placeholder for document upload logic
  console.log(`[CourierDetail] Evrak yukleme baslatiyor: ${docKey}`)
  alert(`${docKey} icin evrak yukleme acilacak`)
}
</script>
