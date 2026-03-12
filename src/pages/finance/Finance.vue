<template>
  <div class="dark:bg-slate-900 min-h-screen">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <!-- Header skeleton -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div class="h-4 w-56 bg-slate-100 dark:bg-slate-700 rounded mt-2 animate-pulse" />
        </div>
        <div class="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </div>
      <!-- KPI skeleton -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div v-for="n in 5" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
          <div class="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-lg mb-3 animate-pulse" />
          <div class="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
          <div class="h-3 w-32 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
      <!-- Table skeleton -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 space-y-3">
        <div class="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
        <div v-for="n in 8" :key="n" class="flex gap-4">
          <div class="h-4 flex-1 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
          <div class="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
          <div class="h-4 w-16 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
          <div class="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Finans</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Kurye hakedisleri ve fatura yonetimi</p>
        </div>
        <div class="flex gap-2">
          <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
            <Download :size="16" /> Rapor Indir
          </button>
        </div>
      </div>

      <!-- Financial Summary KPI Cards (Ozet Panel) -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign :size="16" class="text-green-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(totalGross) }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Toplam Brut Hakedis</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Wallet :size="16" class="text-blue-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(totalNet) }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Toplam Net Odeme</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Clock :size="16" class="text-amber-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(monthlyExpected) }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Bu Ay Beklenen</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle :size="16" class="text-emerald-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(paidInvoiceAmount) }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Odenmis Tutar</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle :size="16" class="text-red-500" />
            </div>
          </div>
          <p class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(totalInvoiceAmount - paidInvoiceAmount) }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Bekleyen Fatura Toplami</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-slate-200 dark:border-slate-700 mb-6">
        <div class="flex gap-0">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id; currentPage = 1"
            :class="[
              'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            ]"
          >
            <component :is="tab.icon" :size="16" /> {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- ========== PAYROLL TAB ========== -->
      <div v-if="activeTab === 'payroll'">
        <!-- Status Tab Bar -->
        <div class="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
          <button
            @click="payrollStatusTab = ''; currentPage = 1"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              payrollStatusTab === ''
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            ]"
          >
            Tumu <span class="ml-1 text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">{{ payrollData.length }}</span>
          </button>
          <button
            @click="payrollStatusTab = 'pending'; currentPage = 1"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              payrollStatusTab === 'pending'
                ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            ]"
          >
            Bekliyor <span class="ml-1 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">{{ payrollData.filter(p => p.status === 'pending').length }}</span>
          </button>
          <button
            @click="payrollStatusTab = 'approved'; currentPage = 1"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              payrollStatusTab === 'approved'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            ]"
          >
            Onaylandi <span class="ml-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">{{ payrollData.filter(p => p.status === 'approved').length }}</span>
          </button>
          <button
            @click="payrollStatusTab = 'paid'; currentPage = 1"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              payrollStatusTab === 'paid'
                ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            ]"
          >
            Odendi <span class="ml-1 text-xs bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">{{ payrollData.filter(p => p.status === 'paid').length }}</span>
          </button>
        </div>

        <!-- Bulk Action Bar -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="selectedPayrolls.length > 0" class="flex items-center gap-4 mb-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
            <span class="text-sm font-medium text-primary">{{ selectedPayrolls.length }} kayit secildi</span>
            <span class="text-sm text-slate-500 dark:text-slate-400">Toplam: {{ formatCurrency(selectedPayrollTotal) }}</span>
            <div class="flex-1" />
            <button
              @click="bulkApprove"
              class="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <CheckCircle :size="14" /> Secilenleri Onayla
            </button>
            <button
              @click="selectedPayrolls = []"
              class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
            >
              <XCircle :size="16" class="text-slate-500" />
            </button>
          </div>
        </Transition>

        <!-- Inline Confirmation Modal -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="confirmPayroll" class="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full mx-4">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle :size="20" class="text-green-500" />
                </div>
                <div>
                  <p class="font-semibold text-slate-800 dark:text-slate-100">Hakedis Onayi</p>
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ confirmPayroll.courier }}</p>
                </div>
              </div>
              <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4">
                <p class="text-sm text-green-600 dark:text-green-400 mb-1">Onayliyorsunuz:</p>
                <p class="text-2xl font-bold text-green-700 dark:text-green-300">{{ formatCurrency(confirmPayroll.net) }}</p>
              </div>
              <div class="flex gap-3">
                <button
                  @click="confirmPayroll = null"
                  class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Vazgec
                </button>
                <button
                  @click="executeApprove(confirmPayroll)"
                  class="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-medium text-white transition-colors cursor-pointer"
                >
                  Onayla
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Search & Filter -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
          <div class="flex flex-wrap gap-3">
            <div class="relative flex-1 min-w-[200px]">
              <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                v-model="payrollSearch"
                placeholder="Kurye adi ara..."
                class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button @click="payrollSearch = ''; payrollStatusTab = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
              <RefreshCw :size="14" /> Sifirla
            </button>
          </div>
        </div>

        <!-- Payroll Table -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      :checked="isAllSelected"
                      @change="toggleSelectAll"
                      class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Kurye</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Donem</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Teslimat</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Brut</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">SGK</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Vergi</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Ceza</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Bonus</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Kesinti</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Net</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Durum</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Islem</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in filteredPayroll" :key="p._id" class="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td class="px-4 py-3">
                    <input
                      type="checkbox"
                      :checked="selectedPayrolls.includes(p._id)"
                      @change="togglePayrollSelection(p._id)"
                      class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck :size="12" class="text-primary" />
                      </div>
                      <span class="font-medium text-slate-800 dark:text-slate-200">{{ p.courier }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ p.period }}</td>
                  <td class="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{{ formatNumber(p.deliveries) }}</td>
                  <td class="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{{ formatCurrency(p.gross) }}</td>
                  <td class="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{{ formatCurrency(p.sgk) }}</td>
                  <td class="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{{ formatCurrency(p.tax) }}</td>
                  <td class="px-4 py-3 text-right text-red-500">{{ p.penalty > 0 ? formatCurrency(p.penalty) : '-' }}</td>
                  <td class="px-4 py-3 text-right text-green-600 dark:text-green-400">{{ p.bonus > 0 ? formatCurrency(p.bonus) : '-' }}</td>
                  <td class="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{{ formatCurrency(p.deductions) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(p.net) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium" :style="{ backgroundColor: payrollStatusConfig[p.status].bg, color: payrollStatusConfig[p.status].color }">
                      {{ payrollStatusConfig[p.status].label }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-1">
                      <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer" title="Detay">
                        <Eye :size="14" class="text-slate-500 dark:text-slate-400" />
                      </button>
                      <button v-if="p.status === 'pending'" @click="confirmPayroll = p" class="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/30 rounded cursor-pointer" title="Onayla">
                        <CheckCircle :size="14" class="text-green-500" />
                      </button>
                      <button v-if="p.status === 'approved'" class="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded cursor-pointer" title="Ode">
                        <CreditCard :size="14" class="text-blue-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-slate-50 dark:bg-slate-900/50 border-t-2 border-slate-200 dark:border-slate-600">
                  <td class="px-4 py-3" />
                  <td class="px-4 py-3 font-bold text-slate-800 dark:text-slate-100" colspan="1">TOPLAM</td>
                  <td class="px-4 py-3" />
                  <td class="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">{{ formatNumber(filteredPayroll.reduce((s, p) => s + p.deliveries, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.gross, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.sgk, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.tax, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-medium text-red-500">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.penalty, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.bonus, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-400">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.deductions, 0)) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.net, 0)) }}</td>
                  <td colspan="2" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- ========== INVOICES TAB ========== -->
      <div v-if="activeTab === 'invoices'">
        <!-- Invoice KPIs -->
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 p-4">
            <p class="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Odenen Faturalar</p>
            <p class="text-xl font-bold text-green-700 dark:text-green-300">{{ formatCurrency(paidInvoiceAmount) }}</p>
          </div>
          <div class="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 p-4">
            <p class="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Geciken Faturalar</p>
            <p class="text-xl font-bold text-red-700 dark:text-red-300">{{ formatCurrency(overdueAmount) }}</p>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-4">
            <p class="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Bekleyen Tahsilat</p>
            <p class="text-xl font-bold text-blue-700 dark:text-blue-300">{{ formatCurrency(totalInvoiceAmount - paidInvoiceAmount) }}</p>
          </div>
        </div>

        <!-- Search & Filter -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
          <div class="flex flex-wrap gap-3">
            <div class="relative flex-1 min-w-[200px]">
              <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                v-model="invoiceSearch"
                placeholder="Fatura no, musteri ara..."
                class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <select
              v-model="invoiceStatus"
              class="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tum Durumlar</option>
              <option v-for="(val, key) in invoiceStatusConfig" :key="key" :value="key">{{ val.label }}</option>
            </select>
            <button @click="invoiceSearch = ''; invoiceStatus = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
              <RefreshCw :size="14" /> Sifirla
            </button>
          </div>
        </div>

        <!-- Invoice Table -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Fatura No</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Musteri</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Proje</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Tutar</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">KDV</th>
                  <th class="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Toplam</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Durum</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Duzenleme</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Vade</th>
                  <th class="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Kalan Gun</th>
                  <th class="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Islem</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="inv in filteredInvoices"
                  :key="inv._id"
                  :class="[
                    'border-b border-slate-50 dark:border-slate-700/50 transition-colors',
                    inv.status === 'overdue'
                      ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/30'
                  ]"
                >
                  <td class="px-4 py-3 font-medium text-primary cursor-pointer">{{ inv.invoiceNumber }}</td>
                  <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ inv.client }}</td>
                  <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ inv.project }}</td>
                  <td class="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{{ formatCurrency(inv.amount) }}</td>
                  <td class="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{{ formatCurrency(inv.tax) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(inv.total) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span
                      v-if="inv.status === 'paid'"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                    >
                      <CheckCircle :size="12" /> Odendi
                    </span>
                    <span
                      v-else-if="inv.status === 'overdue'"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 animate-pulse"
                    >
                      <AlertCircle :size="12" /> Gecikmi
                    </span>
                    <span
                      v-else
                      class="px-2.5 py-1 rounded-full text-xs font-medium"
                      :style="{ backgroundColor: invoiceStatusConfig[inv.status]?.bg, color: invoiceStatusConfig[inv.status]?.color }"
                    >
                      {{ invoiceStatusConfig[inv.status]?.label }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ formatDate(inv.issueDate) }}</td>
                  <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ formatDate(inv.dueDate) }}</td>
                  <td class="px-4 py-3">
                    <span
                      v-if="inv.status !== 'paid' && inv.status !== 'cancelled'"
                      :class="[
                        'text-xs font-medium',
                        getDaysRemaining(inv.dueDate) < 0 ? 'text-red-600 dark:text-red-400 font-bold' :
                        getDaysRemaining(inv.dueDate) <= 7 ? 'text-amber-600 dark:text-amber-400' :
                        'text-slate-500 dark:text-slate-400'
                      ]"
                    >
                      {{ getDaysRemaining(inv.dueDate) < 0 ? `${Math.abs(getDaysRemaining(inv.dueDate))} gun gecikti` : `${getDaysRemaining(inv.dueDate)} gun` }}
                    </span>
                    <span v-else class="text-xs text-slate-400 dark:text-slate-500">-</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-1">
                      <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer" title="Goruntule">
                        <Eye :size="14" class="text-slate-500 dark:text-slate-400" />
                      </button>
                      <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer" title="Yazdir">
                        <Printer :size="14" class="text-slate-500 dark:text-slate-400" />
                      </button>
                      <button v-if="inv.status === 'draft'" class="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded cursor-pointer" title="Gonder">
                        <Send :size="14" class="text-blue-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========== CHART TAB ========== -->
      <div v-if="activeTab === 'chart'">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-6">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Aylik Odeme Dagilimi</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Son 6 ayin hakedis ve fatura ozetleri</p>
          <div class="h-80">
            <Bar :data="monthlyChartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Monthly breakdown cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <div v-for="(m, idx) in monthlyBreakdown" :key="idx" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{{ m.label }}</p>
            <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(m.payroll) }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Hakedis</p>
            <p class="text-sm font-bold text-primary mt-1">{{ formatCurrency(m.invoice) }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Fatura</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Wallet, Download, Search, RefreshCw, CheckCircle, Clock, FileText,
  Truck, DollarSign, CreditCard, TrendingUp, AlertCircle, ChevronLeft,
  ChevronRight, Eye, Printer, Send, Filter, Plus, XCircle, BarChart3
} from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { formatCurrency, formatNumber, formatDate, formatDateTime } from '@/utils'
import { getStats, getCouriers, getPricingRules } from '@/services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const router = useRouter()
const activeTab = ref('payroll')
const loading = ref(false)
const error = ref(null)
const payrollData = ref([])
const invoices = ref([])
const payrollSearch = ref('')
const payrollStatus = ref('')
const payrollStatusTab = ref('')
const invoiceSearch = ref('')
const invoiceStatus = ref('')
const currentPage = ref(1)
const perPage = 15

