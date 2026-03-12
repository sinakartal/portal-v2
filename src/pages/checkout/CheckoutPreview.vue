<script setup>
import { ref, computed } from 'vue'
import { ShoppingCart, Zap, Clock, Package, Star, Copy, Check, Wifi, Battery, Signal, Palette, Code, ChevronDown } from 'lucide-vue-next'
import { getCheckoutOptions } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const currentProjectId = computed(() => authStore.activeProjectId || 'YOUR_PROJECT_ID')

const form = ref({
  originLat: 40.99,
  originLng: 29.02,
  destinationLat: 41.008,
  destinationLng: 28.978,
  desi: 5,
  mode: 'standard',
})

const options = ref(null)
const loading = ref(false)
const error = ref('')
const copied = ref(false)

// ---- Theme Customization ----
const themeConfig = ref({
  primaryColor: '#6366f1',
  fontFamily: 'Inter',
  borderRadius: 12,
  showLogo: true,
})

const FONT_OPTIONS = ['Inter', 'Roboto', 'Poppins', 'Nunito', 'Open Sans']
const COLOR_PRESETS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

// ---- Embed Code Toggle ----
const embedMode = ref('script') // 'script' or 'npm'

const scriptEmbed = computed(() => `<script src="https://bringo.co/widget.js"
  data-project="${currentProjectId.value}"
  data-color="${themeConfig.value.primaryColor}"
  data-font="${themeConfig.value.fontFamily}"
  data-radius="${themeConfig.value.borderRadius}"><\/script>`)

const npmEmbed = computed(() => `npm install @bringo/checkout-widget

// main.js
import BringoCheckout from '@bringo/checkout-widget'
import '@bringo/checkout-widget/style.css'

BringoCheckout.init({
  projectId: '${currentProjectId.value}',
  color: '${themeConfig.value.primaryColor}',
  font: '${themeConfig.value.fontFamily}',
  borderRadius: ${themeConfig.value.borderRadius},
})`)

const embedCode = computed(() => embedMode.value === 'script' ? scriptEmbed.value : npmEmbed.value)

// ---- Test Scenarios ----
const testScenario = ref('default')
const TEST_SCENARIOS = [
  { value: 'default', label: 'Varsayilan' },
  { value: 'express', label: 'Express uygun' },
  { value: 'slot_only', label: 'Sadece slot' },
  { value: 'closed', label: 'Kapali bolge' },
]

const MOCK_SCENARIOS = {
  express: {
    options: [
      { type: 'express', label: 'Express Teslimat', eta: '25-35 dk', price: 39.99, originalPrice: 49.99, isRecommended: true },
      { type: 'standard', label: 'Standart Teslimat', eta: '45-60 dk', price: 19.99, isRecommended: false },
    ]
  },
  slot_only: {
    options: [
      { type: 'scheduled', label: '14:00 - 16:00', eta: 'Bugun', price: 24.99, isRecommended: true },
      { type: 'scheduled', label: '16:00 - 18:00', eta: 'Bugun', price: 24.99, isRecommended: false },
      { type: 'scheduled', label: '10:00 - 12:00', eta: 'Yarin', price: 19.99, isRecommended: false },
    ]
  },
  closed: {
    options: [],
    message: 'Bu bolgeye teslimat yapilamamaktadir.'
  },
}

async function fetchOptions() {
  loading.value = true
  error.value = ''

  // If test scenario is selected, use mock data
  if (testScenario.value !== 'default') {
    setTimeout(() => {
      loading.value = false
      const scenario = MOCK_SCENARIOS[testScenario.value]
      if (scenario) {
        options.value = scenario
      }
    }, 600)
    return
  }

  const res = await getCheckoutOptions({
    originLat: form.value.originLat,
    originLng: form.value.originLng,
    destinationLat: form.value.destinationLat,
    destinationLng: form.value.destinationLng,
    desi: form.value.desi,
    mode: form.value.mode,
  })
  loading.value = false
  if (res.ok && res.data) {
    options.value = res.data.data || res.data
  } else {
    error.value = 'Opsiyonlar alinamadi'
  }
}

function optionIcon(type) {
  if (type === 'instant' || type === 'express') return Zap
  if (type === 'scheduled' || type === 'standard') return Clock
  return Package
}

