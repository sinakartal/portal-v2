<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm"
      @click.self="close"
    >
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div
          v-if="isOpen"
          class="mt-[15vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <!-- ── Search Input ──────────────────────────────────────────────── -->
          <div class="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Search class="h-5 w-5 shrink-0 text-slate-400" />
            <input
              ref="searchInputRef"
              v-model="query"
              type="text"
              placeholder="Sayfa veya islem ara..."
              class="flex-1 bg-transparent text-base text-slate-900 placeholder-slate-400 outline-none"
              @keydown="handleInputKeydown"
            />
            <kbd
              class="hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-400 sm:inline-block"
            >
              ESC
            </kbd>
          </div>

          <!-- ── Results ───────────────────────────────────────────────────── -->
          <div class="max-h-80 overflow-y-auto overscroll-contain px-2 py-2">
            <template v-if="filteredPages.length > 0">
              <div class="mb-1 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Sayfalar
              </div>
              <button
                v-for="(item, i) in filteredPages"
                :key="'page-' + item.path"
                @click="navigateTo(item)"
                @mouseenter="activeIndex = i"
                :class="[
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition',
                  activeIndex === i
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50',
                ]"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'h-4 w-4 shrink-0',
                    activeIndex === i ? 'text-indigo-500' : 'text-slate-400',
                  ]"
                />
                <span class="flex-1 font-medium">{{ item.title }}</span>
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    activeIndex === i
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-400',
                  ]"
                >
                  Sayfa
                </span>
              </button>
            </template>

            <template v-if="filteredActions.length > 0">
              <div
                class="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                :class="{ 'mt-3 border-t border-slate-100 pt-3': filteredPages.length > 0 }"
              >
                Hizli Islemler
              </div>
              <button
                v-for="(item, j) in filteredActions"
                :key="'action-' + item.title"
                @click="executeAction(item)"
                @mouseenter="activeIndex = filteredPages.length + j"
                :class="[
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition',
                  activeIndex === filteredPages.length + j
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-slate-700 hover:bg-slate-50',
                ]"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'h-4 w-4 shrink-0',
                    activeIndex === filteredPages.length + j ? 'text-amber-500' : 'text-slate-400',
                  ]"
                />
                <span class="flex-1 font-medium">{{ item.title }}</span>
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    activeIndex === filteredPages.length + j
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-slate-100 text-slate-400',
                  ]"
                >
                  Islem
                </span>
              </button>
            </template>

            <!-- Empty state -->
            <div
              v-if="filteredPages.length === 0 && filteredActions.length === 0"
              class="px-3 py-8 text-center text-sm text-slate-400"
            >
              <Search class="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p>Sonuc bulunamadi</p>
              <p class="mt-1 text-xs text-slate-300">Farkli bir arama deneyin</p>
            </div>
          </div>

          <!-- ── Keyboard Hints ────────────────────────────────────────────── -->
          <div class="flex items-center gap-4 border-t border-slate-100 bg-slate-50 px-4 py-2">
            <div class="flex items-center gap-1.5 text-xs text-slate-400">
              <span class="inline-flex items-center gap-0.5">
                <kbd class="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  <ArrowUp class="inline h-3 w-3" />
                </kbd>
                <kbd class="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  <ArrowDown class="inline h-3 w-3" />
                </kbd>
              </span>
              gezinme
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-400">
              <kbd class="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                <CornerDownLeft class="inline h-3 w-3" />
              </kbd>
              sec
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-400">
              <kbd class="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                esc
              </kbd>
              kapat
            </div>
            <div class="ml-auto flex items-center gap-1 text-xs text-slate-300">
              <Command class="h-3 w-3" />
              <span>K</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Command,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  X,
  LayoutDashboard,
  MapPin,
  Package,
  Truck,
  Route,
  BarChart3,
  FileText,
  Wallet,
  Cpu,
  Handshake,
  FolderKanban,
  Settings,
  Plus,
  Play,
  Database,
  Zap,
} from 'lucide-vue-next'

const router = useRouter()

const emit = defineEmits(['dispatch-run', 'generate-test-data'])

// ── State ─────────────────────────────────────────────────────────────────────
const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const searchInputRef = ref(null)

// ── Pages ─────────────────────────────────────────────────────────────────────
const pages = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Siparisler', path: '/orders', icon: Package },
  { title: 'Kuryeler', path: '/couriers', icon: Truck },
  { title: 'Rotalar', path: '/routes', icon: Route },
  { title: 'Analitik', path: '/analytics', icon: BarChart3 },
  { title: 'Raporlar', path: '/reports', icon: FileText },
  { title: 'Finans', path: '/finance', icon: Wallet },
  { title: 'Partnerler', path: '/partners', icon: Handshake },
  { title: 'Projeler', path: '/projects', icon: FolderKanban },
  { title: 'Ayarlar', path: '/settings', icon: Settings },
]

// ── Quick Actions ─────────────────────────────────────────────────────────────
const actions = [
  { title: 'Yeni Siparis Olustur', path: '/orders/new', icon: Plus, type: 'navigate' },
  { title: 'Dispatch Calistir', icon: Play, type: 'event', event: 'dispatch-run' },
  { title: 'Test Verisi Uret', icon: Database, type: 'event', event: 'generate-test-data' },
]

// ── Filtered Lists ────────────────────────────────────────────────────────────
const filteredPages = computed(() => {
  if (!query.value.trim()) return pages
  const q = query.value.toLocaleLowerCase('tr')
  return pages.filter((p) => p.title.toLocaleLowerCase('tr').includes(q))
})

const filteredActions = computed(() => {
  if (!query.value.trim()) return actions
  const q = query.value.toLocaleLowerCase('tr')
  return actions.filter((a) => a.title.toLocaleLowerCase('tr').includes(q))
})

const totalItems = computed(() => filteredPages.value.length + filteredActions.value.length)

// ── Reset active index when query changes ─────────────────────────────────────
watch(query, () => {
  activeIndex.value = 0
})

// ── Open / Close ──────────────────────────────────────────────────────────────
function open() {
  isOpen.value = true
  query.value = ''
  activeIndex.value = 0
  nextTick(() => {
    setTimeout(() => searchInputRef.value?.focus(), 50)
  })
}

function close() {
  isOpen.value = false
  query.value = ''
  activeIndex.value = 0
}

defineExpose({ open, close })

// ── Keyboard Navigation ───────────────────────────────────────────────────────
function handleInputKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % totalItems.value
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + totalItems.value) % totalItems.value
  } else if (e.key === 'Enter') {
    e.preventDefault()
    selectActiveItem()
  } else if (e.key === 'Escape') {
    close()
  }
}

function selectActiveItem() {
  const idx = activeIndex.value
  if (idx < filteredPages.value.length) {
    navigateTo(filteredPages.value[idx])
  } else {
    const actionIdx = idx - filteredPages.value.length
    if (actionIdx < filteredActions.value.length) {
      executeAction(filteredActions.value[actionIdx])
    }
  }
}

// ── Navigation & Actions ──────────────────────────────────────────────────────
function navigateTo(item) {
  router.push(item.path)
  close()
}

function executeAction(action) {
  if (action.type === 'navigate') {
    router.push(action.path)
  } else if (action.type === 'event') {
    emit(action.event)
  }
  close()
}

// ── Global Keyboard Shortcut ──────────────────────────────────────────────────
function handleGlobalKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>
