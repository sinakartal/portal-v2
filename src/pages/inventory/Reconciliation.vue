<template>
  <div>
    <!-- Beta Banner -->
    <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm">
      <span class="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded uppercase">Beta</span>
      <span>Bu modul yakinda gercek verilerle guncellenecek.</span>
    </div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Gun Sonu Mutabakat</h1>
      <div class="flex items-center gap-3">
        <input type="date" :defaultValue="new Date().toISOString().split('T')[0]" class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300" />
        <select v-model="project" class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <option v-for="p in PROJECTS" :key="p">{{ p }}</option>
        </select>
      </div>
    </div>

    <!-- Summary Row 1 -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="'sr1-sk-'+i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div class="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </template>
      <template v-else>
        <div v-for="(c, i) in summaryRow1" :key="i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ c.label }}</span>
            <div :class="['p-1.5 rounded-lg', c.bg]"><component :is="c.icon" :size="14" :class="c.color" /></div>
          </div>
          <p class="text-xl font-bold text-slate-800 dark:text-white">{{ c.value }}</p>
        </div>
      </template>
    </div>

    <!-- Summary Row 2 -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <template v-if="loading">
        <div v-for="i in 4" :key="'sr2-sk-'+i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div class="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </template>
      <template v-else>
        <div v-for="(c, i) in summaryRow2" :key="i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ c.label }}</span>
            <div :class="['p-1.5 rounded-lg', c.bg]"><component :is="c.icon" :size="14" :class="c.color" /></div>
          </div>
          <p class="text-xl font-bold text-slate-800 dark:text-white">{{ c.value }}</p>
        </div>
      </template>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="'tab-sk-'+i" class="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </template>
      <template v-else>
        <button v-for="t in tabItems" :key="t.key" @click="tab = t.key" :class="['px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors', tab === t.key ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800']">
          <span v-if="t.icon" class="mr-1">{{ t.icon }}</span>{{ t.label }}
        </button>
      </template>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <th v-for="h in ['Kurye', 'Siparis', 'Teslim', 'Nakit', 'Teslim Ed.', 'Zimmet Durum', 'Durum']" :key="h" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="i in 8" :key="'tbl-sk-'+i" class="border-b border-slate-50 dark:border-slate-800/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </td>
              <td class="px-4 py-3"><div class="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
              <td class="px-4 py-3"><div class="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /></td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="c in shown.slice(0, 20)" :key="c.id" :class="['border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50', c.status === 'issue' ? 'bg-red-50/30 dark:bg-red-900/5' : c.status === 'pending' ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : '']">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="text-xs">
                    {{ c.status === 'completed' ? 'OK' : c.status === 'pending' ? '...' : '!!' }}
                  </span>
                  <span class="font-medium text-slate-800 dark:text-white">{{ c.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ c.orders }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ c.delivered }}</td>
              <td class="px-4 py-3 font-semibold text-slate-800 dark:text-white">{{ fmt(c.cash) }}</td>
              <td class="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{{ c.submitted > 0 ? fmt(c.submitted) : '-' }}</td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded-full text-[11px] font-medium', c.zimmetCleared ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400']">
                  {{ c.zimmetCleared ? 'Temizlendi' : 'Bekliyor' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span v-if="c.status === 'completed'" class="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-[11px] font-medium">Tamam</span>
                <span v-if="c.status === 'pending'" class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-[11px] font-medium">Bekliyor</span>
                <span v-if="c.status === 'issue'" class="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-[11px] font-medium">{{ c.diffNote }}</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Summary footer -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Ozet</h3>
      <template v-if="loading">
        <div class="space-y-3">
          <div v-for="i in 4" :key="'sum-sk-'+i" class="flex justify-between">
            <div class="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="space-y-2">
          <div class="flex justify-between text-sm"><span class="text-slate-500">Teslim edilmesi gereken nakit:</span><span class="font-semibold text-slate-800 dark:text-white">{{ fmt(nakitTahsilat) }}</span></div>
          <div class="flex justify-between text-sm"><span class="text-slate-500">Teslim edilen nakit:</span><span class="font-semibold text-green-600">{{ fmt(totalSubmitted) }}</span></div>
          <div class="flex justify-between text-sm"><span class="text-slate-500">Bekleyen nakit:</span><span class="font-semibold text-orange-600">{{ fmt(totalPending) }}</span></div>
          <div class="flex justify-between text-sm border-t border-slate-100 dark:border-slate-800 pt-2"><span class="text-slate-500">Fark:</span><span :class="['font-bold', totalDiff === 0 ? 'text-green-600' : 'text-red-600']">{{ totalDiff === 0 ? '\u20BA0' : `-${fmt(totalDiff)}` }}</span></div>
        </div>
      </template>
    </div>

    <!-- Pending cash submissions -->
    <div v-if="!loading && pending.length > 0" class="bg-white dark:bg-slate-900 rounded-xl border border-orange-200 dark:border-orange-800 p-5 mb-6">
      <h3 class="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-4 flex items-center gap-2"><Clock :size="16" /> Nakit Teslimi Bekleyenler</h3>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <th v-for="h in ['Kurye', 'Nakit', 'Bekleme Suresi', 'Islem']" :key="h" class="text-left px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in pending" :key="c.id" class="border-b border-slate-50 dark:border-slate-800/50">
            <td class="px-3 py-2.5 font-medium text-slate-800 dark:text-white">{{ c.name }}</td>
            <td class="px-3 py-2.5 font-semibold text-orange-600">{{ fmt(c.cash) }}</td>
            <td class="px-3 py-2.5 text-slate-500">{{ c.waitMinutes >= 60 ? `${Math.floor(c.waitMinutes / 60)} saat ${c.waitMinutes % 60} dk` : `${c.waitMinutes} dk` }}</td>
            <td class="px-3 py-2.5">
              <button @click="submitModal = c; submitAmount = c.cash.toString()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors">Teslim Al</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Action bar -->
    <div class="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <template v-if="loading">
        <div class="flex gap-3">
          <div v-for="i in 3" :key="'act-sk-'+i" class="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        <div class="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </template>
      <template v-else>
        <div class="flex gap-3">
          <button class="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><FileText :size="16" /> Detayli Rapor</button>
          <button class="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><Download :size="16" /> Excel Indir</button>
          <button class="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><Printer :size="16" /> Yazdir</button>
        </div>
        <button @click="closeModal = true" class="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"><Lock :size="16" /> Gunu Kapat</button>
      </template>
    </div>

    <!-- Teslim Al Modal -->
    <div v-if="submitModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="submitModal = null" />
      <div class="relative w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Banknote :size="18" class="text-emerald-600" /> Nakit Teslim Al</h3>
          <button @click="submitModal = null" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X :size="16" class="text-slate-500" /></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex justify-between text-sm"><span class="text-slate-500">Kurye:</span><span class="font-semibold text-slate-800 dark:text-white">{{ submitModal.name }}</span></div>
          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <p class="text-xs text-slate-500">Sistemde kayitli nakit</p>
            <p class="text-xl font-bold text-slate-800 dark:text-white">{{ fmt(submitModal.cash) }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1">Teslim Edilen Tutar</label>
            <input v-model="submitAmount" class="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
            <div class="flex justify-between text-sm"><span class="text-slate-500">Fark:</span>
              <span :class="['font-bold', submitDiff === 0 ? 'text-green-600' : 'text-red-600']">{{ submitDiff === 0 ? 'Mutabik' : fmt(submitDiff) }}</span>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <button @click="submitModal = null" class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Iptal</button>
          <button @click="submitModal = null" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><CheckCircle :size="16" /> Teslim Alindi</button>
        </div>
      </div>
    </div>

    <!-- Close Day Modal -->
    <div v-if="closeModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="closeModal = false" />
      <div class="relative w-[460px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Lock :size="18" class="text-primary" /> Gunu Kapat</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-slate-500">Toplam siparis:</span><span class="font-medium text-slate-800 dark:text-white">847</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Teslim edilen:</span><span class="font-medium text-green-600">812 (%96)</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Toplam tahsilat:</span><span class="font-medium text-slate-800 dark:text-white">{{ fmt(totalCash) }}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Teslim edilen nakit:</span><span class="font-medium text-green-600">{{ fmt(totalSubmitted) }}</span></div>
          </div>

          <div v-if="pending.length > 0" class="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle :size="16" class="text-yellow-600 mt-0.5 shrink-0" />
            <div class="text-xs text-yellow-700 dark:text-yellow-400">
              <strong>{{ pending.length }} kurye</strong> henuz nakit teslim etmedi ({{ fmt(totalPending) }} bekliyor).
            </div>
          </div>

          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="carryOver" class="accent-primary" />
            <span class="text-sm text-slate-700 dark:text-slate-300">Bekleyen nakitleri ertesi gune devret</span>
          </label>
        </div>
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <button @click="closeModal = false" class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Iptal</button>
          <button @click="closeModal = false" class="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><Lock :size="16" /> Gunu Kapat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CheckCircle, Clock, AlertTriangle, Download, Printer, FileText,
  X, Banknote, CreditCard, Building2, Users, Package, TrendingUp,
  Lock
} from 'lucide-vue-next'

// ========== LOADING STATE ==========
const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1200)
})

