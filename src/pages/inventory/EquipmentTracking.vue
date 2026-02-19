<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Ekipman Zimmet Takip</h1>
      <div class="flex gap-3">
        <button @click="assignModal = true" class="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"><Plus :size="16" /> Zimmet Ver</button>
        <button @click="returnModal = true" class="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><ArrowDownToLine :size="16" /> Zimmet Al</button>
        <button class="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><Download :size="16" /> Export</button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div v-for="(c, i) in summaryCards" :key="i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{{ c.label }}</span>
          <div :class="['p-2 rounded-lg', c.bg]"><component :is="c.icon" :size="16" :class="c.color" /></div>
        </div>
        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ c.value }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ c.sub }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
      <div class="flex items-center gap-4">
        <div class="relative flex-1 max-w-xs">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="search" placeholder="Kurye ara..." class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select v-model="typeFilter" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <option v-for="t in EQ_TYPES" :key="t">{{ t }}</option>
        </select>
        <select v-model="statusFilter" class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <option v-for="s in EQ_STATUSES" :key="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <th v-for="h in ['Kurye', 'POS', 'Canta', 'Motor', 'Diger', 'Islem']" :key="h" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id" class="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td class="px-4 py-3 font-medium text-slate-800 dark:text-white">{{ c.name }}</td>
            <td class="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
              <template v-if="c.pos">{{ c.pos }}</template>
              <span v-else class="text-slate-300 dark:text-slate-600">-</span>
            </td>
            <td class="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
              <template v-if="c.bag">{{ c.bag }}</template>
              <span v-else class="text-slate-300 dark:text-slate-600">-</span>
            </td>
            <td class="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
              <template v-if="c.motor">{{ c.motor }}</template>
              <span v-else class="text-slate-300 dark:text-slate-600">-</span>
            </td>
            <td class="px-4 py-3 text-xs text-slate-500">
              <template v-if="c.others.length > 0">{{ c.others.join(', ') }}</template>
              <span v-else class="text-slate-300 dark:text-slate-600">-</span>
            </td>
            <td class="px-4 py-3">
              <button @click="detailCourier = c" class="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">Detay</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Recent Movements -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Son Zimmet Hareketleri</h3>
      <div class="space-y-3">
        <div v-for="(m, i) in MOVEMENTS" :key="i" :class="['flex items-center gap-3 p-3 rounded-lg border-l-4', m.color, 'bg-slate-50 dark:bg-slate-800']">
          <span class="text-lg">{{ m.icon }}</span>
          <div class="flex-1">
            <p class="text-sm text-slate-800 dark:text-white">
              <span class="font-medium">{{ m.item }}</span>
              <span class="text-slate-400 mx-1">{{ m.type === 'out' ? '->' : m.type === 'in' ? '<-' : '--' }}</span>
              <span class="text-slate-600 dark:text-slate-400">{{ m.courier }}</span>
            </p>
          </div>
          <span class="text-xs text-slate-400">{{ m.time }}</span>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <div v-if="assignModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="assignModal = false" />
      <div class="relative w-[520px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div class="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
          <h3 class="font-bold text-slate-800 dark:text-white">Ekipman Zimmet Ver</h3>
          <button @click="assignModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X :size="16" class="text-slate-500" /></button>
        </div>
        <div class="p-6 space-y-5">
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1">Kurye</label>
            <select v-model="assignCourier" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <option value="">Kurye secin...</option>
              <option v-for="n in NAMES" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-medium text-slate-500 block mb-3">Ekipman Sec</label>
            <div class="space-y-3">
              <div v-for="eq in equipmentList" :key="eq.key" :class="['flex items-center gap-3 p-3 rounded-lg border transition-colors', assignItems[eq.key] ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700']">
                <input type="checkbox" :checked="assignItems[eq.key]" @change="toggleAssign(eq.key)" class="accent-primary" />
                <component :is="eq.icon" :size="16" :class="assignItems[eq.key] ? 'text-primary' : 'text-slate-400'" />
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300 w-28">{{ eq.label }}</span>
                <div v-if="assignItems[eq.key]" class="flex items-center gap-2 flex-1">
                  <select v-if="eq.isSize" class="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <option v-for="s in SIZES" :key="s">{{ s }}</option>
                  </select>
                  <input v-else :placeholder="eq.placeholder" class="flex-1 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
                  <select class="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <option v-for="c in CONDITIONS" :key="c">{{ c }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1">Not</label>
            <textarea rows="2" placeholder="Opsiyonel not..." class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="printDoc" class="accent-primary" />
              <span class="text-sm text-slate-700 dark:text-slate-300">Zimmet tutanagi yazdir</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="sendSms" class="accent-primary" />
              <span class="text-sm text-slate-700 dark:text-slate-300">SMS ile bilgilendir</span>
            </label>
          </div>
        </div>
        <div class="sticky bottom-0 bg-white dark:bg-slate-900 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <button @click="assignModal = false" class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Iptal</button>
          <button @click="assignModal = false" class="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><Check :size="16" /> Zimmet Ver</button>
        </div>
      </div>
    </div>

    <!-- Return Modal -->
    <div v-if="returnModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="returnModal = false" />
      <div class="relative w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 dark:text-white">Ekipman Zimmet Al (Iade)</h3>
          <button @click="returnModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X :size="16" class="text-slate-500" /></button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1">Kurye</label>
            <select class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <option value="">Kurye secin...</option>
              <option v-for="n in NAMES" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium text-slate-500 block">Teslim Alinan Ekipmanlar</label>
            <div v-for="(item, i) in returnItems" :key="i" class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked class="accent-primary" />
                <span class="text-sm text-slate-700 dark:text-slate-300">{{ item }}</span>
              </label>
              <select class="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <option v-for="c in CONDITIONS" :key="c">{{ c }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1">Not</label>
            <textarea rows="2" placeholder="Durum notu..." class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none resize-none" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <button @click="returnModal = false" class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer">Iptal</button>
          <button @click="returnModal = false" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><Check :size="16" /> Teslim Al</button>
        </div>
      </div>
    </div>

    <!-- Detail Slide-over -->
    <div v-if="detailCourier" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/30" @click="detailCourier = null" />
      <div class="relative w-[420px] bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
        <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h3 class="font-bold text-slate-800 dark:text-white">{{ detailCourier.name }}</h3>
          <button @click="detailCourier = null" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X :size="16" class="text-slate-500" /></button>
        </div>
        <div class="p-6 space-y-4">
          <h4 class="text-sm font-semibold text-slate-600 dark:text-slate-400">Zimmetli Ekipmanlar</h4>
          <div v-for="(eq, i) in detailEquipmentList" :key="i" class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-3">
              <component :is="eq.icon" :size="16" class="text-primary" />
              <div>
                <p class="text-sm font-medium text-slate-800 dark:text-white">{{ eq.label }}</p>
                <p class="text-xs text-slate-500 font-mono">{{ eq.value }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-500">{{ eq.date }}</p>
              <span class="text-[11px] px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">{{ eq.cond }}</span>
            </div>
          </div>

          <h4 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-6">Zimmet Gecmisi</h4>
          <div class="space-y-2">
            <div v-for="(h, i) in historyItems" :key="i" class="flex items-start gap-3 py-2">
              <component :is="h.icon" :size="14" :class="['mt-0.5', h.color]" />
              <div>
                <p class="text-sm text-slate-800 dark:text-white">{{ h.action }}</p>
                <p class="text-xs text-slate-500">{{ h.items }}</p>
                <p class="text-[11px] text-slate-400">{{ h.date }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {
  Search, Download, Plus, ArrowDownToLine, X, Smartphone, ShoppingBag,
  Bike, HardHat, Shirt, CloudRain, BatteryCharging, Check, AlertTriangle,
  Clock, ArrowUpFromLine, Wrench
} from 'lucide-vue-next'

const NAMES = [
  'Ali Riza Kaya', 'Mehmet Yilmaz', 'Veli Aksoy', 'Ayse Demir', 'Can Ozdemir',
  'Fatma Sari', 'Emre Koc', 'Zeynep Turk', 'Hasan Mutlu', 'Burak Celik',
  'Derya Aydin', 'Oguz Kara', 'Selin Bal', 'Kemal Usta',
]

function seed(i) { return ((i * 8301 + 41297) % 193280) / 193280 }

const COURIERS = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  pos: seed(i) > 0.2 ? `#P-${String(10 + Math.floor(seed(i + 1) * 50)).padStart(3, '0')}` : null,
  bag: seed(i + 2) > 0.1 ? `#C-${String(1 + Math.floor(seed(i + 3) * 50)).padStart(2, '0')}` : null,
  motor: seed(i + 4) > 0.5 ? `34${['AB', 'CD', 'EF', 'GH', 'JK'][Math.floor(seed(i + 5) * 5)]}${Math.floor(10 + seed(i + 6) * 90)}` : null,
  others: [
    seed(i + 7) > 0.3 ? 'Kask' : null,
    seed(i + 8) > 0.4 ? 'Yelek' : null,
    seed(i + 9) > 0.7 ? 'Yagmurluk' : null,
    seed(i + 10) > 0.6 ? 'Powerbank' : null,
  ].filter(Boolean),
}))

