<template>
  <div class="relative">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Zimmet & Nakit Takip</h1>
      <div class="flex items-center gap-3">
        <input type="date" :defaultValue="new Date().toISOString().split('T')[0]" class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300" />
        <select v-model="project" class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <option v-for="p in PROJECTS" :key="p">{{ p }}</option>
        </select>
        <button @click="refreshData" class="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"><RefreshCw :size="16" class="text-slate-500" /></button>
        <button class="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"><Download :size="14" /> Export</button>
      </div>
    </div>

    <!-- KPI Cards: Toplam Ekipman | Aktif | Bakimda | Kayip -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="'kpi-sk-'+i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div class="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
          <div class="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </template>
      <template v-else>
        <div v-for="(c, i) in equipmentKpiCards" :key="'kpi-'+i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{{ c.label }}</span>
            <div :class="['p-2 rounded-lg', c.bg]"><component :is="c.icon" :size="16" :class="c.color" /></div>
          </div>
          <div class="text-2xl font-bold text-slate-800 dark:text-white">{{ c.value }}</div>
          <p class="text-xs text-slate-400 mt-1">{{ c.sub }}</p>
        </div>
      </template>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <template v-if="loading">
        <div v-for="i in 4" :key="'sum-sk-'+i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div class="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div class="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
          <div class="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </template>
      <template v-else>
        <div v-for="(c, i) in summaryCards" :key="i" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{{ c.label }}</span>
            <div :class="['p-2 rounded-lg', c.bg]"><component :is="c.icon" :size="16" :class="c.color" /></div>
          </div>
          <div class="text-2xl font-bold text-slate-800 dark:text-white">{{ c.value }}</div>
          <p class="text-xs text-slate-400 mt-1">{{ c.sub }}</p>
        </div>
      </template>
    </div>

    <!-- Maintenance Calendar Warnings -->
    <div v-if="!loading && maintenanceWarnings.length > 0" class="mb-4 space-y-2">
      <div v-for="w in maintenanceWarnings" :key="w.id" :class="['flex items-center gap-3 px-4 py-3 rounded-xl border', w.days < 7 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800']">
        <Wrench :size="16" :class="w.days < 7 ? 'text-red-600' : 'text-yellow-600'" />
        <span :class="['text-sm font-medium', w.days < 7 ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400']">
          {{ w.name }} - {{ w.equipment }} bakim tarihi {{ w.days }} gun sonra ({{ w.date }})
        </span>
        <span :class="['ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold', w.days < 7 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300']">
          {{ w.days < 7 ? 'ACIL' : 'YAKIN' }}
        </span>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
      <div class="flex items-center gap-4">
        <div class="relative flex-1 max-w-xs">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="search" @input="page = 1" placeholder="Kurye ara..." class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs text-slate-500 dark:text-slate-400 mr-1">Durum:</span>
          <button v-for="s in STATUSES" :key="s.key" @click="statusFilter = s.key; page = 1" :class="['px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors', statusFilter === s.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']">{{ s.label }}</button>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs text-slate-500 dark:text-slate-400 mr-1">Risk:</span>
          <button v-for="r in RISK_FILTERS" :key="r.key" @click="riskFilter = r.key; page = 1" :class="['px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors', riskFilter === r.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']">{{ r.label }}</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800">
              <th v-for="h in ['Kurye', 'Durum', 'Atanan Kurye', 'Zimmet', 'Teslim', 'Bekleyen', 'Basarisiz', 'Nakit Uzerinde', 'Risk', 'Son Aktivite', 'Islemler']" :key="h" class="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton loading rows -->
            <template v-if="loading">
              <tr v-for="i in PAGE_SIZE" :key="'sk-'+i" class="border-b border-slate-50 dark:border-slate-800/50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div>
                      <div class="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                      <div class="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3"><div class="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /></td>
                <td class="px-4 py-3"><div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                <td class="px-4 py-3"><div class="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                <td class="px-4 py-3"><div class="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                <td class="px-4 py-3"><div class="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                <td class="px-4 py-3"><div class="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                <td class="px-4 py-3"><div class="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                <td class="px-4 py-3"><div class="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /></td>
                <td class="px-4 py-3"><div class="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                <td class="px-4 py-3"><div class="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
              </tr>
            </template>
            <!-- Data rows -->
            <template v-else>
              <tr v-for="c in paged" :key="c.id" class="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative cursor-pointer" @click="detail = c" @mouseenter="hovered = c.id" @mouseleave="hovered = null">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{{ initials(c.name) }}</div>
                    <div>
                      <p class="font-medium text-slate-800 dark:text-white text-sm">{{ c.name }}</p>
                      <p class="text-[11px] text-slate-400">{{ c.location }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3"><span :class="['px-2 py-1 rounded-full text-[11px] font-medium', statusColor(c.status)]">{{ statusLabel(c.status) }}</span></td>

                <!-- Atanan Kurye column -->
                <td class="px-4 py-3">
                  <template v-if="c.assignedCourier">
                    <router-link :to="`/couriers/${c.assignedCourier.id}`" class="text-primary hover:underline text-sm font-medium" @click.stop>
                      {{ c.assignedCourier.name }}
                    </router-link>
                  </template>
                  <template v-else>
                    <button @click.stop="openAssignEquipmentModal(c)" class="flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium rounded-lg cursor-pointer transition-colors">
                      <UserPlus :size="12" /> Ekipman Ata
                    </button>
                  </template>
                </td>

                <td class="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{{ c.assigned }}</td>
                <td class="px-4 py-3 text-green-600 font-medium">{{ c.delivered }}</td>
                <td class="px-4 py-3 text-blue-600 font-medium">{{ c.pending }}</td>
                <td class="px-4 py-3 text-red-500 font-medium">{{ c.failed }}</td>
                <td class="px-4 py-3 font-semibold text-slate-800 dark:text-white">{{ c.cash > 0 ? fmt(c.cash) : '-' }}</td>
                <td class="px-4 py-3"><span :class="['px-2 py-1 rounded-full text-[11px] font-medium', riskOf(c.cash).cls]">{{ riskOf(c.cash).dot }} {{ riskOf(c.cash).label }}</span></td>
                <td class="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{{ c.lastActivity }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <button @click.stop="detail = c" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer" title="Detay"><Eye :size="14" class="text-slate-500" /></button>
                    <button @click.stop="cashModal = c; cashAmount = c.cash.toString(); cashType = 'full'" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer" title="Mutabakat"><ArrowRightLeft :size="14" class="text-slate-500" /></button>
                    <button @click.stop class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer" title="Mesaj"><MessageSquare :size="14" class="text-slate-500" /></button>
                  </div>
                </td>
                <!-- Hover tooltip -->
                <td v-if="hovered === c.id && c.status !== 'offline'" class="absolute right-0 top-0 z-30" style="position: absolute">
                  <div class="absolute right-4 top-2 w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 z-50">
                    <p class="font-semibold text-sm text-slate-800 dark:text-white mb-2">{{ c.name }} - Hizli Ozet</p>
                    <div class="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <p>Zimmetli: {{ c.assigned }} siparis</p>
                      <p>Teslim: {{ c.delivered }} | Bekleyen: {{ c.pending }}</p>
                      <p>Urunler: {{ [c.equipment.pos && 'POS', c.equipment.bag && 'Canta', c.equipment.phone && 'Tel', c.equipment.motor && 'Motor'].filter(Boolean).join(', ') || '-' }}</p>
                      <p>Nakit: {{ fmt(c.cash) }}</p>
                      <p>   {{ c.cashOrders }} kapida odeme teslimi</p>
                      <p>Ilk zimmet: {{ c.firstZimmet }}</p>
                      <p>Son teslim: {{ c.lastDelivery }}</p>
                    </div>
                    <div class="flex gap-2 mt-3">
                      <button @click="detail = c" class="px-2 py-1 bg-primary/10 text-primary text-[11px] font-medium rounded cursor-pointer hover:bg-primary/20">Detay Gor</button>
                      <button @click="cashModal = c; cashAmount = c.cash.toString(); cashType = 'full'" class="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium rounded cursor-pointer hover:bg-emerald-100">Mutabakat</button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
        <p class="text-xs text-slate-500 dark:text-slate-400">Toplam: {{ filtered.length }} kurye</p>
        <div class="flex items-center gap-1">
          <button @click="page = Math.max(1, page - 1)" :disabled="page === 1" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft :size="16" class="text-slate-500" /></button>
          <button v-for="p in visiblePages" :key="p" @click="page = p" :class="['w-8 h-8 rounded text-xs font-medium cursor-pointer', p === page ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700']">{{ p }}</button>
          <button @click="page = Math.min(totalPages, page + 1)" :disabled="page === totalPages" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight :size="16" class="text-slate-500" /></button>
        </div>
      </div>
    </div>

    <!-- Ekipman Ata Modal -->
    <div v-if="equipAssignModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="equipAssignModal = null" />
      <div class="relative w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UserPlus :size="20" class="text-primary" />
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Ekipman Ata</h3>
          </div>
          <button @click="equipAssignModal = null" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X :size="18" class="text-slate-500" /></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <p class="text-xs text-slate-500 mb-1">Kurye</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ equipAssignModal.name }}</p>
            <p class="text-xs text-slate-400">{{ equipAssignModal.location }}</p>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium text-slate-500 block">Atanacak Ekipmanlar</label>
            <label v-for="eq in quickAssignEquipment" :key="eq.key" :class="['flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors', eq.selected ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300']">
              <input type="checkbox" v-model="eq.selected" class="accent-primary" />
              <component :is="eq.icon" :size="16" :class="eq.selected ? 'text-primary' : 'text-slate-400'" />
              <span class="text-sm text-slate-700 dark:text-slate-300">{{ eq.label }}</span>
            </label>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <button @click="equipAssignModal = null" class="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Iptal</button>
          <button @click="equipAssignModal = null" class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors flex items-center gap-2"><Check :size="16" /> Ekipman Ata</button>
        </div>
      </div>
    </div>

    <!-- Detail Slide-over -->
    <div v-if="detail" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/30" @click="detail = null" />
      <div class="relative w-[560px] bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
        <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">{{ detail.name }} - Zimmet Detay</h2>
          <button @click="detail = null" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X :size="18" class="text-slate-500" /></button>
        </div>
        <div class="p-6 space-y-5">
          <!-- Courier info -->
          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">{{ initials(detail.name) }}</div>
              <div>
                <p class="font-semibold text-slate-800 dark:text-white">{{ detail.name }}</p>
                <p class="text-xs text-slate-500 flex items-center gap-1"><MapPin :size="11" /> {{ detail.location }}</p>
                <p class="text-xs text-slate-500 flex items-center gap-1"><Phone :size="11" /> {{ detail.phone }}</p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', statusColor(detail.status)]">{{ statusLabel(detail.status) }}</span>
              <div class="flex gap-1.5">
                <button class="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs rounded-lg cursor-pointer hover:bg-blue-100 flex items-center gap-1"><Phone :size="12" /> Ara</button>
                <button class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-lg cursor-pointer hover:bg-slate-200 flex items-center gap-1"><MessageSquare :size="12" /> Mesaj</button>
              </div>
            </div>
          </div>

          <!-- Equipment on courier -->
          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Uzerindeki Urunler</h4>
            <div class="flex flex-wrap gap-2">
              <div v-if="detail.equipment.pos" class="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <CreditCard :size="16" class="text-blue-600" />
                <div>
                  <p class="text-xs font-medium text-blue-800 dark:text-blue-300">POS Cihazi</p>
                  <p class="text-[10px] text-blue-500">SN: POS-{{ detail.id.toString().padStart(3, '0') }}</p>
                </div>
              </div>
              <div v-if="detail.equipment.bag" class="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <ShoppingBag :size="16" class="text-orange-600" />
                <div>
                  <p class="text-xs font-medium text-orange-800 dark:text-orange-300">Termal Canta</p>
                  <p class="text-[10px] text-orange-500">48L Buyuk Boy</p>
                </div>
              </div>
              <div v-if="detail.equipment.phone" class="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <Smartphone :size="16" class="text-purple-600" />
                <div>
                  <p class="text-xs font-medium text-purple-800 dark:text-purple-300">Sirket Telefonu</p>
                  <p class="text-[10px] text-purple-500">IMEI: ***{{ (detail.id * 137 % 1000).toString().padStart(3, '0') }}</p>
                </div>
              </div>
              <div v-if="detail.equipment.motor" class="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <Bike :size="16" class="text-emerald-600" />
                <div>
                  <p class="text-xs font-medium text-emerald-800 dark:text-emerald-300">Motorsiklet</p>
                  <p class="text-[10px] text-emerald-500">Plaka: 34 BRN {{ (detail.id * 41 % 900 + 100) }}</p>
                </div>
              </div>
              <p v-if="!detail.equipment.pos && !detail.equipment.bag && !detail.equipment.phone && !detail.equipment.motor" class="text-xs text-slate-400">Zimmetli urun yok</p>
            </div>
          </div>

          <!-- Summary cards -->
          <div class="grid grid-cols-4 gap-3">
            <div v-for="(s, i) in detailSummaryCards" :key="i" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
              <p class="text-lg mb-0.5">{{ s.icon }}</p>
              <p :class="['text-lg font-bold', s.color]">{{ s.value }}</p>
              <p class="text-[10px] text-slate-400 uppercase">{{ s.label }}</p>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-3">
            <div v-for="(s, i) in detailFinanceCards" :key="i" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
              <p :class="['text-sm font-bold', s.color]">{{ s.value }}</p>
              <p class="text-[10px] text-slate-400 mt-1">{{ s.label }}</p>
            </div>
          </div>

          <!-- Tab filter -->
          <div class="flex gap-1.5">
            <button v-for="t in detailTabs" :key="t.key" @click="tabFilter = t.key" :class="['px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors', tabFilter === t.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400']">{{ t.label }}</button>
          </div>

          <!-- Orders list -->
          <div class="space-y-2 max-h-72 overflow-y-auto">
            <div v-for="(o, i) in filteredOrders" :key="i" @click="router.push(`/orders/${o.id}`)" :class="['flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow', o.status === 'delivered' ? 'border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10' : o.status === 'failed' ? 'border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700']">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-medium text-slate-800 dark:text-white">#{{ o.id }}</span>
                  <span class="text-[11px] text-slate-400">{{ o.location }}</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">{{ o.customer }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ fmt(o.amount) }}</p>
                <div class="flex items-center gap-1.5 justify-end mt-0.5">
                  <span :class="['text-[11px]', o.payment === 'Nakit' ? 'text-orange-600' : o.payment === 'Kart' ? 'text-blue-600' : 'text-slate-400']">{{ o.payment }}</span>
                  <span :class="['text-[11px] font-medium', o.status === 'delivered' ? 'text-green-600' : o.status === 'failed' ? 'text-red-500' : 'text-blue-500']">
                    {{ o.status === 'delivered' ? `${o.time}` : o.status === 'failed' ? 'Basarisiz' : 'Yolda' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cash section -->
          <div class="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <h4 class="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">Nakit Tahsilat Detay</h4>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-slate-600 dark:text-slate-400">Toplam nakit uzerinde:</span>
              <span class="text-lg font-bold text-orange-700 dark:text-orange-400">{{ fmt(detail.cash) }}</span>
            </div>
            <p class="text-[11px] text-slate-500">{{ detail.cashOrders }} adet kapida nakit odeme</p>
            <div v-if="detail.cash >= 5000" class="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle :size="13" /> Nakit limitine yaklasiyor (Limit: 10,000)
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button @click="cashModal = detail; cashAmount = detail.cash.toString(); cashType = 'full'; detail = null" class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
              <Banknote :size="16" /> Nakit Teslim Al
            </button>
            <button class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <ArrowRightLeft :size="16" /> Siparis Aktar
            </button>
            <button class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
              <Receipt :size="16" /> Mutabakat
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Submit Modal -->
    <div v-if="cashModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="cashModal = null" />
      <div class="relative w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Banknote :size="20" class="text-emerald-600" />
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Nakit Teslim Al</h3>
          </div>
          <button @click="cashModal = null" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X :size="18" class="text-slate-500" /></button>
        </div>
        <div class="p-6 space-y-5">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Kurye:</span>
            <span class="font-semibold text-slate-800 dark:text-white">{{ cashModal.name }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Tarih:</span>
            <span class="text-slate-700 dark:text-slate-300">{{ new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>

          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <p class="text-xs text-slate-500 mb-1">Sistemde Kayitli Nakit</p>
            <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ fmt(cashModal.cash) }}</p>
            <p class="text-[11px] text-slate-400">{{ cashModal.cashOrders }} adet kapida nakit odeme</p>
          </div>

          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1.5">Teslim Edilen Tutar</label>
            <input type="text" v-model="cashAmount" class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="0" />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-medium text-slate-500">Teslim Sekli</label>
            <label v-for="o in cashTypeOptions" :key="o.v" class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="cashType" :value="o.v" v-model="cashType" class="accent-primary" />
              <span class="text-sm text-slate-700 dark:text-slate-300">{{ o.l }}</span>
            </label>
          </div>

          <!-- Mutabakat -->
          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Mutabakat</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm"><span class="text-slate-500">Sistemde:</span><span class="font-medium text-slate-800 dark:text-white">{{ fmt(cashModal.cash) }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-slate-500">Teslim edilen:</span><span class="font-medium text-slate-800 dark:text-white">{{ fmt(parseInt(cashAmount) || 0) }}</span></div>
              <div class="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm">
                <span class="text-slate-500">Fark:</span>
                <span :class="['font-bold', cashDiff === 0 ? 'text-green-600' : 'text-red-600']">{{ cashDiff === 0 ? 'Mutabik' : fmt(cashDiff) }}</span>
              </div>
            </div>
          </div>

          <div v-if="cashType === 'diff'" class="space-y-2">
            <label class="text-xs font-medium text-slate-500">Fark Nedeni</label>
            <label v-for="r in cashReasons" :key="r" class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="reason" :value="r" v-model="cashReason" class="accent-primary" />
              <span class="text-xs text-slate-700 dark:text-slate-300">{{ r }}</span>
            </label>
          </div>

          <div>
            <label class="text-xs font-medium text-slate-500 block mb-1">Not</label>
            <input v-model="cashNote" placeholder="Opsiyonel not..." class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
          <button @click="cashModal = null" class="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Iptal</button>
          <button @click="cashModal = null" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors flex items-center gap-2"><CheckCircle :size="16" /> Teslim Alindi Onayla</button>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
  InventoryDashboard.vue - Zimmet & Nakit Takip Sayfasi
  =====================================================
  Bu sayfa kuryelerin zimmetindeki siparisleri, nakit durumlarini ve
  ekipmanlarini takip etmek icin kullanilir.

  Ozellikler:
  - 4 KPI karti: Toplam Ekipman, Aktif, Bakimda, Kayip
  - Atanan Kurye kolonu + Ekipman Ata hizli aksiyonu
  - Bakim takvimi uyarilari (<7 gun = kirmizi, <30 gun = sari)
  - Skeleton loading + dark mode destegi
  - Kurye listesi: Arama, durum filtresi, risk filtresi ile filtrelenebilir tablo
  - Satira tiklaninca sag taraftan detay paneli (slide-over) acilir
  - Detay panelindeki siparislere tiklaninca siparis detay sayfasina yonlendirilir
  - Nakit teslim alma modali ile mutabakat yapilabilir
  - Hover ile hizli ozet popup goruntulenir

  Not: Tum veriler mock (sahte) veridir, API entegrasyonunda degistirilecek.
-->
<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, RefreshCw, Download, Users, Package, Banknote, AlertTriangle,
  ChevronLeft, ChevronRight, X, Phone, MessageSquare, Eye, CheckCircle,
  Clock, Coffee, WifiOff, Truck, MapPin, ArrowRightLeft, Receipt,
  Smartphone, ShoppingBag, CreditCard, Bike, Wrench, UserPlus, Check,
  Box, Activity, ShieldAlert, HelpCircle
} from 'lucide-vue-next'

const router = useRouter()

// Para birimi formatlama (TL)
const fmt = (n) => '\u20BA' + n.toLocaleString('tr-TR')

// ========== LOADING STATE ==========
const loading = ref(true)

onMounted(() => {
  // Simulate API loading
  setTimeout(() => {
    loading.value = false
  }, 1200)
})

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 800)
}

