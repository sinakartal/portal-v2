<template>
  <!-- Dashboard Section -->
  <div v-if="currentSection === 'dashboard'" class="space-y-6">
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500">Bu Ay Siparis</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ latestMonthTotal }}</p>
            <p class="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp :size="12" /> +12%</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Package :size="20" class="text-blue-600" />
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500">Harcama</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">&#8378;48K</p>
            <p class="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp :size="12" /> +8%</p>
          </div>
          <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <DollarSign :size="20" class="text-emerald-600" />
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500">Yillik Toplam</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ totalOrders }}</p>
            <p class="text-xs text-slate-400 mt-1">12 aylik toplam</p>
          </div>
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <BarChart3 :size="20" class="text-purple-600" />
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500">Ort. Teslimat Suresi</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">42dk</p>
            <p class="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingDown :size="12" /> -3dk</p>
          </div>
          <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
            <Clock :size="20" class="text-orange-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex gap-3">
      <button class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm cursor-pointer">
        <Plus :size="18" /> Yeni Siparis
      </button>
      <button class="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm cursor-pointer">
        <Upload :size="18" /> Toplu Yukle
      </button>
    </div>

    <!-- Store Order Chart -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Magaza Bazli Siparis Adetleri</h3>
          <p class="text-xs text-slate-500 mt-0.5">Aylik siparis dagilimi (gecmis ve guncel)</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            @click="selectedStore = null"
            :class="['px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors', !selectedStore ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']"
          >
            Tumu
          </button>
          <button
            v-for="s in STORES"
            :key="s"
            @click="selectedStore = selectedStore === s ? null : s"
            :class="['px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors', selectedStore === s ? 'text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']"
            :style="selectedStore === s ? { backgroundColor: STORE_COLORS[s] } : {}"
          >
            {{ s.split(' ')[0] }}
          </button>
        </div>
      </div>
      <div style="height: 340px; position: relative;">
        <Line :data="lineChartData" :options="lineChartOptions" />
      </div>
    </div>

    <!-- Store Performance Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <StoreIcon :size="18" /> Magaza Bazli Siparis Performansi
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800">
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Magaza</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Son Ay</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Toplam</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ortalama</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">En Iyi</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">En Kotu</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Degisim</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="s in STORE_SUMMARY" :key="s.store" @click="selectedStore = selectedStore === s.store ? null : s.store" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <td class="px-6 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: s.color }" />
                  <span class="text-sm font-medium text-slate-900 dark:text-white">{{ s.store }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ s.latest }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-center font-medium">{{ s.total }}</td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-center">{{ s.avg }}</td>
              <td class="px-4 py-3 text-sm text-green-600 text-center">{{ s.best }}</td>
              <td class="px-4 py-3 text-sm text-red-500 text-center">{{ s.worst }}</td>
              <td class="px-4 py-3 text-center">
                <span v-if="s.changePct >= 0" class="inline-flex items-center gap-0.5 text-xs font-medium text-green-600"><TrendingUp :size="12" /> +{{ s.changePct }}%</span>
                <span v-else class="inline-flex items-center gap-0.5 text-xs font-medium text-red-500"><TrendingDown :size="12" /> {{ s.changePct }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- On-time Delivery Rate + Monthly Order Trend -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Zamaninda Teslimat Orani -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Zamaninda Teslimat Orani</h3>
            <p class="text-xs text-slate-500 mt-0.5">Aylik SLA performansi (%)</p>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp :size="14" class="text-green-600" />
            <span class="text-sm font-semibold text-green-600">%{{ slaAvg }}</span>
          </div>
        </div>
        <div style="height: 220px; position: relative;">
          <Line :data="slaChartData" :options="slaChartOptions" />
        </div>
      </div>

      <!-- Monthly Order Trend Bar Chart -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Aylik Siparis Trendi</h3>
        <div style="height: 220px; position: relative;">
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Son Siparisler</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800">
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Siparis No</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tarih</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Adres</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Durum</th>
              <th class="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tutar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="order in RECENT_ORDERS.slice(0, 6)" :key="order.id" @click="openDetail(order, 'order')" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <td class="px-6 py-3 text-sm font-medium text-blue-600 hover:underline">{{ order.id }}</td>
              <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{{ order.date }}</td>
              <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{{ order.address }}</td>
              <td class="px-6 py-3"><span :class="['inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', statusColor(order.status)]">{{ order.status }}</span></td>
              <td class="px-6 py-3 text-sm text-slate-900 dark:text-white font-medium text-right">{{ order.amount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Orders Section -->
  <div v-else-if="currentSection === 'orders'" class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Siparisler</h2>
      <button class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm self-start cursor-pointer">
        <Plus :size="18" /> Yeni Siparis
      </button>
    </div>
    <div class="relative">
      <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input type="text" placeholder="Siparis no veya adres ara..." v-model="ordersSearchTerm" class="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 dark:text-white" />
    </div>
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-800">
            <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Siparis No</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tarih</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Adres</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Durum</th>
            <th class="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tutar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="order in ordersPaginated" :key="order.id" @click="openDetail(order, 'order')" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <td class="px-6 py-3 text-sm font-medium text-blue-600 hover:underline">{{ order.id }}</td>
            <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{{ order.date }}</td>
            <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{{ order.address }}</td>
            <td class="px-6 py-3"><span :class="['inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', statusColor(order.status)]">{{ order.status }}</span></td>
            <td class="px-6 py-3 text-sm text-slate-900 dark:text-white font-medium text-right">{{ order.amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="ordersTotalPages > 1" class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ ordersFiltered.length }} kayittan {{ (ordersCurrentPage - 1) * ordersPerPage + 1 }}-{{ Math.min(ordersCurrentPage * ordersPerPage, ordersFiltered.length) }} arasi</p>
      <div class="flex items-center gap-1">
        <button :disabled="ordersCurrentPage === 1" @click="ordersCurrentPage--" class="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"><ChevronLeft :size="16" /></button>
        <button v-for="page in ordersTotalPages" :key="page" @click="ordersCurrentPage = page" :class="['w-9 h-9 rounded-lg text-sm font-medium cursor-pointer', page === ordersCurrentPage ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800']">{{ page }}</button>
        <button :disabled="ordersCurrentPage === ordersTotalPages" @click="ordersCurrentPage++" class="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"><ChevronRight :size="16" /></button>
      </div>
    </div>
  </div>

  <!-- Tracking Section -->
  <div v-else-if="currentSection === 'tracking'" class="space-y-4">
    <h2 class="text-xl font-bold text-slate-900 dark:text-white">Siparis Takip</h2>
    <div class="relative">
      <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input type="text" placeholder="Siparis numarasi girin..." class="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="order in RECENT_ORDERS.slice(0, 4)" :key="order.id" @click="openDetail(order, 'order')" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
        <div class="flex justify-between items-start mb-3">
          <div>
            <p class="font-semibold text-slate-900 dark:text-white">{{ order.id }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ order.date }}</p>
          </div>
          <span :class="['inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', statusColor(order.status)]">{{ order.status }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <MapPin :size="14" /> {{ order.address }}
        </div>
        <div class="mt-3 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div :class="[
            'h-full rounded-full',
            order.status === 'Teslim Edildi' ? 'bg-green-500 w-full' : order.status === 'Yolda' ? 'bg-blue-500 w-3/4' : order.status === 'Hazirlaniyor' ? 'bg-yellow-500 w-1/3' : 'bg-red-500 w-0'
          ]" />
        </div>
      </div>
    </div>
  </div>

  <!-- Reports Section -->
  <div v-else-if="currentSection === 'reports'" class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Raporlar</h2>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium cursor-pointer"><Download :size="16" /> PDF</button>
        <button class="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium cursor-pointer"><Download :size="16" /> Excel</button>
      </div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="s in reportSummary" :key="s.l" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm text-center">
        <p class="text-sm text-slate-500">{{ s.l }}</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ s.v }}</p>
      </div>
    </div>
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Aylik Dagilim</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800">
              <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ay</th>
              <th class="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Siparis</th>
              <th class="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Harcama</th>
              <th class="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Teslim</th>
              <th class="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Iptal</th>
              <th class="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">SLA</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="row in MONTHLY_BREAKDOWN" :key="row.month" @click="openDetail(row, 'report')" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <td class="px-6 py-3 text-sm font-medium text-slate-900 dark:text-white">{{ row.month }}</td>
              <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400 text-center">{{ row.orders }}</td>
              <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400 text-center">{{ row.spend }}</td>
              <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400 text-center">{{ row.delivered }}</td>
              <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400 text-center">{{ row.cancelled }}</td>
              <td class="px-6 py-3 text-center"><span :class="['inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', parseFloat(row.sla) >= 96 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">{{ row.sla }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Invoices Section -->
  <div v-else-if="currentSection === 'invoices'" class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Faturalar</h2>
      <div class="flex items-center gap-2">
        <Filter :size="16" class="text-slate-400" />
        <select v-model="invoiceStatusFilter" class="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white">
          <option value="all">Tumu</option>
          <option value="Odendi">Odendi</option>
          <option value="Bekliyor">Bekliyor</option>
          <option value="Gecikmis">Gecikmis</option>
        </select>
      </div>
    </div>
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-800">
            <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Fatura No</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tarih</th>
            <th class="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tutar</th>
            <th class="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Durum</th>
            <th class="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Islem</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="inv in invoicesFiltered" :key="inv.id" @click="openDetail(inv, 'invoice')" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
            <td class="px-6 py-3 text-sm font-medium text-blue-600 hover:underline">{{ inv.id }}</td>
            <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{{ inv.date }}</td>
            <td class="px-6 py-3 text-sm text-slate-900 dark:text-white font-medium text-right">{{ inv.amount }}</td>
            <td class="px-6 py-3 text-center"><span :class="['inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', statusColor(inv.status)]">{{ inv.status }}</span></td>
            <td class="px-6 py-3 text-center">
              <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer"><Download :size="14" /> PDF</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Settings Section -->
  <div v-else-if="currentSection === 'settings'" class="space-y-6">
    <h2 class="text-xl font-bold text-slate-900 dark:text-white">Ayarlar</h2>
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
      <div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Sirket Bilgileri</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="f in settingsFields" :key="f.l">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ f.l }}</label>
            <input type="text" :value="f.v" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
          </div>
        </div>
      </div>
      <div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Bildirim Tercihleri</h3>
        <div class="space-y-3">
          <label v-for="item in settingsNotifications" :key="item" class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked class="w-4 h-4 text-blue-600 rounded border-slate-300" />
            <span class="text-sm text-slate-700 dark:text-slate-300">{{ item }}</span>
          </label>
        </div>
      </div>
      <div class="flex justify-end">
        <button class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm cursor-pointer">Kaydet</button>
      </div>
    </div>
  </div>

  <!-- Detail Slide-Over Panel -->
  <Teleport to="body">
    <div v-if="detailOpen" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/30" @click="closeDetail" />
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            <template v-if="detailType === 'order'">Siparis Detayi</template>
            <template v-else-if="detailType === 'invoice'">Fatura Detayi</template>
            <template v-else>Rapor Detayi</template>
          </h3>
          <button @click="closeDetail" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div v-if="detailItem" class="p-6 space-y-6">
          <!-- ORDER DETAIL -->
          <template v-if="detailType === 'order'">
            <div class="flex items-center justify-between">
              <span class="text-xl font-bold text-slate-900 dark:text-white">{{ detailItem.id }}</span>
              <span :class="['inline-flex px-3 py-1 rounded-full text-xs font-medium', statusColor(detailItem.status)]">{{ detailItem.status }}</span>
            </div>

            <div class="space-y-4">
              <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Tarih</span>
                  <span class="font-medium text-slate-900 dark:text-white">{{ detailItem.date }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Adres</span>
                  <span class="font-medium text-slate-900 dark:text-white">{{ detailItem.address }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Tutar</span>
                  <span class="font-semibold text-slate-900 dark:text-white">{{ detailItem.amount }}</span>
                </div>
              </div>

              <!-- Timeline -->
              <div>
                <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Siparis Zamancizgisi</h4>
                <div class="space-y-0">
                  <div v-for="(step, idx) in orderTimeline" :key="idx" class="flex gap-3">
                    <div class="flex flex-col items-center">
                      <div :class="['w-3 h-3 rounded-full', step.done ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600']" />
                      <div v-if="idx < orderTimeline.length - 1" :class="['w-0.5 h-8', step.done ? 'bg-green-300' : 'bg-slate-200 dark:bg-slate-700']" />
                    </div>
                    <div class="pb-4">
                      <p :class="['text-sm font-medium', step.done ? 'text-slate-900 dark:text-white' : 'text-slate-400']">{{ step.label }}</p>
                      <p v-if="step.time" class="text-xs text-slate-400 mt-0.5">{{ step.time }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Courier Info -->
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Kurye Bilgisi</h4>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <User :size="18" class="text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">Ahmet Y.</p>
                    <p class="text-xs text-slate-500">Bringo Kurye #127</p>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- INVOICE DETAIL -->
          <template v-else-if="detailType === 'invoice'">
            <div class="flex items-center justify-between">
              <span class="text-xl font-bold text-slate-900 dark:text-white">{{ detailItem.id }}</span>
              <span :class="['inline-flex px-3 py-1 rounded-full text-xs font-medium', statusColor(detailItem.status)]">{{ detailItem.status }}</span>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Fatura Tarihi</span>
                <span class="font-medium text-slate-900 dark:text-white">{{ detailItem.date }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Vade Tarihi</span>
                <span class="font-medium text-slate-900 dark:text-white">{{ detailItem.date }}</span>
              </div>
              <div class="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                <span class="text-slate-500 font-medium">Toplam Tutar</span>
                <span class="text-lg font-bold text-slate-900 dark:text-white">{{ detailItem.amount }}</span>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Kalem Detaylari</h4>
              <div class="space-y-2">
                <div v-for="(line, idx) in invoiceLines" :key="idx" class="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-600 dark:text-slate-400">{{ line.desc }}</span>
                  <span class="font-medium text-slate-900 dark:text-white">{{ line.amount }}</span>
                </div>
              </div>
            </div>

            <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer">
              <Download :size="16" /> PDF Indir
            </button>
          </template>

          <!-- REPORT DETAIL -->
          <template v-else>
            <div class="text-xl font-bold text-slate-900 dark:text-white">{{ detailItem.month }}</div>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-blue-700">{{ detailItem.orders }}</p>
                <p class="text-xs text-slate-500 mt-1">Toplam Siparis</p>
              </div>
              <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-green-700">{{ detailItem.delivered }}</p>
                <p class="text-xs text-slate-500 mt-1">Teslim Edilen</p>
              </div>
              <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-red-600">{{ detailItem.cancelled }}</p>
                <p class="text-xs text-slate-500 mt-1">Iptal</p>
              </div>
              <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-purple-700">{{ detailItem.sla }}</p>
                <p class="text-xs text-slate-500 mt-1">SLA</p>
              </div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Harcama</span>
                <span class="font-semibold text-slate-900 dark:text-white">{{ detailItem.spend }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Teslim Orani</span>
                <span class="font-medium text-green-600">{{ detailItem.orders > 0 ? ((detailItem.delivered / detailItem.orders) * 100).toFixed(1) : 0 }}%</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Iptal Orani</span>
                <span class="font-medium text-red-500">{{ detailItem.orders > 0 ? ((detailItem.cancelled / detailItem.orders) * 100).toFixed(1) : 0 }}%</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  BarChart3, Plus, Upload, Search, ChevronLeft, ChevronRight,
  MapPin, Download, Filter, TrendingUp, TrendingDown, DollarSign,
  Package, Clock, Store as StoreIcon, X, User
} from 'lucide-vue-next'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip as ChartTooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, ChartTooltip, Legend, Filler)

const route = useRoute()

// ---- Mock Data ----

const RECENT_ORDERS = [
  { id: 'SIP-2401', date: '2024-12-01', address: 'Levent Ofis, Istanbul', status: 'Teslim Edildi', amount: '\u20BA1.240' },
  { id: 'SIP-2402', date: '2024-12-02', address: 'Kadikoy Depo, Istanbul', status: 'Yolda', amount: '\u20BA3.450' },
  { id: 'SIP-2403', date: '2024-12-03', address: 'Ankara Sube', status: 'Hazirlaniyor', amount: '\u20BA890' },
  { id: 'SIP-2404', date: '2024-12-03', address: 'Izmir Depo', status: 'Teslim Edildi', amount: '\u20BA2.100' },
  { id: 'SIP-2405', date: '2024-12-04', address: 'Bursa Fabrika', status: 'Yolda', amount: '\u20BA5.670' },
  { id: 'SIP-2406', date: '2024-12-04', address: 'Antalya Sube', status: 'Teslim Edildi', amount: '\u20BA1.780' },
  { id: 'SIP-2407', date: '2024-12-05', address: 'Levent Ofis, Istanbul', status: 'Hazirlaniyor', amount: '\u20BA920' },
  { id: 'SIP-2408', date: '2024-12-05', address: 'Kadikoy Depo, Istanbul', status: 'Iptal', amount: '\u20BA450' },
  { id: 'SIP-2409', date: '2024-12-06', address: 'Ankara Sube', status: 'Teslim Edildi', amount: '\u20BA3.200' },
  { id: 'SIP-2410', date: '2024-12-06', address: 'Izmir Depo', status: 'Yolda', amount: '\u20BA1.560' },
]

const ALL_ORDERS = [
  ...RECENT_ORDERS,
  { id: 'SIP-2411', date: '2024-12-07', address: 'Bursa Fabrika', status: 'Teslim Edildi', amount: '\u20BA4.320' },
  { id: 'SIP-2412', date: '2024-12-07', address: 'Antalya Sube', status: 'Yolda', amount: '\u20BA2.890' },
  { id: 'SIP-2413', date: '2024-12-08', address: 'Levent Ofis, Istanbul', status: 'Hazirlaniyor', amount: '\u20BA1.100' },
  { id: 'SIP-2414', date: '2024-12-08', address: 'Kadikoy Depo, Istanbul', status: 'Teslim Edildi', amount: '\u20BA6.750' },
  { id: 'SIP-2415', date: '2024-12-09', address: 'Ankara Sube', status: 'Yolda', amount: '\u20BA980' },
  { id: 'SIP-2416', date: '2024-12-09', address: 'Izmir Depo', status: 'Teslim Edildi', amount: '\u20BA2.340' },
  { id: 'SIP-2417', date: '2024-12-10', address: 'Bursa Fabrika', status: 'Hazirlaniyor', amount: '\u20BA4.560' },
  { id: 'SIP-2418', date: '2024-12-10', address: 'Antalya Sube', status: 'Iptal', amount: '\u20BA780' },
  { id: 'SIP-2419', date: '2024-12-11', address: 'Levent Ofis, Istanbul', status: 'Teslim Edildi', amount: '\u20BA3.670' },
  { id: 'SIP-2420', date: '2024-12-11', address: 'Kadikoy Depo, Istanbul', status: 'Yolda', amount: '\u20BA1.450' },
]

const MONTHLY_DATA = [
  { month: 'Oca', value: 32 }, { month: 'Sub', value: 28 }, { month: 'Mar', value: 45 },
  { month: 'Nis', value: 38 }, { month: 'May', value: 52 }, { month: 'Haz', value: 48 },
  { month: 'Tem', value: 41 }, { month: 'Agu', value: 35 }, { month: 'Eyl', value: 55 },
  { month: 'Eki', value: 60 }, { month: 'Kas', value: 58 }, { month: 'Ara', value: 65 },
]

const INVOICES = [
  { id: 'FTR-2024-001', date: '2024-12-01', amount: '\u20BA12.450', status: 'Odendi' },
  { id: 'FTR-2024-002', date: '2024-12-05', amount: '\u20BA8.920', status: 'Bekliyor' },
  { id: 'FTR-2024-003', date: '2024-12-08', amount: '\u20BA15.340', status: 'Odendi' },
  { id: 'FTR-2024-004', date: '2024-12-10', amount: '\u20BA6.780', status: 'Bekliyor' },
  { id: 'FTR-2024-005', date: '2024-12-12', amount: '\u20BA22.100', status: 'Odendi' },
  { id: 'FTR-2024-006', date: '2024-12-15', amount: '\u20BA9.650', status: 'Bekliyor' },
  { id: 'FTR-2024-007', date: '2024-12-18', amount: '\u20BA18.430', status: 'Odendi' },
  { id: 'FTR-2024-008', date: '2024-12-20', amount: '\u20BA4.560', status: 'Gecikmis' },
  { id: 'FTR-2024-009', date: '2024-12-22', amount: '\u20BA11.200', status: 'Odendi' },
  { id: 'FTR-2024-010', date: '2024-12-25', amount: '\u20BA7.890', status: 'Bekliyor' },
]

const MONTHLY_BREAKDOWN = [
  { month: 'Ocak 2024', orders: 32, spend: '\u20BA38.200', delivered: 30, cancelled: 2, sla: '95.2%' },
  { month: 'Subat 2024', orders: 28, spend: '\u20BA33.100', delivered: 27, cancelled: 1, sla: '96.8%' },
  { month: 'Mart 2024', orders: 45, spend: '\u20BA52.400', delivered: 43, cancelled: 2, sla: '94.5%' },
  { month: 'Nisan 2024', orders: 38, spend: '\u20BA44.800', delivered: 37, cancelled: 1, sla: '97.1%' },
  { month: 'Mayis 2024', orders: 52, spend: '\u20BA61.200', delivered: 50, cancelled: 2, sla: '96.0%' },
  { month: 'Haziran 2024', orders: 48, spend: '\u20BA56.900', delivered: 47, cancelled: 1, sla: '97.5%' },
]

const STORES = ['Levent Ofis', 'Kadikoy Depo', 'Ankara Sube', 'Izmir Depo', 'Bursa Fabrika', 'Antalya Sube']
const STORE_COLORS = {
  'Levent Ofis': '#2563eb', 'Kadikoy Depo': '#7c3aed', 'Ankara Sube': '#dc2626',
  'Izmir Depo': '#059669', 'Bursa Fabrika': '#d97706', 'Antalya Sube': '#0891b2',
}

const STORE_ORDER_HISTORY = [
  { month: 'Oca', 'Levent Ofis': 48, 'Kadikoy Depo': 35, 'Ankara Sube': 22, 'Izmir Depo': 28, 'Bursa Fabrika': 18, 'Antalya Sube': 15 },
  { month: 'Sub', 'Levent Ofis': 42, 'Kadikoy Depo': 31, 'Ankara Sube': 19, 'Izmir Depo': 25, 'Bursa Fabrika': 16, 'Antalya Sube': 13 },
  { month: 'Mar', 'Levent Ofis': 55, 'Kadikoy Depo': 40, 'Ankara Sube': 28, 'Izmir Depo': 32, 'Bursa Fabrika': 22, 'Antalya Sube': 18 },
  { month: 'Nis', 'Levent Ofis': 51, 'Kadikoy Depo': 38, 'Ankara Sube': 25, 'Izmir Depo': 30, 'Bursa Fabrika': 20, 'Antalya Sube': 16 },
  { month: 'May', 'Levent Ofis': 62, 'Kadikoy Depo': 45, 'Ankara Sube': 32, 'Izmir Depo': 36, 'Bursa Fabrika': 25, 'Antalya Sube': 21 },
  { month: 'Haz', 'Levent Ofis': 58, 'Kadikoy Depo': 42, 'Ankara Sube': 30, 'Izmir Depo': 34, 'Bursa Fabrika': 23, 'Antalya Sube': 19 },
  { month: 'Tem', 'Levent Ofis': 53, 'Kadikoy Depo': 39, 'Ankara Sube': 26, 'Izmir Depo': 31, 'Bursa Fabrika': 21, 'Antalya Sube': 17 },
  { month: 'Agu', 'Levent Ofis': 45, 'Kadikoy Depo': 33, 'Ankara Sube': 21, 'Izmir Depo': 27, 'Bursa Fabrika': 17, 'Antalya Sube': 14 },
  { month: 'Eyl', 'Levent Ofis': 65, 'Kadikoy Depo': 48, 'Ankara Sube': 35, 'Izmir Depo': 40, 'Bursa Fabrika': 28, 'Antalya Sube': 24 },
  { month: 'Eki', 'Levent Ofis': 70, 'Kadikoy Depo': 52, 'Ankara Sube': 38, 'Izmir Depo': 44, 'Bursa Fabrika': 31, 'Antalya Sube': 27 },
  { month: 'Kas', 'Levent Ofis': 68, 'Kadikoy Depo': 50, 'Ankara Sube': 36, 'Izmir Depo': 42, 'Bursa Fabrika': 29, 'Antalya Sube': 25 },
  { month: 'Ara', 'Levent Ofis': 72, 'Kadikoy Depo': 54, 'Ankara Sube': 40, 'Izmir Depo': 46, 'Bursa Fabrika': 33, 'Antalya Sube': 28 },
]

const STORE_SUMMARY = STORES.map(store => {
  const latest = STORE_ORDER_HISTORY[STORE_ORDER_HISTORY.length - 1][store]
  const prev = STORE_ORDER_HISTORY[STORE_ORDER_HISTORY.length - 2][store]
  const total = STORE_ORDER_HISTORY.reduce((s, d) => s + d[store], 0)
  const avg = Math.round(total / STORE_ORDER_HISTORY.length)
  const best = Math.max(...STORE_ORDER_HISTORY.map(d => d[store]))
  const worst = Math.min(...STORE_ORDER_HISTORY.map(d => d[store]))
  const change = latest - prev
  const changePct = +((change / prev) * 100).toFixed(1)
  return { store, latest, total, avg, best, worst, change, changePct, color: STORE_COLORS[store] }
})

// ---- Helpers ----

const statusColor = (status) => {
  switch (status) {
    case 'Teslim Edildi': return 'bg-green-100 text-green-700'
    case 'Yolda': return 'bg-blue-100 text-blue-700'
    case 'Hazirlaniyor': return 'bg-yellow-100 text-yellow-700'
    case 'Iptal': return 'bg-red-100 text-red-700'
    case 'Odendi': return 'bg-green-100 text-green-700'
    case 'Bekliyor': return 'bg-yellow-100 text-yellow-700'
    case 'Gecikmis': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// ---- Section routing ----

const currentSection = computed(() => {
  const path = route.path
  if (path === '/orders') return 'orders'
  if (path === '/tracking') return 'tracking'
  if (path === '/reports') return 'reports'
  if (path === '/invoices') return 'invoices'
  if (path === '/settings') return 'settings'
  return 'dashboard'
})

// ---- Dashboard state ----

const selectedStore = ref(null)

const totalOrders = computed(() => STORE_SUMMARY.reduce((s, r) => s + r.total, 0))
const latestMonthTotal = computed(() => STORE_SUMMARY.reduce((s, r) => s + r.latest, 0))

const visibleStores = computed(() => selectedStore.value ? [selectedStore.value] : STORES)

const lineChartData = computed(() => {
  const labels = STORE_ORDER_HISTORY.map(d => d.month)
  const datasets = visibleStores.value.map(store => ({
    label: store,
    data: STORE_ORDER_HISTORY.map(d => d[store]),
    borderColor: STORE_COLORS[store],
    backgroundColor: STORE_COLORS[store],
    borderWidth: 2,
    pointRadius: 3,
    pointBackgroundColor: STORE_COLORS[store],
    pointBorderColor: '#fff',
    pointBorderWidth: 1.5,
    tension: 0.3,
  }))
  return { labels, datasets }
})

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { size: 11 }, padding: 8 } },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#94a3b8',
      bodyColor: '#fff',
      cornerRadius: 8,
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} adet` },
    },
  },
  scales: {
    x: { ticks: { font: { size: 11 }, color: '#94a3b8' }, grid: { color: '#e2e8f0' } },
    y: { ticks: { font: { size: 11 }, color: '#94a3b8' }, grid: { color: '#e2e8f0' } },
  },
}

const barChartData = computed(() => ({
  labels: MONTHLY_DATA.map(d => d.month),
  datasets: [{
    label: 'Siparis',
    data: MONTHLY_DATA.map(d => d.value),
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  }],
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#94a3b8',
      bodyColor: '#fff',
      cornerRadius: 8,
    },
  },
  scales: {
    x: { ticks: { font: { size: 11 }, color: '#94a3b8' }, grid: { display: false } },
    y: { ticks: { font: { size: 11 }, color: '#94a3b8' }, grid: { color: '#e2e8f0' } },
  },
}

// ---- SLA Chart ----

const SLA_DATA = [
  { month: 'Oca', rate: 95.2 }, { month: 'Sub', rate: 96.8 }, { month: 'Mar', rate: 94.5 },
  { month: 'Nis', rate: 97.1 }, { month: 'May', rate: 96.0 }, { month: 'Haz', rate: 97.5 },
  { month: 'Tem', rate: 95.8 }, { month: 'Agu', rate: 96.3 }, { month: 'Eyl', rate: 97.2 },
  { month: 'Eki', rate: 98.1 }, { month: 'Kas', rate: 97.8 }, { month: 'Ara', rate: 98.5 },
]

const slaAvg = computed(() => (SLA_DATA.reduce((s, d) => s + d.rate, 0) / SLA_DATA.length).toFixed(1))

const slaChartData = computed(() => ({
  labels: SLA_DATA.map(d => d.month),
  datasets: [{
    label: 'SLA %',
    data: SLA_DATA.map(d => d.rate),
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 2.5,
    pointRadius: 4,
    pointBackgroundColor: '#10b981',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    tension: 0.4,
    fill: true,
  }],
}))

const slaChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#94a3b8',
      bodyColor: '#fff',
      cornerRadius: 8,
      callbacks: { label: (ctx) => `Zamaninda Teslimat: %${ctx.parsed.y}` },
    },
  },
  scales: {
    x: { ticks: { font: { size: 11 }, color: '#94a3b8' }, grid: { display: false } },
    y: { min: 90, max: 100, ticks: { font: { size: 11 }, color: '#94a3b8', callback: (v) => `%${v}` }, grid: { color: '#e2e8f0' } },
  },
}

// ---- Detail Panel ----

const detailOpen = ref(false)
const detailItem = ref(null)
const detailType = ref('order') // 'order' | 'invoice'

const orderTimeline = computed(() => {
  if (!detailItem.value || detailType.value !== 'order') return []
  const s = detailItem.value.status
  return [
    { label: 'Siparis Alindi', time: '09:15', done: true },
    { label: 'Hazirlaniyor', time: s !== 'Iptal' ? '09:20' : null, done: s !== 'Iptal' },
    { label: 'Kuryeye Atandi', time: ['Yolda', 'Teslim Edildi'].includes(s) ? '09:35' : null, done: ['Yolda', 'Teslim Edildi'].includes(s) },
    { label: 'Yolda', time: ['Yolda', 'Teslim Edildi'].includes(s) ? '09:42' : null, done: ['Yolda', 'Teslim Edildi'].includes(s) },
    { label: 'Teslim Edildi', time: s === 'Teslim Edildi' ? '10:08' : null, done: s === 'Teslim Edildi' },
  ]
})

const invoiceLines = [
  { desc: 'Standart teslimat x 45', amount: '\u20BA4.500' },
  { desc: 'Ekspres teslimat x 12', amount: '\u20BA2.400' },
  { desc: 'Gece teslimati x 3', amount: '\u20BA750' },
  { desc: 'KDV (%20)', amount: '\u20BA1.530' },
]

const openDetail = (item, type = 'order') => {
  detailItem.value = item
  detailType.value = type
  detailOpen.value = true
}

const closeDetail = () => {
  detailOpen.value = false
  detailItem.value = null
}

// ---- Orders section state ----

const ordersSearchTerm = ref('')
const ordersCurrentPage = ref(1)
const ordersPerPage = 8

const ordersFiltered = computed(() =>
  ALL_ORDERS.filter(o => !ordersSearchTerm.value || o.id.toLowerCase().includes(ordersSearchTerm.value.toLowerCase()) || o.address.toLowerCase().includes(ordersSearchTerm.value.toLowerCase()))
)

watch(ordersSearchTerm, () => { ordersCurrentPage.value = 1 })

const ordersTotalPages = computed(() => Math.ceil(ordersFiltered.value.length / ordersPerPage))
const ordersPaginated = computed(() => ordersFiltered.value.slice((ordersCurrentPage.value - 1) * ordersPerPage, ordersCurrentPage.value * ordersPerPage))

// ---- Invoices section state ----

const invoiceStatusFilter = ref('all')
const invoicesFiltered = computed(() => INVOICES.filter(inv => invoiceStatusFilter.value === 'all' || inv.status === invoiceStatusFilter.value))

// ---- Reports section data ----

const reportSummary = [
  { l: 'Toplam Siparis', v: '2.845' },
  { l: 'Toplam Harcama', v: '\u20BA286K' },
  { l: 'Ortalama SLA', v: '96.2%' },
  { l: 'Iptal Orani', v: '2.1%' },
]

// ---- Settings section data ----

const settingsFields = [
  { l: 'Sirket Adi', v: 'ABC Holding A.S.' },
  { l: 'Vergi No', v: '1234567890' },
  { l: 'E-posta', v: 'info@abcholding.com' },
  { l: 'Telefon', v: '0212 555 00 00' },
]

const settingsNotifications = [
  'Siparis durumu degisikliklerinde e-posta gonder',
  'Fatura olusturuldugunda bildir',
  'Haftalik rapor gonder',
  'SLA uyarilarini aktif et',
]
</script>
