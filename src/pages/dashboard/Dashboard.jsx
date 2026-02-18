import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, MapPin, Truck, CheckCircle, Clock, Wallet, XCircle, Star, Plus, Route, FileText, AlertTriangle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import KpiCard from '@/components/dashboard/KpiCard'
import { generateKPIs, generateWeeklyData, generateHourlyData, generateOrders, generateStatusDistribution } from '@/services/mockData'
import { ORDER_STATUSES } from '@/constants/menu'
import { timeAgo } from '@/utils'

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#6b7280']

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [hourlyData, setHourlyData] = useState([])
  const [statusDist, setStatusDist] = useState([])
  const [activities, setActivities] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setKpis(generateKPIs())
    setWeeklyData(generateWeeklyData())
    setHourlyData(generateHourlyData())
    const orders = generateOrders(200)
    setStatusDist(generateStatusDistribution(orders))
    setActivities([
      { id: 1, type: 'order', title: 'Yeni siparis alindi', desc: 'BRN-001247 - Ahmet Yilmaz', time: new Date(Date.now() - 120000).toISOString() },
      { id: 2, type: 'delivery', title: 'Teslimat tamamlandi', desc: 'BRN-001243 - Serkan Acar', time: new Date(Date.now() - 300000).toISOString() },
      { id: 3, type: 'courier', title: 'Kurye online oldu', desc: 'Murat Yildirim - Kadikoy', time: new Date(Date.now() - 900000).toISOString() },
      { id: 4, type: 'warning', title: 'SLA uyarisi', desc: '5 siparis SLA limitine yaklasiyor', time: new Date(Date.now() - 1800000).toISOString() },
      { id: 5, type: 'delivery', title: 'Teslimat tamamlandi', desc: 'BRN-001240 - Hakan Tekin', time: new Date(Date.now() - 3600000).toISOString() },
      { id: 6, type: 'cancel', title: 'Siparis iptal edildi', desc: 'BRN-001238 - Musteri talebi', time: new Date(Date.now() - 5400000).toISOString() },
      { id: 7, type: 'order', title: 'Toplu siparis yuklendi', desc: '25 siparis - E-Ticaret Lojistik', time: new Date(Date.now() - 7200000).toISOString() },
      { id: 8, type: 'warning', title: 'Kurye GPS kaybi', desc: 'Volkan Aslan - 10 dk dir sinyal yok', time: new Date(Date.now() - 600000).toISOString() },
    ])
  }, [])

  if (!kpis) return <div className="flex items-center justify-center h-64 text-slate-400">Yukleniyor...</div>

  const activityIcons = {
    order: { bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-500', icon: Package },
    delivery: { bg: 'bg-green-50 dark:bg-green-900/30', color: 'text-green-500', icon: CheckCircle },
    courier: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-500', icon: Truck },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', color: 'text-yellow-500', icon: AlertTriangle },
    cancel: { bg: 'bg-red-50 dark:bg-red-900/30', color: 'text-red-500', icon: XCircle },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Genel bakis ve anlik metrikler</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm mr-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-slate-500 dark:text-slate-400">Canli</span>
          </div>
          {/* Quick Action Buttons */}
          <button
            onClick={() => navigate('/orders/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <Plus size={16} /> Yeni Siparis
          </button>
          <button
            onClick={() => navigate('/routes/plan')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Route size={16} /> Rota Olustur
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <FileText size={16} /> Rapor Al
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Bugunku Siparis" value={kpis.todayOrders.value} change={kpis.todayOrders.change} icon={Package} />
        <KpiCard title="Aktif Rota" value={kpis.activeRoutes.value} change={kpis.activeRoutes.change} icon={MapPin} />
        <KpiCard title="Online Kurye" value={kpis.onlineCouriers.value} change={kpis.onlineCouriers.change} icon={Truck} suffix={`/${kpis.onlineCouriers.total}`} />
        <KpiCard title="Teslim Orani" value={kpis.deliveryRate.value} change={kpis.deliveryRate.change} icon={CheckCircle} type="percent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Ort. Teslim Suresi" value={kpis.avgDeliveryTime.value} change={kpis.avgDeliveryTime.change} icon={Clock} suffix=" dk" />
        <KpiCard title="Gunluk Gelir" value={kpis.dailyRevenue.value} change={kpis.dailyRevenue.change} icon={Wallet} type="currency" />
        <KpiCard title="Iptal Orani" value={kpis.cancelRate.value} change={kpis.cancelRate.change} icon={XCircle} type="percent" />
        <KpiCard title="Musteri Puani" value={kpis.customerRating.value} change={kpis.customerRating.change} icon={Star} suffix="/5" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Trend */}
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Haftalik Siparis Trendi</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="buHafta" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Bu Hafta" />
              <Line type="monotone" dataKey="gecenHafta" stroke="#cbd5e1" strokeWidth={2} dot={{ r: 4 }} name="Gecen Hafta" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Teslimat Durumu Dagilimi</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusDist.slice(0, 7)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {statusDist.slice(0, 7).map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, ORDER_STATUSES[name]?.label || name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {statusDist.slice(0, 5).map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-slate-600">{ORDER_STATUSES[s.name]?.label || s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Saatlik Yogunluk</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="siparis" fill="#6366f1" radius={[4, 4, 0, 0]} name="Siparis" />
              <Bar dataKey="ortalama" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Ortalama" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Son Aktiviteler</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {activities.map(a => {
              const ai = activityIcons[a.type] || activityIcons.order
              const ActivityIcon = ai.icon
              return (
                <div key={a.id} className="flex gap-3">
                  <div className={`w-8 h-8 ${ai.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <ActivityIcon size={14} className={ai.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{a.title}</p>
                    <p className="text-xs text-slate-500 truncate">{a.desc}</p>
                    <p className="text-xs text-slate-400 mt-1">{timeAgo(a.time)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
