<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-vue-next'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)
const touched = ref({ username: false, password: false })

const authStore = useAuthStore()
const router = useRouter()

// Validation
const usernameError = ref('')
const passwordError = ref('')

const validate = () => {
  usernameError.value = ''
  passwordError.value = ''
  let valid = true
  if (!username.value.trim()) { usernameError.value = 'Bu alan zorunludur'; valid = false }
  if (!password.value) { passwordError.value = 'Bu alan zorunludur'; valid = false }
  return valid
}

const handleSubmit = async () => {
  touched.value = { username: true, password: true }
  if (!validate()) return
  error.value = ''
  loading.value = true
  const result = await authStore.login(username.value, password.value)
  loading.value = false
  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.message
  }
}

const quickLogin = (user) => {
  username.value = user
  password.value = '123456'
}

// Counter-up animation for stats
const statValues = ref([0, 0, 0])
const statTargets = [500, 50, 98]

onMounted(() => {
  const startTime = Date.now()
  const duration = 1500
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
    statValues.value = statTargets.map(t => Math.round(t * eased))
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
})

// Scrolling activity feed
const activityEvents = [
  'Kadikoy - Teslimat tamamlandi',
  'Besiktas - Kurye atandi',
  'Sisli - Yeni siparis alindi',
  'Uskudar - Rota olusturuldu',
  'Atasehir - Teslimat tamamlandi',
  'Maltepe - Kurye yola cikti',
  'Bakirkoy - Siparis onaylandi',
  'Sariyer - Teslimat tamamlandi',
]
const currentActivity = ref(0)
let activityInterval = null

onMounted(() => {
  activityInterval = setInterval(() => {
    currentActivity.value = (currentActivity.value + 1) % activityEvents.length
  }, 3000)
})
onUnmounted(() => { if (activityInterval) clearInterval(activityInterval) })
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#9B2D3F] via-[#7B1D2E] to-[#4A1019] text-white flex-col justify-center items-center p-12 relative overflow-hidden">
      <div class="max-w-md text-center relative z-10">
        <svg viewBox="0 0 200 55" class="h-16 mx-auto mb-8" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="2" width="48" height="42" rx="10" fill="white" />
          <text x="44" y="32" text-anchor="middle" fill="#7B1D2E" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="24">hey</text>
          <text x="74" y="34" fill="white" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="32">bringo</text>
          <text x="75" y="50" fill="rgba(255,255,255,0.6)" font-family="Inter, Arial, sans-serif" font-weight="400" font-style="italic" font-size="10">her sey yolunda</text>
        </svg>
        <p class="text-lg text-rose-200 mb-8">Kurye ve Lojistik Yonetim Platformu</p>

        <!-- Animated stats -->
        <div class="grid grid-cols-3 gap-4 text-center mb-8">
          <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p class="text-2xl font-bold">{{ statValues[0] }}+</p>
            <p class="text-xs text-rose-200 mt-1">Aktif Kurye</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p class="text-2xl font-bold">{{ statValues[1] }}K+</p>
            <p class="text-xs text-rose-200 mt-1">Aylik Teslimat</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p class="text-2xl font-bold">%{{ statValues[2] }}</p>
            <p class="text-xs text-rose-200 mt-1">Basari Orani</p>
          </div>
        </div>

        <!-- Scrolling activity -->
        <div class="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-sm">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span class="text-rose-200 text-xs font-medium">Canli Aktivite</span>
          </div>
          <Transition
            mode="out-in"
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <p :key="currentActivity" class="text-white/90 font-medium">{{ activityEvents[currentActivity] }}</p>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Right - Login Form -->
    <div class="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
      <div class="w-full max-w-md">
        <div class="lg:hidden flex items-center gap-3 mb-8 justify-center">
          <svg viewBox="0 0 155 42" class="h-10" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="4" width="38" height="34" rx="8" fill="#7B1D2E" />
            <text x="19" y="28" text-anchor="middle" fill="white" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="19">hey</text>
            <text x="44" y="29" fill="#7B1D2E" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="26">bringo</text>
            <text x="45" y="40" fill="#94a3b8" font-family="Inter, Arial, sans-serif" font-weight="400" font-style="italic" font-size="8">her sey yolunda</text>
          </svg>
        </div>

        <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">Giris Yap</h2>
        <p class="text-slate-500 mb-8">Admin panelinize erisim saglayin</p>

        <!-- Error message -->
        <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
          <div v-if="error" class="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-600 dark:text-red-400 text-sm rounded-lg p-4 mb-6">
            <AlertCircle :size="18" class="flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium">Giris basarisiz</p>
              <p class="text-red-500 dark:text-red-400/80 text-xs mt-0.5">{{ error }}</p>
            </div>
          </div>
        </Transition>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kullanici Adi</label>
            <input
              type="text"
              v-model="username"
              @blur="touched.username = true"
              :class="[
                'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors',
                touched.username && usernameError ? 'border-red-400 bg-red-50/50' : 'border-slate-300 dark:border-slate-600 dark:bg-slate-800'
              ]"
              placeholder="sina"
            />
            <p v-if="touched.username && usernameError" class="text-xs text-red-500 mt-1.5">{{ usernameError }}</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sifre</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                @blur="touched.password = true"
                :class="[
                  'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pr-12 transition-colors',
                  touched.password && passwordError ? 'border-red-400 bg-red-50/50' : 'border-slate-300 dark:border-slate-600 dark:bg-slate-800'
                ]"
                placeholder="Sifrenizi girin"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
              >
                <EyeOff v-if="showPassword" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
            <p v-if="touched.password && passwordError" class="text-xs text-red-500 mt-1.5">{{ passwordError }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Loader2 v-if="loading" :size="18" class="animate-spin" />
            {{ loading ? 'Giris yapiliyor...' : 'Giris Yap' }}
          </button>
        </form>

        <!-- Quick Login - DEV only -->
        <div v-if="true" class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p class="text-xs text-slate-400 text-center mb-3">Hizli giris (sifre: 123456)</p>
          <div class="flex gap-2">
            <button @click="quickLogin('sina')" class="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors cursor-pointer">
              Sina (Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
