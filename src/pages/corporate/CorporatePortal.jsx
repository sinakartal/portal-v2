import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  BookOpen,
  BarChart3,
  FileText,
  Users,
  Settings,
  Plus,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  Package,
  Building2,
  User,
  CalendarDays,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', label: 'Siparişler', icon: ShoppingCart },
  { key: 'addresses', label: 'Adres Defteri', icon: BookOpen },
  { key: 'reports', label: 'Raporlar', icon: BarChart3 },
  { key: 'invoices', label: 'Faturalar', icon: FileText },
  { key: 'users', label: 'Kullanıcılar', icon: Users },
  { key: 'settings', label: 'Ayarlar', icon: Settings },
];

const RECENT_ORDERS = [
  { id: 'SIP-2401', date: '2024-12-01', address: 'Levent Ofis, İstanbul', status: 'Teslim Edildi', amount: '₺1.240' },
  { id: 'SIP-2402', date: '2024-12-02', address: 'Kadıköy Depo, İstanbul', status: 'Yolda', amount: '₺3.450' },
  { id: 'SIP-2403', date: '2024-12-03', address: 'Ankara Şube', status: 'Hazırlanıyor', amount: '₺890' },
  { id: 'SIP-2404', date: '2024-12-03', address: 'İzmir Depo', status: 'Teslim Edildi', amount: '₺2.100' },
  { id: 'SIP-2405', date: '2024-12-04', address: 'Bursa Fabrika', status: 'Yolda', amount: '₺5.670' },
  { id: 'SIP-2406', date: '2024-12-04', address: 'Antalya Şube', status: 'Teslim Edildi', amount: '₺1.780' },
  { id: 'SIP-2407', date: '2024-12-05', address: 'Levent Ofis, İstanbul', status: 'Hazırlanıyor', amount: '₺920' },
  { id: 'SIP-2408', date: '2024-12-05', address: 'Kadıköy Depo, İstanbul', status: 'İptal', amount: '₺450' },
  { id: 'SIP-2409', date: '2024-12-06', address: 'Ankara Şube', status: 'Teslim Edildi', amount: '₺3.200' },
  { id: 'SIP-2410', date: '2024-12-06', address: 'İzmir Depo', status: 'Yolda', amount: '₺1.560' },
];

const ALL_ORDERS = [
  ...RECENT_ORDERS,
  { id: 'SIP-2411', date: '2024-12-07', address: 'Bursa Fabrika', status: 'Teslim Edildi', amount: '₺4.320' },
  { id: 'SIP-2412', date: '2024-12-07', address: 'Antalya Şube', status: 'Yolda', amount: '₺2.890' },
  { id: 'SIP-2413', date: '2024-12-08', address: 'Levent Ofis, İstanbul', status: 'Hazırlanıyor', amount: '₺1.100' },
  { id: 'SIP-2414', date: '2024-12-08', address: 'Kadıköy Depo, İstanbul', status: 'Teslim Edildi', amount: '₺6.750' },
  { id: 'SIP-2415', date: '2024-12-09', address: 'Ankara Şube', status: 'Yolda', amount: '₺980' },
  { id: 'SIP-2416', date: '2024-12-09', address: 'İzmir Depo', status: 'Teslim Edildi', amount: '₺2.340' },
  { id: 'SIP-2417', date: '2024-12-10', address: 'Bursa Fabrika', status: 'Hazırlanıyor', amount: '₺4.560' },
  { id: 'SIP-2418', date: '2024-12-10', address: 'Antalya Şube', status: 'İptal', amount: '₺780' },
  { id: 'SIP-2419', date: '2024-12-11', address: 'Levent Ofis, İstanbul', status: 'Teslim Edildi', amount: '₺3.670' },
  { id: 'SIP-2420', date: '2024-12-11', address: 'Kadıköy Depo, İstanbul', status: 'Yolda', amount: '₺1.450' },
];

const ADDRESSES = [
  { id: 1, label: 'Merkez Ofis', address: 'Levent Mah. Büyükdere Cad. No:128, Şişli/İstanbul', phone: '0212 555 01 01', type: 'Ofis' },
  { id: 2, label: 'Kadıköy Depo', address: 'Fikirtepe Mah. Bağdat Cad. No:45, Kadıköy/İstanbul', phone: '0216 444 02 02', type: 'Depo' },
  { id: 3, label: 'Ankara Şube', address: 'Kızılay Mah. Atatürk Blv. No:78, Çankaya/Ankara', phone: '0312 333 03 03', type: 'Ofis' },
  { id: 4, label: 'İzmir Depo', address: 'Alsancak Mah. Kordon Cad. No:12, Konak/İzmir', phone: '0232 222 04 04', type: 'Depo' },
  { id: 5, label: 'Bursa Fabrika', address: 'Organize Sanayi Bölgesi 5. Cad. No:23, Nilüfer/Bursa', phone: '0224 111 05 05', type: 'Fabrika' },
  { id: 6, label: 'Antalya Şube', address: 'Konyaaltı Mah. Lara Cad. No:56, Muratpaşa/Antalya', phone: '0242 666 06 06', type: 'Ofis' },
];

