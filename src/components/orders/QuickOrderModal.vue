<template>
  <div
    v-if="props.isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center"
  >
    <div
      class="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
      @click.stop
    >
      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
        <div class="flex items-center gap-2">
          <Zap class="h-5 w-5 text-yellow-300" />
          <h2 class="text-lg font-extrabold tracking-wide text-white">HIZLI SİPARİŞ</h2>
        </div>
        <button
          @click="emit('close')"
          class="rounded-lg p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- ── Body ────────────────────────────────────────────────────────── -->
      <div class="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto px-6 py-5">
        <!-- ── 1. Project & Branch ──────────────────────────────────────── -->
        <section>
          <div :class="sectionTitle">
            <Package class="h-4 w-4 text-indigo-500" />
            Proje &amp; Şube
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label :class="labelBase">Proje</label>
              <div class="relative">
                <select
                  v-model="project"
                  :class="selectBase"
                >
                  <option v-for="p in PROJECTS" :key="p" :value="p">
                    {{ p }}
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label :class="labelBase">Şube</label>
              <div class="relative">
                <select
                  v-model="branch"
                  :class="selectBase"
                >
                  <option v-for="b in BRANCHES" :key="b" :value="b">
                    {{ b }}
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </section>

        <hr class="border-gray-100" />

        <!-- ── 2. Customer Search ───────────────────────────────────────── -->
        <section>
          <div :class="sectionTitle">
            <Phone class="h-4 w-4 text-indigo-500" />
            Telefon ile Müşteri Bul
          </div>

          <div class="relative" ref="customerDropdownRef">
            <div class="flex gap-2">
              <div class="relative flex-1">
                <Phone class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref="phoneRef"
                  type="text"
                  :value="phoneInput"
                  @input="handlePhoneChange"
                  placeholder="0532 ___ __ __"
                  :class="`${inputBase} pl-9`"
                />
              </div>
              <button
                @click="handleSearchClick"
                class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97]"
              >
                <Search class="h-4 w-4" />
                Ara
              </button>
            </div>

            <!-- Customer dropdown -->
            <div
              v-if="showCustomerDropdown"
              class="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
            >
              <template v-if="customerResults.length > 0">
                <button
                  v-for="c in customerResults"
                  :key="c.id"
                  @click="selectCustomer(c)"
                  class="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition last:border-0 hover:bg-indigo-50"
                >
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <User class="h-4 w-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="truncate text-sm font-semibold text-gray-900">
                        {{ c.name }}
                      </span>
                      <span
                        v-if="c.vip"
                        class="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700"
                      >
                        <Star class="h-3 w-3" />
                        VIP
                      </span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                      <span>{{ c.phone }}</span>
                      <span class="text-gray-300">|</span>
                      <span>{{ c.district }}</span>
                      <span class="text-gray-300">|</span>
                      <span>{{ c.orderCount }} sipariş</span>
                    </div>
                    <div class="mt-0.5 text-[11px] text-gray-400">
                      Son sipariş: {{ c.lastOrder }}
                    </div>
                  </div>
                </button>
              </template>
              <div v-else class="px-4 py-3 text-center text-sm text-gray-500">
                Eşleşen müşteri bulunamadı
              </div>
              <button
                @click="handleNewCustomer"
                class="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
              >
                <Plus class="h-4 w-4" />
                Yeni müşteri olarak ekle
              </button>
            </div>
          </div>

          <!-- Customer info card -->
          <div
            v-if="selectedCustomer"
            class="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"
          >
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {{ selectedCustomer.name.split(' ').map((n) => n[0]).join('') }}
                </div>
                <div>
                  <div class="flex items-center gap-2 text-sm font-bold text-gray-900">
                    {{ selectedCustomer.name }}
                    <span
                      v-if="selectedCustomer.vip"
                      class="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700"
                    >
                      <Star class="h-3 w-3" />
                      VIP
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">{{ selectedCustomer.phone }}</div>
                </div>
              </div>
              <button
                @click="clearSelectedCustomer"
                class="rounded p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
              >
                <X class="h-3.5 w-3.5" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
              <div>
                <span class="text-gray-500">Sipariş:</span>
                {{ ' ' }}
                <span class="font-semibold text-gray-700">{{ selectedCustomer.orderCount }}</span>
              </div>
              <div>
                <span class="text-gray-500">Ort. Tutar:</span>
                {{ ' ' }}
                <span class="font-semibold text-gray-700">{{ selectedCustomer.avgSpend }} &#8378;</span>
              </div>
              <div>
                <span class="text-gray-500">Ödeme:</span>
                {{ ' ' }}
                <span class="font-semibold text-gray-700">{{ selectedCustomer.paymentPref }}</span>
              </div>
              <div>
                <span class="text-gray-500">Son Sipariş:</span>
                {{ ' ' }}
                <span class="font-semibold text-gray-700">{{ selectedCustomer.lastOrder }}</span>
              </div>
            </div>

            <div
              v-if="selectedCustomer.notes"
              class="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700"
            >
              <AlertTriangle class="mt-0.5 h-3 w-3 shrink-0" />
              {{ selectedCustomer.notes }}
            </div>

            <!-- Saved addresses -->
            <div v-if="selectedCustomer.addresses.length > 0" class="mt-3">
              <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Kayıtlı Adresler
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(a, i) in selectedCustomer.addresses"
                  :key="i"
                  @click="selectSavedAddress(a)"
                  :class="[
                    'rounded-lg border px-3 py-1.5 text-left text-xs transition',
                    address === a.full
                      ? 'border-indigo-400 bg-indigo-100 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50',
                  ]"
                >
                  <span class="font-semibold">{{ a.label }}:</span> {{ a.full }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <hr class="border-gray-100" />

        <!-- ── 3. Customer Info ─────────────────────────────────────────── -->
        <section>
          <div :class="sectionTitle">
            <User class="h-4 w-4 text-indigo-500" />
            Müşteri Bilgileri
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label :class="labelBase">Ad Soyad</label>
              <input
                type="text"
                v-model="customerName"
                placeholder="Müşteri adı"
                :class="inputBase"
              />
            </div>
            <div>
              <label :class="labelBase">Telefon</label>
              <input
                type="text"
                :value="phoneInput"
                readonly
                :class="`${inputBase} bg-gray-50 text-gray-500`"
              />
            </div>
          </div>
        </section>

        <hr class="border-gray-100" />

        <!-- ── 4. Address ──────────────────────────────────────────────── -->
        <section>
          <div :class="sectionTitle">
            <MapPin class="h-4 w-4 text-indigo-500" />
            Adres
          </div>

          <div class="space-y-3">
            <div class="relative" ref="addressDropdownRef">
              <label :class="labelBase">Adres</label>
              <div class="relative">
                <MapPin class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  :value="address"
                  @input="handleAddressChange"
                  @focus="handleAddressFocus"
                  placeholder="Adres aramaya başlayın..."
                  :class="`${inputBase} pl-9`"
                />
              </div>

              <div
                v-if="showAddressSuggestions"
                class="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <button
                  v-for="(a, i) in addressSuggestions"
                  :key="i"
                  @click="selectAddress(a)"
                  class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-indigo-50"
                >
                  <MapPin class="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {{ a }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label :class="labelBase">Bina / Kat</label>
                <input
                  type="text"
                  v-model="addressDetail"
                  placeholder="Bina no, kat, daire"
                  :class="inputBase"
                />
              </div>
              <div>
                <label :class="labelBase">Not (Teslimat notu)</label>
                <input
                  type="text"
                  v-model="deliveryNote"
                  placeholder="Kapı kodu, yol tarifi..."
                  :class="inputBase"
                />
              </div>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
            >
              <MapPin class="h-3.5 w-3.5" />
              Haritada Göster
            </button>
          </div>
        </section>

        <hr class="border-gray-100" />

        <!-- ── 5. Order ────────────────────────────────────────────────── -->
        <section>
          <div :class="sectionTitle">
            <Package class="h-4 w-4 text-indigo-500" />
            Sipariş
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label :class="labelBase">Harici No (opsiyonel)</label>
              <input
                type="text"
                v-model="externalRef"
                placeholder="Dış sistem referansı"
                :class="inputBase"
              />
            </div>
            <div>
              <label :class="labelBase">Tutar</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                  &#8378;
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  v-model="amount"
                  placeholder="0.00"
                  :class="`${inputBase} pl-8`"
                />
              </div>
            </div>
          </div>

          <div class="mt-3">
            <label :class="labelBase">Ödeme Yöntemi</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in paymentOptions"
                :key="opt.value"
                type="button"
                @click="paymentMethod = opt.value"
                :class="[
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition',
                  paymentMethod === opt.value
                    ? `border-${opt.color}-400 bg-${opt.color}-50 text-${opt.color}-700 ring-2 ring-${opt.color}-500/20`
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                ]"
              >
                <component :is="opt.icon" class="h-4 w-4" />
                {{ opt.label }}
              </button>
            </div>
          </div>
        </section>

        <hr class="border-gray-100" />

        <!-- ── 6. Delivery ─────────────────────────────────────────────── -->
        <section>
          <div :class="sectionTitle">
            <Clock class="h-4 w-4 text-indigo-500" />
            Teslimat
          </div>

          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in deliveryOptions"
                :key="opt.value"
                type="button"
                @click="deliveryType = opt.value"
                :class="[
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition',
                  deliveryType === opt.value
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                ]"
              >
                <component :is="opt.icon" class="h-4 w-4" />
                {{ opt.label }}
              </button>
            </div>

            <div v-if="deliveryType === 'today'">
              <label :class="labelBase">Zaman Dilimi</label>
              <div class="relative">
                <select
                  v-model="timeSlot"
                  :class="selectBase"
                >
                  <option v-for="s in TIME_SLOTS" :key="s" :value="s">
                    {{ s }}
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div v-if="deliveryType === 'scheduled'">
              <label :class="labelBase">Tarih</label>
              <input
                type="date"
                v-model="selectedDate"
                :min="todayISO"
                :class="inputBase"
              />
            </div>

            <div>
              <label :class="labelBase">Öncelik</label>
              <div class="relative">
                <select
                  v-model="priority"
                  :class="selectBase"
                >
                  <option value="normal">Normal</option>
                  <option value="high">Yüksek</option>
                  <option value="urgent">Acil</option>
                </select>
                <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <AlertTriangle
                  v-if="priority === 'urgent'"
                  class="pointer-events-none absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- ── Footer ──────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-4">
        <button
          @click="handleCancel"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          İptal
        </button>
        <div class="flex gap-2">
          <button
            @click="handleSaveAndNew"
            class="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-100"
          >
            Kaydet + Yeni
          </button>
          <button
            @click="handleSave"
            class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97]"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  X,
  Search,
  Phone,
  MapPin,
  Clock,
  Package,
  CreditCard,
  Banknote,
  Star,
  AlertTriangle,
  User,
  ChevronDown,
  Zap,
  Calendar,
  Plus,
} from 'lucide-vue-next'

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: 'Ayşe Yılmaz',
    phone: '0532 412 78 90',
    district: 'Kadıköy',
    vip: true,
    orderCount: 47,
    avgSpend: 285,
    lastOrder: '2026-02-11',
    paymentPref: 'Kart',
    notes: 'Kapıda beklemeyin, zili çalın.',
    addresses: [
      { label: 'Ev', full: 'Moda Caddesi No:12/4, Caferağa, Kadıköy/İstanbul', detail: 'Bina: 12, Kat: 4' },
      { label: 'İş', full: 'Bağdat Caddesi No:200, Suadiye, Kadıköy/İstanbul', detail: 'Plaza B Blok, Kat: 7' },
    ],
  },
  {
    id: 2,
    name: 'Mehmet Kaya',
    phone: '0545 678 34 12',
    district: 'Beşiktaş',
    vip: false,
    orderCount: 12,
    avgSpend: 150,
    lastOrder: '2026-02-08',
    paymentPref: 'Kapıda Nakit',
    notes: '',
    addresses: [
      { label: 'Ev', full: 'Barbaros Bulvarı No:45/2, Beşiktaş/İstanbul', detail: 'Kat: 2, Daire: 5' },
    ],
  },
  {
    id: 3,
    name: 'Zeynep Demir',
    phone: '0533 901 22 55',
    district: 'Şişli',
    vip: true,
    orderCount: 31,
    avgSpend: 420,
    lastOrder: '2026-02-12',
    paymentPref: 'Ödenmiş',
    notes: 'Hassas ürünlere dikkat.',
    addresses: [
      { label: 'Ev', full: 'Halaskargazi Caddesi No:88, Osmanbey, Şişli/İstanbul', detail: 'Kat: 3, Daire: 9' },
    ],
  },
  {
    id: 4,
    name: 'Ali Öztürk',
    phone: '0542 333 11 77',
    district: 'Üsküdar',
    vip: false,
    orderCount: 5,
    avgSpend: 95,
    lastOrder: '2026-01-29',
    paymentPref: 'Kart',
    notes: '',
    addresses: [
      { label: 'Ev', full: 'Selimiye Caddesi No:7, Üsküdar/İstanbul', detail: 'Kat: 1' },
    ],
  },
  {
    id: 5,
    name: 'Fatma Çelik',
    phone: '0535 888 44 60',
    district: 'Kadıköy',
    vip: false,
    orderCount: 19,
    avgSpend: 210,
    lastOrder: '2026-02-10',
    paymentPref: 'Kapıda Nakit',
    notes: 'Bahçe kapısından girin.',
    addresses: [
      { label: 'Ev', full: 'Bahariye Caddesi No:56/1, Kadıköy/İstanbul', detail: 'Giriş kat' },
      { label: 'Diğer', full: 'Fenerbahçe Mahallesi, Münir Nurettin Sk. No:3, Kadıköy/İstanbul', detail: 'Kat: 5, Daire: 10' },
    ],
  },
]

