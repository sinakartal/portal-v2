<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <!-- ===== LEFT PANEL: UNASSIGNED ORDERS ===== -->
    <div class="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-800">Atanmamis Siparisler</h2>
          <span class="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            {{ filteredUnassigned.length }}
          </span>
        </div>
      </div>

      <!-- Search -->
      <div class="px-3 py-2 border-b border-slate-100">
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Siparis, musteri, bolge..."
            v-model="searchTerm"
            class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      <!-- Filters -->
      <div class="px-3 py-2 border-b border-slate-100 flex gap-2">
        <div class="relative flex-1">
          <select
            v-model="filterDistrict"
            class="w-full appearance-none pl-2 pr-6 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
          >
            <option value="">Bolge</option>
            <option v-for="d in availableDistricts" :key="d" :value="d">{{ d }}</option>
          </select>
          <Filter class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
        <div class="relative flex-1">
          <select
            v-model="filterPriority"
            class="w-full appearance-none pl-2 pr-6 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
          >
            <option value="">Oncelik</option>
            <option value="normal">Normal</option>
            <option value="yuksek">Yuksek</option>
            <option value="acil">Acil</option>
          </select>
          <Filter class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <!-- Order Cards -->
      <div class="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        <div v-if="filteredUnassigned.length === 0" class="text-center py-8 text-slate-400 text-xs">
          <Package class="w-8 h-8 mx-auto mb-2 opacity-40" />
          Siparis bulunamadi
        </div>
        <div
          v-for="order in filteredUnassigned"
          :key="order.id"
          @click="addToRoute(order.id)"
          class="group relative bg-white border border-slate-150 rounded-lg p-2.5 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all duration-150"
        >
          <div class="flex items-start gap-2">
            <GripVertical class="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0 group-hover:text-slate-400" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold text-slate-700">{{ order.id }}</span>
                <span :class="['inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', PRIORITY_CONFIG[order.priority].bg, PRIORITY_CONFIG[order.priority].text]">
                  <span :class="['w-1.5 h-1.5 rounded-full', PRIORITY_CONFIG[order.priority].dot]" />
                  {{ PRIORITY_CONFIG[order.priority].label }}
                </span>
              </div>
              <p class="text-xs text-slate-600 truncate">{{ order.customer }}</p>
              <div class="flex items-center justify-between mt-1">
                <span class="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin class="w-3 h-3" />
                  {{ order.district }}
                </span>
                <span class="text-xs font-medium text-slate-700">{{ order.amount }} &#8378;</span>
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
      </div>

      <!-- Bottom count -->
      <div class="px-4 py-2.5 border-t border-slate-200 bg-slate-50">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Toplam</span>
          <span class="font-semibold text-slate-700">{{ filteredUnassigned.length }} siparis</span>
        </div>
      </div>
    </div>

    <!-- ===== CENTER PANEL: MAP SIMULATION ===== -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Map grid background -->
      <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" stroke-width="0.5" />
          </pattern>
          <pattern id="gridLg" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#cbd5e1" stroke-width="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#f8fafc" />
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
          class="w-9 h-9 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Layers class="w-4 h-4" />
        </button>
        <div v-if="showLayers" class="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-lg border border-slate-200 p-2 space-y-1">
          <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs text-slate-600">
            <input type="checkbox" v-model="layerPins" class="rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
            Siparis Pinleri
          </label>
          <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs text-slate-600">
            <input type="checkbox" v-model="layerRoute" class="rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
            Rota Cizgisi
          </label>
          <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs text-slate-600">
            <input type="checkbox" v-model="layerCourier" class="rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
            Kurye Konumu
          </label>
        </div>
      </div>

      <!-- Route stats overlay -->
      <div class="absolute bottom-4 left-4 z-10">
        <div class="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-4">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <RouteIcon class="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider">Mesafe</p>
                <p class="text-sm font-bold text-slate-800">{{ totalDistance }} km</p>
              </div>
            </div>
            <div class="w-px h-8 bg-slate-200" />
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock class="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider">Sure</p>
                <p class="text-sm font-bold text-slate-800">{{ timeStr }}</p>
              </div>
            </div>
            <div class="w-px h-8 bg-slate-200" />
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <MapPin class="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider">Durak</p>
                <p class="text-sm font-bold text-slate-800">{{ routeOrders.length }}</p>
              </div>
            </div>
            <div class="w-px h-8 bg-slate-200" />
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
      <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow border border-slate-200 px-3 py-2">
        <div class="flex items-center gap-4 text-[11px] text-slate-500">
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
    </div>

    <!-- ===== RIGHT PANEL: ROUTE DETAIL ===== -->
    <div class="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <Navigation class="w-4 h-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-800">Rota Detay</h2>
        </div>
      </div>

      <!-- Courier selector -->
      <div class="px-4 py-3 border-b border-slate-100 space-y-2">
        <label class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Kurye</label>
        <select
          v-model="selectedCourier"
          class="w-full appearance-none px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
        >
          <option v-for="name in COURIER_NAMES" :key="name" :value="name">{{ name }}</option>
        </select>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <Truck class="w-3.5 h-3.5" />
          <span>{{ VEHICLE_TYPES[selectedCourier] || 'Motosiklet' }}</span>
        </div>
      </div>

      <!-- Stops list -->
      <div class="px-4 py-2 border-b border-slate-100">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Duraklar</span>
          <span class="text-[11px] text-slate-400">{{ routeOrders.length }} durak</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div v-if="routeOrders.length === 0" class="text-center py-12 text-slate-400 text-xs">
          <Navigation class="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Henuz durak eklenmedi.</p>
          <p class="mt-1 text-slate-300">Soldan siparis ekleyin</p>
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
              : 'border-slate-150 bg-white hover:border-slate-300'
          ]"
        >
          <div class="flex items-start gap-2">
            <div class="flex flex-col items-center gap-1 pt-0.5">
              <GripVertical class="w-3.5 h-3.5 text-slate-300" />
              <div :class="[
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                stopStatuses[order.id] === 'completed'
                  ? 'bg-emerald-500 text-white'
                  : stopStatuses[order.id] === 'active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              ]">
                {{ index + 1 }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-0.5">
                <div class="flex items-center gap-1.5">
                  <span v-if="stopStatuses[order.id] === 'completed'" class="text-emerald-500 font-bold text-sm">&#10003;</span>
                  <span v-else-if="stopStatuses[order.id] === 'active'" class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse" />
                  <span v-else class="w-2.5 h-2.5 rounded-full border-2 border-slate-300 inline-block" />
                  <span class="text-xs font-semibold text-slate-700">{{ order.id }}</span>
                </div>
                <span class="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Clock class="w-3 h-3" />
                  {{ getEta(index) }}
                </span>
              </div>
              <p class="text-xs text-slate-600 truncate">{{ order.customer }}</p>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">{{ order.address }}, {{ order.district }}</p>
            </div>
            <div class="flex flex-col gap-0.5 ml-1">
              <button
                @click="moveStop(index, -1)"
                :disabled="index === 0"
                class="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp class="w-3.5 h-3.5" />
              </button>
              <button
                @click="moveStop(index, 1)"
                :disabled="index === routeOrders.length - 1"
                class="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown class="w-3.5 h-3.5" />
              </button>
              <button
                @click="removeFromRoute(order.id)"
                class="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Route summary -->
      <div class="px-4 py-3 border-t border-slate-200 bg-slate-50 space-y-3">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="text-[10px] text-slate-400 uppercase">Mesafe</p>
            <p class="text-sm font-bold text-slate-700">{{ totalDistance }} km</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 uppercase">Sure</p>
            <p class="text-sm font-bold text-slate-700">{{ timeStr }}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 uppercase">Durak</p>
            <p class="text-sm font-bold text-slate-700">{{ routeOrders.length }}</p>
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
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
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
import { ref, computed } from 'vue'
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
} from 'lucide-vue-next'

