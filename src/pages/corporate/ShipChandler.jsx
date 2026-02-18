import { useState } from 'react'
import { Ship, Anchor, Package, Plus, FileText, Download, Trash2, ChevronDown, Calendar, Clock, Users, DollarSign, AlertTriangle, Check } from 'lucide-react'

const SHIPS = [
  { id: 's1', name: 'MV ATLANTIC STAR', imo: '9876543', owner: 'Mediterranean Shipping Co.', agent: 'Arkas Denizcilik', crew: 22, flag: 'Panama' },
  { id: 's2', name: 'MV BOSPHORUS QUEEN', imo: '9654321', owner: 'Turk Denizcilik A.S.', agent: 'Sealand Acentesi', crew: 18, flag: 'Turkey' },
  { id: 's3', name: 'MV AEGEAN SPIRIT', imo: '9543210', owner: 'Aegean Maritime Ltd.', agent: 'DB Schenker', crew: 25, flag: 'Marshall Islands' },
]

const PORTS = ['Istanbul - Ambarli', 'Istanbul - Haydarpasa', 'Izmir - Alsancak', 'Mersin', 'Trabzon', 'Samsun']

const TEMPLATES = ['15 Gunluk Sefer', '30 Gunluk Sefer', 'Liman Ikmali', 'Ozel']

const CATEGORIES = [
  { id: 'meat', label: 'Et Urunleri', icon: '🥩' },
  { id: 'vegetable', label: 'Sebze/Meyve', icon: '🥬' },
  { id: 'dairy', label: 'Sut Urunleri', icon: '🧀' },
  { id: 'dry', label: 'Kuru Gida', icon: '🌾' },
  { id: 'beverage', label: 'Icecek', icon: '🥤' },
  { id: 'bonded', label: 'Bonded', icon: '🍺' },
]

const INITIAL_ITEMS = {
  meat: [
    { id: 'm1', name: 'Dana kiyma', quantity: 50, unit: 'kg', price: 280, currency: 'TRY' },
    { id: 'm2', name: 'Tavuk but', quantity: 40, unit: 'kg', price: 150, currency: 'TRY' },
    { id: 'm3', name: 'Kuzu pirzola', quantity: 30, unit: 'kg', price: 450, currency: 'TRY' },
    { id: 'm4', name: 'Sucuk', quantity: 10, unit: 'kg', price: 220, currency: 'TRY' },
  ],
  vegetable: [
    { id: 'v1', name: 'Domates', quantity: 30, unit: 'kg', price: 35, currency: 'TRY' },
    { id: 'v2', name: 'Biber', quantity: 20, unit: 'kg', price: 40, currency: 'TRY' },
    { id: 'v3', name: 'Patates', quantity: 50, unit: 'kg', price: 25, currency: 'TRY' },
    { id: 'v4', name: 'Sogan', quantity: 25, unit: 'kg', price: 20, currency: 'TRY' },
    { id: 'v5', name: 'Elma', quantity: 20, unit: 'kg', price: 45, currency: 'TRY' },
    { id: 'v6', name: 'Portakal', quantity: 30, unit: 'kg', price: 30, currency: 'TRY' },
  ],
  dairy: [
    { id: 'd1', name: 'Sut (1L)', quantity: 50, unit: 'adet', price: 35, currency: 'TRY' },
    { id: 'd2', name: 'Beyaz peynir', quantity: 10, unit: 'kg', price: 180, currency: 'TRY' },
    { id: 'd3', name: 'Yogurt', quantity: 20, unit: 'kg', price: 60, currency: 'TRY' },
    { id: 'd4', name: 'Tereyagi', quantity: 5, unit: 'kg', price: 350, currency: 'TRY' },
  ],
  dry: [
    { id: 'dr1', name: 'Pirinc', quantity: 25, unit: 'kg', price: 55, currency: 'TRY' },
    { id: 'dr2', name: 'Makarna', quantity: 20, unit: 'kg', price: 30, currency: 'TRY' },
    { id: 'dr3', name: 'Un', quantity: 15, unit: 'kg', price: 25, currency: 'TRY' },
    { id: 'dr4', name: 'Seker', quantity: 10, unit: 'kg', price: 40, currency: 'TRY' },
    { id: 'dr5', name: 'Cay', quantity: 5, unit: 'kg', price: 200, currency: 'TRY' },
    { id: 'dr6', name: 'Kahve', quantity: 3, unit: 'kg', price: 500, currency: 'TRY' },
  ],
  beverage: [
    { id: 'b1', name: 'Su (0.5L)', quantity: 200, unit: 'adet', price: 5, currency: 'TRY' },
    { id: 'b2', name: 'Meyve suyu', quantity: 50, unit: 'adet', price: 15, currency: 'TRY' },
    { id: 'b3', name: 'Gazli icecek', quantity: 100, unit: 'adet', price: 20, currency: 'TRY' },
  ],
  bonded: [
    { id: 'bn1', name: 'Bira (kutu)', quantity: 10, unit: 'koli', price: 45, currency: 'USD' },
    { id: 'bn2', name: 'Sarap', quantity: 5, unit: 'sise', price: 25, currency: 'USD' },
    { id: 'bn3', name: 'Viski', quantity: 3, unit: 'sise', price: 80, currency: 'USD' },
    { id: 'bn4', name: 'Sigara', quantity: 20, unit: 'karton', price: 55, currency: 'USD' },
  ],
}

const ORDER_HISTORY = [
  { id: 'oh1', date: '2026-01-20', port: 'Istanbul - Ambarli', provision: 42500, bonded: 1850, status: 'delivered' },
  { id: 'oh2', date: '2025-12-05', port: 'Izmir - Alsancak', provision: 38000, bonded: 2200, status: 'delivered' },
  { id: 'oh3', date: '2025-10-15', port: 'Mersin', provision: 55000, bonded: 3100, status: 'delivered' },
]

