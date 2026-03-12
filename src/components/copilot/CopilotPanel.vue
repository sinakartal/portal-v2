<script setup>
import { ref, nextTick, computed } from 'vue'
import { MessageCircle, X, Send, Bot } from 'lucide-vue-next'
import { sendCopilotMessage, getOrders, getRoutes, getCouriers, getStats } from '@/services/api'
import { useCopilotContextStore } from '@/stores/copilotContext'

const copilotCtx = useCopilotContextStore()

const isOpen = ref(false)
const message = ref('')
const loading = ref(false)
const messagesRef = ref(null)
const messages = ref([])

const suggestions = [
  'Kac siparis ve rota var?',
  'En uzun rota hangisi?',
  'Kurye performansini ozetle',
  'Rotalari analiz et',
  'Hangi rota bolunsun?',
  'SLA durumu nasil?',
]

// Merge simulation data + API data for full context
async function gatherFullContext() {
  const sim = {
    orders: copilotCtx.orders,
    routes: copilotCtx.routes,
    couriers: copilotCtx.couriers,
    stats: copilotCtx.stats,
    algorithms: copilotCtx.selectedAlgorithms,
  }

  // If simulation has data, use it
  if (sim.orders.length > 0 || sim.routes.length > 0) return sim

  // Fallback: try API
  try {
    const [oRes, rRes, cRes, sRes] = await Promise.all([getOrders(), getRoutes(), getCouriers(), getStats()])
    return {
      orders: oRes.ok ? (Array.isArray(oRes.data) ? oRes.data : oRes.data?.orders || []) : [],
      routes: rRes.ok ? (Array.isArray(rRes.data) ? rRes.data : rRes.data?.routes || []) : [],
      couriers: cRes.ok ? (Array.isArray(cRes.data) ? cRes.data : cRes.data?.couriers || []) : [],
      stats: sRes.ok ? sRes.data : null,
      algorithms: null,
    }
  } catch { return sim }
}

async function send() {
  const text = message.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', text })
  message.value = ''
  loading.value = true
  scrollBottom()

  const ctx = await gatherFullContext()

  // Build context summary for backend
  const contextPayload = buildContextPayload(ctx)

  // Try backend first
  const res = await sendCopilotMessage(text, contextPayload)
  loading.value = false

  if (res.ok && res.data) {
    const answer = res.data.response || res.data.message || ''
    // If backend returns empty/generic "no data" response, use local
    if (answer.includes('0 rota') && ctx.routes.length > 0) {
      messages.value.push({ role: 'ai', text: generateResponse(text, ctx) })
    } else if (answer) {
      messages.value.push({ role: 'ai', text: answer })
    } else {
      messages.value.push({ role: 'ai', text: generateResponse(text, ctx) })
    }
  } else {
    messages.value.push({ role: 'ai', text: generateResponse(text, ctx) })
  }
  scrollBottom()
}

function buildContextPayload(ctx) {
  return {
    timestamp: new Date().toISOString(),
    totalOrders: ctx.orders.length,
    totalRoutes: ctx.routes.length,
    totalCouriers: ctx.couriers.length,
    orders: ctx.orders.slice(0, 30).map(o => ({
      id: o.id, status: o.status, mode: o.mode,
      originId: o.originId, deci: o.deci,
      deliveryLat: o.deliveryLocation?.lat,
      deliveryLng: o.deliveryLocation?.lng,
    })),
    routes: ctx.routes.map(r => ({
      id: r.id, status: r.status,
      orderCount: r.orderIds?.length || 0,
      orderIds: r.orderIds,
      totalKm: r.totalDistanceKm,
      totalTimeSec: r.totalTimeSec,
      totalDeci: r.totalDeci,
      courierId: r.courierId,
      color: r.color,
      waypointCount: r.waypoints?.length || 0,
      kmPerOrder: r.kmPerOrder,
      estimatedEarning: r.estimatedEarning,
    })),
    couriers: ctx.couriers.slice(0, 20).map(c => ({
      id: c.id, name: c.name, status: c.status,
      lat: c.location?.lat, lng: c.location?.lng,
    })),
    stats: ctx.stats,
    algorithms: ctx.algorithms,
  }
}

