<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button
          @click="router.push('/partners')"
          class="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
        >
          <ArrowLeft class="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800">
            Otomatik Aktarim Kurallari
          </h1>
          <p class="text-sm text-slate-500 mt-0.5">
            Partner aktarim kurallarini yonetin
          </p>
        </div>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
      >
        <Plus class="w-4 h-4" />
        Yeni Kural
      </button>
    </div>

    <!-- General Settings Card -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div class="flex items-center gap-2 mb-5">
        <Settings class="w-5 h-5 text-slate-500" />
        <h2 class="text-lg font-semibold text-slate-800">
          Genel Ayarlar
        </h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-5">
          <!-- Auto Transfer Toggle -->
          <button
            type="button"
            @click="autoTransfer = !autoTransfer"
            class="flex items-center gap-3 group"
          >
            <ToggleRight v-if="autoTransfer" class="w-8 h-8 text-green-500 group-hover:text-green-600 transition-colors" />
            <ToggleLeft v-else class="w-8 h-8 text-slate-300 group-hover:text-slate-400 transition-colors" />
            <span class="text-sm text-slate-700">
              Otomatik aktarim:
              <span :class="['font-semibold', autoTransfer ? 'text-green-600' : 'text-slate-400']">
                {{ autoTransfer ? 'Acik' : 'Kapali' }}
              </span>
            </span>
          </button>

          <!-- Fallback Toggle -->
          <button
            type="button"
            @click="fallbackEnabled = !fallbackEnabled"
            class="flex items-center gap-3 group"
          >
            <ToggleRight v-if="fallbackEnabled" class="w-8 h-8 text-green-500 group-hover:text-green-600 transition-colors" />
            <ToggleLeft v-else class="w-8 h-8 text-slate-300 group-hover:text-slate-400 transition-colors" />
            <span class="text-sm text-slate-700">Fallback: Bringo kurye musait degilse aktar</span>
          </button>

          <!-- Min SLA -->
          <div class="flex items-center gap-3">
            <label class="text-sm text-slate-700 whitespace-nowrap">
              Min SLA:
            </label>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500">%</span>
              <input
                type="number"
                v-model.number="minSla"
                class="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span class="text-sm text-slate-500">
                alti partnere aktarma
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column - Priority Order -->
        <div>
          <p class="text-sm font-medium text-slate-600 mb-3">
            Oncelik Siralamasi
          </p>
          <div class="space-y-2">
            <div
              v-for="(partner, index) in priorities"
              :key="partner.id"
              class="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-200 transition-colors"
            >
              <GripVertical class="w-4 h-4 text-slate-300 cursor-grab group-hover:text-slate-400 transition-colors" />
              <span class="w-6 h-6 flex items-center justify-center bg-white rounded-full text-xs font-bold text-slate-500 border border-slate-200">
                {{ index + 1 }}
              </span>
              <span class="text-sm font-medium text-slate-700">
                {{ partner.name }}
              </span>
              <span v-if="index < priorities.length - 1" class="text-slate-300 text-xs ml-auto">
                &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rules List -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-800">
          Aktarim Kurallari
        </h2>
        <span class="text-sm text-slate-500">
          {{ rules.filter(r => r.active).length }} aktif /
          {{ rules.length }} toplam
        </span>
      </div>

      <div
        v-for="rule in rules"
        :key="rule.id"
        :class="[
          'bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md',
          rule.active
            ? 'border-l-4 border-l-green-500'
            : 'border-l-4 border-l-slate-300'
        ]"
      >
        <div class="p-5">
          <!-- Rule Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  (colorMap[rule.color] || colorMap.amber).bg
                ]"
              >
                <component
                  :is="iconMap[rule.icon] || Zap"
                  :class="['w-5 h-5', (colorMap[rule.color] || colorMap.amber).text]"
                />
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">
                  {{ rule.name }}
                </h3>
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                    (colorMap[rule.color] || colorMap.amber).badge
                  ]"
                >
                  Bugun: {{ rule.triggerCount }} kez tetiklendi
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="toggleRule(rule.id)"
                class="p-1"
                :title="rule.active ? 'Devre disi birak' : 'Aktiflestir'"
              >
                <ToggleRight v-if="rule.active" class="w-7 h-7 text-green-500 hover:text-green-600 transition-colors" />
                <ToggleLeft v-else class="w-7 h-7 text-slate-300 hover:text-slate-400 transition-colors" />
              </button>
            </div>
          </div>

          <!-- Rule Details -->
          <div class="space-y-2 mb-4">
            <div class="flex items-start gap-2">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16 pt-0.5 shrink-0">
                Kosul
              </span>
              <span class="text-sm text-slate-600">
                {{ rule.condition }}
              </span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16 pt-0.5 shrink-0">
                Aksiyon
              </span>
              <span class="text-sm text-slate-700 font-medium">
                {{ rule.action }}
              </span>
            </div>
            <div v-if="rule.extra" class="flex items-start gap-2">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16 pt-0.5 shrink-0">
                {{ rule.extra.label }}
              </span>
              <span class="text-sm text-slate-600">
                {{ rule.extra.value }}
              </span>
            </div>
          </div>

          <!-- Rule Actions -->
          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              @click="openEditModal(rule)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit class="w-3.5 h-3.5" />
              Duzenle
            </button>
            <button
              @click="deleteRule(rule.id)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Rule Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="closeModal"
      />

      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 class="text-lg font-bold text-slate-800">
            {{ editingRule ? 'Kurali Duzenle' : 'Yeni Kural Olustur' }}
          </h2>
          <button
            @click="closeModal"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Kural Adi -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              Kural Adi
            </label>
            <input
              type="text"
              v-model="modalForm.name"
              placeholder="Orn: Kapasite Asimi Kurali"
              class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          <!-- Kosullar -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-3">
              Kosullar
            </label>
            <div class="space-y-3">
              <div
                v-for="(cond, idx) in modalForm.conditions"
                :key="idx"
                class="flex items-center gap-2"
              >
                <select
                  :value="cond.field"
                  @change="updateCondition(idx, 'field', $event.target.value)"
                  class="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option
                    v-for="f in CONDITION_FIELDS"
                    :key="f.value"
                    :value="f.value"
                  >
                    {{ f.label }}
                  </option>
                </select>
                <select
                  :value="cond.operator"
                  @change="updateCondition(idx, 'operator', $event.target.value)"
                  class="w-40 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option
                    v-for="op in CONDITION_OPERATORS"
                    :key="op.value"
                    :value="op.value"
                  >
                    {{ op.label }}
                  </option>
                </select>
                <input
                  type="text"
                  :value="cond.value"
                  @input="updateCondition(idx, 'value', $event.target.value)"
                  placeholder="Deger"
                  class="w-28 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  v-if="modalForm.conditions.length > 1"
                  @click="removeCondition(idx)"
                  class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              @click="addCondition"
              class="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus class="w-4 h-4" />
              Kosul Ekle
            </button>
          </div>

          <!-- Aksiyon -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-3">
              Aksiyon
            </label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-slate-500 mb-1">
                  Partner
                </label>
                <select
                  v-model="modalForm.partner"
                  class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option v-for="p in PARTNER_OPTIONS" :key="p" :value="p">
                    {{ p }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">
                  Limit (siparis/saat)
                </label>
                <input
                  type="number"
                  v-model="modalForm.limit"
                  placeholder="Orn: 50"
                  class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Kisitlar -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-3">
              Kisitlar
            </label>

            <!-- Bolge Multi-select -->
            <div class="mb-4">
              <label class="block text-xs text-slate-500 mb-2">
                Bolge
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="zone in ZONE_OPTIONS"
                  :key="zone"
                  @click="toggleZone(zone)"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    modalForm.zones.includes(zone)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  ]"
                >
                  {{ zone }}
                </button>
              </div>
            </div>

            <!-- Saat Araligi -->
            <div>
              <label class="block text-xs text-slate-500 mb-2">
                Saat Araligi
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="time"
                  v-model="modalForm.timeStart"
                  class="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span class="text-sm text-slate-400">-</span>
                <input
                  type="time"
                  v-model="modalForm.timeEnd"
                  class="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            @click="closeModal"
            class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Iptal
          </button>
          <button
            @click="handleSaveRule"
            class="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Settings, Plus, Zap, MapPin, Clock, Rocket,
  Edit, Trash2, GripVertical, ToggleLeft, ToggleRight, X,
} from 'lucide-vue-next'

