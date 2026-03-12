<template>
  <div :class="dark ? 'bg-slate-900 text-slate-100 min-h-screen' : ''">
    <!-- Skeleton Loading -->
    <template v-if="loading">
      <div class="mb-6">
        <div :class="['h-8 w-48 rounded-lg animate-pulse', dark ? 'bg-slate-700' : 'bg-slate-200']" />
        <div :class="['h-4 w-64 rounded mt-2 animate-pulse', dark ? 'bg-slate-700' : 'bg-slate-200']" />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div v-for="n in 4" :key="n" :class="['rounded-xl p-4 animate-pulse', dark ? 'bg-slate-800' : 'bg-white border border-slate-100']">
          <div :class="['w-8 h-8 rounded-lg mb-2', dark ? 'bg-slate-700' : 'bg-slate-200']" />
          <div :class="['h-6 w-12 rounded mb-1', dark ? 'bg-slate-700' : 'bg-slate-200']" />
          <div :class="['h-3 w-20 rounded', dark ? 'bg-slate-700' : 'bg-slate-200']" />
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div :class="['rounded-xl p-4 animate-pulse', dark ? 'bg-slate-800' : 'bg-white border border-slate-100']">
            <div :class="['h-10 w-full rounded-lg', dark ? 'bg-slate-700' : 'bg-slate-200']" />
          </div>
          <div :class="['rounded-xl overflow-hidden animate-pulse', dark ? 'bg-slate-800' : 'bg-white border border-slate-100']">
            <div v-for="n in 6" :key="n" class="flex gap-4 px-4 py-3">
              <div :class="['h-5 w-20 rounded', dark ? 'bg-slate-700' : 'bg-slate-200']" />
              <div :class="['h-5 w-28 rounded', dark ? 'bg-slate-700' : 'bg-slate-200']" />
              <div :class="['h-5 w-12 rounded', dark ? 'bg-slate-700' : 'bg-slate-200']" />
              <div :class="['h-5 flex-1 rounded', dark ? 'bg-slate-700' : 'bg-slate-200']" />
              <div :class="['h-5 w-16 rounded', dark ? 'bg-slate-700' : 'bg-slate-200']" />
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <div :class="['rounded-xl h-[250px] animate-pulse', dark ? 'bg-slate-800' : 'bg-white border border-slate-100']" />
          <div :class="['rounded-xl h-[300px] animate-pulse', dark ? 'bg-slate-800' : 'bg-white border border-slate-100']" />
        </div>
      </div>
    </template>

    <!-- Main Content -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 :class="['text-2xl font-bold', dark ? 'text-white' : 'text-slate-800']">Rotalar</h1>
          <p :class="['text-sm mt-1', dark ? 'text-slate-400' : 'text-slate-500']">{{ activeCount }} aktif rota, {{ totalOrders }} toplam siparis</p>
        </div>
        <div class="flex gap-2">
          <!-- Dark Mode Toggle -->
          <button
            @click="dark = !dark"
            :class="['flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border', dark ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50']"
          >
            <Moon v-if="!dark" :size="16" />
            <Sun v-else :size="16" />
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Plus :size="16" /> Yeni Rota
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div :class="['rounded-xl p-4', dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100']">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Route :size="16" class="text-green-500" />
            </div>
          </div>
          <p :class="['text-xl font-bold', dark ? 'text-white' : 'text-slate-800']">{{ activeCount }}</p>
          <p :class="['text-xs mt-1', dark ? 'text-slate-400' : 'text-slate-500']">Aktif Rota</p>
        </div>
        <div :class="['rounded-xl p-4', dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100']">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package :size="16" class="text-blue-500" />
            </div>
          </div>
          <p :class="['text-xl font-bold', dark ? 'text-white' : 'text-slate-800']">{{ totalOrders }}</p>
          <p :class="['text-xs mt-1', dark ? 'text-slate-400' : 'text-slate-500']">Toplam Siparis</p>
        </div>
        <div :class="['rounded-xl p-4', dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100']">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Truck :size="16" class="text-indigo-500" />
            </div>
          </div>
          <p :class="['text-xl font-bold', dark ? 'text-white' : 'text-slate-800']">{{ routes.filter(r => r.status !== 'cancelled').length }}</p>
          <p :class="['text-xs mt-1', dark ? 'text-slate-400' : 'text-slate-500']">Toplam Kurye</p>
        </div>
        <div :class="['rounded-xl p-4', dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100']">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock :size="16" class="text-amber-500" />
            </div>
          </div>
          <p :class="['text-xl font-bold', dark ? 'text-white' : 'text-slate-800']">%{{ avgProgress }}</p>
          <p :class="['text-xs mt-1', dark ? 'text-slate-400' : 'text-slate-500']">Ort. Ilerleme</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Route List -->
        <div class="lg:col-span-2">
          <!-- Search & Filter & View Toggle -->
          <div :class="['rounded-xl p-4 mb-4', dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100']">
            <div class="flex flex-wrap gap-3">
              <div class="relative flex-1 min-w-[200px]">
                <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  v-model="search"
                  placeholder="Rota no, kurye, bolge ara..."
                  :class="['w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary', dark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' : 'border-slate-200']"
                />
              </div>
              <select
                v-model="statusFilter"
                :class="['px-3 py-2 border rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20', dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'border-slate-200']"
              >
                <option value="">Tum Durumlar</option>
                <option v-for="([key, val]) in Object.entries(routeStatuses)" :key="key" :value="key">{{ val.label }}</option>
              </select>
              <!-- View Toggle -->
              <div :class="['flex rounded-lg border overflow-hidden', dark ? 'border-slate-600' : 'border-slate-200']">
                <button
                  @click="viewMode = 'list'"
                  :class="['flex items-center gap-1.5 px-3 py-2 text-sm font-medium cursor-pointer transition-colors', viewMode === 'list' ? (dark ? 'bg-primary text-white' : 'bg-primary text-white') : (dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-50')]"
                >
                  <List :size="14" /> Liste
                </button>
                <button
                  @click="viewMode = 'kanban'"
                  :class="['flex items-center gap-1.5 px-3 py-2 text-sm font-medium cursor-pointer transition-colors', viewMode === 'kanban' ? (dark ? 'bg-primary text-white' : 'bg-primary text-white') : (dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-50')]"
                >
                  <LayoutGrid :size="14" /> Kanban
                </button>
              </div>
              <button @click="search = ''; statusFilter = ''" :class="['flex items-center gap-2 px-3 py-2 text-sm cursor-pointer', dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700']">
                <RefreshCw :size="14" /> Sifirla
              </button>
            </div>

            <!-- Batch Operations Bar -->
            <div v-if="selectedIds.length > 0" :class="['mt-3 flex items-center gap-3 px-4 py-2.5 rounded-lg', dark ? 'bg-primary/20 border border-primary/30' : 'bg-primary/5 border border-primary/10']">
              <span :class="['text-sm font-medium', dark ? 'text-primary-light' : 'text-primary']">{{ selectedIds.length }} rota secildi</span>
              <div class="flex-1" />
              <button
                @click="handleBatchMerge"
                :disabled="selectedIds.length < 2"
                :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed', dark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100']"
              >
                <Merge :size="13" /> Merge Et
              </button>
              <button
                @click="handleBatchReoptimize"
                :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer', dark ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-amber-50 text-amber-700 hover:bg-amber-100']"
              >
                <RotateCw :size="13" /> Yeniden Optimize Et
              </button>
              <button
                @click="handleBatchExport"
                :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer', dark ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100']"
              >
                <Download :size="13" /> Export
              </button>
              <button
                @click="selectedIds = []"
                class="p-1.5 hover:bg-white/20 rounded cursor-pointer"
              >
                <X :size="14" :class="dark ? 'text-slate-300' : 'text-slate-500'" />
              </button>
            </div>
          </div>

          <!-- LIST VIEW -->
          <div v-if="viewMode === 'list'" :class="['rounded-xl overflow-hidden', dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100']">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr :class="dark ? 'bg-slate-750 border-b border-slate-700' : 'bg-slate-50 border-b border-slate-100'">
                    <th class="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        :checked="selectedIds.length === filtered.length && filtered.length > 0"
                        @change="toggleSelectAll"
                        class="rounded border-slate-300 cursor-pointer"
                      />
                    </th>
                    <th :class="['text-left px-4 py-3 font-medium', dark ? 'text-slate-300' : 'text-slate-600']">Rota</th>
                    <th :class="['text-left px-4 py-3 font-medium', dark ? 'text-slate-300' : 'text-slate-600']">Kurye</th>
                    <th :class="['text-center px-4 py-3 font-medium', dark ? 'text-slate-300' : 'text-slate-600']">Kapasite</th>
                    <th :class="['text-center px-4 py-3 font-medium', dark ? 'text-slate-300' : 'text-slate-600']">Ilerleme</th>
                    <th :class="['text-left px-4 py-3 font-medium', dark ? 'text-slate-300' : 'text-slate-600']">Durum</th>
                    <th :class="['text-left px-4 py-3 font-medium', dark ? 'text-slate-300' : 'text-slate-600']">ETA</th>
                    <th :class="['text-center px-4 py-3 font-medium', dark ? 'text-slate-300' : 'text-slate-600']">Islem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="route in filtered"
                    :key="route._id"
                    :class="[
                      'border-b cursor-pointer transition-colors',
                      dark ? 'border-slate-700 hover:bg-slate-750' : 'border-slate-50 hover:bg-slate-50/50',
                      selectedRoute?._id === route._id ? (dark ? 'bg-primary/10' : 'bg-primary/5') : '',
                      selectedIds.includes(route._id) ? (dark ? 'bg-indigo-900/20' : 'bg-indigo-50/50') : ''
                    ]"
                    @click="selectedRoute = route"
                    @mouseenter="hoveredRouteId = route._id"
                    @mouseleave="hoveredRouteId = null"
                  >
                    <td class="px-4 py-3" @click.stop>
                      <input
                        type="checkbox"
                        :checked="selectedIds.includes(route._id)"
                        @change="toggleSelect(route._id)"
                        class="rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td class="px-4 py-3 relative">
                      <div>
                        <p :class="['font-medium', dark ? 'text-white' : 'text-slate-800']">{{ route.routeNumber }}</p>
                        <p :class="['text-xs', dark ? 'text-slate-500' : 'text-slate-400']">{{ route.region }}</p>
                      </div>
                      <!-- Route Detail Hover Popup -->
                      <div
                        v-if="hoveredRouteId === route._id && route.stops && route.stops.length > 0"
                        :class="['absolute left-0 top-full mt-1 z-30 w-72 rounded-xl shadow-2xl border p-3 pointer-events-none', dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200']"
                      >
                        <p :class="['text-xs font-semibold mb-2', dark ? 'text-slate-200' : 'text-slate-700']">Adres Sirasi</p>
                        <div class="space-y-1.5 max-h-48 overflow-y-auto">
                          <div v-for="(stop, sIdx) in route.stops.slice(0, 8)" :key="stop.id" class="flex items-start gap-2">
                            <span :class="['flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold', stop.status === 'delivered' ? 'bg-green-500 text-white' : stop.status === 'in_transit' ? 'bg-blue-500 text-white' : (dark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600')]">
                              {{ sIdx + 1 }}
                            </span>
                            <div class="min-w-0">
                              <p :class="['text-[11px] font-medium truncate', dark ? 'text-slate-200' : 'text-slate-700']">{{ stop.customer }}</p>
                              <p :class="['text-[10px] truncate', dark ? 'text-slate-400' : 'text-slate-400']">{{ stop.address }}</p>
                            </div>
                          </div>
                          <p v-if="route.stops.length > 8" :class="['text-[10px] text-center pt-1', dark ? 'text-slate-500' : 'text-slate-400']">
                            +{{ route.stops.length - 8 }} durak daha...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Truck :size="12" class="text-primary" />
                        </div>
                        <span :class="dark ? 'text-slate-200' : 'text-slate-700'">{{ route.courier }}</span>
                      </div>
                    </td>
                    <!-- Capacity Fill Bar -->
                    <td class="px-4 py-3">
                      <div class="flex flex-col items-center gap-1">
                        <span :class="['text-xs font-medium', dark ? 'text-slate-300' : 'text-slate-600']">{{ route.orderCount }}/{{ route.maxCapacity || 15 }}</span>
                        <div :class="['w-full h-2 rounded-full overflow-hidden', dark ? 'bg-slate-600' : 'bg-slate-100']">
                          <div
                            :class="['h-full rounded-full transition-all', getCapacityColor(route.orderCount, route.maxCapacity || 15)]"
                            :style="{ width: `${Math.min((route.orderCount / (route.maxCapacity || 15)) * 100, 100)}%` }"
                          />
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div :class="['flex-1 h-2 rounded-full overflow-hidden', dark ? 'bg-slate-600' : 'bg-slate-100']">
                          <div
                            :class="['h-full rounded-full transition-all', getProgressColor(route.progress)]"
                            :style="{ width: `${route.progress}%` }"
                          />
                        </div>
                        <span :class="['text-xs font-medium w-8', dark ? 'text-slate-300' : 'text-slate-600']">%{{ route.progress }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class="px-2.5 py-1 rounded-full text-xs font-medium"
                        :style="{ backgroundColor: getRouteStatus(route).bg, color: getRouteStatus(route).color }"
                      >
                        {{ getRouteStatus(route).label }}
                      </span>
                    </td>
                    <td :class="['px-4 py-3 text-sm', dark ? 'text-slate-300' : 'text-slate-600']">
                      {{ route.status === 'completed' ? 'Bitti' : formatDateTime(route.eta) }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-center gap-1">
                        <button :class="['p-1.5 rounded cursor-pointer', dark ? 'hover:bg-slate-600' : 'hover:bg-slate-100']" title="Detay" @click.stop="selectedRoute = route">
                          <Eye :size="14" :class="dark ? 'text-slate-400' : 'text-slate-500'" />
                        </button>
                        <button
                          v-if="route.status === 'active'"
                          :class="['p-1.5 rounded cursor-pointer', dark ? 'hover:bg-slate-600' : 'hover:bg-slate-100']"
                          title="Durdur"
                          @click.stop
                        >
                          <Pause :size="14" :class="dark ? 'text-slate-400' : 'text-slate-500'" />
                        </button>
                        <button
                          v-else-if="route.status === 'paused'"
                          :class="['p-1.5 rounded cursor-pointer', dark ? 'hover:bg-slate-600' : 'hover:bg-slate-100']"
                          title="Devam Et"
                          @click.stop
                        >
                          <Play :size="14" :class="dark ? 'text-slate-400' : 'text-slate-500'" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- KANBAN VIEW -->
          <div v-else class="grid grid-cols-3 gap-4">
            <div
              v-for="col in kanbanColumns"
              :key="col.key"
              :class="['rounded-xl overflow-hidden', dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100']"
            >
              <!-- Column Header -->
              <div :class="['px-4 py-3 border-b flex items-center justify-between', dark ? 'border-slate-700' : 'border-slate-100']">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: col.dotColor }" />
                  <span :class="['text-sm font-semibold', dark ? 'text-slate-200' : 'text-slate-700']">{{ col.label }}</span>
                </div>
                <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500']">
                  {{ kanbanData[col.key].length }}
                </span>
              </div>
              <!-- Column Cards -->
              <div class="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
                <div v-if="kanbanData[col.key].length === 0" :class="['text-center py-8 text-xs', dark ? 'text-slate-500' : 'text-slate-400']">
                  Rota yok
                </div>
                <div
                  v-for="route in kanbanData[col.key]"
                  :key="route._id"
                  :class="[
                    'rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md',
                    dark ? 'border-slate-600 bg-slate-750 hover:border-slate-500' : 'border-slate-150 bg-white hover:border-slate-300',
                    selectedRoute?._id === route._id ? 'ring-2 ring-primary/40' : ''
                  ]"
                  @click="selectedRoute = route"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span :class="['text-xs font-bold', dark ? 'text-white' : 'text-slate-800']">{{ route.routeNumber }}</span>
                    <span :class="['text-[10px] px-1.5 py-0.5 rounded', dark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-500']">{{ route.region }}</span>
                  </div>
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck :size="10" class="text-primary" />
                    </div>
                    <span :class="['text-xs font-medium', dark ? 'text-slate-200' : 'text-slate-700']">{{ route.courier }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span :class="['text-xs', dark ? 'text-slate-400' : 'text-slate-500']">
                      <Package :size="11" class="inline mr-1" />{{ route.orderCount }} siparis
                    </span>
                    <span :class="['text-xs', dark ? 'text-slate-400' : 'text-slate-500']">
                      <Clock :size="11" class="inline mr-1" />{{ route.status === 'completed' ? 'Bitti' : `~${route.estimatedTime} dk` }}
                    </span>
                  </div>
                  <!-- Capacity mini bar -->
                  <div :class="['w-full h-1.5 rounded-full overflow-hidden mt-2', dark ? 'bg-slate-600' : 'bg-slate-100']">
                    <div
                      :class="['h-full rounded-full', getCapacityColor(route.orderCount, route.maxCapacity || 15)]"
                      :style="{ width: `${Math.min((route.orderCount / (route.maxCapacity || 15)) * 100, 100)}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Map Placeholder & Route Detail -->
        <div class="space-y-6">
          <!-- Map Placeholder -->
          <div :class="['rounded-xl overflow-hidden', dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100']">
            <div :class="['h-[250px] flex flex-col items-center justify-center', dark ? 'bg-gradient-to-br from-slate-800 to-slate-750' : 'bg-gradient-to-br from-slate-100 to-slate-50']">
              <div :class="['w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-3', dark ? 'bg-slate-700' : 'bg-white']">
                <Map :size="28" :class="dark ? 'text-slate-500' : 'text-slate-400'" />
              </div>
              <p :class="['text-sm font-medium', dark ? 'text-slate-400' : 'text-slate-500']">Harita Gorunumu</p>
              <p :class="['text-xs mt-1', dark ? 'text-slate-500' : 'text-slate-400']">Rotalari haritada goruntuleyin</p>
              <div v-if="selectedRoute" class="mt-3 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {{ selectedRoute.routeNumber }} - {{ selectedRoute.region }}
              </div>
            </div>
          </div>

          <!-- Selected Route Detail -->
          <div v-if="selectedRoute" :class="['rounded-xl p-5', dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100']">
            <div class="flex items-center justify-between mb-4">
              <h3 :class="['font-semibold', dark ? 'text-white' : 'text-slate-800']">{{ selectedRoute.routeNumber }} Detay</h3>
              <span
                class="px-2.5 py-1 rounded-full text-xs font-medium"
                :style="{ backgroundColor: routeStatuses[selectedRoute.status].bg, color: routeStatuses[selectedRoute.status].color }"
              >
                {{ routeStatuses[selectedRoute.status].label }}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2 mb-4">
              <button
                @click="handleReoptimize"
                :disabled="actionLoading === 'reoptimize'"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCw :size="13" :class="actionLoading === 'reoptimize' ? 'animate-spin' : ''" />
                Yeniden Optimize Et
              </button>
              <button
                @click="openDetailModal(selectedRoute)"
                :class="['flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer', dark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
              >
                <Eye :size="13" />
                Detayli Goruntule
              </button>
            </div>

            <!-- Action Message -->
            <div v-if="actionMessage" class="mb-3 px-3 py-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
              {{ actionMessage }}
            </div>

            <div class="space-y-2 text-sm mb-4">
              <div class="flex justify-between">
                <span :class="dark ? 'text-slate-400' : 'text-slate-500'">Kurye</span>
                <span :class="['font-medium', dark ? 'text-slate-200' : 'text-slate-700']">{{ selectedRoute.courier }}</span>
              </div>
              <div class="flex justify-between">
                <span :class="dark ? 'text-slate-400' : 'text-slate-500'">Bolge</span>
                <span :class="dark ? 'text-slate-200' : 'text-slate-700'">{{ selectedRoute.region }}</span>
              </div>
              <div class="flex justify-between">
                <span :class="dark ? 'text-slate-400' : 'text-slate-500'">Mesafe</span>
                <span :class="dark ? 'text-slate-200' : 'text-slate-700'">{{ selectedRoute.totalDistance }} km</span>
              </div>
              <div class="flex justify-between">
                <span :class="dark ? 'text-slate-400' : 'text-slate-500'">Tahmini Sure</span>
                <span :class="dark ? 'text-slate-200' : 'text-slate-700'">{{ selectedRoute.estimatedTime }} dk</span>
              </div>
              <div class="flex justify-between">
                <span :class="dark ? 'text-slate-400' : 'text-slate-500'">Baslangic</span>
                <span :class="dark ? 'text-slate-200' : 'text-slate-700'">{{ formatDateTime(selectedRoute.startedAt) }}</span>
              </div>
            </div>

            <!-- Stops -->
            <h4 :class="['text-sm font-semibold mb-3', dark ? 'text-slate-200' : 'text-slate-700']">Duraklar ({{ selectedRoute.completedStops }}/{{ selectedRoute.orderCount }})</h4>
            <div class="space-y-2 max-h-[300px] overflow-y-auto">
              <div
                v-for="(stop, idx) in selectedRoute.stops"
                :key="stop.id"
                :class="[
                  'flex items-center gap-3 p-2.5 rounded-lg group',
                  stop.status === 'delivered' ? 'bg-green-50/50' : stop.status === 'in_transit' ? 'bg-blue-50/50' : (dark ? 'bg-slate-750' : 'bg-slate-50')
                ]"
              >
                <div class="flex flex-col items-center">
                  <CheckCircle v-if="stop.status === 'delivered'" :size="16" class="text-green-500" />
                  <Navigation v-else-if="stop.status === 'in_transit'" :size="16" class="text-blue-500" />
                  <div v-else :class="['w-4 h-4 border-2 rounded-full', dark ? 'border-slate-500' : 'border-slate-300']" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p :class="['text-xs font-medium', dark ? 'text-slate-200' : 'text-slate-700']">{{ stop.orderNumber }}</p>
                    <span :class="['text-xs', dark ? 'text-slate-500' : 'text-slate-400']">#{{ idx + 1 }}</span>
                  </div>
                  <p :class="['text-xs truncate', dark ? 'text-slate-400' : 'text-slate-500']">{{ stop.customer }} - {{ stop.address }}</p>
                </div>
                <button
                  v-if="stop.status === 'pending'"
                  @click.stop="handleRemoveStop(stop.id)"
                  class="p-1 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Rotadan Cikar"
                >
                  <Trash2 :size="12" class="text-red-400" />
                </button>
              </div>
            </div>
          </div>

          <!-- Detail Modal -->
          <Teleport to="body">
            <div v-if="showDetailModal && selectedRoute" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="showDetailModal = false">
              <div :class="['rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden', dark ? 'bg-slate-800' : 'bg-white']">
                <div :class="['flex items-center justify-between px-6 py-4 border-b', dark ? 'border-slate-700' : 'border-slate-200']">
                  <div>
                    <h2 :class="['text-lg font-bold', dark ? 'text-white' : 'text-slate-800']">{{ selectedRoute.routeNumber }}</h2>
                    <p :class="['text-sm', dark ? 'text-slate-400' : 'text-slate-500']">{{ selectedRoute.courier }} - {{ selectedRoute.region }}</p>
                  </div>
                  <button @click="showDetailModal = false" :class="['p-2 rounded-lg cursor-pointer', dark ? 'hover:bg-slate-700' : 'hover:bg-slate-100']">
                    <X :size="18" :class="dark ? 'text-slate-400' : 'text-slate-500'" />
                  </button>
                </div>
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                  <!-- Stats -->
                  <div class="grid grid-cols-4 gap-3 mb-6">
                    <div :class="['rounded-xl p-3 text-center', dark ? 'bg-slate-750' : 'bg-slate-50']">
                      <p :class="['text-lg font-bold', dark ? 'text-white' : 'text-slate-800']">{{ selectedRoute.orderCount }}</p>
                      <p :class="['text-xs', dark ? 'text-slate-400' : 'text-slate-500']">Toplam Durak</p>
                    </div>
                    <div :class="['rounded-xl p-3 text-center', dark ? 'bg-slate-750' : 'bg-slate-50']">
                      <p class="text-lg font-bold text-green-600">{{ selectedRoute.completedStops }}</p>
                      <p :class="['text-xs', dark ? 'text-slate-400' : 'text-slate-500']">Tamamlanan</p>
                    </div>
                    <div :class="['rounded-xl p-3 text-center', dark ? 'bg-slate-750' : 'bg-slate-50']">
                      <p :class="['text-lg font-bold', dark ? 'text-white' : 'text-slate-800']">{{ selectedRoute.totalDistance }} km</p>
                      <p :class="['text-xs', dark ? 'text-slate-400' : 'text-slate-500']">Mesafe</p>
                    </div>
                    <div :class="['rounded-xl p-3 text-center', dark ? 'bg-slate-750' : 'bg-slate-50']">
                      <p :class="['text-lg font-bold', dark ? 'text-white' : 'text-slate-800']">{{ selectedRoute.estimatedTime }} dk</p>
                      <p :class="['text-xs', dark ? 'text-slate-400' : 'text-slate-500']">Tahmini Sure</p>
                    </div>
                  </div>

                  <!-- Waypoints -->
                  <h3 :class="['text-sm font-semibold mb-3', dark ? 'text-slate-200' : 'text-slate-700']">Tum Duraklar</h3>
                  <div class="space-y-2">
                    <div
                      v-for="(stop, idx) in selectedRoute.stops"
                      :key="stop.id"
                      :class="['flex items-center gap-3 p-3 rounded-lg border', stop.status === 'delivered' ? 'bg-green-50 border-green-100' : stop.status === 'in_transit' ? 'bg-blue-50 border-blue-100' : (dark ? 'bg-slate-750 border-slate-600' : 'bg-white border-slate-100')]"
                    >
                      <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" :class="stop.status === 'delivered' ? 'bg-green-500 text-white' : stop.status === 'in_transit' ? 'bg-blue-500 text-white' : (dark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600')">
                        {{ idx + 1 }}
                      </span>
                      <div class="flex-1">
                        <p :class="['text-sm font-medium', dark ? 'text-slate-200' : 'text-slate-700']">{{ stop.orderNumber }} - {{ stop.customer }}</p>
                        <p :class="['text-xs', dark ? 'text-slate-400' : 'text-slate-500']">{{ stop.address }}</p>
                      </div>
                      <div class="flex gap-1">
                        <button v-if="stop.status === 'pending'" @click="handleRemoveStop(stop.id)" class="p-1.5 hover:bg-red-50 rounded cursor-pointer" title="Cikar">
                          <Trash2 :size="13" class="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Search, RefreshCw, Eye, MapPin, Truck, Clock, Package,
  Play, Pause, CheckCircle, Navigation, ChevronRight, Map, Route,
  AlertTriangle, RotateCw, Trash2, ArrowUpDown, X, List, LayoutGrid,
  Moon, Sun, Download, Merge
} from 'lucide-vue-next'
import { getRoutes, reoptimizeRoute, insertOrderToRoute, removeOrderFromRoute } from '@/services/api'
import { formatNumber, formatDateTime } from '@/utils'

