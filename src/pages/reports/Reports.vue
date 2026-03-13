<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Raporlar</h1>
        <p class="text-sm text-slate-500 mt-1">Kurye, siparis, musteri ve karlilik raporlari</p>
      </div>
      <div class="flex gap-2">
        <select
          v-model="dateRange"
          class="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="week">Bu Hafta</option>
          <option value="month">Bu Ay</option>
          <option value="30days">Son 30 Gun</option>
          <option value="90days">Son 90 Gun</option>
        </select>
        <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors cursor-pointer">
          <Download :size="16" /> Excel Indir
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200 mb-6">
      <div class="flex gap-0">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          ]"
        >
          <component :is="tab.icon" :size="16" /> {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ==================== TAB 1: KURYE ZIMMET RAPORU ==================== -->
    <div v-if="activeTab === 'zimmet'">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package :size="16" class="text-blue-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ zimmetKpis.toplamSiparis }}</p>
          <p class="text-xs text-slate-500 mt-1">Uzerindeki Siparis</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <ClipboardList :size="16" class="text-purple-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ zimmetKpis.toplamUrun }}</p>
          <p class="text-xs text-slate-500 mt-1">Toplam Urun Adedi</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign :size="16" class="text-green-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatCurrency(zimmetKpis.toplamNakit) }}</p>
          <p class="text-xs text-slate-500 mt-1">Toplam Nakit Zimmet</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <ShieldAlert :size="16" class="text-amber-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ zimmetKpis.nakitliKurye }}</p>
          <p class="text-xs text-slate-500 mt-1">Nakit Tasiyici Kurye</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-4 py-3 font-medium text-slate-600">#</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Telefon</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Siparis</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Uzerindeki Urunler</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Nakit Zimmet</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in zimmetData"
                :key="row.id"
                class="border-b border-slate-50 hover:bg-slate-50/50 align-top"
              >
                <td class="px-4 py-3 text-slate-400 font-medium">{{ idx + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck :size="12" class="text-primary" />
                    </div>
                    <span class="font-medium text-slate-800">{{ row.courier }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ row.phone }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">{{ row.orders.length }}</span>
                </td>
                <td class="px-4 py-3">
                  <div v-if="row.orders.length > 0" class="space-y-1.5">
                    <div
                      v-for="order in row.orders"
                      :key="order.id"
                      class="flex items-start gap-2 text-xs cursor-pointer hover:bg-slate-50 rounded px-1.5 py-1 -mx-1.5"
                      @click="router.push(`/orders/${order.id}`)"
                    >
                      <span class="text-primary font-medium whitespace-nowrap">{{ order.id }}</span>
                      <span class="text-slate-400">—</span>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="(item, ii) in order.items"
                          :key="ii"
                          class="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                        >
                          {{ item }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span v-else class="text-slate-400 text-xs">Uzerinde urun yok</span>
                </td>
                <td class="px-4 py-3 text-right font-medium text-slate-700">{{ formatCurrency(row.nakitZimmet) }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :style="{ backgroundColor: zimmetDurumConfig[row.durum].bg, color: zimmetDurumConfig[row.durum].color }"
                  >
                    {{ zimmetDurumConfig[row.durum].label }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 2: KURYE HAKEDIS RAPORU ==================== -->
    <div v-if="activeTab === 'hakedis'">
      <!-- Tarih Filtresi -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-slate-600">Tarih Araligi:</span>
          <input
            type="date"
            v-model="hakedisDateStart"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span class="text-slate-400">—</span>
          <input
            type="date"
            v-model="hakedisDateEnd"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            @click="hakedisDateStart = ''; hakedisDateEnd = ''"
            class="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            <XCircle :size="14" /> Sifirla
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign :size="16" class="text-green-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatCurrency(hakedisKpis.toplamBrut) }}</p>
          <p class="text-xs text-slate-500 mt-1">Toplam Brut</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Wallet :size="16" class="text-blue-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatCurrency(hakedisKpis.toplamNet) }}</p>
          <p class="text-xs text-slate-500 mt-1">Toplam Net</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp :size="16" class="text-purple-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatCurrency(hakedisKpis.ortHakedis) }}</p>
          <p class="text-xs text-slate-500 mt-1">Ort. Hakedis</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock :size="16" class="text-amber-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ hakedisKpis.odemeBekleyen }}</p>
          <p class="text-xs text-slate-500 mt-1">Odeme Bekleyen</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Donem</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Teslimat</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Paket Basi</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Brut</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">KM</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Bonus/Ek</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Kesinti</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Net</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in hakedisData"
                :key="row.id"
                class="border-b border-slate-50 hover:bg-slate-50/50"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck :size="12" class="text-primary" />
                    </div>
                    <span class="font-medium text-slate-800">{{ row.courier }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ row.period }}</td>
                <td class="px-4 py-3 text-center text-slate-600">{{ formatNumber(row.deliveries) }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(row.perPackage) }}</td>
                <td class="px-4 py-3 text-right text-slate-700">{{ formatCurrency(row.gross) }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatNumber(row.km) }} km</td>
                <td class="px-4 py-3 text-right text-green-600">{{ row.bonus > 0 ? formatCurrency(row.bonus) : '-' }}</td>
                <td class="px-4 py-3 text-right text-red-500">{{ row.deductions > 0 ? formatCurrency(row.deductions) : '-' }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(row.net) }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :style="{ backgroundColor: hakedisStatusConfig[row.status].bg, color: hakedisStatusConfig[row.status].color }"
                  >
                    {{ hakedisStatusConfig[row.status].label }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-slate-50 border-t-2 border-slate-200">
                <td class="px-4 py-3 font-bold text-slate-800" colspan="2">TOPLAM</td>
                <td class="px-4 py-3 text-center font-bold text-slate-700">{{ formatNumber(hakedisData.reduce((s, r) => s + r.deliveries, 0)) }}</td>
                <td class="px-4 py-3 text-right" />
                <td class="px-4 py-3 text-right font-bold text-slate-700">{{ formatCurrency(hakedisData.reduce((s, r) => s + r.gross, 0)) }}</td>
                <td class="px-4 py-3 text-right font-medium text-slate-600">{{ formatNumber(hakedisData.reduce((s, r) => s + r.km, 0)) }} km</td>
                <td class="px-4 py-3 text-right font-medium text-green-600">{{ formatCurrency(hakedisData.reduce((s, r) => s + r.bonus, 0)) }}</td>
                <td class="px-4 py-3 text-right font-medium text-red-500">{{ formatCurrency(hakedisData.reduce((s, r) => s + r.deductions, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(hakedisData.reduce((s, r) => s + r.net, 0)) }}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 3: SIPARIS RAPORU ==================== -->
    <div v-if="activeTab === 'siparis'">
      <!-- Tarih Filtresi -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-slate-600">Tarih Araligi:</span>
          <input
            type="date"
            v-model="siparisDateStart"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span class="text-slate-400">—</span>
          <input
            type="date"
            v-model="siparisDateEnd"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            @click="siparisDateStart = ''; siparisDateEnd = ''"
            class="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            <XCircle :size="14" /> Sifirla
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package :size="16" class="text-blue-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatNumber(siparisKpis.toplam) }}</p>
          <p class="text-xs text-slate-500 mt-1">Toplam Siparis</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle :size="16" class="text-green-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatNumber(siparisKpis.teslimEdilen) }}</p>
          <p class="text-xs text-slate-500 mt-1">Teslim Edilen</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle :size="16" class="text-red-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatNumber(siparisKpis.basarisiz) }}</p>
          <p class="text-xs text-slate-500 mt-1">Basarisiz</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock :size="16" class="text-purple-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ siparisKpis.ortSure }} dk</p>
          <p class="text-xs text-slate-500 mt-1">Ort. Teslimat Suresi</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm whitespace-nowrap">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-3 py-3 font-medium text-slate-600">ID</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Siparis No</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Referans No</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Proje</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Bolge</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Atis Nok. ID</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Atis Nok. RefID</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Atis Nok. Adi</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Musteri Adi</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Musteri Tel</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Baslangic Teslimat</th>
                <th class="text-center px-3 py-3 font-medium text-slate-600">Siparis Durumu</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Iptal Sebebi</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Teslim Edememe Sebebi</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Teslim Edememe Notu</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Teslim Edememe Tipi</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Siparis Tarihi</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Kurye Teslim Tarihi</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Musteri Teslim Tarihi</th>
                <th class="text-center px-3 py-3 font-medium text-slate-600">Teslimat Suresi(dk)</th>
                <th class="text-right px-3 py-3 font-medium text-slate-600">Tahmini Satis Tutari</th>
                <th class="text-right px-3 py-3 font-medium text-slate-600">Toplam Tutar</th>
                <th class="text-right px-3 py-3 font-medium text-slate-600">Toplam(Nakit&amp;POS)</th>
                <th class="text-right px-3 py-3 font-medium text-slate-600">Tahmini KDV</th>
                <th class="text-right px-3 py-3 font-medium text-slate-600">Tahmini Kar</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Dagitim Koordinat</th>
                <th class="text-left px-3 py-3 font-medium text-slate-600">Dagitim Plaka</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in siparisData"
                :key="row.id"
                class="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer"
                @click="router.push(`/orders/${row.id}`)"
              >
                <td class="px-3 py-3 text-slate-400 font-mono text-xs">{{ row.dbId }}</td>
                <td class="px-3 py-3 font-medium text-primary">{{ row.orderNo }}</td>
                <td class="px-3 py-3 text-slate-500 text-xs">{{ row.refNo }}</td>
                <td class="px-3 py-3 text-slate-600">{{ row.project }}</td>
                <td class="px-3 py-3 text-slate-600">{{ row.region }}</td>
                <td class="px-3 py-3 text-slate-400 font-mono text-xs">{{ row.dropId }}</td>
                <td class="px-3 py-3 text-slate-400 font-mono text-xs">{{ row.dropRefId }}</td>
                <td class="px-3 py-3 text-slate-600">{{ row.dropName }}</td>
                <td class="px-3 py-3 text-slate-700">{{ row.customer }}</td>
                <td class="px-3 py-3 text-slate-500">{{ row.customerPhone }}</td>
                <td class="px-3 py-3 text-slate-500 text-xs">{{ row.plannedDelivery }}</td>
                <td class="px-3 py-3 text-center">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :style="{ backgroundColor: row.statusConfig.bg, color: row.statusConfig.color }"
                  >
                    {{ row.statusConfig.label }}
                  </span>
                </td>
                <td class="px-3 py-3 text-slate-500 text-xs">{{ row.cancelReason || '-' }}</td>
                <td class="px-3 py-3 text-slate-500 text-xs">{{ row.failReason || '-' }}</td>
                <td class="px-3 py-3 text-slate-500 text-xs">{{ row.failNote || '-' }}</td>
                <td class="px-3 py-3 text-slate-500 text-xs">{{ row.failType || '-' }}</td>
                <td class="px-3 py-3 text-slate-500 text-xs">{{ row.orderDate }}</td>
                <td class="px-3 py-3 text-slate-500 text-xs">{{ row.courierDeliveryDate || '-' }}</td>
                <td class="px-3 py-3 text-slate-500 text-xs">{{ row.customerDeliveryDate || '-' }}</td>
                <td class="px-3 py-3 text-center font-medium text-slate-700">{{ row.deliveryDuration ? `${row.deliveryDuration}` : '-' }}</td>
                <td class="px-3 py-3 text-right text-slate-600">{{ formatCurrency(row.estimatedSales) }}</td>
                <td class="px-3 py-3 text-right text-slate-700 font-medium">{{ formatCurrency(row.totalAmount) }}</td>
                <td class="px-3 py-3 text-right text-slate-600">{{ formatCurrency(row.totalCashPos) }}</td>
                <td class="px-3 py-3 text-right text-slate-500">{{ formatCurrency(row.estimatedKdv) }}</td>
                <td class="px-3 py-3 text-right font-medium" :class="row.estimatedProfit >= 0 ? 'text-green-600' : 'text-red-500'">{{ formatCurrency(row.estimatedProfit) }}</td>
                <td class="px-3 py-3 text-slate-400 text-xs font-mono">{{ row.deliveryCoord }}</td>
                <td class="px-3 py-3 text-slate-600">{{ row.deliveryPlate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 4: MUSTERI RAPORU ==================== -->
    <div v-if="activeTab === 'musteri'">
      <!-- Tarih Filtresi -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-slate-600">Tarih Araligi:</span>
          <input
            type="date"
            v-model="musteriDateStart"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span class="text-slate-400">—</span>
          <input
            type="date"
            v-model="musteriDateEnd"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            @click="musteriDateStart = ''; musteriDateEnd = ''"
            class="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            <XCircle :size="14" /> Sifirla
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users :size="16" class="text-blue-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ musteriKpis.toplamMusteri }}</p>
          <p class="text-xs text-slate-500 mt-1">Toplam Musteri</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign :size="16" class="text-green-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatCurrency(musteriKpis.toplamFatura) }}</p>
          <p class="text-xs text-slate-500 mt-1">Toplam Fatura Tutari</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle :size="16" class="text-emerald-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatCurrency(musteriKpis.odenen) }}</p>
          <p class="text-xs text-slate-500 mt-1">Odenen</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock :size="16" class="text-amber-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800">{{ formatCurrency(musteriKpis.bekleyen) }}</p>
          <p class="text-xs text-slate-500 mt-1">Bekleyen</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-4 py-3 font-medium text-slate-600">Musteri</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Proje</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Siparis</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Birim Fiyat</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Toplam Tutar</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">KDV</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Fatura Toplami</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Odeme Durumu</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in musteriData"
                :key="row.id"
                class="border-b border-slate-50 hover:bg-slate-50/50"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 :size="12" class="text-primary" />
                    </div>
                    <span class="font-medium text-slate-800">{{ row.customer }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ row.project }}</td>
                <td class="px-4 py-3 text-center text-slate-600">{{ formatNumber(row.orderCount) }}</td>
                <td class="px-4 py-3 text-right text-slate-700">{{ formatCurrency(row.unitPrice) }}</td>
                <td class="px-4 py-3 text-right text-slate-700">{{ formatCurrency(row.totalAmount) }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(row.kdv) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(row.invoiceTotal) }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :style="{ backgroundColor: musteriOdemeDurumConfig[row.paymentStatus].bg, color: musteriOdemeDurumConfig[row.paymentStatus].color }"
                  >
                    {{ musteriOdemeDurumConfig[row.paymentStatus].label }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-slate-50 border-t-2 border-slate-200">
                <td class="px-4 py-3 font-bold text-slate-800" colspan="2">TOPLAM</td>
                <td class="px-4 py-3 text-center font-bold text-slate-700">{{ formatNumber(musteriData.reduce((s, r) => s + r.orderCount, 0)) }}</td>
                <td class="px-4 py-3 text-right" />
                <td class="px-4 py-3 text-right font-bold text-slate-700">{{ formatCurrency(musteriData.reduce((s, r) => s + r.totalAmount, 0)) }}</td>
                <td class="px-4 py-3 text-right font-medium text-slate-600">{{ formatCurrency(musteriData.reduce((s, r) => s + r.kdv, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(musteriData.reduce((s, r) => s + r.invoiceTotal, 0)) }}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 5: KARLILIK RAPORU ==================== -->
    <div v-if="activeTab === 'karlilik'">
      <!-- Tarih Filtresi -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-slate-600">Tarih Araligi:</span>
          <input
            type="date"
            v-model="karlilikDateStart"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span class="text-slate-400">—</span>
          <input
            type="date"
            v-model="karlilikDateEnd"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            @click="karlilikDateStart = ''; karlilikDateEnd = ''"
            class="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            <XCircle :size="14" /> Sifirla
          </button>
        </div>
      </div>

      <!-- Alt Tab'lar -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="sub in karlilikSubTabs"
          :key="sub.id"
          @click="karlilikTab = sub.id"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
            karlilikTab === sub.id
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          {{ sub.label }}
        </button>
      </div>

      <!-- Proje Bazli -->
      <div v-if="karlilikTab === 'proje'" class="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800 flex items-center gap-2">
            <Building2 :size="18" class="text-slate-500" /> Proje Bazli Karlilik
          </h3>
          <span class="text-xs text-slate-400">{{ karlilikProjeData.length }} proje</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-4 py-3 font-medium text-slate-600">Proje</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Siparis</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Gelir</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Kurye Maliyeti</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Ops. Maliyeti</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Net Kar</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Marj %</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in karlilikProjeData"
                :key="row.name"
                class="border-b border-slate-50 hover:bg-slate-50/50"
              >
                <td class="px-4 py-3 font-medium text-slate-800">{{ row.name }}</td>
                <td class="px-4 py-3 text-center text-slate-600">{{ formatNumber(row.orders) }}</td>
                <td class="px-4 py-3 text-right text-green-600 font-medium">{{ formatCurrency(row.revenue) }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(row.courierCost) }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(row.opsCost) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(row.netProfit) }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="['px-2 py-0.5 rounded-full text-xs font-bold', marginColor(row.margin)]">%{{ row.margin }}</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-slate-50 border-t-2 border-slate-200">
                <td class="px-4 py-3 font-bold text-slate-800">TOPLAM</td>
                <td class="px-4 py-3 text-center font-bold text-slate-700">{{ formatNumber(karlilikProjeData.reduce((s, r) => s + r.orders, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatCurrency(karlilikProjeData.reduce((s, r) => s + r.revenue, 0)) }}</td>
                <td class="px-4 py-3 text-right font-medium text-slate-600">{{ formatCurrency(karlilikProjeData.reduce((s, r) => s + r.courierCost, 0)) }}</td>
                <td class="px-4 py-3 text-right font-medium text-slate-600">{{ formatCurrency(karlilikProjeData.reduce((s, r) => s + r.opsCost, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(karlilikProjeData.reduce((s, r) => s + r.netProfit, 0)) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50">
                    %{{ karlilikProjeToplamMarj }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Sube Bazli -->
      <div v-if="karlilikTab === 'sube'" class="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800 flex items-center gap-2">
            <MapPin :size="18" class="text-slate-500" /> Sube Bazli Karlilik
          </h3>
          <span class="text-xs text-slate-400">{{ karlilikSubeData.length }} sube</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-4 py-3 font-medium text-slate-600">Sube</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Siparis</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Gelir</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Maliyet</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Net Kar</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Marj %</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in karlilikSubeData"
                :key="row.name"
                class="border-b border-slate-50 hover:bg-slate-50/50"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin :size="12" class="text-primary" />
                    </div>
                    <span class="font-medium text-slate-800">{{ row.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center text-slate-600">{{ formatNumber(row.orders) }}</td>
                <td class="px-4 py-3 text-right text-green-600 font-medium">{{ formatCurrency(row.revenue) }}</td>
                <td class="px-4 py-3 text-right text-red-500 font-medium">{{ formatCurrency(row.cost) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(row.netProfit) }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="['px-2 py-0.5 rounded-full text-xs font-bold', marginColor(row.margin)]">%{{ row.margin }}</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-slate-50 border-t-2 border-slate-200">
                <td class="px-4 py-3 font-bold text-slate-800">TOPLAM</td>
                <td class="px-4 py-3 text-center font-bold text-slate-700">{{ formatNumber(karlilikSubeData.reduce((s, r) => s + r.orders, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatCurrency(karlilikSubeData.reduce((s, r) => s + r.revenue, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-red-600">{{ formatCurrency(karlilikSubeData.reduce((s, r) => s + r.cost, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(karlilikSubeData.reduce((s, r) => s + r.netProfit, 0)) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50">
                    %{{ karlilikSubeToplamMarj }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Kurye Bazli -->
      <div v-if="karlilikTab === 'kurye'" class="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800 flex items-center gap-2">
            <Truck :size="18" class="text-slate-500" /> Kurye Bazli Karlilik
          </h3>
          <span class="text-xs text-slate-400">{{ karlilikKuryeData.length }} kurye</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-4 py-3 font-medium text-slate-600">#</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Teslimat</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Gelir</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Maliyet</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Net Kar</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Marj %</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Puan</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in karlilikKuryeData"
                :key="row.name"
                class="border-b border-slate-50 hover:bg-slate-50/50"
              >
                <td class="px-4 py-3 text-slate-400 font-medium">{{ idx + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck :size="12" class="text-primary" />
                    </div>
                    <span class="font-medium text-slate-800">{{ row.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center text-slate-600">{{ formatNumber(row.deliveries) }}</td>
                <td class="px-4 py-3 text-right text-green-600 font-medium">{{ formatCurrency(row.revenue) }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(row.cost) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(row.netProfit) }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="['px-2 py-0.5 rounded-full text-xs font-bold', marginColor(row.margin)]">%{{ row.margin }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <Star :size="12" class="text-amber-400" fill="currentColor" />
                    <span class="text-slate-700">{{ row.rating }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-slate-50 border-t-2 border-slate-200">
                <td class="px-4 py-3 font-bold text-slate-800" colspan="2">TOPLAM</td>
                <td class="px-4 py-3 text-center font-bold text-slate-700">{{ formatNumber(karlilikKuryeData.reduce((s, r) => s + r.deliveries, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatCurrency(karlilikKuryeData.reduce((s, r) => s + r.revenue, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-red-600">{{ formatCurrency(karlilikKuryeData.reduce((s, r) => s + r.cost, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(karlilikKuryeData.reduce((s, r) => s + r.netProfit, 0)) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50">
                    %{{ karlilikKuryeToplamMarj }}
                  </span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 6: ALGORITMA AI RAPORU ==================== -->
    <div v-if="activeTab === 'algoritma'" @vue:mounted="loadAlgoHistory()">
      <template v-if="algoStatsComputed">
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl p-4 border border-slate-100">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                <BarChart3 :size="16" class="text-violet-500" />
              </div>
            </div>
            <p class="text-xl font-bold text-slate-800">{{ algoStatsComputed.total }}</p>
            <p class="text-xs text-slate-500 mt-1">Toplam Deneyim</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-100">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Target :size="16" class="text-emerald-500" />
              </div>
            </div>
            <p class="text-xl font-bold text-emerald-600">{{ algoStatsComputed.bestScore }}/10</p>
            <p class="text-xs text-slate-500 mt-1">En Iyi Puan</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-100">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp :size="16" class="text-blue-500" />
              </div>
            </div>
            <p class="text-xl font-bold text-blue-600">{{ algoStatsComputed.avgScore }}/10</p>
            <p class="text-xs text-slate-500 mt-1">Ortalama Puan</p>
          </div>
          <div class="bg-white rounded-xl p-4 border border-slate-100">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Cpu :size="16" class="text-amber-500" />
              </div>
            </div>
            <p class="text-xl font-bold text-slate-800">{{ Object.keys(algoStatsComputed.profileBest).length }}</p>
            <p class="text-xs text-slate-500 mt-1">Ogrenilen Profil</p>
          </div>
        </div>

        <!-- En Basarili Kombinasyonlar -->
        <div class="bg-white rounded-xl border border-slate-100 mb-6">
          <div class="px-5 py-3 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Zap :size="14" class="text-violet-500" /> En Basarili Algoritma Kombinasyonlari
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th class="px-5 py-2.5 font-medium">#</th>
                  <th class="px-5 py-2.5 font-medium">Atama</th>
                  <th class="px-5 py-2.5 font-medium">Rotalama</th>
                  <th class="px-5 py-2.5 font-medium">Optimizasyon</th>
                  <th class="px-5 py-2.5 font-medium text-center">Kullanim</th>
                  <th class="px-5 py-2.5 font-medium text-center">Ort. Puan</th>
                  <th class="px-5 py-2.5 font-medium text-center">Kurye Puan</th>
                  <th class="px-5 py-2.5 font-medium text-center">En Iyi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(combo, ci) in algoStatsComputed.topCombos" :key="ci" class="border-b border-slate-50 hover:bg-slate-50/50">
                  <td class="px-5 py-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      :class="ci === 0 ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'">{{ ci + 1 }}</span>
                  </td>
                  <td class="px-5 py-2.5 font-medium text-slate-700">{{ algoNames[combo.assignment] || combo.assignment }}</td>
                  <td class="px-5 py-2.5 text-slate-600">{{ algoNames[combo.routing] || combo.routing }}</td>
                  <td class="px-5 py-2.5 text-slate-600">{{ algoNames[combo.optimization] || combo.optimization }}</td>
                  <td class="px-5 py-2.5 text-center">
                    <span class="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">{{ combo.count }}x</span>
                  </td>
                  <td class="px-5 py-2.5 text-center">
                    <span class="font-bold" :class="parseFloat(combo.avgScore) >= 8 ? 'text-emerald-600' : parseFloat(combo.avgScore) >= 6 ? 'text-amber-600' : 'text-red-600'">{{ combo.avgScore }}</span>
                  </td>
                  <td class="px-5 py-2.5 text-center">
                    <span class="font-bold" :class="combo.avgCourierScore !== '-' && parseFloat(combo.avgCourierScore) >= 8 ? 'text-emerald-600' : combo.avgCourierScore !== '-' && parseFloat(combo.avgCourierScore) >= 6 ? 'text-amber-600' : 'text-slate-400'">{{ combo.avgCourierScore }}</span>
                  </td>
                  <td class="px-5 py-2.5 text-center">
                    <span class="font-bold" :class="combo.bestScore >= 8 ? 'text-emerald-600' : combo.bestScore >= 6 ? 'text-amber-600' : 'text-red-600'">{{ combo.bestScore }}/10</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Profil Bazli Ogrenme -->
        <div class="bg-white rounded-xl border border-slate-100 mb-6">
          <div class="px-5 py-3 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Target :size="14" class="text-emerald-500" /> Siparis Profiline Gore En Iyi Strateji
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Her siparis dagilimine ozel ogrenen en iyi kombinasyon</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th class="px-5 py-2.5 font-medium">Profil</th>
                  <th class="px-5 py-2.5 font-medium">Atama → Rotalama → Optimizasyon</th>
                  <th class="px-5 py-2.5 font-medium text-center">Puan</th>
                  <th class="px-5 py-2.5 font-medium text-center">Rota</th>
                  <th class="px-5 py-2.5 font-medium text-center">Toplam Km</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, pi) in algoStatsComputed.profileBest" :key="pi" class="border-b border-slate-50 hover:bg-slate-50/50">
                  <td class="px-5 py-2.5">
                    <span class="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs font-mono font-medium">{{ p.profile }}</span>
                  </td>
                  <td class="px-5 py-2.5 text-slate-600 text-xs">
                    <span class="font-medium text-slate-700">{{ algoNames[p.combo.assignment] || p.combo.assignment }}</span>
                    <span class="text-slate-300 mx-1">→</span>
                    <span>{{ algoNames[p.combo.routing] || p.combo.routing }}</span>
                    <span class="text-slate-300 mx-1">→</span>
                    <span>{{ algoNames[p.combo.optimization] || p.combo.optimization }}</span>
                  </td>
                  <td class="px-5 py-2.5 text-center">
                    <span class="font-bold" :class="p.score >= 8 ? 'text-emerald-600' : p.score >= 6 ? 'text-amber-600' : 'text-red-600'">{{ p.score }}/10</span>
                  </td>
                  <td class="px-5 py-2.5 text-center font-medium text-slate-700">{{ p.totalRoutes }}</td>
                  <td class="px-5 py-2.5 text-center text-slate-500">{{ p.totalKm?.toFixed(1) || '-' }} km</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Son Deneyimler -->
        <div class="bg-white rounded-xl border border-slate-100">
          <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Clock :size="14" class="text-blue-500" /> Son Deneyimler
            </h3>
            <button @click="algoHistory = []; localStorage.setItem('bringo_algo_learning', '[]')"
              class="text-xs text-slate-400 hover:text-red-500 cursor-pointer transition-colors">Gecmisi Temizle</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th class="px-5 py-2.5 font-medium">Tarih</th>
                  <th class="px-5 py-2.5 font-medium">Profil</th>
                  <th class="px-5 py-2.5 font-medium">Pipeline</th>
                  <th class="px-5 py-2.5 font-medium text-center">Siparis</th>
                  <th class="px-5 py-2.5 font-medium text-center">Rota</th>
                  <th class="px-5 py-2.5 font-medium text-center">Puan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, ei) in [...algoHistory].reverse().slice(0, 50)" :key="ei" class="border-b border-slate-50 hover:bg-slate-50/50">
                  <td class="px-5 py-2.5 text-xs text-slate-500">{{ new Date(entry.ts).toLocaleDateString('tr-TR') }} {{ new Date(entry.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }}</td>
                  <td class="px-5 py-2.5">
                    <span class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600">{{ entry.profile }}</span>
                  </td>
                  <td class="px-5 py-2.5 text-xs text-slate-600">
                    {{ algoNames[entry.combo.assignment] || entry.combo.assignment }}
                    → {{ algoNames[entry.combo.routing] || entry.combo.routing }}
                    → {{ algoNames[entry.combo.optimization] || entry.combo.optimization }}
                  </td>
                  <td class="px-5 py-2.5 text-center text-slate-700 font-medium">{{ entry.totalOrders }}</td>
                  <td class="px-5 py-2.5 text-center text-slate-700 font-medium">{{ entry.totalRoutes }}</td>
                  <td class="px-5 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                      :class="entry.score >= 8 ? 'bg-emerald-50 text-emerald-700' : entry.score >= 6 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'">
                      {{ entry.score }}/10
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- Bos state -->
      <div v-else class="text-center py-16">
        <Cpu :size="40" class="mx-auto mb-3 text-slate-300" />
        <h3 class="text-lg font-bold text-slate-600 mb-1">Henuz ogrenme verisi yok</h3>
        <p class="text-sm text-slate-400">Algoritma simulatorde dispatch yaparak AI ogrenme gecmisini olusturun.</p>
        <p class="text-xs text-slate-400 mt-2">Dashboard → Simulator → AI Pilot acik → Dispatch Et</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileBarChart, ClipboardList, Truck, Package, Users, DollarSign,
  TrendingUp, Download, Clock, Star, Building2, MapPin, Wallet,
  CheckCircle, XCircle, ShieldAlert, Cpu, Zap, Target, BarChart3
} from 'lucide-vue-next'
import { formatCurrency, formatNumber } from '@/utils'
import { getOrders, getStats, getCouriers } from '@/services/api'

const router = useRouter()
const dateRange = ref('month')
const activeTab = ref('zimmet')
const karlilikTab = ref('proje')
const loading = ref(false)
const error = ref(null)

const tabs = [
  { id: 'zimmet', label: 'Kurye Zimmet', icon: ClipboardList },
  { id: 'hakedis', label: 'Kurye Hakedis', icon: Wallet },
  { id: 'siparis', label: 'Siparis Raporu', icon: Package },
  // { id: 'musteri', label: 'Musteri Raporu', icon: Users }, // Veri kaynagi hazir degil
  { id: 'karlilik', label: 'Karlilik', icon: TrendingUp },
  { id: 'algoritma', label: 'Algoritma AI', icon: Cpu },
]

const karlilikSubTabs = [
  { id: 'proje', label: 'Proje Bazli' },
  { id: 'sube', label: 'Sube Bazli' },
  { id: 'kurye', label: 'Kurye Bazli' },
]

// ==================== ALGORITMA AI OGRENME RAPORU ====================
const algoHistory = ref([])
const algoHistoryLoaded = ref(false)

function loadAlgoHistory() {
  if (algoHistoryLoaded.value) return
  try {
    algoHistory.value = JSON.parse(localStorage.getItem('bringo_algo_learning') || '[]')
  } catch { algoHistory.value = [] }
  algoHistoryLoaded.value = true
}

const algoNames = {
  hungarian: 'Hungarian', greedy_nearest: 'Greedy Nearest', auction: 'Auction',
  zone_cascade: 'Zone Cascade', batch_dispatch: 'Batch Dispatch', multi_objective: 'Multi-Objective',
  clarke_wright: 'Clarke-Wright', or_tools_vrp: 'OR-Tools VRP', vroom_solver: 'VROOM',
  '2opt': '2-Opt', '3opt': '3-Opt', simulated_annealing: 'Sim. Annealing',
  genetic: 'Genetic', ant_colony: 'Ant Colony', bringo_adaptive: 'Bringo Adaptive',
}

const algoStatsComputed = computed(() => {
  const h = algoHistory.value
  if (h.length === 0) return null
  const scores = h.map(x => x.score)
  const avgScore = (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1)
  const bestScore = Math.max(...scores)
  const worstScore = Math.min(...scores)

  // En cok kullanilan combolar
  const comboCount = {}
  h.forEach(x => {
    const key = `${x.combo.assignment}|${x.combo.routing}|${x.combo.optimization}`
    comboCount[key] = (comboCount[key] || 0) + 1
  })
  const topCombos = Object.entries(comboCount).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([key, count]) => {
    const [a, r, o] = key.split('|')
    const entries = h.filter(x => x.combo.assignment === a && x.combo.routing === r && x.combo.optimization === o)
    const comboScores = entries.map(x => x.score)
    const courierScores = entries.filter(x => x.courierScore).map(x => x.courierScore)
    const avg = (comboScores.reduce((s,v) => s+v, 0) / comboScores.length).toFixed(1)
    const avgCourier = courierScores.length > 0 ? (courierScores.reduce((s,v) => s+v, 0) / courierScores.length).toFixed(1) : '-'
    return { assignment: a, routing: r, optimization: o, count, avgScore: avg, bestScore: Math.max(...comboScores), avgCourierScore: avgCourier }
  })

  // Profil bazli en iyiler
  const profileBest = {}
  h.forEach(x => {
    if (!profileBest[x.profile] || x.score > profileBest[x.profile].score) {
      profileBest[x.profile] = x
    }
  })

  // Zaman trendi — son 20 kayit
  const recent = h.slice(-20).map((x, i) => ({ idx: i, score: x.score, ts: x.ts }))

  return { total: h.length, avgScore, bestScore, worstScore, topCombos, profileBest: Object.values(profileBest), recent }
})

// ==================== KURYE ISIMLERI (ORTAK) ====================
const courierNames = [
  'Serkan Acar', 'Murat Yildirim', 'Hakan Tekin', 'Kemal Bas',
  'Selim Dursun', 'Taner Gul', 'Volkan Aslan', 'Cem Ozkan',
  'Baris Ay', 'Erkan Sahin', 'Firat Kocer', 'Deniz Uysal',
  'Caner Aktas', 'Onur Cevik', 'Tolga Eren'
]

const projects = [
  'Istanbul Ana Dagitim', 'Ankara Bolge', 'Izmir Sahil', 'Antalya Turizm',
  'Bursa Sanayi', 'Express Teslimat', 'Gida Dagitim', 'E-Ticaret Lojistik'
]

const branches = [
  'Kadikoy Sube', 'Besiktas Sube', 'Uskudar Sube', 'Sisli Sube',
  'Bakirkoy Sube', 'Maltepe Sube', 'Atasehir Sube', 'Beylikduzu Sube',
  'Kartal Sube', 'Pendik Sube', 'Umraniye Sube'
]

const customers = [
  'E-Ticaret Lojistik A.S.', 'Istanbul Ana Dagitim Ltd.', 'Express Kargo A.S.',
  'Gida Dagitim Ltd.', 'Ankara Bolge Ltd.', 'Izmir Sahil A.S.',
  'Bursa Sanayi Ltd.', 'Antalya Turizm A.S.', 'Teknoloji Market A.S.',
  'Saglik Dagitim Ltd.'
]

// ==================== TAB 1: KURYE ZIMMET ====================
const zimmetDurumConfig = {
  dagitimda: { label: 'Dagitimda', color: '#3b82f6', bg: '#dbeafe' },
  teslim_bekliyor: { label: 'Teslim Bekliyor', color: '#f59e0b', bg: '#fef3c7' },
  bos: { label: 'Uzerinde Urun Yok', color: '#10b981', bg: '#d1fae5' },
}

const zimmetData = ref([])
const zimmetKpis = ref({ toplamSiparis: 0, toplamUrun: 0, toplamNakit: 0, nakitliKurye: 0 })

// ==================== TAB 2: KURYE HAKEDIS ====================
const hakedisStatusConfig = {
  pending: { label: 'Beklemede', color: '#f59e0b', bg: '#fef3c7' },
  approved: { label: 'Onaylandi', color: '#3b82f6', bg: '#dbeafe' },
  paid: { label: 'Odendi', color: '#10b981', bg: '#d1fae5' },
}

const hakedisData = ref([])
const hakedisKpis = ref({ toplamBrut: 0, toplamNet: 0, ortHakedis: 0, odemeBekleyen: 0 })
const hakedisDateStart = ref('')
const hakedisDateEnd = ref('')

// ==================== TAB 3: SIPARIS RAPORU ====================
const siparisData = ref([])
const siparisKpis = ref({ toplam: 0, teslimEdilen: 0, basarisiz: 0, ortSure: 0 })
const siparisDateStart = ref('')
const siparisDateEnd = ref('')

const siparisStatusConfig = {
  delivered: { label: 'Teslim Edildi', color: '#10b981', bg: '#d1fae5' },
  in_transit: { label: 'Yolda', color: '#3b82f6', bg: '#dbeafe' },
  assigned: { label: 'Atandi', color: '#6366f1', bg: '#e0e7ff' },
  pending: { label: 'Beklemede', color: '#f59e0b', bg: '#fef3c7' },
  failed: { label: 'Basarisiz', color: '#ef4444', bg: '#fee2e2' },
  cancelled: { label: 'Iptal', color: '#6b7280', bg: '#f3f4f6' },
}

// ==================== TAB 4: MUSTERI RAPORU ====================
const musteriData = ref([])
const musteriKpis = ref({ toplamMusteri: 0, toplamFatura: 0, odenen: 0, bekleyen: 0 })
const musteriDateStart = ref('')
const musteriDateEnd = ref('')

const musteriOdemeDurumConfig = {
  paid: { label: 'Odendi', color: '#10b981', bg: '#d1fae5' },
  partial: { label: 'Kismi Odendi', color: '#f59e0b', bg: '#fef3c7' },
  pending: { label: 'Bekliyor', color: '#3b82f6', bg: '#dbeafe' },
  overdue: { label: 'Gecikti', color: '#ef4444', bg: '#fee2e2' },
}

// ==================== TAB 5: KARLILIK RAPORU ====================
const karlilikProjeData = ref([])
const karlilikSubeData = ref([])
const karlilikKuryeData = ref([])
const karlilikDateStart = ref('')
const karlilikDateEnd = ref('')

const marginColor = (margin) => {
  const m = parseFloat(margin)
  if (m >= 30) return 'text-green-600 bg-green-50'
  if (m >= 15) return 'text-blue-600 bg-blue-50'
  if (m >= 5) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

const karlilikProjeToplamMarj = computed(() => {
  const rev = karlilikProjeData.value.reduce((s, r) => s + r.revenue, 0)
  const profit = karlilikProjeData.value.reduce((s, r) => s + r.netProfit, 0)
  return rev > 0 ? (profit / rev * 100).toFixed(1) : '0'
})

const karlilikSubeToplamMarj = computed(() => {
  const rev = karlilikSubeData.value.reduce((s, r) => s + r.revenue, 0)
  const profit = karlilikSubeData.value.reduce((s, r) => s + r.netProfit, 0)
  return rev > 0 ? (profit / rev * 100).toFixed(1) : '0'
})

const karlilikKuryeToplamMarj = computed(() => {
  const rev = karlilikKuryeData.value.reduce((s, r) => s + r.revenue, 0)
  const profit = karlilikKuryeData.value.reduce((s, r) => s + r.netProfit, 0)
  return rev > 0 ? (profit / rev * 100).toFixed(1) : '0'
})

// ==================== EMPTY STATE HELPER ====================
function setEmptyReportState() {
  zimmetData.value = []
  zimmetKpis.value = { toplamSiparis: 0, toplamUrun: 0, toplamNakit: 0, nakitliKurye: 0 }
  hakedisData.value = []
  hakedisKpis.value = { toplamBrut: 0, toplamNet: 0, ortHakedis: 0, odemeBekleyen: 0 }
  siparisData.value = []
  siparisKpis.value = { toplam: 0, teslimEdilen: 0, basarisiz: 0, ortSure: 0 }
  musteriData.value = []
  musteriKpis.value = { toplamMusteri: 0, toplamFatura: 0, odenen: 0, bekleyen: 0 }
  karlilikProjeData.value = []
  karlilikSubeData.value = []
  karlilikKuryeData.value = []
}

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const [ordersRes, statsRes, couriersRes] = await Promise.all([
      getOrders(),
      getStats(),
      getCouriers(),
    ])

    if (ordersRes.ok && ordersRes.data) {
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.orders || []
      const couriers = couriersRes.ok ? (Array.isArray(couriersRes.data) ? couriersRes.data : couriersRes.data?.couriers || []) : []

      // Tab 3: Siparis - use real orders
      if (orders.length > 0) {
        siparisData.value = orders.map((o, i) => {
          const status = o.status || 'pending'
          return {
            id: o.id || o.externalOrderId || `SIP-${i}`,
            dbId: o._id || i,
            orderNo: o.externalOrderId || o.id || `SIP-${i}`,
            refNo: o.refNo || `REF-${i}`,
            project: o.project || o.tenantId || '',
            region: o.region || '',
            dropId: o.dropId || '',
            dropRefId: o.dropRefId || '',
            dropName: o.dropName || o.dropoff?.name || '',
            customer: o.customer?.name || o.customerName || '',
            customerPhone: o.customer?.phone || o.customerPhone || '',
            plannedDelivery: o.plannedDelivery || '',
            status,
            statusConfig: siparisStatusConfig[status] || siparisStatusConfig.pending,
            cancelReason: o.cancelReason || null,
            failReason: o.failReason || null,
            failNote: o.failNote || null,
            failType: o.failType || null,
            orderDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString('tr-TR') : '',
            courierDeliveryDate: o.deliveredAt || null,
            customerDeliveryDate: o.customerDeliveryDate || null,
            deliveryDuration: o.deliveryDuration || null,
            estimatedSales: o.estimatedSales || o.price || 0,
            totalAmount: o.totalAmount || o.price || 0,
            totalCashPos: o.totalCashPos || 0,
            estimatedKdv: o.estimatedKdv || 0,
            estimatedProfit: o.estimatedProfit || 0,
            deliveryCoord: o.deliveryCoord || '',
            deliveryPlate: o.deliveryPlate || '',
          }
        })

        const deliveredOrders = siparisData.value.filter(r => r.status === 'delivered')
        siparisKpis.value = {
          toplam: siparisData.value.length,
          teslimEdilen: deliveredOrders.length,
          basarisiz: siparisData.value.filter(r => r.status === 'failed' || r.status === 'cancelled').length,
          ortSure: deliveredOrders.length > 0 ? Math.round(deliveredOrders.reduce((s, r) => s + (r.deliveryDuration || 0), 0) / deliveredOrders.length) : 0,
        }
      }

      // Tab 1: Zimmet - compute from couriers if available
      if (couriers.length > 0) {
        zimmetData.value = couriers.map((c, i) => {
          const courierOrders = orders.filter(o => o.courierId === c.id || o.courierId === c._id)
          const activeOrders = courierOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
          return {
            id: c.id || c._id || `z-${i}`,
            courier: c.name || `Kurye ${i + 1}`,
            phone: c.phone || '',
            orders: activeOrders.map(o => ({
              id: o.id || o.externalOrderId || '',
              customer: o.customer?.name || o.customerName || '',
              items: o.items || [],
            })),
            nakitZimmet: c.cashOnHand || 0,
            durum: activeOrders.length > 0 ? 'dagitimda' : 'bos',
          }
        })

        const allZimmetOrders = zimmetData.value.flatMap(r => r.orders)
        zimmetKpis.value = {
          toplamSiparis: allZimmetOrders.length,
          toplamUrun: allZimmetOrders.reduce((s, o) => s + (o.items?.length || 0), 0),
          toplamNakit: zimmetData.value.reduce((s, r) => s + r.nakitZimmet, 0),
          nakitliKurye: zimmetData.value.filter(r => r.nakitZimmet > 0).length,
        }
      }

      // Tab 2: Hakedis - compute from couriers
      if (couriers.length > 0 && hakedisData.value.length === 0) {
        hakedisData.value = couriers.map((c, i) => {
          const deliveries = c.deliveryCount || c.totalDeliveries || 0
          const perPackage = c.perDeliveryRate || 0
          const gross = Math.round(deliveries * perPackage)
          const km = c.totalKm || 0
          const bonus = c.bonus || 0
          const deductions = c.deductions || 0
          const net = gross + bonus - deductions
          return {
            id: c.id || c._id || `h-${i}`,
            courier: c.name || `Kurye ${i + 1}`,
            period: new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
            deliveries, perPackage, gross, km, bonus, deductions, net,
            status: c.payrollStatus || 'pending',
          }
        })
        hakedisKpis.value = {
          toplamBrut: hakedisData.value.reduce((s, r) => s + r.gross, 0),
          toplamNet: hakedisData.value.reduce((s, r) => s + r.net, 0),
          ortHakedis: hakedisData.value.length > 0 ? Math.round(hakedisData.value.reduce((s, r) => s + r.net, 0) / hakedisData.value.length) : 0,
          odemeBekleyen: hakedisData.value.filter(r => r.status === 'pending').length,
        }
      }

      // Tab 4: Musteri - not available yet
      musteriData.value = []
      musteriKpis.value = { toplamMusteri: 0, toplamFatura: 0, odenen: 0, bekleyen: 0 }

      // Tab 5: Karlilik - empty until analytics API
      karlilikProjeData.value = []
      karlilikSubeData.value = []
      karlilikKuryeData.value = []
    } else {
      setEmptyReportState()
    }
  } catch (e) {
    console.error('[Reports] API error:', e)
    error.value = 'Veriler yuklenirken hata olustu'
    setEmptyReportState()
  } finally {
    loading.value = false
  }
})
</script>
