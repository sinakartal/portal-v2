<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Kullanicilar</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ filtered.length }} kullanici listeleniyor</p>
      </div>
      <div class="flex gap-2">
        <button @click="openInviteModal" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <UserPlus :size="16" /> Yeni Kullanici
        </button>
      </div>
    </div>

    <!-- Role Summary -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <button
        v-for="[key, label] in Object.entries(ROLES)"
        :key="key"
        @click="roleFilter = roleFilter === key ? '' : key"
        :class="[
          'flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer',
          roleFilter === key
            ? 'border-primary bg-primary/5 dark:bg-primary/10'
            : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        <div class="flex items-center gap-2">
          <span :class="['w-2 h-2 rounded-full', roleDot[key]]" />
          <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ label }}</span>
        </div>
        <span class="text-sm font-bold text-slate-800 dark:text-white">{{ users.filter(u => u.role === key).length }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            v-model="search"
            placeholder="Ad, e-posta, telefon ara..."
            class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          v-model="roleFilter"
          class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tum Roller</option>
          <option v-for="[key, label] in Object.entries(ROLES)" :key="key" :value="key">{{ label }}</option>
        </select>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tum Durumlar</option>
          <option v-for="[key, val] in Object.entries(statusConfig)" :key="key" :value="key">{{ val.label }}</option>
        </select>
        <button @click="search = ''; roleFilter = ''; statusFilter = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
          <RefreshCw :size="14" /> Sifirla
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Kullanici</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">E-posta</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Telefon</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Rol</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Durum</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Son Giris</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Kayit Tarihi</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Islem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user._id" class="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-primary">{{ user.name.charAt(0) }}</span>
                  </div>
                  <span class="font-medium text-slate-800 dark:text-white">{{ user.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ user.email }}</td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ user.phone }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', roleColors[user.role]]">
                  {{ ROLES[user.role] }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <!-- Active/Passive Toggle -->
                <button
                  @click="confirmToggleStatus(user)"
                  class="cursor-pointer"
                  :title="user.status === 'active' ? 'Pasif yap' : 'Aktif yap'"
                >
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium" :style="{ backgroundColor: (statusConfig[user.status] || statusConfig.active).bg, color: (statusConfig[user.status] || statusConfig.active).color }">
                    {{ (statusConfig[user.status] || statusConfig.active).label }}
                  </span>
                </button>
              </td>
              <td class="px-4 py-3">
                <div v-if="user.lastLogin" class="flex items-center gap-1.5">
                  <AlertTriangle v-if="isInactiveLogin(user.lastLogin)" :size="14" class="text-amber-500 flex-shrink-0" title="30 gunden fazla once" />
                  <span :class="isInactiveLogin(user.lastLogin) ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'" class="text-xs">
                    {{ relativeTime(user.lastLogin) }}
                  </span>
                </div>
                <span v-else class="text-xs text-slate-400 dark:text-slate-500">Hic giris yapmadi</span>
              </td>
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{{ formatDate(user.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-center gap-1">
                  <button @click="openPermissionModal(user)" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" title="Yetkiler">
                    <Shield :size="14" class="text-slate-500 dark:text-slate-400" />
                  </button>
                  <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" title="Duzenle">
                    <Edit2 :size="14" class="text-slate-500 dark:text-slate-400" />
                  </button>
                  <button class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer" title="Sil">
                    <Trash2 :size="14" class="text-red-400" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
        <span class="text-sm text-slate-500 dark:text-slate-400">
          {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, filtered.length) }} / {{ filtered.length }}
        </span>
        <div class="flex items-center gap-1">
          <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer">
            <ChevronLeft :size="16" class="text-slate-600 dark:text-slate-300" />
          </button>
          <template v-for="page in paginationPages" :key="page">
            <button v-if="page !== null" @click="currentPage = page" :class="['w-8 h-8 rounded text-sm cursor-pointer', page === currentPage ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300']">
              {{ page }}
            </button>
          </template>
          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer">
            <ChevronRight :size="16" class="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== Email Invite Modal ==================== -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg mx-4 shadow-xl">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 class="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <UserPlus :size="18" class="text-slate-500 dark:text-slate-400" /> Yeni Kullanici Davet Et
            </h3>
            <button @click="showModal = false; modalErrors = {}" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
              <X :size="18" class="text-slate-500" />
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-posta *</label>
              <div class="relative">
                <Mail :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  v-model="inviteForm.email"
                  placeholder="kullanici@ornek.com"
                  :class="['w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-slate-800 text-slate-800 dark:text-white', modalErrors.email ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700']"
                />
              </div>
              <p v-if="modalErrors.email" class="text-xs text-red-500 mt-1">{{ modalErrors.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rol *</label>
              <select
                v-model="inviteForm.role"
                class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option v-for="[key, label] in Object.entries(ROLES)" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Proje Erisimleri</label>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <label v-for="project in availableProjects" :key="project.id" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="inviteForm.projectAccess" :value="project.id"
                    class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20" />
                  <span class="text-sm text-slate-700 dark:text-slate-300">{{ project.name }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
            <button @click="showModal = false; modalErrors = {}" class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              Iptal
            </button>
            <button @click="handleInvite" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
              <Send :size="16" /> Davet Gonder
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== Toggle Status Confirmation ==================== -->
    <Teleport to="body">
      <div v-if="showToggleConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm mx-4 shadow-xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center',
              toggleTarget?.status === 'active' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'
            ]">
              <AlertTriangle v-if="toggleTarget?.status === 'active'" :size="20" class="text-amber-600" />
              <CheckCircle v-else :size="20" class="text-green-600" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-800 dark:text-white">
                {{ toggleTarget?.status === 'active' ? 'Kullaniciyi Pasif Yap' : 'Kullaniciyi Aktif Yap' }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ toggleTarget?.name }}</p>
            </div>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-6">
            {{ toggleTarget?.status === 'active'
              ? 'Bu kullanici sisteme giris yapamayacak. Devam etmek istiyor musunuz?'
              : 'Bu kullanici tekrar sisteme giris yapabilecek. Devam etmek istiyor musunuz?' }}
          </p>
          <div class="flex justify-end gap-3">
            <button @click="showToggleConfirm = false; toggleTarget = null" class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              Iptal
            </button>
            <button
              @click="executeToggleStatus"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors',
                toggleTarget?.status === 'active'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              ]"
            >
              {{ toggleTarget?.status === 'active' ? 'Pasif Yap' : 'Aktif Yap' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== Permission Matrix Modal ==================== -->
    <Teleport to="body">
      <div v-if="showPermissions" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-3xl mx-4 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
            <div>
              <h3 class="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Shield :size="18" class="text-slate-500 dark:text-slate-400" /> Yetki Matrisi
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ permissionTarget?.name }} - {{ ROLES[permissionTarget?.role] }}</p>
            </div>
            <button @click="showPermissions = false; permissionTarget = null" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
              <X :size="18" class="text-slate-500" />
            </button>
          </div>
          <div class="overflow-auto flex-1 px-6 py-4">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-white dark:bg-slate-900">
                <tr>
                  <th class="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400 w-40">Sayfa</th>
                  <th v-for="action in permissionActions" :key="action" class="text-center py-2 px-3 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {{ action }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="page in permissionPages" :key="page.id" class="border-t border-slate-100 dark:border-slate-800">
                  <td class="py-3 pr-4 font-medium text-slate-700 dark:text-slate-300">{{ page.label }}</td>
                  <td v-for="action in permissionActions" :key="action" class="text-center py-3 px-3">
                    <label class="inline-flex cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="permissionMatrix[page.id + ':' + action]"
                        class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex-shrink-0">
            <button @click="showPermissions = false; permissionTarget = null" class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              Iptal
            </button>
            <button @click="savePermissions" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
              <Save :size="16" /> Kaydet
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Search, RefreshCw, Edit2, Trash2, Eye, Users, Shield,
  Mail, Phone, Clock, X, Save, ChevronLeft, ChevronRight, UserPlus,
  AlertTriangle, CheckCircle, Send
} from 'lucide-vue-next'
import { ROLES } from '@/constants/menu'
import { formatDate, formatDateTime, timeAgo } from '@/utils'

const router = useRouter()
const users = ref([])
const filtered = ref([])
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const currentPage = ref(1)
const perPage = 20

// --- Invite Form ---
const inviteForm = reactive({
  email: '',
  role: 'operator',
  projectAccess: [],
})
const modalErrors = ref({})

const availableProjects = ref([
  { id: 'p1', name: 'HeyBringo Ana Proje' },
  { id: 'p2', name: 'FreshMarket' },
  { id: 'p3', name: 'QuickDelivery' },
  { id: 'p4', name: 'CityExpress' },
])

function openInviteModal() {
  inviteForm.email = ''
  inviteForm.role = 'operator'
  inviteForm.projectAccess = []
  modalErrors.value = {}
  showModal.value = true
}

function handleInvite() {
  const e = {}
  if (!inviteForm.email.trim()) e.email = 'E-posta zorunlu'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) e.email = 'Gecerli bir e-posta girin'
  modalErrors.value = e
  if (Object.keys(e).length > 0) return

  // Simulate invite (add as pending user)
  const user = {
    _id: `u${Date.now()}`,
    name: inviteForm.email.split('@')[0],
    email: inviteForm.email,
    phone: '',
    role: inviteForm.role,
    status: 'active',
    lastLogin: null,
    createdAt: new Date().toISOString(),
    projectAccess: [...inviteForm.projectAccess],
  }
  users.value = [user, ...users.value]
  showModal.value = false
}