const router = useRouter()

const routeStatuses = {
  active: { label: 'Aktif', color: '#10b981', bg: '#d1fae5' },
  paused: { label: 'Durduruldu', color: '#f59e0b', bg: '#fef3c7' },
  completed: { label: 'Tamamlandi', color: '#6366f1', bg: '#e0e7ff' },
  cancelled: { label: 'Iptal', color: '#ef4444', bg: '#fee2e2' },
}

const routes = ref([])
const search = ref('')
const statusFilter = ref('')
const selectedRoute = ref(null)
const loading = ref(false)
const error = ref(null)

// View mode & dark mode
const viewMode = ref('list')
const dark = ref(false)

// Batch selection
const selectedIds = ref([])

// Hover popup
const hoveredRouteId = ref(null)

// Kanban columns config
const kanbanColumns = [
  { key: 'planned', label: 'Planlandi', dotColor: '#f59e0b', statuses: ['paused'] },
  { key: 'active', label: 'Aktif', dotColor: '#10b981', statuses: ['active'] },
  { key: 'completed', label: 'Tamamlandi', dotColor: '#6366f1', statuses: ['completed', 'cancelled'] },
]

const kanbanData = computed(() => {
  const result = { planned: [], active: [], completed: [] }
  filtered.value.forEach(route => {
    if (route.status === 'paused') result.planned.push(route)
    else if (route.status === 'active') result.active.push(route)
    else result.completed.push(route)
  })
  return result
})

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getRoutes()
    if (res.ok) {
      const data = Array.isArray(res.data) ? res.data : res.data?.routes || []
      if (data.length > 0) {
        routes.value = data.map(r => ({ ...r, maxCapacity: r.maxCapacity || 15 }))
        selectedRoute.value = data[0]
        loading.value = false
        return
      }
    }
  } catch (err) {
    console.warn('[RouteList] API hatasi, mock veriye donuluyor:', err.message)
  }

  // Fallback to mock data if API returns empty or fails
  const courierNames = [
    'Serkan Acar', 'Murat Yildirim', 'Hakan Tekin', 'Kemal Bas',
    'Selim Dursun', 'Taner Gul', 'Volkan Aslan', 'Cem Ozkan',
    'Baris Ay', 'Erkan Sahin', 'Firat Kocer', 'Deniz Uysal'
  ]
  const regions = ['Kadikoy', 'Besiktas', 'Sisli', 'Uskudar', 'Bakirkoy', 'Fatih', 'Atasehir', 'Maltepe']
  const statuses = ['active', 'active', 'active', 'active', 'active', 'paused', 'completed', 'completed']

  const mockRoutes = Array.from({ length: 12 }, (_, i) => {
    const maxCapacity = Math.floor(Math.random() * 5) + 12
    const totalStops = Math.floor(Math.random() * 8) + 5
    const completedStops = Math.floor(Math.random() * totalStops)
    const status = statuses[i % statuses.length]
    return {
      _id: `route-${i}`,
      routeNumber: `RT-${String(2000 + i).padStart(4, '0')}`,
      courier: courierNames[i % courierNames.length],
      region: regions[i % regions.length],
      orderCount: totalStops,
      maxCapacity,
      completedStops,
      progress: status === 'completed' ? 100 : Math.round((completedStops / totalStops) * 100),
      status,
      totalDistance: (Math.random() * 30 + 5).toFixed(1),
      estimatedTime: Math.floor(Math.random() * 120) + 30,
      eta: new Date(Date.now() + (Math.random() * 7200000)).toISOString(),
      startedAt: new Date(Date.now() - Math.random() * 14400000).toISOString(),
      stops: Array.from({ length: totalStops }, (_, j) => ({
        id: `stop-${i}-${j}`,
        orderNumber: `BRN-${String(1100 + i * 10 + j).padStart(6, '0')}`,
        customer: ['Ahmet Y.', 'Mehmet K.', 'Fatma D.', 'Ayse C.', 'Ali S.'][j % 5],
        address: `${regions[(i + j) % regions.length]} Mah. Ataturk Cad. No:${Math.floor(Math.random() * 200)}`,
        status: j < completedStops ? 'delivered' : j === completedStops ? 'in_transit' : 'pending',
        eta: new Date(Date.now() + j * 1200000).toISOString(),
      })),
    }
  })
  routes.value = mockRoutes
  selectedRoute.value = mockRoutes[0]
  loading.value = false
})

