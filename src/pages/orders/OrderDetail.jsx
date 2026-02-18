import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Package, User, MapPin, Phone, Mail, Clock, Truck,
  CheckCircle, XCircle, Camera, FileText, Edit2, Copy, AlertTriangle,
  Calendar, CreditCard, Star, Navigation, ChevronRight
} from 'lucide-react'
import { ORDER_STATUSES } from '@/constants/menu'
import { formatCurrency, formatDate, formatDateTime } from '@/utils'

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const mockOrder = {
      _id: orderId,
      orderNumber: 'BRN-001247',
      externalId: 'EXT-78432',
      project: 'Istanbul Ana Dagitim',
      status: 'in_transit',
      priority: 'high',
      customer: {
        name: 'Ahmet Yilmaz',
        phone: '0532 456 7890',
        email: 'ahmet.yilmaz@email.com',
        address: 'Ataturk Cad. No:125 D:4 Kadikoy, Istanbul',
        notes: '3. kat, zil bozuk, arayiniz',
        lat: 40.9906,
        lng: 29.0285,
      },
      items: [
        { name: 'Elektronik Esya', quantity: 2, price: 450, sku: 'ELK-001' },
        { name: 'Telefon Aksesuari', quantity: 1, price: 120, sku: 'TEL-034' },
        { name: 'Bilgisayar Parcasi', quantity: 1, price: 780, sku: 'BLG-012' },
      ],
      courier: {
        name: 'Serkan Acar',
        phone: '0535 234 5678',
        vehicle: 'Motosiklet',
        plate: '34 AB 1234',
        rating: 4.7,
      },
      payment: {
        method: 'Kredi Karti',
        isPaid: true,
        amount: 1800,
        serviceFee: 25,
        deliveryFee: 15,
      },
      deliveryWindow: {
        start: new Date(Date.now() - 3600000).toISOString(),
        end: new Date(Date.now() + 7200000).toISOString(),
      },
      sla: {
        deadline: new Date(Date.now() + 5400000).toISOString(),
        isAtRisk: false,
      },
      deliveryProof: {
        signature: true,
        photo: true,
        recipientName: 'Ahmet Y.',
        deliveredAt: null,
        notes: '',
      },
      timeline: [
        { status: 'pending', label: 'Siparis Olusturuldu', time: new Date(Date.now() - 14400000).toISOString(), user: 'Sistem' },
        { status: 'confirmed', label: 'Siparis Onaylandi', time: new Date(Date.now() - 13200000).toISOString(), user: 'Operator - Elif K.' },
        { status: 'preparing', label: 'Hazirlaniyor', time: new Date(Date.now() - 10800000).toISOString(), user: 'Depo' },
        { status: 'ready_for_pickup', label: 'Teslim Alinmaya Hazir', time: new Date(Date.now() - 7200000).toISOString(), user: 'Depo' },
        { status: 'assigned', label: 'Kuryeye Atandi', time: new Date(Date.now() - 5400000).toISOString(), user: 'Sistem - Oto Atama' },
        { status: 'picked_up', label: 'Kurye Teslim Aldi', time: new Date(Date.now() - 3600000).toISOString(), user: 'Serkan Acar' },
        { status: 'in_transit', label: 'Yolda', time: new Date(Date.now() - 1800000).toISOString(), user: 'Serkan Acar' },
      ],
      notes: [
        { id: 1, text: 'Musteri aranarak teslimat saati teyit edildi.', user: 'Elif K.', time: new Date(Date.now() - 12000000).toISOString() },
        { id: 2, text: 'Paket ozel ambalajlandi, kirilacak esya mevcut.', user: 'Depo', time: new Date(Date.now() - 9000000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
    }
    setOrder(mockOrder)
  }, [orderId])

  if (!order) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Yukleniyor...</div>
  }

  const status = ORDER_STATUSES[order.status] || { label: order.status, color: '#6b7280', bg: '#f3f4f6' }
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const priorityConfig = {
    low: { label: 'Dusuk', class: 'bg-slate-100 text-slate-600' },
    normal: { label: 'Normal', class: 'bg-blue-50 text-blue-600' },
    high: { label: 'Yuksek', class: 'bg-orange-50 text-orange-600' },
    urgent: { label: 'Acil', class: 'bg-red-50 text-red-600' },
  }

  const timelineStatusIcon = (s) => {
    if (s === 'delivered') return <CheckCircle size={16} className="text-green-500" />
    if (s === 'cancelled' || s === 'failed_delivery') return <XCircle size={16} className="text-red-500" />
    return <CheckCircle size={16} className="text-primary" />
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{order.orderNumber}</h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
                {status.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[order.priority].class}`}>
                {priorityConfig[order.priority].label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {order.project} &middot; Harici ID: {order.externalId} &middot; Olusturulma: {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
            <Copy size={14} /> Kopyala
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
            <FileText size={14} /> Fatura
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Edit2 size={14} /> Duzenle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-slate-500" /> Musteri Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{order.customer.name}</p>
                    <p className="text-xs text-slate-400">Musteri</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  {order.customer.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  {order.customer.email}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{order.customer.address}</span>
                </div>
                {order.customer.notes && (
                  <div className="flex items-start gap-2 text-sm">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-600">{order.customer.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Package size={18} className="text-slate-500" /> Siparis Urunleri
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 font-medium text-slate-500">Urun</th>
                  <th className="text-left py-2 font-medium text-slate-500">SKU</th>
                  <th className="text-center py-2 font-medium text-slate-500">Adet</th>
                  <th className="text-right py-2 font-medium text-slate-500">Birim Fiyat</th>
                  <th className="text-right py-2 font-medium text-slate-500">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-slate-700">{item.name}</td>
                    <td className="py-3 text-slate-500">{item.sku}</td>
                    <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-600">{formatCurrency(item.price)}</td>
                    <td className="py-3 text-right font-medium text-slate-700">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200">
                  <td colSpan={4} className="py-2 text-right text-slate-500">Ara Toplam</td>
                  <td className="py-2 text-right font-medium text-slate-700">{formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-1 text-right text-slate-500">Teslimat Ucreti</td>
                  <td className="py-1 text-right text-slate-600">{formatCurrency(order.payment.deliveryFee)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-1 text-right text-slate-500">Hizmet Bedeli</td>
                  <td className="py-1 text-right text-slate-600">{formatCurrency(order.payment.serviceFee)}</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td colSpan={4} className="py-2 text-right font-semibold text-slate-800">Genel Toplam</td>
                  <td className="py-2 text-right font-bold text-slate-800">{formatCurrency(order.payment.amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-slate-500" /> Siparis Zaman Cizelgesi
            </h3>
            <div className="relative">
              {order.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10">
                      {timelineStatusIcon(event.status)}
                    </div>
                    {idx < order.timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">{event.label}</p>
                      <span className="text-xs text-slate-400">{formatDateTime(event.time)}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{event.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-slate-500" /> Notlar
            </h3>
            <div className="space-y-3 mb-4">
              {order.notes.map(note => (
                <div key={note.id} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-700">{note.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-slate-500">{note.user}</span>
                    <span className="text-xs text-slate-400">{formatDateTime(note.time)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Not ekle..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors">
                Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Courier Info */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-slate-500" /> Kurye Bilgileri
            </h3>
            {order.courier ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                    <Truck size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{order.courier.name}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Star size={12} fill="currentColor" />
                      <span>{order.courier.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Telefon</span>
                    <span className="text-slate-700">{order.courier.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Arac</span>
                    <span className="text-slate-700">{order.courier.vehicle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Plaka</span>
                    <span className="text-slate-700">{order.courier.plate}</span>
                  </div>
                </div>
                <button className="w-full mt-2 px-3 py-2 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors flex items-center justify-center gap-2">
                  <Navigation size={14} /> Canli Takip
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 mb-3">Henuz kurye atanmadi</p>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors">
                  Kurye Ata
                </button>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-slate-500" /> Odeme Bilgileri
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Yontem</span>
                <span className="text-slate-700 font-medium">{order.payment.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Durum</span>
                {order.payment.isPaid ? (
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">Odendi</span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">Bekliyor</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tutar</span>
                <span className="text-slate-800 font-bold">{formatCurrency(order.payment.amount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Window */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-slate-500" /> Teslimat Penceresi
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Baslangic</span>
                <span className="text-slate-700">{formatDateTime(order.deliveryWindow.start)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bitis</span>
                <span className="text-slate-700">{formatDateTime(order.deliveryWindow.end)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">SLA Limiti</span>
                <span className="text-slate-700">{formatDateTime(order.sla.deadline)}</span>
              </div>
              {order.sla.isAtRisk && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-red-600 text-xs font-medium">
                  <AlertTriangle size={14} /> SLA risk altinda!
                </div>
              )}
            </div>
          </div>

          {/* Delivery Proof */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Camera size={18} className="text-slate-500" /> Teslimat Kaniti
            </h3>
            {order.status === 'delivered' ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Teslim Alan</span>
                  <span className="text-slate-700">{order.deliveryProof.recipientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Imza</span>
                  {order.deliveryProof.signature ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Fotograf</span>
                  {order.deliveryProof.photo ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Camera size={20} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">Teslimat henuz tamamlanmadi</p>
                <p className="text-xs text-slate-400 mt-1">Kanit bilgileri teslimat sonrasi guncellenir</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Hizli Islemler</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <span className="flex items-center gap-2"><Truck size={14} className="text-slate-400" /> Kurye Degistir</span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <span className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> Teslimat Ertelendir</span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
                <span className="flex items-center gap-2"><XCircle size={14} /> Siparis Iptal Et</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
