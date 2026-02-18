import { useState, useMemo } from 'react'
import {
  Search, RefreshCw, Download, Users, Package, Banknote, AlertTriangle,
  ChevronLeft, ChevronRight, X, Phone, MessageSquare, Eye, CheckCircle,
  Clock, Coffee, WifiOff, Truck, MapPin, ArrowRightLeft, Receipt
} from 'lucide-react'

const fmt = (n) => '₺' + n.toLocaleString('tr-TR')

const PROJECTS = ['Tümü', 'Istanbul Ana Dağıtım', 'Ankara Bölge', 'İzmir Sahil', 'Express Teslimat', 'Gıda Dağıtım']

const STATUSES = [
  { key: 'all', label: 'Tümü' },
  { key: 'delivering', label: 'Dağıtımda', color: 'bg-green-500' },
  { key: 'break', label: 'Mola', color: 'bg-yellow-500' },
  { key: 'atDelivery', label: 'Teslimde', color: 'bg-blue-500' },
  { key: 'offline', label: 'Offline', color: 'bg-slate-400' },
]

const RISK_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'normal', label: 'Normal', color: 'text-green-600' },
  { key: 'attention', label: 'Dikkat', color: 'text-yellow-600' },
  { key: 'risky', label: 'Riskli', color: 'text-red-600' },
  { key: 'critical', label: 'Kritik', color: 'text-red-800' },
]