const MONTHLY_DATA = [
  { month: 'Oca', value: 32 },
  { month: 'Şub', value: 28 },
  { month: 'Mar', value: 45 },
  { month: 'Nis', value: 38 },
  { month: 'May', value: 52 },
  { month: 'Haz', value: 48 },
  { month: 'Tem', value: 41 },
  { month: 'Ağu', value: 35 },
  { month: 'Eyl', value: 55 },
  { month: 'Eki', value: 60 },
  { month: 'Kas', value: 58 },
  { month: 'Ara', value: 65 },
];

const INVOICES = [
  { id: 'FTR-2024-001', date: '2024-12-01', amount: '₺12.450', status: 'Ödendi' },
  { id: 'FTR-2024-002', date: '2024-12-05', amount: '₺8.920', status: 'Bekliyor' },
  { id: 'FTR-2024-003', date: '2024-12-08', amount: '₺15.340', status: 'Ödendi' },
  { id: 'FTR-2024-004', date: '2024-12-10', amount: '₺6.780', status: 'Bekliyor' },
  { id: 'FTR-2024-005', date: '2024-12-12', amount: '₺22.100', status: 'Ödendi' },
  { id: 'FTR-2024-006', date: '2024-12-15', amount: '₺9.650', status: 'Bekliyor' },
  { id: 'FTR-2024-007', date: '2024-12-18', amount: '₺18.430', status: 'Ödendi' },
  { id: 'FTR-2024-008', date: '2024-12-20', amount: '₺4.560', status: 'Gecikmiş' },
  { id: 'FTR-2024-009', date: '2024-12-22', amount: '₺11.200', status: 'Ödendi' },
  { id: 'FTR-2024-010', date: '2024-12-25', amount: '₺7.890', status: 'Bekliyor' },
];

const MONTHLY_BREAKDOWN = [
  { month: 'Ocak 2024', orders: 32, spend: '₺38.200', delivered: 30, cancelled: 2, sla: '95.2%' },
  { month: 'Şubat 2024', orders: 28, spend: '₺33.100', delivered: 27, cancelled: 1, sla: '96.8%' },
  { month: 'Mart 2024', orders: 45, spend: '₺52.400', delivered: 43, cancelled: 2, sla: '94.5%' },
  { month: 'Nisan 2024', orders: 38, spend: '₺44.800', delivered: 37, cancelled: 1, sla: '97.1%' },
  { month: 'Mayıs 2024', orders: 52, spend: '₺61.200', delivered: 50, cancelled: 2, sla: '96.0%' },
  { month: 'Haziran 2024', orders: 48, spend: '₺56.900', delivered: 47, cancelled: 1, sla: '97.5%' },
];

// ─── Helper Components ────────────────────────────────────────────────────────

