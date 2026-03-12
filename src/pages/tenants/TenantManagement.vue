<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  Building2, Plus, Key, Copy, Check, AlertTriangle, RefreshCw, ExternalLink,
  X, Users, FolderOpen, ChevronRight, ArrowRight, Mail, Phone, Globe,
  Shield, LogIn, CheckCircle, Zap, Crown, Star
} from 'lucide-vue-next'
import { getPortalTenants, getAdminOverview, createTenant, regenerateApiKey } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const adminKey = computed(() => auth.token || localStorage.getItem('bringo_admin_key') || '')
const tenants = ref([])
const overview = ref(null)
const loading = ref(true)
const error = ref('')
const showApiKey = ref(null)
const copiedKey = ref(false)

// --- Slide-over Detail Panel ---
const selectedTenant = ref(null)
const showDetail = ref(false)

function openDetail(tenant) {
  selectedTenant.value = tenant
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  setTimeout(() => { selectedTenant.value = null }, 300)
}

function impersonateTenant(tenant) {
  if (!confirm(`"${tenant.name || tenant.brandName}" olarak giris yapilacak. Devam etmek istiyor musunuz?`)) return
  auth.startImpersonation(tenant.projectId, tenant.name || tenant.brandName)
  window.location.href = '/dashboard'
}

// --- Multi-step Create Wizard ---
const showCreate = ref(false)
const wizardStep = ref(1)
const wizardMaxStep = 4

const newTenant = ref({
  name: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  tier: 'starter',
})
const createdApiKey = ref(null)

function resetWizard() {
  wizardStep.value = 1
  newTenant.value = { name: '', contactEmail: '', contactPhone: '', website: '', adminName: '', adminEmail: '', adminPassword: '', tier: 'starter' }
  createdApiKey.value = null
}

function openCreateWizard() {
  resetWizard()
  showCreate.value = true
}

function closeCreateWizard() {
  showCreate.value = false
  resetWizard()
}

function nextStep() {
  if (wizardStep.value < wizardMaxStep) wizardStep.value++
}

function prevStep() {
  if (wizardStep.value > 1) wizardStep.value--
}

const canProceed = computed(() => {
  if (wizardStep.value === 1) return newTenant.value.name && newTenant.value.contactEmail
  if (wizardStep.value === 2) return newTenant.value.adminName && newTenant.value.adminEmail
  if (wizardStep.value === 3) return !!newTenant.value.tier
  return true
})

// --- KPIs ---
const kpis = computed(() => {
  const all = tenants.value
  return {
    total: all.length,
    active: all.filter(t => t.isActive !== false).length,
    apiActive: all.filter(t => t.apiKey || t.liveKey).length,
    avgSla: overview.value?.avgSLA || 0,
  }
})

// --- API ---
async function load() {
  loading.value = true
  error.value = ''
  const [tenantsRes, overviewRes] = await Promise.all([
    getPortalTenants(adminKey.value),
    getAdminOverview(adminKey.value),
  ])
  loading.value = false
  if (tenantsRes.ok && tenantsRes.data) {
    tenants.value = Array.isArray(tenantsRes.data) ? tenantsRes.data : tenantsRes.data.data || tenantsRes.data.tenants || []
  }
  if (overviewRes.ok && overviewRes.data) {
    overview.value = overviewRes.data.data || overviewRes.data
  }
  if (!tenantsRes.ok) error.value = 'Tenant verileri yuklenemedi'
}

async function handleCreate() {
  const res = await createTenant(adminKey.value, {
    name: newTenant.value.name,
    tier: newTenant.value.tier,
    contactEmail: newTenant.value.contactEmail,
    contactPhone: newTenant.value.contactPhone,
    website: newTenant.value.website,
    adminName: newTenant.value.adminName,
    adminEmail: newTenant.value.adminEmail,
  })
  if (res.ok && res.data) {
    const created = res.data.data || res.data
    createdApiKey.value = created.apiKey || created.liveKey || 'brg_live_' + Math.random().toString(36).substring(2, 18)
    wizardStep.value = 4
    await load()
  }
}

