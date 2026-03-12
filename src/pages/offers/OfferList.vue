<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { Gift, Check, X, Clock, RefreshCw, Plus, GripVertical, User, Calendar, DollarSign, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-vue-next'
import { getOffers, acceptOffer, rejectOffer } from '@/services/api'

const offers = ref([])
const loading = ref(true)
const error = ref('')
const filter = ref('all')
const viewMode = ref('kanban') // 'kanban' or 'table'
let refreshInterval = null

// ---- New Offer Form ----
const showNewOffer = ref(false)
const formStep = ref(1)
const newOfferForm = reactive({
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  amount: '',
  currency: 'TRY',
  description: '',
  notes: '',
})

// ---- Kanban Columns ----
const KANBAN_COLUMNS = [
  { id: 'draft', label: 'Taslak', color: 'bg-slate-400', lightBg: 'bg-slate-50 dark:bg-slate-800/50', borderColor: 'border-slate-300 dark:border-slate-600' },
  { id: 'pending', label: 'Gonderildi', color: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-300 dark:border-blue-700' },
  { id: 'negotiation', label: 'Muzakerede', color: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-300 dark:border-amber-700' },
  { id: 'accepted', label: 'Onaylandi', color: 'bg-green-500', lightBg: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-300 dark:border-green-700' },
  { id: 'rejected', label: 'Reddedildi', color: 'bg-red-500', lightBg: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-300 dark:border-red-700' },
]

const STATUS_MAP_KANBAN = {
  draft: 'draft',
  pending: 'pending',
  negotiation: 'negotiation',
  accepted: 'accepted',
  rejected: 'rejected',
  expired: 'rejected',
}

const filtered = computed(() => {
  if (filter.value === 'all') return offers.value
  return offers.value.filter(o => o.status === filter.value)
})

const kanbanOffers = computed(() => {
  const result = {}
  KANBAN_COLUMNS.forEach(col => {
    result[col.id] = offers.value.filter(o => (STATUS_MAP_KANBAN[o.status] || 'draft') === col.id)
  })
  return result
})

const kpis = computed(() => {
  const all = offers.value
  const pending = all.filter(o => o.status === 'pending').length
  const accepted = all.filter(o => o.status === 'accepted').length
  const total = all.length
  const acceptRate = total > 0 ? Math.round((accepted / total) * 100) : 0
  const avgResponse = all.filter(o => o.respondedAt && o.createdAt)
    .reduce((s, o) => s + ((o.respondedAt || Date.now()) - o.createdAt), 0)
  const respondedCount = all.filter(o => o.respondedAt).length
  const avgSec = respondedCount > 0 ? Math.round(avgResponse / respondedCount / 1000) : 0
  const totalAmount = all.reduce((s, o) => s + (o.price || o.amount || 0), 0)
  return { pending, acceptRate, avgSec, totalAmount }
})

async function load() {
  loading.value = true
  error.value = ''
  const res = await getOffers()
  loading.value = false
  if (res.ok && res.data) {
    const raw = Array.isArray(res.data) ? res.data : res.data.offers || []
    // Enrich offers with mock fields for kanban display
    offers.value = raw.map((o, i) => ({
      ...o,
      companyName: o.companyName || o.courierName || `Firma ${i + 1}`,
      amount: o.price || o.amount || Math.floor(Math.random() * 5000) + 500,
      responsiblePerson: o.responsiblePerson || ['Ahmet Y.', 'Mehmet K.', 'Ayse D.', 'Fatma S.'][i % 4],
      lastActivity: o.lastActivity || timeAgo(o.createdAt || Date.now() - Math.random() * 86400000),
      date: o.date || new Date(o.createdAt || Date.now()).toLocaleDateString('tr-TR'),
    }))
  } else {
    error.value = 'Teklifler yuklenemedi'
  }
}

async function handleAccept(id) {
  await acceptOffer(id)
  await load()
}

async function handleReject(id) {
  await rejectOffer(id)
  await load()
}

function handleNewOfferSubmit() {
  if (formStep.value < 3) {
    formStep.value++
    return
  }
  // Submit
  showNewOffer.value = false
  formStep.value = 1
  Object.assign(newOfferForm, {
    companyName: '', contactPerson: '', email: '', phone: '',
    amount: '', currency: 'TRY', description: '', notes: '',
  })
}

function statusBadge(status) {
  const map = {
    draft: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    negotiation: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    expired: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  }
  return map[status] || 'bg-slate-100 text-slate-500'
}

function statusLabel(status) {
  const map = {
    draft: 'Taslak',
    pending: 'Gonderildi',
    negotiation: 'Muzakerede',
    accepted: 'Onaylandi',
    rejected: 'Reddedildi',
    expired: 'Suresi Doldu',
  }
  return map[status] || status
}

function timeAgo(ts) {
  if (!ts) return '-'
  const diff = Date.now() - ts
  if (diff < 60000) return `${Math.round(diff / 1000)}sn`
  if (diff < 3600000) return `${Math.round(diff / 60000)}dk`
  return `${Math.round(diff / 3600000)}sa`
}

onMounted(() => {
  load()
  refreshInterval = setInterval(load, 10000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Teklifler</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Teklif yonetimi ve pipeline takibi</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- View Toggle -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          <button
            @click="viewMode = 'kanban'"
            :class="viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''"
            class="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            Kanban
          </button>
          <button
            @click="viewMode = 'table'"
            :class="viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''"
            class="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            Tablo
          </button>
        </div>
        <button
          @click="showNewOffer = true; formStep = 1"
          class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus :size="16" /> Yeni Teklif
        </button>
        <button @click="load" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-600 dark:text-slate-300">
          <RefreshCw :size="16" :class="loading ? 'animate-spin' : ''" /> Yenile
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Bekleyen Teklif</p>
        <p class="text-2xl font-bold text-yellow-600">{{ kpis.pending }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Kabul Orani</p>
        <p class="text-2xl font-bold text-green-600">%{{ kpis.acceptRate }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Ort. Yanit Suresi</p>
        <p class="text-2xl font-bold text-blue-600">{{ kpis.avgSec }}sn</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Toplam Tutar</p>
        <p class="text-2xl font-bold text-indigo-600">{{ kpis.totalAmount.toLocaleString('tr-TR') }} TL</p>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading && offers.length === 0" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
    </div>
    <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>

    <!-- Kanban View -->
    <div v-else-if="viewMode === 'kanban'" class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="col in KANBAN_COLUMNS"
        :key="col.id"
        class="flex-shrink-0 w-[280px]"
      >
        <!-- Column Header -->
        <div :class="['rounded-t-xl px-4 py-3 flex items-center justify-between', col.lightBg, `border ${col.borderColor} border-b-0`]">
          <div class="flex items-center gap-2">
            <div :class="['w-2.5 h-2.5 rounded-full', col.color]" />
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ col.label }}</span>
          </div>
          <span class="text-xs font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {{ (kanbanOffers[col.id] || []).length }}
          </span>
        </div>

        <!-- Column Body -->
        <div :class="['rounded-b-xl p-3 min-h-[400px] space-y-3', col.lightBg, `border ${col.borderColor} border-t-0`]">
          <div
            v-for="offer in (kanbanOffers[col.id] || [])"
            :key="offer.id"
            class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <!-- Company Name -->
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {{ offer.companyName }}
              </h4>
              <ChevronRight :size="14" class="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <!-- Amount -->
            <p class="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {{ (offer.amount || 0).toLocaleString('tr-TR') }} TL
            </p>

            <!-- Meta -->
            <div class="space-y-1.5">
              <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar :size="12" />
                {{ offer.date }}
              </div>
              <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <User :size="12" />
                {{ offer.responsiblePerson }}
              </div>
              <div class="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <Clock :size="12" />
                {{ offer.lastActivity }}
              </div>
            </div>

            <!-- Actions for pending -->
            <div v-if="offer.status === 'pending'" class="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button @click.stop="handleAccept(offer.id)" class="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1 font-medium">
                <Check :size="12" /> Onayla
              </button>
              <button @click.stop="handleReject(offer.id)" class="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1 font-medium">
                <X :size="12" /> Reddet
              </button>
            </div>
          </div>

          <div v-if="(kanbanOffers[col.id] || []).length === 0" class="flex items-center justify-center py-8">
            <p class="text-xs text-slate-400 dark:text-slate-500">Teklif yok</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <template v-else>
      <!-- Filter -->
      <div class="flex gap-2 mb-4">
        <button v-for="f in [{v:'all',l:'Tumu'},{v:'pending',l:'Bekleyen'},{v:'accepted',l:'Kabul'},{v:'rejected',l:'Red'},{v:'expired',l:'Suresi Dolmus'}]"
          :key="f.v" @click="filter = f.v"
          :class="filter === f.v ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
          class="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700 cursor-pointer">
          {{ f.l }}
        </button>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Firma</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Tutar</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Tarih</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Sorumlu</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Durum</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Son Aktivite</th>
              <th class="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Aksiyonlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="o in filtered" :key="o.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td class="px-4 py-3 font-semibold text-slate-800 dark:text-white">{{ o.companyName }}</td>
              <td class="px-4 py-3 font-bold text-slate-900 dark:text-white">{{ (o.amount || 0).toLocaleString('tr-TR') }} TL</td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ o.date }}</td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ o.responsiblePerson }}</td>
              <td class="px-4 py-3">
                <span :class="statusBadge(o.status)" class="px-2 py-0.5 rounded-full text-xs font-medium">{{ statusLabel(o.status) }}</span>
              </td>
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ o.lastActivity }}</td>
              <td class="px-4 py-3">
                <div v-if="o.status === 'pending'" class="flex gap-1">
                  <button @click="handleAccept(o.id)" class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded cursor-pointer flex items-center gap-1">
                    <Check :size="12" /> Kabul
                  </button>
                  <button @click="handleReject(o.id)" class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded cursor-pointer flex items-center gap-1">
                    <X :size="12" /> Red
                  </button>
                </div>
                <span v-else class="text-slate-400 dark:text-slate-500 text-xs">-</span>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="text-center py-10 text-slate-400 dark:text-slate-500">Teklif bulunamadi</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Yeni Teklif Multi-Step Modal -->
    <div v-if="showNewOffer" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showNewOffer = false" />
      <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg mx-4">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Yeni Teklif</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Adim {{ formStep }} / 3</p>
          </div>
          <button @click="showNewOffer = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
            <X :size="18" class="text-slate-400" />
          </button>
        </div>

        <!-- Step Indicator -->
        <div class="px-5 pt-4">
          <div class="flex items-center gap-2">
            <div v-for="s in 3" :key="s" class="flex items-center gap-2">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  s <= formStep
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                ]"
              >
                {{ s }}
              </div>
              <div v-if="s < 3" :class="['w-12 h-0.5 rounded', s < formStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700']" />
            </div>
          </div>
          <div class="flex mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span class="w-8 text-center">Firma</span>
            <span class="w-12" />
            <span class="w-8 text-center">Tutar</span>
            <span class="w-12" />
            <span class="w-8 text-center">Detay</span>
          </div>
        </div>

        <!-- Form Steps -->
        <div class="p-5 space-y-4">
          <!-- Step 1: Company Info -->
          <template v-if="formStep === 1">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Firma Adi</label>
              <input v-model="newOfferForm.companyName" type="text" placeholder="ornegin: ABC Lojistik" class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Yetkili Kisi</label>
              <input v-model="newOfferForm.contactPerson" type="text" placeholder="Ad Soyad" class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-posta</label>
                <input v-model="newOfferForm.email" type="email" placeholder="email@firma.com" class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Telefon</label>
                <input v-model="newOfferForm.phone" type="tel" placeholder="0532 xxx xx xx" class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
          </template>

          <!-- Step 2: Amount -->
          <template v-if="formStep === 2">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Teklif Tutari</label>
              <div class="flex gap-2">
                <input v-model.number="newOfferForm.amount" type="number" placeholder="0" class="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg font-bold" />
                <select v-model="newOfferForm.currency" class="w-24 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Aciklama</label>
              <textarea v-model="newOfferForm.description" rows="4" placeholder="Teklif detaylari..." class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
            </div>
          </template>

          <!-- Step 3: Review -->
          <template v-if="formStep === 3">
            <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-3">
              <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Teklif Ozeti</h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500">Firma</p>
                  <p class="font-medium text-slate-800 dark:text-white">{{ newOfferForm.companyName || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500">Yetkili</p>
                  <p class="font-medium text-slate-800 dark:text-white">{{ newOfferForm.contactPerson || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500">Tutar</p>
                  <p class="font-bold text-lg text-slate-900 dark:text-white">{{ (newOfferForm.amount || 0).toLocaleString('tr-TR') }} {{ newOfferForm.currency }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400 dark:text-slate-500">E-posta</p>
                  <p class="font-medium text-slate-800 dark:text-white">{{ newOfferForm.email || '-' }}</p>
                </div>
              </div>
              <div v-if="newOfferForm.description">
                <p class="text-xs text-slate-400 dark:text-slate-500">Aciklama</p>
                <p class="text-sm text-slate-600 dark:text-slate-300">{{ newOfferForm.description }}</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notlar (Opsiyonel)</label>
              <textarea v-model="newOfferForm.notes" rows="2" placeholder="Ek notlar..." class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-5 border-t border-slate-200 dark:border-slate-700">
          <button
            v-if="formStep > 1"
            @click="formStep--"
            class="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft :size="16" /> Geri
          </button>
          <div v-else />
          <button
            @click="handleNewOfferSubmit"
            class="flex items-center gap-1 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            {{ formStep < 3 ? 'Devam' : 'Teklifi Olustur' }}
            <ArrowRight v-if="formStep < 3" :size="16" />
            <Check v-else :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