function riskOf(cash) {
  if (cash >= 10000) return { level: 'critical', label: 'Kritik', dot: '⚠️', cls: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' }
  if (cash >= 5000) return { level: 'risky', label: 'Riskli', dot: '🔴', cls: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' }
  if (cash >= 3000) return { level: 'attention', label: 'Dikkat', dot: '🟡', cls: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' }
  return { level: 'normal', label: 'Normal', dot: '🟢', cls: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' }
}

const statusLabel = (s) => {
  const map = { delivering: 'Dağıtımda', break: 'Mola', atDelivery: 'Teslimde', offline: 'Offline' }
  return map[s] || s
}
const statusColor = (s) => {
  const map = { delivering: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', break: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', atDelivery: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', offline: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500' }
  return map[s] || ''
}

const NAMES = [
  'Ali Rıza Kaya', 'Mehmet Yılmaz', 'Veli Aksoy', 'Ayşe Demir', 'Can Özdemir',
  'Fatma Sarı', 'Emre Koç', 'Zeynep Türk', 'Hasan Mutlu', 'Burak Çelik',
  'Derya Aydın', 'Oğuz Kara', 'Selin Bal', 'Kemal Usta', 'Nurgül Şen',
  'Tuncay Yıldız', 'Emine Güneş', 'İbrahim Taş', 'Pınar Eren', 'Murat Koçak',
  'Gökhan Arslan', 'Sibel Doğan', 'Cem Aktaş', 'Deniz Polat',
]

function seed(i) { return ((i * 9301 + 49297) % 233280) / 233280 }

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
  return {
    id: i + 1, name, status, assigned, delivered, pending, failed, cash,
    lastActivity: mins < 5 ? 'Az önce' : mins < 60 ? `${mins} dk önce` : `${Math.floor(mins / 60)} saat önce`,
    phone: `053${Math.floor(seed(i + 6) * 9)}${Math.floor(seed(i + 7) * 10000000).toString().padStart(7, '0')}`,
    location: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Bakırköy', 'Ataşehir', 'Maltepe', 'Pendik'][Math.floor(seed(i + 8) * 8)],
    firstZimmet: `0${8 + Math.floor(seed(i + 9) * 2)}:${Math.floor(seed(i + 10) * 50).toString().padStart(2, '0')}`,
    lastDelivery: delivered > 0 ? `${12 + Math.floor(seed(i + 11) * 6)}:${Math.floor(seed(i + 12) * 59).toString().padStart(2, '0')}` : '-',
    cashOrders: Math.floor(seed(i + 13) * 6),
  }
})

const PAGE_SIZE = 10

export default function InventoryDashboard() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [project, setProject] = useState('Tümü')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)
  const [cashModal, setCashModal] = useState(null)
  const [cashAmount, setCashAmount] = useState('')
  const [cashType, setCashType] = useState('full')
  const [cashReason, setCashReason] = useState('')
  const [cashNote, setCashNote] = useState('')
  const [hovered, setHovered] = useState(null)
  const [tabFilter, setTabFilter] = useState('all')

  const filtered = useMemo(() => {
    return COURIERS.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (riskFilter !== 'all' && riskOf(c.cash).level !== riskFilter) return false
      return true
    })
  }, [search, statusFilter, riskFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totals = useMemo(() => ({
    active: COURIERS.filter(c => c.status !== 'offline').length,
    orders: COURIERS.reduce((s, c) => s + c.assigned, 0),
    cash: COURIERS.reduce((s, c) => s + c.cash, 0),
    risky: COURIERS.filter(c => c.cash >= 5000).length,
  }), [])

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2)

  // Detail mock orders
  const detailOrders = detail ? Array.from({ length: detail.assigned }, (_, i) => ({
    id: `BRN-${4500 + detail.id * 10 + i}`,
    customer: ['Ahmet Y.', 'Ayşe D.', 'Can Ö.', 'Zeynep A.', 'Emre K.', 'Fatma S.', 'Mehmet T.', 'Hasan B.', 'Selin K.', 'Burak M.', 'Derya A.', 'Oğuz N.', 'Nurgül Ş.', 'Kemal U.', 'Pınar E.', 'Tuncay Y.', 'Gökhan A.'][i % 17],
    amount: 100 + Math.floor(seed(detail.id * 100 + i) * 800),
    payment: ['Nakit', 'Nakit', 'Kart', 'Ödendi'][Math.floor(seed(detail.id * 100 + i + 50) * 4)],
    status: i < detail.delivered ? 'delivered' : i < detail.delivered + detail.pending ? 'pending' : 'failed',
    time: i < detail.delivered ? `${12 + Math.floor(seed(detail.id * 100 + i + 30) * 6)}:${Math.floor(seed(detail.id * 100 + i + 31) * 59).toString().padStart(2, '0')}` : '-',
    location: ['Kadıköy', 'Moda', 'Caddebostan', 'Fenerbahçe', 'Acıbadem', 'Kozyatağı', 'Bostancı'][i % 7],
  })) : []

  const filteredOrders = tabFilter === 'all' ? detailOrders : detailOrders.filter(o => {
    if (tabFilter === 'pending') return o.status === 'pending'
    if (tabFilter === 'delivered') return o.status === 'delivered'
    if (tabFilter === 'failed') return o.status === 'failed'
    return true
  })

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Zimmet & Nakit Takip</h1>
        <div className="flex items-center gap-3">
          <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300" />
          <select value={project} onChange={e => setProject(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            {PROJECTS.map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"><RefreshCw size={16} className="text-slate-500" /></button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: 'Aktif Kurye', value: totals.active, sub: 'online', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Package, label: 'Zimmetli Sipariş', value: totals.orders, sub: 'üzerlerinde', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { icon: Banknote, label: 'Toplam Nakit', value: fmt(totals.cash), sub: 'tahsil edildi', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { icon: AlertTriangle, label: 'Riskli Kurye', value: totals.risky, sub: '>₺5K nakit', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.bg}`}><c.icon size={16} className={c.color} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{c.value}</div>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Kurye ara..." className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Durum:</span>
            {STATUSES.map(s => (
              <button key={s.key} onClick={() => { setStatusFilter(s.key); setPage(1) }} className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${statusFilter === s.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{s.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Risk:</span>
            {RISK_FILTERS.map(r => (
              <button key={r.key} onClick={() => { setRiskFilter(r.key); setPage(1) }} className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${riskFilter === r.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{r.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['Kurye', 'Durum', 'Zimmet', 'Teslim', 'Bekleyen', 'Başarısız', 'Nakit Üzerinde', 'Risk', 'Son Aktivite', 'İşlemler'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(c => {
                const risk = riskOf(c.cash)
                return (
                  <tr key={c.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative" onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{initials(c.name)}</div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white text-sm">{c.name}</p>
                          <p className="text-[11px] text-slate-400">{c.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusColor(c.status)}`}>{statusLabel(c.status)}</span></td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{c.assigned}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{c.delivered}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium">{c.pending}</td>
                    <td className="px-4 py-3 text-red-500 font-medium">{c.failed}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{c.cash > 0 ? fmt(c.cash) : '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[11px] font-medium ${risk.cls}`}>{risk.dot} {risk.label}</span></td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{c.lastActivity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetail(c)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer" title="Detay"><Eye size={14} className="text-slate-500" /></button>
                        <button onClick={() => { setCashModal(c); setCashAmount(c.cash.toString()); setCashType('full') }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer" title="Mutabakat"><ArrowRightLeft size={14} className="text-slate-500" /></button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer" title="Mesaj"><MessageSquare size={14} className="text-slate-500" /></button>
                      </div>
                    </td>
                    {/* Hover tooltip */}
                    {hovered === c.id && c.status !== 'offline' && (
                      <td className="absolute right-0 top-0 z-30" style={{ position: 'absolute' }}>
                        <div className="absolute right-4 top-2 w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 z-50">
                          <p className="font-semibold text-sm text-slate-800 dark:text-white mb-2">{c.name} - Hızlı Özet</p>
                          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <p>📦 Zimmetli: {c.assigned} sipariş</p>
                            <p>✅ Teslim: {c.delivered} | ⏳ Bekleyen: {c.pending}</p>
                            <p>💰 Nakit: {fmt(c.cash)}</p>
                            <p>   ← {c.cashOrders} kapıda ödeme teslimi</p>
                            <p>🔰 İlk zimmet: {c.firstZimmet}</p>
                            <p>🕐 Son teslim: {c.lastDelivery}</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => setDetail(c)} className="px-2 py-1 bg-primary/10 text-primary text-[11px] font-medium rounded cursor-pointer hover:bg-primary/20">Detay Gör</button>
                            <button onClick={() => { setCashModal(c); setCashAmount(c.cash.toString()); setCashType('full') }} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium rounded cursor-pointer hover:bg-emerald-100">Mutabakat</button>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Toplam: {filtered.length} kurye</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={16} className="text-slate-500" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-xs font-medium cursor-pointer ${p === page ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={16} className="text-slate-500" /></button>
          </div>
        </div>
      </div>

      {/* Detail Slide-over */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetail(null)} />
          <div className="relative w-[560px] bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{detail.name} - Zimmet Detay</h2>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Courier info */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">{initials(detail.name)}</div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{detail.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={11} /> {detail.location}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={11} /> {detail.phone}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(detail.status)}`}>{statusLabel(detail.status)}</span>
                  <div className="flex gap-1.5">
                    <button className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs rounded-lg cursor-pointer hover:bg-blue-100 flex items-center gap-1"><Phone size={12} /> Ara</button>
                    <button className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-lg cursor-pointer hover:bg-slate-200 flex items-center gap-1"><MessageSquare size={12} /> Mesaj</button>
                  </div>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Zimmetli', value: detail.assigned, icon: '📦', color: 'text-slate-800 dark:text-white' },
                  { label: 'Teslim', value: detail.delivered, icon: '✅', color: 'text-green-600' },
                  { label: 'Bekleyen', value: detail.pending, icon: '⏳', color: 'text-blue-600' },
                  { label: 'Başarısız', value: detail.failed, icon: '❌', color: 'text-red-500' },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <p className="text-lg mb-0.5">{s.icon}</p>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Toplam Tahsilat', value: fmt(detail.cash + Math.floor(detail.delivered * 150)), color: 'text-slate-800 dark:text-white' },
                  { label: 'Nakit Üzerinde', value: fmt(detail.cash), color: 'text-orange-600' },
                  { label: 'Kart Tahsilat', value: fmt(Math.floor(detail.delivered * 95)), color: 'text-blue-600' },
                  { label: 'Ödendi', value: fmt(Math.floor(detail.delivered * 55)), color: 'text-slate-500' },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Tab filter */}
              <div className="flex gap-1.5">
                {[
                  { key: 'all', label: `Tümü (${detailOrders.length})` },
                  { key: 'pending', label: `Bekleyen (${detailOrders.filter(o => o.status === 'pending').length})` },
                  { key: 'delivered', label: `Teslim (${detailOrders.filter(o => o.status === 'delivered').length})` },
                  { key: 'failed', label: `Başarısız (${detailOrders.filter(o => o.status === 'failed').length})` },
                ].map(t => (
                  <button key={t.key} onClick={() => setTabFilter(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tabFilter === t.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{t.label}</button>
                ))}
              </div>

              {/* Orders list */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredOrders.map((o, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${o.status === 'delivered' ? 'border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10' : o.status === 'failed' ? 'border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-slate-800 dark:text-white">#{o.id}</span>
                        <span className="text-[11px] text-slate-400">{o.location}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{o.customer} • {o.phone || ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{fmt(o.amount)}</p>
                      <div className="flex items-center gap-1.5 justify-end mt-0.5">
                        <span className={`text-[11px] ${o.payment === 'Nakit' ? 'text-orange-600' : o.payment === 'Kart' ? 'text-blue-600' : 'text-slate-400'}`}>{o.payment}</span>
                        <span className={`text-[11px] font-medium ${o.status === 'delivered' ? 'text-green-600' : o.status === 'failed' ? 'text-red-500' : 'text-blue-500'}`}>
                          {o.status === 'delivered' ? `✅ ${o.time}` : o.status === 'failed' ? '❌ Başarısız' : '⏳ Yolda'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cash section */}
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">💰 Nakit Tahsilat Detay</h4>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Toplam nakit üzerinde:</span>
                  <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{fmt(detail.cash)}</span>
                </div>
                <p className="text-[11px] text-slate-500">{detail.cashOrders} adet kapıda nakit ödeme</p>
                {detail.cash >= 5000 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <AlertTriangle size={13} /> Nakit limitine yaklaşıyor (Limit: ₺10,000)
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => { setCashModal(detail); setCashAmount(detail.cash.toString()); setCashType('full'); setDetail(null) }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
                  <Banknote size={16} /> Nakit Teslim Al
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <ArrowRightLeft size={16} /> Sipariş Aktar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
                  <Receipt size={16} /> Mutabakat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Submit Modal */}
      {cashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCashModal(null)} />
          <div className="relative w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote size={20} className="text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nakit Teslim Al</h3>
              </div>
              <button onClick={() => setCashModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Kurye:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{cashModal.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tarih:</span>
                <span className="text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Sistemde Kayıtlı Nakit</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{fmt(cashModal.cash)}</p>
                <p className="text-[11px] text-slate-400">{cashModal.cashOrders} adet kapıda nakit ödeme</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Teslim Edilen Tutar</label>
                <input type="text" value={cashAmount} onChange={e => setCashAmount(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="₺0" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">Teslim Şekli</label>
                {[
                  { v: 'full', l: 'Tam tutar teslim' },
                  { v: 'partial', l: 'Kısmi teslim' },
                  { v: 'diff', l: 'Fark var (açıklama gerekli)' },
                ].map(o => (
                  <label key={o.v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cashType" value={o.v} checked={cashType === o.v} onChange={() => setCashType(o.v)} className="accent-primary" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{o.l}</span>
                  </label>
                ))}
              </div>

              {/* Mutabakat */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Mutabakat</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Sistemde:</span><span className="font-medium text-slate-800 dark:text-white">{fmt(cashModal.cash)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Teslim edilen:</span><span className="font-medium text-slate-800 dark:text-white">{fmt(parseInt(cashAmount) || 0)}</span></div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm">
                    <span className="text-slate-500">Fark:</span>
                    {(() => {
                      const diff = (parseInt(cashAmount) || 0) - cashModal.cash
                      return <span className={`font-bold ${diff === 0 ? 'text-green-600' : 'text-red-600'}`}>{diff === 0 ? '✅ Mutabık' : `${fmt(diff)}`}</span>
                    })()}
                  </div>
                </div>
              </div>

              {cashType === 'diff' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">Fark Nedeni</label>
                  {['Bozuk para eksik', 'Müşteriden eksik alındı', 'Para üstü verildi', 'Sayım hatası', 'Diğer'].map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="reason" value={r} checked={cashReason === r} onChange={() => setCashReason(r)} className="accent-primary" />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{r}</span>
                    </label>
                  ))}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Not</label>
                <input value={cashNote} onChange={e => setCashNote(e.target.value)} placeholder="Opsiyonel not..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button onClick={() => setCashModal(null)} className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">İptal</button>
              <button onClick={() => setCashModal(null)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors flex items-center gap-2"><CheckCircle size={16} /> Teslim Alındı Onayla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
