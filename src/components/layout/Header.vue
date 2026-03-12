<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import {
  Bell, Search, ChevronDown, LogOut, User, Settings,
  Sun, Moon, Package, Truck, AlertTriangle, CheckCircle,
  Volume2, VolumeX, X, Command, ChevronRight
} from 'lucide-vue-next'

const auth = useAuthStore()
const theme = useThemeStore()
const router = useRouter()
const route = useRoute()

const showDropdown = ref(false)
const showNotifications = ref(false)
const notifFilter = ref('all')
const soundEnabled = ref(true)

// Close panels on outside click
const handleOutsideClick = (e) => {
  if (showNotifications.value && !e.target.closest('.notif-panel')) {
    showNotifications.value = false
  }
  if (showDropdown.value && !e.target.closest('.user-menu')) {
    showDropdown.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

// CMD+K shortcut
const openCommandPalette = () => {
  const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
  document.dispatchEvent(event)
}
const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openCommandPalette()
  }
}
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const stopImpersonation = () => {
  auth.stopImpersonation()
  window.location.href = '/tenants'
}

// Breadcrumb
const ROUTE_LABELS = {
  dashboard: 'Dashboard',
  orders: 'Siparisler',
  couriers: 'Kuryeler',
  routes: 'Rotalar',
  analytics: 'Analitik',
  reports: 'Raporlar',
  finance: 'Finans',
  inventory: 'Zimmet & Nakit',
  partners: 'Partnerler',
  settings: 'Ayarlar',
  projects: 'Projeler',
  users: 'Kullanicilar',
  tenants: 'Tenant Yonetimi',
  offers: 'Teklifler',
  incentives: 'Tesvikler',
  'checkout-preview': 'Checkout Widget',
  new: 'Yeni',
  import: 'Excel Import',
  plan: 'Rota Planlama',
  compare: 'Karsilastir',
  rules: 'Kurallar',
  transfer: 'Transfer',
  reconciliation: 'Mutabakat',
  equipment: 'Ekipman',
  risk: 'Nakit Risk',
}

const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  return segments.map((seg, i) => ({
    label: ROUTE_LABELS[seg] || decodeURIComponent(seg),
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))
})

