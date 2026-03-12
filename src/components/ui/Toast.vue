<script setup>
import { ref, watch } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  message: { type: String, default: '' },
  type: { type: String, default: 'success' }, // success | error | warning | info
  duration: { type: Number, default: 3000 },
})

const emit = defineEmits(['close'])

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }
const styles = {
  success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  error: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
}
const durations = { success: 3000, error: 5000, warning: 4000, info: 3000 }

let timer = null
watch(() => props.show, (val) => {
  if (val) {
    clearTimeout(timer)
    const d = props.duration || durations[props.type] || 3000
    timer = setTimeout(() => emit('close'), d)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="show" :class="['fixed bottom-6 left-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm', styles[type]]">
        <component :is="icons[type]" :size="18" class="flex-shrink-0" />
        <span class="flex-1">{{ message }}</span>
        <button v-if="type === 'error'" @click="emit('close')" class="p-0.5 hover:opacity-70 cursor-pointer flex-shrink-0">
          <X :size="14" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