function copyEmbed() {
  navigator.clipboard.writeText(embedCode.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

const currentTime = computed(() => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800 dark:text-white mb-1">Checkout Widget Onizleme</h1>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">E-ticaret sitelerinde gorunecek teslimat widget'ini test edin</p>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Sol Panel: Test + Theme + Embed -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Test Parametreleri -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="font-semibold text-slate-700 dark:text-white mb-4">Test Parametreleri</h3>

          <!-- Test Scenario -->
          <div class="mb-4">
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Test Senaryosu</label>
            <select
              v-model="testScenario"
              class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="s in TEST_SCENARIOS" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Origin Lat</label>
              <input v-model.number="form.originLat" type="number" step="0.001" class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Origin Lng</label>
              <input v-model.number="form.originLng" type="number" step="0.001" class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Destination Lat</label>
              <input v-model.number="form.destinationLat" type="number" step="0.001" class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Destination Lng</label>
              <input v-model.number="form.destinationLng" type="number" step="0.001" class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Desi</label>
              <input v-model.number="form.desi" type="number" class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Mode</label>
              <select v-model="form.mode" class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white">
                <option value="instant">Instant</option>
                <option value="standard">Standard</option>
                <option value="flex">Flex</option>
              </select>
            </div>
          </div>

          <button @click="fetchOptions" :disabled="loading" class="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm disabled:opacity-50 cursor-pointer transition-colors">
            {{ loading ? 'Yukleniyor...' : 'Opsiyonlari Getir' }}
          </button>
        </div>

        <!-- Theme Customization -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center gap-2 mb-4">
            <Palette :size="18" class="text-slate-500 dark:text-slate-400" />
            <h3 class="font-semibold text-slate-700 dark:text-white">Tema Ayarlari</h3>
          </div>

          <!-- Color -->
          <div class="mb-4">
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-2">Widget Rengi</label>
            <div class="flex items-center gap-2">
              <div class="flex gap-1.5">
                <button
                  v-for="color in COLOR_PRESETS"
                  :key="color"
                  @click="themeConfig.primaryColor = color"
                  :class="[
                    'w-7 h-7 rounded-full transition-all cursor-pointer border-2',
                    themeConfig.primaryColor === color ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'
                  ]"
                  :style="{ backgroundColor: color }"
                />
              </div>
              <input
                v-model="themeConfig.primaryColor"
                type="color"
                class="w-7 h-7 rounded cursor-pointer border-0 p-0"
              />
            </div>
          </div>

          <!-- Font -->
          <div class="mb-4">
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-2">Font</label>
            <select
              v-model="themeConfig.fontFamily"
              class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white"
            >
              <option v-for="f in FONT_OPTIONS" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>

          <!-- Border Radius -->
          <div>
            <label class="block text-xs text-slate-500 dark:text-slate-400 mb-2">Kose Yuvarlama: {{ themeConfig.borderRadius }}px</label>
            <input
              v-model.number="themeConfig.borderRadius"
              type="range"
              min="0"
              max="24"
              class="w-full accent-primary"
            />
          </div>
        </div>

        <!-- Embed Code -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center gap-2 mb-4">
            <Code :size="18" class="text-slate-500 dark:text-slate-400" />
            <h3 class="font-semibold text-slate-700 dark:text-white">Entegrasyon Kodu</h3>
          </div>

          <!-- Toggle -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 mb-4">
            <button
              @click="embedMode = 'script'"
              :class="embedMode === 'script' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''"
              class="flex-1 px-3 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 transition-all cursor-pointer text-center"
            >
              Script Tag ile Kur
            </button>
            <button
              @click="embedMode = 'npm'"
              :class="embedMode === 'npm' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''"
              class="flex-1 px-3 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 transition-all cursor-pointer text-center"
            >
              NPM ile Kur
            </button>
          </div>

          <div class="relative">
            <pre class="text-xs bg-slate-900 text-green-400 px-4 py-3 rounded-lg overflow-x-auto max-h-[200px]"><code>{{ embedCode }}</code></pre>
            <button
              @click="copyEmbed"
              class="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md cursor-pointer transition-colors"
            >
              <Check v-if="copied" :size="14" class="text-green-400" />
              <Copy v-else :size="14" class="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <!-- Sag Panel: Phone Preview -->
      <div class="lg:col-span-7 flex justify-center">
        <div class="w-[360px]">
          <!-- Phone Frame -->
          <div
            class="bg-white dark:bg-slate-900 rounded-[40px] border-[6px] border-slate-800 dark:border-slate-600 shadow-2xl overflow-hidden"
            :style="{ fontFamily: themeConfig.fontFamily }"
          >
            <!-- Status Bar -->
            <div class="bg-slate-800 dark:bg-slate-700 px-6 py-2 flex items-center justify-between">
              <span class="text-white text-xs font-semibold">{{ currentTime }}</span>
              <div class="w-20 h-5 bg-slate-900 dark:bg-slate-800 rounded-full" />
              <div class="flex items-center gap-1.5">
                <Signal :size="12" class="text-white" />
                <Wifi :size="12" class="text-white" />
                <Battery :size="12" class="text-white" />
              </div>
            </div>

            <!-- App Content -->
            <div class="p-5">
              <!-- Notch -->
              <div class="w-20 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-5" />

              <!-- Cart Header -->
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-sm text-slate-700 dark:text-white">Teslimat Secenekleri</h4>
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center"
                  :style="{ backgroundColor: themeConfig.primaryColor + '20' }"
                >
                  <ShoppingCart :size="12" :style="{ color: themeConfig.primaryColor }" />
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!options && !error" class="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
                Opsiyonlari gormek icin sol panelden "Opsiyonlari Getir" butonuna basin
              </div>

              <!-- Error -->
              <div v-if="error" class="text-center py-10 text-red-400 text-sm">{{ error }}</div>

              <!-- Closed Region Message -->
              <div v-if="options && options.message && (!options.options || options.options.length === 0)" class="text-center py-10">
                <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Package :size="24" class="text-red-400" />
                </div>
                <p class="text-sm text-red-500 font-medium">{{ options.message }}</p>
              </div>

              <!-- Options -->
              <div v-if="options && !options.message" class="space-y-3">
                <div v-for="(opt, i) in (options.options || options.slots || [options])" :key="i"
                  class="border p-3.5 cursor-pointer transition-all"
                  :class="opt.isRecommended ? 'shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'"
                  :style="{
                    borderRadius: themeConfig.borderRadius + 'px',
                    borderColor: opt.isRecommended ? themeConfig.primaryColor : undefined,
                    backgroundColor: opt.isRecommended ? themeConfig.primaryColor + '08' : undefined,
                  }"
                >
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                      <component :is="optionIcon(opt.type || opt.mode)" :size="16" :style="{ color: themeConfig.primaryColor }" />
                      <span class="font-medium text-sm text-slate-700 dark:text-white">{{ opt.label || opt.type || opt.mode || 'Teslimat' }}</span>
                    </div>
                    <span
                      v-if="opt.isRecommended"
                      class="text-[10px] text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                      :style="{ backgroundColor: themeConfig.primaryColor }"
                    >
                      <Star :size="8" /> Onerilen
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">{{ opt.eta || opt.estimatedTime || '45 dk' }}</p>
                  <div class="flex items-center gap-2">
                    <span v-if="opt.originalPrice && opt.originalPrice !== opt.price" class="line-through text-slate-400 text-xs">{{ opt.originalPrice }} TL</span>
                    <span class="font-bold text-sm" :style="opt.originalPrice && opt.originalPrice !== opt.price ? { color: '#16a34a' } : {}" :class="!(opt.originalPrice && opt.originalPrice !== opt.price) ? 'text-slate-700 dark:text-white' : ''">
                      {{ opt.price || opt.cost || '0' }} TL
                    </span>
                  </div>
                  <p v-if="opt.consolidationMessage" class="text-[10px] mt-1 rounded px-2 py-1" :style="{ color: themeConfig.primaryColor, backgroundColor: themeConfig.primaryColor + '10' }">
                    {{ opt.consolidationMessage }}
                  </p>
                </div>

                <div v-if="(options.options || options.slots || []).length === 0 && !options.price" class="text-center py-6 text-slate-400 text-sm">
                  Bu parameterler icin opsiyon bulunamadi
                </div>
              </div>

              <!-- Checkout Button -->
              <button
                v-if="options && !options.message"
                class="w-full mt-4 py-3 text-white font-semibold text-sm transition-opacity hover:opacity-90"
                :style="{
                  backgroundColor: themeConfig.primaryColor,
                  borderRadius: themeConfig.borderRadius + 'px',
                }"
              >
                Devam Et
              </button>

              <!-- Powered by -->
              <p class="text-center text-[10px] text-slate-300 dark:text-slate-600 mt-3">
                Powered by Bringo
              </p>
            </div>

            <!-- Bottom bar -->
            <div class="h-8 flex items-end justify-center pb-2">
              <div class="w-32 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
