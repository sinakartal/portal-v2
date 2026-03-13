<script setup>
import { ref, nextTick, computed } from 'vue'
import {
  MessageCircle, X, Send, Bot, Zap, GitMerge, ArrowRightLeft,
  UserCheck, RefreshCw, Lock, HelpCircle, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Loader
} from 'lucide-vue-next'
import { useCopilotContextStore } from '@/stores/copilotContext'

const copilotCtx = useCopilotContextStore()

const isOpen = ref(false)
const message = ref('')
const loading = ref(false)
const messagesRef = ref(null)
const messages = ref([])
const pendingAction = ref(null)    // AI bir eylem önerdi, onay bekliyor
const actionLoading = ref(false)   // Eylem uygulanıyor

// ─── Suggestion chips ────────────────────────────────────────────
const suggestions = [
  'Rotaları analiz et',
  'En yüklü rotayı böl',
  'Dengesiz rotalar var mı?',
  'Rota 1 ile 2 yi birleştir',
  'En uzun rotanın kuryesini değiştir',
  'SLA riski olan siparişleri göster',
]

// ─── Action metadata ─────────────────────────────────────────────
const ACTION_META = {
  split_route:        { icon: GitMerge,       label: 'Rotayı Böl',            color: 'text-blue-600' },
  merge_routes:       { icon: GitMerge,       label: 'Rotaları Birleştir',    color: 'text-indigo-600' },
  move_order:         { icon: ArrowRightLeft,  label: 'Sipariş Taşı',         color: 'text-amber-600' },
  reassign_courier:   { icon: UserCheck,       label: 'Kurye Değiştir',       color: 'text-emerald-600' },
  reorder_waypoints:  { icon: RefreshCw,       label: 'Durakları Yeniden Sırala', color: 'text-purple-600' },
  freeze_route:       { icon: Lock,            label: 'Rotayı Kilitle',       color: 'text-slate-600' },
  explain_route:      { icon: HelpCircle,      label: 'Rota Açıklaması',      color: 'text-orange-600' },
}

// ─── Context builder ─────────────────────────────────────────────
function buildContextPayload() {
  const routes = copilotCtx.routes
  const orders = copilotCtx.orders
  const couriers = copilotCtx.couriers

  return {
    totalOrders: orders.length,
    totalRoutes: routes.length,
    totalCouriers: couriers.length,
    routes: routes.map((r, i) => ({
      index: i + 1,
      id: r.id,
      courierId: r.courierId,
      courierName: couriers.find(c => c.id === r.courierId)?.name || r.courierId,
      orderCount: r.orderIds?.length || 0,
      orderIds: r.orderIds || [],
      totalKm: parseFloat((r.totalDistanceKm || 0).toFixed(2)),
      totalTimeSec: r.totalTimeSec || 0,
      totalDeci: r.totalDeci || 0,
      kmPerOrder: parseFloat((r.kmPerOrder || 0).toFixed(2)),
      estimatedEarning: Math.round(r.estimatedEarning || 0),
      routePrice: Math.round(r.routePrice || 0),
      onTimeRate: r.onTimeRate || 0,
      isFrozen: r.isFrozen || false,
      waypointCount: r.waypoints?.length || 0,
      color: r.color,
    })),
    orders: orders.slice(0, 50).map(o => ({
      id: o.id,
      status: o.status,
      mode: o.mode,
      deci: o.deci || 0,
      originId: o.originId,
      routeId: o.routeId,
      lat: o.deliveryLocation?.lat,
      lng: o.deliveryLocation?.lng,
    })),
    couriers: couriers.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      hasCooler: c.hasCooler,
    })),
    stats: copilotCtx.stats,
    algorithms: copilotCtx.selectedAlgorithms,
  }
}

// ─── System prompt ───────────────────────────────────────────────
function buildSystemPrompt(ctx) {
  return `Sen Bringo lojistik platformunun AI operasyon asistanısın. Türkçe konuşursun.

Şu anda ${ctx.totalRoutes} rota, ${ctx.totalOrders} sipariş ve ${ctx.totalCouriers} kurye var.

ROTA VERİSİ:
${ctx.routes.map(r =>
  `Rota #${r.index} [${r.id}]: Kurye="${r.courierName || r.courierId}", ${r.orderCount} sipariş, ${r.totalKm}km, ${r.kmPerOrder}km/sip, ${r.onTimeRate}% zamanında, ${r.estimatedEarning}TL kazanç${r.isFrozen ? ' [KİLİTLİ]' : ''}`
).join('\n')}