const statusColor = (status) => {
  switch (status) {
    case 'Teslim Edildi':
      return 'bg-green-100 text-green-700';
    case 'Yolda':
      return 'bg-blue-100 text-blue-700';
    case 'Hazırlanıyor':
      return 'bg-yellow-100 text-yellow-700';
    case 'İptal':
      return 'bg-red-100 text-red-700';
    case 'Ödendi':
      return 'bg-green-100 text-green-700';
    case 'Bekliyor':
      return 'bg-yellow-100 text-yellow-700';
    case 'Gecikmiş':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// ─── Dashboard Section ────────────────────────────────────────────────────────

function DashboardSection() {
  const maxValue = Math.max(...MONTHLY_DATA.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bu Ay Sipariş</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">245</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={14} /> +12% geçen aya göre
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Harcama</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">₺48K</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={14} /> +8% geçen aya göre
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">SLA Uyum</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">96.5%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 size={14} /> Hedef: 95%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          <Plus size={18} /> Yeni Sipariş
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
          <Upload size={18} /> Toplu Yükle
        </button>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Sipariş Trendi</h3>
        <div className="flex items-end gap-3 h-48">
          {MONTHLY_DATA.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">{d.value}</span>
              <div
                className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors cursor-pointer"
                style={{ height: `${(d.value / maxValue) * 100}%` }}
                title={`${d.month}: ${d.value} sipariş`}
              />
              <span className="text-xs text-gray-500 mt-1">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Son Siparişler</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sipariş No</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Adres</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:underline">{order.id}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{order.date}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{order.address}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900 font-medium text-right">{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Section ───────────────────────────────────────────────────────────

function OrdersSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const filtered = ALL_ORDERS.filter((o) => {
    const matchSearch =
      !searchTerm ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = !dateFilter || o.date === dateFilter;
    return matchSearch && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Siparişler</h2>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm self-start">
          <Plus size={18} /> Yeni Sipariş
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Sipariş no veya adres ara..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sipariş No</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Adres</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:underline">{order.id}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{order.date}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{order.address}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-900 font-medium text-right">{order.amount}</td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                  Sonuç bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filtered.length} kayıttan {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} arası gösteriliyor
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Address Book Section ─────────────────────────────────────────────────────

function AddressBookSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Adres Defteri</h2>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          <Plus size={18} /> Yeni Adres
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADDRESSES.map((addr) => (
          <div
            key={addr.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin size={18} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{addr.label}</h4>
                  <span className="text-xs text-gray-400">{addr.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{addr.address}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone size={14} />
              <span>{addr.phone}</span>
            </div>
            <button className="mt-3 w-full py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              Sipariş İçin Seç
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reports Section ──────────────────────────────────────────────────────────

function ReportsSection() {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Raporlar</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
            <Download size={16} /> PDF
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            <Download size={16} /> Excel
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <CalendarDays size={18} className="text-gray-400" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <span className="text-gray-400">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">Toplam Sipariş</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">2.845</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">Toplam Harcama</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₺286K</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">Ortalama SLA</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">96.2%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">İptal Oranı</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">2.1%</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Aylık Dağılım</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ay</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sipariş</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harcama</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teslim</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">İptal</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MONTHLY_BREAKDOWN.map((row) => (
                <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.month}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-center">{row.orders}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-center">{row.spend}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-center">{row.delivered}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-center">{row.cancelled}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      parseFloat(row.sla) >= 96 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {row.sla}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Invoices Section ─────────────────────────────────────────────────────────

function InvoicesSection() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = INVOICES.filter((inv) => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Faturalar</h2>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="all">Tümü</option>
            <option value="Ödendi">Ödendi</option>
            <option value="Bekliyor">Bekliyor</option>
            <option value="Gecikmiş">Gecikmiş</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fatura No</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{inv.id}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{inv.date}</td>
                <td className="px-6 py-3 text-sm text-gray-900 font-medium text-right">{inv.amount}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Download size={14} /> PDF İndir
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                  Bu filtreyle eşleşen fatura bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Users Section (Placeholder) ──────────────────────────────────────────────

function UsersSection() {
  const users = [
    { id: 1, name: 'Mehmet Yılmaz', email: 'mehmet@abcholding.com', role: 'Admin', status: 'Aktif' },
    { id: 2, name: 'Ayşe Demir', email: 'ayse@abcholding.com', role: 'Sipariş Yöneticisi', status: 'Aktif' },
    { id: 3, name: 'Can Öztürk', email: 'can@abcholding.com', role: 'Görüntüleyici', status: 'Aktif' },
    { id: 4, name: 'Elif Kaya', email: 'elif@abcholding.com', role: 'Sipariş Yöneticisi', status: 'Pasif' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Kullanıcılar</h2>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          <Plus size={18} /> Kullanıcı Ekle
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ad Soyad</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">E-posta</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{u.role}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Settings Section (Placeholder) ───────────────────────────────────────────

function SettingsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Ayarlar</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Şirket Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
              <input type="text" defaultValue="ABC Holding A.Ş." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi No</label>
              <input type="text" defaultValue="1234567890" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input type="text" defaultValue="info@abcholding.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="text" defaultValue="0212 555 00 00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Bildirim Tercihleri</h3>
          <div className="space-y-3">
            {['Sipariş durumu değişikliklerinde e-posta gönder', 'Fatura oluşturulduğunda bildir', 'Haftalık rapor gönder', 'SLA uyarılarını aktif et'].map((item) => (
              <label key={item} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CorporatePortal() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'orders':
        return <OrdersSection />;
      case 'addresses':
        return <AddressBookSection />;
      case 'reports':
        return <ReportsSection />;
      case 'invoices':
        return <InvoicesSection />;
      case 'users':
        return <UsersSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 flex flex-col shrink-0">
        {/* Company Logo & Name */}
        <div className="px-5 py-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">ABC Holding</h1>
              <p className="text-slate-400 text-xs">Kurumsal Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <User size={16} className="text-slate-300" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">Mehmet</p>
              <p className="text-slate-400 text-xs truncate">ABC Holding</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {MENU_ITEMS.find((m) => m.key === activeSection)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">ABC Holding - Kurumsal Müşteri Portalı</p>
          </div>

          {renderSection()}
        </div>
      </main>
    </div>
  );
}
