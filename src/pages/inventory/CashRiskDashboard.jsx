import { useState, useEffect } from 'react'
import {
  AlertTriangle, Phone, MessageSquare, MapPin, X, Shield,
  Bell, Eye, PhoneCall, Send, Radio
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const fmt = (n) => '₺' + n.toLocaleString('tr-TR')

function seed(i) { return ((i * 6701 + 51297) % 173280) / 173280 }

const RISK_LEVELS = [
  { key: 'normal', label: 'NORMAL', range: '<₺3K', color: 'bg-green-500', border: 'border-green-200 dark:border-green-800', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', count: 98, amount: 45200 },
  { key: 'attention', label: 'DİKKAT', range: '₺3K-₺5K', color: 'bg-yellow-500', border: 'border-yellow-200 dark:border-yellow-800', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', count: 28, amount: 98400 },
  { key: 'risky', label: 'RİSKLİ', range: '₺5K-₺10K', color: 'bg-red-500', border: 'border-red-200 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', count: 12, amount: 78600 },
  { key: 'critical', label: 'KRİTİK', range: '>₺10K', color: 'bg-red-700', border: 'border-red-300 dark:border-red-700', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', count: 4, amount: 52300 },
]

const CRITICAL_COURIERS_INIT = [
  { id: 1, name: 'Mehmet Y.', cash: 15200, duration: '4s 15dk', location: 'Kadıköy', lat: 40.99, lng: 29.03, icon: '‼️' },
  { id: 2, name: 'Ayşe D.', cash: 12400, duration: '3s 45dk', location: 'Beşiktaş', lat: 41.04, lng: 29.00, icon: '‼️' },
  { id: 3, name: 'Can Ö.', cash: 10800, duration: '2s 30dk', location: 'Şişli', lat: 41.06, lng: 28.98, icon: '⚠️' },
  { id: 4, name: 'Veli A.', cash: 8450, duration: '3s 20dk', location: 'Üsküdar', lat: 41.02, lng: 29.02, icon: '⚠️' },
  { id: 5, name: 'Hasan M.', cash: 7200, duration: '2s 50dk', location: 'Ataşehir', lat: 41.00, lng: 29.10, icon: '⚠️' },
  { id: 6, name: 'Emre K.', cash: 6100, duration: '1s 45dk', location: 'Maltepe', lat: 40.93, lng: 29.13, icon: '⚠️' },
]

const HOURLY_DATA = [
  { hour: '09:00', tahsilat: 8200, teslim: 2100 },
  { hour: '10:00', tahsilat: 15400, teslim: 5200 },
  { hour: '11:00', tahsilat: 22100, teslim: 12400 },
  { hour: '12:00', tahsilat: 18700, teslim: 15800 },
  { hour: '13:00', tahsilat: 25300, teslim: 18200 },
  { hour: '14:00', tahsilat: 28900, teslim: 22500 },
  { hour: '15:00', tahsilat: 21600, teslim: 19800 },
  { hour: '16:00', tahsilat: 16400, teslim: 14200 },
  { hour: '17:00', tahsilat: 12300, teslim: 9800 },
  { hour: '18:00', tahsilat: 8100, teslim: 6500 },
  { hour: '19:00', tahsilat: 4200, teslim: 3200 },
  { hour: '20:00', tahsilat: 2800, teslim: 1800 },
]

const MAP_COURIERS = Array.from({ length: 30 }, (_, i) => {
  const cash = Math.floor(seed(i) * 16000)
  const risk = cash >= 10000 ? 'critical' : cash >= 5000 ? 'risky' : cash >= 3000 ? 'attention' : 'normal'
  return {
    id: i + 1,
    x: 10 + seed(i + 1) * 80,
    y: 10 + seed(i + 2) * 80,
    risk,
    cash,
  }
})

const ALERTS_CONFIG = [
  { text: '₺5,000 aşımında operatöre bildirim', checked: true },
  { text: '₺10,000 aşımında yöneticiye SMS', checked: true },
  { text: '3 saat nakit taşımada kuryeye hatırlatma', checked: true },
  { text: '4 saat nakit taşımada operatöre uyarı', checked: true },
  { text: 'GPS kaybında anında alarm', checked: true },
]

export default function CashRiskDashboard() {
  const [selectedRisk, setSelectedRisk] = useState(null)
  const [alertModal, setAlertModal] = useState(null)
  const [couriers, setCouriers] = useState(CRITICAL_COURIERS_INIT)
  const [alerts, setAlerts] = useState(ALERTS_CONFIG)
  const [liveTick, setLiveTick] = useState(0)

  // Simulated live update
  useEffect(() => {
    const timer = setInterval(() => {
      setCouriers(prev => prev.map(c => ({
        ...c,
        cash: c.cash + Math.floor((Math.random() - 0.3) * 500),
      })))
      setLiveTick(t => t + 1)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const totalFieldCash = RISK_LEVELS.reduce((s, r) => s + r.amount, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Nakit Risk Takip</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs font-semibold text-red-700 dark:text-red-400">CANLI</span>
        </div>
      </div>

      {/* Risk Level Cards */}
      <div className="grid grid-cols-4 gap-4 mb-3">
        {RISK_LEVELS.map(r => (
          <button
            key={r.key}
            onClick={() => setSelectedRisk(selectedRisk === r.key ? null : r.key)}
            className={`bg-white dark:bg-slate-900 rounded-xl border p-5 cursor-pointer transition-all text-left ${selectedRisk === r.key ? `${r.border} ring-2 ring-offset-1 ring-${r.color.replace('bg-', '')}` : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${r.color}`} />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{r.label}</span>
              </div>
              <span className="text-[10px] text-slate-400">({r.range})</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{r.count} <span className="text-sm font-normal text-slate-400">kurye</span></p>
            <p className={`text-sm font-semibold mt-1 ${r.text}`}>{fmt(r.amount)}</p>
          </button>
        ))}
      </div>
      <div className="text-center mb-6">
        <span className="text-sm text-slate-500 dark:text-slate-400">Toplam Sahada Nakit: </span>
        <span className="text-lg font-bold text-slate-800 dark:text-white">{fmt(totalFieldCash)}</span>
      </div>

      {/* Critical Couriers */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800 overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600" />
          <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Kritik Kuryeler ({'>'}₺5K veya {'>'}3 saat)</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {['', 'Kurye', 'Nakit', 'Süre', 'Konum', 'İşlem'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {couriers.map(c => (
              <tr key={c.id} className={`border-b border-slate-50 dark:border-slate-800/50 ${c.cash >= 10000 ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-orange-50/30 dark:bg-orange-900/5'}`}>
                <td className="px-4 py-2.5 text-center">{c.icon}</td>
                <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-white">{c.name}</td>
                <td className="px-4 py-2.5 font-bold text-red-600">{fmt(c.cash)}</td>
                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{c.duration}</td>
                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{c.location}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer" title="Ara"><Phone size={14} className="text-blue-600" /></button>
                    <button onClick={() => setAlertModal(c)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg cursor-pointer" title="Uyarı"><AlertTriangle size={14} className="text-red-600" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-blue-100"><PhoneCall size={13} /> Toplu Ara</button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-purple-100"><Send size={13} /> Toplu SMS</button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-emerald-100"><MapPin size={13} /> Haritada Gör</button>
        </div>
      </div>

      {/* Map + Chart row */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Simulated Map */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <MapPin size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nakit Taşıma Haritası</span>
          </div>
          <div className="relative h-72 bg-slate-100 dark:bg-slate-800">
            {/* Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
              {[...Array(8)].map((_, i) => <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />)}
              {[...Array(10)].map((_, i) => <line key={`v${i}`} x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />)}
            </svg>

            {/* Heat zones */}
            <div className="absolute w-32 h-32 rounded-full bg-red-400/15 blur-xl" style={{ left: '25%', top: '30%' }} />
            <div className="absolute w-24 h-24 rounded-full bg-yellow-400/15 blur-xl" style={{ left: '55%', top: '50%' }} />
            <div className="absolute w-20 h-20 rounded-full bg-orange-400/10 blur-xl" style={{ left: '70%', top: '25%' }} />

            {/* Courier dots */}
            {MAP_COURIERS.map(c => {
              const colorMap = { normal: 'bg-green-500', attention: 'bg-yellow-500', risky: 'bg-red-500', critical: 'bg-red-700' }
              const sizeMap = { normal: 'w-2 h-2', attention: 'w-2.5 h-2.5', risky: 'w-3 h-3', critical: 'w-3.5 h-3.5' }
              return (
                <div
                  key={c.id}
                  className={`absolute rounded-full ${colorMap[c.risk]} ${sizeMap[c.risk]} ${c.risk === 'critical' ? 'animate-pulse' : ''}`}
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  title={`${fmt(c.cash)}`}
                />
              )
            })}

            {/* Legend */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
              {[
                { color: 'bg-green-500', label: 'Normal' },
                { color: 'bg-yellow-500', label: 'Dikkat' },
                { color: 'bg-red-500', label: 'Riskli' },
                { color: 'bg-red-700', label: 'Kritik' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Saatlik Tahsilat vs Teslim</span>
          </div>
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `₺${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="tahsilat" name="Tahsilat" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="teslim" name="Teslim" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Bell size={16} /> Otomatik Uyarılar</h3>
        <div className="space-y-2.5">
          {alerts.map((a, i) => (
            <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <input type="checkbox" checked={a.checked} onChange={() => setAlerts(prev => prev.map((al, idx) => idx === i ? { ...al, checked: !al.checked } : al))} className="accent-primary" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{a.text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAlertModal(null)} />
          <div className="relative w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-t-2xl flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              <h3 className="font-bold text-red-800 dark:text-red-300">Nakit Limit Uyarısı</h3>
              <button onClick={() => setAlertModal(null)} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg cursor-pointer"><X size={16} className="text-red-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Kurye:</span><span className="font-semibold text-slate-800 dark:text-white">{alertModal.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Nakit:</span><span className="font-bold text-red-600">{fmt(alertModal.cash)} <span className="text-xs text-slate-400">(Limit: ₺10,000)</span></span></div>
                <div className="flex justify-between"><span className="text-slate-500">Süre:</span><span className="text-slate-700 dark:text-slate-300">{alertModal.duration}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Konum:</span><span className="text-slate-700 dark:text-slate-300">{alertModal.location}</span></div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Son Tahsilatlar</p>
                <div className="space-y-1.5">
                  {[
                    { order: '#4521', amount: 2450, time: '12:15' },
                    { order: '#4522', amount: 3200, time: '12:45' },
                    { order: '#4523', amount: 4100, time: '13:30' },
                    { order: '#4524', amount: 5450, time: '14:15' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 dark:bg-slate-800 rounded">
                      <span className="font-mono text-slate-600 dark:text-slate-400">{t.order}</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{fmt(t.amount)}</span>
                      <span className="text-slate-400">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-blue-100"><Phone size={14} /> Kuryeyi Ara</button>
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-purple-100"><MessageSquare size={14} /> SMS Gönder</button>
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-emerald-100"><MapPin size={14} /> Konum</button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button onClick={() => setAlertModal(null)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Daha Sonra Hatırlat</button>
              <button onClick={() => setAlertModal(null)} className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><Eye size={16} /> Kontrol Et</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