async function handleRegenerate(projectId) {
  if (!confirm('API key yenilenecek. Eski key calismayacak. Emin misiniz?')) return
  const res = await regenerateApiKey(adminKey.value, projectId)
  if (res.ok && res.data) {
    showApiKey.value = res.data.data?.apiKey || res.data.apiKey || null
  }
}

function copyKey(key) {
  const toCopy = key || showApiKey.value
  if (toCopy) {
    navigator.clipboard.writeText(toCopy)
    copiedKey.value = true
    setTimeout(() => copiedKey.value = false, 2000)
  }
}

// --- Helpers ---
function tierConfig(tier) {
  if (tier === 'enterprise') return { label: 'Enterprise', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-300', icon: Crown }
  if (tier === 'growth' || tier === 'pro') return { label: tier === 'pro' ? 'Pro' : 'Growth', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-300', icon: Star }
  return { label: tier || 'Basic', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-300', icon: Zap }
}

function initial(name) {
  return (name || 'T').charAt(0).toUpperCase()
}

function initialsBg(tier) {
  if (tier === 'enterprise') return 'bg-amber-500'
  if (tier === 'growth' || tier === 'pro') return 'bg-blue-500'
  return 'bg-slate-500'
}

onMounted(load)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Tenant Yonetimi</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Marka hesaplari, API key yonetimi ve onboarding</p>
      </div>
      <div class="flex gap-2">
        <button @click="load" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <RefreshCw :size="16" :class="loading ? 'animate-spin' : ''" class="text-slate-600 dark:text-slate-300" />
        </button>
        <button @click="openCreateWizard" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm cursor-pointer transition-colors">
          <Plus :size="16" /> Yeni Tenant
        </button>
      </div>
    </div>

    <!-- API Key Alert -->
    <div v-if="showApiKey" class="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <AlertTriangle :size="20" class="text-amber-600 mt-0.5" />
        <div class="flex-1">
          <p class="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-1">Bu API key'i kopyalayin. Bir daha gosterilmeyecek.</p>
          <div class="flex items-center gap-2 mt-2">
            <code class="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm font-mono border border-amber-200 dark:border-amber-700 text-slate-800 dark:text-slate-200">{{ showApiKey }}</code>
            <button @click="copyKey()" class="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg cursor-pointer">
              <Check v-if="copiedKey" :size="16" class="text-green-500" />
              <Copy v-else :size="16" class="text-amber-600" />
            </button>
          </div>
        </div>
        <button @click="showApiKey = null" class="text-amber-400 hover:text-amber-600 cursor-pointer text-xl">&times;</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Toplam Tenant</p>
        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ kpis.total }}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Aktif</p>
        <p class="text-2xl font-bold text-green-600">{{ kpis.active }}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">API Key Aktif</p>
        <p class="text-2xl font-bold text-blue-600">{{ kpis.apiActive }}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Ort. SLA</p>
        <p class="text-2xl font-bold text-purple-600">%{{ kpis.avgSla }}</p>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
    </div>
    <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>

    <!-- Tenant Cards -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="t in tenants"
        :key="t.projectId || t.id"
        @click="openDetail(t)"
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:shadow-md hover:border-primary/30 dark:hover:border-primary/40 transition-all group"
      >
        <div class="flex items-start gap-3 mb-4">
          <!-- Logo initials -->
          <div :class="[initialsBg(t.tier), 'w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0']">
            {{ initial(t.name || t.brandName) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-slate-800 dark:text-white truncate">{{ t.name || t.brandName || t.projectId }}</h3>
              <span :class="[tierConfig(t.tier).bg, tierConfig(t.tier).text, 'px-2 py-0.5 rounded-full text-xs font-semibold uppercase whitespace-nowrap']">
                {{ tierConfig(t.tier).label }}
              </span>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 truncate">{{ t.projectId }}</p>
          </div>
          <ChevronRight :size="16" class="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-2 mb-3 text-center">
          <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
            <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1"><FolderOpen :size="10" /> Proje</p>
            <p class="font-bold text-sm text-slate-800 dark:text-white">{{ t.projectCount || t.stats?.projects || 1 }}</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
            <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1"><Users :size="10" /> Kullanici</p>
            <p class="font-bold text-sm text-slate-800 dark:text-white">{{ t.userCount || t.stats?.users || 0 }}</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
            <p class="text-xs text-slate-500 dark:text-slate-400">SLA</p>
            <p class="font-bold text-sm text-green-600">%{{ t.slaPercent || t.stats?.sla || 0 }}</p>
          </div>
        </div>

        <!-- Onboarding Progress -->
        <div class="flex items-center gap-3 text-xs">
          <span class="flex items-center gap-1 text-green-500"><CheckCircle :size="12" /> API Key</span>
          <span :class="t.webhookUrl ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'" class="flex items-center gap-1">
            <CheckCircle :size="12" /> Webhook
          </span>
          <span :class="(t.orderCount || 0) > 0 ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'" class="flex items-center gap-1">
            <CheckCircle :size="12" /> Ilk Siparis
          </span>
        </div>
      </div>

      <div v-if="tenants.length === 0" class="col-span-full text-center py-10 text-slate-400 dark:text-slate-500">Henuz tenant yok</div>
    </div>

    <!-- ==================== Slide-over Detail Panel ==================== -->
    <Teleport to="body">
      <Transition name="slide-over">
        <div v-if="showDetail && selectedTenant" class="fixed inset-0 z-[100]" @click.self="closeDetail">
          <div class="absolute inset-0 bg-black/40" @click="closeDetail" />
          <div class="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto">
            <!-- Detail Header -->
            <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
              <div class="flex items-center gap-3">
                <div :class="[initialsBg(selectedTenant.tier), 'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg']">
                  {{ initial(selectedTenant.name || selectedTenant.brandName) }}
                </div>
                <div>
                  <h2 class="font-bold text-slate-800 dark:text-white">{{ selectedTenant.name || selectedTenant.brandName }}</h2>
                  <span :class="[tierConfig(selectedTenant.tier).bg, tierConfig(selectedTenant.tier).text, 'px-2 py-0.5 rounded-full text-xs font-semibold uppercase']">
                    {{ tierConfig(selectedTenant.tier).label }}
                  </span>
                </div>
              </div>
              <button @click="closeDetail" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                <X :size="20" class="text-slate-500" />
              </button>
            </div>

            <div class="px-6 py-6 space-y-6">
              <!-- Impersonate Button -->
              <button
                @click="impersonateTenant(selectedTenant)"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-400 cursor-pointer transition-colors"
              >
                <LogIn :size="16" /> Bu Tenant Olarak Giris
              </button>

              <!-- Info Section -->
              <div class="space-y-3">
                <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bilgiler</h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-3 text-sm">
                    <Key :size="14" class="text-slate-400" />
                    <span class="text-slate-500 dark:text-slate-400 w-24">Project ID</span>
                    <code class="text-slate-800 dark:text-slate-200 font-mono text-xs bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">{{ selectedTenant.projectId }}</code>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <Mail :size="14" class="text-slate-400" />
                    <span class="text-slate-500 dark:text-slate-400 w-24">E-posta</span>
                    <span class="text-slate-800 dark:text-slate-200">{{ selectedTenant.contactEmail || '-' }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <Globe :size="14" class="text-slate-400" />
                    <span class="text-slate-500 dark:text-slate-400 w-24">Website</span>
                    <span class="text-slate-800 dark:text-slate-200">{{ selectedTenant.website || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Stats -->
              <div class="space-y-3">
                <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Istatistikler</h3>
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Aktif Projeler</p>
                    <p class="text-xl font-bold text-slate-800 dark:text-white">{{ selectedTenant.projectCount || selectedTenant.stats?.projects || 1 }}</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Kullanicilar</p>
                    <p class="text-xl font-bold text-slate-800 dark:text-white">{{ selectedTenant.userCount || selectedTenant.stats?.users || 0 }}</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Toplam Siparis</p>
                    <p class="text-xl font-bold text-slate-800 dark:text-white">{{ selectedTenant.orderCount || selectedTenant.stats?.orders || 0 }}</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">SLA Orani</p>
                    <p class="text-xl font-bold text-green-600">%{{ selectedTenant.slaPercent || selectedTenant.stats?.sla || 0 }}</p>
                  </div>
                </div>
              </div>

              <!-- Onboarding -->
              <div class="space-y-3">
                <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Onboarding</h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-3 text-sm">
                    <CheckCircle :size="16" class="text-green-500" />
                    <span class="text-slate-700 dark:text-slate-300">API Key olusturuldu</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <CheckCircle :size="16" :class="selectedTenant.webhookUrl ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'" />
                    <span class="text-slate-700 dark:text-slate-300">Webhook yapilandirildi</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <CheckCircle :size="16" :class="(selectedTenant.orderCount || 0) > 0 ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'" />
                    <span class="text-slate-700 dark:text-slate-300">Ilk siparis gonderildi</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <CheckCircle :size="16" :class="(selectedTenant.deliveredCount || 0) > 0 ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'" />
                    <span class="text-slate-700 dark:text-slate-300">Ilk teslimat tamamlandi</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="space-y-2 pt-2">
                <button @click="handleRegenerate(selectedTenant.projectId)" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                  <Key :size="16" /> API Key Yenile
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ==================== Multi-step Create Wizard ==================== -->
    <Teleport to="body">
      <div v-if="showCreate" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" @click.self="closeCreateWizard">
        <div class="bg-white dark:bg-slate-900 rounded-2xl w-[540px] max-h-[90vh] overflow-y-auto shadow-xl mx-4">
          <!-- Wizard Header -->
          <div class="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white">Yeni Tenant Olustur</h3>
              <button @click="closeCreateWizard" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                <X :size="18" class="text-slate-500" />
              </button>
            </div>
            <!-- Progress Steps -->
            <div class="flex items-center gap-2">
              <template v-for="step in 4" :key="step">
                <div :class="[
                  'flex items-center gap-1.5 text-xs font-medium',
                  wizardStep >= step ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
                ]">
                  <div :class="[
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    wizardStep > step ? 'bg-primary text-white' : wizardStep === step ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  ]">
                    <Check v-if="wizardStep > step" :size="12" />
                    <span v-else>{{ step }}</span>
                  </div>
                  <span class="hidden sm:inline">{{ ['Sirket', 'Admin', 'Plan', 'API Key'][step - 1] }}</span>
                </div>
                <div v-if="step < 4" :class="['flex-1 h-0.5 rounded', wizardStep > step ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700']" />
              </template>
            </div>
          </div>

          <!-- Step 1: Company Info -->
          <div v-if="wizardStep === 1" class="px-6 py-5 space-y-4">
            <p class="text-sm text-slate-500 dark:text-slate-400">Sirket bilgilerini girin</p>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marka Adi *</label>
              <input v-model="newTenant.name" class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Ornek: FreshMarket" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Iletisim E-posta *</label>
              <input v-model="newTenant.contactEmail" type="email" class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="info@brand.com" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
              <input v-model="newTenant.contactPhone" class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0216 XXX XXXX" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input v-model="newTenant.website" class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://brand.com" />
            </div>
          </div>

          <!-- Step 2: Admin User -->
          <div v-if="wizardStep === 2" class="px-6 py-5 space-y-4">
            <p class="text-sm text-slate-500 dark:text-slate-400">Tenant admin kullanicisini tanimlayin</p>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Ad Soyad *</label>
              <input v-model="newTenant.adminName" class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Ahmet Yilmaz" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin E-posta *</label>
              <input v-model="newTenant.adminEmail" type="email" class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="admin@brand.com" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sifre (opsiyonel)</label>
              <input v-model="newTenant.adminPassword" type="password" class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Bos birakilirsa davetiye gonderilir" />
            </div>
          </div>

          <!-- Step 3: Plan Selection -->
          <div v-if="wizardStep === 3" class="px-6 py-5 space-y-4">
            <p class="text-sm text-slate-500 dark:text-slate-400">Tenant planini secin</p>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="plan in [
                  { id: 'starter', label: 'Basic', price: 'Ucretsiz', desc: '100 siparis/ay', color: 'slate' },
                  { id: 'growth', label: 'Pro', price: '999 TL/ay', desc: '5.000 siparis/ay', color: 'blue' },
                  { id: 'enterprise', label: 'Enterprise', price: 'Ozel', desc: 'Limitsiz', color: 'amber' },
                ]"
                :key="plan.id"
                @click="newTenant.tier = plan.id"
                :class="[
                  'border-2 rounded-xl p-4 text-left cursor-pointer transition-all',
                  newTenant.tier === plan.id
                    ? `border-${plan.color === 'slate' ? 'primary' : plan.color}-500 bg-${plan.color === 'slate' ? 'primary' : plan.color}-50 dark:bg-${plan.color === 'slate' ? 'primary' : plan.color}-900/20`
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                ]"
              >
                <component :is="tierConfig(plan.id).icon" :size="20" :class="tierConfig(plan.id).text" class="mb-2" />
                <p class="font-bold text-sm text-slate-800 dark:text-white">{{ plan.label }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ plan.price }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500">{{ plan.desc }}</p>
              </button>
            </div>
          </div>

          <!-- Step 4: API Key -->
          <div v-if="wizardStep === 4" class="px-6 py-5 space-y-4">
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle :size="32" class="text-green-600 dark:text-green-400" />
              </div>
              <h4 class="text-lg font-bold text-slate-800 dark:text-white mb-1">Tenant Olusturuldu!</h4>
              <p class="text-sm text-slate-500 dark:text-slate-400">API key'i kopyalayip guvenli bir yerde saklayin.</p>
            </div>
            <div v-if="createdApiKey" class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">API Key</label>
              <div class="flex items-center gap-2">
                <code class="flex-1 text-sm font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 break-all">{{ createdApiKey }}</code>
                <button @click="copyKey(createdApiKey)" class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer flex-shrink-0">
                  <Check v-if="copiedKey" :size="16" class="text-green-500" />
                  <Copy v-else :size="16" class="text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          <!-- Wizard Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
            <button
              v-if="wizardStep > 1 && wizardStep < 4"
              @click="prevStep"
              class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Geri
            </button>
            <div v-else />
            <div class="flex gap-2">
              <button @click="closeCreateWizard" class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
                {{ wizardStep === 4 ? 'Kapat' : 'Iptal' }}
              </button>
              <button
                v-if="wizardStep < 3"
                @click="nextStep"
                :disabled="!canProceed"
                class="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium disabled:opacity-40 cursor-pointer transition-colors flex items-center gap-1.5"
              >
                Ileri <ArrowRight :size="14" />
              </button>
              <button
                v-else-if="wizardStep === 3"
                @click="handleCreate"
                :disabled="!canProceed"
                class="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium disabled:opacity-40 cursor-pointer transition-colors"
              >
                Olustur
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.slide-over-enter-active,
.slide-over-leave-active {
  transition: all 0.3s ease;
}
.slide-over-enter-active > div:last-child,
.slide-over-leave-active > div:last-child {
  transition: transform 0.3s ease;
}
.slide-over-enter-from > div:last-child {
  transform: translateX(100%);
}
.slide-over-leave-to > div:last-child {
  transform: translateX(100%);
}
.slide-over-enter-from > div:first-child,
.slide-over-leave-to > div:first-child {
  opacity: 0;
}
</style>