const MOVEMENTS = [
  { type: 'out', icon: 'OUT', item: 'POS #P-042', courier: 'Ali Riza K.', time: 'Bugun 09:15', color: 'border-blue-300 dark:border-blue-800' },
  { type: 'in', icon: 'IN', item: 'Termal Canta #C-31', courier: 'Can O.', time: 'Bugun 08:45', color: 'border-green-300 dark:border-green-800' },
  { type: 'out', icon: 'OUT', item: 'Motor 34EF56', courier: 'Yeni Kurye M.', time: 'Dun 17:30', color: 'border-blue-300 dark:border-blue-800' },
  { type: 'warn', icon: '!!', item: 'POS #P-019', courier: 'Arizali - Servis', time: 'Dun 14:20', color: 'border-orange-300 dark:border-orange-800' },
  { type: 'out', icon: 'OUT', item: 'Yelek (L)', courier: 'Emre K.', time: 'Dun 12:00', color: 'border-blue-300 dark:border-blue-800' },
  { type: 'in', icon: 'IN', item: 'Powerbank #PB-12', courier: 'Selin B.', time: 'Dun 09:30', color: 'border-green-300 dark:border-green-800' },
  { type: 'out', icon: 'OUT', item: 'Kask (M)', courier: 'Derya A.', time: '2 gun once', color: 'border-blue-300 dark:border-blue-800' },
  { type: 'warn', icon: '!!', item: 'Termal Canta #C-08', courier: 'Hasarli - Degisim', time: '2 gun once', color: 'border-orange-300 dark:border-orange-800' },
]