KURYELERİ:
${ctx.couriers.map((c, i) => `Kurye ${i+1}: ${c.name} [${c.id}]${c.hasCooler ? ' (soğutmalı)' : ''}`).join('\n')}

GÖREV: Kullanıcı sorusuna yanıt ver. Eğer operasyonel bir değişiklik öneriyorsan, cevabının SONUNA şu formatta bir JSON bloğu ekle:

\`\`\`action
{
  "type": "split_route|merge_routes|move_order|reassign_courier|reorder_waypoints|freeze_route|explain_route",
  "params": { ... },
  "description": "Ne yapılacağını bir cümleyle açıkla"
}
\`\`\`

Action type'larına göre params:
- split_route: { "routeId": "route-sim-X" }
- merge_routes: { "routeId1": "route-sim-X", "routeId2": "route-sim-Y" }
- move_order: { "orderId": "...", "fromRouteId": "route-sim-X", "toRouteId": "route-sim-Y" }
- reassign_courier: { "routeId": "route-sim-X", "newCourierId": "courier-sim-Y" }
- reorder_waypoints: { "routeId": "route-sim-X" }
- freeze_route: { "routeId": "route-sim-X", "frozen": true }
- explain_route: { "routeId": "route-sim-X" }

Eğer değişiklik önermiyorsan sadece analiz yaz, JSON bloğu ekleme.
Cevapların kısa ve pratik olsun. Türkçe emoji kullanabilirsin.`
}