// Payroll selection & confirmation state
const selectedPayrolls = ref([])
const confirmPayroll = ref(null)

const generateMockData = () => {
  const courierNames = [
    'Serkan Acar', 'Murat Yildirim', 'Hakan Tekin', 'Kemal Bas',
    'Selim Dursun', 'Taner Gul', 'Volkan Aslan', 'Cem Ozkan',
    'Baris Ay', 'Erkan Sahin', 'Firat Kocer', 'Deniz Uysal',
    'Caner Aktas', 'Onur Cevik', 'Tolga Eren'
  ]

  const payrollStatuses = ['pending', 'approved', 'paid', 'paid', 'paid']

  payrollData.value = courierNames.map((name, i) => {
    const deliveries = Math.floor(Math.random() * 250) + 80
    const perDelivery = Math.random() * 10 + 25
    const gross = Math.round(deliveries * perDelivery)
    const sgk = Math.round(gross * 0.14)
    const tax = Math.round(gross * 0.15)
    const penalty = Math.random() > 0.7 ? Math.floor(Math.random() * 200) + 50 : 0
    const bonus = Math.random() > 0.5 ? Math.floor(Math.random() * 300) + 100 : 0
    const deductions = sgk + tax + penalty
    const net = gross - deductions + bonus
    const status = payrollStatuses[i % payrollStatuses.length]
    return {
      _id: `pay-${i}`,
      courier: name,
      period: 'Ocak 2026',
      deliveries,
      gross,
      sgk,
      tax,
      penalty,
      bonus,
      deductions,
      net,
      status,
      approvedBy: status !== 'pending' ? 'Admin' : null,
      paidAt: status === 'paid' ? new Date(Date.now() - Math.random() * 604800000).toISOString() : null,
    }
  })

  const invoiceStatuses = ['draft', 'sent', 'paid', 'paid', 'overdue', 'cancelled']
  const clients = [
    'E-Ticaret Lojistik A.S.', 'Istanbul Ana Dagitim Ltd.', 'Express Kargo A.S.',
    'Gida Dagitim Ltd.', 'Ankara Bolge Ltd.', 'Izmir Sahil A.S.',
    'Bursa Sanayi Ltd.', 'Antalya Turizm A.S.'
  ]

  invoices.value = Array.from({ length: 25 }, (_, i) => {
    const amount = Math.floor(Math.random() * 50000) + 5000
    const status = invoiceStatuses[i % invoiceStatuses.length]
    return {
      _id: `inv-${i}`,
      invoiceNumber: `FTR-${String(2026001 + i)}`,
      client: clients[i % clients.length],
      project: ['Istanbul Ana Dagitim', 'Express Teslimat', 'Gida Dagitim', 'E-Ticaret Lojistik'][i % 4],
      amount,
      tax: Math.round(amount * 0.20),
      total: Math.round(amount * 1.20),
      status,
      issueDate: new Date(2026, 0, Math.floor(Math.random() * 28) + 1).toISOString(),
      dueDate: new Date(2026, 1, Math.floor(Math.random() * 28) + 1).toISOString(),
      paidAt: status === 'paid' ? new Date(Date.now() - Math.random() * 1296000000).toISOString() : null,
    }
  })
}

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const [statsRes, couriersRes, pricingRes] = await Promise.all([
      getStats(),
      getCouriers(),
      getPricingRules(),
    ])

    if (couriersRes.ok && couriersRes.data) {
      const couriers = Array.isArray(couriersRes.data) ? couriersRes.data : couriersRes.data?.couriers || []
      if (couriers.length > 0) {
        const payrollStatuses = ['pending', 'approved', 'paid', 'paid', 'paid']
        payrollData.value = couriers.map((c, i) => {
          const deliveries = c.deliveryCount || c.totalDeliveries || Math.floor(Math.random() * 250) + 80
          const perDelivery = c.perDeliveryRate || (Math.random() * 10 + 25)
          const gross = Math.round(deliveries * perDelivery)
          const sgk = Math.round(gross * 0.14)
          const tax = Math.round(gross * 0.15)
          const penalty = c.penalty || 0
          const bonus = c.bonus || 0
          const deductions = sgk + tax + penalty
          const net = gross - deductions + bonus
          const status = c.payrollStatus || payrollStatuses[i % payrollStatuses.length]
          return {
            _id: c.id || c._id || `pay-${i}`,
            courier: c.name || `Kurye ${i + 1}`,
            period: 'Ocak 2026',
            deliveries,
            gross,
            sgk,
            tax,
            penalty,
            bonus,
            deductions,
            net,
            status,
            approvedBy: status !== 'pending' ? 'Admin' : null,
            paidAt: status === 'paid' ? new Date(Date.now() - Math.random() * 604800000).toISOString() : null,
          }
        })
      }
    }

    // If payroll not populated from API, use mock
    if (payrollData.value.length === 0) {
      generateMockData()
    } else {
      // Still generate mock invoices (no invoice API available)
      const invoiceStatuses = ['draft', 'sent', 'paid', 'paid', 'overdue', 'cancelled']
      const clients = [
        'E-Ticaret Lojistik A.S.', 'Istanbul Ana Dagitim Ltd.', 'Express Kargo A.S.',
        'Gida Dagitim Ltd.', 'Ankara Bolge Ltd.', 'Izmir Sahil A.S.',
        'Bursa Sanayi Ltd.', 'Antalya Turizm A.S.'
      ]
      invoices.value = Array.from({ length: 25 }, (_, i) => {
        const amount = Math.floor(Math.random() * 50000) + 5000
        const status = invoiceStatuses[i % invoiceStatuses.length]
        return {
          _id: `inv-${i}`,
          invoiceNumber: `FTR-${String(2026001 + i)}`,
          client: clients[i % clients.length],
          project: ['Istanbul Ana Dagitim', 'Express Teslimat', 'Gida Dagitim', 'E-Ticaret Lojistik'][i % 4],
          amount,
          tax: Math.round(amount * 0.20),
          total: Math.round(amount * 1.20),
          status,
          issueDate: new Date(2026, 0, Math.floor(Math.random() * 28) + 1).toISOString(),
          dueDate: new Date(2026, 1, Math.floor(Math.random() * 28) + 1).toISOString(),
          paidAt: status === 'paid' ? new Date(Date.now() - Math.random() * 1296000000).toISOString() : null,
        }
      })
    }
  } catch (e) {
    console.error('[Finance] API error:', e)
    error.value = 'Veriler yuklenirken hata olustu'
    generateMockData()
  } finally {
    loading.value = false
  }

})

