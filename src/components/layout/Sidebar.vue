<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { MENU_ITEMS } from '@/constants/menu'
import { useAuthStore } from '@/stores/auth'

const collapsed = ref(false)
const auth = useAuthStore()
const route = useRoute()

const filteredMenu = computed(() =>
  MENU_ITEMS.filter(item => !item.permission || auth.hasPermission(item.permission))
)
</script>

<template>
  <aside
    class="fixed left-0 top-0 h-screen bg-sidebar border-r border-slate-200 transition-all duration-300 z-50 flex flex-col"
    :class="collapsed ? 'w-[72px]' : 'w-[260px]'"
  >
    <!-- Logo -->
    <div class="flex items-center gap-2 px-4 h-16 border-b border-slate-200">
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
    <nav class="flex-1 py-4 overflow-y-auto">
      <RouterLink
        v-for="item in filteredMenu"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-5 py-3 mx-2 rounded-lg transition-colors"
        :class="route.path === item.path
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
      >
        <component :is="item.icon" :size="20" class="flex-shrink-0" />
        <span v-if="!collapsed" class="text-sm font-medium">{{ item.title }}</span>
      </RouterLink>
    </nav>

    <!-- Version Info -->
    <div v-if="!collapsed" class="px-5 py-2 text-[10px] text-slate-400">
      v2.0.0 - Admin Portal
    </div>

    <!-- Collapse Toggle -->
    <button
      @click="collapsed = !collapsed"
      class="flex items-center justify-center h-12 border-t border-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
    >
      <ChevronRight v-if="collapsed" :size="18" />
      <ChevronLeft v-else :size="18" />
    </button>
  </aside>
</template>
