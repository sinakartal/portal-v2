<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import { formatCurrency, formatNumber } from '@/utils'

const props = defineProps({
  title: String,
  value: [Number, String],
  change: Number,
  icon: [Object, Function],
  type: { type: String, default: 'number' },
  suffix: { type: String, default: '' },
})

const isPositive = computed(() => props.change >= 0)

const displayValue = computed(() => {
  if (props.type === 'currency') return formatCurrency(props.value)
  if (props.type === 'percent') return `%${props.value}`
  return `${formatNumber(props.value)}${props.suffix}`
})
</script>

<template>
  <div class="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-4">
      <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <component :is="icon" :size="20" class="text-primary" />
      </div>
      <div
        :class="[
          'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
          isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        ]"
      >
        <TrendingUp v-if="isPositive" :size="12" />
        <TrendingDown v-else :size="12" />
        <span>{{ isPositive ? '+' : '' }}{{ change }}%</span>
      </div>
    </div>
    <p class="text-2xl font-bold text-slate-800">{{ displayValue }}</p>
    <p class="text-sm text-slate-500 mt-1">{{ title }}</p>
  </div>
</template>