// --- Mock Data ---
const DISTRICTS = [
  'Kadikoy', 'Besiktas', 'Sisli', 'Uskudar', 'Bakirkoy',
  'Fatih', 'Beyoglu', 'Atasehir', 'Maltepe', 'Kartal',
  'Sariyer', 'Pendik', 'Bagcilar', 'Zeytinburnu', 'Esenler',
]

const PRIORITIES = ['normal', 'yuksek', 'acil']

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

const CUSTOMER_NAMES = [
  'Ayse Korkmaz', 'Fatma Yildirim', 'Zeynep Acar', 'Elif Polat', 'Seda Tas',
  'Merve Gunes', 'Deniz Ozdemir', 'Gul Akin', 'Burcu Uzun', 'Sibel Cetin',
  'Kemal Bulut', 'Tuncay Aktas', 'Volkan Sezer', 'Baris Coskun', 'Tolga Karaca',
  'Derya Aslan', 'Pinar Guler', 'Canan Sen', 'Berna Tekin', 'Gokhan Bayrak',
  'Ufuk Ates', 'Sule Tuncer', 'Yasemin Kurt', 'Levent Duman', 'Ece Basaran',
]

const STREETS = [
  'Bagdat Cad.', 'Istiklal Cad.', 'Moda Cad.', 'Bahariye Cad.', 'Halaskargazi Cad.',
  'Rumeli Cad.', 'Nispetiye Cad.', 'Tesvikiye Cad.', 'Abdi Ipekci Cad.', 'Valikonagi Cad.',
]

function generateOrders(count) {
  const orders = []
  for (let i = 1; i <= count; i++) {
    orders.push({
      id: `SIP-${String(1000 + i).padStart(4, '0')}`,
      customer: CUSTOMER_NAMES[(i - 1) % CUSTOMER_NAMES.length],
      district: DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)],
      address: `${STREETS[Math.floor(Math.random() * STREETS.length)]} No:${Math.floor(Math.random() * 120) + 1}`,
      amount: Math.floor(Math.random() * 900 + 100),
      priority: PRIORITIES[Math.floor(Math.random() * 3)],
      mapX: 80 + Math.random() * 640,
      mapY: 40 + Math.random() * 340,
    })
  }
  return orders
}

const INITIAL_ORDERS = generateOrders(25)
const INITIAL_ROUTE_IDS = INITIAL_ORDERS.slice(0, 8).map((o) => o.id)

const PRIORITY_CONFIG = {
  normal: { label: 'Normal', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  yuksek: { label: 'Yuksek', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  acil: { label: 'Acil', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
}

// --- State ---
const orders = ref(INITIAL_ORDERS)
const routeOrderIds = ref([...INITIAL_ROUTE_IDS])
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

const initialStopStatuses = {}
INITIAL_ROUTE_IDS.forEach((id, i) => {
  if (i < 2) initialStopStatuses[id] = 'completed'
  else if (i === 2) initialStopStatuses[id] = 'active'
  else initialStopStatuses[id] = 'pending'
})
const stopStatuses = ref(initialStopStatuses)

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
