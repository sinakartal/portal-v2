<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Kullanicilar</h1>
        <p class="text-sm text-slate-500 mt-1">{{ filtered.length }} kullanici listeleniyor</p>
      </div>
      <div class="flex gap-2">
        <button @click="showModal = true" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
          <UserPlus :size="16" /> Kullanici Ekle
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
          roleFilter === key ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:bg-slate-50'
        ]"
      >
        <div class="flex items-center gap-2">
          <Shield :size="14" class="text-slate-400" />
          <span class="text-xs font-medium text-slate-600">{{ label }}</span>
        </div>
        <span class="text-sm font-bold text-slate-800">{{ users.filter(u => u.role === key).length }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-4 mb-4">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            v-model="search"
            placeholder="Ad, e-posta, telefon ara..."
            class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          v-model="roleFilter"
          class="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tum Roller</option>
          <option v-for="[key, label] in Object.entries(ROLES)" :key="key" :value="key">{{ label }}</option>
        </select>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tum Durumlar</option>
          <option v-for="[key, val] in Object.entries(statusConfig)" :key="key" :value="key">{{ val.label }}</option>
        </select>
        <button @click="search = ''; roleFilter = ''; statusFilter = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
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
              <th class="text-left px-4 py-3 font-medium text-slate-600">Kullanici</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">E-posta</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Telefon</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Rol</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Son Giris</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Kayit Tarihi</th>
              <th class="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user._id" class="border-b border-slate-50 hover:bg-slate-50/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-primary">{{ user.name.charAt(0) }}</span>
                  </div>
                  <span class="font-medium text-slate-800">{{ user.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ user.email }}</td>
              <td class="px-4 py-3 text-slate-600">{{ user.phone }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', roleColors[user.role]]">
                  {{ ROLES[user.role] }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium" :style="{ backgroundColor: (statusConfig[user.status] || statusConfig.active).bg, color: (statusConfig[user.status] || statusConfig.active).color }">
                  {{ (statusConfig[user.status] || statusConfig.active).label }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500">
                {{ user.lastLogin ? formatDateTime(user.lastLogin) : 'Hic giris yapmadi' }}
              </td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(user.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-center gap-1">
                  <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Duzenle">
                    <Edit2 :size="14" class="text-slate-500" />
                  </button>
                  <button class="p-1.5 hover:bg-red-50 rounded cursor-pointer" title="Sil">
                    <Trash2 :size="14" class="text-red-400" />
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

    <!-- Add User Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-800 flex items-center gap-2">
            <UserPlus :size="18" class="text-slate-500" /> Yeni Kullanici Ekle
          </h3>
          <button @click="showModal = false; modalErrors = {}" class="p-1.5 hover:bg-slate-100 rounded cursor-pointer">
            <X :size="18" class="text-slate-500" />
          </button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Ad Soyad *</label>
            <input
              type="text"
              v-model="newUser.name"
              placeholder="Kullanici adi..."
              :class="['w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary', modalErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200']"
            />
            <p v-if="modalErrors.name" class="text-xs text-red-500 mt-1">{{ modalErrors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">E-posta *</label>
            <div class="relative">
              <Mail :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                v-model="newUser.email"
                placeholder="eposta@ornek.com"
                :class="['w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary', modalErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-200']"
              />
            </div>
            <p v-if="modalErrors.email" class="text-xs text-red-500 mt-1">{{ modalErrors.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Telefon *</label>
            <div class="relative">
              <Phone :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                v-model="newUser.phone"
                placeholder="05XX XXX XXXX"
                :class="['w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary', modalErrors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200']"
              />
            </div>
            <p v-if="modalErrors.phone" class="text-xs text-red-500 mt-1">{{ modalErrors.phone }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Rol</label>
            <select
              v-model="newUser.role"
              class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option v-for="[key, label] in Object.entries(ROLES)" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Durum</label>
            <select
              v-model="newUser.status"
              class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <button @click="showModal = false; modalErrors = {}" class="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 cursor-pointer">
            Iptal
          </button>
          <button @click="handleAddUser" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Save :size="16" /> Kaydet
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Search, RefreshCw, Edit2, Trash2, Eye, Users, Shield,
  Mail, Phone, Clock, X, Save, ChevronLeft, ChevronRight, UserPlus
} from 'lucide-vue-next'
import { ROLES } from '@/constants/menu'
import { formatDate, formatDateTime } from '@/utils'

const router = useRouter()
const users = ref([])
const filtered = ref([])
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const currentPage = ref(1)
const perPage = 20

const newUser = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'operator',
  status: 'active',
})
const modalErrors = ref({})

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
    { _id: 'u9', name: 'Mustafa Dogan', email: 'mustafa@heybringo.com', phone: '0532 100 0009', role: 'viewer', status: 'inactive', lastLogin: new Date(Date.now() - 2592000000).toISOString(), createdAt: '2025-08-10T10:00:00Z' },
    { _id: 'u10', name: 'Emine Koc', email: 'emine@heybringo.com', phone: '0532 100 0010', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 43200000).toISOString(), createdAt: '2025-09-01T10:00:00Z' },
    { _id: 'u11', name: 'Huseyin Aydin', email: 'huseyin@heybringo.com', phone: '0532 100 0011', role: 'admin', status: 'active', lastLogin: new Date(Date.now() - 7200000).toISOString(), createdAt: '2025-10-15T10:00:00Z' },
    { _id: 'u12', name: 'Merve Polat', email: 'merve@heybringo.com', phone: '0532 100 0012', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 21600000).toISOString(), createdAt: '2025-11-20T10:00:00Z' },
  ]
  users.value = mockUsers
  filtered.value = mockUsers
})

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

const statusConfig = {
  active: { label: 'Aktif', color: '#10b981', bg: '#d1fae5' },
  suspended: { label: 'Askida', color: '#f59e0b', bg: '#fef3c7' },
  inactive: { label: 'Pasif', color: '#6b7280', bg: '#f3f4f6' },
}

const roleColors = {
  super_admin: 'bg-red-50 text-red-600',
  admin: 'bg-purple-50 text-purple-600',
  manager: 'bg-blue-50 text-blue-600',
  operator: 'bg-green-50 text-green-600',
  viewer: 'bg-slate-100 text-slate-600',
}

const validateModal = () => {
  const e = {}
  if (!newUser.name.trim()) e.name = 'Ad soyad zorunlu'
  if (!newUser.email.trim()) e.email = 'E-posta zorunlu'
  if (!newUser.phone.trim()) e.phone = 'Telefon zorunlu'
  modalErrors.value = e
  return Object.keys(e).length === 0
}

const handleAddUser = () => {
  if (!validateModal()) return
  const user = {
    _id: `u${Date.now()}`,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    status: newUser.status,
    lastLogin: null,
    createdAt: new Date().toISOString(),
  }
  users.value = [user, ...users.value]
  showModal.value = false
  newUser.name = ''
  newUser.email = ''
  newUser.phone = ''
  newUser.role = 'operator'
  newUser.status = 'active'
  modalErrors.value = {}
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
