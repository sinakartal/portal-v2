<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Finans</h1>
        <p class="text-sm text-slate-500 mt-1">Kurye hakedisleri ve fatura yonetimi</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors cursor-pointer">
          <Download :size="16" /> Rapor Indir
        </button>
      </div>
    </div>

    <!-- KPI Summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <DollarSign :size="16" class="text-green-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ formatCurrency(totalGross) }}</p>
        <p class="text-xs text-slate-500 mt-1">Toplam Brut Hakedis</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Wallet :size="16" class="text-blue-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ formatCurrency(totalNet) }}</p>
        <p class="text-xs text-slate-500 mt-1">Toplam Net Odeme</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Clock :size="16" class="text-amber-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ pendingPayroll }}</p>
        <p class="text-xs text-slate-500 mt-1">Onay Bekleyen</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
            <TrendingUp :size="16" class="text-purple-500" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ formatCurrency(totalInvoiceAmount) }}</p>
        <p class="text-xs text-slate-500 mt-1">Toplam Fatura</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200 mb-6">
      <div class="flex gap-0">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id; currentPage = 1"
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

    <!-- Payroll Tab -->
    <div v-if="activeTab === 'payroll'">
      <!-- Search & Filter -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 mb-4">
        <div class="flex flex-wrap gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              v-model="payrollSearch"
              placeholder="Kurye adi ara..."
              class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            v-model="payrollStatus"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tum Durumlar</option>
            <option v-for="(val, key) in payrollStatusConfig" :key="key" :value="key">{{ val.label }}</option>
          </select>
          <button @click="payrollSearch = ''; payrollStatus = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
            <RefreshCw :size="14" /> Sifirla
          </button>
        </div>
      </div>

      <!-- Payroll Table -->
      <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Donem</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Teslimat</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Brut</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">SGK</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Vergi</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Ceza</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Bonus</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Kesinti</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Net</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredPayroll" :key="p._id" class="border-b border-slate-50 hover:bg-slate-50/50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck :size="12" class="text-primary" />
                    </div>
                    <span class="font-medium text-slate-800">{{ p.courier }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ p.period }}</td>
                <td class="px-4 py-3 text-center text-slate-600">{{ formatNumber(p.deliveries) }}</td>
                <td class="px-4 py-3 text-right text-slate-700">{{ formatCurrency(p.gross) }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(p.sgk) }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(p.tax) }}</td>
                <td class="px-4 py-3 text-right text-red-500">{{ p.penalty > 0 ? formatCurrency(p.penalty) : '-' }}</td>
                <td class="px-4 py-3 text-right text-green-600">{{ p.bonus > 0 ? formatCurrency(p.bonus) : '-' }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(p.deductions) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(p.net) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium" :style="{ backgroundColor: payrollStatusConfig[p.status].bg, color: payrollStatusConfig[p.status].color }">
                    {{ payrollStatusConfig[p.status].label }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-center gap-1">
                    <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay">
                      <Eye :size="14" class="text-slate-500" />
                    </button>
                    <button v-if="p.status === 'pending'" class="p-1.5 hover:bg-green-50 rounded cursor-pointer" title="Onayla">
                      <CheckCircle :size="14" class="text-green-500" />
                    </button>
                    <button v-if="p.status === 'approved'" class="p-1.5 hover:bg-blue-50 rounded cursor-pointer" title="Ode">
                      <CreditCard :size="14" class="text-blue-500" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-slate-50 border-t-2 border-slate-200">
                <td class="px-4 py-3 font-bold text-slate-800" colspan="2">TOPLAM</td>
                <td class="px-4 py-3 text-center font-bold text-slate-700">{{ formatNumber(filteredPayroll.reduce((s, p) => s + p.deliveries, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-700">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.gross, 0)) }}</td>
                <td class="px-4 py-3 text-right font-medium text-slate-600">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.sgk, 0)) }}</td>
                <td class="px-4 py-3 text-right font-medium text-slate-600">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.tax, 0)) }}</td>
                <td class="px-4 py-3 text-right font-medium text-red-500">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.penalty, 0)) }}</td>
                <td class="px-4 py-3 text-right font-medium text-green-600">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.bonus, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-600">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.deductions, 0)) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(filteredPayroll.reduce((s, p) => s + p.net, 0)) }}</td>
                <td colspan="2" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Invoices Tab -->
    <div v-if="activeTab === 'invoices'">
      <!-- Invoice KPIs -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="bg-green-50 rounded-xl border border-green-100 p-4">
          <p class="text-xs text-green-600 font-medium mb-1">Odenen Faturalar</p>
          <p class="text-xl font-bold text-green-700">{{ formatCurrency(paidInvoiceAmount) }}</p>
        </div>
        <div class="bg-red-50 rounded-xl border border-red-100 p-4">
          <p class="text-xs text-red-600 font-medium mb-1">Geciken Faturalar</p>
          <p class="text-xl font-bold text-red-700">{{ formatCurrency(overdueAmount) }}</p>
        </div>
        <div class="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p class="text-xs text-blue-600 font-medium mb-1">Bekleyen Tahsilat</p>
          <p class="text-xl font-bold text-blue-700">{{ formatCurrency(totalInvoiceAmount - paidInvoiceAmount) }}</p>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 mb-4">
        <div class="flex flex-wrap gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              v-model="invoiceSearch"
              placeholder="Fatura no, musteri ara..."
              class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            v-model="invoiceStatus"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tum Durumlar</option>
            <option v-for="(val, key) in invoiceStatusConfig" :key="key" :value="key">{{ val.label }}</option>
          </select>
          <button @click="invoiceSearch = ''; invoiceStatus = ''" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
            <RefreshCw :size="14" /> Sifirla
          </button>
        </div>
      </div>

      <!-- Invoice Table -->
      <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-4 py-3 font-medium text-slate-600">Fatura No</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Musteri</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Proje</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Tutar</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">KDV</th>
                <th class="text-right px-4 py-3 font-medium text-slate-600">Toplam</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Duzenleme</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Vade</th>
                <th class="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in filteredInvoices" :key="inv._id" class="border-b border-slate-50 hover:bg-slate-50/50">
                <td class="px-4 py-3 font-medium text-primary cursor-pointer">{{ inv.invoiceNumber }}</td>
                <td class="px-4 py-3 text-slate-700">{{ inv.client }}</td>
                <td class="px-4 py-3 text-slate-600">{{ inv.project }}</td>
                <td class="px-4 py-3 text-right text-slate-700">{{ formatCurrency(inv.amount) }}</td>
                <td class="px-4 py-3 text-right text-slate-500">{{ formatCurrency(inv.tax) }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-800">{{ formatCurrency(inv.total) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium" :style="{ backgroundColor: invoiceStatusConfig[inv.status].bg, color: invoiceStatusConfig[inv.status].color }">
                    {{ invoiceStatusConfig[inv.status].label }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-500">{{ formatDate(inv.issueDate) }}</td>
                <td class="px-4 py-3 text-slate-500">{{ formatDate(inv.dueDate) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-center gap-1">
                    <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Goruntule">
                      <Eye :size="14" class="text-slate-500" />
                    </button>
                    <button class="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Yazdir">
                      <Printer :size="14" class="text-slate-500" />
                    </button>
                    <button v-if="inv.status === 'draft'" class="p-1.5 hover:bg-blue-50 rounded cursor-pointer" title="Gonder">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Wallet, Download, Search, RefreshCw, CheckCircle, Clock, FileText,
  Truck, DollarSign, CreditCard, TrendingUp, AlertCircle, ChevronLeft,
  ChevronRight, Eye, Printer, Send, Filter
} from 'lucide-vue-next'
import { formatCurrency, formatNumber, formatDate, formatDateTime } from '@/utils'

const router = useRouter()
const activeTab = ref('payroll')
const payrollData = ref([])
const invoices = ref([])
const payrollSearch = ref('')
const payrollStatus = ref('')
const invoiceSearch = ref('')
const invoiceStatus = ref('')
const currentPage = ref(1)
const perPage = 15

onMounted(() => {
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
    const matchStatus = !payrollStatus.value || p.status === payrollStatus.value
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

const tabs = [
  { id: 'payroll', label: 'Kurye Hakedis', icon: Truck },
  { id: 'invoices', label: 'Faturalar', icon: FileText },
]
</script>