// ========== SABIT DEGERLER ==========

// Proje filtreleri
const PROJECTS = ['Tumu', 'Istanbul Ana Dagitim', 'Ankara Bolge', 'Izmir Sahil', 'Express Teslimat', 'Gida Dagitim']

// Kurye durum secenekleri
const STATUSES = [
  { key: 'all', label: 'Tumu' },
  { key: 'delivering', label: 'Dagitimda', color: 'bg-green-500' },
  { key: 'break', label: 'Mola', color: 'bg-yellow-500' },
  { key: 'atDelivery', label: 'Teslimde', color: 'bg-blue-500' },
  { key: 'offline', label: 'Offline', color: 'bg-slate-400' },
]

// Nakit risk seviyesi filtreleri
const RISK_FILTERS = [
  { key: 'all', label: 'Tumu' },
  { key: 'normal', label: 'Normal', color: 'text-green-600' },
  { key: 'attention', label: 'Dikkat', color: 'text-yellow-600' },
  { key: 'risky', label: 'Riskli', color: 'text-red-600' },
  { key: 'critical', label: 'Kritik', color: 'text-red-800' },
]

// ========== YARDIMCI FONKSIYONLAR ==========

/**
 * Kuryenin uzerindeki nakit miktarina gore risk seviyesini hesaplar.
 * 10K+ = Kritik, 5K+ = Riskli, 3K+ = Dikkat, altI = Normal
 */
