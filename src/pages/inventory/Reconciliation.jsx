import { useState, useMemo } from 'react'
import {
  CheckCircle, Clock, AlertTriangle, Download, Printer, FileText,
  X, Banknote, CreditCard, Building2, Users, Package, TrendingUp,
  Lock
} from 'lucide-react'

const fmt = (n) => '₺' + Math.abs(n).toLocaleString('tr-TR')

const PROJECTS = ['Tümü', 'File Market', 'Istanbul Ana Dağıtım', 'Express Teslimat', 'Gıda Dağıtım']

function seed(i) { return ((i * 7901 + 31297) % 133280) / 133280 }

const COURIERS = Array.from({ length: 45 }, (_, i) => {
  const names = ['Ali Rıza K.', 'Mehmet Y.', 'Veli A.', 'Ayşe D.', 'Can Ö.', 'Fatma S.', 'Emre K.', 'Zeynep T.', 'Hasan M.', 'Burak Ç.', 'Derya A.', 'Oğuz K.', 'Selin B.', 'Kemal U.', 'Nurgül Ş.', 'Tuncay Y.', 'Emine G.', 'İbrahim T.', 'Pınar E.', 'Murat K.', 'Gökhan A.', 'Sibel D.', 'Cem A.', 'Deniz P.', 'Serkan B.', 'Özge M.', 'Tolga İ.', 'Aslı Y.', 'Onur S.', 'Elif K.', 'Bora T.', 'Merve A.', 'Kaan D.', 'Esra G.', 'Yusuf Ö.', 'Gamze H.', 'Barış N.', 'Duygu C.', 'Cenk V.', 'Hande L.', 'Alp R.', 'Seda F.', 'Arda M.', 'Tuğba K.', 'Volkan E.']
  const name = names[i]
  const orders = 6 + Math.floor(seed(i) * 12)
  const delivered = orders - Math.floor(seed(i + 100) * 2)
  const cash = Math.floor(seed(i + 200) * 8000) + 500
  const s = seed(i + 300)
  let submitted = cash, status = 'completed', diff = 0, diffNote = ''
  if (i >= 38 && i < 40) { submitted = cash; diff = -(50 + Math.floor(seed(i + 400) * 150)); status = 'issue'; diffNote = i === 38 ? `-${fmt(-diff)}` : `${delivered - 1} eksik` }
  else if (i >= 40) { submitted = 0; status = 'pending' }
  const waitMinutes = status === 'pending' ? 45 + Math.floor(seed(i + 500) * 200) : 0
  return { id: i + 1, name, orders, delivered, cash, submitted: status === 'pending' ? 0 : submitted, status, diff, diffNote, waitMinutes }
})