const filtered = computed(() => {
  return routes.value.filter(r => {
    const matchSearch = !search.value ||
      r.routeNumber.toLowerCase().includes(search.value.toLowerCase()) ||
      r.courier.toLowerCase().includes(search.value.toLowerCase()) ||
      r.region.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !statusFilter.value || r.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

const activeCount = computed(() => routes.value.filter(r => r.status === 'active').length)
const totalOrders = computed(() => routes.value.reduce((sum, r) => sum + r.orderCount, 0))
const avgProgress = computed(() => {
  if (routes.value.length === 0) return 0
  return Math.round(routes.value.reduce((sum, r) => sum + r.progress, 0) / routes.value.length)
})

function getProgressColor(progress) {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 50) return 'bg-blue-500'
  if (progress >= 25) return 'bg-amber-500'
  return 'bg-slate-300'
}

function getCapacityColor(current, max) {
  const ratio = current / max
  if (ratio >= 0.9) return 'bg-red-500'
  if (ratio >= 0.7) return 'bg-amber-500'
  if (ratio >= 0.4) return 'bg-blue-500'
  return 'bg-emerald-500'
}

function getRouteStatus(route) {
  return routeStatuses[route.status] || routeStatuses.active
}

// Batch selection
function toggleSelect(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function toggleSelectAll() {
  if (selectedIds.value.length === filtered.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = filtered.value.map(r => r._id)
  }
}

function handleBatchMerge() {
  if (selectedIds.value.length < 2) return
  actionMessage.value = `${selectedIds.value.length} rota birlestirildi (simule)`
  selectedIds.value = []
}

function handleBatchReoptimize() {
  actionMessage.value = `${selectedIds.value.length} rota yeniden optimize edildi (simule)`
  selectedIds.value = []
}

function handleBatchExport() {
  actionMessage.value = `${selectedIds.value.length} rota export edildi (simule)`
  selectedIds.value = []
}

// Route detail modal
const showDetailModal = ref(false)
const actionLoading = ref('')
const actionMessage = ref('')

function openDetailModal(route) {
  selectedRoute.value = route
  showDetailModal.value = true
  actionMessage.value = ''
}

async function handleReoptimize() {
  if (!selectedRoute.value) return
  actionLoading.value = 'reoptimize'
  actionMessage.value = ''
  const res = await reoptimizeRoute(selectedRoute.value._id)
  actionLoading.value = ''
  actionMessage.value = res.ok ? 'Rota yeniden optimize edildi' : 'Optimizasyon baslatildi (API baglantisi bekleniyor)'
}

async function handleRemoveStop(stopId) {
  if (!selectedRoute.value) return
  actionLoading.value = 'remove'
  const res = await removeOrderFromRoute(selectedRoute.value._id, stopId)
  actionLoading.value = ''
  if (res.ok) {
    selectedRoute.value.stops = selectedRoute.value.stops.filter(s => s.id !== stopId)
    selectedRoute.value.orderCount = selectedRoute.value.stops.length
  }
  actionMessage.value = 'Durak rotadan cikarildi'
}
</script>
