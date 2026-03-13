<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import CopilotPanel from '@/components/copilot/CopilotPanel.vue'
import CommandPalette from '@/components/CommandPalette.vue'

const route = useRoute()
const isFullscreenMap = computed(() => route.path === '/live-map')
</script>

<template>
  <div class="flex min-h-screen bg-slate-100 dark:bg-slate-950">
    <Sidebar v-show="!isFullscreenMap" />
    <div class="flex-1 transition-all duration-300" :class="isFullscreenMap ? 'ml-0' : 'ml-[260px]'">
      <Header v-show="!isFullscreenMap" />
      <main :class="isFullscreenMap ? 'p-0' : 'p-6'">
        <RouterView />
      </main>
    </div>
    <CopilotPanel v-show="!isFullscreenMap" />
    <CommandPalette />
  </div>
</template>
