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
                  <button @click="openProjectDetail(project)" class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay">
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

    <!-- Project Detail Modal -->
    <Teleport to="body">
      <div v-if="showProjectModal && selectedProject" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="showProjectModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 class="text-lg font-bold text-slate-800">{{ selectedProject.name }}</h2>
              <p class="text-sm text-slate-500">{{ selectedProject.client }} - {{ selectedProject.code }}</p>
            </div>
            <button @click="showProjectModal = false" class="p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
              <X :size="18" class="text-slate-500" />
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[65vh] space-y-6">
            <!-- Branches Section -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <GitBranch :size="15" class="text-slate-500" />
                  Subeler ({{ selectedProject.branches.length }})
                </h3>
                <button @click="showAddBranch = !showAddBranch" class="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium cursor-pointer">
                  <Plus :size="13" /> Sube Ekle
                </button>
              </div>

              <!-- Add Branch Form -->
              <div v-if="showAddBranch" class="bg-blue-50 rounded-lg p-3 mb-3">
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="newBranch.name" placeholder="Sube adi" class="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                  <input v-model="newBranch.address" placeholder="Adres" class="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div class="flex gap-2 mt-2">
                  <button @click="handleAddBranch" class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium cursor-pointer">Ekle</button>
                  <button @click="showAddBranch = false" class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium cursor-pointer">Iptal</button>
                </div>
              </div>

              <div class="space-y-2">
                <div v-for="branch in selectedProject.branches" :key="branch.id" class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <MapPin :size="14" class="text-indigo-500" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-slate-700">{{ branch.name }}</p>
                    <p class="text-xs text-slate-500">{{ branch.address }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Couriers Section -->
            <div>
              <h3 class="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                <Truck :size="15" class="text-slate-500" />
                Atanan Kuryeler ({{ selectedProject.couriers.length }})
              </h3>

              <!-- Assigned Couriers -->
              <div v-if="selectedProject.couriers.length > 0" class="space-y-2 mb-3">
                <div v-for="courier in selectedProject.couriers" :key="courier.id" class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck :size="14" class="text-green-600" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-slate-700">{{ courier.name }}</p>
                  </div>
                  <button @click="handleRemoveCourier(courier.id)" class="p-1.5 hover:bg-red-50 rounded cursor-pointer">
                    <Trash2 :size="13" class="text-red-400" />
                  </button>
                </div>
              </div>
              <p v-else class="text-xs text-slate-400 mb-3">Henuz kurye atanmadi</p>

              <!-- Available Couriers to Add -->
              <div v-if="availableCouriers.length > 0">
                <p class="text-xs text-slate-500 mb-2">Kurye Ata:</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="courier in availableCouriers.filter(c => !selectedProject.couriers.find(sc => sc.id === c.id))"
                    :key="courier.id"
                    @click="handleAssignCourier(courier.id)"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 rounded-full text-xs text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <UserPlus :size="12" /> {{ courier.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Search, RefreshCw, Edit2, Eye, Building2, Package, TrendingUp,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, BarChart3, Target,
  DollarSign, MapPin, Truck, X, UserPlus, Trash2, GitBranch
} from 'lucide-vue-next'
import { getProjects, addBranch, assignCourier, removeCourier, getCouriers } from '@/services/api'
import { formatCurrency, formatNumber, formatDate } from '@/utils'

const router = useRouter()
const projects = ref([])
const filtered = ref([])
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = 20
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getProjects()
    if (res.ok) {
      const data = Array.isArray(res.data) ? res.data : res.data?.projects || []
      projects.value = data
      filtered.value = data
    } else {
      error.value = 'Projeler yuklenemedi'
    }
  } catch (e) {
    error.value = e.message || 'Veri yuklenirken hata olustu'
  } finally {
    loading.value = false
  }
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

// Branch & Courier Management
const showProjectModal = ref(false)
const selectedProject = ref(null)
const availableCouriers = ref([])
const newBranch = ref({ name: '', address: '', lat: 0, lng: 0 })
const showAddBranch = ref(false)

async function openProjectDetail(project) {
  selectedProject.value = {
    ...project,
    branches: project.branches || [
      { id: 'b1', name: 'Merkez Depo', address: 'Kadikoy, Istanbul', lat: 40.98, lng: 29.03 },
      { id: 'b2', name: 'Sube 2', address: 'Besiktas, Istanbul', lat: 41.04, lng: 29.00 },
    ],
    couriers: project.couriers || [],
  }
  showProjectModal.value = true

  const res = await getCouriers()
  if (res.ok) {
    const raw = Array.isArray(res.data) ? res.data : res.data?.couriers || []
    availableCouriers.value = raw.map(c => ({
      id: c.id || c.courierId,
      name: c.name || `Kurye ${c.id}`,
      status: c.status || 'active',
    }))
  }
}

async function handleAddBranch() {
  if (!selectedProject.value || !newBranch.value.name) return
  await addBranch(selectedProject.value._id || selectedProject.value.code, newBranch.value)
  selectedProject.value.branches.push({ id: `b-${Date.now()}`, ...newBranch.value })
  newBranch.value = { name: '', address: '', lat: 0, lng: 0 }
  showAddBranch.value = false
}

async function handleAssignCourier(courierId) {
  if (!selectedProject.value) return
  await assignCourier(selectedProject.value._id || selectedProject.value.code, courierId)
  const courier = availableCouriers.value.find(c => c.id === courierId)
  if (courier && !selectedProject.value.couriers.find(c => c.id === courierId)) {
    selectedProject.value.couriers.push(courier)
  }
}

async function handleRemoveCourier(courierId) {
  if (!selectedProject.value) return
  await removeCourier(selectedProject.value._id || selectedProject.value.code, courierId)
  selectedProject.value.couriers = selectedProject.value.couriers.filter(c => c.id !== courierId)
}
</script>
