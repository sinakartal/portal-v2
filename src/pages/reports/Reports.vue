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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileBarChart, ClipboardList, Truck, Package, Users, DollarSign,
  TrendingUp, Download, Clock, Star, Building2, MapPin, Wallet,
  CheckCircle, XCircle, ShieldAlert
} from 'lucide-vue-next'
import { formatCurrency, formatNumber } from '@/utils'

const router = useRouter()
const dateRange = ref('month')
const activeTab = ref('zimmet')
const karlilikTab = ref('proje')

const tabs = [
  { id: 'zimmet', label: 'Kurye Zimmet', icon: ClipboardList },
  { id: 'hakedis', label: 'Kurye Hakedis', icon: Wallet },
  { id: 'siparis', label: 'Siparis Raporu', icon: Package },
  { id: 'musteri', label: 'Musteri Raporu', icon: Users },
  { id: 'karlilik', label: 'Karlilik', icon: TrendingUp },
]

const karlilikSubTabs = [
  { id: 'proje', label: 'Proje Bazli' },
  { id: 'sube', label: 'Sube Bazli' },
  { id: 'kurye', label: 'Kurye Bazli' },
]

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

// ==================== MOCK DATA URETICI ====================
onMounted(() => {
  // Tab 1: Zimmet — kuryenin uzerindeki siparisler, urunler ve nakit
  const productPool = [
    'Laptop', 'Tablet', 'Telefon', 'Kulaklik', 'Sarj Aleti', 'Klavye',
    'Mouse', 'Monitor', 'Kablo Seti', 'Powerbank', 'USB Bellek', 'SSD Disk',
    'Yazici Toneri', 'Kamera', 'Hoparlor', 'Akilli Saat', 'Oyun Konsolu',
    'Vitamin Seti', 'Protein Tozu', 'Kahve Paketi', 'Cay Seti', 'Biskuvi Kutu',
  ]
  const orderCustomerNames = [
    'Ahmet Yilmaz', 'Mehmet Demir', 'Ayse Kaya', 'Fatma Celik',
    'Ali Ozturk', 'Zeynep Arslan', 'Mustafa Dogan', 'Emine Sahin',
    'Huseyin Koc', 'Hacer Yildiz', 'Omer Polat', 'Merve Aksoy',
  ]

  zimmetData.value = courierNames.map((name, i) => {
    const orderCount = Math.floor(Math.random() * 4) // 0-3 siparis
    const orders = Array.from({ length: orderCount }, (_, j) => {
      const itemCount = Math.floor(Math.random() * 3) + 1 // 1-3 urun
      const items = Array.from({ length: itemCount }, () =>
        productPool[Math.floor(Math.random() * productPool.length)]
      )
      return {
        id: `SIP-${String(100100 + i * 10 + j)}`,
        customer: orderCustomerNames[(i + j) % orderCustomerNames.length],
        items,
      }
    })
    const nakitZimmet = Math.random() > 0.4 ? Math.floor(Math.random() * 2000) + 100 : 0
    const durum = orderCount > 0 ? (Math.random() > 0.5 ? 'dagitimda' : 'teslim_bekliyor') : 'bos'
    return {
      id: `z-${i}`,
      courier: name,
      phone: `053${Math.floor(Math.random() * 9000000 + 1000000)}`,
      orders,
      nakitZimmet,
      durum,
    }
  })

  const allOrders = zimmetData.value.flatMap(r => r.orders)
  zimmetKpis.value = {
    toplamSiparis: allOrders.length,
    toplamUrun: allOrders.reduce((s, o) => s + o.items.length, 0),
    toplamNakit: zimmetData.value.reduce((s, r) => s + r.nakitZimmet, 0),
    nakitliKurye: zimmetData.value.filter(r => r.nakitZimmet > 0).length,
  }

  // Tab 2: Hakedis — paket basi, km, bonus/ek, kesinti
  const hakedisStatuses = ['pending', 'approved', 'paid', 'paid', 'paid']
  hakedisData.value = courierNames.map((name, i) => {
    const deliveries = Math.floor(Math.random() * 250) + 80
    const perPackage = Math.round((Math.random() * 12 + 22) * 100) / 100
    const gross = Math.round(deliveries * perPackage)
    const km = Math.floor(Math.random() * 800) + 200
    const bonus = Math.random() > 0.4 ? Math.floor(Math.random() * 500) + 100 : 0
    const deductions = Math.random() > 0.6 ? Math.floor(Math.random() * 300) + 50 : 0
    const net = gross + bonus - deductions
    return {
      id: `h-${i}`,
      courier: name,
      period: 'Subat 2026',
      deliveries,
      perPackage,
      gross,
      km,
      bonus,
      deductions,
      net,
      status: hakedisStatuses[i % hakedisStatuses.length],
    }
  })

  hakedisKpis.value = {
    toplamBrut: hakedisData.value.reduce((s, r) => s + r.gross, 0),
    toplamNet: hakedisData.value.reduce((s, r) => s + r.net, 0),
    ortHakedis: Math.round(hakedisData.value.reduce((s, r) => s + r.net, 0) / hakedisData.value.length),
    odemeBekleyen: hakedisData.value.filter(r => r.status === 'pending').length,
  }

  // Tab 3: Siparis — tum hareketlerin detayli raporu
  const statuses = ['delivered', 'delivered', 'delivered', 'in_transit', 'assigned', 'pending', 'failed', 'cancelled']
  const orderCustomers = [
    'Ahmet Yilmaz', 'Mehmet Demir', 'Ayse Kaya', 'Fatma Celik',
    'Ali Ozturk', 'Zeynep Arslan', 'Mustafa Dogan', 'Emine Sahin',
    'Huseyin Koc', 'Hacer Yildiz', 'Ibrahim Aydin', 'Hatice Ozkan',
    'Omer Polat', 'Merve Aksoy', 'Burak Kilic', 'Selin Erdogan',
    'Can Korkmaz', 'Elif Sen', 'Emre Gunes', 'Derya Ozer'
  ]
  const regions = ['Kadikoy', 'Besiktas', 'Uskudar', 'Sisli', 'Bakirkoy', 'Maltepe', 'Atasehir', 'Beylikduzu', 'Kartal', 'Pendik']
  const dropNames = [
    'Merkez Depo', 'Sube A', 'Sube B', 'Cadde Magaza', 'AVM Nokta',
    'Express Nokta', 'Mahalle Teslim', 'Is Merkezi', 'Kargo Nokta', 'Park Teslim'
  ]
  const plates = ['34 ABC 123', '34 DEF 456', '34 GHI 789', '34 JKL 012', '06 MNO 345', '06 PRS 678', '35 TUV 901', '35 XYZ 234']
  const cancelReasons = [null, null, null, null, 'Musteri istegi', 'Stok yetersiz', 'Adres hatasi']
  const failReasons = [null, null, null, 'Musteri bulunamadi', 'Adres yanlis', 'Kapaliydi', 'Randevu disinda']
  const failNotes = [null, null, null, 'Kapida kimse yoktu', 'Zil bozuk', 'Yanlis bina', '2. deneme yapilacak']
  const failTypes = [null, null, null, 'musteri_yok', 'adres_hatasi', 'kapali', 'randevu_disi']

  siparisData.value = Array.from({ length: 30 }, (_, i) => {
    const status = statuses[i % statuses.length]
    const day = Math.floor(Math.random() * 18) + 1
    const orderDate = `${String(day).padStart(2, '0')}.02.2026`
    const baseHour = 8 + Math.floor(Math.random() * 10)
    const baseMin = Math.floor(Math.random() * 60)
    const deliveryDuration = status === 'delivered' ? Math.floor(Math.random() * 50) + 15 : null
    const estimatedSales = Math.floor(Math.random() * 800) + 50
    const kdvRate = 0.20
    const estimatedKdv = Math.round(estimatedSales * kdvRate)
    const totalAmount = estimatedSales + estimatedKdv
    const cashPosRatio = Math.random()
    const totalCashPos = Math.round(totalAmount * cashPosRatio)
    const cost = Math.floor(Math.random() * 200) + 30
    const estimatedProfit = estimatedSales - cost
    const lat = (40.98 + Math.random() * 0.04).toFixed(4)
    const lng = (29.01 + Math.random() * 0.04).toFixed(4)

    const courierDeliveryDate = status === 'delivered' ? `${orderDate} ${String(baseHour + 1).padStart(2, '0')}:${String(baseMin).padStart(2, '0')}` : null
    const customerDeliveryDate = status === 'delivered' ? `${orderDate} ${String(baseHour + 1).padStart(2, '0')}:${String((baseMin + (deliveryDuration || 0)) % 60).padStart(2, '0')}` : null
    const plannedDelivery = `${orderDate} ${String(baseHour + 2).padStart(2, '0')}:00`

    return {
      id: `SIP-${String(100001 + i)}`,
      dbId: 50000 + i,
      orderNo: `SIP-${String(100001 + i)}`,
      refNo: `REF-${String(200001 + i)}`,
      project: projects[i % projects.length],
      region: regions[i % regions.length],
      dropId: `DN-${String(3000 + i)}`,
      dropRefId: `DNR-${String(4000 + i)}`,
      dropName: dropNames[i % dropNames.length],
      customer: orderCustomers[i % orderCustomers.length],
      customerPhone: `053${Math.floor(Math.random() * 9000000 + 1000000)}`,
      plannedDelivery,
      status,
      statusConfig: siparisStatusConfig[status],
      cancelReason: status === 'cancelled' ? cancelReasons[Math.floor(Math.random() * cancelReasons.length)] || 'Musteri istegi' : null,
      failReason: status === 'failed' ? failReasons[Math.floor(Math.random() * failReasons.length)] || 'Musteri bulunamadi' : null,
      failNote: status === 'failed' ? failNotes[Math.floor(Math.random() * failNotes.length)] || 'Kapida kimse yoktu' : null,
      failType: status === 'failed' ? failTypes[Math.floor(Math.random() * failTypes.length)] || 'musteri_yok' : null,
      orderDate,
      courierDeliveryDate,
      customerDeliveryDate,
      deliveryDuration,
      estimatedSales,
      totalAmount,
      totalCashPos,
      estimatedKdv,
      estimatedProfit,
      deliveryCoord: `${lat}, ${lng}`,
      deliveryPlate: plates[i % plates.length],
    }
  })

  const deliveredOrders = siparisData.value.filter(r => r.status === 'delivered')
  siparisKpis.value = {
    toplam: siparisData.value.length,
    teslimEdilen: deliveredOrders.length,
    basarisiz: siparisData.value.filter(r => r.status === 'failed' || r.status === 'cancelled').length,
    ortSure: deliveredOrders.length > 0 ? Math.round(deliveredOrders.reduce((s, r) => s + (r.deliveryDuration || 0), 0) / deliveredOrders.length) : 0,
  }

  // Tab 4: Musteri
  const paymentStatuses = ['paid', 'paid', 'partial', 'pending', 'overdue']
  musteriData.value = customers.map((name, i) => {
    const orderCount = Math.floor(Math.random() * 500) + 50
    const unitPrice = Math.floor(Math.random() * 30) + 25
    const totalAmount = orderCount * unitPrice
    const kdv = Math.round(totalAmount * 0.20)
    const invoiceTotal = totalAmount + kdv
    const paymentStatus = paymentStatuses[i % paymentStatuses.length]
    return {
      id: `m-${i}`,
      customer: name,
      project: projects[i % projects.length],
      orderCount,
      unitPrice,
      totalAmount,
      kdv,
      invoiceTotal,
      paymentStatus,
    }
  })

  const paidCustomers = musteriData.value.filter(r => r.paymentStatus === 'paid')
  const pendingCustomers = musteriData.value.filter(r => r.paymentStatus !== 'paid')
  musteriKpis.value = {
    toplamMusteri: musteriData.value.length,
    toplamFatura: musteriData.value.reduce((s, r) => s + r.invoiceTotal, 0),
    odenen: paidCustomers.reduce((s, r) => s + r.invoiceTotal, 0),
    bekleyen: pendingCustomers.reduce((s, r) => s + r.invoiceTotal, 0),
  }

  // Tab 5: Karlilik - Proje
  karlilikProjeData.value = projects.map(name => {
    const orders = Math.floor(Math.random() * 2000) + 500
    const revenue = orders * (Math.random() * 40 + 60)
    const courierCost = orders * (Math.random() * 15 + 20)
    const opsCost = orders * (Math.random() * 5 + 8)
    const netProfit = revenue - courierCost - opsCost
    const margin = (netProfit / revenue * 100)
    return {
      name,
      orders,
      revenue: Math.round(revenue),
      courierCost: Math.round(courierCost),
      opsCost: Math.round(opsCost),
      netProfit: Math.round(netProfit),
      margin: margin.toFixed(1),
    }
  }).sort((a, b) => b.revenue - a.revenue)

  // Tab 5: Karlilik - Sube
  karlilikSubeData.value = branches.map(name => {
    const orders = Math.floor(Math.random() * 1500) + 300
    const revenue = orders * (Math.random() * 35 + 55)
    const cost = orders * (Math.random() * 20 + 25)
    const netProfit = revenue - cost
    const margin = (netProfit / revenue * 100)
    return {
      name,
      orders,
      revenue: Math.round(revenue),
      cost: Math.round(cost),
      netProfit: Math.round(netProfit),
      margin: margin.toFixed(1),
    }
  }).sort((a, b) => b.revenue - a.revenue)

  // Tab 5: Karlilik - Kurye
  karlilikKuryeData.value = courierNames.map(name => {
    const deliveries = Math.floor(Math.random() * 300) + 100
    const revenue = deliveries * (Math.random() * 30 + 50)
    const cost = deliveries * (Math.random() * 20 + 25)
    const netProfit = revenue - cost
    const margin = (netProfit / revenue * 100)
    return {
      name,
      deliveries,
      revenue: Math.round(revenue),
      cost: Math.round(cost),
      netProfit: Math.round(netProfit),
      margin: margin.toFixed(1),
      rating: (Math.random() * 1.2 + 3.8).toFixed(1),
    }
  }).sort((a, b) => b.netProfit - a.netProfit)
})
</script>