function generateResponse(question, ctx) {
  const q = question.toLowerCase()
  const orders = ctx.orders || []
  const routes = ctx.routes || []
  const couriers = ctx.couriers || []
  const stats = ctx.stats

  // No data at all
  if (orders.length === 0 && routes.length === 0) {
    return 'Henuz veri yok. Algoritma sekmesinden siparis uretin ve dispatch edin, sonra soru sorun.'
  }

  // ─── ROUTE QUESTIONS ───
  if (q.includes('rota') || q.includes('route')) {
    if (routes.length === 0) {
      return `${orders.length} siparis var ama henuz rotalama yapilmadi. "Dispatch Et" butonuna basin.`
    }

    // Specific route (e.g. "rota 3", "rota #8")
    const routeMatch = q.match(/rota\s*#?\s*(\d+)/i)
    if (routeMatch) {
      const rIdx = parseInt(routeMatch[1]) - 1
      if (rIdx >= 0 && rIdx < routes.length) {
        return analyzeRoute(routes[rIdx], rIdx, routes, orders)
      }
      return `Rota #${routeMatch[1]} bulunamadi. Toplam ${routes.length} rota var.`
    }

    // "En uzun rota" / "en kisa"
    if (q.includes('uzun') || q.includes('buyuk') || q.includes('büyük')) {
      const sorted = [...routes].sort((a, b) => (b.totalDistanceKm || 0) - (a.totalDistanceKm || 0))
      const r = sorted[0]
      const idx = routes.indexOf(r)
      return `En uzun rota: Rota #${idx + 1}\n${analyzeRoute(r, idx, routes, orders)}`
    }
    if (q.includes('kisa') || q.includes('kısa') || q.includes('küçük')) {
      const sorted = [...routes].sort((a, b) => (a.totalDistanceKm || 0) - (b.totalDistanceKm || 0))
      const r = sorted[0]
      const idx = routes.indexOf(r)
      return `En kisa rota: Rota #${idx + 1}\n${analyzeRoute(r, idx, routes, orders)}`
    }

    // "Bolunme" / "parcala"
    if (q.includes('bolun') || q.includes('bölün') || q.includes('parcala') || q.includes('parçala') || q.includes('split')) {
      return suggestRouteSplits(routes, orders)
    }

    // "analiz" / "ozetle"
    if (q.includes('analiz') || q.includes('ozetle') || q.includes('özetle')) {
      return analyzeAllRoutes(routes, orders, stats)
    }

    // Generic route info
    return routeSummary(routes, orders)
  }

  // ─── ORDER QUESTIONS ───
  if (q.includes('siparis') || q.includes('order')) {
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'new')
    const dispatched = orders.filter(o => o.status === 'dispatched' || o.status === 'assigned')
    const delivered = orders.filter(o => o.status === 'delivered')

    const modeMap = {}
    orders.forEach(o => { modeMap[o.mode || 'standard'] = (modeMap[o.mode || 'standard'] || 0) + 1 })

    let text = `Toplam ${orders.length} siparis:\n`
    text += `• ${pending.length} bekliyor\n`
    text += `• ${dispatched.length} dagitimda\n`
    text += `• ${delivered.length} teslim edildi\n\n`
    text += `Mod dagilimi: ${Object.entries(modeMap).map(([k,v]) => `${k}: ${v}`).join(', ')}`
    return text
  }

  // ─── COURIER QUESTIONS ───
  if (q.includes('kurye') || q.includes('courier')) {
    if (couriers.length === 0) return 'Kurye verisi yok.'
    const active = couriers.filter(c => c.status === 'active' || c.status === 'busy')
    const idle = couriers.filter(c => c.status === 'idle' || c.status === 'available')

    // Load per courier from routes
    const courierLoad = {}
    routes.forEach(r => {
      if (!courierLoad[r.courierId]) courierLoad[r.courierId] = { orders: 0, km: 0 }
      courierLoad[r.courierId].orders += r.orderIds?.length || 0
      courierLoad[r.courierId].km += r.totalDistanceKm || 0
    })

    let text = `${couriers.length} kurye:\n• ${active.length} aktif, ${idle.length} bosta\n\nKurye yuk dagilimi:`
    couriers.forEach((c, i) => {
      const load = courierLoad[c.id]
      text += `\n• Kurye ${i + 1} (${c.name || c.id}): ${load ? `${load.orders} siparis, ${load.km.toFixed(1)} km` : 'Atanmamis'}`
    })
    return text
  }

  // ─── SLA ───
  if (q.includes('sla')) {
    if (stats) {
      return `SLA Durumu:\n• Oran: %${stats.slaRate || stats.avgSLA || '-'}\n• Toplam rota: ${routes.length}\n• Ortalama km/siparis: ${stats.avgKmPerOrder || '-'}\n• Toplam km: ${stats.totalKm || '-'}`
    }
    if (routes.length > 0) {
      const totalKm = routes.reduce((s, r) => s + (r.totalDistanceKm || 0), 0)
      const totalOrders = routes.reduce((s, r) => s + (r.orderIds?.length || 0), 0)
      return `SLA detay verisi mevcut degil.\n\nRota bazli metrikler:\n• ${routes.length} rota, ${totalOrders} siparis\n• Toplam ${totalKm.toFixed(1)} km\n• Ort. ${(totalKm / Math.max(1, totalOrders)).toFixed(1)} km/siparis`
    }
    return 'SLA verisi mevcut degil.'
  }

  // ─── ALGORITHMS ───
  if (q.includes('algoritma') || q.includes('pipeline')) {
    const algos = ctx.algorithms
    if (!algos) return 'Algoritma secimi bilgisi yok.'
    return `Aktif Pipeline:\n• Atama: ${algos.assignment || '-'}\n• Rotalama: ${algos.routing || '-'}\n• Optimizasyon: ${algos.optimization || '-'}\n• Hibrit: ${algos.hybrid || 'Yok'}`
  }

  // ─── GENERIC ───
  return generalSummary(orders, routes, couriers, stats)
}

