<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- LEFT SIDEBAR -->
    <div class="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200">
        <h1 class="text-lg font-bold text-gray-900">Canli Takip</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          {{ MOCK_COURIERS.length }} kurye &middot; Son guncelleme: simdi
        </p>
      </div>

      <!-- Tabs -->
      <div class="px-4 pt-3 pb-2">
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button
            @click="activeTab = 'couriers'"
            :class="[
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
              activeTab === 'couriers'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <Users :size="15" />
            Kuryeler
          </button>
          <button
            @click="activeTab = 'orders'"
            :class="[
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
              activeTab === 'orders'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <Package :size="15" />
            Siparisler
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="px-4 pb-2">
        <div class="relative">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Kurye veya bolge ara..."
            v-model="searchQuery"
            class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Status Filters -->
      <div class="px-4 pb-3 flex gap-1.5 flex-wrap">
        <button
          v-for="f in statusFilterOptions"
          :key="f.key"
          @click="statusFilter = f.key"
          :class="[
            'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
            statusFilter === f.key
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ f.label }} ({{ f.count }})
        </button>
      </div>

      <!-- Courier / Order List -->
      <div class="flex-1 overflow-y-auto">
        <!-- Couriers Tab -->
        <template v-if="activeTab === 'couriers'">
          <div v-if="filteredCouriers.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
            Sonuc bulunamadi
          </div>
          <button
            v-for="courier in filteredCouriers"
            :key="courier.id"
            @click="handleCourierSelect(courier)"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left',
              selectedCourier?.id === courier.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
            ]"
          >
            <!-- Avatar -->
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0',
                STATUS_COLORS[courier.status]
              ]"
            >
              {{ courier.avatar }}
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-900 truncate">
                  {{ courier.name }}
                </span>
                <span
                  :class="['w-2 h-2 rounded-full flex-shrink-0', STATUS_COLORS[courier.status]]"
                />
              </div>
              <div class="flex items-center gap-1 mt-0.5">
                <MapPin :size="12" class="text-gray-400 flex-shrink-0" />
                <span class="text-xs text-gray-500 truncate">{{ courier.district }}</span>
              </div>
              <div class="flex items-center gap-3 mt-1">
                <span :class="['text-xs font-medium', STATUS_TEXT_COLORS[courier.status]]">
                  {{ STATUS_LABELS[courier.status] }}
                </span>
                <span v-if="courier.ordersCount > 0" class="text-xs text-gray-400">
                  {{ courier.ordersCount }} siparis
                </span>
              </div>
            </div>
            <ChevronRight :size="16" class="text-gray-300 flex-shrink-0" />
          </button>
        </template>

        <!-- Orders Tab -->
        <template v-else>
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="selectCourierByName(order.courierName)"
          >
            <div
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                order.status === 'completed'
                  ? 'bg-green-100 text-green-600'
                  : order.status === 'active'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              ]"
            >
              <Package :size="16" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ order.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ order.address }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Kurye: {{ order.courierName }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <span
                :class="[
                  'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                  order.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'active'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                ]"
              >
                {{ order.status === 'completed' ? 'Teslim' : order.status === 'active' ? 'Aktif' : 'Bekliyor' }}
              </span>
              <p v-if="order.eta" class="text-xs text-gray-400 mt-1">{{ order.eta }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- CENTER - MAP AREA -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Map Grid Background -->
      <div
        class="absolute inset-0"
        :style="{
          backgroundColor: '#f1f5f9',
          backgroundImage: `linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }"
      />

      <!-- Simulated streets / roads -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- Horizontal roads -->
        <div class="absolute top-[20%] left-0 right-0 h-[3px] bg-gray-300 opacity-50" />
        <div class="absolute top-[45%] left-0 right-0 h-[4px] bg-gray-300 opacity-60" />
        <div class="absolute top-[70%] left-0 right-0 h-[3px] bg-gray-300 opacity-50" />
        <!-- Vertical roads -->
        <div class="absolute left-[25%] top-0 bottom-0 w-[3px] bg-gray-300 opacity-50" />
        <div class="absolute left-[55%] top-0 bottom-0 w-[4px] bg-gray-300 opacity-60" />
        <div class="absolute left-[80%] top-0 bottom-0 w-[3px] bg-gray-300 opacity-50" />
        <!-- Diagonal -->
        <div
          class="absolute top-0 left-0 w-full h-full opacity-20"
          :style="{
            background: 'linear-gradient(135deg, transparent 40%, #cbd5e1 40.5%, #cbd5e1 41%, transparent 41.5%)',
          }"
        />
      </div>

      <!-- Traffic overlay -->
      <div v-if="layers.traffic" class="absolute inset-0 pointer-events-none">
        <div class="absolute top-[19%] left-[10%] w-[35%] h-[5px] rounded-full bg-red-400 opacity-40" />
        <div class="absolute top-[44%] left-[30%] w-[25%] h-[5px] rounded-full bg-yellow-400 opacity-40" />
        <div class="absolute top-[69%] left-[50%] w-[30%] h-[5px] rounded-full bg-green-400 opacity-40" />
        <div class="absolute left-[24%] top-[25%] w-[5px] h-[20%] rounded-full bg-yellow-400 opacity-40" />
        <div class="absolute left-[54%] top-[10%] w-[5px] h-[30%] rounded-full bg-red-400 opacity-40" />
        <div class="absolute left-[79%] top-[45%] w-[5px] h-[25%] rounded-full bg-green-400 opacity-40" />
      </div>

      <!-- Heatmap overlay -->
      <template v-if="layers.heatmap">
        <div
          v-for="spot in heatmapSpots"
          :key="spot.id"
          class="absolute rounded-full pointer-events-none"
          :style="{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: `${spot.size}px`,
            height: `${spot.size}px`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, rgba(239,68,68,${spot.opacity + 0.12}) 0%, rgba(239,68,68,${spot.opacity}) 40%, transparent 70%)`,
          }"
        />
      </template>

      <!-- Route Lines SVG -->
      <svg v-if="layers.routes" class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        <path
          v-for="route in routePaths"
          :key="route.id"
          :d="route.path"
          fill="none"
          :stroke="route.color"
          stroke-width="0.3"
          stroke-dasharray="1 0.5"
          stroke-linecap="round"
          opacity="0.7"
        />
      </svg>

      <!-- Courier Markers -->
      <template v-if="layers.couriers">
        <button
          v-for="pos in courierPositions"
          :key="pos.id"
          @click="handleCourierSelect(getCourierById(pos.id))"
          class="absolute group"
          :style="{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: selectedCourier?.id === pos.id ? 50 : 10,
          }"
        >
          <!-- Pulse ring for selected -->
          <span
            v-if="selectedCourier?.id === pos.id"
            class="absolute inset-0 w-10 h-10 -m-2 rounded-full bg-blue-400 opacity-30 animate-ping"
          />
          <!-- Outer ring -->
          <span
            :class="[
              'block w-6 h-6 rounded-full border-2 border-white shadow-lg transition-transform',
              selectedCourier?.id === pos.id ? 'scale-150' : 'group-hover:scale-125',
              STATUS_COLORS[getCourierById(pos.id)?.status]
            ]"
          />
          <!-- Tooltip on hover -->
          <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
            {{ getCourierById(pos.id)?.name }}
            <span class="block text-gray-400 text-[10px]">
              {{ STATUS_LABELS[getCourierById(pos.id)?.status] }} &middot; {{ getCourierById(pos.id)?.ordersCount }} siparis
            </span>
          </span>
        </button>
      </template>

      <!-- Map Controls - Top Left: Status Cards -->
      <div class="absolute top-4 left-4 flex gap-2 z-20">
        <div
          v-for="card in statusCards"
          :key="card.key"
          :class="['flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm', card.bg]"
        >
          <span :class="card.color">
            <component :is="card.icon" :size="14" />
          </span>
          <div>
            <p :class="['text-lg font-bold leading-none', card.color]">{{ card.count }}</p>
            <p class="text-[10px] text-gray-500 mt-0.5">{{ card.label }}</p>
          </div>
        </div>
      </div>

      <!-- Map Controls - Top Right: Layer Toggle -->
      <div class="absolute top-4 right-4 z-20">
        <div class="relative">
          <button
            @click="layerMenuOpen = !layerMenuOpen"
            class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Layers :size="16" class="text-gray-600" />
            <span class="text-sm font-medium text-gray-700">Katmanlar</span>
          </button>
          <div v-if="layerMenuOpen" class="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-30">
            <button
              v-for="layer in layerOptions"
              :key="layer.key"
              @click="toggleLayer(layer.key)"
              class="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-gray-500">
                  <component :is="layer.icon" :size="15" />
                </span>
                <span class="text-sm text-gray-700">{{ layer.label }}</span>
              </div>
              <div
                :class="[
                  'w-9 h-5 rounded-full transition-colors flex items-center',
                  layers[layer.key] ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                ]"
              >
                <span class="block w-4 h-4 bg-white rounded-full shadow-sm mx-0.5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Center: Zoom hint -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm">
          <MapPin :size="14" class="text-gray-400" />
          <span class="text-xs text-gray-500">
            Istanbul &middot; {{ MOCK_COURIERS.length }} kurye aktif
          </span>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL - Slide Over Detail -->
    <div
      :class="[
        'fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out',
        detailPanelOpen && selectedCourier ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <div v-if="selectedCourier" class="flex flex-col h-full">
        <!-- Panel Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 class="text-base font-bold text-gray-900">Kurye Detayi</h2>
          <button
            @click="handleCloseDetail"
            class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <!-- Courier Identity -->
          <div class="px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div
                :class="['w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white', STATUS_COLORS[selectedCourier.status]]"
              >
                {{ selectedCourier.avatar }}
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900">{{ selectedCourier.name }}</h3>
                <span
                  :class="['inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1', STATUS_BG_LIGHT[selectedCourier.status]]"
                >
                  <span
                    :class="['w-1.5 h-1.5 rounded-full', STATUS_COLORS[selectedCourier.status]]"
                  />
                  {{ STATUS_LABELS[selectedCourier.status] }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2 mt-4">
              <button class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                <Phone :size="15" />
                Ara
              </button>
              <button class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                <MessageSquare :size="15" />
                Mesaj
              </button>
              <button class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                <Navigation :size="15" />
                Odakla
              </button>
            </div>
          </div>

          <!-- Today Stats -->
          <div class="px-5 py-4 border-b border-gray-100">
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Bugunku Performans
            </h4>
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-gray-50 rounded-xl p-3 text-center">
                <Package :size="18" class="mx-auto text-blue-500 mb-1" />
                <p class="text-lg font-bold text-gray-900">{{ selectedCourier.deliveriesToday }}</p>
                <p class="text-[10px] text-gray-500">Teslimat</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-3 text-center">
                <Clock :size="18" class="mx-auto text-orange-500 mb-1" />
                <p class="text-lg font-bold text-gray-900">{{ selectedCourier.avgDeliveryTime }}dk</p>
                <p class="text-[10px] text-gray-500">Ort. Sure</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-3 text-center">
                <Star :size="18" class="mx-auto text-yellow-500 mb-1" />
                <p class="text-lg font-bold text-gray-900">{{ selectedCourier.rating }}</p>
                <p class="text-[10px] text-gray-500">Puan</p>
              </div>
            </div>
          </div>

          <!-- Active Route -->
          <div class="px-5 py-4 border-b border-gray-100">
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Aktif Rota ({{ selectedCourier.stops.length }} durak)
            </h4>
            <div class="space-y-0">
              <div v-for="(stop, idx) in selectedCourier.stops" :key="stop.id" class="flex gap-3">
                <!-- Timeline -->
                <div class="flex flex-col items-center">
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      stop.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : stop.status === 'active'
                        ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                    ]"
                  >
                    <span v-if="stop.status === 'completed'">&#10003;</span>
                    <span v-else-if="stop.status === 'active'" class="w-2 h-2 bg-white rounded-full" />
                    <span v-else class="w-2 h-2 bg-gray-400 rounded-full" />
                  </div>
                  <div
                    v-if="idx < selectedCourier.stops.length - 1"
                    :class="['w-0.5 flex-1 min-h-[24px]', stop.status === 'completed' ? 'bg-green-300' : 'bg-gray-200']"
                  />
                </div>
                <!-- Content -->
                <div class="pb-4 flex-1 min-w-0">
                  <p
                    :class="[
                      'text-sm font-medium',
                      stop.status === 'completed'
                        ? 'text-gray-400 line-through'
                        : stop.status === 'active'
                        ? 'text-blue-700'
                        : 'text-gray-700'
                    ]"
                  >
                    {{ stop.name }}
                  </p>
                  <p class="text-xs text-gray-400 truncate mt-0.5">{{ stop.address }}</p>
                  <span v-if="stop.eta" class="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock :size="10" />
                    {{ stop.eta }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Info -->
          <div class="px-5 py-4 border-b border-gray-100">
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Konum Bilgisi
            </h4>
            <div class="space-y-2.5">
              <div class="flex items-start gap-3">
                <MapPin :size="16" class="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-sm text-gray-800">{{ selectedCourier.address }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    Son guncelleme: {{ selectedCourier.lastUpdate }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Navigation :size="16" class="text-gray-400 flex-shrink-0" />
                <div>
                  <p class="text-sm text-gray-800">{{ selectedCourier.speed }} km/s</p>
                  <p class="text-xs text-gray-400">Anlik hiz</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Device Info -->
          <div class="px-5 py-4">
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Cihaz Bilgisi
            </h4>
            <div class="space-y-2.5">
              <div class="flex items-center gap-3">
                <Smartphone :size="16" class="text-gray-400 flex-shrink-0" />
                <div>
                  <p class="text-sm text-gray-800">{{ selectedCourier.platform }}</p>
                  <p class="text-xs text-gray-400">Uygulama {{ selectedCourier.appVersion }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Battery :size="16" class="text-gray-400 flex-shrink-0" />
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-800">%{{ selectedCourier.battery }}</p>
                  </div>
                  <div class="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                    <div
                      :class="[
                        'h-full rounded-full transition-all',
                        selectedCourier.battery > 50
                          ? 'bg-green-500'
                          : selectedCourier.battery > 20
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      ]"
                      :style="{ width: `${selectedCourier.battery}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay backdrop when detail panel is open on smaller screens -->
    <div
      v-if="detailPanelOpen && selectedCourier"
      class="fixed inset-0 bg-black/10 z-30 lg:hidden"
      @click="handleCloseDetail"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Search,
  Filter,
  Phone,
  MessageSquare,
  MapPin,
  Navigation,
  Battery,
  Smartphone,
  Clock,
  Package,
  Star,
  ChevronRight,
  Layers,
  X,
  Zap,
  Coffee,
  WifiOff,
  Users,
} from 'lucide-vue-next'

// --- Mock Data Generation ---

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Emre', 'Burak', 'Serkan',
  'Cem', 'Okan', 'Deniz', 'Kaan', 'Tolga',
  'Baran', 'Arda', 'Yusuf', 'Murat', 'Ali',
  'Hakan', 'Onur', 'Ugur', 'Selim', 'Erdem',
]
const LAST_NAMES = [
  'Yilmaz', 'Demir', 'Celik', 'Kaya', 'Sahin',
  'Ozturk', 'Aydin', 'Arslan', 'Dogan', 'Koc',
  'Kurt', 'Erdogan', 'Polat', 'Ozdemir', 'Aksoy',
  'Kaplan', 'Cetin', 'Korkmaz', 'Tas', 'Gunes',
]
const STATUSES = ['online', 'delivering', 'break', 'offline']
const STATUS_LABELS = {
  online: 'Musait',
  delivering: 'Dagitimda',
  break: 'Mola',
  offline: 'Offline',
}
const STATUS_COLORS = {
  online: 'bg-green-500',
  delivering: 'bg-blue-500',
  break: 'bg-yellow-500',
  offline: 'bg-gray-400',
}
const STATUS_TEXT_COLORS = {
  online: 'text-green-600',
  delivering: 'text-blue-600',
  break: 'text-yellow-600',
  offline: 'text-gray-500',
}
const STATUS_BG_LIGHT = {
  online: 'bg-green-100 text-green-700',
  delivering: 'bg-blue-100 text-blue-700',
  break: 'bg-yellow-100 text-yellow-700',
  offline: 'bg-gray-100 text-gray-500',
}

const DISTRICTS = [
  'Kadikoy', 'Besiktas', 'Sisli', 'Uskudar', 'Beyoglu',
  'Bakirkoy', 'Fatih', 'Atasehir', 'Maltepe', 'Kartal',
  'Sariyer', 'Pendik', 'Levent', 'Mecidiyekoy', 'Bostanci',
]
const STREETS = [
  'Bagdat Cad.', 'Istiklal Cad.', 'Abdi Ipekci Cad.', 'Nispetiye Cad.',
  'Rumeli Cad.', 'Halaskargazi Cad.', 'Barbaros Blv.', 'Fahrettin Kerim Gokay Cad.',
  'Moda Cad.', 'Bahariye Cad.',
]

const STOP_NAMES = [
  'Atasehir Migros', 'Kadikoy Carsi', 'Bostanci AVM', 'Acibadem Sok.',
  'Fenerbahce Stadyum', 'Suadiye Sahil', 'Erenkoy Park', 'Goztepe Metro',
  'Kozyatagi Plaza', 'Icerenkoy Sanayi', 'Umraniye Center', 'Altunizade Koprusu',
  'Camlica Tepesi', 'Kisikli Yokusu', 'Beylerbeyi Sarayi',
]

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateCouriersData() {
  const rand = seededRandom(42)
  return Array.from({ length: 20 }, (_, i) => {
    const status = STATUSES[Math.floor(rand() * 4)]
    const stopsCount = 3 + Math.floor(rand() * 5)
    const completedStops = Math.floor(rand() * (stopsCount + 1))
    const stops = Array.from({ length: stopsCount }, (_, si) => ({
      id: `stop-${i}-${si}`,
      name: STOP_NAMES[Math.floor(rand() * STOP_NAMES.length)],
      address: `${STREETS[Math.floor(rand() * STREETS.length)]} No:${Math.floor(rand() * 120) + 1}`,
      status: si < completedStops ? 'completed' : si === completedStops ? 'active' : 'pending',
      eta: si >= completedStops ? `${Math.floor(rand() * 25) + 5} dk` : null,
    }))

    return {
      id: `courier-${i + 1}`,
      name: `${FIRST_NAMES[i]} ${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]}`,
      avatar: FIRST_NAMES[i].charAt(0) + LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)].charAt(0),
      status,
      x: 8 + rand() * 84,
      y: 8 + rand() * 84,
      district: DISTRICTS[Math.floor(rand() * DISTRICTS.length)],
      address: `${STREETS[Math.floor(rand() * STREETS.length)]} No:${Math.floor(rand() * 200) + 1}, ${DISTRICTS[Math.floor(rand() * DISTRICTS.length)]}`,
      ordersCount: status === 'offline' ? 0 : Math.floor(rand() * 8),
      deliveriesToday: Math.floor(rand() * 20) + 2,
      avgDeliveryTime: Math.floor(rand() * 20) + 15,
      rating: (3.5 + rand() * 1.5).toFixed(1),
      speed: status === 'offline' || status === 'break' ? 0 : Math.floor(rand() * 40) + 5,
      lastUpdate: `${Math.floor(rand() * 5) + 1} dk once`,
      phone: `0532 ${Math.floor(rand() * 900 + 100)} ${Math.floor(rand() * 90 + 10)} ${Math.floor(rand() * 90 + 10)}`,
      platform: rand() > 0.5 ? 'iOS 17.2' : 'Android 14',
      appVersion: `v3.${Math.floor(rand() * 5)}.${Math.floor(rand() * 10)}`,
      battery: Math.floor(rand() * 80) + 15,
      stops,
    }
  })
}