const payrollStatusConfig = {
  pending: { label: 'Beklemede', color: '#f59e0b', bg: '#fef3c7' },
  approved: { label: 'Onaylandi', color: '#3b82f6', bg: '#dbeafe' },
  paid: { label: 'Odendi', color: '#10b981', bg: '#d1fae5' },
}

const invoiceStatusConfig = {
  draft: { label: 'Taslak', color: '#6b7280', bg: '#f3f4f6' },
  sent: { label: 'Gonderildi', color: '#3b82f6', bg: '#dbeafe' },
  paid: { label: 'Odendi', color: '#10b981', bg: '#d1fae5' },
  overdue: { label: 'Gecikmi', color: '#ef4444', bg: '#fee2e2' },
  cancelled: { label: 'Iptal', color: '#6b7280', bg: '#f3f4f6' },
}

const filteredPayroll = computed(() => {
  return payrollData.value.filter(p => {
    const matchSearch = !payrollSearch.value || p.courier.toLowerCase().includes(payrollSearch.value.toLowerCase())
    const matchStatus = !payrollStatusTab.value || p.status === payrollStatusTab.value
    return matchSearch && matchStatus
  })
})

const filteredInvoices = computed(() => {
  return invoices.value.filter(inv => {
    const matchSearch = !invoiceSearch.value ||
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.value.toLowerCase()) ||
      inv.client.toLowerCase().includes(invoiceSearch.value.toLowerCase())
    const matchStatus = !invoiceStatus.value || inv.status === invoiceStatus.value
    return matchSearch && matchStatus
  })
})

