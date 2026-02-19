<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Package class="w-7 h-7 text-slate-700" />
        Havuz Siparisleri
      </h1>
      <p class="text-slate-500 mt-1 text-sm">
        Aktif havuz siparislerini takip edin ve yonetin
      </p>
    </div>

    <!-- Status Filter Tabs -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeFilter = tab.key"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
          activeFilter === tab.key
            ? 'bg-slate-800 text-white shadow-md'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
        ]"
      >
        {{ tab.label }} ({{ counts[tab.key] }})
      </button>
    </div>

    <!-- Order Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        @click="router.push(`/orders/${order.id}`)"
        :class="[
          'bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 p-4 cursor-pointer hover:shadow-md transition-shadow',
          statusConfig[order.status].borderColor,
          order.status === 'teslim' ? 'opacity-70' : ''
        ]"
      >
        <!-- Status Badge -->
        <div class="flex items-center justify-between mb-3">
          <span
            :class="[
              'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
              statusConfig[order.status].badgeClass
            ]"
          >
            {{ statusConfig[order.status].emoji }} {{ statusConfig[order.status].label }}
          </span>
          <span v-if="order.eta" class="text-xs text-slate-500 flex items-center gap-1">
            <Clock class="w-3.5 h-3.5" />
            ETA: {{ order.eta }} dk
          </span>
        </div>

        <!-- Order Info -->
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm font-bold text-slate-800">#{{ order.id }}</span>
          <span class="text-slate-300">|</span>
          <span class="text-sm text-slate-600">{{ order.customer }}</span>
          <span class="text-slate-300">|</span>
          <span class="text-sm text-slate-500 flex items-center gap-1">
            <MapPin class="w-3.5 h-3.5" />
            {{ order.district }}
          </span>
          <span class="text-slate-300">|</span>
          <span class="text-sm font-semibold text-slate-700">&#8378;{{ order.amount }}</span>
        </div>

        <!-- Status Details -->
        <div class="text-xs text-slate-500 space-y-1">
          <!-- Bekliyor -->
          <p v-if="order.status === 'bekliyor'">
            <span class="font-medium text-slate-600">Partner:</span>
            {{ order.partner }} &nbsp;|&nbsp;
            <span class="font-medium text-slate-600">Durum:</span>
            {{ order.detail }}
          </p>

          <!-- Atandi -->
          <p v-if="order.status === 'atandı'">
            <span class="font-medium text-slate-600">Partner:</span>
            {{ order.partner }} &nbsp;|&nbsp;
            <span class="font-medium text-slate-600">Kurye:</span>
            {{ order.courier }} &nbsp;|&nbsp;
            <span class="font-medium text-slate-600">ETA:</span>
            {{ order.eta }} dk
          </p>

          <!-- Yolda -->
          <template v-if="order.status === 'yolda'">
            <p>
              <span class="font-medium text-slate-600">Partner:</span>
              {{ order.partner }} &nbsp;|&nbsp;
              <span class="flex-inline items-center gap-0.5">&#x1F4CD; {{ order.location }}</span>
              &nbsp;|&nbsp;
              <span class="font-medium text-slate-600">ETA:</span>
              {{ order.eta }} dk
            </p>
            <div class="flex gap-2 mt-3">
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium">
                <Map class="w-3.5 h-3.5" />
                Haritada Gor
              </button>
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-xs font-medium">
                <Phone class="w-3.5 h-3.5" />
                Kuryeyi Ara
              </button>
            </div>
          </template>

          <!-- Teslim -->
          <div v-if="order.status === 'teslim'" class="flex items-center justify-between">
            <p>
              <span class="font-medium text-slate-600">Partner:</span>
              {{ order.partner }} &nbsp;|&nbsp;
              <span class="font-medium text-slate-600">Sure:</span>
              {{ order.duration }} dk
            </p>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-medium">
              <Eye class="w-3.5 h-3.5" />
              Detay
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pool Statistics Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Truck class="w-5 h-5 text-slate-600" />
        Havuz Istatistikleri
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-3 px-4 text-slate-500 font-semibold">Partner</th>
              <th class="text-left py-3 px-4 text-slate-500 font-semibold">Siparis</th>
              <th class="text-left py-3 px-4 text-slate-500 font-semibold">Maliyet</th>
              <th class="text-left py-3 px-4 text-slate-500 font-semibold">Ort. Sure</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="stat in poolStats"
              :key="stat.partner"
              class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
            >
              <td class="py-3 px-4 font-medium text-slate-700">{{ stat.partner }}</td>
              <td class="py-3 px-4 text-slate-600">{{ stat.orders }}</td>
              <td class="py-3 px-4 text-slate-600">{{ stat.cost }}</td>
              <td class="py-3 px-4 text-slate-600">{{ stat.avgTime }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<!--
  PoolOrders.vue - Havuz Siparisleri Sayfasi (Restaurant Portal)
  ==============================================================
  Restoran portalinda aktif havuz siparislerini takip etmek icin kullanilir.
  Siparisler 4 duruma gore gruplanir: Bekliyor, Atandi, Yolda, Teslim.

  Ozellikler:
  - Durum tabanlı filtreleme (tab butonlari)
  - Siparis kartlarina tiklaninca siparis detay sayfasina yonlendirir
  - Her duruma ozel bilgi gosterimi (ETA, kurye, konum vb.)
  - Altta partner bazli havuz istatistikleri tablosu

  Not: Tum veriler mock'tur, API entegrasyonunda degistirilecek.
-->
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Package,
  Clock,
  MapPin,
  Phone,
  Map,
  CheckCircle,
  Truck,
  AlertCircle,
  Eye,
} from 'lucide-vue-next'

