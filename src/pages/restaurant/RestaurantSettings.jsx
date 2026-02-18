import { useState } from 'react'
import {
  Settings, Store, Truck, Bell, Link, Copy, Check, Save, Send,
  GripVertical
} from 'lucide-react'

// ---- Mock Data ----

const DAYS = [
  { key: 'mon', label: 'Pazartesi' },
  { key: 'tue', label: 'Sali' },
  { key: 'wed', label: 'Carsamba' },
  { key: 'thu', label: 'Persembe' },
  { key: 'fri', label: 'Cuma' },
  { key: 'sat', label: 'Cumartesi' },
  { key: 'sun', label: 'Pazar' },
]

const DEFAULT_HOURS = {
  mon: { start: '09:00', end: '22:00' },
  tue: { start: '09:00', end: '22:00' },
  wed: { start: '09:00', end: '22:00' },
  thu: { start: '09:00', end: '22:00' },
  fri: { start: '09:00', end: '23:00' },
  sat: { start: '10:00', end: '23:00' },
  sun: { start: '10:00', end: '21:00' },
}

const INTEGRATIONS = [
  { id: 'yemeksepeti', name: 'Yemeksepeti', connected: true },
  { id: 'getir', name: 'Getir Yemek', connected: true },
  { id: 'trendyol', name: 'Trendyol Yemek', connected: false },
]

const TABS = [
  { id: 'genel', label: 'Genel', icon: Store },
  { id: 'havuz', label: 'Havuz', icon: Truck },
  { id: 'kuryeler', label: 'Kuryeler', icon: Truck },
  { id: 'bildirimler', label: 'Bildirimler', icon: Bell },
  { id: 'entegrasyonlar', label: 'Entegrasyonlar', icon: Link },
]

// ---- Component ----