const totalGross = computed(() => payrollData.value.reduce((s, p) => s + p.gross, 0))
const totalNet = computed(() => payrollData.value.reduce((s, p) => s + p.net, 0))
const totalDeductions = computed(() => payrollData.value.reduce((s, p) => s + p.deductions, 0))
const pendingPayroll = computed(() => payrollData.value.filter(p => p.status === 'pending').length)
const totalInvoiceAmount = computed(() => invoices.value.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.total, 0))
const paidInvoiceAmount = computed(() => invoices.value.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0))
const overdueAmount = computed(() => invoices.value.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0))
const monthlyExpected = computed(() => totalGross.value + totalInvoiceAmount.value)

// Payroll selection helpers
const selectedPayrollTotal = computed(() => {
  return payrollData.value
    .filter(p => selectedPayrolls.value.includes(p._id))
    .reduce((s, p) => s + p.net, 0)
})

const isAllSelected = computed(() => {
  const pendingItems = filteredPayroll.value.filter(p => p.status === 'pending')
  return pendingItems.length > 0 && pendingItems.every(p => selectedPayrolls.value.includes(p._id))
})

function toggleSelectAll() {
  const pendingItems = filteredPayroll.value.filter(p => p.status === 'pending')
  if (isAllSelected.value) {
    selectedPayrolls.value = selectedPayrolls.value.filter(id => !pendingItems.some(p => p._id === id))
  } else {
    const newIds = pendingItems.map(p => p._id).filter(id => !selectedPayrolls.value.includes(id))
    selectedPayrolls.value = [...selectedPayrolls.value, ...newIds]
  }
}

