<script setup>
import { ref, computed, onMounted } from 'vue'
import { Award, Flame, Target, MapPin, RefreshCw, Trophy, Medal, Crown, Users, Calendar, TrendingUp, BarChart3 } from 'lucide-vue-next'
import { getIncentivesSummary } from '@/services/api'

const data = ref(null)
const loading = ref(true)
const error = ref('')
const activeTab = ref('leaderboard')

async function load() {
  loading.value = true
  error.value = ''
  const res = await getIncentivesSummary()
  loading.value = false
  if (res.ok && res.data) {
    data.value = res.data.data || res.data
  } else {
    error.value = 'Tesvik verileri yuklenemedi'
  }
}

const kpis = computed(() => {
  if (!data.value) return { totalBonus: 0, questPayout: 0, zoneCount: 0, activeCouriers: 0 }
  return {
    totalBonus: data.value.totalActiveBonus || 0,
    questPayout: data.value.totalQuestPayout || 0,
    zoneCount: (data.value.zones || []).length,
    activeCouriers: (data.value.streaks || []).length + (data.value.quests || []).length,
  }
})

// ---- Leaderboard ----
const leaderboard = computed(() => {
  if (!data.value) return MOCK_LEADERBOARD
  const couriers = new Map()

  // Aggregate from streaks
  ;(data.value.streaks || []).forEach(s => {
    const id = s.courierId || s.courierName
    const existing = couriers.get(id) || { name: s.courierName || s.courierId, score: 0, deliveries: 0, bonus: 0 }
    existing.score += (s.count || 0) * 10 + (s.bonusPercent || 0)
    existing.deliveries += s.count || 0
    existing.bonus += s.totalEarning || 0
    couriers.set(id, existing)
  })

  // Aggregate from quests
  ;(data.value.quests || []).forEach(q => {
    const id = q.courierId || q.courierName
    const existing = couriers.get(id) || { name: q.courierName || q.courierId, score: 0, deliveries: 0, bonus: 0 }
    existing.score += (q.currentCount || 0) * 5
    existing.bonus += q.payout || 0
    couriers.set(id, existing)
  })

  const list = Array.from(couriers.values()).sort((a, b) => b.score - a.score)
  return list.length > 0 ? list : MOCK_LEADERBOARD
})

const MOCK_LEADERBOARD = [
  { name: 'Ahmet Yilmaz', score: 485, deliveries: 42, bonus: 1250 },
  { name: 'Mehmet Kaya', score: 420, deliveries: 38, bonus: 1100 },
  { name: 'Ali Demir', score: 395, deliveries: 35, bonus: 980 },
  { name: 'Hasan Celik', score: 350, deliveries: 31, bonus: 870 },
  { name: 'Emre Sahin', score: 320, deliveries: 28, bonus: 750 },
  { name: 'Mustafa Ozturk', score: 290, deliveries: 26, bonus: 680 },
  { name: 'Fatih Arslan', score: 265, deliveries: 23, bonus: 620 },
  { name: 'Burak Yildiz', score: 240, deliveries: 21, bonus: 540 },
]

// ---- Campaign Cards ----
const campaigns = computed(() => {
  if (!data.value) return MOCK_CAMPAIGNS
  const quests = data.value.quests || []
  if (quests.length === 0) return MOCK_CAMPAIGNS
  // Group by quest name
  const grouped = {}
  quests.forEach(q => {
    const name = q.quest || q.name || 'Kampanya'
    if (!grouped[name]) {
      grouped[name] = { name, target: q.tierTarget || 50, current: 0, endDate: '2026-03-31', count: 0, totalPayout: 0 }
    }
    grouped[name].current += q.currentCount || 0
    grouped[name].count++
    grouped[name].totalPayout += q.payout || 0
  })
  return Object.values(grouped).length > 0 ? Object.values(grouped) : MOCK_CAMPAIGNS
})

const MOCK_CAMPAIGNS = [
  { name: 'Haftalik Sprint', target: 200, current: 145, endDate: '2026-03-14', count: 12, totalPayout: 3500 },
  { name: 'Bolge Hakimi', target: 100, current: 78, endDate: '2026-03-20', count: 8, totalPayout: 2200 },
  { name: 'Express Ustasi', target: 50, current: 42, endDate: '2026-03-17', count: 15, totalPayout: 4100 },
  { name: 'Gece Kartali', target: 80, current: 35, endDate: '2026-03-25', count: 6, totalPayout: 1800 },
]