const MOCK_COURIERS = generateCouriersData()

// --- Component State ---

const activeTab = ref('couriers')
const searchQuery = ref('')
const statusFilter = ref('all')
const selectedCourier = ref(null)
const detailPanelOpen = ref(false)
const layers = ref({
  couriers: true,
  routes: true,
  traffic: false,
  heatmap: false,
})
const layerMenuOpen = ref(false)
const courierPositions = ref(
  MOCK_COURIERS.map((c) => ({ id: c.id, x: c.x, y: c.y }))
)

// Simulate small position changes every 3 seconds
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    courierPositions.value = courierPositions.value.map((p) => {
      const courier = MOCK_COURIERS.find((c) => c.id === p.id)
      if (!courier || courier.status === 'offline' || courier.status === 'break') return p
      return {
        ...p,
        x: Math.max(5, Math.min(95, p.x + (Math.random() - 0.5) * 1.2)),
        y: Math.max(5, Math.min(95, p.y + (Math.random() - 0.5) * 1.2)),
      }
    })
  }, 3000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
})

// Status counts
const statusCounts = computed(() => {
  return MOCK_COURIERS.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    },
    { online: 0, delivering: 0, break: 0, offline: 0 }
  )
})

const statusFilterOptions = computed(() => [
  { key: 'all', label: 'Tumu', count: MOCK_COURIERS.length },
  { key: 'online', label: 'Musait', count: statusCounts.value.online },
  { key: 'delivering', label: 'Dagitimda', count: statusCounts.value.delivering },
  { key: 'break', label: 'Mola', count: statusCounts.value.break },
  { key: 'offline', label: 'Offline', count: statusCounts.value.offline },
])