function togglePayrollSelection(id) {
  const idx = selectedPayrolls.value.indexOf(id)
  if (idx > -1) {
    selectedPayrolls.value.splice(idx, 1)
  } else {
    selectedPayrolls.value.push(id)
  }
}

function executeApprove(payroll) {
  payroll.status = 'approved'
  payroll.approvedBy = 'Admin'
  confirmPayroll.value = null
}

function bulkApprove() {
  payrollData.value.forEach(p => {
    if (selectedPayrolls.value.includes(p._id) && p.status === 'pending') {
      p.status = 'approved'
      p.approvedBy = 'Admin'
    }
  })
  selectedPayrolls.value = []
}

function getDaysRemaining(dueDate) {
  const now = new Date()
  const due = new Date(dueDate)
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24))
}

// Chart data
const monthLabels = ['Eylul', 'Ekim', 'Kasim', 'Aralik', 'Ocak', 'Subat']

const monthlyBreakdown = computed(() => {
  return monthLabels.map((label, idx) => {
    const basePayroll = totalNet.value * (0.7 + Math.random() * 0.6)
    const baseInvoice = totalInvoiceAmount.value * (0.5 + Math.random() * 0.8)
    return {
      label,
      payroll: Math.round(basePayroll / (6 - idx * 0.3)),
      invoice: Math.round(baseInvoice / (6 - idx * 0.3)),
    }
  })
})

const monthlyChartData = computed(() => ({
  labels: monthLabels,
  datasets: [
    {
      label: 'Hakedis Odemesi',
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 6,
      data: monthlyBreakdown.value.map(m => m.payroll),
    },
    {
      label: 'Fatura Tahsilati',
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderRadius: 6,
      data: monthlyBreakdown.value.map(m => m.invoice),
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12 } },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: {
        font: { size: 11 },
        callback: (val) => formatCurrency(val),
      },
    },
  },
}

const tabs = [
  { id: 'payroll', label: 'Kurye Hakedis', icon: Truck },
  { id: 'invoices', label: 'Faturalar', icon: FileText },
  { id: 'chart', label: 'Grafik', icon: BarChart3 },
]

</script>
