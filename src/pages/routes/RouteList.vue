<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Rotalar</h1>
        <p class="text-sm text-slate-500 mt-1">{{ activeCount }} aktif rota, {{ totalOrders }} toplam siparis</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <Plus :size="16" /> Yeni Rota
        </button>
      </div>
    </div>

    <!-- KPI Summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <Route :size="16" class="text-green-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ activeCount }}</p>
        <p class="text-xs text-slate-500 mt-1">Aktif Rota</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Package :size="16" class="text-blue-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ totalOrders }}</p>
        <p class="text-xs text-slate-500 mt-1">Toplam Siparis</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Truck :size="16" class="text-indigo-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ routes.filter(r => r.status !== 'cancelled').length }}</p>
        <p class="text-xs text-slate-500 mt-1">Toplam Kurye</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Clock :size="16" class="text-amber-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">%{{ avgProgress }}</p>
        <p class="text-xs text-slate-500 mt-1">Ort. Ilerleme</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Route List -->
      <div class="lg:col-span-2">
        <!-- Search & Filter -->
        <div class="bg-white rounded-xl border border-slate-100 p-4 mb-4">
          <div class="flex flex-wrap gap-3">
            <div class="relative flex-1 min-w-[200px]">
              <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                v-model="search"
                placeholder="Rota no, kurye, bolge ara..."
                class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <select
              v-model="statusFilter"
              class="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tum Durumlar</option>
              <option v-for="([key, val]) in Object.entries(routeStatuses)" :key="key" :value="key">{{ val.label }}</option>
            </select>
            <button @click="search = ''; statusFilter = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
              <RefreshCw :size="14" /> Sifirla
            </button>
          </div>
        </div>

        <!-- Route Table -->
        <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="text-left px-4 py-3 font-medium text-slate-600">Rota</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600">Siparis</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600">Ilerleme</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600">ETA</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="route in filtered"
                  :key="route._id"
                  :class="[
                    'border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer',
                    selectedRoute?._id === route._id ? 'bg-primary/5' : ''
                  ]"
                  @click="selectedRoute = route"
                >
                  <td class="px-4 py-3">
                    <div>
                      <p class="font-medium text-slate-800">{{ route.routeNumber }}</p>
                      <p class="text-xs text-slate-400">{{ route.region }}</p>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck :size="12" class="text-primary" />
                      </div>
                      <span class="text-slate-700">{{ route.courier }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="font-medium text-slate-700">{{ route.completedStops }}/{{ route.orderCount }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          :class="['h-full rounded-full transition-all', getProgressColor(route.progress)]"
                          :style="{ width: `${route.progress}%` }"
                        />
                      </div>
                      <span class="text-xs font-medium text-slate-600 w-8">%{{ route.progress }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2.5 py-1 rounded-full text-xs font-medium"
                      :style="{ backgroundColor: getRouteStatus(route).bg, color: getRouteStatus(route).color }"
                    >
                      {{ getRouteStatus(route).label }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-600">
                    {{ route.status === 'completed' ? 'Bitti' : formatDateTime(route.eta) }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-1">
                      <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay" @click.stop="selectedRoute = route">
                        <Eye :size="14" class="text-slate-500" />
                      </button>
                      <button
                        v-if="route.status === 'active'"
                        class="p-1.5 hover:bg-slate-100 rounded cursor-pointer"
                        title="Durdur"
                        @click.stop
                      >
                        <Pause :size="14" class="text-slate-500" />
                      </button>
                      <button
                        v-else-if="route.status === 'paused'"
                        class="p-1.5 hover:bg-slate-100 rounded cursor-pointer"
                        title="Devam Et"
                        @click.stop
                      >
                        <Play :size="14" class="text-slate-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column - Map Placeholder & Route Detail -->
      <div class="space-y-6">
        <!-- Map Placeholder -->
        <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div class="bg-gradient-to-br from-slate-100 to-slate-50 h-[250px] flex flex-col items-center justify-center">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
              <Map :size="28" class="text-slate-400" />
            </div>
            <p class="text-sm font-medium text-slate-500">Harita Gorunumu</p>
            <p class="text-xs text-slate-400 mt-1">Rotalari haritada goruntuleyin</p>
            <div v-if="selectedRoute" class="mt-3 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {{ selectedRoute.routeNumber }} - {{ selectedRoute.region }}
            </div>
          </div>
        </div>

        <!-- Selected Route Detail -->
        <div v-if="selectedRoute" class="bg-white rounded-xl border border-slate-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800">{{ selectedRoute.routeNumber }} Detay</h3>
            <span
              class="px-2.5 py-1 rounded-full text-xs font-medium"
              :style="{ backgroundColor: routeStatuses[selectedRoute.status].bg, color: routeStatuses[selectedRoute.status].color }"
            >
              {{ routeStatuses[selectedRoute.status].label }}
            </span>
          </div>

          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-slate-500">Kurye</span>
              <span class="text-slate-700 font-medium">{{ selectedRoute.courier }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Bolge</span>
              <span class="text-slate-700">{{ selectedRoute.region }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Mesafe</span>
              <span class="text-slate-700">{{ selectedRoute.totalDistance }} km</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Tahmini Sure</span>
              <span class="text-slate-700">{{ selectedRoute.estimatedTime }} dk</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Baslangic</span>
              <span class="text-slate-700">{{ formatDateTime(selectedRoute.startedAt) }}</span>
            </div>
          </div>

          <!-- Stops -->
          <h4 class="text-sm font-semibold text-slate-700 mb-3">Duraklar ({{ selectedRoute.completedStops }}/{{ selectedRoute.orderCount }})</h4>
          <div class="space-y-2 max-h-[300px] overflow-y-auto">
            <div
              v-for="(stop, idx) in selectedRoute.stops"
              :key="stop.id"
              :class="[
                'flex items-center gap-3 p-2.5 rounded-lg',
                stop.status === 'delivered' ? 'bg-green-50/50' : stop.status === 'in_transit' ? 'bg-blue-50/50' : 'bg-slate-50'
              ]"
            >
              <div class="flex flex-col items-center">
                <CheckCircle v-if="stop.status === 'delivered'" :size="16" class="text-green-500" />
                <Navigation v-else-if="stop.status === 'in_transit'" :size="16" class="text-blue-500" />
                <div v-else class="w-4 h-4 border-2 border-slate-300 rounded-full" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-slate-700">{{ stop.orderNumber }}</p>
                  <span class="text-xs text-slate-400">#{{ idx + 1 }}</span>
                </div>
                <p class="text-xs text-slate-500 truncate">{{ stop.customer }} - {{ stop.address }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Search, RefreshCw, Eye, MapPin, Truck, Clock, Package,
  Play, Pause, CheckCircle, Navigation, ChevronRight, Map, Route,
  AlertTriangle
} from 'lucide-vue-next'
import { formatNumber, formatDateTime } from '@/utils'

const router = useRouter()

const routeStatuses = {
  active: { label: 'Aktif', color: '#10b981', bg: '#d1fae5' },
  paused: { label: 'Durduruldu', color: '#f59e0b', bg: '#fef3c7' },
  completed: { label: 'Tamamlandi', color: '#6366f1', bg: '#e0e7ff' },
  cancelled: { label: 'Iptal', color: '#ef4444', bg: '#fee2e2' },
}

const routes = ref([])
const search = ref('')
const statusFilter = ref('')
const selectedRoute = ref(null)

onMounted(() => {
  const courierNames = [
    'Serkan Acar', 'Murat Yildirim', 'Hakan Tekin', 'Kemal Bas',
    'Selim Dursun', 'Taner Gul', 'Volkan Aslan', 'Cem Ozkan',
    'Baris Ay', 'Erkan Sahin', 'Firat Kocer', 'Deniz Uysal'
  ]
  const regions = ['Kadikoy', 'Besiktas', 'Sisli', 'Uskudar', 'Bakirkoy', 'Fatih', 'Atasehir', 'Maltepe']
  const statuses = ['active', 'active', 'active', 'active', 'active', 'paused', 'completed', 'completed']

  const mockRoutes = Array.from({ length: 12 }, (_, i) => {
    const totalStops = Math.floor(Math.random() * 8) + 5
    const completedStops = Math.floor(Math.random() * totalStops)
    const status = statuses[i % statuses.length]
    return {
      _id: `route-${i}`,
      routeNumber: `RT-${String(2000 + i).padStart(4, '0')}`,
      courier: courierNames[i % courierNames.length],
      region: regions[i % regions.length],
      orderCount: totalStops,
      completedStops,
      progress: status === 'completed' ? 100 : Math.round((completedStops / totalStops) * 100),
      status,
      totalDistance: (Math.random() * 30 + 5).toFixed(1),
      estimatedTime: Math.floor(Math.random() * 120) + 30,
      eta: new Date(Date.now() + (Math.random() * 7200000)).toISOString(),
      startedAt: new Date(Date.now() - Math.random() * 14400000).toISOString(),
      stops: Array.from({ length: totalStops }, (_, j) => ({
        id: `stop-${i}-${j}`,
        orderNumber: `BRN-${String(1100 + i * 10 + j).padStart(6, '0')}`,
        customer: ['Ahmet Y.', 'Mehmet K.', 'Fatma D.', 'Ayse C.', 'Ali S.'][j % 5],
        address: `${regions[(i + j) % regions.length]} - No:${Math.floor(Math.random() * 200)}`,
        status: j < completedStops ? 'delivered' : j === completedStops ? 'in_transit' : 'pending',
        eta: new Date(Date.now() + j * 1200000).toISOString(),
      })),
    }
  })
  routes.value = mockRoutes
  selectedRoute.value = mockRoutes[0]
})

const filtered = computed(() => {
  return routes.value.filter(r => {
    const matchSearch = !search.value ||
      r.routeNumber.toLowerCase().includes(search.value.toLowerCase()) ||
      r.courier.toLowerCase().includes(search.value.toLowerCase()) ||
      r.region.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !statusFilter.value || r.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

const activeCount = computed(() => routes.value.filter(r => r.status === 'active').length)
const totalOrders = computed(() => routes.value.reduce((sum, r) => sum + r.orderCount, 0))
const avgProgress = computed(() => {
  if (routes.value.length === 0) return 0
  return Math.round(routes.value.reduce((sum, r) => sum + r.progress, 0) / routes.value.length)
})

function getProgressColor(progress) {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 50) return 'bg-blue-500'
  if (progress >= 25) return 'bg-amber-500'
  return 'bg-slate-300'
}

function getRouteStatus(route) {
  return routeStatuses[route.status] || routeStatuses.active
}
</script>
