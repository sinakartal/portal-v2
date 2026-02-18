import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings, Building2, MapPin, Clock, Bell, Save, Plus, Trash2,
  Edit2, ChevronRight, Mail, Phone, Globe, Shield, AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('company')
  const [saved, setSaved] = useState(false)

  // Company Info Form
  const [company, setCompany] = useState({
    name: 'HeyBringo Lojistik A.S.',
    taxId: '1234567890',
    taxOffice: 'Kadikoy Vergi Dairesi',
    phone: '0216 555 1234',
    email: 'info@heybringo.com',
    website: 'https://heybringo.com',
    address: 'Caferaga Mah. Moda Cad. No:45 Kadikoy/Istanbul',
    city: 'Istanbul',
    district: 'Kadikoy',
    postalCode: '34710',
    logo: '',
  })

  // Region Settings
  const [regions, setRegions] = useState([
    { id: 1, name: 'Kadikoy', code: 'KDK', isActive: true, courierLimit: 10, orderLimit: 200, deliveryFee: 15 },
    { id: 2, name: 'Besiktas', code: 'BSK', isActive: true, courierLimit: 8, orderLimit: 150, deliveryFee: 18 },
    { id: 3, name: 'Sisli', code: 'SSL', isActive: true, courierLimit: 6, orderLimit: 120, deliveryFee: 16 },
    { id: 4, name: 'Uskudar', code: 'USK', isActive: true, courierLimit: 7, orderLimit: 130, deliveryFee: 17 },
    { id: 5, name: 'Bakirkoy', code: 'BKR', isActive: false, courierLimit: 5, orderLimit: 100, deliveryFee: 20 },
    { id: 6, name: 'Fatih', code: 'FTH', isActive: true, courierLimit: 8, orderLimit: 160, deliveryFee: 14 },
    { id: 7, name: 'Atasehir', code: 'ATS', isActive: true, courierLimit: 6, orderLimit: 110, deliveryFee: 19 },
    { id: 8, name: 'Maltepe', code: 'MLT', isActive: true, courierLimit: 5, orderLimit: 90, deliveryFee: 22 },
  ])

  // SLA Settings
  const [sla, setSla] = useState({
    defaultDeliveryTime: 120,
    maxDeliveryTime: 240,
    warningThreshold: 80,
    criticalThreshold: 90,
    autoEscalate: true,
    escalateAfter: 30,
    penaltyEnabled: true,
    penaltyAmount: 50,
    bonusEnabled: true,
    bonusAmount: 30,
    bonusThreshold: 95,
    minSuccessRate: 90,
    maxRetryAttempts: 3,
    retryInterval: 60,
  })

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailOrderNew: true,
    emailOrderCancel: true,
    emailDeliveryFail: true,
    emailSlaWarning: true,
    emailDailyReport: true,
    emailWeeklyReport: true,
    smsOrderUpdate: false,
    smsCourierAssign: true,
    smsDeliveryComplete: true,
    pushOrderNew: true,
    pushSlaAlert: true,
    pushCourierOffline: true,
    webhookEnabled: false,
    webhookUrl: '',
    webhookSecret: '',
    dailyReportTime: '09:00',
    weeklyReportDay: 'monday',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateCompany = (field, value) => setCompany(prev => ({ ...prev, [field]: value }))
  const updateSla = (field, value) => setSla(prev => ({ ...prev, [field]: value }))
  const updateNotifications = (field, value) => setNotifications(prev => ({ ...prev, [field]: value }))

  const toggleRegion = (id) => {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))
  }

  const tabs = [
    { id: 'company', label: 'Sirket Bilgileri', icon: Building2 },
    { id: 'regions', label: 'Bolge Ayarlari', icon: MapPin },
    { id: 'sla', label: 'SLA Ayarlari', icon: Clock },
    { id: 'notifications', label: 'Bildirim Ayarlari', icon: Bell },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ayarlar</h1>
          <p className="text-sm text-slate-500 mt-1">Sistem ve isletme ayarlarini yonetin</p>
        </div>
        <div className="flex gap-2">
          {saved && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
              <CheckCircle size={16} /> Kaydedildi
            </div>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Save size={16} /> Kaydet
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-0">
          {tabs.map(tab => {
            const TabIcon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                <TabIcon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Company Tab */}
      {activeTab === 'company' && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-slate-500" /> Sirket Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sirket Adi</label>
                <input type="text" value={company.name} onChange={(e) => updateCompany('name', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vergi No</label>
                <input type="text" value={company.taxId} onChange={(e) => updateCompany('taxId', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vergi Dairesi</label>
                <input type="text" value={company.taxOffice} onChange={(e) => updateCompany('taxOffice', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={company.phone} onChange={(e) => updateCompany('phone', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={company.email} onChange={(e) => updateCompany('email', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="url" value={company.website} onChange={(e) => updateCompany('website', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Adres</label>
                <textarea value={company.address} onChange={(e) => updateCompany('address', e.target.value)} rows={2}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Il</label>
                <input type="text" value={company.city} onChange={(e) => updateCompany('city', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ilce</label>
                <input type="text" value={company.district} onChange={(e) => updateCompany('district', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regions Tab */}
      {activeTab === 'regions' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">{regions.filter(r => r.isActive).length} aktif bolge</p>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg cursor-pointer transition-colors">
              <Plus size={14} /> Bolge Ekle
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Bolge</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Kod</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Kurye Limiti</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Siparis Limiti</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Teslimat Ucreti</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Islem</th>
                </tr>
              </thead>
              <tbody>
                {regions.map(region => (
                  <tr key={region.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-800">{region.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{region.code}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleRegion(region.id)} className="cursor-pointer">
                        {region.isActive ? (
                          <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">Aktif</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">Pasif</span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{region.courierLimit}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{region.orderLimit}</td>
                    <td className="px-4 py-3 text-right text-slate-700 font-medium">{region.deliveryFee} TL</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button className="p-1.5 hover:bg-slate-100 rounded cursor-pointer">
                          <Edit2 size={14} className="text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded cursor-pointer">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SLA Tab */}
      {activeTab === 'sla' && (
        <div className="max-w-3xl space-y-6">
          {/* Delivery Time */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-slate-500" /> Teslimat Sureleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Varsayilan Teslimat Suresi (dk)</label>
                <input type="number" value={sla.defaultDeliveryTime} onChange={(e) => updateSla('defaultDeliveryTime', parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Maksimum Teslimat Suresi (dk)</label>
                <input type="number" value={sla.maxDeliveryTime} onChange={(e) => updateSla('maxDeliveryTime', parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Uyari Esigi (%)</label>
                <input type="number" value={sla.warningThreshold} onChange={(e) => updateSla('warningThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <p className="text-xs text-slate-400 mt-1">SLA suresinin bu %si gectiginde uyari</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kritik Esik (%)</label>
                <input type="number" value={sla.criticalThreshold} onChange={(e) => updateSla('criticalThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Escalation */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-slate-500" /> Eskalasyon ve Yeniden Deneme
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-700">Otomatik Eskalasyon</span>
                  <p className="text-xs text-slate-400">SLA asildiginda otomatik eskalasyon</p>
                </div>
                <div className="relative">
                  <input type="checkbox" checked={sla.autoEscalate} onChange={(e) => updateSla('autoEscalate', e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                </div>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Eskalasyon Suresi (dk)</label>
                  <input type="number" value={sla.escalateAfter} onChange={(e) => updateSla('escalateAfter', parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Maks. Deneme Sayisi</label>
                  <input type="number" value={sla.maxRetryAttempts} onChange={(e) => updateSla('maxRetryAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Deneme Araligi (dk)</label>
                  <input type="number" value={sla.retryInterval} onChange={(e) => updateSla('retryInterval', parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Penalty & Bonus */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-slate-500" /> Ceza ve Bonus
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50/50 rounded-lg border border-red-100">
                  <label className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-red-700">Ceza Sistemi</span>
                    <div className="relative">
                      <input type="checkbox" checked={sla.penaltyEnabled} onChange={(e) => updateSla('penaltyEnabled', e.target.checked)} className="sr-only peer" />
                      <div className="w-10 h-6 bg-slate-200 peer-checked:bg-red-500 rounded-full transition-colors cursor-pointer" />
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                    </div>
                  </label>
                  <div>
                    <label className="block text-xs text-red-600 mb-1">Ceza Tutari (TL)</label>
                    <input type="number" value={sla.penaltyAmount} onChange={(e) => updateSla('penaltyAmount', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                  </div>
                </div>
                <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
                  <label className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-700">Bonus Sistemi</span>
                    <div className="relative">
                      <input type="checkbox" checked={sla.bonusEnabled} onChange={(e) => updateSla('bonusEnabled', e.target.checked)} className="sr-only peer" />
                      <div className="w-10 h-6 bg-slate-200 peer-checked:bg-green-500 rounded-full transition-colors cursor-pointer" />
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                    </div>
                  </label>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-green-600 mb-1">Bonus Tutari (TL)</label>
                      <input type="number" value={sla.bonusAmount} onChange={(e) => updateSla('bonusAmount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" />
                    </div>
                    <div>
                      <label className="block text-xs text-green-600 mb-1">Bonus Esigi (%)</label>
                      <input type="number" value={sla.bonusThreshold} onChange={(e) => updateSla('bonusThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Minimum Basari Orani (%)</label>
                <input type="number" value={sla.minSuccessRate} onChange={(e) => updateSla('minSuccessRate', parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <p className="text-xs text-slate-400 mt-1">Bu oranin altina dusen kuryeler otomatik uyari alir</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="max-w-3xl space-y-6">
          {/* Email Notifications */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Mail size={18} className="text-slate-500" /> E-posta Bildirimleri
            </h3>
            <div className="space-y-3">
              {[
                { key: 'emailOrderNew', label: 'Yeni Siparis', desc: 'Yeni siparis olusturuldiginda bildirim' },
                { key: 'emailOrderCancel', label: 'Siparis Iptali', desc: 'Siparis iptal edildiginde bildirim' },
                { key: 'emailDeliveryFail', label: 'Basarisiz Teslimat', desc: 'Teslimat basarisiz oldugunda bildirim' },
                { key: 'emailSlaWarning', label: 'SLA Uyarisi', desc: 'SLA limiti yaklastiginda bildirim' },
                { key: 'emailDailyReport', label: 'Gunluk Rapor', desc: 'Her gun otomatik ozet rapor' },
                { key: 'emailWeeklyReport', label: 'Haftalik Rapor', desc: 'Her hafta detayli rapor' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={notifications[item.key]} onChange={(e) => updateNotifications(item.key, e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-slate-500" /> SMS Bildirimleri
            </h3>
            <div className="space-y-3">
              {[
                { key: 'smsOrderUpdate', label: 'Siparis Guncellemesi', desc: 'Musteri siparis durumu degistiginde SMS alir' },
                { key: 'smsCourierAssign', label: 'Kurye Atama', desc: 'Kuryeye siparis atandiginda SMS gider' },
                { key: 'smsDeliveryComplete', label: 'Teslimat Tamamlandi', desc: 'Teslimat tamamlandiginda musteri bilgilendirilir' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={notifications[item.key]} onChange={(e) => updateNotifications(item.key, e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Bell size={18} className="text-slate-500" /> Anlk Bildirimler
            </h3>
            <div className="space-y-3">
              {[
                { key: 'pushOrderNew', label: 'Yeni Siparis', desc: 'Anlik bildirim ile haberdar olun' },
                { key: 'pushSlaAlert', label: 'SLA Alarmi', desc: 'Kritik SLA uyarilari icin anlik bildirim' },
                { key: 'pushCourierOffline', label: 'Kurye Cevrimdisi', desc: 'Kurye uzun sure cevrimdisi olursa bildirim' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={notifications[item.key]} onChange={(e) => updateNotifications(item.key, e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Report Schedule */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Rapor Zamanlama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gunluk Rapor Saati</label>
                <input type="time" value={notifications.dailyReportTime} onChange={(e) => updateNotifications('dailyReportTime', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Haftalik Rapor Gunu</label>
                <select value={notifications.weeklyReportDay} onChange={(e) => updateNotifications('weeklyReportDay', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="monday">Pazartesi</option>
                  <option value="tuesday">Sali</option>
                  <option value="wednesday">Carsamba</option>
                  <option value="thursday">Persembe</option>
                  <option value="friday">Cuma</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
