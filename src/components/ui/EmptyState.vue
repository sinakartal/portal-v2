<script setup>
import { Package } from 'lucide-vue-next'

defineProps({
  icon: { type: [Object, Function], default: () => Package },
  title: { type: String, default: 'Veri bulunamadi' },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
      <component :is="icon" :size="28" class="text-slate-300 dark:text-slate-600" />
    </div>
    <h3 class="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ title }}</h3>
    <p v-if="description" class="text-sm text-slate-400 mb-4 text-center max-w-xs">{{ description }}</p>
    <slot />
    <button
      v-if="actionLabel"
      @click="emit('action')"
      class="mt-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
