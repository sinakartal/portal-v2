import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet, Download, Search, RefreshCw, CheckCircle, Clock, FileText,
  Truck, DollarSign, CreditCard, TrendingUp, AlertCircle, ChevronLeft,
  ChevronRight, Eye, Printer, Send, Filter
} from 'lucide-react'
import { formatCurrency, formatNumber, formatDate, formatDateTime } from '@/utils'

export default function Finance() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('payroll')
  const [payrollData, setPayrollData] = useState([])
  const [invoices, setInvoices] = useState([])
  const [payrollSearch, setPayrollSearch] = useState('')
  const [payrollStatus, setPayrollStatus] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceStatus, setInvoiceStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 15

  useEffect(() => {
    const courierNames = [
      'Serkan Acar', 'Murat Yildirim', 'Hakan Tekin', 'Kemal Bas',
      'Selim Dursun', 'Taner Gul', 'Volkan Aslan', 'Cem Ozkan',
      'Baris Ay', 'Erkan Sahin', 'Firat Kocer', 'Deniz Uysal',
      'Caner Aktas', 'Onur Cevik', 'Tolga Eren'
    ]

    const payrollStatuses = ['pending', 'approved', 'paid', 'paid', 'paid']

    setPayrollData(courierNames.map((name, i) => {
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
    }))

    const invoiceStatuses = ['draft', 'sent', 'paid', 'paid', 'overdue', 'cancelled']
    const clients = [
      'E-Ticaret Lojistik A.S.', 'Istanbul Ana Dagitim Ltd.', 'Express Kargo A.S.',
      'Gida Dagitim Ltd.', 'Ankara Bolge Ltd.', 'Izmir Sahil A.S.',
      'Bursa Sanayi Ltd.', 'Antalya Turizm A.S.'
    ]

    setInvoices(Array.from({ length: 25 }, (_, i) => {
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
    }))
  }, [])

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

  const filteredPayroll = payrollData.filter(p => {
    const matchSearch = !payrollSearch || p.courier.toLowerCase().includes(payrollSearch.toLowerCase())
    const matchStatus = !payrollStatus || p.status === payrollStatus
    return matchSearch && matchStatus
  })

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = !invoiceSearch ||
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.client.toLowerCase().includes(invoiceSearch.toLowerCase())
    const matchStatus = !invoiceStatus || inv.status === invoiceStatus
    return matchSearch && matchStatus
  })

  const totalGross = payrollData.reduce((s, p) => s + p.gross, 0)
  const totalNet = payrollData.reduce((s, p) => s + p.net, 0)
  const totalDeductions = payrollData.reduce((s, p) => s + p.deductions, 0)
  const pendingPayroll = payrollData.filter(p => p.status === 'pending').length
  const totalInvoiceAmount = invoices.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.total, 0)
  const paidInvoiceAmount = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0)

  const tabs = [
    { id: 'payroll', label: 'Kurye Hakedis', icon: Truck },
    { id: 'invoices', label: 'Faturalar', icon: FileText },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Finans</h1>
          <p className="text-sm text-slate-500 mt-1">Kurye hakedisleri ve fatura yonetimi</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors cursor-pointer">
            <Download size={16} /> Rapor Indir
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={16} className="text-green-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totalGross)}</p>
          <p className="text-xs text-slate-500 mt-1">Toplam Brut Hakedis</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Wallet size={16} className="text-blue-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totalNet)}</p>
          <p className="text-xs text-slate-500 mt-1">Toplam Net Odeme</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-amber-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{pendingPayroll}</p>
          <p className="text-xs text-slate-500 mt-1">Onay Bekleyen</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-purple-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totalInvoiceAmount)}</p>
          <p className="text-xs text-slate-500 mt-1">Toplam Fatura</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-0">
          {tabs.map(tab => {
            const TabIcon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1) }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                <TabIcon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <div>
          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={payrollSearch}
                  onChange={(e) => setPayrollSearch(e.target.value)}
                  placeholder="Kurye adi ara..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <select
                value={payrollStatus}
                onChange={(e) => setPayrollStatus(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Tum Durumlar</option>
                {Object.entries(payrollStatusConfig).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <button onClick={() => { setPayrollSearch(''); setPayrollStatus('') }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
                <RefreshCw size={14} /> Sifirla
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Donem</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Teslimat</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Brut</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">SGK</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Vergi</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Ceza</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Bonus</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Kesinti</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Net</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.map(p => {
                    const ps = payrollStatusConfig[p.status]
                    return (
                      <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Truck size={12} className="text-primary" />
                            </div>
                            <span className="font-medium text-slate-800">{p.courier}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{p.period}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{formatNumber(p.deliveries)}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(p.gross)}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(p.sgk)}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(p.tax)}</td>
                        <td className="px-4 py-3 text-right text-red-500">{p.penalty > 0 ? formatCurrency(p.penalty) : '-'}</td>
                        <td className="px-4 py-3 text-right text-green-600">{p.bonus > 0 ? formatCurrency(p.bonus) : '-'}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(p.deductions)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(p.net)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: ps.bg, color: ps.color }}>
                            {ps.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay">
                              <Eye size={14} className="text-slate-500" />
                            </button>
                            {p.status === 'pending' && (
                              <button className="p-1.5 hover:bg-green-50 rounded cursor-pointer" title="Onayla">
                                <CheckCircle size={14} className="text-green-500" />
                              </button>
                            )}
                            {p.status === 'approved' && (
                              <button className="p-1.5 hover:bg-blue-50 rounded cursor-pointer" title="Ode">
                                <CreditCard size={14} className="text-blue-500" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="px-4 py-3 font-bold text-slate-800" colSpan={2}>TOPLAM</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{formatNumber(filteredPayroll.reduce((s, p) => s + p.deliveries, 0))}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">{formatCurrency(filteredPayroll.reduce((s, p) => s + p.gross, 0))}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-600">{formatCurrency(filteredPayroll.reduce((s, p) => s + p.sgk, 0))}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-600">{formatCurrency(filteredPayroll.reduce((s, p) => s + p.tax, 0))}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-500">{formatCurrency(filteredPayroll.reduce((s, p) => s + p.penalty, 0))}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(filteredPayroll.reduce((s, p) => s + p.bonus, 0))}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-600">{formatCurrency(filteredPayroll.reduce((s, p) => s + p.deductions, 0))}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(filteredPayroll.reduce((s, p) => s + p.net, 0))}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div>
          {/* Invoice KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-xl border border-green-100 p-4">
              <p className="text-xs text-green-600 font-medium mb-1">Odenen Faturalar</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(paidInvoiceAmount)}</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-100 p-4">
              <p className="text-xs text-red-600 font-medium mb-1">Geciken Faturalar</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(overdueAmount)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Bekleyen Tahsilat</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(totalInvoiceAmount - paidInvoiceAmount)}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Fatura no, musteri ara..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <select
                value={invoiceStatus}
                onChange={(e) => setInvoiceStatus(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Tum Durumlar</option>
                {Object.entries(invoiceStatusConfig).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <button onClick={() => { setInvoiceSearch(''); setInvoiceStatus('') }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
                <RefreshCw size={14} /> Sifirla
              </button>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Fatura No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Musteri</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Proje</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Tutar</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">KDV</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Toplam</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Duzenleme</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Vade</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => {
                    const is = invoiceStatusConfig[inv.status]
                    return (
                      <tr key={inv._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-primary cursor-pointer">{inv.invoiceNumber}</td>
                        <td className="px-4 py-3 text-slate-700">{inv.client}</td>
                        <td className="px-4 py-3 text-slate-600">{inv.project}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(inv.amount)}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(inv.tax)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(inv.total)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: is.bg, color: is.color }}>
                            {is.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(inv.issueDate)}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Goruntule">
                              <Eye size={14} className="text-slate-500" />
                            </button>
                            <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Yazdir">
                              <Printer size={14} className="text-slate-500" />
                            </button>
                            {inv.status === 'draft' && (
                              <button className="p-1.5 hover:bg-blue-50 rounded cursor-pointer" title="Gonder">
                                <Send size={14} className="text-blue-500" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