// ─── Route analysis helpers ───

function analyzeRoute(route, idx, allRoutes, allOrders) {
  const orderCount = route.orderIds?.length || 0
  const km = (route.totalDistanceKm || 0).toFixed(1)
  const mins = Math.round((route.totalTimeSec || 0) / 60)
  const deci = route.totalDeci || 0
  const kmPerOrder = route.kmPerOrder ? route.kmPerOrder.toFixed(1) : (orderCount > 0 ? (route.totalDistanceKm / orderCount).toFixed(1) : '-')
  const earning = route.estimatedEarning ? `${Math.round(route.estimatedEarning)} TL` : '-'

  // Find route's orders
  const routeOrders = allOrders.filter(o => route.orderIds?.includes(o.id))
  const modes = {}
  routeOrders.forEach(o => { modes[o.mode || 'standard'] = (modes[o.mode || 'standard'] || 0) + 1 })
  const origins = [...new Set(routeOrders.map(o => o.originId))].length

  // Compare to average
  const avgKm = allRoutes.reduce((s, r) => s + (r.totalDistanceKm || 0), 0) / allRoutes.length
  const avgOrders = allOrders.length / allRoutes.length
  const isLong = route.totalDistanceKm > avgKm * 1.3
  const isHeavy = orderCount > avgOrders * 1.3

  let text = `📊 Rota #${idx + 1} Analizi:\n`
  text += `• ${orderCount} siparis | ${km} km | ${mins} dk\n`
  text += `• ${deci} desi | ${kmPerOrder} km/siparis | ${earning}\n`
  text += `• ${origins} farkli magaza | Modlar: ${Object.entries(modes).map(([k,v]) => `${k}:${v}`).join(', ')}\n`

  if (isLong) text += `\n⚠️ Bu rota ortalamadan %${Math.round((route.totalDistanceKm / avgKm - 1) * 100)} daha uzun.`
  if (isHeavy) text += `\n⚠️ Ortalamadan %${Math.round((orderCount / avgOrders - 1) * 100)} daha fazla siparis.`

  if (isLong || isHeavy) {
    text += `\n\n💡 Oneri: Bu rotayi bolmeyi dusunun. ${Math.ceil(orderCount / 2)} siparis x 2 rota daha verimli olabilir.`
  }

  // Waypoint timeline
  if (route.waypoints?.length > 0) {
    text += `\n\nAdimlar:`
    route.waypoints.forEach((wp, i) => {
      const type = wp.type === 'pickup' ? '📦 Toplama' : '🏠 Teslimat'
      text += `\n  ${i + 1}. ${type} — ${wp.orderId?.substring(0, 12) || ''}`
    })
  }

  return text
}