const ADDRESS_SUGGESTIONS = [
  'Moda Caddesi, Caferağa, Kadıköy/İstanbul',
  'Bağdat Caddesi, Suadiye, Kadıköy/İstanbul',
  'Barbaros Bulvarı, Beşiktaş/İstanbul',
  'Halaskargazi Caddesi, Osmanbey, Şişli/İstanbul',
  'Selimiye Caddesi, Üsküdar/İstanbul',
  'Bahariye Caddesi, Kadıköy/İstanbul',
  'İstiklal Caddesi, Beyoğlu/İstanbul',
  'Nişantaşı, Abdi İpekçi Caddesi, Şişli/İstanbul',
  'Acıbadem Caddesi, Acıbadem, Kadıköy/İstanbul',
  'Altunizade Mahallesi, Üsküdar/İstanbul',
]

const PROJECTS = ['File Market', 'Express Teslimat', 'Gıda Dağıtım', 'E-Ticaret Lojistik']
const BRANCHES = ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar']
const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatPhoneDisplay(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.length <= 4) return digits
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
  if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`
}

function stripPhone(val) {
  return val.replace(/\D/g, '')
}

// ── Props & Emits ────────────────────────────────────────────────────────────
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save'])

// ── Reactive State ───────────────────────────────────────────────────────────
const project = ref(PROJECTS[0])
const branch = ref(BRANCHES[0])
const phoneInput = ref('')
const customerResults = ref([])
const showCustomerDropdown = ref(false)
const selectedCustomer = ref(null)
const customerName = ref('')
const address = ref('')
const addressSuggestions = ref([])
const showAddressSuggestions = ref(false)
const addressDetail = ref('')
const deliveryNote = ref('')
const externalRef = ref('')
const amount = ref('')
const paymentMethod = ref('cash')
const deliveryType = ref('express')
const timeSlot = ref(TIME_SLOTS[0])
const selectedDate = ref('')
const priority = ref('normal')

// ── DOM Refs ─────────────────────────────────────────────────────────────────
const phoneRef = ref(null)
const customerDropdownRef = ref(null)
const addressDropdownRef = ref(null)

// ── Static option arrays for template ────────────────────────────────────────
const paymentOptions = [
  { value: 'cash', label: 'Kapıda Nakit', icon: Banknote, color: 'emerald' },
  { value: 'card', label: 'Kart', icon: CreditCard, color: 'blue' },
  { value: 'paid', label: 'Ödenmiş', icon: CreditCard, color: 'violet' },
]

const deliveryOptions = [
  { value: 'express', label: 'Hemen (Express)', icon: Zap },
  { value: 'today', label: 'Bugün', icon: Clock },
  { value: 'scheduled', label: 'Tarih Seç', icon: Calendar },
]

// ── Computed ─────────────────────────────────────────────────────────────────
const todayISO = new Date().toISOString().split('T')[0]

// ── CSS class constants ──────────────────────────────────────────────────────
const inputBase =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
const selectBase =
  'w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
const labelBase = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'
const sectionTitle = 'mb-3 flex items-center gap-2 text-sm font-bold text-gray-700'

// ── Focus phone on open ──────────────────────────────────────────────────────
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        setTimeout(() => phoneRef.value?.focus(), 150)
      })
    }
  }
)

// ── Close dropdowns on outside click ─────────────────────────────────────────
function handleOutsideClick(e) {
  if (customerDropdownRef.value && !customerDropdownRef.value.contains(e.target)) {
    showCustomerDropdown.value = false
  }
  if (addressDropdownRef.value && !addressDropdownRef.value.contains(e.target)) {
    showAddressSuggestions.value = false
  }
}

// ── Keyboard: Escape to close ────────────────────────────────────────────────
function handleKeyDown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  document.removeEventListener('keydown', handleKeyDown)
})

// ── Phone search ─────────────────────────────────────────────────────────────
function handlePhoneChange(e) {
  const raw = stripPhone(e.target.value)
  if (raw.length > 11) return
  const formatted = formatPhoneDisplay(raw)
  phoneInput.value = formatted

  if (raw.length >= 7) {
    const matches = MOCK_CUSTOMERS.filter((c) => stripPhone(c.phone).includes(raw))
    customerResults.value = matches
    showCustomerDropdown.value = true
  } else {
    customerResults.value = []
    showCustomerDropdown.value = false
  }
}

function handleSearchClick() {
  const raw = stripPhone(phoneInput.value)
  if (raw.length >= 4) {
    const matches = MOCK_CUSTOMERS.filter((c) => stripPhone(c.phone).includes(raw))
    customerResults.value = matches
    showCustomerDropdown.value = true
  }
}

function selectCustomer(customer) {
  selectedCustomer.value = customer
  customerName.value = customer.name
  phoneInput.value = customer.phone
  showCustomerDropdown.value = false
  if (customer.addresses.length > 0) {
    address.value = customer.addresses[0].full
    addressDetail.value = customer.addresses[0].detail
  }
}

function handleNewCustomer() {
  selectedCustomer.value = null
  customerName.value = ''
  showCustomerDropdown.value = false
}

function clearSelectedCustomer() {
  selectedCustomer.value = null
  customerName.value = ''
  address.value = ''
  addressDetail.value = ''
}

// ── Address search ───────────────────────────────────────────────────────────
function handleAddressChange(e) {
  const val = e.target.value
  address.value = val
  if (val.length >= 2) {
    const filtered = ADDRESS_SUGGESTIONS.filter((a) =>
      a.toLocaleLowerCase('tr').includes(val.toLocaleLowerCase('tr'))
    )
    addressSuggestions.value = filtered
    showAddressSuggestions.value = filtered.length > 0
  } else {
    showAddressSuggestions.value = false
  }
}

function handleAddressFocus() {
  if (address.value.length >= 2) {
    const filtered = ADDRESS_SUGGESTIONS.filter((a) =>
      a.toLocaleLowerCase('tr').includes(address.value.toLocaleLowerCase('tr'))
    )
    if (filtered.length > 0) {
      addressSuggestions.value = filtered
      showAddressSuggestions.value = true
    }
  }
}

function selectAddress(addr) {
  address.value = addr
  showAddressSuggestions.value = false
}

function selectSavedAddress(addr) {
  address.value = addr.full
  addressDetail.value = addr.detail
}

// ── Save ─────────────────────────────────────────────────────────────────────
function buildOrder() {
  return {
    project: project.value,
    branch: branch.value,
    customer: {
      name: customerName.value,
      phone: phoneInput.value,
      existingId: selectedCustomer.value?.id || null,
    },
    address: {
      full: address.value,
      detail: addressDetail.value,
      note: deliveryNote.value,
    },
    order: {
      externalRef: externalRef.value,
      amount: parseFloat(amount.value) || 0,
      paymentMethod: paymentMethod.value,
    },
    delivery: {
      type: deliveryType.value,
      timeSlot: deliveryType.value === 'today' ? timeSlot.value : null,
      date: deliveryType.value === 'scheduled' ? selectedDate.value : null,
      priority: priority.value,
    },
  }
}

function handleSave() {
  emit('save', buildOrder())
  resetForm()
  emit('close')
}

function handleSaveAndNew() {
  emit('save', buildOrder())
  resetForm()
  setTimeout(() => phoneRef.value?.focus(), 100)
}

function handleCancel() {
  resetForm()
  emit('close')
}

function resetForm() {
  phoneInput.value = ''
  customerResults.value = []
  showCustomerDropdown.value = false
  selectedCustomer.value = null
  customerName.value = ''
  address.value = ''
  addressDetail.value = ''
  deliveryNote.value = ''
  externalRef.value = ''
  amount.value = ''
  paymentMethod.value = 'cash'
  deliveryType.value = 'express'
  timeSlot.value = TIME_SLOTS[0]
  selectedDate.value = ''
  priority.value = 'normal'
}
</script>