export default function ShipChandler() {
  const [selectedShip, setSelectedShip] = useState(SHIPS[0])
  const [port, setPort] = useState(PORTS[0])
  const [eta, setEta] = useState('2026-02-15T14:00')
  const [etd, setEtd] = useState('2026-02-16T22:00')
  const [template, setTemplate] = useState(TEMPLATES[0])
  const [activeCategory, setActiveCategory] = useState('meat')
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [showConfirm, setShowConfirm] = useState(false)

  const updateQuantity = (categoryId, itemId, newQty) => {
    setItems(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, newQty) } : item
      )
    }))
  }

  const removeItem = (categoryId, itemId) => {
    setItems(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(item => item.id !== itemId)
    }))
  }

  const getCategoryTotal = (categoryId) => {
    return items[categoryId]?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0
  }

  const provisionTotal = Object.keys(items)
    .filter(k => k !== 'bonded')
    .reduce((sum, k) => sum + getCategoryTotal(k), 0)

  const bondedTotal = getCategoryTotal('bonded')

  const formatTRY = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)
  const formatUSD = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Ship size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gemi Tedarik Siparisi</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ship Chandler - Provision & Bonded</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
            <Download size={16} /> Teklif Olustur
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark cursor-pointer"
          >
            <Check size={16} /> Siparisi Onayla
          </button>
        </div>
      </div>

      {/* Ship Selection & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Ship Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gemi</label>
          <select
            value={selectedShip.id}
            onChange={(e) => setSelectedShip(SHIPS.find(s => s.id === e.target.value))}
            className="w-full mt-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200"
          >
            {SHIPS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">IMO No:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{selectedShip.imo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Armator:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 text-right text-xs">{selectedShip.owner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Murettebat:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{selectedShip.crew} kisi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Bayrak:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{selectedShip.flag}</span>
            </div>
          </div>
        </div>

        {/* Port & Schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Liman & Program</label>
          <select
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full mt-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200"
          >
            {PORTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Calendar size={12} /> ETA</label>
              <input
                type="datetime-local"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full mt-1 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock size={12} /> ETD</label>
              <input
                type="datetime-local"
                value={etd}
                onChange={(e) => setEtd(e.target.value)}
                className="w-full mt-1 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Siparis Ozeti</label>
          <div className="mt-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Provision:</span>
              <span className="text-lg font-bold text-slate-800 dark:text-white">{formatTRY(provisionTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Bonded:</span>
              <span className="text-lg font-bold text-green-600">{formatUSD(bondedTotal)}</span>
            </div>
            <hr className="border-slate-200 dark:border-slate-700" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-800 dark:text-white">Toplam Kalem:</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {Object.values(items).flat().length} urun
              </span>
            </div>
          </div>
          <div className="mt-3">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200"
            >
              {TEMPLATES.map(t => (
                <option key={t} value={t}>Sablon: {t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Provision Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
        {/* Category Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-1.5 py-0.5 rounded-full">
                {items[cat.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-5 py-3">Urun</th>
                <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-3 py-3 w-32">Miktar</th>
                <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-3 py-3 w-20">Birim</th>
                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-3 py-3 w-28">Birim Fiyat</th>
                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-5 py-3 w-32">Toplam</th>
                <th className="w-12 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {items[activeCategory]?.map(item => (
                <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateQuantity(activeCategory, item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm cursor-pointer"
                      >-</button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(activeCategory, item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-800 dark:text-slate-200"
                      />
                      <button
                        onClick={() => updateQuantity(activeCategory, item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm cursor-pointer"
                      >+</button>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-sm text-slate-500 dark:text-slate-400">{item.unit}</td>
                  <td className="px-3 py-3 text-right text-sm text-slate-600 dark:text-slate-400">
                    {item.currency === 'USD' ? formatUSD(item.price) : formatTRY(item.price)}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.currency === 'USD' ? formatUSD(item.quantity * item.price) : formatTRY(item.quantity * item.price)}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => removeItem(activeCategory, item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">
                  {CATEGORIES.find(c => c.id === activeCategory)?.label} Toplam:
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold text-slate-800 dark:text-white">
                  {activeCategory === 'bonded' ? formatUSD(getCategoryTotal(activeCategory)) : formatTRY(getCategoryTotal(activeCategory))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Add Item */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          <button className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium cursor-pointer">
            <Plus size={16} /> Urun Ekle
          </button>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Anchor size={18} className="text-slate-400" />
            Siparis Gecmisi - {selectedShip.name}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-5 py-3">Tarih</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-3 py-3">Liman</th>
                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-3 py-3">Provision</th>
                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-3 py-3">Bonded</th>
                <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-5 py-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {ORDER_HISTORY.map(oh => (
                <tr key={oh.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 text-sm text-slate-800 dark:text-slate-200">{oh.date}</td>
                  <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-400">{oh.port}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-slate-800 dark:text-slate-200">{formatTRY(oh.provision)}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-green-600">{formatUSD(oh.bonded)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                      Teslim Edildi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Ship size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Siparis Onayi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedShip.name}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Liman:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Provision:</span>
                <span className="font-bold text-slate-800 dark:text-white">{formatTRY(provisionTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Bonded:</span>
                <span className="font-bold text-green-600">{formatUSD(bondedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Toplam Kalem:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{Object.values(items).flat().length} urun</span>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Bonded urunler icin gumruk evraklari gereklidir. Kaptan onayi/imza teslimatta alinacaktir.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Iptal
              </button>
              <button
                onClick={() => { setShowConfirm(false); alert('Siparis onaylandi!') }}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark cursor-pointer"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