const router = useRouter()

// ---- Constants ----

const PRIORITY_ORDER = [
  { id: 1, name: 'Bringo' },
  { id: 2, name: 'Trendyol' },
  { id: 3, name: 'Paket Taxi' },
  { id: 4, name: 'Getir' },
]

const PARTNER_OPTIONS = ['Trendyol Go', 'Getir Kurye', 'Paket Taxi', 'Bringo', 'En hizli ETA veren partner']

const CONDITION_FIELDS = [
  { value: 'capacity', label: 'Kurye Kapasitesi' },
  { value: 'zone', label: 'Teslimat Bolgesi' },
  { value: 'time', label: 'Saat Araligi' },
  { value: 'pending_orders', label: 'Bekleyen Siparis' },
  { value: 'order_type', label: 'Siparis Tipi' },
  { value: 'eta', label: 'Bringo ETA' },
]

const CONDITION_OPERATORS = [
  { value: 'lt', label: '< Kucuktur' },
  { value: 'gt', label: '> Buyuktur' },
  { value: 'eq', label: '= Esittir' },
  { value: 'gte', label: '>= Buyuk Esit' },
  { value: 'lte', label: '<= Kucuk Esit' },
  { value: 'in', label: 'Icinde' },
]

const ZONE_OPTIONS = [
  'Esenyurt', 'Silivri', 'Catalca', 'Besiktas', 'Kadikoy',
  'Uskudar', 'Bakirkoy', 'Beylikduzu', 'Sariyer', 'Maltepe',
]