const fmt = (n) => '\u20BA' + Math.abs(n).toLocaleString('tr-TR')

const PROJECTS = ['Tumu', 'File Market', 'Istanbul Ana Dagitim', 'Express Teslimat', 'Gida Dagitim']

function seed(i) { return ((i * 7901 + 31297) % 133280) / 133280 }

const COURIERS = Array.from({ length: 45 }, (_, i) => {
  const names = ['Ali Riza K.', 'Mehmet Y.', 'Veli A.', 'Ayse D.', 'Can O.', 'Fatma S.', 'Emre K.', 'Zeynep T.', 'Hasan M.', 'Burak C.', 'Derya A.', 'Oguz K.', 'Selin B.', 'Kemal U.', 'Nurgul S.', 'Tuncay Y.', 'Emine G.', 'Ibrahim T.', 'Pinar E.', 'Murat K.', 'Gokhan A.', 'Sibel D.', 'Cem A.', 'Deniz P.', 'Serkan B.', 'Ozge M.', 'Tolga I.', 'Asli Y.', 'Onur S.', 'Elif K.', 'Bora T.', 'Merve A.', 'Kaan D.', 'Esra G.', 'Yusuf O.', 'Gamze H.', 'Baris N.', 'Duygu C.', 'Cenk V.', 'Hande L.', 'Alp R.', 'Seda F.', 'Arda M.', 'Tugba K.', 'Volkan E.']
  const name = names[i]
  const orders = 6 + Math.floor(seed(i) * 12)
  const delivered = orders - Math.floor(seed(i + 100) * 2)
  const cash = Math.floor(seed(i + 200) * 8000) + 500
  const s = seed(i + 300)
  let submitted = cash, status = 'completed', diff = 0, diffNote = ''
  if (i >= 38 && i < 40) { submitted = cash; diff = -(50 + Math.floor(seed(i + 400) * 150)); status = 'issue'; diffNote = i === 38 ? `-${fmt(-diff)}` : `${delivered - 1} eksik` }
  else if (i >= 40) { submitted = 0; status = 'pending' }
  const waitMinutes = status === 'pending' ? 45 + Math.floor(seed(i + 500) * 200) : 0
  const zimmetCleared = status === 'completed' && seed(i + 600) > 0.3
  return { id: i + 1, name, orders, delivered, cash, submitted: status === 'pending' ? 0 : submitted, status, diff, diffNote, waitMinutes, zimmetCleared }
})

