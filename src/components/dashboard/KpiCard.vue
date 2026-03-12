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
  sparkline: { type: Array, default: null },
  size: { type: String, default: 'normal' }, // 'normal' | 'large'
})

const isPositive = computed(() => props.change >= 0)

const displayValue = computed(() => {
  if (props.type === 'currency') return formatCurrency(props.value)
  if (props.type === 'percent') return `%${props.value}`
  return `${formatNumber(props.value)}${props.suffix}`
})

// Generate SVG sparkline path
const sparklinePath = computed(() => {
  if (!props.sparkline || props.sparkline.length < 2) return null
  const data = props.sparkline
  const w = 80
  const h = 24
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * h,
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = path + ` L${w},${h} L0,${h} Z`
  return { line: path, area: areaPath }
})
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <component :is="icon" :size="20" class="text-primary" />
      </div>
      <div
        :class="[
          'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
          isPositive ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'
        ]"
      >
        <TrendingUp v-if="isPositive" :size="12" />
        <TrendingDown v-else :size="12" />
        <span>{{ isPositive ? '+' : '' }}{{ change }}%</span>
      </div>
    </div>
    <p :class="[size === 'large' ? 'text-3xl' : 'text-2xl', 'font-bold text-slate-800 dark:text-white']">{{ displayValue }}</p>
    <div class="flex items-end justify-between mt-1">
      <p class="text-sm text-slate-500">{{ title }}</p>
      <!-- Sparkline -->
      <svg v-if="sparklinePath" width="80" height="24" class="flex-shrink-0">
        <path :d="sparklinePath.area" :fill="isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'" />
        <path :d="sparklinePath.line" fill="none" :stroke="isPositive ? '#10b981' : '#ef4444'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  </div>
</template>
