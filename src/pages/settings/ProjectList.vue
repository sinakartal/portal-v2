<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Projeler</h1>
        <p class="text-sm text-slate-500 mt-1">{{ filtered.length }} proje listeleniyor</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <Plus :size="16" /> Yeni Proje
        </button>
      </div>
    </div>

    <!-- KPI Summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Building2 :size="16" class="text-blue-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ activeCount }}</p>
        <p class="text-xs text-slate-500 mt-1">Aktif Proje</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <Package :size="16" class="text-green-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ formatNumber(totalOrders) }}</p>
        <p class="text-xs text-slate-500 mt-1">Toplam Siparis</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <DollarSign :size="16" class="text-indigo-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ formatCurrency(totalRevenue) }}</p>
        <p class="text-xs text-slate-500 mt-1">Toplam Gelir</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Target :size="16" class="text-amber-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">%{{ avgSla }}</p>
        <p class="text-xs text-slate-500 mt-1">Ort. SLA Uyumu</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-4 mb-4">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            v-model="search"
            placeholder="Proje adi, kod, musteri ara..."
            class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tum Durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </select>
        <button @click="search = ''; statusFilter = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
          <RefreshCw :size="14" /> Sifirla
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-4 py-3 font-medium text-slate-600">Proje</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Kod</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Musteri</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Siparis</th>
              <th class="text-right px-4 py-3 font-medium text-slate-600">Gelir</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">SLA Uyumu</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Olusturulma</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in paginatedProjects" :key="project._id" class="border-b border-slate-50 hover:bg-slate-50/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 :size="16" class="text-primary" />
                  </div>
                  <span class="font-medium text-slate-800">{{ project.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono">{{ project.code }}</span>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ project.client }}</td>
              <td class="px-4 py-3 text-center font-medium text-slate-700">{{ formatNumber(project.orderCount) }}</td>
              <td class="px-4 py-3 text-right font-medium text-slate-700">{{ formatCurrency(project.revenue) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      :class="[
                        'h-full rounded-full',
                        project.slaCompliance >= 95 ? 'bg-green-500' : project.slaCompliance >= 90 ? 'bg-blue-500' : project.slaCompliance >= 85 ? 'bg-amber-500' : 'bg-red-500'
                      ]"
                      :style="{ width: `${project.slaCompliance}%` }"
                    />
                  </div>
                  <span :class="[
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    getSlaColor(project.slaCompliance)
                  ]">
                    %{{ project.slaCompliance }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span v-if="project.isActive" class="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium inline-flex items-center gap-1">
                  <CheckCircle :size="12" /> Aktif
                </span>
                <span v-else class="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium inline-flex items-center gap-1">
                  <XCircle :size="12" /> Pasif
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(project.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-center gap-1">
                  <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay">
                    <Eye :size="14" class="text-slate-500" />
                  </button>
                  <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Duzenle">
                    <Edit2 :size="14" class="text-slate-500" />
                  </button>
                  <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Analitik">
                    <BarChart3 :size="14" class="text-slate-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <span class="text-sm text-slate-500">
          {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, filtered.length) }} / {{ filtered.length }}
        </span>
        <div class="flex items-center gap-1">
          <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1" class="p-2 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer">
            <ChevronLeft :size="16" />
          </button>
          <template v-for="page in paginationPages" :key="page">
            <button v-if="page !== null" @click="currentPage = page" :class="['w-8 h-8 rounded text-sm cursor-pointer', page === currentPage ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600']">
              {{ page }}
            </button>
          </template>
          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages" class="p-2 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Search, RefreshCw, Edit2, Eye, Building2, Package, TrendingUp,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, BarChart3, Target,
  DollarSign
} from 'lucide-vue-next'
import { generateProjects } from '@/services/mockData'
import { formatCurrency, formatNumber, formatDate } from '@/utils'

const router = useRouter()
const projects = ref([])
const filtered = ref([])
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = 20

onMounted(() => {
  const data = generateProjects()
  projects.value = data
  filtered.value = data
})

watch([search, statusFilter, projects], () => {
  let result = [...projects.value]
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.code.toLowerCase().includes(s) ||
      p.client.toLowerCase().includes(s)
    )
  }
  if (statusFilter.value === 'active') {
    result = result.filter(p => p.isActive)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(p => !p.isActive)
  }
  filtered.value = result
  currentPage.value = 1
})

const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))
const paginatedProjects = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

const activeCount = computed(() => projects.value.filter(p => p.isActive).length)
const totalOrders = computed(() => projects.value.reduce((s, p) => s + p.orderCount, 0))
const totalRevenue = computed(() => projects.value.reduce((s, p) => s + p.revenue, 0))
const avgSla = computed(() => projects.value.length > 0 ? Math.round(projects.value.reduce((s, p) => s + p.slaCompliance, 0) / projects.value.length) : 0)

const getSlaColor = (slaCompliance) => {
  if (slaCompliance >= 95) return 'text-green-600 bg-green-50'
  if (slaCompliance >= 90) return 'text-blue-600 bg-blue-50'
  if (slaCompliance >= 85) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

const paginationPages = computed(() => {
  const pages = []
  const count = Math.min(5, totalPages.value)
  for (let i = 0; i < count; i++) {
    const page = Math.max(1, Math.min(currentPage.value - 2, totalPages.value - 4)) + i
    if (page <= totalPages.value) {
      pages.push(page)
    }
  }
  return pages
})
</script>
