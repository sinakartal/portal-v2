<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <!-- Success Toast -->
    <div v-if="showSuccess" class="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
      <Check class="w-5 h-5" />
      <span class="font-medium">{{ selectedCount }} siparis {{ courier?.name }}'ya atandi</span>
    </div>

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <span class="text-2xl">&#128506;</span> Rota Planlama
      </h1>
      <p class="text-slate-500 mt-1 text-sm">Siparisleri secin, rotayi optimize edin ve kuryeye atayin</p>
    </div>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Left Column - Ready Orders List -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-slate-800 flex items-center gap-2">
              <Package class="w-5 h-5 text-orange-500" /> Hazir Siparisler ({{ mockOrders.length }})
            </h2>
            <button @click="selectAll" class="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              {{ selectedOrders.length === mockOrders.length ? 'Secimi Kaldir' : 'Tumunu Sec' }}
            </button>
          </div>

          <div class="space-y-2">
            <label v-for="order in mockOrders" :key="order.id"
              :class="['flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border', selectedOrders.includes(order.id) ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100']">
              <input type="checkbox" :checked="selectedOrders.includes(order.id)" @change="toggleOrder(order.id)" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-sm font-semibold text-slate-700">#{{ order.id }}</span>
                  <span class="font-semibold text-slate-800">&#8378;{{ order.amount }}</span>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-sm text-slate-500">{{ order.district }}, {{ order.customer }}</span>
                  <span class="text-xs text-slate-400 flex items-center gap-1"><MapPin class="w-3 h-3" /> {{ order.distance }} km</span>
                </div>
              </div>
            </label>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-sm text-slate-500">Secili: <span class="font-semibold text-slate-700">{{ selectedCount }} siparis</span></span>
            <span class="text-sm text-slate-400">Toplam: &#8378;{{ selectedTotal }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Simulated Map -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <MapIcon class="w-5 h-5 text-blue-500" /> Rota Haritasi
          </h2>
          <div class="relative bg-slate-100 rounded-xl h-64 overflow-hidden border border-slate-200">
            <div class="absolute inset-0 opacity-20">
              <div v-for="i in 8" :key="'h-'+i" class="absolute w-full border-t border-slate-300" :style="{ top: `${i * 12.5}%` }" />
              <div v-for="i in 10" :key="'v-'+i" class="absolute h-full border-l border-slate-300" :style="{ left: `${i * 10}%` }" />
            </div>
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline points="45,55 25,30 60,20 80,40 70,70 30,75 45,55" fill="none" stroke="#3b82f6" stroke-width="0.6" stroke-dasharray="2,1.5" opacity="0.7" />
            </svg>
            <div v-for="(point, idx) in mapPoints" :key="idx" class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" :style="{ left: `${point.x}%`, top: `${point.y}%` }">
              <template v-if="point.type === 'restaurant'">
                <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <Navigation class="w-4 h-4 text-white" />
                </div>
                <span class="text-[10px] font-semibold text-red-600 mt-0.5 bg-white/80 px-1 rounded">Restoran</span>
              </template>
              <template v-else>
                <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <span class="text-[10px] font-bold text-white">{{ point.label }}</span>
                </div>
              </template>
            </div>
            <div class="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-white/70 px-2 py-0.5 rounded">Simule Harita Gorunumu</div>
          </div>

          <div class="flex items-center gap-4 mt-4 text-sm text-slate-600">
            <span class="flex items-center gap-1"><Package class="w-4 h-4 text-blue-500" /> Toplam: {{ selectedCount }} siparis</span>
            <span class="text-slate-300">|</span>
            <span class="flex items-center gap-1"><Route class="w-4 h-4 text-blue-500" /> Mesafe: {{ isOptimized ? '7.1' : '8.5' }} km</span>
            <span class="text-slate-300">|</span>
            <span class="flex items-center gap-1"><Clock class="w-4 h-4 text-blue-500" /> Tahmini sure: {{ isOptimized ? '35' : '42' }} dk</span>
          </div>

          <div class="mt-4">
            <button v-if="!isOptimized" @click="handleOptimize" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>&#128506;</span> Rotayi Optimize Et
            </button>
            <div v-else class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div class="flex items-center gap-2 text-emerald-700 font-medium mb-2"><Check class="w-5 h-5" /> Rota Optimize Edildi</div>
              <div class="text-sm text-emerald-600 space-y-1">
                <p class="flex items-center gap-2">Onceki mesafe: <span class="line-through text-slate-400">8.5 km</span> <ArrowRight class="w-4 h-4" /> <span class="font-semibold">Yeni mesafe: 7.1 km</span></p>
                <p class="flex items-center gap-2"><Route class="w-4 h-4" /> <span class="font-semibold text-emerald-700">%17 daha kisa rota</span> <span class="text-slate-400">|</span> <Clock class="w-4 h-4" /> <span class="font-semibold text-emerald-700">7 dk tasarruf</span></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Courier Selection -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 class="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Truck class="w-5 h-5 text-indigo-500" /> Kurye Secimi
          </h2>
          <div class="space-y-2">
            <label v-for="c in mockCouriers" :key="c.id"
              :class="['flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border', selectedCourier === c.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100']">
              <input type="radio" name="courier" :checked="selectedCourier === c.id" @change="selectedCourier = c.id" class="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
              <div class="flex items-center gap-2 flex-1">
                <span>{{ c.color === 'green' ? '&#x1F7E2;' : '&#x1F535;' }}</span>
                <div class="flex items-center gap-1">
                  <User class="w-4 h-4 text-slate-400" />
                  <span class="font-medium text-slate-700">{{ c.name }}</span>
                </div>
                <span class="text-sm text-slate-400">({{ c.status }})</span>
              </div>
              <Check v-if="selectedCourier === c.id" class="w-4 h-4 text-indigo-500" />
            </label>
          </div>
          <button @click="handleAssign" :disabled="selectedCount === 0"
            :class="['w-full mt-4 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2', selectedCount > 0 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed']">
            <span>&#128230;</span> Kuryeye Ata
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Map as MapIcon, MapPin, Navigation, Package, Check, Route, Truck, User, Clock, ArrowRight } from 'lucide-vue-next'

