<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-800">Kuryelerim</h1>
      <button @click="showAddModal = true" class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
        <UserPlus :size="18" /> Kurye Ekle
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="card in summaryCards" :key="card.label" class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">{{ card.label }}</p>
            <p :class="['text-2xl font-bold mt-1', card.color]">{{ card.value }}</p>
          </div>
          <div :class="['p-2.5 rounded-lg', card.bg]">
            <component :is="card.icon" :size="20" :class="card.color" />
          </div>
        </div>
      </div>
    </div>

    <!-- Courier List -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      <div v-for="courier in couriers" :key="courier.id" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <!-- Name + Status -->
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-slate-800">{{ courier.name }}</h3>
          <span :class="['inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', statusConfig[courier.status].bg, statusConfig[courier.status].text]">
            <span :class="['w-2 h-2 rounded-full', statusConfig[courier.status].dot]"></span>
            {{ statusConfig[courier.status].label }}
            <span v-if="courier.idle" class="text-green-500 ml-0.5">(bosta)</span>
          </span>
        </div>

        <div class="space-y-2 text-sm text-slate-600">
          <div v-if="courier.status !== 'offline'" class="flex items-center gap-2">
            <Phone :size="14" class="text-slate-400" /><span>{{ courier.phone }}</span>
          </div>
          <div v-if="courier.location" class="flex items-center gap-2">
            <MapPin :size="14" class="text-slate-400" />
            <span>{{ courier.location }} <span class="text-slate-400">({{ courier.locationUpdated }})</span></span>
          </div>
          <div v-if="courier.status === 'offline' && courier.lastSeen" class="flex items-center gap-2">
            <Clock :size="14" class="text-slate-400" /><span>Son gorulme: {{ courier.lastSeen }}</span>
          </div>
          <div v-if="courier.status !== 'offline'" class="flex items-center gap-2">
            <Package :size="14" class="text-slate-400" />
            <span>Uzerinde: <span class="font-medium">{{ courier.activeOrders }} siparis</span></span>
          </div>
          <div v-if="courier.nextOrder" class="flex items-center gap-2">
            <Navigation :size="14" class="text-blue-500" />
            <span>Sonraki: <span class="font-medium">{{ courier.nextOrder.code }}</span> <span class="text-slate-400">(ETA: {{ courier.nextOrder.eta }})</span></span>
          </div>
        </div>

        <!-- Today stats -->
        <div class="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Bugun: <span class="font-semibold text-slate-700">{{ courier.todayDeliveries }}</span> teslimat</span>
          <template v-if="courier.avgTime">
            <span class="text-slate-300">|</span>
            <span>Ort: <span class="font-semibold text-slate-700">{{ courier.avgTime }} dk</span></span>
          </template>
          <template v-if="courier.rating">
            <span class="text-slate-300">|</span>
            <span class="inline-flex items-center gap-0.5">
              <Star :size="12" class="text-amber-400 fill-amber-400" />
              <span class="font-semibold text-slate-700">{{ courier.rating }}</span>
            </span>
          </template>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <template v-if="courier.status !== 'offline'">
            <button class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
              <MapPin :size="13" /> Konum
            </button>
            <button @click="handleOpenAssign(courier)" class="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
              <Package :size="13" /> Siparis Ata
            </button>
          </template>
          <button class="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
            <Phone :size="13" /> Ara
          </button>
        </div>
      </div>
    </div>

    <!-- Simulated Mini Map -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <h2 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <MapPin :size="18" class="text-orange-500" /> Kurye Konumlari
      </h2>
      <div class="relative w-full h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
        <div class="absolute inset-0 opacity-20">
          <div v-for="i in 8" :key="'h-'+i" class="absolute w-full border-t border-slate-300" :style="{ top: `${i * 11.11}%` }" />
          <div v-for="i in 8" :key="'v-'+i" class="absolute h-full border-l border-slate-300" :style="{ left: `${i * 11.11}%` }" />
        </div>
        <div class="absolute flex flex-col items-center" :style="{ top: '45%', left: '48%', transform: 'translate(-50%, -50%)' }">
          <div class="w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
            <span class="text-white text-[8px] font-bold">R</span>
          </div>
          <span class="text-[10px] font-medium text-orange-700 mt-0.5 bg-white/80 px-1 rounded">Restoran</span>
        </div>
        <template v-for="courier in couriers" :key="'map-'+courier.id">
          <div v-if="courier.mapPosition" class="absolute flex flex-col items-center group" :style="{ top: courier.mapPosition.top, left: courier.mapPosition.left, transform: 'translate(-50%, -50%)' }">
            <div :class="['w-3.5 h-3.5 rounded-full border-2 border-white shadow-md cursor-pointer', courier.status === 'online' ? 'bg-green-500' : courier.status === 'delivering' ? 'bg-blue-500' : 'bg-gray-400']" />
            <span class="text-[9px] font-medium text-slate-700 mt-0.5 bg-white/90 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{ courier.name }}</span>
          </div>
        </template>
        <div class="absolute bottom-2 right-2 bg-white/90 rounded-lg px-3 py-1.5 flex items-center gap-3 text-[10px] text-slate-600">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-500"></span> Restoran</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Dagitimda</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-400"></span> Offline</span>
        </div>
      </div>
    </div>

    <!-- Add Courier Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-slate-800">Yeni Kurye Ekle</h2>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 transition-colors"><X :size="20" /></button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
            <input type="text" v-model="newCourier.name" placeholder="Kurye adi ve soyadi" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
            <input type="tel" v-model="newCourier.phone" placeholder="05XX XXX XX XX" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Arac Tipi</label>
            <div class="flex items-center gap-4">
              <label v-for="opt in vehicleOptions" :key="opt.value" class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="vehicleType" :value="opt.value" v-model="newCourier.vehicleType" class="accent-orange-500" />
                <span class="text-sm text-slate-600">{{ opt.label }}</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Calisma Saatleri</label>
            <div class="flex items-center gap-3">
              <input type="time" v-model="newCourier.workStart" class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              <span class="text-slate-400">-</span>
              <input type="time" v-model="newCourier.workEnd" class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
          </div>
          <button @click="handleSendSms" class="w-full flex items-center justify-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg px-4 py-2.5 transition-colors">
            <Phone :size="15" /> SMS ile Davet Gonder
          </button>
        </div>
        <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button @click="showAddModal = false" class="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">Iptal</button>
          <button @click="handleSaveCourier" class="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg transition-colors">
            <Check :size="15" /> Kaydet
          </button>
        </div>
      </div>
    </div>

    <!-- Assign Order Modal -->
    <div v-if="showAssignModal && assignTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-lg font-bold text-slate-800">Siparis Ata</h2>
            <p class="text-sm text-slate-500 mt-0.5">Kurye: <span class="font-medium text-slate-700">{{ assignTarget.name }}</span></p>
          </div>
          <button @click="showAssignModal = false" class="text-slate-400 hover:text-slate-600 transition-colors"><X :size="20" /></button>
        </div>
        <p class="text-sm text-slate-500 mb-3">Atanmamis siparislerden birini secin:</p>
        <div class="space-y-2 max-h-72 overflow-y-auto">
          <button v-for="order in unassignedOrders" :key="order.id" @click="selectedOrder = order.id"
            :class="['w-full text-left p-3 rounded-lg border transition-colors', selectedOrder === order.id ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300 bg-white']">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-800">#{{ order.id }}</span>
              <span class="text-xs text-slate-400">{{ order.waitingMin }} dk bekliyor</span>
            </div>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs text-slate-500">{{ order.customer }}</span>
              <span class="text-xs font-medium text-slate-700">{{ order.total }}</span>
            </div>
            <div class="flex items-center gap-1 mt-1 text-xs text-slate-400">
              <MapPin :size="11" /><span>{{ order.address }}</span>
              <span class="ml-auto">{{ order.items }} urun</span>
            </div>
          </button>
        </div>
        <div class="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
          <button @click="showAssignModal = false" class="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">Iptal</button>
          <button @click="handleConfirmAssign" :disabled="!selectedOrder"
            :class="['inline-flex items-center gap-1.5 text-sm font-medium text-white px-5 py-2 rounded-lg transition-colors', selectedOrder ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-300 cursor-not-allowed']">
            <Check :size="15" /> Onayla ve Ata
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Users, UserPlus, MapPin, Phone, Package, Star, Clock, Bike, Navigation, X, Check } from 'lucide-vue-next'

