<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Restoran Ayarlari</h1>
        <p class="text-sm text-slate-500 mt-1">Restoran yapilandirma ve tercihlerinizi yonetin</p>
      </div>
      <div v-if="saved" class="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
        <Check :size="16" /> Kaydedildi
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer',
          activeTab === tab.id
            ? 'bg-primary text-white'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        ]"
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.label }}
      </button>
    </div>

    <!-- ===================== GENEL TAB ===================== -->
    <div v-if="activeTab === 'genel'" class="max-w-3xl space-y-6">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Store :size="18" class="text-slate-500" /> Genel Bilgiler
        </h3>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Restoran Adi</label>
            <input
              type="text"
              v-model="genel.name"
              class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
            <input
              type="text"
              v-model="genel.phone"
              class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Adres</label>
            <textarea
              v-model="genel.address"
              :rows="3"
              class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      <!-- Calisma Saatleri -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Settings :size="18" class="text-slate-500" /> Calisma Saatleri
        </h3>
        <div class="space-y-3">
          <div v-for="day in DAYS" :key="day.key" class="flex items-center gap-4">
            <span class="text-sm font-medium text-slate-700 w-28">{{ day.label }}</span>
            <input
              type="time"
              v-model="hours[day.key].start"
              class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            />
            <span class="text-slate-400 text-sm">-</span>
            <input
              type="time"
              v-model="hours[day.key].end"
              class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="handleSave"
          class="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Save :size="16" /> Kaydet
        </button>
      </div>
    </div>

    <!-- ===================== HAVUZ TAB ===================== -->
    <div v-if="activeTab === 'havuz'" class="max-w-3xl space-y-6">
      <!-- Otomatik Havuz Kurallari -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-5">Otomatik havuza at:</h3>
        <div class="space-y-4">
          <!-- Tum kuryeler doluysa -->
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              v-model="havuz.allCouriersBusy"
              class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
            />
            <span class="text-sm text-slate-700">Tum kuryeler doluysa</span>
          </label>

          <!-- Bolge cok uzaksa -->
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              v-model="havuz.regionFar"
              class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
            />
            <span class="text-sm text-slate-700">Bolge cok uzaksa (&gt;</span>
            <input
              type="number"
              v-model.number="havuz.regionFarKm"
              class="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <span class="text-sm text-slate-700">km)</span>
          </div>

          <!-- Belirli saatlerde -->
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              v-model="havuz.specificHours"
              class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
            />
            <span class="text-sm text-slate-700">Belirli saatlerde</span>
            <input
              type="time"
              v-model="havuz.specificHoursStart"
              :disabled="!havuz.specificHours"
              class="px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer disabled:opacity-50"
            />
            <span class="text-slate-400 text-sm">-</span>
            <input
              type="time"
              v-model="havuz.specificHoursEnd"
              :disabled="!havuz.specificHours"
              class="px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <!-- Tercih Edilen Partner Sirasi -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-5">Tercih edilen partner sirasi:</h3>
        <div class="space-y-2">
          <div
            v-for="(partner, index) in partnerOrder"
            :key="partner.id"
            class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
          >
            <GripVertical :size="16" class="text-slate-400 cursor-grab" />
            <span class="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
              {{ index + 1 }}
            </span>
            <span class="text-sm font-medium text-slate-700">{{ partner.name }}</span>
          </div>
        </div>
      </div>

      <!-- Maksimum Havuz Maliyeti -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-4">Maksimum havuz maliyeti:</h3>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500">&#8378;</span>
          <input
            type="number"
            v-model.number="havuz.maxCost"
            class="w-24 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <span class="text-sm text-slate-500">/ siparis</span>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="handleSave"
          class="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Save :size="16" /> Kaydet
        </button>
      </div>
    </div>

    <!-- ===================== KURYELER TAB ===================== -->
    <div v-if="activeTab === 'kuryeler'" class="max-w-3xl space-y-6">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Truck :size="18" class="text-slate-500" /> Kurye Ayarlari
        </h3>
        <div class="space-y-6">
          <!-- Max siparis / kurye -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              Max siparis / kurye
            </label>
            <input
              type="number"
              v-model.number="kuryeler.maxOrdersPerCourier"
              class="w-24 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <!-- Otomatik atama toggle -->
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-medium text-slate-700">Otomatik atama</span>
              <p class="text-xs text-slate-400 mt-0.5">Siparisleri kuryeye otomatik ata</p>
            </div>
            <label class="relative cursor-pointer">
              <input
                type="checkbox"
                v-model="kuryeler.autoAssign"
                class="sr-only peer"
              />
              <div class="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors" />
              <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
            </label>
          </div>
        </div>
      </div>

      <!-- Kurye Uygulamasi -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-2">Kurye uygulamasi</h3>
        <p class="text-sm text-slate-500 mb-4">SMS ile kurye davet linki gonder</p>
        <div class="flex items-center gap-3">
          <input
            type="tel"
            v-model="kuryeler.invitePhone"
            placeholder="0 5XX XXX XX XX"
            class="flex-1 max-w-xs px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
          />
          <button class="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
            <Send :size="16" /> Gonder
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== BILDIRIMLER TAB ===================== -->
    <div v-if="activeTab === 'bildirimler'" class="max-w-3xl space-y-6">
      <!-- Bildirim Tercihleri -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Bell :size="18" class="text-slate-500" /> Bildirim Tercihleri
        </h3>
        <div class="space-y-3">
          <label
            v-for="item in notificationItems"
            :key="item.key"
            class="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="bildirimler[item.key]"
              class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
            />
            <span class="text-sm text-slate-700">{{ item.label }}</span>
          </label>
        </div>
      </div>

      <!-- Bildirim Kanallari -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-5">Bildirim kanallari</h3>
        <div class="space-y-4">
          <div
            v-for="ch in channelItems"
            :key="ch.key"
            class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
          >
            <span class="text-sm font-medium text-slate-700">{{ ch.label }}</span>
            <label class="relative cursor-pointer">
              <input
                type="checkbox"
                v-model="bildirimler[ch.key]"
                class="sr-only peer"
              />
              <div class="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors" />
              <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== ENTEGRASYONLAR TAB ===================== -->
    <div v-if="activeTab === 'entegrasyonlar'" class="max-w-3xl space-y-6">
      <!-- Platform Baglantilari -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Link :size="18" class="text-slate-500" /> Platform Baglantilari
        </h3>
        <div class="space-y-3">
          <div
            v-for="platform in INTEGRATIONS"
            :key="platform.id"
            class="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50"
          >
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'w-3 h-3 rounded-full',
                  platform.connected ? 'bg-green-500' : 'bg-slate-400'
                ]"
              />
              <span class="text-sm font-medium text-slate-800">{{ platform.name }}</span>
              <span
                :class="[
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  platform.connected
                    ? 'bg-green-50 text-green-600'
                    : 'bg-slate-100 text-slate-500'
                ]"
              >
                {{ platform.connected ? 'Bagli' : 'Bagli Degil' }}
              </span>
            </div>
            <button
              :class="[
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer',
                platform.connected
                  ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'bg-primary text-white hover:bg-primary-dark'
              ]"
            >
              {{ platform.connected ? 'Ayarlar' : 'Baglan' }}
            </button>
          </div>
        </div>
      </div>

      <!-- API Key -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-4">API Anahtari</h3>
        <div class="flex items-center gap-3">
          <code class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600">
            brn_rest_xxxxxxxx
          </code>
          <button
            @click="handleCopyApiKey"
            class="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <template v-if="apiKeyCopied">
              <Check :size="16" class="text-green-500" /> Kopyalandi
            </template>
            <template v-else>
              <Copy :size="16" /> Kopyala
            </template>
          </button>
        </div>
      </div>

      <!-- Webhook URL -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-semibold text-slate-800 mb-4">Webhook URL</h3>
        <code class="block px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 break-all">
          https://api.heybringo.com/webhooks/restaurant/lezzet-cafe
        </code>
        <p class="text-xs text-slate-400 mt-2">
          Bu URL uzerinden siparis ve teslimat bildirimlerini alabilirsiniz.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  Settings, Store, Truck, Bell, Link, Copy, Check, Save, Send,
  GripVertical
} from 'lucide-vue-next'