const project = ref('Tumu')
const tab = ref('all')
const submitModal = ref(null)
const submitAmount = ref('')
const closeModal = ref(false)
const carryOver = ref(true)

const completed = COURIERS.filter(c => c.status === 'completed')
const pending = COURIERS.filter(c => c.status === 'pending')
const issues = COURIERS.filter(c => c.status === 'issue')

const shown = computed(() => {
  if (tab.value === 'completed') return completed
  if (tab.value === 'pending') return pending
  if (tab.value === 'issue') return issues
  return COURIERS
})

const totalCash = COURIERS.reduce((s, c) => s + c.cash, 0)
const totalSubmitted = COURIERS.filter(c => c.status === 'completed').reduce((s, c) => s + c.submitted, 0)
const totalPending = pending.reduce((s, c) => s + c.cash, 0)
const totalDiff = issues.reduce((s, c) => s + c.diff, 0)

const cardTahsilat = Math.floor(totalCash * 0.54)
const havale = Math.floor(totalCash * 0.09)
const nakitTahsilat = totalCash - cardTahsilat - havale

const summaryRow1 = [
  { icon: Users, label: 'Calisan Kurye', value: '45', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: Package, label: 'Toplam Siparis', value: '847', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { icon: TrendingUp, label: 'Teslim Edilen', value: '812 (%96)', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { icon: Banknote, label: 'Tahsilat', value: fmt(totalCash), color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
]

const summaryRow2 = [
  { icon: Banknote, label: 'Nakit Tahsilat', value: fmt(nakitTahsilat), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { icon: CreditCard, label: 'Kart Tahsilat', value: fmt(cardTahsilat), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: Building2, label: 'Havale Tahsilat', value: fmt(havale), color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { icon: Clock, label: 'Bekleyen Nakit', value: fmt(totalPending), color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
]

const tabItems = [
  { key: 'all', label: `Tumu (${COURIERS.length})`, icon: null },
  { key: 'completed', label: `Tamamlandi (${completed.length})`, icon: null },
  { key: 'pending', label: `Bekliyor (${pending.length})`, icon: null },
  { key: 'issue', label: `Sorunlu (${issues.length})`, icon: null },
]

const submitDiff = computed(() => {
  if (!submitModal.value) return 0
  return (parseInt(submitAmount.value) || 0) - submitModal.value.cash
})
</script>
