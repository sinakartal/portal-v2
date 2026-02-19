<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import {
  Bell, Search, ChevronDown, LogOut, User, Settings,
  Sun, Moon, Package, Truck, AlertTriangle, CheckCircle,
  Volume2, VolumeX
} from 'lucide-vue-next'

const auth = useAuthStore()
const theme = useThemeStore()
const router = useRouter()

const showDropdown = ref(false)
const showNotifications = ref(false)
const notifFilter = ref('all')
const soundEnabled = ref(true)

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const notifications = [
  { id: 1, type: 'alert', title: 'Siparis #4521 gecikiyor', message: '15 dk SLA asimi', time: '2 dk once', read: false, icon: AlertTriangle, iconBg: 'bg-red-50 dark:bg-red-900/30', iconColor: 'text-red-500' },
  { id: 2, type: 'order', title: 'Yeni siparis alindi', message: 'BRN-001250 - Fatma Demir', time: '5 dk once', read: false, icon: Package, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
  { id: 3, type: 'delivery', title: 'Siparis #4520 teslim edildi', message: 'Ali Riza K. - Kadikoy', time: '8 dk once', read: false, icon: CheckCircle, iconBg: 'bg-green-50 dark:bg-green-900/30', iconColor: 'text-green-500' },
  { id: 4, type: 'courier', title: 'Murat Yildirim offline', message: '30 dk dir baglanti yok', time: '15 dk once', read: true, icon: Truck, iconBg: 'bg-orange-50 dark:bg-orange-900/30', iconColor: 'text-orange-500' },
  { id: 5, type: 'alert', title: 'SLA ihlali - 3 siparis', message: 'Express Teslimat projesi', time: '25 dk once', read: true, icon: AlertTriangle, iconBg: 'bg-red-50 dark:bg-red-900/30', iconColor: 'text-red-500' },
  { id: 6, type: 'order', title: 'Toplu import tamamlandi', message: '45 siparis basariyla yuklendi', time: '1 saat once', read: true, icon: Package, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
  { id: 7, type: 'delivery', title: 'Siparis #4515 teslim edildi', message: 'Serkan Acar - Besiktas', time: '1 saat once', read: true, icon: CheckCircle, iconBg: 'bg-green-50 dark:bg-green-900/30', iconColor: 'text-green-500' },
  { id: 8, type: 'system', title: 'Sistem bakimi planlandi', message: 'Yarin 02:00 - 04:00 arasi', time: '3 saat once', read: true, icon: Settings, iconBg: 'bg-slate-100 dark:bg-slate-700', iconColor: 'text-slate-500' },
]

const unreadCount = computed(() => notifications.filter(n => !n.read).length)
const filteredNotifs = computed(() =>
  notifFilter.value === 'all' ? notifications : notifications.filter(n => n.type === notifFilter.value)
)

const notifTypes = [
  { key: 'all', label: 'Tumu' },
  { key: 'alert', label: 'Uyari' },
  { key: 'order', label: 'Siparis' },
  { key: 'delivery', label: 'Teslimat' },
  { key: 'courier', label: 'Kurye' },
]
</script>

<template>
  <header class="h-16 bg-[#EF4444] text-white flex items-center justify-between px-6">
    <!-- Search -->
    <div class="relative w-80">
      <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
      <input
        type="text"
        placeholder="Siparis, kurye veya musteri ara..."
        class="w-full pl-10 pr-4 py-2 bg-white/15 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/50"
      />
    </div>

    <div class="flex items-center gap-3">
      <!-- Dark Mode Toggle -->
      <button
        @click="theme.toggle()"
        class="p-2 text-white/70 hover:bg-white/15 rounded-lg cursor-pointer transition-colors"
        :title="theme.dark ? 'Acik mod' : 'Karanlik mod'"
      >
        <Sun v-if="theme.dark" :size="20" />
        <Moon v-else :size="20" />
      </button>

      <!-- Notifications -->
      <div class="relative">
        <button
          @click="showNotifications = !showNotifications; showDropdown = false"
          class="relative p-2 text-white/70 hover:bg-white/15 rounded-lg cursor-pointer transition-colors"
        >
          <Bell :size="20" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center px-1"
          >
            {{ unreadCount }}
          </span>
        </button>
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
                <button class="text-xs text-primary cursor-pointer hover:underline">Tumunu okundu isaretle</button>
              </div>
            </div>
            <div class="flex gap-1">
              <button
                v-for="t in notifTypes"
                :key="t.key"
                @click="notifFilter = t.key"
                class="px-2.5 py-1 text-xs rounded-full cursor-pointer transition-colors"
                :class="notifFilter === t.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div
              v-for="n in filteredNotifs"
              :key="n.id"
              class="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              :class="!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''"
            >
              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :class="n.iconBg">
                  <component :is="n.icon" :size="14" :class="n.iconColor" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                    <span class="text-sm font-medium" :class="!n.read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'">{{ n.title }}</span>
                    <span class="text-xs text-slate-400 ml-2 flex-shrink-0">{{ n.time }}</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">{{ n.message }}</p>
                </div>
                <span v-if="!n.read" class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              </div>
            </div>
          </div>
          <div class="p-3 text-center border-t border-slate-100 dark:border-slate-700">
            <button class="text-xs text-primary font-medium cursor-pointer hover:underline">Tum bildirimleri gor</button>
          </div>
        </div>
      </div>

      <!-- User Menu -->
      <div class="relative">
        <button
          @click="showDropdown = !showDropdown; showNotifications = false"
          class="flex items-center gap-3 cursor-pointer hover:bg-white/15 rounded-lg px-3 py-2 transition-colors"
        >
          <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary text-sm font-semibold">
            {{ auth.user?.firstName?.[0] }}{{ auth.user?.lastName?.[0] }}
          </div>
          <div class="text-left hidden md:block">
            <p class="text-sm font-medium text-white">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</p>
            <p class="text-xs text-white/60 capitalize">{{ auth.user?.role?.replace('_', ' ') }}</p>
          </div>
          <ChevronDown :size="16" class="text-white/60" />
        </button>
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
      </div>
    </div>
  </header>
</template>