// ---- Mock Data ----

const DAYS = [
  { key: 'mon', label: 'Pazartesi' },
  { key: 'tue', label: 'Sali' },
  { key: 'wed', label: 'Carsamba' },
  { key: 'thu', label: 'Persembe' },
  { key: 'fri', label: 'Cuma' },
  { key: 'sat', label: 'Cumartesi' },
  { key: 'sun', label: 'Pazar' },
]

const INTEGRATIONS = [
  { id: 'yemeksepeti', name: 'Yemeksepeti', connected: true },
  { id: 'getir', name: 'Getir Yemek', connected: true },
  { id: 'trendyol', name: 'Trendyol Yemek', connected: false },
]

const TABS = [
  { id: 'genel', label: 'Genel', icon: Store },
  { id: 'havuz', label: 'Havuz', icon: Truck },
  { id: 'kuryeler', label: 'Kuryeler', icon: Truck },
  { id: 'bildirimler', label: 'Bildirimler', icon: Bell },
  { id: 'entegrasyonlar', label: 'Entegrasyonlar', icon: Link },
]

const notificationItems = [
  { key: 'newOrder', label: 'Yeni siparis bildirimi' },
  { key: 'courierOffline', label: 'Kurye offline bildirimi' },
  { key: 'slaWarning', label: 'SLA uyarisi' },
  { key: 'dailyCostReport', label: 'Havuz maliyet raporu (gunluk)' },
  { key: 'deliveryComplete', label: 'Teslimat tamamlandi' },
]