function routeSummary(routes, orders) {
  const totalKm = routes.reduce((s, r) => s + (r.totalDistanceKm || 0), 0)
  const totalTime = routes.reduce((s, r) => s + (r.totalTimeSec || 0), 0)
  const totalOrders = routes.reduce((s, r) => s + (r.orderIds?.length || 0), 0)

  let text = `${routes.length} rota, ${totalOrders} siparis:\n\n`
  routes.forEach((r, i) => {
    const oc = r.orderIds?.length || 0
    text += `• Rota #${i + 1}: ${oc} sip, ${(r.totalDistanceKm || 0).toFixed(1)} km, ${Math.round((r.totalTimeSec || 0) / 60)} dk\n`
  })
  text += `\nToplam: ${totalKm.toFixed(1)} km | ${Math.round(totalTime / 60)} dk | Ort. ${(totalKm / Math.max(1, totalOrders)).toFixed(1)} km/siparis`
  return text
}

function analyzeAllRoutes(routes, orders, stats) {
  const totalKm = routes.reduce((s, r) => s + (r.totalDistanceKm || 0), 0)
  const avgKm = totalKm / routes.length
  const kmValues = routes.map(r => r.totalDistanceKm || 0)
  const maxKm = Math.max(...kmValues)
  const minKm = Math.min(...kmValues)
  const orderCounts = routes.map(r => r.orderIds?.length || 0)
  const maxOrders = Math.max(...orderCounts)
  const minOrders = Math.min(...orderCounts)

  // Balance score (std deviation)
  const avgOrd = orders.length / routes.length
  const variance = orderCounts.reduce((s, c) => s + (c - avgOrd) ** 2, 0) / routes.length
  const stdDev = Math.sqrt(variance)
  const balanceScore = Math.max(0, 100 - stdDev / avgOrd * 100).toFixed(0)

  let text = `📊 Rota Analizi (${routes.length} rota, ${orders.length} siparis)\n\n`
  text += `Mesafe:\n• Toplam: ${totalKm.toFixed(1)} km | Ort: ${avgKm.toFixed(1)} km\n`
  text += `• Min: ${minKm.toFixed(1)} km | Max: ${maxKm.toFixed(1)} km\n\n`
  text += `Siparis dagilimi:\n• Min: ${minOrders} | Max: ${maxOrders} | Ort: ${avgOrd.toFixed(1)}\n`
  text += `• Denge skoru: %${balanceScore}\n\n`

  // Problematic routes
  const longRoutes = routes.filter((r, i) => (r.totalDistanceKm || 0) > avgKm * 1.4)
  const heavyRoutes = routes.filter(r => (r.orderIds?.length || 0) > avgOrd * 1.4)

  if (longRoutes.length > 0) {
    text += `⚠️ Uzun rotalar: ${longRoutes.map(r => `#${routes.indexOf(r) + 1}`).join(', ')}\n`
  }
  if (heavyRoutes.length > 0) {
    text += `⚠️ Yogun rotalar: ${heavyRoutes.map(r => `#${routes.indexOf(r) + 1}`).join(', ')}\n`
  }

  if (stats) {
    text += `\n📈 Genel: ${stats.avgKmPerOrder || '-'} km/sip | Multi-origin: %${stats.multiOriginRate || 0}`
  }

  return text
}

function suggestRouteSplits(routes, orders) {
  const avgOrders = orders.length / routes.length
  const avgKm = routes.reduce((s, r) => s + (r.totalDistanceKm || 0), 0) / routes.length
  const candidates = routes
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => (r.orderIds?.length || 0) > avgOrders * 1.3 || (r.totalDistanceKm || 0) > avgKm * 1.3)
    .sort((a, b) => (b.r.totalDistanceKm || 0) - (a.r.totalDistanceKm || 0))

  if (candidates.length === 0) {
    return `Tum rotalar dengeli. Bolme onerisi yok.\n\n${routeSummary(routes, orders)}`
  }

  let text = `🔀 Bolunmesi onerilen rotalar:\n\n`
  candidates.forEach(({ r, i }) => {
    const oc = r.orderIds?.length || 0
    const km = (r.totalDistanceKm || 0).toFixed(1)
    const halfOrders = Math.ceil(oc / 2)
    const estKmAfter = (r.totalDistanceKm * 0.65).toFixed(1) // ~35% tasarruf tahmini
    text += `• Rota #${i + 1}: ${oc} siparis, ${km} km\n`
    text += `  → 2'ye bolunurse: ~${halfOrders} sip/rota, ~${estKmAfter} km/rota (est. %35 tasarruf)\n\n`
  })

  text += `💡 Dispatch'i farkli algoritma ile yeniden calistirmayi deneyin (ornegin daha kucuk batch boyutu veya daha fazla kurye).`
  return text
}

