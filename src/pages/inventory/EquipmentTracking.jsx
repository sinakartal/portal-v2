import { useState } from 'react'
import {
  Search, Download, Plus, ArrowDownToLine, X, Smartphone, ShoppingBag,
  Bike, HardHat, Shirt, CloudRain, BatteryCharging, Check, AlertTriangle,
  Clock, ArrowUpFromLine, Wrench
} from 'lucide-react'

const NAMES = [
  'Ali Rıza Kaya', 'Mehmet Yılmaz', 'Veli Aksoy', 'Ayşe Demir', 'Can Özdemir',
  'Fatma Sarı', 'Emre Koç', 'Zeynep Türk', 'Hasan Mutlu', 'Burak Çelik',
  'Derya Aydın', 'Oğuz Kara', 'Selin Bal', 'Kemal Usta',
]

function seed(i) { return ((i * 8301 + 41297) % 193280) / 193280 }

const COURIERS = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  pos: seed(i) > 0.2 ? `#P-${String(10 + Math.floor(seed(i + 1) * 50)).padStart(3, '0')}` : null,
  bag: seed(i + 2) > 0.1 ? `#C-${String(1 + Math.floor(seed(i + 3) * 50)).padStart(2, '0')}` : null,
  motor: seed(i + 4) > 0.5 ? `34${['AB', 'CD', 'EF', 'GH', 'JK'][Math.floor(seed(i + 5) * 5)]}${Math.floor(10 + seed(i + 6) * 90)}` : null,
  others: [
    seed(i + 7) > 0.3 ? 'Kask' : null,
    seed(i + 8) > 0.4 ? 'Yelek' : null,
    seed(i + 9) > 0.7 ? 'Yağmurluk' : null,
    seed(i + 10) > 0.6 ? 'Powerbank' : null,
  ].filter(Boolean),
}))

const MOVEMENTS = [
  { type: 'out', icon: '📤', item: 'POS #P-042', courier: 'Ali Rıza K.', time: 'Bugün 09:15', color: 'border-blue-300 dark:border-blue-800' },
  { type: 'in', icon: '📥', item: 'Termal Çanta #C-31', courier: 'Can Ö.', time: 'Bugün 08:45', color: 'border-green-300 dark:border-green-800' },
  { type: 'out', icon: '📤', item: 'Motor 34EF56', courier: 'Yeni Kurye M.', time: 'Dün 17:30', color: 'border-blue-300 dark:border-blue-800' },
  { type: 'warn', icon: '⚠️', item: 'POS #P-019', courier: 'Arızalı - Servis', time: 'Dün 14:20', color: 'border-orange-300 dark:border-orange-800' },
  { type: 'out', icon: '📤', item: 'Yelek (L)', courier: 'Emre K.', time: 'Dün 12:00', color: 'border-blue-300 dark:border-blue-800' },
  { type: 'in', icon: '📥', item: 'Powerbank #PB-12', courier: 'Selin B.', time: 'Dün 09:30', color: 'border-green-300 dark:border-green-800' },
  { type: 'out', icon: '📤', item: 'Kask (M)', courier: 'Derya A.', time: '2 gün önce', color: 'border-blue-300 dark:border-blue-800' },
  { type: 'warn', icon: '⚠️', item: 'Termal Çanta #C-08', courier: 'Hasarlı - Değişim', time: '2 gün önce', color: 'border-orange-300 dark:border-orange-800' },
]

const EQ_TYPES = ['Tümü', 'POS', 'Çanta', 'Motor', 'Kask', 'Yelek', 'Powerbank']
const EQ_STATUSES = ['Tümü', 'Zimmetli', 'Depoda', 'Arızalı']
const CONDITIONS = ['Yeni', 'İyi', 'Orta', 'Kötü']
const SIZES = ['S', 'M', 'L', 'XL']

