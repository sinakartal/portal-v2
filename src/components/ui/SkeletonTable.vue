<script setup>
defineProps({
  rows: { type: Number, default: 8 },
  cols: { type: Number, default: 5 },
})
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
    <!-- Header skeleton -->
    <div class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 px-4 py-3 flex gap-4">
      <div v-for="c in cols" :key="'h'+c" class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" :style="{ width: c === 1 ? '120px' : c === cols ? '60px' : '80px' }" />
    </div>
    <!-- Row skeletons -->
    <div v-for="r in rows" :key="r" class="flex gap-4 px-4 py-3 border-b border-slate-50 dark:border-slate-800">
      <div v-for="c in cols" :key="'r'+r+'c'+c" class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" :style="{ width: c === 1 ? '120px' : c === cols ? '60px' : `${60 + Math.random() * 40}px` }" />
    </div>
  </div>
</template>
