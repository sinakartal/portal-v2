<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button
          @click="router.push('/partners')"
          class="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
        >
          <ArrowLeft class="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">
            Otomatik Aktarim Kurallari
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
      <div class="flex items-center gap-2 mb-5">
        <Settings class="w-5 h-5 text-slate-500 dark:text-slate-400" />
        <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
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
            <ToggleLeft v-else class="w-8 h-8 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
            <span class="text-sm text-slate-700 dark:text-slate-300">
              Otomatik aktarim:
              <span :class="['font-semibold', autoTransfer ? 'text-green-600' : 'text-slate-400 dark:text-slate-500']">
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
            <ToggleLeft v-else class="w-8 h-8 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
            <span class="text-sm text-slate-700 dark:text-slate-300">Fallback: Bringo kurye musait degilse aktar</span>
          </button>

          <!-- Min SLA -->
          <div class="flex items-center gap-3">
            <label class="text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Min SLA:
            </label>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500 dark:text-slate-400">%</span>
              <input
                type="number"
                v-model.number="minSla"
                class="w-20 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span class="text-sm text-slate-500 dark:text-slate-400">
                alti partnere aktarma
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column - Priority Order -->
        <div>
          <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
            Oncelik Siralamasi
          </p>
          <div class="space-y-2">
            <div
              v-for="(partner, index) in priorities"
              :key="partner.id"
              class="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600 group hover:border-slate-200 dark:hover:border-slate-500 transition-colors"
            >
              <GripVertical class="w-4 h-4 text-slate-300 dark:text-slate-500 cursor-grab group-hover:text-slate-400 transition-colors" />
              <span class="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-600 rounded-full text-xs font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-500">
                {{ index + 1 }}
              </span>
              <span class="text-sm font-medium text-slate-700 dark:text-slate-200">
                {{ partner.name }}
              </span>
              <span v-if="index < priorities.length - 1" class="text-slate-300 dark:text-slate-600 text-xs ml-auto">
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
        <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
          Aktarim Kurallari
        </h2>
        <span class="text-sm text-slate-500 dark:text-slate-400">
          {{ rules.filter(r => r.active).length }} aktif /
          {{ rules.length }} toplam
        </span>
      </div>

      <div
        v-for="(rule, ruleIndex) in rules"
        :key="rule.id"
        :class="[
          'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md',
          rule.active
            ? 'border-l-4 border-l-green-500'
            : 'border-l-4 border-l-slate-300 dark:border-l-slate-600'
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
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-slate-800 dark:text-white">
                    {{ rule.name }}
                  </h3>
                  <!-- Conflict Warning Badge -->
                  <span
                    v-if="hasConflict(rule, ruleIndex)"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  >
                    <AlertTriangle class="w-3 h-3" />
                    Cakisma
                  </span>
                </div>
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
                <ToggleLeft v-else class="w-7 h-7 text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
              </button>
            </div>
          </div>

          <!-- IF -> THEN Visual Format -->
          <div class="mb-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <!-- IF Block -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                    IF
                  </span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">Kosul</span>
                </div>
                <p class="text-sm text-slate-700 dark:text-slate-300 pl-1 font-medium">
                  {{ rule.condition }}
                </p>
              </div>

              <!-- Arrow -->
              <div class="flex items-center self-center pt-4">
                <div class="flex items-center gap-1 text-slate-300 dark:text-slate-600">
                  <div class="w-8 h-[2px] bg-slate-300 dark:bg-slate-600" />
                  <ChevronRight class="w-5 h-5" />
                </div>
              </div>

              <!-- THEN Block -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                    THEN
                  </span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">Aksiyon</span>
                </div>
                <p class="text-sm text-slate-700 dark:text-slate-300 pl-1 font-medium">
                  {{ rule.action }}
                </p>
              </div>
            </div>

            <!-- Extra info -->
            <div v-if="rule.extra" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded">
                  {{ rule.extra.label }}
                </span>
                <span class="text-sm text-slate-600 dark:text-slate-400">
                  {{ rule.extra.value }}
                </span>
              </div>
            </div>
          </div>

          <!-- Rule Actions -->
          <div class="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              @click="handleTestRule(rule)"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
                testingRuleId === rule.id
                  ? 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30'
              ]"
            >
              <PlayCircle class="w-3.5 h-3.5" />
              {{ testingRuleId === rule.id ? 'Test Ediliyor...' : 'Test Et' }}
            </button>
            <button
              @click="openEditModal(rule)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Edit class="w-3.5 h-3.5" />
              Duzenle
            </button>
            <button
              @click="deleteRule(rule.id)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
              Sil
            </button>
          </div>

          <!-- Test Result -->
          <div
            v-if="testResults[rule.id]"
            class="mt-3 p-3 rounded-lg border"
            :class="testResults[rule.id].match
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600'"
          >
            <div class="flex items-center gap-2 mb-1">
              <CheckCircle v-if="testResults[rule.id].match" class="w-4 h-4 text-green-600" />
              <XCircle v-else class="w-4 h-4 text-slate-400" />
              <span class="text-sm font-semibold" :class="testResults[rule.id].match ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'">
                {{ testResults[rule.id].match ? 'Kural tetiklenir' : 'Kural tetiklenmez' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 ml-6">
              Ornek siparis: {{ testResults[rule.id].sampleOrder }} - {{ testResults[rule.id].reason }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Rule Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="closeModal"
      />

      <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">
            {{ editingRule ? 'Kurali Duzenle' : 'Yeni Kural Olustur' }}
          </h2>
          <button
            @click="closeModal"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X class="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Kural Adi -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Kural Adi
            </label>
            <input
              type="text"
              v-model="modalForm.name"
              placeholder="Orn: Kapasite Asimi Kurali"
              class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          <!-- Kosullar -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
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
                  class="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  class="w-40 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  class="w-28 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  v-if="modalForm.conditions.length > 1"
                  @click="removeCondition(idx)"
                  class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Aksiyon
            </label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Partner
                </label>
                <select
                  v-model="modalForm.partner"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option v-for="p in PARTNER_OPTIONS" :key="p" :value="p">
                    {{ p }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Limit (siparis/saat)
                </label>
                <input
                  type="number"
                  v-model="modalForm.limit"
                  placeholder="Orn: 50"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Kisitlar -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Kisitlar
            </label>

            <div class="mb-4">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-2">
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
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  ]"
                >
                  {{ zone }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-2">
                Saat Araligi
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="time"
                  v-model="modalForm.timeStart"
                  class="px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span class="text-sm text-slate-400">-</span>
                <input
                  type="time"
                  v-model="modalForm.timeEnd"
                  class="px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            @click="closeModal"
            class="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { evaluateTransfer } from '@/services/api'
import {
  ArrowLeft, Settings, Plus, Zap, MapPin, Clock, Rocket,
  Edit, Trash2, GripVertical, ToggleLeft, ToggleRight, X,
  ChevronRight, AlertTriangle, PlayCircle, CheckCircle, XCircle,
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
    zones: [],
    timeRange: null,
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
    zones: ['Esenyurt', 'Silivri', 'Catalca'],
    timeRange: null,
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
    zones: [],
    timeRange: { start: '12:00', end: '14:00' },
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
    zones: [],
    timeRange: null,
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
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
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
const testingRuleId = ref(null)
const testResults = ref({})

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

// ---- Lifecycle ----

onMounted(async () => {
  const res = await evaluateTransfer()
  if (res.ok && res.data) {
    const apiRules = res.data.rules || res.data
    if (Array.isArray(apiRules) && apiRules.length > 0) {
      rules.value = apiRules.map(r => ({
        id: r.id || Date.now(),
        name: r.name || 'API Kural',
        active: r.active !== false,
        icon: r.icon || 'zap',
        color: r.color || 'amber',
        condition: r.condition || '',
        action: r.action || '',
        extra: r.extra || null,
        triggerCount: r.triggerCount || 0,
        zones: r.zones || [],
        timeRange: r.timeRange || null,
      }))
    }
  }
})

// ---- Conflict Detection ----

const hasConflict = (rule, index) => {
  if (!rule.active) return false
  for (let i = 0; i < rules.value.length; i++) {
    if (i === index) continue
    const other = rules.value[i]
    if (!other.active) continue
    // Check zone overlap
    if (rule.zones && rule.zones.length > 0 && other.zones && other.zones.length > 0) {
      const overlap = rule.zones.some(z => other.zones.includes(z))
      if (overlap) return true
    }
    // Check time overlap
    if (rule.timeRange && other.timeRange) {
      if (rule.timeRange.start < other.timeRange.end && rule.timeRange.end > other.timeRange.start) {
        return true
      }
    }
  }
  return false
}

// ---- Test Rule ----

const SAMPLE_ORDERS = [
  { id: 'BRN-TEST-001', zone: 'Esenyurt', type: 'express', capacity: 15, eta: 50, pendingOrders: 120 },
  { id: 'BRN-TEST-002', zone: 'Kadikoy', type: 'standard', capacity: 80, eta: 25, pendingOrders: 30 },
  { id: 'BRN-TEST-003', zone: 'Sisli', type: 'express', capacity: 45, eta: 35, pendingOrders: 85 },
]

const handleTestRule = (rule) => {
  testingRuleId.value = rule.id
  setTimeout(() => {
    const sample = SAMPLE_ORDERS[Math.floor(Math.random() * SAMPLE_ORDERS.length)]
    let match = false
    let reason = ''

    if (rule.icon === 'zap') {
      match = sample.capacity < 20
      reason = match ? `Kapasite %${sample.capacity} (esik alti)` : `Kapasite %${sample.capacity} (yeterli)`
    } else if (rule.icon === 'mappin') {
      const zones = rule.zones || ['Esenyurt', 'Silivri', 'Catalca']
      match = zones.includes(sample.zone)
      reason = match ? `${sample.zone} uzak bolgede` : `${sample.zone} kapsam disinda`
    } else if (rule.icon === 'clock') {
      match = sample.pendingOrders > 100
      reason = match ? `${sample.pendingOrders} bekleyen siparis (esik ustu)` : `${sample.pendingOrders} bekleyen siparis (normal)`
    } else if (rule.icon === 'rocket') {
      match = sample.type === 'express' && sample.eta > 45
      reason = match ? `Express siparis, ETA ${sample.eta}dk (yuksek)` : `${sample.type} siparis, ETA ${sample.eta}dk`
    } else {
      match = Math.random() > 0.5
      reason = match ? 'Kosul saglandi' : 'Kosul saglanmadi'
    }

    testResults.value = {
      ...testResults.value,
      [rule.id]: { match, sampleOrder: sample.id, reason }
    }
    testingRuleId.value = null
  }, 800)
}

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
      zones: [...modalForm.zones],
      timeRange: modalForm.timeStart && modalForm.timeEnd
        ? { start: modalForm.timeStart, end: modalForm.timeEnd }
        : null,
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
  // Clean up test results
  const newResults = { ...testResults.value }
  delete newResults[id]
  testResults.value = newResults
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
