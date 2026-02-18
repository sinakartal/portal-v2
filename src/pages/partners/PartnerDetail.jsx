import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Settings, PauseCircle, TrendingUp, TrendingDown,
  Package, CheckCircle, Clock, ShieldCheck, Banknote, CreditCard,
  ArrowLeftRight, XCircle, MapPin, Truck, AlertTriangle, Filter,
  ChevronLeft, ChevronRight, BarChart3
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

// ── Mock Data ────────────────────────────────────────────────

const PARTNERS = {
  '1': { name: 'Trendyol Go', status: 'active' },
  '2': { name: 'Getir Kurye', status: 'restricted' },
  '3': { name: 'Yemeksepeti Banabi', status: 'active' },
  '4': { name: 'Hepsiburada Teslimat', status: 'active' },
}

const dailyOrderTrend = [
  { day: '12 Şub', orders: 583 },
  { day: '13 Şub', orders: 621 },
  { day: '14 Şub', orders: 558 },
  { day: '15 Şub', orders: 694 },
  { day: '16 Şub', orders: 712 },
  { day: '17 Şub', orders: 648 },
  { day: '18 Şub', orders: 705 },
]

const hourlyPerformance = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  deliveries: i >= 8 && i <= 22
    ? Math.floor(Math.random() * 40) + (i >= 11 && i <= 14 ? 50 : i >= 18 && i <= 21 ? 45 : 15)
    : Math.floor(Math.random() * 5),
}))

const recentOrders = [
  { id: 'BRN-004521', transferTime: '09:12', deliveryTime: '09:38', duration: '26dk', status: 'delivered' },
  { id: 'BRN-004520', transferTime: '09:08', deliveryTime: '09:41', duration: '33dk', status: 'delivered' },
  { id: 'BRN-004519', transferTime: '09:05', deliveryTime: null, duration: '—', status: 'in_transit' },
  { id: 'BRN-004518', transferTime: '08:55', deliveryTime: '09:47', duration: '52dk', status: 'delayed' },
  { id: 'BRN-004517', transferTime: '08:50', deliveryTime: '09:18', duration: '28dk', status: 'delivered' },
  { id: 'BRN-004516', transferTime: '08:42', deliveryTime: '09:10', duration: '28dk', status: 'delivered' },
  { id: 'BRN-004515', transferTime: '08:38', deliveryTime: null, duration: '—', status: 'in_transit' },
  { id: 'BRN-004514', transferTime: '08:30', deliveryTime: '09:05', duration: '35dk', status: 'delivered' },
  { id: 'BRN-004513', transferTime: '08:25', deliveryTime: '09:12', duration: '47dk', status: 'delayed' },
  { id: 'BRN-004512', transferTime: '08:18', deliveryTime: '08:52', duration: '34dk', status: 'delivered' },
  { id: 'BRN-004511', transferTime: '08:10', deliveryTime: '08:39', duration: '29dk', status: 'delivered' },
  { id: 'BRN-004510', transferTime: '08:02', deliveryTime: '08:34', duration: '32dk', status: 'delivered' },
  { id: 'BRN-004509', transferTime: '07:55', deliveryTime: null, duration: '—', status: 'in_transit' },
  { id: 'BRN-004508', transferTime: '07:48', deliveryTime: '08:30', duration: '42dk', status: 'delivered' },
  { id: 'BRN-004507', transferTime: '07:40', deliveryTime: '08:22', duration: '42dk', status: 'delayed' },
]

const regionPerformance = [
  { district: 'Kadıköy', deliveries: 862, deliveryRate: 97.4, avgTime: '28dk', sla: 99.1 },
  { district: 'Beşiktaş', deliveries: 724, deliveryRate: 95.8, avgTime: '32dk', sla: 97.6 },
  { district: 'Şişli', deliveries: 691, deliveryRate: 96.1, avgTime: '34dk', sla: 98.2 },
  { district: 'Üsküdar', deliveries: 583, deliveryRate: 94.7, avgTime: '36dk', sla: 96.8 },
  { district: 'Ataşehir', deliveries: 512, deliveryRate: 97.2, avgTime: '30dk', sla: 98.9 },
  { district: 'Bakırköy', deliveries: 448, deliveryRate: 93.5, avgTime: '38dk', sla: 95.4 },
  { district: 'Maltepe', deliveries: 387, deliveryRate: 96.8, avgTime: '31dk', sla: 98.1 },
  { district: 'Sarıyer', deliveries: 314, deliveryRate: 92.1, avgTime: '41dk', sla: 93.7 },
]

// ── Helpers ──────────────────────────────────────────────────