const router = useRouter()

// ========== MOCK SİPARİS VERİLERİ ==========
// Her siparisin durumuna gore farkli alanlar bulunur:
// bekliyor: partner, detail
// atandı: partner, courier, eta
// yolda: partner, location, eta
// teslim: partner, duration

const mockOrders = [
  // Bekliyor - Kurye aranıyor (3 adet)
  { id: 'YS-4530', customer: 'Fatma S.', district: 'Atasehir', amount: 290, status: 'bekliyor', partner: 'Bringo', detail: 'Kurye araniyor' },
  { id: 'YS-4531', customer: 'Zeynep K.', district: 'Uskudar', amount: 175, status: 'bekliyor', partner: 'Trendyol', detail: 'Kurye araniyor' },
  { id: 'YS-4532', customer: 'Mehmet T.', district: 'Besiktas', amount: 410, status: 'bekliyor', partner: 'Bringo', detail: 'Kurye araniyor' },

  // Atandi - Kurye atanmis, teslimata baslamamis (8 adet)
  { id: 'YS-4528', customer: 'Hasan M.', district: 'Kadikoy', amount: 420, status: 'atandı', partner: 'Bringo', courier: 'Ali R.', eta: 20 },
  { id: 'YS-4527', customer: 'Selin A.', district: 'Maltepe', amount: 310, status: 'atandı', partner: 'Bringo', courier: 'Murat K.', eta: 15 },
  { id: 'YS-4526', customer: 'Burak D.', district: 'Kartal', amount: 195, status: 'atandı', partner: 'Trendyol', courier: 'Emre B.', eta: 25 },
  { id: 'YS-4529', customer: 'Ayse N.', district: 'Beykoz', amount: 560, status: 'atandı', partner: 'Bringo', courier: 'Kemal Y.', eta: 30 },
  { id: 'YS-4533', customer: 'Deniz C.', district: 'Sisli', amount: 245, status: 'atandı', partner: 'Paket Taxi', courier: 'Serkan M.', eta: 18 },
  { id: 'YS-4534', customer: 'Elif G.', district: 'Bakirkoy', amount: 380, status: 'atandı', partner: 'Bringo', courier: 'Okan T.', eta: 22 },
  { id: 'YS-4535', customer: 'Murat P.', district: 'Sariyer', amount: 150, status: 'atandı', partner: 'Trendyol', courier: 'Caner S.', eta: 28 },
  { id: 'YS-4536', customer: 'Gizem H.', district: 'Umraniye', amount: 475, status: 'atandı', partner: 'Bringo', courier: 'Volkan A.', eta: 12 },

  // Yolda - Kurye yolda, konum bilgisi mevcut (10 adet)
  { id: 'YS-4525', customer: 'Can O.', district: 'Moda', amount: 350, status: 'yolda', partner: 'Bringo', location: 'Caferaga Mh.', eta: 8 },
  { id: 'YS-4524', customer: 'Derya B.', district: 'Fenerbahce', amount: 280, status: 'yolda', partner: 'Bringo', location: 'Zuhtupasa Mh.', eta: 5 },
  { id: 'YS-4523', customer: 'Emre V.', district: 'Bostanci', amount: 190, status: 'yolda', partner: 'Trendyol', location: 'Bostanci Mh.', eta: 12 },
  { id: 'YS-4522', customer: 'Gokhan L.', district: 'Caddebostan', amount: 445, status: 'yolda', partner: 'Bringo', location: 'Erenkoy Mh.', eta: 3 },
  { id: 'YS-4537', customer: 'Irem Z.', district: 'Kozyatagi', amount: 320, status: 'yolda', partner: 'Bringo', location: 'Kozyatagi Mh.', eta: 10 },
  { id: 'YS-4538', customer: 'Kaan U.', district: 'Acibadem', amount: 265, status: 'yolda', partner: 'Paket Taxi', location: 'Acibadem Mh.', eta: 6 },
  { id: 'YS-4539', customer: 'Lale E.', district: 'Suadiye', amount: 510, status: 'yolda', partner: 'Bringo', location: 'Suadiye Mh.', eta: 15 },
  { id: 'YS-4540', customer: 'Nihat F.', district: 'Goztepe', amount: 185, status: 'yolda', partner: 'Bringo', location: 'Goztepe Mh.', eta: 4 },
  { id: 'YS-4541', customer: 'Ozan R.', district: 'Erenkoy', amount: 370, status: 'yolda', partner: 'Trendyol', location: 'Erenkoy Mh.', eta: 9 },
  { id: 'YS-4542', customer: 'Pinar W.', district: 'Fikirtepe', amount: 225, status: 'yolda', partner: 'Bringo', location: 'Fikirtepe Mh.', eta: 7 },

  // Teslim Edildi (4 adet)
  { id: 'YS-4520', customer: 'Ahmet Y.', district: 'Kadikoy', amount: 285, status: 'teslim', partner: 'Bringo', duration: 28 },
  { id: 'YS-4519', customer: 'Berna C.', district: 'Atasehir', amount: 340, status: 'teslim', partner: 'Bringo', duration: 24 },
  { id: 'YS-4518', customer: 'Cenk I.', district: 'Maltepe', amount: 160, status: 'teslim', partner: 'Trendyol', duration: 35 },
  { id: 'YS-4517', customer: 'Dilek S.', district: 'Kartal', amount: 490, status: 'teslim', partner: 'Bringo', duration: 22 },
]

