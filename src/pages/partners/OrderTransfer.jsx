import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Package, Clock, AlertTriangle, CheckCircle, Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react'

// ---- Mock Data ----
const MOCK_ORDERS = [
  { id: 'BRN-4530', district: 'Kadikoy', amount: 285, type: 'Express', waitMinutes: 15 },
  { id: 'BRN-4531', district: 'Besiktas', amount: 192, type: 'Standart', waitMinutes: 8 },
  { id: 'BRN-4532', district: 'Uskudar', amount: 410, type: 'Express', waitMinutes: 22 },
  { id: 'BRN-4533', district: 'Sisli', amount: 167, type: 'Standart', waitMinutes: 5 },
  { id: 'BRN-4534', district: 'Atasehir', amount: 324, type: 'Express', waitMinutes: 18 },
  { id: 'BRN-4535', district: 'Maltepe', amount: 145, type: 'Standart', waitMinutes: 12 },
  { id: 'BRN-4536', district: 'Kadikoy', amount: 520, type: 'Express', waitMinutes: 25 },
  { id: 'BRN-4537', district: 'Bakirkoy', amount: 230, type: 'Standart', waitMinutes: 3 },
  { id: 'BRN-4538', district: 'Beyoglu', amount: 378, type: 'Express', waitMinutes: 30 },
  { id: 'BRN-4539', district: 'Sariyer', amount: 198, type: 'Standart', waitMinutes: 7 },
  { id: 'BRN-4540', district: 'Fatih', amount: 265, type: 'Express', waitMinutes: 14 },
  { id: 'BRN-4541', district: 'Kartal', amount: 155, type: 'Standart', waitMinutes: 9 },
  { id: 'BRN-4542', district: 'Pendik', amount: 440, type: 'Express', waitMinutes: 20 },
  { id: 'BRN-4543', district: 'Umraniye', amount: 310, type: 'Standart', waitMinutes: 6 },
  { id: 'BRN-4544', district: 'Kadikoy', amount: 175, type: 'Express', waitMinutes: 28 },
  { id: 'BRN-4545', district: 'Beykoz', amount: 290, type: 'Standart', waitMinutes: 4 },
  { id: 'BRN-4546', district: 'Eyupsultan', amount: 365, type: 'Express', waitMinutes: 16 },
  { id: 'BRN-4547', district: 'Gaziosmanpasa', amount: 128, type: 'Standart', waitMinutes: 11 },
  { id: 'BRN-4548', district: 'Sultangazi', amount: 480, type: 'Express', waitMinutes: 19 },
  { id: 'BRN-4549', district: 'Beylikduzu', amount: 210, type: 'Standart', waitMinutes: 2 },
  { id: 'BRN-4550', district: 'Cekmekoy', amount: 335, type: 'Express', waitMinutes: 27 },
  { id: 'BRN-4551', district: 'Tuzla', amount: 190, type: 'Standart', waitMinutes: 10 },
  { id: 'BRN-4552', district: 'Esenyurt', amount: 425, type: 'Express', waitMinutes: 23 },
]

const MOCK_PARTNERS = [
  { id: 'trendyol', name: 'TRENDYOL GO', status: 'available', statusLabel: 'Musait', statusColor: 'text-green-500', statusDot: 'bg-green-500', eta: 25, cost: 96 },
  { id: 'paket', name: 'PAKET TAXI', status: 'available', statusLabel: 'Musait', statusColor: 'text-green-500', statusDot: 'bg-green-500', eta: 35, cost: 114 },
  { id: 'getir', name: 'GETIR KURYE', status: 'busy', statusLabel: 'Yogun', statusColor: 'text-yellow-500', statusDot: 'bg-yellow-500', eta: 50, cost: 135 },
]

const BRINGO_AVG_COST = 148 // mock average Bringo cost per order