const couriers = [
  { id: 1, name: 'Mehmet Kaya', status: 'online', phone: '0532 555 12 34', location: 'Kadikoy, Moda Cd.', locationUpdated: '2 dk once', activeOrders: 2, todayDeliveries: 12, avgTime: 22, rating: 4.8, nextOrder: null, mapPosition: { top: '40%', left: '60%' } },
  { id: 2, name: 'Ali Vural', status: 'delivering', phone: '0533 444 56 78', location: 'Besiktas, Ortakoy', locationUpdated: '5 dk once', activeOrders: 3, todayDeliveries: 15, avgTime: 25, rating: 4.7, nextOrder: { code: '#YS-4518', eta: '10 dk' }, mapPosition: { top: '30%', left: '35%' } },
  { id: 3, name: 'Veli Tunc', status: 'online', phone: '0535 333 78 90', location: 'Uskudar, Cengelkoy', locationUpdated: '1 dk once', activeOrders: 1, todayDeliveries: 8, avgTime: 20, rating: 4.9, nextOrder: null, mapPosition: { top: '45%', left: '70%' } },
  { id: 4, name: 'Ayse Demir', status: 'offline', phone: '0536 222 34 56', location: null, locationUpdated: null, activeOrders: 0, todayDeliveries: 0, avgTime: null, rating: null, lastSeen: '2 saat once', nextOrder: null, mapPosition: null },
  { id: 5, name: 'Hasan Celik', status: 'delivering', phone: '0537 111 90 12', location: 'Sisli, Mecidiyekoy', locationUpdated: '3 dk once', activeOrders: 2, todayDeliveries: 10, avgTime: 28, rating: 4.5, nextOrder: null, mapPosition: { top: '25%', left: '45%' } },
  { id: 6, name: 'Zeynep Ak', status: 'online', phone: '0538 999 67 89', location: 'Kadikoy, Bahariye', locationUpdated: 'az once', activeOrders: 0, todayDeliveries: 5, avgTime: 18, rating: 4.9, nextOrder: null, idle: true, mapPosition: { top: '50%', left: '55%' } },
]