// ========== DURUM KONFIGURASYONU ==========
// Her durum icin etiket, emoji, kenar rengi ve badge class

const statusConfig = {
  bekliyor: {
    label: 'KURYE BEKLIYOR',
    emoji: '\u23F3',
    borderColor: 'border-l-orange-400',
    badgeClass: 'bg-orange-50 text-orange-700',
  },
  'atandı': {
    label: 'KURYE ATANDI',
    emoji: '\uD83D\uDD35',
    borderColor: 'border-l-blue-400',
    badgeClass: 'bg-blue-50 text-blue-700',
  },
  yolda: {
    label: 'YOLDA',
    emoji: '\uD83D\uDFE2',
    borderColor: 'border-l-green-400',
    badgeClass: 'bg-green-50 text-green-700',
  },
  teslim: {
    label: 'TESLIM EDILDI',
    emoji: '\u2705',
    borderColor: 'border-l-gray-400',
    badgeClass: 'bg-gray-50 text-gray-500',
  },
}

// Filtreleme tab secenekleri
const tabs = [
  { key: 'tümü', label: 'Tumu' },
  { key: 'bekliyor', label: 'Bekliyor' },
  { key: 'atandı', label: 'Atandi' },
  { key: 'yolda', label: 'Yolda' },
  { key: 'teslim', label: 'Teslim' },
]

// Partner bazli havuz istatistikleri (alt tablo)
const poolStats = [
  { partner: 'Bringo', orders: 18, cost: '\u20BA504', avgTime: '26 dk' },
  { partner: 'Trendyol', orders: 5, cost: '\u20BA160', avgTime: '32 dk' },
  { partner: 'Paket Taxi', orders: 2, cost: '\u20BA76', avgTime: '38 dk' },
]

// ========== REACTIVE STATE ==========

const activeFilter = ref('tümü') // Aktif durum filtresi

// ========== COMPUTED ==========

// Secili filtreye gore siparisler
const filteredOrders = computed(() => {
  if (activeFilter.value === 'tümü') return mockOrders
  return mockOrders.filter((order) => order.status === activeFilter.value)
})

// Her durum icin siparis sayisi (tab butonlarinda gosterilir)
const counts = computed(() => ({
  'tümü': mockOrders.length,
  bekliyor: mockOrders.filter((o) => o.status === 'bekliyor').length,
  'atandı': mockOrders.filter((o) => o.status === 'atandı').length,
  yolda: mockOrders.filter((o) => o.status === 'yolda').length,
  teslim: mockOrders.filter((o) => o.status === 'teslim').length,
}))
</script>