// --- Toggle Status ---
const showToggleConfirm = ref(false)
const toggleTarget = ref(null)

function confirmToggleStatus(user) {
  toggleTarget.value = user
  showToggleConfirm.value = true
}

function executeToggleStatus() {
  if (!toggleTarget.value) return
  const userId = toggleTarget.value._id
  users.value = users.value.map(u => {
    if (u._id === userId) {
      return { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
    }
    return u
  })
  showToggleConfirm.value = false
  toggleTarget.value = null
}

// --- Permission Matrix ---
const showPermissions = ref(false)
const permissionTarget = ref(null)
const permissionMatrix = reactive({})

const permissionPages = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Siparisler' },
  { id: 'couriers', label: 'Kuryeler' },
  { id: 'routes', label: 'Rotalar' },
  { id: 'analytics', label: 'Analitik' },
  { id: 'finance', label: 'Finans' },
  { id: 'settings', label: 'Ayarlar' },
  { id: 'users', label: 'Kullanicilar' },
  { id: 'partners', label: 'Partnerler' },
]

const permissionActions = ['Goruntule', 'Olustur', 'Duzenle', 'Sil']

function openPermissionModal(user) {
  permissionTarget.value = user
  // Initialize matrix with defaults based on role
  const defaults = {
    super_admin: true,
    admin: true,
    manager: (page, action) => action !== 'Sil' || ['orders', 'couriers'].includes(page),
    operator: (page, action) => action === 'Goruntule' || (action === 'Olustur' && ['orders'].includes(page)),
    viewer: (page, action) => action === 'Goruntule',
  }
  permissionPages.forEach(page => {
    permissionActions.forEach(action => {
      const key = page.id + ':' + action
      const def = defaults[user.role]
      if (typeof def === 'function') {
        permissionMatrix[key] = def(page.id, action)
      } else {
        permissionMatrix[key] = !!def
      }
    })
  })
  showPermissions.value = true
}