// ─── Anthropic API call ──────────────────────────────────────────
async function callAnthropicAPI(userMessage, ctx) {
  const systemPrompt = buildSystemPrompt(ctx)

  // Önceki mesajları history olarak gönder (son 6 mesaj)
  const history = messages.value.slice(-6).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        ...history,
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

// ─── Parse AI response for action ────────────────────────────────
function parseActionFromResponse(text) {
  const match = text.match(/```action\s*([\s\S]*?)```/)
  if (!match) return { cleanText: text, action: null }

  try {
    const action = JSON.parse(match[1].trim())
    const cleanText = text.replace(/```action[\s\S]*?```/, '').trim()
    return { cleanText, action }
  } catch {
    return { cleanText: text, action: null }
  }
}

// ─── Send message ────────────────────────────────────────────────
async function send() {
  const text = message.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', text })
  message.value = ''
  loading.value = true
  pendingAction.value = null
  scrollBottom()

  const ctx = buildContextPayload()

  try {
    const aiResponse = await callAnthropicAPI(text, ctx)
    const { cleanText, action } = parseActionFromResponse(aiResponse)

    messages.value.push({
      role: 'ai',
      text: cleanText,
      action: action || null,
    })

    if (action) {
      pendingAction.value = action
    }
  } catch (err) {
    messages.value.push({
      role: 'ai',
      text: `⚠️ AI bağlantı hatası: ${err.message}\n\nVeri mevcut: ${ctx.totalRoutes} rota, ${ctx.totalOrders} sipariş.`,
    })
  } finally {
    loading.value = false
    scrollBottom()
  }
}

// ─── Apply action ────────────────────────────────────────────────
async function applyAction(action) {
  if (!action) return
  actionLoading.value = true
  pendingAction.value = null

  try {
    const result = await copilotCtx.executeAction(action)

    if (result?.success) {
      messages.value.push({
        role: 'system',
        text: `✅ Eylem uygulandı: ${action.description || action.type}`,
      })
    } else {
      messages.value.push({
        role: 'system',
        text: `❌ Eylem başarısız: ${result?.error || 'Bilinmeyen hata'}`,
      })
    }
  } catch (err) {
    messages.value.push({
      role: 'system',
      text: `❌ Hata: ${err.message}`,
    })
  } finally {
    actionLoading.value = false
    scrollBottom()
  }
}

function rejectAction() {
  pendingAction.value = null
  messages.value.push({ role: 'system', text: '↩️ Eylem iptal edildi.' })
  scrollBottom()
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
  <!-- FAB -->
  <button
    v-if="!isOpen"
    @click="isOpen = true"
    class="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center z-[9999] transition-transform hover:scale-110 cursor-pointer"
  >
    <MessageCircle :size="24" />
  </button>

  <!-- Panel -->
  <Transition name="slide">
    <div v-if="isOpen"
      class="fixed bottom-6 right-6 w-[420px] h-[min(580px,calc(100vh-48px))] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-[9999] overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex-shrink-0">
        <div class="flex items-center gap-2">
          <Bot :size="20" />
          <span class="font-semibold text-sm">Bringo AI Copilot</span>
          <span v-if="copilotCtx.routes.length > 0"
            class="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
            {{ copilotCtx.routes.length }} rota · {{ copilotCtx.orders.length }} sipariş
          </span>
        </div>
        <button @click="isOpen = false" class="hover:bg-white/20 rounded-lg p-1 cursor-pointer">
          <X :size="18" />
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesRef" class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">

        <!-- Empty state -->
        <div v-if="messages.length === 0" class="text-center py-4">
          <Bot :size="36" class="mx-auto text-slate-300 mb-2" />
          <p class="text-sm text-slate-500 mb-1 font-medium">Operasyona müdahale edebilirsiniz</p>
          <p class="text-xs text-slate-400 mb-4">
            <span v-if="copilotCtx.routes.length > 0">
              {{ copilotCtx.routes.length }} rota hazır — soru sorun veya değişiklik isteyin
            </span>
            <span v-else>Algoritma sekmesinden sipariş üretip dispatch edin</span>
          </p>
          <div class="space-y-1.5">
            <button
              v-for="s in suggestions" :key="s"
              @click="useSuggestion(s)"
              class="block w-full text-left text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-orange-800"
            >{{ s }}</button>
          </div>
        </div>

        <!-- Messages -->
        <template v-for="(msg, i) in messages" :key="i">

          <!-- User message -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="bg-orange-500 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[85%]">
              <p class="text-sm">{{ msg.text }}</p>
            </div>
          </div>

          <!-- AI message -->
          <div v-else-if="msg.role === 'ai'" class="flex justify-start flex-col gap-2">
            <div class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%]">
              <p class="text-sm whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>

              <!-- Inline action suggestion (from this specific message) -->
              <div v-if="msg.action && pendingAction === msg.action"
                class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                <div class="flex items-center gap-2 mb-2">
                  <component :is="ACTION_META[msg.action.type]?.icon || Zap" :size="14"
                    :class="ACTION_META[msg.action.type]?.color || 'text-orange-500'" />
                  <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {{ ACTION_META[msg.action.type]?.label || msg.action.type }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-2 italic">
                  {{ msg.action.description }}
                </p>
                <div class="flex gap-2">
                  <button
                    @click="applyAction(msg.action)"
                    :disabled="actionLoading"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg cursor-pointer disabled:opacity-50 transition-colors">
                    <Loader v-if="actionLoading" :size="11" class="animate-spin" />
                    <CheckCircle v-else :size="11" />
                    Uygula
                  </button>
                  <button
                    @click="rejectAction"
                    class="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-lg cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- System message (action result) -->
          <div v-else-if="msg.role === 'system'" class="flex justify-center">
            <div class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              :class="msg.text.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : msg.text.startsWith('❌') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'">
              {{ msg.text }}
            </div>
          </div>
        </template>

        <!-- Thinking indicator -->
        <div v-if="loading" class="flex justify-start">
          <div class="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style="animation-delay:0ms" />
                <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style="animation-delay:150ms" />
                <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style="animation-delay:300ms" />
              </div>
              <span class="text-xs text-slate-400">Analiz ediliyor...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="flex items-center gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
        <input
          v-model="message"
          @keydown.enter.prevent="send"
          placeholder="Rotayı böl, siparişi taşı, analiz et..."
          class="flex-1 text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
          :disabled="loading"
        />
        <button
          @click="send"
          :disabled="loading || !message.trim()"
          class="p-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg cursor-pointer transition-colors">
          <Send :size="16" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }
</style>
