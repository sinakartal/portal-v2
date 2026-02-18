import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Filter, Download, RefreshCw, Eye, Edit2, Phone,
  ChevronLeft, ChevronRight, Truck, Star, MapPin, Activity
} from 'lucide-react'
import { generateCouriers } from '@/services/mockData'
import { COURIER_STATUSES } from '@/constants/menu'
import { formatNumber, formatDate } from '@/utils'

export default function CourierList() {
  const [couriers, setCouriers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 20
  const navigate = useNavigate()

  useEffect(() => {
    const data = generateCouriers(15)
    setCouriers(data)
    setFiltered(data)
  }, [])

  useEffect(() => {
    let result = [...couriers]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        c.region.toLowerCase().includes(s) ||
        c.vehicle.plate.toLowerCase().includes(s)
      )
    }
    if (statusFilter) {
      result = result.filter(c => c.status === statusFilter)
    }
    setFiltered(result)
    setCurrentPage(1)
  }, [search, statusFilter, couriers])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginatedCouriers = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const statusCounts = couriers.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kuryeler</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} kurye listeleniyor</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors cursor-pointer">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Plus size={16} /> Yeni Kurye
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        {Object.entries(COURIER_STATUSES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
            className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${statusFilter === key ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />
              <span className="text-xs font-medium text-slate-600">{val.label}</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{statusCounts[key] || 0}</span>
          </button>
        ))}
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
              placeholder="Kurye adi, telefon, bolge, plaka ara..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">Tum Durumlar</option>
            {Object.entries(COURIER_STATUSES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <button onClick={() => { setSearch(''); setStatusFilter('') }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
            <RefreshCw size={14} /> Sifirla
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Telefon</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Arac</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Bolge</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Performans</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Toplam Teslimat</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Puan</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCouriers.map(courier => {
                const status = COURIER_STATUSES[courier.status] || { label: courier.status, color: '#6b7280', bg: '#f3f4f6' }
                const scoreColor = courier.performanceScore >= 90 ? 'text-green-600 bg-green-50' :
                  courier.performanceScore >= 75 ? 'text-blue-600 bg-blue-50' :
                    courier.performanceScore >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'

                return (
                  <tr key={courier._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Truck size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 cursor-pointer hover:text-primary" onClick={() => navigate(`/couriers/${courier._id}`)}>{courier.name}</p>
                          <p className="text-xs text-slate-400">{courier.vehicle.plate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{courier.phone}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{courier.vehicle.type}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin size={12} className="text-slate-400" />
                        {courier.region}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${scoreColor}`}>
                        {courier.performanceScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-slate-700">
                      {formatNumber(courier.totalDeliveries)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={12} className="text-amber-400" fill="currentColor" />
                        <span className="font-medium text-slate-700">{courier.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => navigate(`/couriers/${courier._id}`)} className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay">
                          <Eye size={14} className="text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Duzenle">
                          <Edit2 size={14} className="text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Ara">
                          <Phone size={14} className="text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
        )}
      </div>
    </div>
  )
}