export default function EquipmentTracking() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('Tümü')
  const [statusFilter, setStatusFilter] = useState('Tümü')
  const [assignModal, setAssignModal] = useState(false)
  const [returnModal, setReturnModal] = useState(false)
  const [detailCourier, setDetailCourier] = useState(null)
  const [assignCourier, setAssignCourier] = useState('')
  const [assignItems, setAssignItems] = useState({
    pos: false, bag: false, motor: false, helmet: false, vest: false, raincoat: false, powerbank: false
  })
  const [printDoc, setPrintDoc] = useState(true)
  const [sendSms, setSendSms] = useState(true)

  const filtered = COURIERS.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const toggleAssign = (key) => setAssignItems(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Ekipman Zimmet Takip</h1>
        <div className="flex gap-3">
          <button onClick={() => setAssignModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"><Plus size={16} /> Zimmet Ver</button>
          <button onClick={() => setReturnModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><ArrowDownToLine size={16} /> Zimmet Al</button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><Download size={16} /> Export</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: Smartphone, label: 'POS Cihazı', value: '45/50', sub: 'zimmetli', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: ShoppingBag, label: 'Termal Çanta', value: '142/150', sub: 'zimmetli', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { icon: Bike, label: 'Motor', value: '28/30', sub: 'zimmetli', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { icon: Shirt, label: 'Ekipman Seti', value: '142', sub: 'zimmetli', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.bg}`}><c.icon size={16} className={c.color} /></div>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kurye ara..." className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            {EQ_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            {EQ_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {['Kurye', 'POS', 'Çanta', 'Motor', 'Diğer', 'İşlem'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{c.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{c.pos || <span className="text-slate-300 dark:text-slate-600">-</span>}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{c.bag || <span className="text-slate-300 dark:text-slate-600">-</span>}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{c.motor || <span className="text-slate-300 dark:text-slate-600">-</span>}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{c.others.length > 0 ? c.others.join(', ') : <span className="text-slate-300 dark:text-slate-600">-</span>}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetailCourier(c)} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">Detay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Movements */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Son Zimmet Hareketleri</h3>
        <div className="space-y-3">
          {MOVEMENTS.map((m, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${m.color} bg-slate-50 dark:bg-slate-800`}>
              <span className="text-lg">{m.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-slate-800 dark:text-white">
                  <span className="font-medium">{m.item}</span>
                  <span className="text-slate-400 mx-1">{m.type === 'out' ? '→' : m.type === 'in' ? '←' : '—'}</span>
                  <span className="text-slate-600 dark:text-slate-400">{m.courier}</span>
                </p>
              </div>
              <span className="text-xs text-slate-400">{m.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAssignModal(false)} />
          <div className="relative w-[520px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
              <h3 className="font-bold text-slate-800 dark:text-white">Ekipman Zimmet Ver</h3>
              <button onClick={() => setAssignModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X size={16} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Kurye</label>
                <select value={assignCourier} onChange={e => setAssignCourier(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <option value="">Kurye seçin...</option>
                  {NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-3">Ekipman Seç</label>
                <div className="space-y-3">
                  {[
                    { key: 'pos', label: 'POS Cihazı', icon: Smartphone, field: 'Seri No', placeholder: '#P-___' },
                    { key: 'bag', label: 'Termal Çanta', icon: ShoppingBag, field: 'Seri No', placeholder: '#C-___' },
                    { key: 'motor', label: 'Motorsiklet', icon: Bike, field: 'Plaka', placeholder: '34______' },
                    { key: 'helmet', label: 'Kask', icon: HardHat, field: 'Beden', isSize: true },
                    { key: 'vest', label: 'Yelek', icon: Shirt, field: 'Beden', isSize: true },
                    { key: 'raincoat', label: 'Yağmurluk', icon: CloudRain, field: 'Beden', isSize: true },
                    { key: 'powerbank', label: 'Powerbank', icon: BatteryCharging, field: 'Seri No', placeholder: '#PB-___' },
                  ].map(eq => (
                    <div key={eq.key} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${assignItems[eq.key] ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700'}`}>
                      <input type="checkbox" checked={assignItems[eq.key]} onChange={() => toggleAssign(eq.key)} className="accent-primary" />
                      <eq.icon size={16} className={assignItems[eq.key] ? 'text-primary' : 'text-slate-400'} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-28">{eq.label}</span>
                      {assignItems[eq.key] && (
                        <div className="flex items-center gap-2 flex-1">
                          {eq.isSize ? (
                            <select className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                              {SIZES.map(s => <option key={s}>{s}</option>)}
                            </select>
                          ) : (
                            <input placeholder={eq.placeholder} className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
                          )}
                          <select className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Not</label>
                <textarea rows={2} placeholder="Opsiyonel not..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={printDoc} onChange={e => setPrintDoc(e.target.checked)} className="accent-primary" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Zimmet tutanağı yazdır</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)} className="accent-primary" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">SMS ile bilgilendir</span>
                </label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button onClick={() => setAssignModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">İptal</button>
              <button onClick={() => setAssignModal(false)} className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><Check size={16} /> Zimmet Ver</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReturnModal(false)} />
          <div className="relative w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white">Ekipman Zimmet Al (İade)</h3>
              <button onClick={() => setReturnModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X size={16} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Kurye</label>
                <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <option value="">Kurye seçin...</option>
                  {NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 block">Teslim Alınan Ekipmanlar</label>
                {['POS #P-042', 'Termal Çanta #C-15', 'Yelek (L)'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primary" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                    </label>
                    <select className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Not</label>
                <textarea rows={2} placeholder="Durum notu..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button onClick={() => setReturnModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer">İptal</button>
              <button onClick={() => setReturnModal(false)} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><Check size={16} /> Teslim Al</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Slide-over */}
      {detailCourier && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailCourier(null)} />
          <div className="relative w-[420px] bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-bold text-slate-800 dark:text-white">{detailCourier.name}</h3>
              <button onClick={() => setDetailCourier(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X size={16} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Zimmetli Ekipmanlar</h4>
              {[
                detailCourier.pos && { label: 'POS Cihazı', value: detailCourier.pos, icon: Smartphone, date: '10 Şub 2026', cond: 'İyi' },
                detailCourier.bag && { label: 'Termal Çanta', value: detailCourier.bag, icon: ShoppingBag, date: '08 Şub 2026', cond: 'İyi' },
                detailCourier.motor && { label: 'Motorsiklet', value: detailCourier.motor, icon: Bike, date: '01 Şub 2026', cond: 'İyi' },
                ...detailCourier.others.map(o => ({ label: o, value: '-', icon: Shirt, date: '05 Şub 2026', cond: 'Yeni' })),
              ].filter(Boolean).map((eq, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <eq.icon size={16} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{eq.label}</p>
                      <p className="text-xs text-slate-500 font-mono">{eq.value}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{eq.date}</p>
                    <span className="text-[11px] px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">{eq.cond}</span>
                  </div>
                </div>
              ))}

              <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-6">Zimmet Geçmişi</h4>
              <div className="space-y-2">
                {[
                  { action: 'Zimmet verildi', items: 'POS, Çanta, Yelek', date: '10 Şub 2026', icon: ArrowUpFromLine, color: 'text-blue-500' },
                  { action: 'Kask değişimi', items: 'Eski → Yeni kask', date: '28 Oca 2026', icon: Wrench, color: 'text-orange-500' },
                  { action: 'İlk zimmet', items: 'Tam set', date: '15 Oca 2026', icon: Check, color: 'text-green-500' },
                ].map((h, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <h.icon size={14} className={`mt-0.5 ${h.color}`} />
                    <div>
                      <p className="text-sm text-slate-800 dark:text-white">{h.action}</p>
                      <p className="text-xs text-slate-500">{h.items}</p>
                      <p className="text-[11px] text-slate-400">{h.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