function riskOf(cash) {
  if (cash >= 10000) return { level: 'critical', label: 'Kritik', dot: '', cls: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' }
  if (cash >= 5000) return { level: 'risky', label: 'Riskli', dot: '', cls: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' }
  if (cash >= 3000) return { level: 'attention', label: 'Dikkat', dot: '', cls: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' }
  return { level: 'normal', label: 'Normal', dot: '', cls: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' }
}

// Kurye durum etiketleri (Turkce)
const statusLabel = (s) => {
  const map = { delivering: 'Dagitimda', break: 'Mola', atDelivery: 'Teslimde', offline: 'Offline' }
  return map[s] || s
}

// Kurye durum renkleri (Tailwind class)
const statusColor = (s) => {
  const map = { delivering: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', break: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', atDelivery: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', offline: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500' }
  return map[s] || ''
}

// ========== MOCK VERI URETIMI ==========

const NAMES = [
  'Ali Riza Kaya', 'Mehmet Yilmaz', 'Veli Aksoy', 'Ayse Demir', 'Can Ozdemir',
  'Fatma Sari', 'Emre Koc', 'Zeynep Turk', 'Hasan Mutlu', 'Burak Celik',
  'Derya Aydin', 'Oguz Kara', 'Selin Bal', 'Kemal Usta', 'Nurgul Sen',
  'Tuncay Yildiz', 'Emine Gunes', 'Ibrahim Tas', 'Pinar Eren', 'Murat Kocak',
  'Gokhan Arslan', 'Sibel Dogan', 'Cem Aktas', 'Deniz Polat',
]

// Deterministik rastgele sayi ureteci (ayni index her zaman ayni sonucu verir)
function seed(i) { return ((i * 9301 + 49297) % 233280) / 233280 }

// 24 adet mock kurye verisi olustur
const COURIERS = NAMES.map((name, i) => {
  const s = seed(i)
  const statuses = ['delivering', 'delivering', 'delivering', 'break', 'atDelivery', 'offline']
  const status = statuses[Math.floor(s * statuses.length)]
  const assigned = status === 'offline' ? 0 : 5 + Math.floor(seed(i + 1) * 13)
  const delivered = status === 'offline' ? 0 : Math.floor(assigned * (0.4 + seed(i + 2) * 0.5))
  const failed = status === 'offline' ? 0 : Math.floor(seed(i + 3) * 2)
  const pending = assigned - delivered - failed
  const cash = status === 'offline' ? 0 : Math.floor(seed(i + 4) * 14000)
  const mins = Math.floor(seed(i + 5) * 240)
  // Atanan kurye - bazi kuryeler atanmis, bazilari atanmamis
  const hasAssigned = seed(i + 20) > 0.35
  const assignedCourier = hasAssigned ? {
    id: i + 100,
    name: NAMES[(i + 5) % NAMES.length].split(' ').slice(0, 2).join(' ')
  } : null
  // Bakim tarihi mock: bazilarina yakin bakim tarihi ata
  const maintenanceDaysLeft = seed(i + 25) < 0.15 ? Math.floor(seed(i + 26) * 5) + 2 : seed(i + 25) < 0.3 ? Math.floor(seed(i + 27) * 20) + 10 : null

  return {
    id: i + 1, name, status, assigned, delivered, pending, failed, cash,
    lastActivity: mins < 5 ? 'Az once' : mins < 60 ? `${mins} dk once` : `${Math.floor(mins / 60)} saat once`,
    phone: `053${Math.floor(seed(i + 6) * 9)}${Math.floor(seed(i + 7) * 10000000).toString().padStart(7, '0')}`,
    location: ['Kadikoy', 'Besiktas', 'Uskudar', 'Sisli', 'Bakirkoy', 'Atasehir', 'Maltepe', 'Pendik'][Math.floor(seed(i + 8) * 8)],
    firstZimmet: `0${8 + Math.floor(seed(i + 9) * 2)}:${Math.floor(seed(i + 10) * 50).toString().padStart(2, '0')}`,
    lastDelivery: delivered > 0 ? `${12 + Math.floor(seed(i + 11) * 6)}:${Math.floor(seed(i + 12) * 59).toString().padStart(2, '0')}` : '-',
    cashOrders: Math.floor(seed(i + 13) * 6),
    equipment: {
      pos: seed(i + 14) > 0.3,
      bag: seed(i + 15) > 0.15,
      phone: seed(i + 16) > 0.4,
      motor: seed(i + 17) > 0.5,
    },
    assignedCourier,
    maintenanceDaysLeft,
  }
})

// ========== EKIPMAN KPI HESAPLAMALARI ==========

const equipmentTotals = computed(() => {
  let total = 0, active = 0, maintenance = 0, lost = 0
  COURIERS.forEach(c => {
    const eqCount = [c.equipment.pos, c.equipment.bag, c.equipment.phone, c.equipment.motor].filter(Boolean).length
    total += eqCount
    if (c.status !== 'offline') {
      active += eqCount
    }
    if (c.maintenanceDaysLeft !== null && c.maintenanceDaysLeft < 7) {
      maintenance += 1
    }
  })
  lost = Math.floor(total * 0.02) // %2 kayip orani mock
  return { total, active, maintenance, lost }
})

const equipmentKpiCards = computed(() => [
  { icon: Box, label: 'Toplam Ekipman', value: equipmentTotals.value.total, sub: 'envanterdeki toplam', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: Activity, label: 'Aktif', value: equipmentTotals.value.active, sub: 'kullanilmakta', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { icon: Wrench, label: 'Bakimda', value: equipmentTotals.value.maintenance, sub: 'bakim gerekli', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { icon: ShieldAlert, label: 'Kayip', value: equipmentTotals.value.lost, sub: 'kayip/hasarli', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
])

// ========== BAKIM TAKVIMI UYARILARI ==========

const maintenanceWarnings = computed(() => {
  const today = new Date()
  return COURIERS
    .filter(c => c.maintenanceDaysLeft !== null && c.maintenanceDaysLeft < 30)
    .map(c => {
      const futureDate = new Date(today)
      futureDate.setDate(futureDate.getDate() + c.maintenanceDaysLeft)
      const eqName = c.equipment.motor ? 'Motor' : c.equipment.pos ? 'POS' : 'Canta'
      return {
        id: c.id,
        name: c.name,
        equipment: eqName,
        days: c.maintenanceDaysLeft,
        date: futureDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
      }
    })
    .sort((a, b) => a.days - b.days)
})

// ========== EKIPMAN ATA MODAL ==========

const equipAssignModal = ref(null)
const quickAssignEquipment = reactive([
  { key: 'pos', label: 'POS Cihazi', icon: CreditCard, selected: false },
  { key: 'bag', label: 'Termal Canta', icon: ShoppingBag, selected: false },
  { key: 'phone', label: 'Sirket Telefonu', icon: Smartphone, selected: false },
  { key: 'motor', label: 'Motorsiklet', icon: Bike, selected: false },
])

const openAssignEquipmentModal = (courier) => {
  quickAssignEquipment.forEach(eq => eq.selected = false)
  equipAssignModal.value = courier
}

// ========== REACTIVE STATE ==========

const PAGE_SIZE = 10

const search = ref('')           // Kurye arama metni
const statusFilter = ref('all')  // Secili durum filtresi
const riskFilter = ref('all')    // Secili risk filtresi
const project = ref('Tumu')      // Secili proje filtresi
const page = ref(1)              // Aktif sayfa numarasi
const detail = ref(null)         // Detay panelinde gosterilecek kurye (null = kapali)
const cashModal = ref(null)      // Nakit teslim modalinda gosterilecek kurye (null = kapali)
const cashAmount = ref('')       // Nakit teslim modal - girilen tutar
const cashType = ref('full')     // Nakit teslim modal - teslim sekli
const cashReason = ref('')       // Nakit teslim modal - fark nedeni
const cashNote = ref('')         // Nakit teslim modal - not
const hovered = ref(null)        // Hover edilen kurye ID (tooltip icin)
const tabFilter = ref('all')     // Detay paneli siparis filtresi

// ========== COMPUTED DEGERLER ==========

// Ana tablo filtreleme: Arama + durum + risk filtrelerini uygular
const filtered = computed(() => {
  return COURIERS.filter(c => {
    if (search.value && !c.name.toLowerCase().includes(search.value.toLowerCase())) return false
    if (statusFilter.value !== 'all' && c.status !== statusFilter.value) return false
    if (riskFilter.value !== 'all' && riskOf(c.cash).level !== riskFilter.value) return false
    return true
  })
})

// Sayfalama hesaplamalari
const totalPages = computed(() => Math.ceil(filtered.value.length / PAGE_SIZE))
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// Sayfa numarasi butonlari (aktif sayfanin etrafinda 5 sayfa goster)
const visiblePages = computed(() => {
  const arr = Array.from({ length: totalPages.value }, (_, i) => i + 1)
  return arr.slice(Math.max(0, page.value - 3), page.value + 2)
})

// Ust kisim ozet kartlari icin toplam degerler
const totals = computed(() => ({
  active: COURIERS.filter(c => c.status !== 'offline').length,
  orders: COURIERS.reduce((s, c) => s + c.assigned, 0),
  cash: COURIERS.reduce((s, c) => s + c.cash, 0),
  risky: COURIERS.filter(c => c.cash >= 5000).length,
}))

// Ozet kartlari konfigurasyonu (icon, renk, deger)
const summaryCards = computed(() => [
  { icon: Users, label: 'Aktif Kurye', value: totals.value.active, sub: 'online', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: Package, label: 'Zimmetli Siparis', value: totals.value.orders, sub: 'uzerlerinde', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { icon: Banknote, label: 'Toplam Nakit', value: fmt(totals.value.cash), sub: 'tahsil edildi', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: AlertTriangle, label: 'Riskli Kurye', value: totals.value.risky, sub: '>5K nakit', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
])

// Isim bas harflerini alma (avatar icin)
const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2)

// ========== DETAY PANELI COMPUTED ==========

// Secili kuryenin zimmetindeki siparisler (mock)
const detailOrders = computed(() => {
  if (!detail.value) return []
  const d = detail.value
  return Array.from({ length: d.assigned }, (_, i) => ({
    id: `BRN-${4500 + d.id * 10 + i}`,
    customer: ['Ahmet Y.', 'Ayse D.', 'Can O.', 'Zeynep A.', 'Emre K.', 'Fatma S.', 'Mehmet T.', 'Hasan B.', 'Selin K.', 'Burak M.', 'Derya A.', 'Oguz N.', 'Nurgul S.', 'Kemal U.', 'Pinar E.', 'Tuncay Y.', 'Gokhan A.'][i % 17],
    amount: 100 + Math.floor(seed(d.id * 100 + i) * 800),
    payment: ['Nakit', 'Nakit', 'Kart', 'Odendi'][Math.floor(seed(d.id * 100 + i + 50) * 4)],
    status: i < d.delivered ? 'delivered' : i < d.delivered + d.pending ? 'pending' : 'failed',
    time: i < d.delivered ? `${12 + Math.floor(seed(d.id * 100 + i + 30) * 6)}:${Math.floor(seed(d.id * 100 + i + 31) * 59).toString().padStart(2, '0')}` : '-',
    location: ['Kadikoy', 'Moda', 'Caddebostan', 'Fenerbahce', 'Acibadem', 'Kozyatagi', 'Bostanci'][i % 7],
  }))
})

// Detay paneli - siparis tab filtreleme
const filteredOrders = computed(() => {
  if (tabFilter.value === 'all') return detailOrders.value
  return detailOrders.value.filter(o => {
    if (tabFilter.value === 'pending') return o.status === 'pending'
    if (tabFilter.value === 'delivered') return o.status === 'delivered'
    if (tabFilter.value === 'failed') return o.status === 'failed'
    return true
  })
})

// Detay paneli - siparis sayilari (zimmetli, teslim, bekleyen, basarisiz)
const detailSummaryCards = computed(() => {
  if (!detail.value) return []
  return [
    { label: 'Zimmetli', value: detail.value.assigned, icon: 'P', color: 'text-slate-800 dark:text-white' },
    { label: 'Teslim', value: detail.value.delivered, icon: 'T', color: 'text-green-600' },
    { label: 'Bekleyen', value: detail.value.pending, icon: 'B', color: 'text-blue-600' },
    { label: 'Basarisiz', value: detail.value.failed, icon: 'X', color: 'text-red-500' },
  ]
})

// Detay paneli - finansal ozet kartlari
const detailFinanceCards = computed(() => {
  if (!detail.value) return []
  return [
    { label: 'Toplam Tahsilat', value: fmt(detail.value.cash + Math.floor(detail.value.delivered * 150)), color: 'text-slate-800 dark:text-white' },
    { label: 'Nakit Uzerinde', value: fmt(detail.value.cash), color: 'text-orange-600' },
    { label: 'Kart Tahsilat', value: fmt(Math.floor(detail.value.delivered * 95)), color: 'text-blue-600' },
    { label: 'Odendi', value: fmt(Math.floor(detail.value.delivered * 55)), color: 'text-slate-500' },
  ]
})

// Detay paneli - tab secenekleri ve sayilari
const detailTabs = computed(() => {
  if (!detail.value) return []
  return [
    { key: 'all', label: `Tumu (${detailOrders.value.length})` },
    { key: 'pending', label: `Bekleyen (${detailOrders.value.filter(o => o.status === 'pending').length})` },
    { key: 'delivered', label: `Teslim (${detailOrders.value.filter(o => o.status === 'delivered').length})` },
    { key: 'failed', label: `Basarisiz (${detailOrders.value.filter(o => o.status === 'failed').length})` },
  ]
})

// ========== NAKIT TESLIM MODAL ==========

// Sistemdeki nakit ile girilen tutar arasindaki fark
const cashDiff = computed(() => {
  if (!cashModal.value) return 0
  return (parseInt(cashAmount.value) || 0) - cashModal.value.cash
})

// Teslim sekli secenekleri
const cashTypeOptions = [
  { v: 'full', l: 'Tam tutar teslim' },
  { v: 'partial', l: 'Kismi teslim' },
  { v: 'diff', l: 'Fark var (aciklama gerekli)' },
]

// Fark nedeni secenekleri
const cashReasons = ['Bozuk para eksik', 'Musteriden eksik alindi', 'Para ustu verildi', 'Sayim hatasi', 'Diger']
</script>
