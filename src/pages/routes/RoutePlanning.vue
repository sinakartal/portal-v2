<template>
  <div :class="['flex h-screen overflow-hidden', dark ? 'bg-slate-900' : 'bg-slate-50']">

    <!-- Drag Hint Tooltip -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDragHint"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          @click="dismissDragHint"
        >
          <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center" @click.stop>
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <GripVertical class="w-8 h-8 text-blue-500" />
            </div>
            <h3 class="text-lg font-bold text-slate-800 mb-2">Surukle ve Birak</h3>
            <p class="text-sm text-slate-500 mb-4">
              Soldaki siparislere tiklayarak rotaya ekleyebilirsiniz.
              Sag paneldeki ok tuslarini kullanarak siralama degistirebilirsiniz.
            </p>
            <button
              @click="dismissDragHint"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Anladim
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- AI Auto-Plan Preview Modal -->
    <Teleport to="body">
      <div
        v-if="showAiPreview"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="showAiPreview = false"
      >
        <div :class="['rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden', dark ? 'bg-slate-800' : 'bg-white']">
          <div :class="['flex items-center justify-between px-6 py-4 border-b', dark ? 'border-slate-700' : 'border-slate-200']">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles class="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 :class="['text-lg font-bold', dark ? 'text-white' : 'text-slate-800']">AI Rota Onizleme</h2>
                <p :class="['text-xs', dark ? 'text-slate-400' : 'text-slate-500']">Otomatik olarak olusturulan rota plani</p>
              </div>
            </div>
            <button @click="showAiPreview = false" :class="['p-2 rounded-lg cursor-pointer', dark ? 'hover:bg-slate-700' : 'hover:bg-slate-100']">
              <X class="w-5 h-5" :class="dark ? 'text-slate-400' : 'text-slate-500'" />
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[55vh]">
            <div v-if="aiLoading" class="flex flex-col items-center py-8">
              <div class="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mb-4" />
              <p :class="['text-sm font-medium', dark ? 'text-slate-300' : 'text-slate-600']">AI rota hesapliyor...</p>
              <p :class="['text-xs mt-1', dark ? 'text-slate-500' : 'text-slate-400']">Tum siparisler analiz ediliyor</p>
            </div>
            <template v-else>
              <!-- Preview stats -->
              <div class="grid grid-cols-3 gap-3 mb-5">
                <div :class="['rounded-xl p-3 text-center', dark ? 'bg-slate-750' : 'bg-slate-50']">
                  <p :class="['text-lg font-bold', dark ? 'text-white' : 'text-slate-800']">{{ aiPreviewData.stops }}</p>
                  <p :class="['text-[10px]', dark ? 'text-slate-400' : 'text-slate-500']">Durak</p>
                </div>
                <div :class="['rounded-xl p-3 text-center', dark ? 'bg-slate-750' : 'bg-slate-50']">
                  <p :class="['text-lg font-bold', dark ? 'text-white' : 'text-slate-800']">{{ aiPreviewData.distance }} km</p>
                  <p :class="['text-[10px]', dark ? 'text-slate-400' : 'text-slate-500']">Mesafe</p>
                </div>
                <div :class="['rounded-xl p-3 text-center', dark ? 'bg-slate-750' : 'bg-slate-50']">
                  <p :class="['text-lg font-bold', dark ? 'text-white' : 'text-slate-800']">~{{ aiPreviewData.time }} dk</p>
                  <p :class="['text-[10px]', dark ? 'text-slate-400' : 'text-slate-500']">Tahmini Sure</p>
                </div>
              </div>
              <!-- Preview order list -->
              <h4 :class="['text-xs font-semibold uppercase tracking-wider mb-2', dark ? 'text-slate-400' : 'text-slate-500']">Onerilen Siralama</h4>
              <div class="space-y-1.5">
                <div
                  v-for="(order, idx) in aiPreviewOrders"
                  :key="order.id"
                  :class="['flex items-center gap-2.5 p-2 rounded-lg', dark ? 'bg-slate-750' : 'bg-slate-50']"
                >
                  <span :class="['w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-purple-500 text-white']">{{ idx + 1 }}</span>
                  <div class="flex-1 min-w-0">
                    <p :class="['text-xs font-medium truncate', dark ? 'text-slate-200' : 'text-slate-700']">{{ order.id }} - {{ order.customer }}</p>
                    <p :class="['text-[10px] truncate', dark ? 'text-slate-500' : 'text-slate-400']">{{ order.district }}</p>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-if="!aiLoading" :class="['flex gap-3 px-6 py-4 border-t', dark ? 'border-slate-700' : 'border-slate-200']">
            <button
              @click="showAiPreview = false"
              :class="['flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer', dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50']"
            >
              Iptal
            </button>
            <button
              @click="confirmAiPlan"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition-all cursor-pointer shadow-sm"
            >
              Onayla ve Uygula
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== LEFT PANEL: UNASSIGNED ORDERS ===== -->
    <div :class="['w-72 flex-shrink-0 border-r flex flex-col', dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200']">
      <!-- Header -->
      <div :class="['px-4 py-3 border-b', dark ? 'border-slate-700' : 'border-slate-200']">
        <div class="flex items-center justify-between">
          <h2 :class="['text-sm font-semibold', dark ? 'text-slate-100' : 'text-slate-800']">Atanmamis Siparisler</h2>
          <span class="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            {{ filteredUnassigned.length }}
          </span>
        </div>
        <!-- Compact mode toggle -->
        <div class="flex items-center gap-2 mt-2">
          <button
            @click="compactMode = !compactMode"
            :class="['flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium cursor-pointer transition-colors', compactMode ? 'bg-blue-100 text-blue-700' : (dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')]"
          >
            <AlignJustify class="w-3 h-3" />
            {{ compactMode ? 'Kompakt' : 'Detayli' }}
          </button>
          <!-- Dark mode toggle -->
          <button
            @click="dark = !dark"
            :class="['flex items-center gap-1 px-2 py-1 rounded text-[10px] cursor-pointer transition-colors', dark ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-500']"
          >
            <Moon v-if="!dark" class="w-3 h-3" />
            <Sun v-else class="w-3 h-3" />
          </button>
        </div>
      </div>

      <!-- Search -->
      <div :class="['px-3 py-2 border-b', dark ? 'border-slate-700' : 'border-slate-100']">
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Siparis, musteri, bolge..."
            v-model="searchTerm"
            :class="['w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors', dark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200']"
          />
        </div>
      </div>

      <!-- Filters -->
      <div :class="['px-3 py-2 border-b flex gap-2', dark ? 'border-slate-700' : 'border-slate-100']">
        <div class="relative flex-1">
          <select
            v-model="filterDistrict"
            :class="['w-full appearance-none pl-2 pr-6 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer', dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-slate-50 border-slate-200']"
          >
            <option value="">Bolge</option>
            <option v-for="d in availableDistricts" :key="d" :value="d">{{ d }}</option>
          </select>
          <Filter class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
        <div class="relative flex-1">
          <select
            v-model="filterPriority"
            :class="['w-full appearance-none pl-2 pr-6 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer', dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-slate-50 border-slate-200']"
          >
            <option value="">Oncelik</option>
            <option value="normal">Normal</option>
            <option value="yuksek">Yuksek</option>
            <option value="acil">Acil</option>
          </select>
          <Filter class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <!-- Skeleton Loading for orders -->
      <template v-if="loading">
        <div class="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          <div v-for="n in 6" :key="n" :class="['rounded-lg p-2.5 animate-pulse', dark ? 'bg-slate-700' : 'bg-slate-100']">
            <div class="flex items-start gap-2">
              <div :class="['w-3.5 h-10 rounded', dark ? 'bg-slate-600' : 'bg-slate-200']" />
              <div class="flex-1 space-y-1.5">
                <div :class="['h-3 w-20 rounded', dark ? 'bg-slate-600' : 'bg-slate-200']" />
                <div :class="['h-3 w-32 rounded', dark ? 'bg-slate-600' : 'bg-slate-200']" />
                <div :class="['h-3 w-24 rounded', dark ? 'bg-slate-600' : 'bg-slate-200']" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Order Cards -->
      <template v-else>
        <div class="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          <div v-if="filteredUnassigned.length === 0" :class="['text-center py-8 text-xs', dark ? 'text-slate-500' : 'text-slate-400']">
            <Package class="w-8 h-8 mx-auto mb-2 opacity-40" />
            Siparis bulunamadi
          </div>

          <!-- COMPACT MODE -->
          <template v-if="compactMode">
            <div
              v-for="order in filteredUnassigned"
              :key="order.id"
              @click="addToRoute(order.id)"
              :class="[
                'group flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 border',
                dark ? 'border-slate-600 bg-slate-750 hover:border-blue-500/50' : 'border-slate-150 bg-white hover:border-blue-300 hover:shadow-sm'
              ]"
            >
              <span :class="['text-xs font-semibold flex-shrink-0', dark ? 'text-slate-200' : 'text-slate-700']">{{ order.id }}</span>
              <span :class="['text-xs truncate flex-1', dark ? 'text-slate-400' : 'text-slate-500']">{{ order.customer }}</span>
              <span :class="['text-[10px] flex-shrink-0', dark ? 'text-slate-500' : 'text-slate-400']">{{ order.district }}</span>
              <span :class="['w-2 h-2 rounded-full flex-shrink-0', PRIORITY_CONFIG[order.priority].dot]" :title="PRIORITY_CONFIG[order.priority].label" />
              <div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <div class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <Plus class="w-3 h-3" />
                </div>
              </div>
            </div>
          </template>

          <!-- DETAILED MODE (original) -->
          <template v-else>
            <div
              v-for="order in filteredUnassigned"
              :key="order.id"
              @click="addToRoute(order.id)"
              :class="[
                'group relative rounded-lg border p-2.5 cursor-pointer transition-all duration-150',
                dark ? 'border-slate-600 bg-slate-750 hover:border-blue-500/50' : 'border-slate-150 bg-white hover:border-blue-300 hover:shadow-sm'
              ]"
            >
              <div class="flex items-start gap-2">
                <GripVertical :class="['w-3.5 h-3.5 mt-0.5 flex-shrink-0', dark ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-400']" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span :class="['text-xs font-semibold', dark ? 'text-slate-200' : 'text-slate-700']">{{ order.id }}</span>
                    <span :class="['inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', PRIORITY_CONFIG[order.priority].bg, PRIORITY_CONFIG[order.priority].text]">
                      <span :class="['w-1.5 h-1.5 rounded-full', PRIORITY_CONFIG[order.priority].dot]" />
                      {{ PRIORITY_CONFIG[order.priority].label }}
                    </span>
                  </div>
                  <p :class="['text-xs truncate', dark ? 'text-slate-300' : 'text-slate-600']">{{ order.customer }}</p>
                  <div class="flex items-center justify-between mt-1">
                    <span :class="['flex items-center gap-1 text-[11px]', dark ? 'text-slate-500' : 'text-slate-400']">
                      <MapPin class="w-3 h-3" />
                      {{ order.district }}
                    </span>
                    <span :class="['text-xs font-medium', dark ? 'text-slate-300' : 'text-slate-700']">{{ order.amount }} &#8378;</span>
                  </div>
                </div>
              </div>
              <!-- Hover add button -->
              <div class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                  <Plus class="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- Bottom count -->
      <div :class="['px-4 py-2.5 border-t', dark ? 'border-slate-700 bg-slate-750' : 'border-slate-200 bg-slate-50']">
        <div :class="['flex items-center justify-between text-xs', dark ? 'text-slate-400' : 'text-slate-500']">
          <span>Toplam</span>
          <span :class="['font-semibold', dark ? 'text-slate-200' : 'text-slate-700']">{{ filteredUnassigned.length }} siparis</span>
        </div>
      </div>
    </div>

    <!-- ===== CENTER PANEL: MAP SIMULATION ===== -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Skeleton Loading for map -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center" :class="dark ? 'bg-slate-900' : 'bg-slate-50'">
        <div class="text-center">
          <div :class="['w-16 h-16 rounded-full border-4 border-t-blue-500 animate-spin mx-auto mb-4', dark ? 'border-slate-700' : 'border-slate-200']" />
          <p :class="['text-sm font-medium', dark ? 'text-slate-400' : 'text-slate-500']">Harita yukleniyor...</p>
        </div>
      </div>

      <template v-else>
        <!-- Map grid background -->
        <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" :stroke="dark ? '#1e293b' : '#e2e8f0'" stroke-width="0.5" />
            </pattern>
            <pattern id="gridLg" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 200 0 L 0 0 0 200" fill="none" :stroke="dark ? '#334155' : '#cbd5e1'" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" :fill="dark ? '#0f172a' : '#f8fafc'" />
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#gridLg)" />

          <!-- Route polyline -->
          <polyline
            v-if="layerRoute && routeOrders.length > 1"
            :points="routeOrders.map(o => `${o.mapX},${o.mapY}`).join(' ')"
            fill="none"
            stroke="#3b82f6"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="8 4"
            opacity="0.7"
          />

          <!-- Unassigned pins -->
          <template v-if="layerPins">
            <g
              v-for="order in orders.filter(o => !routeOrderIds.includes(o.id))"
              :key="order.id"
              @click="addToRoute(order.id)"
              class="cursor-pointer"
            >
              <circle :cx="order.mapX" :cy="order.mapY" r="10" fill="#ef4444" opacity="0.15" />
              <circle :cx="order.mapX" :cy="order.mapY" r="6" fill="#ef4444" stroke="#fff" stroke-width="1.5" />
            </g>
          </template>

          <!-- Route pins (blue, numbered) -->
          <template v-if="layerPins">
            <g v-for="(order, i) in routeOrders" :key="order.id">
              <circle :cx="order.mapX" :cy="order.mapY" r="14" fill="#3b82f6" opacity="0.15" />
              <circle :cx="order.mapX" :cy="order.mapY" r="10" fill="#3b82f6" stroke="#fff" stroke-width="2" />
              <text :x="order.mapX" :y="order.mapY + 4" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">
                {{ i + 1 }}
              </text>
            </g>
          </template>

          <!-- Courier marker -->
          <g v-if="layerCourier && routeOrders.length > 0">
            <circle :cx="courierPos.x" :cy="courierPos.y" r="20" fill="#8b5cf6" opacity="0.12">
              <animate attributeName="r" values="18;24;18" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle :cx="courierPos.x" :cy="courierPos.y" r="8" fill="#8b5cf6" stroke="#fff" stroke-width="2.5" />
            <polygon
              :points="`${courierPos.x},${courierPos.y - 14} ${courierPos.x - 5},${courierPos.y - 6} ${courierPos.x + 5},${courierPos.y - 6}`"
              fill="#8b5cf6"
              stroke="#fff"
              stroke-width="1"
            />
          </g>
        </svg>

        <!-- Layer toggles -->
        <div class="absolute top-3 right-3 z-10">
          <button
            @click="showLayers = !showLayers"
            :class="['w-9 h-9 rounded-lg shadow-md border flex items-center justify-center transition-colors', dark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50']"
          >
            <Layers class="w-4 h-4" />
          </button>
          <div v-if="showLayers" :class="['absolute right-0 mt-1.5 w-44 rounded-lg shadow-lg border p-2 space-y-1', dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200']">
            <label :class="['flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs', dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50']">
              <input type="checkbox" v-model="layerPins" class="rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
              Siparis Pinleri
            </label>
            <label :class="['flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs', dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50']">
              <input type="checkbox" v-model="layerRoute" class="rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
              Rota Cizgisi
            </label>
            <label :class="['flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs', dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50']">
              <input type="checkbox" v-model="layerCourier" class="rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
              Kurye Konumu
            </label>
          </div>
        </div>

        <!-- AI Auto-Plan Button (prominent, top-center) -->
        <div class="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <button
            @click="handleAiAutoPlan"
            :disabled="unassignedOrders.length === 0"
            class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles class="w-4 h-4" />
            AI ile Otomatik Planla
          </button>
        </div>

        <!-- Route stats overlay -->
        <div class="absolute bottom-4 left-4 z-10">
          <div :class="['backdrop-blur-sm rounded-xl shadow-lg border p-4', dark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200']">
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', dark ? 'bg-blue-900/50' : 'bg-blue-50']">
                  <RouteIcon class="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p :class="['text-[10px] uppercase tracking-wider', dark ? 'text-slate-500' : 'text-slate-400']">Mesafe</p>
                  <p :class="['text-sm font-bold', dark ? 'text-white' : 'text-slate-800']">{{ totalDistance }} km</p>
                </div>
              </div>
              <div :class="['w-px h-8', dark ? 'bg-slate-700' : 'bg-slate-200']" />
              <div class="flex items-center gap-2">
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', dark ? 'bg-amber-900/50' : 'bg-amber-50']">
                  <Clock class="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p :class="['text-[10px] uppercase tracking-wider', dark ? 'text-slate-500' : 'text-slate-400']">OSRM Sure</p>
                  <p :class="['text-sm font-bold', dark ? 'text-white' : 'text-slate-800']">~{{ osrmTime }} dk</p>
                </div>
              </div>
              <div :class="['w-px h-8', dark ? 'bg-slate-700' : 'bg-slate-200']" />
              <div class="flex items-center gap-2">
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', dark ? 'bg-emerald-900/50' : 'bg-emerald-50']">
                  <MapPin class="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p :class="['text-[10px] uppercase tracking-wider', dark ? 'text-slate-500' : 'text-slate-400']">Durak</p>
                  <p :class="['text-sm font-bold', dark ? 'text-white' : 'text-slate-800']">{{ routeOrders.length }}</p>
                </div>
              </div>
              <div :class="['w-px h-8', dark ? 'bg-slate-700' : 'bg-slate-200']" />
              <button
                @click="handleOptimize"
                :disabled="optimizing || routeOrders.length < 2"
                class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <template v-if="optimizing">
                  <RotateCw class="w-3.5 h-3.5 animate-spin" />
                  Optimize Ediliyor...
                </template>
                <template v-else>
                  <Zap class="w-3.5 h-3.5" />
                  Optimize Et
                </template>
              </button>
            </div>
          </div>
        </div>

        <!-- Legend overlay -->
        <div :class="['absolute top-3 left-3 z-10 backdrop-blur-sm rounded-lg shadow border px-3 py-2', dark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200']">
          <div :class="['flex items-center gap-4 text-[11px]', dark ? 'text-slate-400' : 'text-slate-500']">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-red-500" />
              Atanmamis
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-blue-500" />
              Rotada
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-purple-500" />
              Kurye
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ===== RIGHT PANEL: ROUTE DETAIL (Accordion) ===== -->
    <div :class="['w-80 flex-shrink-0 border-l flex flex-col', dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200']">
      <!-- Header -->
      <div :class="['px-4 py-3 border-b', dark ? 'border-slate-700' : 'border-slate-200']">
        <div class="flex items-center gap-2">
          <Navigation :class="['w-4 h-4', dark ? 'text-blue-400' : 'text-blue-600']" />
          <h2 :class="['text-sm font-semibold', dark ? 'text-slate-100' : 'text-slate-800']">Rota Detay</h2>
        </div>
      </div>

      <!-- Courier selector -->
      <div :class="['px-4 py-3 border-b space-y-2', dark ? 'border-slate-700' : 'border-slate-100']">
        <label :class="['text-[11px] font-medium uppercase tracking-wider', dark ? 'text-slate-400' : 'text-slate-500']">Kurye</label>
        <select
          v-model="selectedCourier"
          :class="['w-full appearance-none px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer', dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-slate-50 border-slate-200']"
        >
          <option v-for="name in COURIER_NAMES" :key="name" :value="name">{{ name }}</option>
        </select>
        <div :class="['flex items-center gap-2 text-xs', dark ? 'text-slate-400' : 'text-slate-500']">
          <Truck class="w-3.5 h-3.5" />
          <span>{{ VEHICLE_TYPES[selectedCourier] || 'Motosiklet' }}</span>
        </div>
      </div>

      <!-- Route Accordion Header -->
      <div
        @click="accordionOpen = !accordionOpen"
        :class="['px-4 py-3 border-b flex items-center justify-between cursor-pointer transition-colors', dark ? 'border-slate-700 hover:bg-slate-750' : 'border-slate-100 hover:bg-slate-50']"
      >
        <div class="flex items-center gap-3">
          <span :class="['text-[11px] font-medium uppercase tracking-wider', dark ? 'text-slate-400' : 'text-slate-500']">Duraklar</span>
          <span :class="['text-[11px] font-semibold px-1.5 py-0.5 rounded', dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600']">{{ routeOrders.length }} durak</span>
          <span v-if="routeOrders.length > 0" :class="['text-[10px]', dark ? 'text-slate-500' : 'text-slate-400']">~{{ osrmTime }} dk</span>
        </div>
        <ChevronDown :class="['w-4 h-4 transition-transform', accordionOpen ? 'rotate-180' : '', dark ? 'text-slate-400' : 'text-slate-500']" />
      </div>

      <!-- Stops list (collapsible accordion body) -->
      <div v-show="accordionOpen" class="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <!-- Skeleton for route stops -->
        <template v-if="loading">
          <div v-for="n in 4" :key="n" :class="['rounded-lg p-2.5 animate-pulse', dark ? 'bg-slate-700' : 'bg-slate-100']">
            <div class="flex items-start gap-2">
              <div :class="['w-5 h-5 rounded-full', dark ? 'bg-slate-600' : 'bg-slate-200']" />
              <div class="flex-1 space-y-1">
                <div :class="['h-3 w-24 rounded', dark ? 'bg-slate-600' : 'bg-slate-200']" />
                <div :class="['h-3 w-32 rounded', dark ? 'bg-slate-600' : 'bg-slate-200']" />
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-if="routeOrders.length === 0" :class="['text-center py-12 text-xs', dark ? 'text-slate-500' : 'text-slate-400']">
            <Navigation class="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Henuz durak eklenmedi.</p>
            <p :class="['mt-1', dark ? 'text-slate-600' : 'text-slate-300']">Soldan siparis ekleyin</p>
          </div>
          <div
            v-for="(order, index) in routeOrders"
            :key="order.id"
            :class="[
              'relative rounded-lg border p-2.5 transition-all duration-150',
              stopStatuses[order.id] === 'active'
                ? 'border-blue-300 bg-blue-50/50 shadow-sm'
                : stopStatuses[order.id] === 'completed'
                ? 'border-emerald-200 bg-emerald-50/30'
                : (dark ? 'border-slate-600 bg-slate-750 hover:border-slate-500' : 'border-slate-150 bg-white hover:border-slate-300')
            ]"
          >
            <div class="flex items-start gap-2">
              <div class="flex flex-col items-center gap-1 pt-0.5">
                <GripVertical :class="['w-3.5 h-3.5', dark ? 'text-slate-500' : 'text-slate-300']" />
                <div :class="[
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  stopStatuses[order.id] === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : stopStatuses[order.id] === 'active'
                    ? 'bg-blue-500 text-white'
                    : (dark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600')
                ]">
                  {{ index + 1 }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-0.5">
                  <div class="flex items-center gap-1.5">
                    <span v-if="stopStatuses[order.id] === 'completed'" class="text-emerald-500 font-bold text-sm">&#10003;</span>
                    <span v-else-if="stopStatuses[order.id] === 'active'" class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse" />
                    <span v-else :class="['w-2.5 h-2.5 rounded-full border-2 inline-block', dark ? 'border-slate-500' : 'border-slate-300']" />
                    <span :class="['text-xs font-semibold', dark ? 'text-slate-200' : 'text-slate-700']">{{ order.id }}</span>
                  </div>
                  <span :class="['text-[10px] flex items-center gap-0.5', dark ? 'text-slate-500' : 'text-slate-400']">
                    <Clock class="w-3 h-3" />
                    {{ getEta(index) }}
                  </span>
                </div>
                <p :class="['text-xs truncate', dark ? 'text-slate-300' : 'text-slate-600']">{{ order.customer }}</p>
                <p :class="['text-[11px] truncate mt-0.5', dark ? 'text-slate-500' : 'text-slate-400']">{{ order.address }}, {{ order.district }}</p>
              </div>
              <div class="flex flex-col gap-0.5 ml-1">
                <button
                  @click="moveStop(index, -1)"
                  :disabled="index === 0"
                  :class="['w-5 h-5 rounded flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors', dark ? 'text-slate-400 hover:bg-slate-600 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600']"
                >
                  <ChevronUp class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="moveStop(index, 1)"
                  :disabled="index === routeOrders.length - 1"
                  :class="['w-5 h-5 rounded flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors', dark ? 'text-slate-400 hover:bg-slate-600 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600']"
                >
                  <ChevronDown class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="removeFromRoute(order.id)"
                  :class="['w-5 h-5 rounded flex items-center justify-center transition-colors', dark ? 'text-slate-400 hover:bg-red-900/30 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500']"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Route summary -->
      <div :class="['px-4 py-3 border-t space-y-3', dark ? 'border-slate-700 bg-slate-750' : 'border-slate-200 bg-slate-50']">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <p :class="['text-[10px] uppercase', dark ? 'text-slate-500' : 'text-slate-400']">Mesafe</p>
            <p :class="['text-sm font-bold', dark ? 'text-slate-200' : 'text-slate-700']">{{ totalDistance }} km</p>
          </div>
          <div>
            <p :class="['text-[10px] uppercase', dark ? 'text-slate-500' : 'text-slate-400']">OSRM Sure</p>
            <p :class="['text-sm font-bold', dark ? 'text-slate-200' : 'text-slate-700']">~{{ osrmTime }} dk</p>
          </div>
          <div>
            <p :class="['text-[10px] uppercase', dark ? 'text-slate-500' : 'text-slate-400']">Durak</p>
            <p :class="['text-sm font-bold', dark ? 'text-slate-200' : 'text-slate-700']">{{ routeOrders.length }}</p>
          </div>
        </div>

        <!-- Before/After Comparison -->
        <div v-if="optimized && routeOrders.length > 1" class="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
          <div class="flex items-center gap-1.5 mb-2">
            <Zap class="w-3.5 h-3.5 text-emerald-600" />
            <span class="text-[11px] font-semibold text-emerald-700">Optimizasyon Sonucu</span>
          </div>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-500">Mesafe</span>
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400 line-through">{{ preOptDistance }} km</span>
                <ArrowRight class="w-3 h-3 text-emerald-500" />
                <span class="font-semibold text-emerald-700">{{ totalDistance }} km</span>
              </div>
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-500">Sure</span>
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400 line-through">{{ preOptTimeStr }}</span>
                <ArrowRight class="w-3 h-3 text-emerald-500" />
                <span class="font-semibold text-emerald-700">{{ timeStr }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-200">
              <span class="text-emerald-600 font-medium">Tasarruf</span>
              <span class="font-bold text-emerald-700">%26 iyilesme</span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2">
          <button
            @click="clearRoute"
            :class="['flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg transition-colors', dark ? 'border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300']"
          >
            <Trash2 class="w-3.5 h-3.5" />
            Temizle
          </button>
          <button class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 shadow-sm transition-all">
            <Save class="w-3.5 h-3.5" />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Search,
  Filter,
  GripVertical,
  Plus,
  Minus,
  MapPin,
  Navigation,
  Clock,
  Package,
  Truck,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Trash2,
  Save,
  Layers,
  Zap,
  ArrowRight,
  X,
  Route as RouteIcon,
  Moon,
  Sun,
  AlignJustify,
  Sparkles,
} from 'lucide-vue-next'
import { getOrders, getRoutes } from '@/services/api'

// --- Constants ---
const COURIER_NAMES = [
  'Ahmet Yilmaz', 'Mehmet Demir', 'Ali Kaya', 'Hasan Celik', 'Huseyin Sahin',
  'Murat Ozturk', 'Ibrahim Arslan', 'Mustafa Dogan', 'Emre Kilic', 'Osman Aydin',
  'Burak Yildiz', 'Serkan Koc', 'Fatih Erdogan', 'Kadir Ozkan', 'Cem Aksoy',
]

const VEHICLE_TYPES = {
  'Ahmet Yilmaz': 'Motosiklet',
  'Mehmet Demir': 'Minivan',
  'Ali Kaya': 'Motosiklet',
  'Hasan Celik': 'Kamyonet',
  'Huseyin Sahin': 'Motosiklet',
  'Murat Ozturk': 'Minivan',
  'Ibrahim Arslan': 'Motosiklet',
  'Mustafa Dogan': 'Kamyonet',
  'Emre Kilic': 'Motosiklet',
  'Osman Aydin': 'Minivan',
  'Burak Yildiz': 'Motosiklet',
  'Serkan Koc': 'Kamyonet',
  'Fatih Erdogan': 'Motosiklet',
  'Kadir Ozkan': 'Minivan',
  'Cem Aksoy': 'Motosiklet',
}

const PRIORITY_CONFIG = {
  normal: { label: 'Normal', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  yuksek: { label: 'Yuksek', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  acil: { label: 'Acil', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
}

const DRAG_HINT_KEY = 'bringo_route_planning_drag_hint_shown'

// --- State ---
const orders = ref([])
const routeOrderIds = ref([])
const searchTerm = ref('')
const filterDistrict = ref('')
const filterPriority = ref('')
const selectedCourier = ref(COURIER_NAMES[0])
const optimizing = ref(false)
const optimized = ref(false)
const showLayers = ref(false)
const layerPins = ref(true)
const layerRoute = ref(true)
const layerCourier = ref(true)
const loading = ref(false)
const error = ref(null)
const stopStatuses = ref({})

// New features state
const dark = ref(false)
const compactMode = ref(false)
const accordionOpen = ref(true)
const showDragHint = ref(false)
const showAiPreview = ref(false)
const aiLoading = ref(false)
const aiPreviewOrders = ref([])
const aiPreviewData = ref({ stops: 0, distance: '0.0', time: 0 })

// --- Load data from API ---
onMounted(async () => {
  // Check if drag hint should be shown
  if (!localStorage.getItem(DRAG_HINT_KEY)) {
    showDragHint.value = true
  }

  loading.value = true
  error.value = null
  try {
    const [ordersRes, routesRes] = await Promise.all([getOrders(), getRoutes()])
    if (ordersRes.ok) {
      const raw = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.orders || []
      orders.value = raw.map((o, i) => ({
        ...o,
        id: o.id || o.externalOrderId || `SIP-${String(1000 + i).padStart(4, '0')}`,
        customer: o.customer || o.customerName || '',
        district: o.district || o.zone || '',
        address: o.address || '',
        amount: o.amount || o.price || 0,
        priority: o.priority || 'normal',
        mapX: o.mapX || (80 + Math.random() * 640),
        mapY: o.mapY || (40 + Math.random() * 340),
      }))
    } else {
      error.value = 'Siparisler yuklenemedi'
    }
    if (routesRes.ok) {
      const routes = Array.isArray(routesRes.data) ? routesRes.data : routesRes.data?.routes || []
      if (routes.length > 0) {
        const firstRoute = routes[0]
        const ids = firstRoute.stops?.map(s => s.orderId || s.id) || firstRoute.orderIds || []
        routeOrderIds.value = ids
        const statuses = {}
        ids.forEach((id, i) => {
          if (i < 2) statuses[id] = 'completed'
          else if (i === 2) statuses[id] = 'active'
          else statuses[id] = 'pending'
        })
        stopStatuses.value = statuses
      }
    }
  } catch (e) {
    error.value = e.message || 'Veri yuklenirken hata olustu'
  } finally {
    loading.value = false
  }
})

// --- Derived ---
const routeOrders = computed(() => routeOrderIds.value.map((id) => orders.value.find((o) => o.id === id)).filter(Boolean))
const unassignedOrders = computed(() => orders.value.filter((o) => !routeOrderIds.value.includes(o.id)))

const filteredUnassigned = computed(() => {
  return unassignedOrders.value.filter((o) => {
    const matchSearch =
      !searchTerm.value ||
      o.id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      o.district.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchDistrict = !filterDistrict.value || o.district === filterDistrict.value
    const matchPriority = !filterPriority.value || o.priority === filterPriority.value
    return matchSearch && matchDistrict && matchPriority
  })
})

const availableDistricts = computed(() => [...new Set(unassignedOrders.value.map((o) => o.district))].sort())

// Stats
const baseDistance = 12.5
const baseTime = 105
const distancePerStop = 1.6
const timePerStop = 13

const totalDistance = computed(() => {
  return routeOrders.value.length > 0 ? (baseDistance + (routeOrders.value.length - 8) * distancePerStop).toFixed(1) : '0.0'
})
const totalMinutes = computed(() => {
  return routeOrders.value.length > 0 ? baseTime + (routeOrders.value.length - 8) * timePerStop : 0
})
const timeStr = computed(() => {
  const totalHours = Math.floor(totalMinutes.value / 60)
  const totalMins = totalMinutes.value % 60
  return totalHours > 0 ? `${totalHours}s ${Math.abs(totalMins)}dk` : `${totalMins}dk`
})

// OSRM estimated time (simulated with a realistic multiplier)
const osrmTime = computed(() => {
  if (routeOrders.value.length === 0) return 0
  // Simulate OSRM: ~4 min per stop + 5 min base
  return Math.round(routeOrders.value.length * 4.2 + 5)
})

// Optimization comparison
const preOptDistance = computed(() => (parseFloat(totalDistance.value) * 1.35).toFixed(1))
const preOptTime = computed(() => Math.round(totalMinutes.value * 1.35))
const preOptTimeStr = computed(() => {
  const preOptHours = Math.floor(preOptTime.value / 60)
  const preOptMins = preOptTime.value % 60
  return preOptHours > 0 ? `${preOptHours}s ${preOptMins}dk` : `${preOptMins}dk`
})

// Courier position
const courierPos = computed(() => {
  return routeOrders.value.length > 2 ? { x: routeOrders.value[2].mapX, y: routeOrders.value[2].mapY } : { x: 400, y: 200 }
})

// --- Drag hint ---
function dismissDragHint() {
  showDragHint.value = false
  localStorage.setItem(DRAG_HINT_KEY, 'true')
}

// --- AI Auto-Plan ---
function handleAiAutoPlan() {
  showAiPreview.value = true
  aiLoading.value = true

  // Simulate AI planning
  setTimeout(() => {
    const available = [...unassignedOrders.value]
    // Sort by priority (acil first, then yuksek, then normal) then by district grouping
    const priorityOrder = { acil: 0, yuksek: 1, normal: 2 }
    available.sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
      if (pDiff !== 0) return pDiff
      return a.district.localeCompare(b.district)
    })

    const selected = available.slice(0, Math.min(available.length, 10))
    aiPreviewOrders.value = selected
    aiPreviewData.value = {
      stops: selected.length,
      distance: (selected.length * 1.8 + 3.2).toFixed(1),
      time: Math.round(selected.length * 4.5 + 8),
    }
    aiLoading.value = false
  }, 2500)
}

function confirmAiPlan() {
  // Apply the AI plan
  const newIds = aiPreviewOrders.value.map(o => o.id)
  routeOrderIds.value = newIds
  const statuses = {}
  newIds.forEach(id => { statuses[id] = 'pending' })
  stopStatuses.value = statuses
  optimized.value = false
  showAiPreview.value = false
}

// --- Actions ---
function addToRoute(orderId) {
  if (!routeOrderIds.value.includes(orderId)) {
    routeOrderIds.value = [...routeOrderIds.value, orderId]
    stopStatuses.value = { ...stopStatuses.value, [orderId]: 'pending' }
    optimized.value = false
  }
}

function removeFromRoute(orderId) {
  routeOrderIds.value = routeOrderIds.value.filter((id) => id !== orderId)
  const copy = { ...stopStatuses.value }
  delete copy[orderId]
  stopStatuses.value = copy
  optimized.value = false
}

function moveStop(index, direction) {
  const newIds = [...routeOrderIds.value]
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= newIds.length) return
  ;[newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]]
  routeOrderIds.value = newIds
  optimized.value = false
}

function clearRoute() {
  routeOrderIds.value = []
  stopStatuses.value = {}
  optimized.value = false
}

function handleOptimize() {
  optimizing.value = true
  setTimeout(() => {
    const shuffled = [...routeOrderIds.value].sort(() => Math.random() - 0.5)
    routeOrderIds.value = shuffled
    optimizing.value = false
    optimized.value = true
  }, 2000)
}

function getEta(index) {
  const base = new Date()
  base.setHours(9, 0, 0, 0)
  base.setMinutes(base.getMinutes() + index * timePerStop)
  return `${String(base.getHours()).padStart(2, '0')}:${String(base.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
