<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Eye, EyeOff, Briefcase, Store, Ship, Shield } from 'lucide-vue-next'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const handleSubmit = async () => {
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

const getPortalUrl = (base) => {
  const token = localStorage.getItem('bringo_token')
  const user = localStorage.getItem('bringo_user')
  if (token && user) {
    return `${base}?auth_token=${token}&auth_user=${encodeURIComponent(user)}`
  }
  return base
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#9B2D3F] via-[#7B1D2E] to-[#4A1019] text-white flex-col justify-center items-center p-12">
      <div class="max-w-md text-center">
        <svg viewBox="0 0 200 55" class="h-16 mx-auto mb-8" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="2" width="48" height="42" rx="10" fill="white" />
          <text x="44" y="32" text-anchor="middle" fill="#7B1D2E" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="24">hey</text>
          <text x="74" y="34" fill="white" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="32">bringo</text>
          <text x="75" y="50" fill="rgba(255,255,255,0.6)" font-family="Inter, Arial, sans-serif" font-weight="400" font-style="italic" font-size="10">her sey yolunda</text>
        </svg>
        <p class="text-lg text-rose-200 mb-8">Kurye ve Lojistik Yonetim Platformu</p>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p class="text-2xl font-bold">500+</p>
            <p class="text-xs text-rose-200 mt-1">Aktif Kurye</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p class="text-2xl font-bold">50K+</p>
            <p class="text-xs text-rose-200 mt-1">Aylik Teslimat</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p class="text-2xl font-bold">%98</p>
            <p class="text-xs text-rose-200 mt-1">Basari Orani</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right - Login Form -->
    <div class="flex-1 flex items-center justify-center p-8 bg-white">
      <div class="w-full max-w-md">
        <div class="lg:hidden flex items-center gap-3 mb-8 justify-center">
          <svg viewBox="0 0 155 42" class="h-10" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="4" width="38" height="34" rx="8" fill="#7B1D2E" />
            <text x="19" y="28" text-anchor="middle" fill="white" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="19">hey</text>
            <text x="44" y="29" fill="#7B1D2E" font-family="Inter, Arial, sans-serif" font-weight="800" font-style="italic" font-size="26">bringo</text>
            <text x="45" y="40" fill="#94a3b8" font-family="Inter, Arial, sans-serif" font-weight="400" font-style="italic" font-size="8">her sey yolunda</text>
          </svg>
        </div>

        <h2 class="text-2xl font-bold text-slate-800 mb-2">Giris Yap</h2>
        <p class="text-slate-500 mb-8">Admin panelinize erisim saglayin</p>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-6">{{ error }}</div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-2">Kullanici Adi</label>
            <input
              type="text"
              v-model="username"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              placeholder="sina"
              required
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-2">Sifre</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pr-12"
                placeholder="Sifrenizi girin"
                required
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
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {{ loading ? 'Giris yapiliyor...' : 'Giris Yap' }}
          </button>
        </form>

        <!-- Quick Login -->
        <div class="mt-8 pt-6 border-t border-slate-200">
          <p class="text-xs text-slate-400 text-center mb-3">Hizli giris (sifre: 123456)</p>
          <div class="flex gap-2">
            <button @click="quickLogin('sina')" class="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer">
              Sina (Admin)
            </button>
          </div>
        </div>

        <!-- Portal Links -->
        <div class="mt-6 pt-6 border-t border-slate-200">
          <p class="text-xs text-slate-400 text-center mb-3">Diger Portaller</p>
          <div class="grid grid-cols-2 gap-2">
            <a :href="getPortalUrl('http://localhost:5173/')" class="flex items-center gap-2 py-2.5 px-3 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-xs font-medium text-primary transition-colors">
              <Shield :size="14" /> Admin Panel
            </a>
            <a :href="getPortalUrl('http://corporate.localhost:5173/')" class="flex items-center gap-2 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg text-xs font-medium text-blue-600 transition-colors">
              <Briefcase :size="14" /> Kurumsal Portal
            </a>
            <a :href="getPortalUrl('http://restaurant.localhost:5173/')" class="flex items-center gap-2 py-2.5 px-3 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-lg text-xs font-medium text-orange-600 transition-colors">
              <Store :size="14" /> Restoran Panel
            </a>
            <a :href="getPortalUrl('http://ship.localhost:5173/')" class="flex items-center gap-2 py-2.5 px-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 rounded-lg text-xs font-medium text-cyan-600 transition-colors">
              <Ship :size="14" /> Gemi Tedarik
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