// Filtered couriers
const filteredCouriers = computed(() => {
  return MOCK_COURIERS.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'all' || c.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

// Filtered orders for orders tab
const filteredOrders = computed(() => {
  return MOCK_COURIERS
    .filter((c) => c.status === 'delivering')
    .flatMap((c) =>
      c.stops.map((stop) => ({
        ...stop,
        courierName: c.name,
        courierId: c.id,
      }))
    )
    .filter(
      (order) =>
        statusFilter.value === 'all' ||
        (statusFilter.value === 'delivering' && order.status === 'active') ||
        (statusFilter.value === 'online' && order.status === 'completed') ||
        (statusFilter.value === 'break' && order.status === 'pending')
    )
    .filter(
      (order) =>
        !searchQuery.value ||
        order.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        order.courierName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

// Status cards for map overlay
const statusCards = computed(() => [
  {
    key: 'online',
    icon: Zap,
    label: 'Musait',
    count: statusCounts.value.online,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
  },
  {
    key: 'delivering',
    icon: Navigation,
    label: 'Dagitimda',
    count: statusCounts.value.delivering,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  {
    key: 'break',
    icon: Coffee,
    label: 'Mola',
    count: statusCounts.value.break,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
  },
  {
    key: 'offline',
    icon: WifiOff,
    label: 'Offline',
    count: statusCounts.value.offline,
    color: 'text-gray-500',
    bg: 'bg-gray-50 border-gray-200',
  },
])

// Layer options for the toggle menu
const layerOptions = [
  { key: 'couriers', label: 'Kuryeler', icon: Users },
  { key: 'routes', label: 'Rotalar', icon: Navigation },
  { key: 'traffic', label: 'Trafik', icon: Zap },
  { key: 'heatmap', label: 'Isi Haritasi', icon: MapPin },
]

// Generate route paths for SVG
const routePaths = computed(() => {
  if (!layers.value.routes) return []
  return MOCK_COURIERS
    .filter((c) => c.status === 'delivering')
    .map((c) => {
      const pos = courierPositions.value.find((p) => p.id === c.id) || { x: c.x, y: c.y }
      const stops = c.stops.filter((s) => s.status !== 'completed')
      if (stops.length < 1) return null
      const points = [
        { x: pos.x, y: pos.y },
        ...stops.map((_, idx) => ({
          x: pos.x + (Math.sin(idx * 1.8 + parseInt(c.id.split('-')[1])) * 12),
          y: pos.y + (Math.cos(idx * 1.3 + parseInt(c.id.split('-')[1])) * 10),
        })),
      ]
      const pathStr = points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ')
      return {
        id: c.id,
        path: pathStr,
        color: selectedCourier.value?.id === c.id ? '#3b82f6' : '#94a3b8',
      }
    })
    .filter(Boolean)
})

// Generate heatmap spots
const heatmapSpots = computed(() => {
  if (!layers.value.heatmap) return []
  const spots = []
  for (let i = 0; i < 12; i++) {
    spots.push({
      id: `heat-${i}`,
      x: 10 + ((i * 37 + 13) % 80),
      y: 10 + ((i * 29 + 7) % 80),
      size: 60 + (i % 4) * 30,
      opacity: 0.08 + (i % 3) * 0.04,
    })
  }
  return spots
})

// --- Actions ---

function getCourierById(id) {
  return MOCK_COURIERS.find((c) => c.id === id)
}

function handleCourierSelect(courier) {
  if (!courier) return
  selectedCourier.value = courier
  detailPanelOpen.value = true
}

function handleCloseDetail() {
  detailPanelOpen.value = false
  setTimeout(() => {
    selectedCourier.value = null
  }, 300)
}

function toggleLayer(layer) {
  layers.value = { ...layers.value, [layer]: !layers.value[layer] }
}

function selectCourierByName(courierName) {
  const c = MOCK_COURIERS.find((cr) => cr.name === courierName)
  if (c) handleCourierSelect(c)
}
</script>
