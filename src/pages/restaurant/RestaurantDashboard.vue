<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl">&#127869;</span>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Lezzet Cafe</h1>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Acik
        </span>
      </div>
      <button class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition">
        <Settings :size="20" />
      </button>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="s in SUMMARY" :key="s.label" class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
        <div :class="[s.bg, 'rounded-lg p-3']">
          <component :is="s.icon" :size="22" :class="s.color" />
        </div>
        <div>
          <p class="text-sm text-slate-500">{{ s.label }}</p>
          <p class="text-xl font-bold text-slate-800">
            {{ s.value }}
            <span v-if="s.extra" class="ml-1 text-sm font-medium text-slate-400">({{ s.extra }})</span>
          </p>
        </div>
      </div>
    </div>

    <!-- LIVE ORDERS -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <!-- Tabs -->
      <div class="flex items-center gap-2 p-4 border-b border-slate-100 overflow-x-auto">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition',
            activeTab === tab.key
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          <span :class="['h-2 w-2 rounded-full', activeTab === tab.key ? 'bg-white' : dotColor[tab.key]]" />
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <!-- Order cards -->
      <div class="divide-y divide-slate-100">
        <!-- YENI -->
        <template v-if="activeTab === 'yeni'">
          <div v-for="o in ORDERS.yeni" :key="o.id" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div class="flex items-start gap-3">
              <span :class="['mt-1.5 h-2.5 w-2.5 rounded-full shrink-0', dotColor.yeni]" />
              <div>
                <p class="font-semibold text-slate-800">{{ o.id }} <span class="font-normal text-slate-500">- {{ o.customer }}</span></p>
                <p class="text-sm text-slate-400">{{ o.district }} &middot; {{ o.amount }} TL &middot; {{ o.timeAgo }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:shrink-0">
              <button class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition">Onayla + Kurye Ata</button>
              <button @click="openPoolModal(o)" class="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition">Havuza At</button>
            </div>
          </div>
        </template>

        <!-- HAZIRLANIYOR -->
        <template v-if="activeTab === 'hazirlaniyor'">
          <div v-for="o in ORDERS.hazirlaniyor" :key="o.id" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div class="flex items-start gap-3">
              <span :class="['mt-1.5 h-2.5 w-2.5 rounded-full shrink-0', dotColor.hazirlaniyor]" />
              <div>
                <p class="font-semibold text-slate-800">{{ o.id }} <span class="font-normal text-slate-500">- {{ o.customer }}</span></p>
                <p class="text-sm text-slate-400">{{ o.district }} &middot; {{ o.amount }} TL</p>
              </div>
            </div>
            <div class="sm:shrink-0">
              <span v-if="o.courier" class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <Truck :size="14" /> {{ o.courier }}
              </span>
              <span v-else class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                <SendIcon :size="14" /> Bringo havuz
              </span>
            </div>
          </div>
        </template>

        <!-- HAZIR -->
        <template v-if="activeTab === 'hazir'">
          <div v-for="o in ORDERS.hazir" :key="o.id" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div class="flex items-start gap-3">
              <span :class="['mt-1.5 h-2.5 w-2.5 rounded-full shrink-0', dotColor.hazir]" />
              <div>
                <p class="font-semibold text-slate-800">{{ o.id }} <span class="font-normal text-slate-500">- {{ o.customer }}</span></p>
                <p class="text-sm text-slate-400">{{ o.district }} &middot; {{ o.amount }} TL</p>
              </div>
            </div>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:shrink-0">
              <Clock :size="14" /> Kurye geliyor: {{ o.courierEta }} dk
            </span>
          </div>
        </template>

        <!-- YOLDA -->
        <template v-if="activeTab === 'yolda'">
          <div v-for="o in ORDERS.yolda" :key="o.id" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div class="flex items-start gap-3">
              <span :class="['mt-1.5 h-2.5 w-2.5 rounded-full shrink-0', dotColor.yolda]" />
              <div>
                <p class="font-semibold text-slate-800">{{ o.id }} <span class="font-normal text-slate-500">- {{ o.customer }}</span></p>
                <p class="text-sm text-slate-400">{{ o.district }} &middot; {{ o.amount }} TL</p>
              </div>
            </div>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 sm:shrink-0">
              <MapPin :size="14" /> Tahmini: {{ o.eta }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- MY COURIERS -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="flex items-center justify-between p-4 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">
          Kendi Kuryelerim <span class="text-sm font-normal text-slate-400">(3 aktif)</span>
        </h2>
        <button class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark transition">
          <UserPlus :size="14" /> Kurye Ekle
        </button>
      </div>
      <div class="divide-y divide-slate-100">
        <div v-for="c in COURIERS" :key="c.name" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{{ c.name.charAt(0) }}</div>
            <div>
              <p class="font-medium text-slate-800">
                {{ c.name }}
                <span v-if="c.online" class="text-xs text-emerald-600">&#x1F7E2; Online</span>
                <span v-else class="text-xs text-slate-400">&#x26AB; Offline</span>
              </p>
              <p v-if="c.online" class="text-sm text-slate-400">{{ c.orders }} siparis &middot; {{ c.location }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 sm:shrink-0">
            <template v-if="c.online">
              <button class="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 transition"><MapPin :size="16" /></button>
              <button class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition">Ata</button>
            </template>
            <template v-else>
              <button class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition">
                <Phone :size="14" /> Ara
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- PLAN BADGE -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-amber-50 p-2"><Crown :size="20" class="text-amber-500" /></div>
        <div>
          <p class="font-semibold text-slate-800">Ucretsiz Plan</p>
          <p class="text-xs text-slate-400">Aylik 50 havuz siparisi hakki</p>
        </div>
      </div>
      <button class="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md transition">
        <Star :size="16" /> Pro'ya Gec - 999 TL/ay <ChevronRight :size="16" />
      </button>
    </div>

    <!-- POOL MODAL -->
    <div v-if="showPoolModal && poolOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 class="text-lg font-semibold text-slate-800">Havuza At</h3>
          <button @click="showPoolModal = false" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition"><X :size="20" /></button>
        </div>
        <div class="space-y-5 p-4">
          <div class="rounded-lg bg-slate-50 p-3">
            <p class="font-semibold text-slate-800">{{ poolOrder.id }}</p>
            <p class="text-sm text-slate-500">{{ poolOrder.customer }} &middot; {{ poolOrder.district }} &middot; {{ poolOrder.amount }} TL</p>
          </div>
          <div>
            <p class="mb-2 text-sm font-semibold text-slate-700">Havuza Atma Nedeni</p>
            <div class="space-y-2">
              <label v-for="r in POOL_REASONS" :key="r" class="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                <input type="radio" name="poolReason" :checked="poolReason === r" @change="poolReason = r" class="accent-primary" />
                {{ r }}
              </label>
            </div>
          </div>
          <div>
            <p class="mb-2 text-sm font-semibold text-slate-700">Partner Sec</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="p in POOL_PARTNERS"
                :key="p.name"
                @click="selectedPartner = p.name"
                :class="[
                  'relative rounded-xl border p-3 text-left transition',
                  selectedPartner === p.name
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-slate-200 hover:border-slate-300'
                ]"
              >
                <span v-if="p.recommended" class="absolute -top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">onerilen</span>
                <p class="font-semibold text-slate-800 text-sm">{{ p.name }}</p>
                <p class="text-xs text-slate-400 mt-1">ETA: {{ p.eta }}</p>
                <p class="text-sm font-bold text-slate-700 mt-1">{{ p.price }} TL</p>
              </button>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 border-t border-slate-100 p-4">
          <button @click="showPoolModal = false" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Iptal</button>
          <button @click="showPoolModal = false" class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition">
            <SendIcon :size="16" /> Gonder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Store, Package, Truck, Clock, UserPlus, MapPin, Phone,
  Send as SendIcon, Star, Crown, ChevronRight, X, Settings
} from 'lucide-vue-next'

const SUMMARY = [
  { label: 'Siparis', value: 87, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Kendi Kurye', value: 62, extra: '%71', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Havuza Atilan', value: 25, extra: '%29', icon: SendIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Ort. Teslimat', value: '28 dk', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const TABS = [
  { key: 'yeni', label: 'Yeni', count: 5 },
  { key: 'hazirlaniyor', label: 'Hazirlaniyor', count: 8 },
  { key: 'hazir', label: 'Hazir', count: 3 },
  { key: 'yolda', label: 'Yolda', count: 12 },
]

const ORDERS = {
  yeni: [
    { id: 'BRN-4521', customer: 'Ahmet Yilmaz', district: 'Kadikoy', amount: 245, timeAgo: '2 dk once' },
    { id: 'BRN-4522', customer: 'Zeynep Kara', district: 'Besiktas', amount: 180, timeAgo: '5 dk once' },
    { id: 'BRN-4523', customer: 'Murat Demir', district: 'Uskudar', amount: 320, timeAgo: '8 dk once' },
    { id: 'BRN-4524', customer: 'Selin Ozturk', district: 'Sisli', amount: 150, timeAgo: '12 dk once' },
    { id: 'BRN-4525', customer: 'Emre Can', district: 'Beyoglu', amount: 275, timeAgo: '15 dk once' },
  ],
  hazirlaniyor: [
    { id: 'BRN-4510', customer: 'Hakan Celik', district: 'Kadikoy', amount: 190, courier: 'Mehmet K.' },
    { id: 'BRN-4511', customer: 'Deniz Aksoy', district: 'Moda', amount: 310, courier: 'Ali V.' },
    { id: 'BRN-4512', customer: 'Burak Sahin', district: 'Besiktas', amount: 165, courier: null },
    { id: 'BRN-4513', customer: 'Elif Yildiz', district: 'Uskudar', amount: 420, courier: 'Veli T.' },
    { id: 'BRN-4514', customer: 'Caner Polat', district: 'Sisli', amount: 230, courier: null },
  ],
  hazir: [
    { id: 'BRN-4501', customer: 'Aysegul Korkmaz', district: 'Kadikoy', amount: 280, courierEta: 3 },
    { id: 'BRN-4502', customer: 'Tuncay Eren', district: 'Moda', amount: 195, courierEta: 7 },
    { id: 'BRN-4503', customer: 'Pinar Arslan', district: 'Besiktas', amount: 345, courierEta: 5 },
  ],
  yolda: [
    { id: 'BRN-4480', customer: 'Sinan Kartal', district: 'Kadikoy', amount: 210, eta: '12 dk' },
    { id: 'BRN-4481', customer: 'Merve Dogan', district: 'Uskudar', amount: 175, eta: '8 dk' },
    { id: 'BRN-4482', customer: 'Ozan Tekin', district: 'Besiktas', amount: 290, eta: '18 dk' },
    { id: 'BRN-4483', customer: 'Irem Basaran', district: 'Moda', amount: 360, eta: '5 dk' },
    { id: 'BRN-4484', customer: 'Kerem Aydin', district: 'Sisli', amount: 140, eta: '22 dk' },
  ],
}

const COURIERS = [
  { name: 'Mehmet K.', online: true, orders: 2, location: "Kadikoy'de" },
  { name: 'Ali V.', online: true, orders: 3, location: "Besiktas'ta" },
  { name: 'Veli T.', online: true, orders: 1, location: "Moda'da" },
  { name: 'Ayse D.', online: false, orders: 0, location: null },
]

const POOL_REASONS = ['Kuryem musait degil', 'Bolge cok uzak', 'Yogunluk cok fazla', 'Diger']

const POOL_PARTNERS = [
  { name: 'Bringo', recommended: true, eta: '25 dk', price: 28 },
  { name: 'Trendyol Go', recommended: false, eta: '30 dk', price: 32 },
  { name: 'Paket Taxi', recommended: false, eta: '40 dk', price: 38 },
]

const dotColor = { yeni: 'bg-red-500', hazirlaniyor: 'bg-yellow-400', hazir: 'bg-green-500', yolda: 'bg-blue-500' }

const activeTab = ref('yeni')
const showPoolModal = ref(false)
const poolOrder = ref(null)
const poolReason = ref(POOL_REASONS[0])
const selectedPartner = ref('Bringo')

const openPoolModal = (order) => {
  poolOrder.value = order
  poolReason.value = POOL_REASONS[0]
  selectedPartner.value = 'Bringo'
  showPoolModal.value = true
}
</script>