const INITIAL_RULES = [
  {
    id: 1,
    name: 'Kapasite Asimi',
    active: true,
    icon: 'zap',
    color: 'amber',
    condition: 'Bringo kurye kapasitesi < %20',
    action: 'Yeni siparisleri Trendyol Go\'ya aktar',
    extra: { label: 'Limit', value: 'Max 50 siparis/saat' },
    triggerCount: 23,
  },
  {
    id: 2,
    name: 'Uzak Bolge',
    active: true,
    icon: 'mappin',
    color: 'blue',
    condition: 'Teslimat bolgesi = Esenyurt, Silivri, Catalca',
    action: 'Direkt Getir Kurye\'ye aktar',
    extra: { label: 'Neden', value: 'Bringo bu bolgelerde operasyon yok' },
    triggerCount: 8,
  },
  {
    id: 3,
    name: 'Peak Saat Destegi',
    active: true,
    icon: 'clock',
    color: 'purple',
    condition: 'Saat 12:00-14:00 VE bekleyen siparis > 100',
    action: '%30 siparisi Paket Taxi\'ye aktar',
    extra: null,
    triggerCount: 2,
  },
  {
    id: 4,
    name: 'Express Siparis',
    active: true,
    icon: 'rocket',
    color: 'rose',
    condition: 'Siparis tipi = Express VE Bringo ETA > 45 dk',
    action: 'En hizli ETA veren partnere aktar',
    extra: null,
    triggerCount: 15,
  },
]

// ---- Icon / Color Maps ----

const iconMap = {
  zap: Zap,
  mappin: MapPin,
  clock: Clock,
  rocket: Rocket,
}

const colorMap = {
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700',
  },
}

// ---- State ----

const autoTransfer = ref(true)
const fallbackEnabled = ref(true)
const minSla = ref(90)
const priorities = ref(PRIORITY_ORDER)
const rules = ref([...INITIAL_RULES])
const modalOpen = ref(false)
const editingRule = ref(null)

const getDefaultModalForm = () => ({
  name: '',
  conditions: [{ field: 'capacity', operator: 'lt', value: '' }],
  partner: PARTNER_OPTIONS[0],
  limit: '',
  zones: [],
  timeStart: '',
  timeEnd: '',
})

const modalForm = reactive(getDefaultModalForm())

// ---- Methods ----

const resetModal = () => {
  editingRule.value = null
  Object.assign(modalForm, getDefaultModalForm())
}

const openCreateModal = () => {
  resetModal()
  modalOpen.value = true
}

const openEditModal = (rule) => {
  editingRule.value = rule
  Object.assign(modalForm, {
    name: rule.name,
    conditions: [{ field: 'capacity', operator: 'lt', value: '20' }],
    partner: PARTNER_OPTIONS[0],
    limit: '50',
    zones: ['Esenyurt'],
    timeStart: '12:00',
    timeEnd: '14:00',
  })
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  resetModal()
}

const handleSaveRule = () => {
  if (editingRule.value) {
    rules.value = rules.value.map((r) =>
      r.id === editingRule.value.id ? { ...r, name: modalForm.name } : r
    )
  } else {
    const newRule = {
      id: Date.now(),
      name: modalForm.name || 'Yeni Kural',
      active: true,
      icon: 'zap',
      color: 'amber',
      condition: 'Ozel kosul',
      action: `${modalForm.partner}'e aktar`,
      extra: modalForm.limit
        ? { label: 'Limit', value: `Max ${modalForm.limit} siparis/saat` }
        : null,
      triggerCount: 0,
    }
    rules.value = [...rules.value, newRule]
  }
  modalOpen.value = false
  resetModal()
}

const toggleRule = (id) => {
  rules.value = rules.value.map((r) =>
    r.id === id ? { ...r, active: !r.active } : r
  )
}

const deleteRule = (id) => {
  rules.value = rules.value.filter((r) => r.id !== id)
}

const addCondition = () => {
  modalForm.conditions = [
    ...modalForm.conditions,
    { field: 'capacity', operator: 'lt', value: '' },
  ]
}

const updateCondition = (index, key, value) => {
  modalForm.conditions = modalForm.conditions.map((c, i) =>
    i === index ? { ...c, [key]: value } : c
  )
}

const removeCondition = (index) => {
  modalForm.conditions = modalForm.conditions.filter((_, i) => i !== index)
}

const toggleZone = (zone) => {
  if (modalForm.zones.includes(zone)) {
    modalForm.zones = modalForm.zones.filter((z) => z !== zone)
  } else {
    modalForm.zones = [...modalForm.zones, zone]
  }
}
</script>
