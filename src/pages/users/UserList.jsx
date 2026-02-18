import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, RefreshCw, Edit2, Trash2, Eye, Users, Shield,
  Mail, Phone, Clock, X, Save, ChevronLeft, ChevronRight, UserPlus
} from 'lucide-react'
import { ROLES } from '@/constants/menu'
import { formatDate, formatDateTime } from '@/utils'

export default function UserList() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 20

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'operator',
    status: 'active',
  })
  const [modalErrors, setModalErrors] = useState({})

  useEffect(() => {
    const mockUsers = [
      { _id: 'u1', name: 'Sina Kartal', email: 'sina@heybringo.com', phone: '0532 100 0001', role: 'super_admin', status: 'active', lastLogin: new Date(Date.now() - 300000).toISOString(), createdAt: '2025-01-15T10:00:00Z' },
      { _id: 'u2', name: 'Elif Kaya', email: 'elif@heybringo.com', phone: '0532 100 0002', role: 'admin', status: 'active', lastLogin: new Date(Date.now() - 3600000).toISOString(), createdAt: '2025-02-20T10:00:00Z' },
      { _id: 'u3', name: 'Mehmet Demir', email: 'mehmet@heybringo.com', phone: '0532 100 0003', role: 'manager', status: 'active', lastLogin: new Date(Date.now() - 7200000).toISOString(), createdAt: '2025-03-10T10:00:00Z' },
      { _id: 'u4', name: 'Ayse Yilmaz', email: 'ayse@heybringo.com', phone: '0532 100 0004', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 14400000).toISOString(), createdAt: '2025-04-05T10:00:00Z' },
      { _id: 'u5', name: 'Hasan Celik', email: 'hasan@heybringo.com', phone: '0532 100 0005', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 28800000).toISOString(), createdAt: '2025-05-12T10:00:00Z' },
      { _id: 'u6', name: 'Fatma Ozturk', email: 'fatma@heybringo.com', phone: '0532 100 0006', role: 'manager', status: 'suspended', lastLogin: new Date(Date.now() - 604800000).toISOString(), createdAt: '2025-05-20T10:00:00Z' },
      { _id: 'u7', name: 'Ali Sahin', email: 'ali@heybringo.com', phone: '0532 100 0007', role: 'viewer', status: 'active', lastLogin: new Date(Date.now() - 86400000).toISOString(), createdAt: '2025-06-01T10:00:00Z' },
      { _id: 'u8', name: 'Zeynep Arslan', email: 'zeynep@heybringo.com', phone: '0532 100 0008', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 172800000).toISOString(), createdAt: '2025-07-15T10:00:00Z' },
      { _id: 'u9', name: 'Mustafa Dogan', email: 'mustafa@heybringo.com', phone: '0532 100 0009', role: 'viewer', status: 'inactive', lastLogin: new Date(Date.now() - 2592000000).toISOString(), createdAt: '2025-08-10T10:00:00Z' },
      { _id: 'u10', name: 'Emine Koc', email: 'emine@heybringo.com', phone: '0532 100 0010', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 43200000).toISOString(), createdAt: '2025-09-01T10:00:00Z' },
      { _id: 'u11', name: 'Huseyin Aydin', email: 'huseyin@heybringo.com', phone: '0532 100 0011', role: 'admin', status: 'active', lastLogin: new Date(Date.now() - 7200000).toISOString(), createdAt: '2025-10-15T10:00:00Z' },
      { _id: 'u12', name: 'Merve Polat', email: 'merve@heybringo.com', phone: '0532 100 0012', role: 'operator', status: 'active', lastLogin: new Date(Date.now() - 21600000).toISOString(), createdAt: '2025-11-20T10:00:00Z' },
    ]
    setUsers(mockUsers)
    setFiltered(mockUsers)
  }, [])

  useEffect(() => {
    let result = [...users]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(u =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.phone.includes(s)
      )
    }
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter)
    }
    if (statusFilter) {
      result = result.filter(u => u.status === statusFilter)
    }
    setFiltered(result)
    setCurrentPage(1)
  }, [search, roleFilter, statusFilter, users])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginatedUsers = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const statusConfig = {
    active: { label: 'Aktif', color: '#10b981', bg: '#d1fae5' },
    suspended: { label: 'Askida', color: '#f59e0b', bg: '#fef3c7' },
    inactive: { label: 'Pasif', color: '#6b7280', bg: '#f3f4f6' },
  }

  const roleColors = {
    super_admin: 'bg-red-50 text-red-600',
    admin: 'bg-purple-50 text-purple-600',
    manager: 'bg-blue-50 text-blue-600',
    operator: 'bg-green-50 text-green-600',
    viewer: 'bg-slate-100 text-slate-600',
  }

  const validateModal = () => {
    const e = {}
    if (!newUser.name.trim()) e.name = 'Ad soyad zorunlu'
    if (!newUser.email.trim()) e.email = 'E-posta zorunlu'
    if (!newUser.phone.trim()) e.phone = 'Telefon zorunlu'
    setModalErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAddUser = () => {
    if (!validateModal()) return
    const user = {
      _id: `u${Date.now()}`,
      ...newUser,
      lastLogin: null,
      createdAt: new Date().toISOString(),
    }
    setUsers(prev => [user, ...prev])
    setShowModal(false)
    setNewUser({ name: '', email: '', phone: '', role: 'operator', status: 'active' })
    setModalErrors({})
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kullanicilar</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} kullanici listeleniyor</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <UserPlus size={16} /> Kullanici Ekle
          </button>
        </div>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {Object.entries(ROLES).map(([key, label]) => {
          const count = users.filter(u => u.role === key).length
          return (
            <button
              key={key}
              onClick={() => setRoleFilter(roleFilter === key ? '' : key)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${roleFilter === key ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600">{label}</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{count}</span>
            </button>
          )
        })}
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
              placeholder="Ad, e-posta, telefon ara..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tum Roller</option>
            {Object.entries(ROLES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tum Durumlar</option>
            {Object.entries(statusConfig).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <button onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter('') }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">Kullanici</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">E-posta</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Telefon</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Rol</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Son Giris</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Kayit Tarihi</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => {
                const us = statusConfig[user.status] || statusConfig.active
                return (
                  <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{user.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">{user.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        {ROLES[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: us.bg, color: us.color }}>
                        {us.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {user.lastLogin ? formatDateTime(user.lastLogin) : 'Hic giris yapmadi'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Duzenle">
                          <Edit2 size={14} className="text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded cursor-pointer" title="Sil">
                          <Trash2 size={14} className="text-red-400" />
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

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <UserPlus size={18} className="text-slate-500" /> Yeni Kullanici Ekle
              </h3>
              <button onClick={() => { setShowModal(false); setModalErrors({}) }} className="p-1.5 hover:bg-slate-100 rounded cursor-pointer">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad Soyad *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Kullanici adi..."
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${modalErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                />
                {modalErrors.name && <p className="text-xs text-red-500 mt-1">{modalErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="eposta@ornek.com"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${modalErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                </div>
                {modalErrors.email && <p className="text-xs text-red-500 mt-1">{modalErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon *</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="05XX XXX XXXX"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${modalErrors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                </div>
                {modalErrors.phone && <p className="text-xs text-red-500 mt-1">{modalErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {Object.entries(ROLES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Durum</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <button onClick={() => { setShowModal(false); setModalErrors({}) }} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 cursor-pointer">
                Iptal
              </button>
              <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                <Save size={16} /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
