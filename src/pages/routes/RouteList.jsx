import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, RefreshCw, Eye, MapPin, Truck, Clock, Package,
  Play, Pause, CheckCircle, Navigation, ChevronRight, Map, Route,
  AlertTriangle
} from 'lucide-react'
import { formatNumber, formatDateTime } from '@/utils'

const routeStatuses = {
  active: { label: 'Aktif', color: '#10b981', bg: '#d1fae5' },
  paused: { label: 'Durduruldu', color: '#f59e0b', bg: '#fef3c7' },
  completed: { label: 'Tamamlandi', color: '#6366f1', bg: '#e0e7ff' },
  cancelled: { label: 'Iptal', color: '#ef4444', bg: '#fee2e2' },
}

export default function RouteList() {
  const navigate = useNavigate()
  const [routes, setRoutes] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)

  useEffect(() => {
    const courierNames = [
      'Serkan Acar', 'Murat Yildirim', 'Hakan Tekin', 'Kemal Bas',
      'Selim Dursun', 'Taner Gul', 'Volkan Aslan', 'Cem Ozkan',
      'Baris Ay', 'Erkan Sahin', 'Firat Kocer', 'Deniz Uysal'
    ]
    const regions = ['Kadikoy', 'Besiktas', 'Sisli', 'Uskudar', 'Bakirkoy', 'Fatih', 'Atasehir', 'Maltepe']
    const statuses = ['active', 'active', 'active', 'active', 'active', 'paused', 'completed', 'completed']

    const mockRoutes = Array.from({ length: 12 }, (_, i) => {
      const totalStops = Math.floor(Math.random() * 8) + 5
      const completedStops = Math.floor(Math.random() * totalStops)
      const status = statuses[i % statuses.length]
      return {
        _id: `route-${i}`,
        routeNumber: `RT-${String(2000 + i).padStart(4, '0')}`,
        courier: courierNames[i % courierNames.length],
        region: regions[i % regions.length],
        orderCount: totalStops,
        completedStops,
        progress: status === 'completed' ? 100 : Math.round((completedStops / totalStops) * 100),
        status,
        totalDistance: (Math.random() * 30 + 5).toFixed(1),
        estimatedTime: Math.floor(Math.random() * 120) + 30,
        eta: new Date(Date.now() + (Math.random() * 7200000)).toISOString(),
        startedAt: new Date(Date.now() - Math.random() * 14400000).toISOString(),
        stops: Array.from({ length: totalStops }, (_, j) => ({
          id: `stop-${i}-${j}`,
          orderNumber: `BRN-${String(1100 + i * 10 + j).padStart(6, '0')}`,
          customer: ['Ahmet Y.', 'Mehmet K.', 'Fatma D.', 'Ayse C.', 'Ali S.'][j % 5],
          address: `${regions[(i + j) % regions.length]} - No:${Math.floor(Math.random() * 200)}`,
          status: j < completedStops ? 'delivered' : j === completedStops ? 'in_transit' : 'pending',
          eta: new Date(Date.now() + j * 1200000).toISOString(),
        })),
      }
    })
    setRoutes(mockRoutes)
    setSelectedRoute(mockRoutes[0])
  }, [])

  const filtered = routes.filter(r => {
    const matchSearch = !search ||
      r.routeNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.courier.toLowerCase().includes(search.toLowerCase()) ||
      r.region.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeCount = routes.filter(r => r.status === 'active').length
  const totalOrders = routes.reduce((sum, r) => sum + r.orderCount, 0)
  const avgProgress = routes.length > 0 ? Math.round(routes.reduce((sum, r) => sum + r.progress, 0) / routes.length) : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rotalar</h1>
          <p className="text-sm text-slate-500 mt-1">{activeCount} aktif rota, {totalOrders} toplam siparis</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Plus size={16} /> Yeni Rota
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Route size={16} className="text-green-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{activeCount}</p>
          <p className="text-xs text-slate-500 mt-1">Aktif Rota</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-blue-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{totalOrders}</p>
          <p className="text-xs text-slate-500 mt-1">Toplam Siparis</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Truck size={16} className="text-indigo-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{routes.filter(r => r.status !== 'cancelled').length}</p>
          <p className="text-xs text-slate-500 mt-1">Toplam Kurye</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-amber-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">%{avgProgress}</p>
          <p className="text-xs text-slate-500 mt-1">Ort. Ilerleme</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route List */}
        <div className="lg:col-span-2">
          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rota no, kurye, bolge ara..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Tum Durumlar</option>
                {Object.entries(routeStatuses).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <button onClick={() => { setSearch(''); setStatusFilter('') }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 cursor-pointer">
                <RefreshCw size={14} /> Sifirla
              </button>
            </div>
          </div>

          {/* Route Table */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Rota</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Kurye</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Siparis</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Ilerleme</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ETA</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(route => {
                    const rs = routeStatuses[route.status] || routeStatuses.active
                    const progressColor = route.progress >= 80 ? 'bg-green-500' : route.progress >= 50 ? 'bg-blue-500' : route.progress >= 25 ? 'bg-amber-500' : 'bg-slate-300'
                    return (
                      <tr
                        key={route._id}
                        className={`border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer ${selectedRoute?._id === route._id ? 'bg-primary/5' : ''}`}
                        onClick={() => setSelectedRoute(route)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800">{route.routeNumber}</p>
                            <p className="text-xs text-slate-400">{route.region}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Truck size={12} className="text-primary" />
                            </div>
                            <span className="text-slate-700">{route.courier}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-slate-700">{route.completedStops}/{route.orderCount}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${progressColor}`} style={{ width: `${route.progress}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-600 w-8">%{route.progress}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: rs.bg, color: rs.color }}>
                            {rs.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {route.status === 'completed' ? 'Bitti' : formatDateTime(route.eta)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Detay" onClick={(e) => { e.stopPropagation(); setSelectedRoute(route) }}>
                              <Eye size={14} className="text-slate-500" />
                            </button>
                            {route.status === 'active' ? (
                              <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Durdur" onClick={(e) => e.stopPropagation()}>
                                <Pause size={14} className="text-slate-500" />
                              </button>
                            ) : route.status === 'paused' ? (
                              <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Devam Et" onClick={(e) => e.stopPropagation()}>
                                <Play size={14} className="text-slate-500" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Map Placeholder & Route Detail */}
        <div className="space-y-6">
          {/* Map Placeholder */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 h-[250px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                <Map size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">Harita Gorunumu</p>
              <p className="text-xs text-slate-400 mt-1">Rotalari haritada goruntuleyin</p>
              {selectedRoute && (
                <div className="mt-3 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {selectedRoute.routeNumber} - {selectedRoute.region}
                </div>
              )}
            </div>
          </div>

          {/* Selected Route Detail */}
          {selectedRoute && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">{selectedRoute.routeNumber} Detay</h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: routeStatuses[selectedRoute.status].bg, color: routeStatuses[selectedRoute.status].color }}>
                  {routeStatuses[selectedRoute.status].label}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kurye</span>
                  <span className="text-slate-700 font-medium">{selectedRoute.courier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bolge</span>
                  <span className="text-slate-700">{selectedRoute.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mesafe</span>
                  <span className="text-slate-700">{selectedRoute.totalDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tahmini Sure</span>
                  <span className="text-slate-700">{selectedRoute.estimatedTime} dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Baslangic</span>
                  <span className="text-slate-700">{formatDateTime(selectedRoute.startedAt)}</span>
                </div>
              </div>

              {/* Stops */}
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Duraklar ({selectedRoute.completedStops}/{selectedRoute.orderCount})</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {selectedRoute.stops.map((stop, idx) => (
                  <div key={stop.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${stop.status === 'delivered' ? 'bg-green-50/50' : stop.status === 'in_transit' ? 'bg-blue-50/50' : 'bg-slate-50'}`}>
                    <div className="flex flex-col items-center">
                      {stop.status === 'delivered' ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : stop.status === 'in_transit' ? (
                        <Navigation size={16} className="text-blue-500" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-700">{stop.orderNumber}</p>
                        <span className="text-xs text-slate-400">#{idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{stop.customer} - {stop.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
