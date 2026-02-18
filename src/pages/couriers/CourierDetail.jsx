import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Truck, Phone, MapPin, Star, Calendar, Clock, Package,
  CheckCircle, XCircle, TrendingUp, Award, Target, ThumbsUp,
  Edit2, Ban, Mail, AlertTriangle, ChevronRight
} from 'lucide-react'
import { COURIER_STATUSES, ORDER_STATUSES } from '@/constants/menu'
import { formatNumber, formatDate, formatDateTime, formatCurrency } from '@/utils'

export default function CourierDetail() {
  const { courierId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [courier, setCourier] = useState(null)
  const [deliveryHistory, setDeliveryHistory] = useState([])

  useEffect(() => {
    const mockCourier = {
      _id: courierId,
      name: 'Serkan Acar',
      phone: '0535 234 5678',
      email: 'serkan.acar@email.com',
      tcNo: '12345678901',
      birthDate: '1992-05-15',
      status: 'active',
      vehicle: {
        type: 'Motosiklet',
        plate: '34 AB 1234',
        brand: 'Honda PCX',
        year: 2023,
        color: 'Siyah',
      },
      region: 'Kadikoy',
      secondaryRegions: ['Uskudar', 'Atasehir', 'Maltepe'],
      address: 'Caferaga Mah. Moda Cad. No:45 D:3 Kadikoy/Istanbul',
      bankInfo: {
        bankName: 'Ziraat Bankasi',
        iban: 'TR12 0001 0012 3456 7890 1234 56',
      },
      documents: {
        idCard: true,
        driverLicense: true,
        vehicleRegistration: true,
        criminalRecord: true,
        sgk: true,
      },
      performanceScore: 92,
      totalDeliveries: 1847,
      todayDeliveries: 14,
      weekDeliveries: 78,
      monthDeliveries: 312,
      onTimeRate: 96.2,
      successRate: 98.1,
      averageDeliveryTime: 28,
      customerRating: 4.7,
      totalRatings: 423,
      cancelRate: 1.2,
      complaints: 3,
      earnings: {
        today: 420,
        week: 2340,
        month: 9360,
        total: 84240,
      },
      lastActive: new Date(Date.now() - 300000).toISOString(),
      createdAt: '2025-03-15T10:00:00Z',
    }
    setCourier(mockCourier)

    const history = Array.from({ length: 30 }, (_, i) => ({
      _id: `del-${i}`,
      orderNumber: `BRN-${String(1200 + i).padStart(6, '0')}`,
      customer: ['Ahmet Yilmaz', 'Mehmet Kaya', 'Fatma Demir', 'Ayse Celik', 'Ali Sahin'][i % 5],
      address: ['Kadikoy', 'Uskudar', 'Atasehir', 'Maltepe', 'Besiktas'][i % 5],
      status: i < 25 ? 'delivered' : i < 28 ? 'in_transit' : 'failed_delivery',
      deliveryTime: Math.floor(Math.random() * 20) + 15,
      amount: Math.floor(Math.random() * 500) + 100,
      rating: i < 25 ? (Math.random() * 1.5 + 3.5).toFixed(1) : null,
      completedAt: new Date(Date.now() - i * 3600000 * 2).toISOString(),
    }))
    setDeliveryHistory(history)
  }, [courierId])

  if (!courier) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Yukleniyor...</div>
  }

  const status = COURIER_STATUSES[courier.status] || { label: courier.status, color: '#6b7280', bg: '#f3f4f6' }

  const tabs = [
    { id: 'general', label: 'Genel Bilgiler' },
    { id: 'performance', label: 'Performans' },
    { id: 'history', label: 'Teslimat Gecmisi' },
  ]

  const scoreColor = courier.performanceScore >= 90 ? 'text-green-500' :
    courier.performanceScore >= 75 ? 'text-blue-500' :
      courier.performanceScore >= 60 ? 'text-amber-500' : 'text-red-500'

  const scoreTrackColor = courier.performanceScore >= 90 ? 'stroke-green-500' :
    courier.performanceScore >= 75 ? 'stroke-blue-500' :
      courier.performanceScore >= 60 ? 'stroke-amber-500' : 'stroke-red-500'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/couriers')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <Truck size={24} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{courier.name}</h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><Phone size={12} /> {courier.phone}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {courier.region}</span>
                <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" fill="currentColor" /> {courier.customerRating}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
            <Phone size={14} /> Ara
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Edit2 size={14} /> Duzenle
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Kisisel Bilgiler</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Ad Soyad</span>
                <span className="text-slate-800 font-medium">{courier.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Telefon</span>
                <span className="text-slate-800">{courier.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">E-posta</span>
                <span className="text-slate-800">{courier.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">TC Kimlik No</span>
                <span className="text-slate-800">{courier.tcNo}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Dogum Tarihi</span>
                <span className="text-slate-800">{formatDate(courier.birthDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Adres</span>
                <span className="text-slate-800 text-right max-w-[250px]">{courier.address}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Kayit Tarihi</span>
                <span className="text-slate-800">{formatDate(courier.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Arac Bilgileri</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Arac Tipi</span>
                <span className="text-slate-800 font-medium">{courier.vehicle.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Plaka</span>
                <span className="text-slate-800">{courier.vehicle.plate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Marka/Model</span>
                <span className="text-slate-800">{courier.vehicle.brand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Yil</span>
                <span className="text-slate-800">{courier.vehicle.year}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Renk</span>
                <span className="text-slate-800">{courier.vehicle.color}</span>
              </div>
            </div>
          </div>

          {/* Region Info */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Bolge Bilgileri</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Ana Bolge</span>
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{courier.region}</span>
              </div>
              <div className="py-2">
                <span className="text-slate-500 block mb-2">Ek Bolgeler</span>
                <div className="flex flex-wrap gap-2">
                  {courier.secondaryRegions.map(r => (
                    <span key={r} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bank & Documents */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Banka ve Evraklar</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Banka</span>
                <span className="text-slate-800">{courier.bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">IBAN</span>
                <span className="text-slate-800 text-xs">{courier.bankInfo.iban}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block mb-3">Evrak Durumu</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'idCard', label: 'Kimlik' },
                    { key: 'driverLicense', label: 'Ehliyet' },
                    { key: 'vehicleRegistration', label: 'Ruhsat' },
                    { key: 'criminalRecord', label: 'Sabika Kaydi' },
                    { key: 'sgk', label: 'SGK' },
                  ].map(doc => (
                    <div key={doc.key} className="flex items-center gap-2">
                      {courier.documents[doc.key] ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <XCircle size={14} className="text-red-500" />
                      )}
                      <span className="text-slate-600">{doc.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div>
          {/* Score Gauge and KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Score Gauge */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col items-center justify-center">
              <h3 className="font-semibold text-slate-800 mb-4">Performans Skoru</h3>
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    className={scoreTrackColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70 * courier.performanceScore / 100} ${2 * Math.PI * 70}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${scoreColor}`}>{courier.performanceScore}</span>
                  <span className="text-xs text-slate-400 mt-1">/ 100</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                {courier.performanceScore >= 90 ? 'Mukemmel Performans' :
                  courier.performanceScore >= 75 ? 'Iyi Performans' :
                    courier.performanceScore >= 60 ? 'Ortalama Performans' : 'Gelistirilmeli'}
              </p>
            </div>

            {/* Delivery KPIs */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Toplam Teslimat', value: formatNumber(courier.totalDeliveries), icon: Package, color: 'bg-blue-50 text-blue-500' },
                { label: 'Bugun', value: courier.todayDeliveries, icon: Target, color: 'bg-green-50 text-green-500' },
                { label: 'Bu Hafta', value: courier.weekDeliveries, icon: TrendingUp, color: 'bg-indigo-50 text-indigo-500' },
                { label: 'Bu Ay', value: courier.monthDeliveries, icon: Calendar, color: 'bg-purple-50 text-purple-500' },
                { label: 'Zamaninda Teslimat', value: `%${courier.onTimeRate}`, icon: Clock, color: 'bg-teal-50 text-teal-500' },
                { label: 'Basari Orani', value: `%${courier.successRate}`, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500' },
                { label: 'Ort. Teslimat Suresi', value: `${courier.averageDeliveryTime} dk`, icon: Clock, color: 'bg-amber-50 text-amber-500' },
                { label: 'Musteri Puani', value: `${courier.customerRating}/5`, icon: Star, color: 'bg-yellow-50 text-yellow-500' },
                { label: 'Iptal Orani', value: `%${courier.cancelRate}`, icon: XCircle, color: 'bg-red-50 text-red-500' },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                      <kpi.icon size={16} />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-slate-800">{kpi.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Award size={18} className="text-slate-500" /> Kazanc Ozeti
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-800">{formatCurrency(courier.earnings.today)}</p>
                <p className="text-xs text-slate-500 mt-1">Bugun</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-800">{formatCurrency(courier.earnings.week)}</p>
                <p className="text-xs text-slate-500 mt-1">Bu Hafta</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-800">{formatCurrency(courier.earnings.month)}</p>
                <p className="text-xs text-slate-500 mt-1">Bu Ay</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-lg font-bold text-primary">{formatCurrency(courier.earnings.total)}</p>
                <p className="text-xs text-slate-500 mt-1">Toplam</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Siparis No</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Musteri</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Bolge</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Sure</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Tutar</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Puan</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {deliveryHistory.map(delivery => {
                  const dStatus = ORDER_STATUSES[delivery.status] || { label: delivery.status, color: '#6b7280', bg: '#f3f4f6' }
                  return (
                    <tr key={delivery._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-primary cursor-pointer" onClick={() => navigate(`/orders/${delivery._id}`)}>
                        {delivery.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{delivery.customer}</td>
                      <td className="px-4 py-3 text-slate-600">{delivery.address}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: dStatus.bg, color: dStatus.color }}>
                          {dStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{delivery.deliveryTime} dk</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">{formatCurrency(delivery.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        {delivery.rating ? (
                          <div className="flex items-center justify-center gap-1">
                            <Star size={12} className="text-amber-400" fill="currentColor" />
                            <span className="text-slate-700">{delivery.rating}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(delivery.completedAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