const mockOrders = [
  { id: 'YS-4521', district: 'Kadikoy', customer: 'Ahmet Y.', amount: 285, distance: 2.1 },
  { id: 'YS-4520', district: 'Moda', customer: 'Ayse D.', amount: 142, distance: 1.8 },
  { id: 'YS-4519', district: 'Fenerbahce', customer: 'Can O.', amount: 420, distance: 3.2 },
  { id: 'YS-4518', district: 'Besiktas', customer: 'Fatma S.', amount: 350, distance: 4.5 },
  { id: 'YS-4517', district: 'Uskudar', customer: 'Hasan M.', amount: 290, distance: 2.8 },
]

const mockCouriers = [
  { id: 1, name: 'Mehmet K.', status: 'Musait', color: 'green', busy: false },
  { id: 2, name: 'Veli T.', status: '1 siparis', color: 'green', busy: false },
  { id: 3, name: 'Ali V.', status: '3 siparis', color: 'blue', busy: true },
]

const mapPoints = [
  { x: 45, y: 55, label: 'R', type: 'restaurant' },
  { x: 25, y: 30, label: '1', type: 'delivery' },
  { x: 60, y: 20, label: '2', type: 'delivery' },
  { x: 80, y: 40, label: '3', type: 'delivery' },
  { x: 70, y: 70, label: '4', type: 'delivery' },
  { x: 30, y: 75, label: '5', type: 'delivery' },
]

const selectedOrders = ref(['YS-4521', 'YS-4520', 'YS-4519'])
const selectedCourier = ref(1)
const isOptimized = ref(false)
const showSuccess = ref(false)

const toggleOrder = (orderId) => {
  if (selectedOrders.value.includes(orderId)) {
    selectedOrders.value = selectedOrders.value.filter(id => id !== orderId)
  } else {
    selectedOrders.value = [...selectedOrders.value, orderId]
  }
}

const selectAll = () => {
  if (selectedOrders.value.length === mockOrders.length) {
    selectedOrders.value = []
  } else {
    selectedOrders.value = mockOrders.map(o => o.id)
  }
}

const handleOptimize = () => { isOptimized.value = true }

const handleAssign = () => {
  if (courier.value && selectedOrders.value.length > 0) {
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 4000)
  }
}

const selectedCount = computed(() => selectedOrders.value.length)
const courier = computed(() => mockCouriers.find(c => c.id === selectedCourier.value))
const selectedTotal = computed(() => mockOrders.filter(o => selectedOrders.value.includes(o.id)).reduce((sum, o) => sum + o.amount, 0))
</script>
