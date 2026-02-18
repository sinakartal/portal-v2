import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Download, RefreshCw, Eye, Edit2, UserPlus, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { generateOrders } from '@/services/mockData'
import { ORDER_STATUSES } from '@/constants/menu'
import { formatCurrency, formatDate } from '@/utils'

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState([])
  const perPage = 25
  const navigate = useNavigate()

  useEffect(() => {
    const data = generateOrders(200)
    setOrders(data)
    setFiltered(data)
  }, [])

  useEffect(() => {
    let result = [...orders]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(s) ||
        o.customer.name.toLowerCase().includes(s) ||
        o.customer.phone.includes(s) ||
        o.customer.address.toLowerCase().includes(s)
      )
    }
    if (statusFilter) {
      result = result.filter(o => o.status === statusFilter)
    }
    setFiltered(result)
    setCurrentPage(1)
  }, [search, statusFilter, orders])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginatedOrders = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const toggleSelect = (id) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map(o => o._id))
    }
  }

  const priorityBadge = (priority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-600',
      normal: 'bg-blue-50 text-blue-600',
      high: 'bg-orange-50 text-orange-600',
      urgent: 'bg-red-50 text-red-600',
    }
    const labels = { low: 'Dusuk', normal: 'Normal', high: 'Yuksek', urgent: 'Acil' }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>{labels[priority]}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Siparisler</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} siparis listeleniyor</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors cursor-pointer">
            <Download size={16} /> Export
          </button>
          <button onClick={() => navigate('/orders/new')} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Plus size={16} /> Yeni Siparis
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Siparis no, musteri, telefon ara..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">Tum Durumlar</option>
            {Object.entries(ORDER_STATUSES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
            <Filter size={14} /> Filtreler
          </button>
          <button onClick={() => { setSearch(''); setStatusFilter('') }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
            <RefreshCw size={14} /> Sifirla
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-primary font-medium">{selectedOrders.length} siparis secildi</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium cursor-pointer">Rotaya Ekle</button>
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium cursor-pointer">Kurye Ata</button>
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium cursor-pointer">Durum Guncelle</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0} onChange={toggleSelectAll} className="cursor-pointer" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Siparis No</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Musteri</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Adres</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tutar</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Oncelik</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tarih</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => {
                const status = ORDER_STATUSES[order.status] || { label: order.status, color: '#6b7280', bg: '#f3f4f6' }
                return (
                  <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedOrders.includes(order._id)} onChange={() => toggleSelect(order._id)} className="cursor-pointer" />
                    </td>
                    <td className="px-4 py-3 font-medium text-primary cursor-pointer" onClick={() => navigate(`/orders/${order._id}`)}>{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-700">{order.customer.name}</p>
                        <p className="text-xs text-slate-400">{order.customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{order.customer.address}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.courier || '-'}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-4 py-3">{priorityBadge(order.priority)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => navigate(`/orders/${order._id}`)} className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay"><Eye size={14} className="text-slate-500" /></button>
                        <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Duzenle"><Edit2 size={14} className="text-slate-500" /></button>
                        <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Kurye Ata"><UserPlus size={14} className="text-slate-500" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} / {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i
              if (page > totalPages) return null
              return (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded text-sm cursor-pointer ${page === currentPage ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
                  {page}
                </button>
              )
            })}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