const unassignedOrders = [
  { id: 'YS-5021', customer: 'Elif Yilmaz', address: 'Kadikoy, Caferaga Mah.', items: 3, total: '185.00 TL', waitingMin: 8 },
  { id: 'YS-5023', customer: 'Burak Ozturk', address: 'Besiktas, Levent Mah.', items: 1, total: '72.50 TL', waitingMin: 5 },
  { id: 'YS-5025', customer: 'Selin Arslan', address: 'Uskudar, Altunizade', items: 4, total: '240.00 TL', waitingMin: 3 },
  { id: 'YS-5027', customer: 'Mert Koc', address: 'Sisli, Nisantasi', items: 2, total: '130.00 TL', waitingMin: 12 },
]

const statusConfig = {
  online: { label: 'Online', dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  delivering: { label: 'Dagitimda', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
  offline: { label: 'Offline', dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100' },
}

const vehicleOptions = [
  { value: 'motorcycle', label: 'Motorsiklet' },
  { value: 'bicycle', label: 'Bisiklet' },
  { value: 'walking', label: 'Yaya' },
]

const summaryCards = [
  { label: 'Toplam', value: 6, icon: Users, color: 'text-slate-700', bg: 'bg-slate-50' },
  { label: 'Online', value: 3, icon: Users, color: 'text-green-700', bg: 'bg-green-50' },
  { label: 'Dagitimda', value: 2, icon: Navigation, color: 'text-blue-700', bg: 'bg-blue-50' },
  { label: 'Offline', value: 1, icon: Users, color: 'text-gray-500', bg: 'bg-gray-50' },
]

const showAddModal = ref(false)
const showAssignModal = ref(false)
const assignTarget = ref(null)
const selectedOrder = ref(null)

const newCourier = reactive({
  name: '', phone: '', vehicleType: 'motorcycle', workStart: '09:00', workEnd: '22:00',
})

const handleOpenAssign = (courier) => {
  assignTarget.value = courier
  selectedOrder.value = null
  showAssignModal.value = true
}

const handleConfirmAssign = () => {
  showAssignModal.value = false
  assignTarget.value = null
  selectedOrder.value = null
}

const handleSaveCourier = () => {
  showAddModal.value = false
  newCourier.name = ''
  newCourier.phone = ''
  newCourier.vehicleType = 'motorcycle'
  newCourier.workStart = '09:00'
  newCourier.workEnd = '22:00'
}

const handleSendSms = () => {
  // Mock SMS invitation
}
</script>
