<script setup>
import { AlertTriangle } from 'lucide-vue-next'

defineProps({
  show: Boolean,
  title: { type: String, default: 'Emin misiniz?' },
  message: { type: String, default: 'Bu islem geri alinamaz.' },
  confirmLabel: { type: String, default: 'Onayla' },
  cancelLabel: { type: String, default: 'Iptal' },
  danger: { type: Boolean, default: true },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="emit('cancel')" />
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
        >
          <div v-if="show" class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm mx-4">
            <div class="flex items-start gap-4 mb-5">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30']">
                <AlertTriangle :size="20" :class="danger ? 'text-red-600' : 'text-blue-600'" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-800 dark:text-white">{{ title }}</h3>
                <p class="text-sm text-slate-500 mt-1">{{ message }}</p>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <button @click="emit('cancel')" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {{ cancelLabel }}
              </button>
              <button
                @click="emit('confirm')"
                :class="['px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors text-white', danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark']"
              >
                {{ confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
