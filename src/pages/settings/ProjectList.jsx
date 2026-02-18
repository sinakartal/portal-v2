import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, RefreshCw, Edit2, Eye, Building2, Package, TrendingUp,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, BarChart3, Target,
  DollarSign
} from 'lucide-react'
import { generateProjects } from '@/services/mockData'
import { formatCurrency, formatNumber, formatDate } from '@/utils'

export default function ProjectList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 20

  useEffect(() => {
    const data = generateProjects()
    setProjects(data)
    setFiltered(data)
  }, [])

  useEffect(() => {
    let result = [...projects]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.code.toLowerCase().includes(s) ||
        p.client.toLowerCase().includes(s)
      )
    }
    if (statusFilter === 'active') {
      result = result.filter(p => p.isActive)
    } else if (statusFilter === 'inactive') {
      result = result.filter(p => !p.isActive)
    }
    setFiltered(result)
    setCurrentPage(1)
  }, [search, statusFilter, projects])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginatedProjects = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const activeCount = projects.filter(p => p.isActive).length
  const totalOrders = projects.reduce((s, p) => s + p.orderCount, 0)
  const totalRevenue = projects.reduce((s, p) => s + p.revenue, 0)
  const avgSla = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.slaCompliance, 0) / projects.length) : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projeler</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} proje listeleniyor</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Plus size={16} /> Yeni Proje
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-blue-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{activeCount}</p>
          <p className="text-xs text-slate-500 mt-1">Aktif Proje</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-green-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatNumber(totalOrders)}</p>
          <p className="text-xs text-slate-500 mt-1">Toplam Siparis</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <DollarSign size={16} className="text-indigo-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-slate-500 mt-1">Toplam Gelir</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Target size={16} className="text-amber-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">%{avgSla}</p>
          <p className="text-xs text-slate-500 mt-1">Ort. SLA Uyumu</p>
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
              placeholder="Proje adi, kod, musteri ara..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tum Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">Proje</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Kod</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Musteri</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Siparis</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Gelir</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">SLA Uyumu</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Olusturulma</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.map(project => {
                const slaColor = project.slaCompliance >= 95 ? 'text-green-600 bg-green-50' :
                  project.slaCompliance >= 90 ? 'text-blue-600 bg-blue-50' :
                    project.slaCompliance >= 85 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'

                return (
                  <tr key={project._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={16} className="text-primary" />
                        </div>
                        <span className="font-medium text-slate-800">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono">{project.code}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{project.client}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-700">{formatNumber(project.orderCount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{formatCurrency(project.revenue)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${project.slaCompliance >= 95 ? 'bg-green-500' : project.slaCompliance >= 90 ? 'bg-blue-500' : project.slaCompliance >= 85 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${project.slaCompliance}%` }}
                          />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${slaColor}`}>
                          %{project.slaCompliance}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {project.isActive ? (
                        <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium inline-flex items-center gap-1">
                          <CheckCircle size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium inline-flex items-center gap-1">
                          <XCircle size={12} /> Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(project.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay">
                          <Eye size={14} className="text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Duzenle">
                          <Edit2 size={14} className="text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Analitik">
                          <BarChart3 size={14} className="text-slate-500" />
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