// ---- Courier comparison data ----
const selectedCourier = ref(null)
const courierComparison = computed(() => {
  if (!selectedCourier.value) return null
  // Mock comparison data
  return {
    name: selectedCourier.value,
    targets: [
      { label: 'Gunluk Teslimat', target: 20, actual: 18 },
      { label: 'Haftalik Streak', target: 7, actual: 5 },
      { label: 'Musteri Puani', target: 4.8, actual: 4.6 },
      { label: 'Zamaninda Teslim %', target: 95, actual: 92 },
      { label: 'Express Siparis', target: 10, actual: 8 },
    ]
  }
})

function getRankBadge(index) {
  if (index === 0) return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/30', ring: 'ring-2 ring-yellow-400' }
  if (index === 1) return { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700', ring: 'ring-2 ring-slate-300' }
  if (index === 2) return { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', ring: 'ring-2 ring-amber-400' }
  return null
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Tesvik Sistemi</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Kurye performans, kampanya ve odul takibi</p>
      </div>
      <button @click="load" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-600 dark:text-slate-300">
        <RefreshCw :size="16" :class="loading ? 'animate-spin' : ''" /> Yenile
      </button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
          <Award :size="16" class="text-orange-500" /> Aktif Bonus Toplam
        </div>
        <p class="text-2xl font-bold text-orange-600">{{ kpis.totalBonus.toFixed(0) }} TL</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
          <Target :size="16" class="text-purple-500" /> Quest Kazanim
        </div>
        <p class="text-2xl font-bold text-purple-600">{{ kpis.questPayout.toFixed(0) }} TL</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
          <MapPin :size="16" class="text-blue-500" /> Bonuslu Bolge
        </div>
        <p class="text-2xl font-bold text-blue-600">{{ kpis.zoneCount }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
          <Users :size="16" class="text-emerald-500" /> Aktif Kurye
        </div>
        <p class="text-2xl font-bold text-emerald-600">{{ kpis.activeCouriers }}</p>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
    </div>
    <div v-else-if="error" class="text-center py-10 text-red-500">{{ error }}</div>

    <!-- Tabs -->
    <div v-else>
      <div class="bg-white dark:bg-slate-800 rounded-t-xl border border-b-0 border-slate-200 dark:border-slate-700">
        <div class="flex border-b border-slate-200 dark:border-slate-700">
          <button v-for="t in [
            {id:'leaderboard',label:'Lider Tablosu',icon:Trophy},
            {id:'campaigns',label:'Kampanyalar',icon:Target},
            {id:'comparison',label:'Kurye Karsilastirma',icon:BarChart3},
            {id:'streaks',label:'Streak\'ler',icon:Flame},
            {id:'zones',label:'Bolge Bonuslari',icon:MapPin}
          ]"
            :key="t.id" @click="activeTab = t.id"
            :class="activeTab === t.id ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-slate-500 dark:text-slate-400'"
            class="flex items-center gap-2 px-5 py-3 text-sm font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <component :is="t.icon" :size="16" /> {{ t.label }}
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700">

        <!-- Leaderboard Tab -->
        <div v-if="activeTab === 'leaderboard'" class="p-6">
          <!-- Top 3 Podium -->
          <div class="flex items-end justify-center gap-4 mb-8">
            <!-- 2nd Place -->
            <div class="flex flex-col items-center" v-if="leaderboard.length > 1">
              <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center ring-2 ring-slate-300 mb-2">
                <span class="text-lg font-bold text-slate-600 dark:text-slate-300">{{ leaderboard[1].name.split(' ').map(w => w[0]).join('') }}</span>
              </div>
              <Medal :size="20" class="text-slate-400 mb-1" />
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">{{ leaderboard[1].name }}</p>
              <p class="text-lg font-bold text-slate-600 dark:text-slate-300">{{ leaderboard[1].score }}</p>
              <div class="w-20 h-24 bg-slate-200 dark:bg-slate-600 rounded-t-lg mt-2 flex items-center justify-center">
                <span class="text-2xl font-bold text-slate-400 dark:text-slate-500">2</span>
              </div>
            </div>

            <!-- 1st Place -->
            <div class="flex flex-col items-center" v-if="leaderboard.length > 0">
              <div class="w-20 h-20 rounded-full bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center ring-3 ring-yellow-400 mb-2">
                <span class="text-xl font-bold text-yellow-600">{{ leaderboard[0].name.split(' ').map(w => w[0]).join('') }}</span>
              </div>
              <Crown :size="24" class="text-yellow-500 mb-1" />
              <p class="text-sm font-bold text-slate-800 dark:text-white text-center">{{ leaderboard[0].name }}</p>
              <p class="text-xl font-bold text-yellow-600">{{ leaderboard[0].score }}</p>
              <div class="w-20 h-32 bg-yellow-100 dark:bg-yellow-900/30 rounded-t-lg mt-2 flex items-center justify-center">
                <span class="text-3xl font-bold text-yellow-500">1</span>
              </div>
            </div>

            <!-- 3rd Place -->
            <div class="flex flex-col items-center" v-if="leaderboard.length > 2">
              <div class="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center ring-2 ring-amber-400 mb-2">
                <span class="text-lg font-bold text-amber-600">{{ leaderboard[2].name.split(' ').map(w => w[0]).join('') }}</span>
              </div>
              <Medal :size="20" class="text-amber-600 mb-1" />
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">{{ leaderboard[2].name }}</p>
              <p class="text-lg font-bold text-amber-600">{{ leaderboard[2].score }}</p>
              <div class="w-20 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-t-lg mt-2 flex items-center justify-center">
                <span class="text-2xl font-bold text-amber-500">3</span>
              </div>
            </div>
          </div>

          <!-- Full Leaderboard List -->
          <div class="space-y-2">
            <div
              v-for="(courier, index) in leaderboard"
              :key="courier.name"
              :class="[
                'flex items-center gap-4 p-4 rounded-xl transition-colors',
                index < 3
                  ? 'bg-slate-50 dark:bg-slate-700/50'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
              ]"
            >
              <!-- Rank -->
              <div class="w-8 text-center">
                <template v-if="getRankBadge(index)">
                  <component :is="getRankBadge(index).icon" :size="20" :class="getRankBadge(index).color" />
                </template>
                <span v-else class="text-sm font-bold text-slate-400 dark:text-slate-500">{{ index + 1 }}</span>
              </div>

              <!-- Avatar -->
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' :
                index === 1 ? 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300' :
                index === 2 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700' :
                'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              ]">
                {{ courier.name.split(' ').map(w => w[0]).join('') }}
              </div>

              <!-- Name -->
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ courier.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ courier.deliveries }} teslimat</p>
              </div>

              <!-- Score -->
              <div class="text-right">
                <p class="text-lg font-bold text-slate-800 dark:text-white">{{ courier.score }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500">puan</p>
              </div>

              <!-- Bonus -->
              <div class="text-right w-24">
                <p class="text-sm font-bold text-green-600">{{ courier.bonus.toFixed(0) }} TL</p>
                <p class="text-xs text-slate-400 dark:text-slate-500">kazanim</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Campaigns Tab -->
        <div v-if="activeTab === 'campaigns'" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="campaign in campaigns"
              :key="campaign.name"
              class="bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 p-5 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ campaign.name }}</h4>
                <span class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Calendar :size="12" />
                  {{ campaign.endDate }}
                </span>
              </div>

              <!-- Progress -->
              <div class="mb-3">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs text-slate-500 dark:text-slate-400">Ilerleme</span>
                  <span class="text-xs font-bold" :class="campaign.current >= campaign.target ? 'text-green-600' : 'text-slate-600 dark:text-slate-300'">
                    {{ campaign.current }} / {{ campaign.target }}
                  </span>
                </div>
                <div class="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="campaign.current >= campaign.target ? 'bg-green-500' : 'bg-primary'"
                    :style="{ width: Math.min((campaign.current / campaign.target) * 100, 100) + '%' }"
                  />
                </div>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  %{{ Math.round((campaign.current / campaign.target) * 100) }} tamamlandi
                </p>
              </div>

              <!-- Stats -->
              <div class="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-600">
                <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Users :size="12" />
                  {{ campaign.count }} kurye
                </div>
                <div class="text-sm font-bold text-green-600">
                  {{ campaign.totalPayout.toLocaleString('tr-TR') }} TL
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Courier Comparison Tab -->
        <div v-if="activeTab === 'comparison'" class="p-6">
          <!-- Courier Selector -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kurye Sec</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="courier in leaderboard.slice(0, 6)"
                :key="courier.name"
                @click="selectedCourier = courier.name"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
                  selectedCourier === courier.name
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary'
                ]"
              >
                {{ courier.name }}
              </button>
            </div>
          </div>

          <!-- Comparison Chart (Bar visualization) -->
          <div v-if="courierComparison" class="space-y-4">
            <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {{ courierComparison.name }} - Hedef vs Gerceklesen
            </h4>
            <div
              v-for="metric in courierComparison.targets"
              :key="metric.label"
              class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ metric.label }}</span>
                <div class="flex items-center gap-3 text-xs">
                  <span class="text-slate-400 dark:text-slate-500">Hedef: <strong class="text-slate-600 dark:text-slate-300">{{ metric.target }}</strong></span>
                  <span :class="metric.actual >= metric.target ? 'text-green-600' : 'text-amber-600'">
                    Gercek: <strong>{{ metric.actual }}</strong>
                  </span>
                </div>
              </div>
              <!-- Dual bar -->
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 w-12">Hedef</span>
                  <div class="flex-1 h-4 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div class="h-full bg-slate-400 dark:bg-slate-500 rounded-full" :style="{ width: '100%' }" />
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] w-12" :class="metric.actual >= metric.target ? 'text-green-600' : 'text-amber-600'">Gercek</span>
                  <div class="flex-1 h-4 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="metric.actual >= metric.target ? 'bg-green-500' : 'bg-amber-500'"
                      :style="{ width: Math.min((metric.actual / metric.target) * 100, 100) + '%' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-16 text-slate-400 dark:text-slate-500">
            <BarChart3 :size="32" class="mx-auto mb-3 opacity-50" />
            <p class="text-sm">Karsilastirma icin bir kurye secin</p>
          </div>
        </div>

        <!-- Streaks Tab -->
        <div v-if="activeTab === 'streaks'" class="p-4">
          <table class="w-full text-sm">
            <thead><tr class="text-left text-slate-500 dark:text-slate-400">
              <th class="px-3 py-2">Kurye</th><th class="px-3 py-2">Ardisik Teslimat</th><th class="px-3 py-2">Bonus %</th><th class="px-3 py-2">Kazanim</th><th class="px-3 py-2">Ilerleme</th>
            </tr></thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="s in (data?.streaks || [])" :key="s.courierId" class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td class="px-3 py-2 font-medium text-slate-800 dark:text-white">{{ s.courierName || s.courierId }}</td>
                <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ s.count || 0 }}</td>
                <td class="px-3 py-2 text-green-600 font-semibold">%{{ s.bonusPercent || 0 }}</td>
                <td class="px-3 py-2 font-semibold text-slate-800 dark:text-white">{{ (s.totalEarning || 0).toFixed(0) }} TL</td>
                <td class="px-3 py-2 w-40">
                  <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div class="bg-orange-500 rounded-full h-2 transition-all" :style="{width: Math.min((s.count || 0) * 10, 100) + '%'}"></div>
                  </div>
                </td>
              </tr>
              <tr v-if="(data?.streaks || []).length === 0"><td colspan="5" class="text-center py-6 text-slate-400 dark:text-slate-500">Streak verisi yok</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Zones Tab -->
        <div v-if="activeTab === 'zones'" class="p-4">
          <table class="w-full text-sm">
            <thead><tr class="text-left text-slate-500 dark:text-slate-400">
              <th class="px-3 py-2">Bolge</th><th class="px-3 py-2">Bonus %</th><th class="px-3 py-2">Neden</th><th class="px-3 py-2">Kurye/Talep</th>
            </tr></thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="z in (data?.zones || [])" :key="z.zone || z.name" class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td class="px-3 py-2 font-medium text-slate-800 dark:text-white">{{ z.zone || z.name }}</td>
                <td class="px-3 py-2">
                  <span :class="(z.bonusPercent || 0) > 20 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'">%{{ z.bonusPercent || 0 }}</span>
                </td>
                <td class="px-3 py-2 text-slate-500 dark:text-slate-400">{{ z.reason || '-' }}</td>
                <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ z.courierCount || 0 }} / {{ z.demandCount || 0 }}</td>
              </tr>
              <tr v-if="(data?.zones || []).length === 0"><td colspan="4" class="text-center py-6 text-slate-400 dark:text-slate-500">Bolge bonus verisi yok</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