// Notifications
const notifications = ref([
  { id: 1, type: 'alert', title: 'Siparis #4521 gecikiyor', message: '15 dk SLA asimi', time: '2 dk once', read: false, icon: AlertTriangle, iconBg: 'bg-red-50 dark:bg-red-900/30', iconColor: 'text-red-500' },
  { id: 2, type: 'order', title: 'Yeni siparis alindi', message: 'BRN-001250 - Fatma Demir', time: '5 dk once', read: false, icon: Package, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
  { id: 3, type: 'delivery', title: 'Siparis #4520 teslim edildi', message: 'Ali Riza K. - Kadikoy', time: '8 dk once', read: false, icon: CheckCircle, iconBg: 'bg-green-50 dark:bg-green-900/30', iconColor: 'text-green-500' },
  { id: 4, type: 'courier', title: 'Murat Yildirim offline', message: '30 dk dir baglanti yok', time: '15 dk once', read: true, icon: Truck, iconBg: 'bg-orange-50 dark:bg-orange-900/30', iconColor: 'text-orange-500' },
  { id: 5, type: 'alert', title: 'SLA ihlali - 3 siparis', message: 'Express Teslimat projesi', time: '25 dk once', read: true, icon: AlertTriangle, iconBg: 'bg-red-50 dark:bg-red-900/30', iconColor: 'text-red-500' },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const filteredNotifs = computed(() =>
  notifFilter.value === 'all' ? notifications.value : notifications.value.filter(n => n.type === notifFilter.value)
)

const dismissNotif = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const markAllRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const notifTypes = [
  { key: 'all', label: 'Tumu' },
  { key: 'alert', label: 'Uyari' },
  { key: 'order', label: 'Siparis' },
  { key: 'delivery', label: 'Teslimat' },
  { key: 'courier', label: 'Kurye' },
]
</script>

<template>
  <!-- Impersonation Banner -->
  <div v-if="auth.impersonating" class="h-10 bg-amber-500 text-white flex items-center justify-center gap-3 text-sm font-medium px-4">
    <AlertTriangle :size="16" />
    <span>{{ auth.impersonateName || auth.impersonating }} olarak goruntuluyorsunuz</span>
    <button @click="stopImpersonation" class="ml-2 px-3 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold cursor-pointer transition-colors">
      Cikis
    </button>
  </div>
  <header class="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-1.5 min-w-0">
      <template v-for="(crumb, i) in breadcrumbs" :key="crumb.path">
        <ChevronRight v-if="i > 0" :size="14" class="text-slate-300 dark:text-slate-600 flex-shrink-0" />
        <RouterLink
          v-if="!crumb.isLast"
          :to="crumb.path"
          class="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors truncate"
        >
          {{ crumb.label }}
        </RouterLink>
        <span v-else class="text-sm font-semibold text-slate-800 dark:text-white truncate">
          {{ crumb.label }}
        </span>
      </template>
    </div>

    <div class="flex items-center gap-2">
      <!-- CMD+K Search Button -->
      <button
        @click="openCommandPalette"
        class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
      >
        <Search :size="14" />
        <span class="hidden md:inline">Ara veya komut calistir...</span>
        <kbd class="hidden md:flex items-center gap-0.5 ml-2 px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-medium text-slate-400">
          <Command :size="10" />K
        </kbd>
      </button>

      <!-- Dark Mode Toggle -->
      <button
        @click="theme.toggle()"
        class="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
        :title="theme.dark ? 'Acik mod' : 'Karanlik mod'"
      >
        <Sun v-if="theme.dark" :size="18" />
        <Moon v-else :size="18" />
      </button>

      <!-- Notifications -->
      <div class="relative notif-panel">
        <button
          @click="showNotifications = !showNotifications; showDropdown = false"
          class="relative p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
        >
          <Bell :size="18" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
          >
            {{ unreadCount }}
          </span>
        </button>
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="showNotifications"
            class="absolute right-0 top-12 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50"
          >
            <div class="p-4 border-b border-slate-100 dark:border-slate-700">
              <div class="flex justify-between items-center mb-3">
                <span class="font-semibold text-sm text-slate-800 dark:text-white">Bildirimler ({{ unreadCount }})</span>
                <div class="flex items-center gap-2">
                  <button
                    @click="soundEnabled = !soundEnabled"
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    :title="soundEnabled ? 'Sesi kapat' : 'Sesi ac'"
                  >
                    <Volume2 v-if="soundEnabled" :size="14" />
                    <VolumeX v-else :size="14" />
                  </button>
                  <button @click="markAllRead" class="text-xs text-primary cursor-pointer hover:underline">Tumunu okundu isaretle</button>
                </div>
              </div>
              <div class="flex gap-1">
                <button
                  v-for="t in notifTypes"
                  :key="t.key"
                  @click="notifFilter = t.key"
                  class="px-2.5 py-1 text-xs rounded-full cursor-pointer transition-colors"
                  :class="notifFilter === t.key
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
                >
                  {{ t.label }}
                </button>
              </div>
            </div>
            <div class="max-h-[320px] overflow-y-auto">
              <div
                v-for="n in filteredNotifs.slice(0, 5)"
                :key="n.id"
                class="group p-3.5 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative"
                :class="!n.read ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''"
              >
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :class="n.iconBg">
                    <component :is="n.icon" :size="14" :class="n.iconColor" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <span class="text-sm font-medium" :class="!n.read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'">{{ n.title }}</span>
                      <span class="text-[10px] text-slate-400 ml-2 flex-shrink-0">{{ n.time }}</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">{{ n.message }}</p>
                  </div>
                  <button
                    @click.stop="dismissNotif(n.id)"
                    class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all flex-shrink-0"
                  >
                    <X :size="12" class="text-slate-400" />
                  </button>
                </div>
                <span v-if="!n.read" class="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
              </div>
            </div>
            <div class="p-3 text-center border-t border-slate-100 dark:border-slate-700">
              <button class="text-xs text-primary font-medium cursor-pointer hover:underline">Tum bildirimleri gor</button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- User Menu -->
      <div class="relative user-menu">
        <button
          @click="showDropdown = !showDropdown; showNotifications = false"
          class="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-semibold">
            {{ auth.user?.firstName?.[0] }}{{ auth.user?.lastName?.[0] }}
          </div>
          <div class="text-left hidden md:block">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</p>
            <p class="text-[10px] text-slate-400 capitalize">{{ auth.user?.role?.replace('_', ' ') }}</p>
          </div>
          <ChevronDown :size="14" class="text-slate-400 hidden md:block" />
        </button>
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="showDropdown"
            class="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
          >
            <button class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              <User :size="16" /> Profil
            </button>
            <button @click="router.push('/settings'); showDropdown = false" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              <Settings :size="16" /> Ayarlar
            </button>
            <hr class="my-1 border-slate-100 dark:border-slate-700" />
            <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
              <LogOut :size="16" /> Cikis Yap
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