function generalSummary(orders, routes, couriers, stats) {
  const pending = orders.filter(o => o.status === 'pending' || o.status === 'new').length
  const dispatched = orders.filter(o => o.status === 'dispatched' || o.status === 'assigned').length
  const totalKm = routes.reduce((s, r) => s + (r.totalDistanceKm || 0), 0)

  let text = `📋 Operasyon Ozeti:\n`
  text += `• ${orders.length} siparis (${pending} bekliyor, ${dispatched} dagitimda)\n`
  text += `• ${routes.length} rota, toplam ${totalKm.toFixed(1)} km\n`
  text += `• ${couriers.length} kurye\n`

  if (routes.length > 0) {
    text += `• Ort. ${(orders.length / routes.length).toFixed(1)} siparis/rota\n`
    text += `• Ort. ${(totalKm / Math.max(1, orders.length)).toFixed(1)} km/siparis\n`
  }

  if (stats) {
    text += `\n📈 KPI: ${stats.totalEarning ? stats.totalEarning + ' TL kazanc' : ''}`
  }

  text += '\n\nDetay icin sorun: "Rota 3 analiz et", "En uzun rota hangisi?", "Hangi rota bolunmeli?"'
  return text
}

function useSuggestion(s) {
  message.value = s
  send()
}

async function scrollBottom() {
  await nextTick()
  if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
}
</script>

<template>
  <!-- FAB Button -->
  <button
    v-if="!isOpen"
    @click="isOpen = true"
    class="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center z-[9999] transition-transform hover:scale-110 cursor-pointer"
  >
    <MessageCircle :size="24" />
  </button>

  <!-- Chat Panel -->
  <Transition name="slide">
    <div v-if="isOpen" class="fixed bottom-6 right-6 w-[400px] h-[min(500px,calc(100vh-48px))] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-[9999] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div class="flex items-center gap-2">
          <Bot :size="20" />
          <span class="font-semibold text-sm">Bringo AI Copilot</span>
          <span v-if="copilotCtx.routes.length > 0" class="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{{ copilotCtx.routes.length }} rota</span>
        </div>
        <button @click="isOpen = false" class="hover:bg-white/20 rounded-lg p-1 cursor-pointer"><X :size="18" /></button>
      </div>

      <!-- Messages -->
      <div ref="messagesRef" class="flex-1 overflow-y-auto p-4 space-y-3">
        <!-- Empty state -->
        <div v-if="messages.length === 0" class="text-center py-6">
          <Bot :size="40" class="mx-auto text-slate-300 mb-3" />
          <p class="text-sm text-slate-500 mb-1">Operasyon hakkinda soru sorun</p>
          <p v-if="copilotCtx.orders.length > 0" class="text-xs text-slate-400 mb-3">
            {{ copilotCtx.orders.length }} siparis, {{ copilotCtx.routes.length }} rota, {{ copilotCtx.couriers.length }} kurye
          </p>
          <p v-else class="text-xs text-slate-400 mb-3">Henuz simülasyon verisi yok</p>
          <div class="space-y-2">
            <button
              v-for="s in suggestions" :key="s"
              @click="useSuggestion(s)"
              class="block w-full text-left text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >{{ s }}</button>
          </div>
        </div>

        <!-- Chat messages -->
        <div v-for="(msg, i) in messages" :key="i" :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
          <div :class="msg.role === 'user'
            ? 'bg-orange-500 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%]'"
          >
            <p class="text-sm whitespace-pre-wrap">{{ msg.text }}</p>
          </div>
        </div>

        <!-- Thinking -->
        <div v-if="loading" class="flex justify-start">
          <div class="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-2">
            <div class="flex items-center gap-2 text-sm text-slate-400">
              <span class="animate-pulse">Dusunuyor...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <form @submit.prevent="send" class="flex items-center gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
        <input
          v-model="message"
          placeholder="Bir soru sorun..."
          class="flex-1 text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/30"
          :disabled="loading"
        />
        <button type="submit" :disabled="loading || !message.trim()" class="p-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg cursor-pointer">
          <Send :size="16" />
        </button>
      </form>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }
</style>