function savePermissions() {
  // In real app: save to API
  console.log('[Permissions] Saved for', permissionTarget.value?.name, { ...permissionMatrix })
  showPermissions.value = false
  permissionTarget.value = null
}

// --- Relative time / inactive login ---
function relativeTime(date) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Az once'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} dk once`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} saat once`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} gun once`
  const months = Math.floor(days / 30)
  return `${months} ay once`
}

function isInactiveLogin(date) {
  if (!date) return false
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  return days > 30
}

// --- Mock Users ---
onMounted(() => {
  const mockUsers = [
    { _id: 'u1', name: 'Sina Kartal', email: 'sina@heybringo.com', phone: '0532 100 0001', role: 'super_admin', status: 'active', lastLogin: new Date(Date.now() - 300000).toISOString(), createdAt: '2025-01-15T10:00:00Z' },
    { _id: 'u2', name: 'Elif Kaya', email: 'elif@heybringo.com', phone: '0532 100 0002', role: 'admin', status: 'active', lastLogin: new Date(Date.now() - 3600000).toISOString(), createdAt: '2025-02-20T10:00:00Z' },
    { _id: 'u3', name: 'Mehmet Demir', email: 'mehmet@heybringo.com', phone: '0532 100 0003', role: 'manager', status: 'active', lastLogin: new Date(Date.now() - 7200000).toISOString(), createdAt: '2025-03-10T10:00:00Z' },
    { _id: 'u4', name: 'Ayse Yilmaz', email: 'ayse@heybringo.com', phone: '0532 100 0004', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 14400000).toISOString(), createdAt: '2025-04-05T10:00:00Z' },
    { _id: 'u5', name: 'Hasan Celik', email: 'hasan@heybringo.com', phone: '0532 100 0005', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 28800000).toISOString(), createdAt: '2025-05-12T10:00:00Z' },
    { _id: 'u6', name: 'Fatma Ozturk', email: 'fatma@heybringo.com', phone: '0532 100 0006', role: 'manager', status: 'suspended', lastLogin: new Date(Date.now() - 604800000).toISOString(), createdAt: '2025-05-20T10:00:00Z' },
    { _id: 'u7', name: 'Ali Sahin', email: 'ali@heybringo.com', phone: '0532 100 0007', role: 'viewer', status: 'active', lastLogin: new Date(Date.now() - 86400000).toISOString(), createdAt: '2025-06-01T10:00:00Z' },
    { _id: 'u8', name: 'Zeynep Arslan', email: 'zeynep@heybringo.com', phone: '0532 100 0008', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 172800000).toISOString(), createdAt: '2025-07-15T10:00:00Z' },
    { _id: 'u9', name: 'Mustafa Dogan', email: 'mustafa@heybringo.com', phone: '0532 100 0009', role: 'viewer', status: 'inactive', lastLogin: new Date(Date.now() - 5184000000).toISOString(), createdAt: '2025-08-10T10:00:00Z' },
    { _id: 'u10', name: 'Emine Koc', email: 'emine@heybringo.com', phone: '0532 100 0010', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 43200000).toISOString(), createdAt: '2025-09-01T10:00:00Z' },
    { _id: 'u11', name: 'Huseyin Aydin', email: 'huseyin@heybringo.com', phone: '0532 100 0011', role: 'admin', status: 'active', lastLogin: new Date(Date.now() - 7200000).toISOString(), createdAt: '2025-10-15T10:00:00Z' },
    { _id: 'u12', name: 'Merve Polat', email: 'merve@heybringo.com', phone: '0532 100 0012', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 21600000).toISOString(), createdAt: '2025-11-20T10:00:00Z' },
  ]
  users.value = mockUsers
  filtered.value = mockUsers
})

// --- Filtering ---
watch([search, roleFilter, statusFilter, users], () => {
  let result = [...users.value]
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.phone.includes(s)
    )
  }
  if (roleFilter.value) {
    result = result.filter(u => u.role === roleFilter.value)
  }
  if (statusFilter.value) {
    result = result.filter(u => u.status === statusFilter.value)
  }
  filtered.value = result
  currentPage.value = 1
})

const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))
const paginatedUsers = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

// --- Status & Role Config ---
const statusConfig = {
  active: { label: 'Aktif', color: '#10b981', bg: '#d1fae5' },
  suspended: { label: 'Askida', color: '#f59e0b', bg: '#fef3c7' },
  inactive: { label: 'Pasif', color: '#6b7280', bg: '#f3f4f6' },
}

const roleColors = {
  super_admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  admin: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  manager: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  operator: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  viewer: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
}

const roleDot = {
  super_admin: 'bg-red-500',
  admin: 'bg-red-400',
  manager: 'bg-blue-500',
  operator: 'bg-green-500',
  viewer: 'bg-slate-400',
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