export default function Reconciliation() {
  const [project, setProject] = useState('Tümü')
  const [tab, setTab] = useState('all')
  const [submitModal, setSubmitModal] = useState(null)
  const [submitAmount, setSubmitAmount] = useState('')
  const [closeModal, setCloseModal] = useState(false)
  const [carryOver, setCarryOver] = useState(true)

  const completed = COURIERS.filter(c => c.status === 'completed')
  const pending = COURIERS.filter(c => c.status === 'pending')
  const issues = COURIERS.filter(c => c.status === 'issue')

  const shown = tab === 'completed' ? completed : tab === 'pending' ? pending : tab === 'issue' ? issues : COURIERS

  const totalCash = COURIERS.reduce((s, c) => s + c.cash, 0)
  const totalSubmitted = COURIERS.filter(c => c.status === 'completed').reduce((s, c) => s + c.submitted, 0)
  const totalPending = pending.reduce((s, c) => s + c.cash, 0)
  const totalDiff = issues.reduce((s, c) => s + c.diff, 0)

  const cardTahsilat = Math.floor(totalCash * 0.54)
  const havale = Math.floor(totalCash * 0.09)
  const nakitTahsilat = totalCash - cardTahsilat - havale

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Gün Sonu Mutabakat</h1>
        <div className="flex items-center gap-3">
          <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300" />
          <select value={project} onChange={e => setProject(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            {PROJECTS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Row 1 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { icon: Users, label: 'Çalışan Kurye', value: '45', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Package, label: 'Toplam Sipariş', value: '847', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { icon: TrendingUp, label: 'Teslim Edilen', value: '812 (%96)', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Banknote, label: 'Tahsilat', value: fmt(totalCash), color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</span>
              <div className={`p-1.5 rounded-lg ${c.bg}`}><c.icon size={14} className={c.color} /></div>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Summary Row 2 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: Banknote, label: 'Nakit Tahsilat', value: fmt(nakitTahsilat), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: CreditCard, label: 'Kart Tahsilat', value: fmt(cardTahsilat), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Building2, label: 'Havale Tahsilat', value: fmt(havale), color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { icon: Clock, label: 'Bekleyen Nakit', value: fmt(totalPending), color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</span>
              <div className={`p-1.5 rounded-lg ${c.bg}`}><c.icon size={14} className={c.color} /></div>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: `Tümü (${COURIERS.length})`, icon: null },
          { key: 'completed', label: `Tamamlandı (${completed.length})`, icon: '✅' },
          { key: 'pending', label: `Bekliyor (${pending.length})`, icon: '⏳' },
          { key: 'issue', label: `Sorunlu (${issues.length})`, icon: '⚠️' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${tab === t.key ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {t.icon && <span className="mr-1">{t.icon}</span>}{t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {['Kurye', 'Sipariş', 'Teslim', 'Nakit', 'Teslim Ed.', 'Durum'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, 20).map(c => (
              <tr key={c.id} className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${c.status === 'issue' ? 'bg-red-50/30 dark:bg-red-900/5' : c.status === 'pending' ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${c.status === 'completed' ? '✅' : c.status === 'pending' ? '⏳' : '⚠️'}`}>
                      {c.status === 'completed' ? '✅' : c.status === 'pending' ? '⏳' : '⚠️'}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-white">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{c.orders}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{c.delivered}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{fmt(c.cash)}</td>
                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{c.submitted > 0 ? fmt(c.submitted) : '-'}</td>
                <td className="px-4 py-3">
                  {c.status === 'completed' && <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-[11px] font-medium">Tamam</span>}
                  {c.status === 'pending' && <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-[11px] font-medium">Bekliyor</span>}
                  {c.status === 'issue' && <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-[11px] font-medium">{c.diffNote}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Özet</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm"><span className="text-slate-500">✅ Teslim edilmesi gereken nakit:</span><span className="font-semibold text-slate-800 dark:text-white">{fmt(nakitTahsilat)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">✅ Teslim edilen nakit:</span><span className="font-semibold text-green-600">{fmt(totalSubmitted)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">⏳ Bekleyen nakit:</span><span className="font-semibold text-orange-600">{fmt(totalPending)}</span></div>
          <div className="flex justify-between text-sm border-t border-slate-100 dark:border-slate-800 pt-2"><span className="text-slate-500">❌ Fark:</span><span className={`font-bold ${totalDiff === 0 ? 'text-green-600' : 'text-red-600'}`}>{totalDiff === 0 ? '₺0' : `-${fmt(totalDiff)}`}</span></div>
        </div>
      </div>

      {/* Pending cash submissions */}
      {pending.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-orange-200 dark:border-orange-800 p-5 mb-6">
          <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-4 flex items-center gap-2"><Clock size={16} /> Nakit Teslimi Bekleyenler</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['Kurye', 'Nakit', 'Bekleme Süresi', 'İşlem'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map(c => (
                <tr key={c.id} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-white">{c.name}</td>
                  <td className="px-3 py-2.5 font-semibold text-orange-600">{fmt(c.cash)}</td>
                  <td className="px-3 py-2.5 text-slate-500">{c.waitMinutes >= 60 ? `${Math.floor(c.waitMinutes / 60)} saat ${c.waitMinutes % 60} dk` : `${c.waitMinutes} dk`}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => { setSubmitModal(c); setSubmitAmount(c.cash.toString()) }} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors">Teslim Al</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><FileText size={16} /> Detaylı Rapor</button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><Download size={16} /> Excel İndir</button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><Printer size={16} /> Yazdır</button>
        </div>
        <button onClick={() => setCloseModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"><Lock size={16} /> Günü Kapat</button>
      </div>

      {/* Teslim Al Modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSubmitModal(null)} />
          <div className="relative w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Banknote size={18} className="text-emerald-600" /> Nakit Teslim Al</h3>
              <button onClick={() => setSubmitModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><X size={16} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Kurye:</span><span className="font-semibold text-slate-800 dark:text-white">{submitModal.name}</span></div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500">Sistemde kayıtlı nakit</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{fmt(submitModal.cash)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Teslim Edilen Tutar</label>
                <input value={submitAmount} onChange={e => setSubmitAmount(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Fark:</span>
                  {(() => {
                    const d = (parseInt(submitAmount) || 0) - submitModal.cash
                    return <span className={`font-bold ${d === 0 ? 'text-green-600' : 'text-red-600'}`}>{d === 0 ? '✅ Mutabık' : fmt(d)}</span>
                  })()}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button onClick={() => setSubmitModal(null)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">İptal</button>
              <button onClick={() => setSubmitModal(null)} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><CheckCircle size={16} /> Teslim Alındı</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Day Modal */}
      {closeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCloseModal(false)} />
          <div className="relative w-[460px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Lock size={18} className="text-primary" /> Günü Kapat</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Toplam sipariş:</span><span className="font-medium text-slate-800 dark:text-white">847</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Teslim edilen:</span><span className="font-medium text-green-600">812 (%96)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Toplam tahsilat:</span><span className="font-medium text-slate-800 dark:text-white">{fmt(totalCash)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Teslim edilen nakit:</span><span className="font-medium text-green-600">{fmt(totalSubmitted)}</span></div>
              </div>

              {pending.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-yellow-700 dark:text-yellow-400">
                    <strong>{pending.length} kurye</strong> henüz nakit teslim etmedi ({fmt(totalPending)} bekliyor).
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={carryOver} onChange={e => setCarryOver(e.target.checked)} className="accent-primary" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Bekleyen nakitleri ertesi güne devret</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button onClick={() => setCloseModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">İptal</button>
              <button onClick={() => setCloseModal(false)} className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"><Lock size={16} /> Günü Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
