import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const dark = ref(localStorage.getItem('bringo_theme') === 'dark')

  watch(dark, (val) => {
    if (val) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('bringo_theme', val ? 'dark' : 'light')
  }, { immediate: true })

  function toggle() {
    dark.value = !dark.value
  }

  return { dark, toggle }
})