const EQ_TYPES = ['Tumu', 'POS', 'Canta', 'Motor', 'Kask', 'Yelek', 'Powerbank']
const EQ_STATUSES = ['Tumu', 'Zimmetli', 'Depoda', 'Arizali']
const CONDITIONS = ['Yeni', 'Iyi', 'Orta', 'Kotu']
const SIZES = ['S', 'M', 'L', 'XL']

const search = ref('')
const typeFilter = ref('Tumu')
const statusFilter = ref('Tumu')
const assignModal = ref(false)
const returnModal = ref(false)
const detailCourier = ref(null)
const assignCourier = ref('')
const assignItems = reactive({
  pos: false, bag: false, motor: false, helmet: false, vest: false, raincoat: false, powerbank: false
})
const printDoc = ref(true)
const sendSms = ref(true)

const filtered = computed(() => {
  return COURIERS.filter(c => {
    if (search.value && !c.name.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
})

const toggleAssign = (key) => {
  assignItems[key] = !assignItems[key]
}

const summaryCards = [
  { icon: Smartphone, label: 'POS Cihazi', value: '45/50', sub: 'zimmetli', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: ShoppingBag, label: 'Termal Canta', value: '142/150', sub: 'zimmetli', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { icon: Bike, label: 'Motor', value: '28/30', sub: 'zimmetli', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: Shirt, label: 'Ekipman Seti', value: '142', sub: 'zimmetli', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
]

const equipmentList = [
  { key: 'pos', label: 'POS Cihazi', icon: Smartphone, field: 'Seri No', placeholder: '#P-___' },
  { key: 'bag', label: 'Termal Canta', icon: ShoppingBag, field: 'Seri No', placeholder: '#C-___' },
  { key: 'motor', label: 'Motorsiklet', icon: Bike, field: 'Plaka', placeholder: '34______' },
  { key: 'helmet', label: 'Kask', icon: HardHat, field: 'Beden', isSize: true },
  { key: 'vest', label: 'Yelek', icon: Shirt, field: 'Beden', isSize: true },
  { key: 'raincoat', label: 'Yagmurluk', icon: CloudRain, field: 'Beden', isSize: true },
  { key: 'powerbank', label: 'Powerbank', icon: BatteryCharging, field: 'Seri No', placeholder: '#PB-___' },
]

const returnItems = ['POS #P-042', 'Termal Canta #C-15', 'Yelek (L)']

const detailEquipmentList = computed(() => {
  if (!detailCourier.value) return []
  const c = detailCourier.value
  return [
    c.pos && { label: 'POS Cihazi', value: c.pos, icon: Smartphone, date: '10 Sub 2026', cond: 'Iyi' },
    c.bag && { label: 'Termal Canta', value: c.bag, icon: ShoppingBag, date: '08 Sub 2026', cond: 'Iyi' },
    c.motor && { label: 'Motorsiklet', value: c.motor, icon: Bike, date: '01 Sub 2026', cond: 'Iyi' },
    ...c.others.map(o => ({ label: o, value: '-', icon: Shirt, date: '05 Sub 2026', cond: 'Yeni' })),
  ].filter(Boolean)
})

const historyItems = [
  { action: 'Zimmet verildi', items: 'POS, Canta, Yelek', date: '10 Sub 2026', icon: ArrowUpFromLine, color: 'text-blue-500' },
  { action: 'Kask degisimi', items: 'Eski -> Yeni kask', date: '28 Oca 2026', icon: Wrench, color: 'text-orange-500' },
  { action: 'Ilk zimmet', items: 'Tam set', date: '15 Oca 2026', icon: Check, color: 'text-green-500' },
]
</script>
