<script setup>
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import CopilotPanel from '@/components/copilot/CopilotPanel.vue'
import CommandPalette from '@/components/CommandPalette.vue'
</script>

<template>
  <div class="flex min-h-screen bg-slate-100 dark:bg-slate-950">
    <Sidebar />
    <div class="flex-1 ml-[260px]">
      <Header />
      <main class="p-6">
        <RouterView />
      </main>
    </div>
    <CopilotPanel />
    <CommandPalette />
  </div>
</template>