export default function RestaurantSettings() {
  const [activeTab, setActiveTab] = useState('genel')
  const [saved, setSaved] = useState(false)

  // Genel
  const [genel, setGenel] = useState({
    name: 'Lezzet Cafe',
    phone: '0216 555 12 34',
    address: 'Caferaga Mah. Moda Cad. No:12 Kadikoy/Istanbul',
  })
  const [hours, setHours] = useState(DEFAULT_HOURS)

  // Havuz
  const [havuz, setHavuz] = useState({
    allCouriersBusy: true,
    regionFar: true,
    regionFarKm: 5,
    specificHours: false,
    specificHoursStart: '12:00',
    specificHoursEnd: '14:00',
    maxCost: 50,
  })
  const [partnerOrder, setPartnerOrder] = useState([
    { id: 1, name: 'Bringo' },
    { id: 2, name: 'Trendyol Go' },
    { id: 3, name: 'Paket Taxi' },
  ])

  // Kuryeler
  const [kuryeler, setKuryeler] = useState({
    maxOrdersPerCourier: 5,
    autoAssign: true,
    invitePhone: '',
  })

  // Bildirimler
  const [bildirimler, setBildirimler] = useState({
    newOrder: true,
    courierOffline: true,
    slaWarning: true,
    dailyCostReport: false,
    deliveryComplete: true,
    channelEmail: true,
    channelSms: false,
    channelPush: true,
  })

  // Entegrasyonlar
  const [apiKeyCopied, setApiKeyCopied] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('brn_rest_xxxxxxxx')
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
  }

  const updateGenel = (field, value) => setGenel((prev) => ({ ...prev, [field]: value }))
  const updateHavuz = (field, value) => setHavuz((prev) => ({ ...prev, [field]: value }))
  const updateKuryeler = (field, value) => setKuryeler((prev) => ({ ...prev, [field]: value }))
  const updateBildirimler = (field, value) => setBildirimler((prev) => ({ ...prev, [field]: value }))

  const updateHour = (day, type, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }))
  }

  // ---- Render ----

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Restoran Ayarlari</h1>
          <p className="text-sm text-slate-500 mt-1">Restoran yapilandirma ve tercihlerinizi yonetin</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
            <Check size={16} /> Kaydedildi
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ===================== GENEL TAB ===================== */}
      {activeTab === 'genel' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Store size={18} className="text-slate-500" /> Genel Bilgiler
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Restoran Adi</label>
                <input
                  type="text"
                  value={genel.name}
                  onChange={(e) => updateGenel('name', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
                <input
                  type="text"
                  value={genel.phone}
                  onChange={(e) => updateGenel('phone', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Adres</label>
                <textarea
                  value={genel.address}
                  onChange={(e) => updateGenel('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Calisma Saatleri */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <Settings size={18} className="text-slate-500" /> Calisma Saatleri
            </h3>
            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day.key} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700 w-28">{day.label}</span>
                  <input
                    type="time"
                    value={hours[day.key].start}
                    onChange={(e) => updateHour(day.key, 'start', e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  />
                  <span className="text-slate-400 text-sm">-</span>
                  <input
                    type="time"
                    value={hours[day.key].end}
                    onChange={(e) => updateHour(day.key, 'end', e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Save size={16} /> Kaydet
            </button>
          </div>
        </div>
      )}

      {/* ===================== HAVUZ TAB ===================== */}
      {activeTab === 'havuz' && (
        <div className="max-w-3xl space-y-6">
          {/* Otomatik Havuz Kurallari */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-5">Otomatik havuza at:</h3>
            <div className="space-y-4">
              {/* Tum kuryeler doluysa */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={havuz.allCouriersBusy}
                  onChange={(e) => updateHavuz('allCouriersBusy', e.target.checked)}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm text-slate-700">Tum kuryeler doluysa</span>
              </label>

              {/* Bolge cok uzaksa */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={havuz.regionFar}
                  onChange={(e) => updateHavuz('regionFar', e.target.checked)}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm text-slate-700">Bolge cok uzaksa ({'>'}</span>
                <input
                  type="number"
                  value={havuz.regionFarKm}
                  onChange={(e) => updateHavuz('regionFarKm', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-sm text-slate-700">km)</span>
              </div>

              {/* Belirli saatlerde */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={havuz.specificHours}
                  onChange={(e) => updateHavuz('specificHours', e.target.checked)}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm text-slate-700">Belirli saatlerde</span>
                <input
                  type="time"
                  value={havuz.specificHoursStart}
                  onChange={(e) => updateHavuz('specificHoursStart', e.target.value)}
                  disabled={!havuz.specificHours}
                  className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer disabled:opacity-50"
                />
                <span className="text-slate-400 text-sm">-</span>
                <input
                  type="time"
                  value={havuz.specificHoursEnd}
                  onChange={(e) => updateHavuz('specificHoursEnd', e.target.value)}
                  disabled={!havuz.specificHours}
                  className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Tercih Edilen Partner Sirasi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-5">Tercih edilen partner sirasi:</h3>
            <div className="space-y-2">
              {partnerOrder.map((partner, index) => (
                <div
                  key={partner.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <GripVertical size={16} className="text-slate-400 cursor-grab" />
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maksimum Havuz Maliyeti */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Maksimum havuz maliyeti:</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">&#8378;</span>
              <input
                type="number"
                value={havuz.maxCost}
                onChange={(e) => updateHavuz('maxCost', parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-sm text-slate-500">/ siparis</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Save size={16} /> Kaydet
            </button>
          </div>
        </div>
      )}

      {/* ===================== KURYELER TAB ===================== */}
      {activeTab === 'kuryeler' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Truck size={18} className="text-slate-500" /> Kurye Ayarlari
            </h3>
            <div className="space-y-6">
              {/* Max siparis / kurye */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Max siparis / kurye
                </label>
                <input
                  type="number"
                  value={kuryeler.maxOrdersPerCourier}
                  onChange={(e) => updateKuryeler('maxOrdersPerCourier', parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Otomatik atama toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-700">Otomatik atama</span>
                  <p className="text-xs text-slate-400 mt-0.5">Siparisleri kuryeye otomatik ata</p>
                </div>
                <label className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kuryeler.autoAssign}
                    onChange={(e) => updateKuryeler('autoAssign', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                </label>
              </div>
            </div>
          </div>

          {/* Kurye Uygulamasi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-2">Kurye uygulamasi</h3>
            <p className="text-sm text-slate-500 mb-4">SMS ile kurye davet linki gonder</p>
            <div className="flex items-center gap-3">
              <input
                type="tel"
                value={kuryeler.invitePhone}
                onChange={(e) => updateKuryeler('invitePhone', e.target.value)}
                placeholder="0 5XX XXX XX XX"
                className="flex-1 max-w-xs px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
              />
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                <Send size={16} /> Gonder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== BILDIRIMLER TAB ===================== */}
      {activeTab === 'bildirimler' && (
        <div className="max-w-3xl space-y-6">
          {/* Bildirim Tercihleri */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <Bell size={18} className="text-slate-500" /> Bildirim Tercihleri
            </h3>
            <div className="space-y-3">
              {[
                { key: 'newOrder', label: 'Yeni siparis bildirimi', checked: true },
                { key: 'courierOffline', label: 'Kurye offline bildirimi', checked: true },
                { key: 'slaWarning', label: 'SLA uyarisi', checked: true },
                { key: 'dailyCostReport', label: 'Havuz maliyet raporu (gunluk)', checked: false },
                { key: 'deliveryComplete', label: 'Teslimat tamamlandi', checked: true },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={bildirimler[item.key]}
                    onChange={(e) => updateBildirimler(item.key, e.target.checked)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bildirim Kanallari */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-5">Bildirim kanallari</h3>
            <div className="space-y-4">
              {[
                { key: 'channelEmail', label: 'Email' },
                { key: 'channelSms', label: 'SMS' },
                { key: 'channelPush', label: 'Push' },
              ].map((ch) => (
                <div key={ch.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-medium text-slate-700">{ch.label}</span>
                  <label className="relative cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bildirimler[ch.key]}
                      onChange={(e) => updateBildirimler(ch.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-checked:bg-primary rounded-full transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== ENTEGRASYONLAR TAB ===================== */}
      {activeTab === 'entegrasyonlar' && (
        <div className="max-w-3xl space-y-6">
          {/* Platform Baglantilari */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <Link size={18} className="text-slate-500" /> Platform Baglantilari
            </h3>
            <div className="space-y-3">
              {INTEGRATIONS.map((platform) => (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        platform.connected ? 'bg-green-500' : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-sm font-medium text-slate-800">{platform.name}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        platform.connected
                          ? 'bg-green-50 text-green-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {platform.connected ? 'Bagli' : 'Bagli Degil'}
                    </span>
                  </div>
                  <button
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      platform.connected
                        ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {platform.connected ? 'Ayarlar' : 'Baglan'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">API Anahtari</h3>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600">
                brn_rest_xxxxxxxx
              </code>
              <button
                onClick={handleCopyApiKey}
                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {apiKeyCopied ? (
                  <>
                    <Check size={16} className="text-green-500" /> Kopyalandi
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Kopyala
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Webhook URL */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Webhook URL</h3>
            <code className="block px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 break-all">
              https://api.heybringo.com/webhooks/restaurant/lezzet-cafe
            </code>
            <p className="text-xs text-slate-400 mt-2">
              Bu URL uzerinden siparis ve teslimat bildirimlerini alabilirsiniz.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