const STATUS_MAP = {
  delivered: { label: 'Teslim', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  in_transit: { label: 'Yolda', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  delayed: { label: 'Gecikme', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.delivered
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function MetricCard({ icon: Icon, label, value, change, changeDirection, iconColor }) {
  const isPositive = changeDirection === 'up'
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor || 'bg-slate-100'}`}>
          <Icon className="w-4.5 h-4.5 text-white" size={18} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {change && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Component ───────────────────────────────────────────────

export default function PartnerDetail() {
  const { partnerId } = useParams()
  const navigate = useNavigate()
  const [ordersPage, setOrdersPage] = useState(1)

  const partner = PARTNERS[partnerId] || { name: `Partner #${partnerId}`, status: 'active' }
  const isActive = partner.status === 'active'

  const ordersPerPage = 10
  const totalOrderPages = Math.ceil(recentOrders.length / ordersPerPage)
  const paginatedOrders = recentOrders.slice(
    (ordersPage - 1) * ordersPerPage,
    ordersPage * ordersPerPage
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={18} className="text-slate-600" />
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{partner.name}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isActive ? 'Aktif' : 'Kısıtlı'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Settings size={16} />
              Ayarlar
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 shadow-sm text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors">
              <PauseCircle size={16} />
              Durdur
            </button>
          </div>
        </div>

        {/* ── Performance Metrics Row 1 ──────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Package}
            label="Sipariş"
            value="4,521"
            change="+12%"
            changeDirection="up"
            iconColor="bg-indigo-500"
          />
          <MetricCard
            icon={CheckCircle}
            label="Teslim %"
            value="96.2%"
            change="+2.1%"
            changeDirection="up"
            iconColor="bg-emerald-500"
          />
          <MetricCard
            icon={Clock}
            label="Ort. Süre"
            value="35dk"
            change="-8dk"
            changeDirection="up"
            iconColor="bg-sky-500"
          />
          <MetricCard
            icon={ShieldCheck}
            label="SLA"
            value="98.5%"
            change="+1.2%"
            changeDirection="up"
            iconColor="bg-violet-500"
          />
        </div>

        {/* ── Performance Metrics Row 2 ──────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Banknote}
            label="Toplam Maliyet"
            value="₺144,672"
            change="+5.4%"
            changeDirection="down"
            iconColor="bg-rose-500"
          />
          <MetricCard
            icon={CreditCard}
            label="Birim Maliyet"
            value="₺32.00"
            change="-₺1.50"
            changeDirection="up"
            iconColor="bg-amber-500"
          />
          <MetricCard
            icon={ArrowLeftRight}
            label="Bringo vs Partner"
            value="-₺8/sip"
            change="Avantajlı"
            changeDirection="up"
            iconColor="bg-teal-500"
          />
          <MetricCard
            icon={XCircle}
            label="İptal Oranı"
            value="2.1%"
            change="-0.4%"
            changeDirection="up"
            iconColor="bg-slate-500"
          />
        </div>

        {/* ── Charts ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily Order Trend */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Günlük Sipariş Trendi</h3>
                <p className="text-xs text-slate-500 mt-0.5">Son 7 gün</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <TrendingUp size={16} className="text-indigo-600" />
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyOrderTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '13px',
                    }}
                    formatter={(value) => [`${value} sipariş`, 'Sipariş']}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hourly Performance */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Saatlik Performans</h3>
                <p className="text-xs text-slate-500 mt-0.5">Bugün — 24 saat dağılımı</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                <BarChart3 size={16} className="text-sky-600" />
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyPerformance} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '13px',
                    }}
                    formatter={(value) => [`${value} teslimat`, 'Teslimat']}
                  />
                  <Bar
                    dataKey="deliveries"
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Recent Orders Table ────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-900">Son Siparişler</h3>
              <span className="text-xs text-slate-400 font-medium">{recentOrders.length} kayıt</span>
            </div>
            <button className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
              <Filter size={14} />
              Filtrele
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sipariş No</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktarım Saati</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teslim Saati</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Süre</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800">{order.id}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{order.transferTime}</td>
                    <td className="px-5 py-3.5 text-slate-600">{order.deliveryTime || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{order.duration}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Sayfa {ordersPage} / {totalOrderPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                disabled={ordersPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} className="text-slate-600" />
              </button>
              <button
                onClick={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
                disabled={ordersPage === totalOrderPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Region Performance ─────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-900">Bölge Performansı</h3>
              <span className="text-xs text-slate-400 font-medium">{regionPerformance.length} bölge</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <MapPin size={16} className="text-emerald-600" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">İlçe</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teslimat Sayısı</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teslim Oranı</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ort. Süre</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {regionPerformance.map((region) => {
                  const rateColor =
                    region.deliveryRate >= 96
                      ? 'text-emerald-600'
                      : region.deliveryRate >= 94
                        ? 'text-amber-600'
                        : 'text-red-600'

                  const slaColor =
                    region.sla >= 97
                      ? 'text-emerald-600'
                      : region.sla >= 95
                        ? 'text-amber-600'
                        : 'text-red-600'

                  return (
                    <tr key={region.district} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="font-semibold text-slate-800">{region.district}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                        {region.deliveries.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                region.deliveryRate >= 96
                                  ? 'bg-emerald-500'
                                  : region.deliveryRate >= 94
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${region.deliveryRate}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${rateColor}`}>
                            %{region.deliveryRate}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{region.avgTime}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold ${slaColor}`}>
                          %{region.sla}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
