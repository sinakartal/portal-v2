<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-vue-next'
import { MENU_SECTIONS } from '@/constants/menu'
import { useAuthStore } from '@/stores/auth'

const collapsed = ref(false)
const auth = useAuthStore()
const route = useRoute()

// Badge counts (will be updated by real data / SSE)
const badges = reactive({
  activeOrders: 24,
  onlineCouriers: 12,
})

const filteredSections = computed(() =>
  MENU_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => !item.permission || auth.hasPermission(item.permission)),
  })).filter(section => section.items.length > 0)
)

const isActive = (path) => {
  if (path === '/dashboard') return route.path === '/dashboard' || route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

const userInitials = computed(() => {
  const f = auth.user?.firstName?.[0] || ''
  const l = auth.user?.lastName?.[0] || ''
  return f + l
})
</script>

<template>
  <aside
    class="fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-50 flex flex-col"
    :class="collapsed ? 'w-[72px]' : 'w-[260px]'"
  >
    <!-- Logo -->
    <div class="flex items-center gap-2 px-4 h-14 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
      <svg v-if="collapsed" viewBox="0 0 40 40" class="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="36" height="32" rx="8" fill="#EF4444" />
        <text x="20" y="27" text-anchor="middle" fill="white" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="18">hey</text>
      </svg>
      <svg v-else viewBox="0 0 155 42" class="h-10" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="4" width="38" height="34" rx="8" fill="#EF4444" />
        <text x="19" y="28" text-anchor="middle" fill="white" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="19">hey</text>
        <text x="44" y="29" fill="#EF4444" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="26">bringo</text>
        <text x="45" y="40" fill="rgba(239,68,68,0.5)" font-family="Inter, Arial, sans-serif" font-weight="400" font-style="italic" font-size="8">her şey yolunda</text>
      </svg>
    </div>

    <!-- Menu -->
    <nav class="flex-1 py-2 overflow-y-auto scrollbar-thin">
      <template v-for="(section, sIdx) in filteredSections" :key="section.label">
        <!-- Section divider -->
        <div v-if="sIdx > 0" class="mx-4 my-2 border-t border-slate-100 dark:border-slate-800" />
        <!-- Section label -->
        <div v-if="!collapsed" class="px-5 pt-2 pb-1">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ section.label }}</span>
        </div>

        <!-- Items -->
        <div class="relative group/item" v-for="item in section.items" :key="item.path">
          <RouterLink
            :to="item.path"
            class="flex items-center gap-3 py-2.5 mx-2 rounded-lg transition-all relative"
            :class="[
              collapsed ? 'px-3 justify-center' : 'px-4',
              isActive(item.path)
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            ]"
          >
            <!-- Active indicator bar -->
            <span
              v-if="isActive(item.path)"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-500 rounded-r-full"
            />
            <component :is="item.icon" :size="20" class="flex-shrink-0" />
            <span v-if="!collapsed" class="text-sm font-medium flex-1">{{ item.title }}</span>
            <!-- Badge -->
            <span
              v-if="!collapsed && item.badgeKey && badges[item.badgeKey]"
              class="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {{ badges[item.badgeKey] }}
            </span>
          </RouterLink>
          <!-- Collapsed tooltip -->
          <div
            v-if="collapsed"
            class="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover/item:opacity-100 transition-opacity z-[100] shadow-lg"
          >
            {{ item.title }}
            <span
              v-if="item.badgeKey && badges[item.badgeKey]"
              class="ml-1.5 px-1.5 py-0.5 bg-red-500 text-[10px] rounded-full"
            >
              {{ badges[item.badgeKey] }}
            </span>
          </div>
        </div>
      </template>
    </nav>

    <!-- User Card -->
    <div class="border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
      <div v-if="!collapsed" class="px-4 py-3 flex items-center gap-3">
        <div class="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</p>
          <p class="text-[10px] text-slate-400 capitalize">{{ auth.user?.role?.replace('_', ' ') }}</p>
        </div>
      </div>
      <div v-else class="py-3 flex justify-center">
        <div class="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
          {{ userInitials }}
        </div>
      </div>
    </div>

    <!-- Collapse Toggle -->
    <button
      @click="collapsed = !collapsed"
      class="flex items-center justify-center h-10 border-t border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer flex-shrink-0"
    >
      <ChevronRight v-if="collapsed" :size="16" />
      <ChevronLeft v-else :size="16" />
    </button>
  </aside>
</template>