export default function OrderTransfer() {
  const navigate = useNavigate()

  const [selectedOrders, setSelectedOrders] = useState([])
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = [...MOCK_ORDERS]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(o =>
        o.id.toLowerCase().includes(s) ||
        o.district.toLowerCase().includes(s)
      )
    }
    if (typeFilter) {
      result = result.filter(o => o.type === typeFilter)
    }
    return result
  }, [search, typeFilter])

  const totalPages = Math.ceil(filteredOrders.length / perPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Toggle single order selection
  const toggleOrder = (id) => {
    setSelectedOrders(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      setSelectAll(next.length === filteredOrders.length)
      return next
    })
  }

  // Toggle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([])
      setSelectAll(false)
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id))
      setSelectAll(true)
    }
  }

  // Computed values
  const selectedCount = selectedOrders.length
  const selectedPartnerData = MOCK_PARTNERS.find(p => p.id === selectedPartner)
  const estimatedTotalCost = selectedPartnerData ? selectedCount * selectedPartnerData.cost : 0
  const estimatedSavings = selectedCount * BRINGO_AVG_COST - estimatedTotalCost

  // Handle transfer
  const handleTransfer = () => {
    if (selectedCount > 0 && selectedPartner) {
      setShowSuccessModal(true)
    }
  }

  // Close modal and reset
  const handleCloseModal = () => {
    setShowSuccessModal(false)
    setSelectedOrders([])
    setSelectedPartner(null)
    setSelectAll(false)
  }

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/partners')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Siparis Aktarim</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Bekleyen siparisleri harici partnerlere aktar
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Siparis no veya ilce ara..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">Tum Tipler</option>
            <option value="Express">Express</option>
            <option value="Standart">Standart</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
            <Filter size={14} /> Filtreler
          </button>
        </div>
      </div>

      {/* Pending Transfer Orders */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        {/* Table header info */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Package size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
              Aktarim Bekleyen Siparisler
            </h2>
            <span className="px-2.5 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
              {filteredOrders.length} siparis
            </span>
          </div>
          {selectedCount > 0 && (
            <span className="text-sm font-medium text-primary">
              Secili: {selectedCount} siparis
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="cursor-pointer accent-primary"
                    title="Tumunu Sec"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                  Siparis No
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                  Ilce
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                  Tutar
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                  Tip
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">
                  Bekleme
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => toggleOrder(order.id)}
                  className={`border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${
                    selectedOrders.includes(order.id) ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer accent-primary"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {order.district}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                    {order.amount.toLocaleString('tr-TR')} TL
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.type === 'Express'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {order.type === 'Express' && <AlertTriangle size={12} />}
                      {order.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className={`${
                        order.waitMinutes >= 20 ? 'text-red-500' : order.waitMinutes >= 10 ? 'text-yellow-500' : 'text-slate-400'
                      }`} />
                      <span className={`text-sm ${
                        order.waitMinutes >= 20 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {order.waitMinutes} dk
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filteredOrders.length)} / {filteredOrders.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded text-sm cursor-pointer ${
                  page === currentPage
                    ? 'bg-primary text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Partner Selection (shown when orders are selected) */}
      {selectedCount > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Send size={18} className="text-primary" />
            Partner Sec
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_PARTNERS.map(partner => {
              const isSelected = selectedPartner === partner.id
              return (
                <button
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner.id)}
                  className={`relative text-left p-5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={20} className="text-primary" />
                    </div>
                  )}

                  <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">
                    {partner.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${partner.statusDot}`} />
                    <span className={`text-sm font-medium ${partner.statusColor}`}>
                      {partner.statusLabel}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock size={14} /> ETA
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {partner.eta} dk
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Package size={14} /> Maliyet
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {partner.cost.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                  </div>

                  {/* Per-order cost hint */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Toplam: {(partner.cost * selectedCount).toLocaleString('tr-TR')} TL ({selectedCount} siparis)
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Transfer Summary Bar (fixed bottom) */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Selected order count */}
              <div className="flex items-center gap-2">
                <Package size={18} className="text-primary" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Secili Siparis</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedCount} siparis</p>
                </div>
              </div>

              <div className="w-px h-10 bg-slate-200 dark:bg-slate-600" />

              {/* Estimated total cost */}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tahmini Toplam Maliyet</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {selectedPartner
                    ? `${estimatedTotalCost.toLocaleString('tr-TR')} TL`
                    : 'Partner secin'}
                </p>
              </div>

              <div className="w-px h-10 bg-slate-200 dark:bg-slate-600" />

              {/* Estimated savings */}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tahmini Tasarruf (vs Bringo)</p>
                <p className={`text-sm font-bold ${
                  selectedPartner && estimatedSavings > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-800 dark:text-white'
                }`}>
                  {selectedPartner
                    ? `${estimatedSavings > 0 ? '+' : ''}${estimatedSavings.toLocaleString('tr-TR')} TL`
                    : '-'}
                </p>
              </div>
            </div>

            <button
              onClick={handleTransfer}
              disabled={!selectedPartner}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                selectedPartner
                  ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
              Secilenleri Aktar
            </button>
          </div>
        </div>
      )}

      {/* Transfer Success Modal */}
      {showSuccessModal && selectedPartnerData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center relative">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
            >
              <X size={18} className="text-slate-400" />
            </button>

            {/* Success icon */}
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Aktarim Basarili!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Siparisler basariyla aktarildi.
            </p>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3 mb-6 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Aktarilan Siparis</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedCount} siparis</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Partner</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedPartnerData.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tahmini Teslimat</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedPartnerData.eta} dakika</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Toplam Maliyet</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {estimatedTotalCost.toLocaleString('tr-TR')} TL
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                Kapat
              </button>
              <button
                onClick={() => { handleCloseModal(); navigate('/partners') }}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark cursor-pointer"
              >
                Partnerlere Don
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
