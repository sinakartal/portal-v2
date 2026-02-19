<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LogOut, User, Bell, Sun, Moon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { PORTAL_CONFIG } from '@/constants/portalMenus'

const props = defineProps({
  portal: { type: String, required: true }
})

const auth = useAuthStore()
const theme = useThemeStore()
const router = useRouter()
const route = useRoute()
const showDropdown = ref(false)

const config = PORTAL_CONFIG[props.portal]

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div v-if="config" class="min-h-screen bg-slate-100 dark:bg-slate-950">
    <!-- Header -->
    <header class="h-16 text-white flex items-center justify-between px-6" :style="{ backgroundColor: config.color }">
      <div class="flex items-center gap-3">
        <svg viewBox="0 0 40 40" class="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="36" height="32" rx="8" fill="white" />
          <text x="20" y="27" text-anchor="middle" :fill="config.color" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="18">hey</text>
        </svg>
        <div>
          <h1 class="text-base font-bold leading-tight">bringo</h1>
          <p class="text-[10px] text-white/60 leading-tight">{{ config.subtitle }}</p>
        </div>

        <!-- Navigation tabs -->
        <nav class="hidden md:flex items-center gap-1 ml-6">
          <RouterLink
            v-for="item in config.menu"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
            :class="route.path === item.path || (item.path === '/' && route.path === '/')
              ? 'bg-white/20 text-white font-semibold'
              : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <component :is="item.icon" :size="16" />
            <span>{{ item.title }}</span>
          </RouterLink>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="theme.toggle()"
          class="p-2 text-white/70 hover:bg-white/15 rounded-lg cursor-pointer transition-colors"
          :title="theme.dark ? 'Acik mod' : 'Karanlik mod'"
        >
          <Sun v-if="theme.dark" :size="20" />
          <Moon v-else :size="20" />
        </button>

        <button class="relative p-2 text-white/70 hover:bg-white/15 rounded-lg cursor-pointer transition-colors">
          <Bell :size="20" />
        </button>

        <div class="relative">
          <button
            @click="showDropdown = !showDropdown"
            class="flex items-center gap-3 cursor-pointer hover:bg-white/15 rounded-lg px-3 py-2 transition-colors"
          >
            <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-semibold" :style="{ color: config.color }">
              {{ auth.user?.firstName?.[0] }}{{ auth.user?.lastName?.[0] }}
            </div>
            <div class="text-left hidden md:block">
              <p class="text-sm font-medium text-white">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</p>
              <p class="text-xs text-white/60 capitalize">{{ auth.user?.role?.replace('_', ' ') }}</p>
            </div>
          </button>
          <div
            v-if="showDropdown"
            class="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
          >
            <button class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              <User :size="16" /> Profil
            </button>
            <hr class="my-1 border-slate-100 dark:border-slate-700" />
            <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
              <LogOut :size="16" /> Cikis Yap
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="p-6">
      <RouterView />
    </main>
  </div>
  <div v-else>Portal bulunamadi</div>
</template>