const channelItems = [
  { key: 'channelEmail', label: 'Email' },
  { key: 'channelSms', label: 'SMS' },
  { key: 'channelPush', label: 'Push' },
]

// ---- State ----

const activeTab = ref('genel')
const saved = ref(false)

// Genel
const genel = reactive({
  name: 'Lezzet Cafe',
  phone: '0216 555 12 34',
  address: 'Caferaga Mah. Moda Cad. No:12 Kadikoy/Istanbul',
})
const hours = reactive({
  mon: { start: '09:00', end: '22:00' },
  tue: { start: '09:00', end: '22:00' },
  wed: { start: '09:00', end: '22:00' },
  thu: { start: '09:00', end: '22:00' },
  fri: { start: '09:00', end: '23:00' },
  sat: { start: '10:00', end: '23:00' },
  sun: { start: '10:00', end: '21:00' },
})

// Havuz
const havuz = reactive({
  allCouriersBusy: true,
  regionFar: true,
  regionFarKm: 5,
  specificHours: false,
  specificHoursStart: '12:00',
  specificHoursEnd: '14:00',
  maxCost: 50,
})
const partnerOrder = ref([
  { id: 1, name: 'Bringo' },
  { id: 2, name: 'Trendyol Go' },
  { id: 3, name: 'Paket Taxi' },
])

// Kuryeler
const kuryeler = reactive({
  maxOrdersPerCourier: 5,
  autoAssign: true,
  invitePhone: '',
})

// Bildirimler
const bildirimler = reactive({
  newOrder: true,
  courierOffline: true,
  slaWarning: true,
  dailyCostReport: false,
  deliveryComplete: true,
  channelEmail: true,
  channelSms: false,
  channelPush: true,
})

// Entegrasyonlar
const apiKeyCopied = ref(false)

// ---- Methods ----

const handleSave = () => {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2500)
}

const handleCopyApiKey = () => {
  navigator.clipboard.writeText('brn_rest_xxxxxxxx')
  apiKeyCopied.value = true
  setTimeout(() => { apiKeyCopied.value = false }, 2000)
}
</script>
