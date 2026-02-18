import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Save, Package, User, MapPin, Clock,
  AlertTriangle, CreditCard, Banknote, Wallet, Zap, Check,
  Navigation, Search, Star, History, Crosshair
} from 'lucide-react'
import { formatCurrency } from '@/utils'

// Mock saved addresses keyed by phone number
const SAVED_ADDRESSES = {
  '05325551234': {
    name: 'Ahmet Yilmaz',
    addresses: [
      { id: 1, label: 'Ev', address: 'Kadikoy, Caferaga Mah. Moda Cad. No:15/3', detail: 'Kat 3, Daire 6', lat: 40.9862, lng: 29.0286 },
      { id: 2, label: 'Is', address: 'Levent, Buyukdere Cad. No:185 Kanyon AVM', detail: 'B Blok Kat 12', lat: 41.0791, lng: 29.0108 },
    ],
    lastPickup: { address: 'Kadikoy Carsi, Osmanaga Mah. Sogutlucesme Cad. No:8', detail: 'Depo giris', lat: 40.9904, lng: 29.0340 }
  },
  '05441234567': {
    name: 'Zeynep Demir',
    addresses: [
      { id: 3, label: 'Ev', address: 'Besiktas, Sinanpasa Mah. Ihlamur Cad. No:22', detail: 'Kat 5', lat: 41.0431, lng: 29.0007 },
      { id: 4, label: 'Anne', address: 'Uskudar, Altunizade Mah. Kisikli Cad. No:10', detail: '', lat: 41.0234, lng: 29.0398 },
    ],
    lastPickup: { address: 'Besiktas, Barbaros Bulvari No:74', detail: 'Zemin kat magaza', lat: 41.0480, lng: 29.0012 }
  },
  '05551112233': {
    name: 'Mehmet Kara',
    addresses: [
      { id: 5, label: 'Ev', address: 'Bakirkoy, Osmaniye Mah. Istasyon Cad. No:45', detail: 'A Blok Daire 3', lat: 40.9800, lng: 28.8720 },
    ],
    lastPickup: { address: 'Bakirkoy, Atakoy 5. Kisim, Plaza No:3', detail: 'Depo', lat: 40.9815, lng: 28.8550 }
  },
  '05339876543': {
    name: 'Ayse Ozturk',
    addresses: [
      { id: 6, label: 'Ev', address: 'Sariyer, Istinye Mah. Boyacikoy Cad. No:12', detail: 'Villa', lat: 41.1109, lng: 29.0582 },
      { id: 7, label: 'Is', address: 'Maslak, Ahi Evran Cad. No:6 Is Kuleleri', detail: 'Kule 2, Kat 18', lat: 41.1086, lng: 29.0203 },
      { id: 8, label: 'Yazlik', address: 'Sile, Cumhuriyet Mah. Sahil Yolu No:5', detail: '', lat: 41.1753, lng: 29.6125 },
    ],
    lastPickup: { address: 'Maslak, Buyukdere Cad. No:255', detail: 'Ana depo giris', lat: 41.1100, lng: 29.0195 }
  },
}

// Default pickup point (company HQ)
const DEFAULT_PICKUP = {
  address: 'Kadikoy, Osmanaga Mah. Sogutlucesme Cad. No:8',
  detail: 'HeyBringo Merkez Depo',
  lat: 40.9904,
  lng: 29.0340,
}

const PRODUCTS = [
  { sku: 'ELK-001', name: 'Elektronik Esya', price: 450 },
  { sku: 'GYM-002', name: 'Giyim Paketi', price: 180 },
  { sku: 'GDA-003', name: 'Gida Siparis', price: 95 },
  { sku: 'KZM-004', name: 'Kozmetik Urun', price: 320 },
  { sku: 'KRT-005', name: 'Kitap/Kirtasiye', price: 75 },
  { sku: 'TEK-006', name: 'Ev Tekstili', price: 260 },
  { sku: 'SPR-007', name: 'Spor Malzemesi', price: 540 },
  { sku: 'OYN-008', name: 'Oyuncak', price: 150 },
  { sku: 'AKS-009', name: 'Aksesuar', price: 110 },
  { sku: 'MTF-010', name: 'Mutfak Gereci', price: 200 },
]

const PROJECTS = [
  'Istanbul Ana Dagitim', 'Ankara Bolge', 'Izmir Sahil',
  'Express Teslimat', 'Gida Dagitim', 'E-Ticaret Lojistik'
]

const TIME_SLOTS = [
  '09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00', '18:00 - 21:00'
]

export default function OrderCreate() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    project: PROJECTS[0],
    priority: 'normal',
    customerName: '',
    customerPhone: '',
    // Pickup address
    pickupAddress: DEFAULT_PICKUP.address,
    pickupDetail: DEFAULT_PICKUP.detail,
    pickupLat: DEFAULT_PICKUP.lat,
    pickupLng: DEFAULT_PICKUP.lng,
    // Delivery address
    deliveryAddress: '',
    deliveryDetail: '',
    deliveryLat: null,
    deliveryLng: null,
    deliveryNote: '',
    paymentMethod: 'card',
    deliveryType: 'today',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliverySlot: TIME_SLOTS[1],
  })

  const [items, setItems] = useState([{ sku: '', name: '', quantity: 1, price: 0 }])
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [foundCustomer, setFoundCustomer] = useState(null)
  const [showPickupSaved, setShowPickupSaved] = useState(false)
  const [showDeliverySaved, setShowDeliverySaved] = useState(false)

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  // Search saved addresses when phone number changes
  const phoneDigits = form.customerPhone.replace(/\s/g, '')
  useEffect(() => {
    if (phoneDigits.length >= 7) {
      const match = Object.entries(SAVED_ADDRESSES).find(([key]) => key.includes(phoneDigits) || phoneDigits.includes(key))
      if (match) {
        const [, data] = match
        setFoundCustomer(data)
        if (!form.customerName) update('customerName', data.name)
        // Set last pickup point as default
        if (data.lastPickup) {
          setForm(prev => ({
            ...prev,
            pickupAddress: data.lastPickup.address,
            pickupDetail: data.lastPickup.detail,
            pickupLat: data.lastPickup.lat,
            pickupLng: data.lastPickup.lng,
          }))
        }
      } else {
        setFoundCustomer(null)
      }
    } else {
      setFoundCustomer(null)
    }
  }, [phoneDigits])

  const selectSavedAddress = useCallback((addr, type) => {
    if (type === 'pickup') {
      setForm(prev => ({ ...prev, pickupAddress: addr.address, pickupDetail: addr.detail || '', pickupLat: addr.lat, pickupLng: addr.lng }))
      setShowPickupSaved(false)
    } else {
      setForm(prev => ({ ...prev, deliveryAddress: addr.address, deliveryDetail: addr.detail || '', deliveryLat: addr.lat, deliveryLng: addr.lng }))
      setShowDeliverySaved(false)
    }
    if (errors.deliveryAddress) setErrors(prev => { const n = { ...prev }; delete n.deliveryAddress; return n })
  }, [errors])

  const simulateCoordinate = (type) => {
    // Simulate getting coordinates from a map click
    const lat = 40.95 + Math.random() * 0.2
    const lng = 28.85 + Math.random() * 0.3
    if (type === 'pickup') {
      setForm(prev => ({ ...prev, pickupLat: +lat.toFixed(4), pickupLng: +lng.toFixed(4) }))
    } else {
      setForm(prev => ({ ...prev, deliveryLat: +lat.toFixed(4), deliveryLng: +lng.toFixed(4) }))
    }
  }

  const addItem = () => setItems(prev => [...prev, { sku: '', name: '', quantity: 1, price: 0 }])

  const removeItem = (i) => {
    if (items.length === 1) return
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }

  const selectProduct = (index, sku) => {
    const p = PRODUCTS.find(pr => pr.sku === sku)
    if (p) setItems(prev => prev.map((item, i) => i === index ? { ...item, sku: p.sku, name: p.name, price: p.price } : item))
  }

  const updateQty = (index, qty) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(1, qty) } : item))
  }

  const total = items.reduce((s, it) => s + it.price * it.quantity, 0)

  const validate = () => {
    const e = {}
    if (!form.customerName.trim()) e.customerName = true
    if (!form.customerPhone.trim()) e.customerPhone = true
    if (!form.pickupAddress.trim()) e.pickupAddress = true
    if (!form.deliveryAddress.trim()) e.deliveryAddress = true
    if (!items.some(it => it.name)) e.items = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setSaved(true)
    setTimeout(() => navigate('/orders'), 1500)
  }

  const handleSaveAndNew = () => {
    if (!validate()) return
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setForm(prev => ({
        ...prev, customerName: '', customerPhone: '',
        pickupAddress: DEFAULT_PICKUP.address, pickupDetail: DEFAULT_PICKUP.detail, pickupLat: DEFAULT_PICKUP.lat, pickupLng: DEFAULT_PICKUP.lng,
        deliveryAddress: '', deliveryDetail: '', deliveryLat: null, deliveryLng: null, deliveryNote: ''
      }))
      setFoundCustomer(null)
      setItems([{ sku: '', name: '', quantity: 1, price: 0 }])
    }, 1000)
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Siparis Olusturuldu!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Siparisler sayfasina yonlendiriliyorsunuz...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Yeni Siparis</h1>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">

        {/* 1. Project & Priority - single row */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Proje</label>
              <select
                value={form.project}
                onChange={(e) => update('project', e.target.value)}
                className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Oncelik</label>
              <div className="flex gap-1.5 mt-1.5">
                {[
                  { v: 'normal', l: 'Normal', c: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400', ac: 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300' },
                  { v: 'high', l: 'Yuksek', c: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400', ac: 'bg-orange-50 dark:bg-orange-900/30 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-300' },
                  { v: 'urgent', l: 'Acil', c: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400', ac: 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300' },
                ].map(p => (
                  <button
                    key={p.v}
                    type="button"
                    onClick={() => update('priority', p.v)}
                    className={`flex-1 py-2.5 border rounded-lg text-xs font-medium cursor-pointer transition-all ${form.priority === p.v ? p.ac : p.c}`}
                  >
                    {p.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Customer */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Musteri</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => update('customerName', e.target.value)}
                placeholder="Ad Soyad *"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${errors.customerName ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}
              />
            </div>
            <div>
              <input
                type="text"
                value={form.customerPhone}
                onChange={(e) => update('customerPhone', e.target.value)}
                placeholder="Telefon *  0532 555 12 34"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${errors.customerPhone ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}
              />
            </div>
          </div>
        </div>

        {/* 3. Addresses - Pickup & Delivery */}
        <div className="grid grid-cols-2 gap-5">

          {/* Pickup Address */}
          <div className={`bg-white dark:bg-slate-900 rounded-xl border p-5 ${errors.pickupAddress ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alis Noktasi</span>
              </div>
              {foundCustomer && (
                <button
                  type="button"
                  onClick={() => setShowPickupSaved(!showPickupSaved)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                >
                  <History size={12} /> Kayitli Adresler
                </button>
              )}
            </div>

            {/* Saved pickup addresses dropdown */}
            {showPickupSaved && foundCustomer && (
              <div className="mb-3 space-y-1.5">
                {foundCustomer.lastPickup && (
                  <button
                    type="button"
                    onClick={() => selectSavedAddress(foundCustomer.lastPickup, 'pickup')}
                    className="w-full text-left p-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Star size={11} className="text-emerald-600 fill-emerald-600" />
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Son Alis Noktasi</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{foundCustomer.lastPickup.address}</p>
                  </button>
                )}
                {foundCustomer.addresses.map(addr => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectSavedAddress(addr, 'pickup')}
                    className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{addr.label}</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{addr.address}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2.5">
              <input
                type="text"
                value={form.pickupAddress}
                onChange={(e) => update('pickupAddress', e.target.value)}
                placeholder="Alis adresi *"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${errors.pickupAddress ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}
              />
              <input
                type="text"
                value={form.pickupDetail}
                onChange={(e) => update('pickupDetail', e.target.value)}
                placeholder="Bina, kat detayi (opsiyonel)"
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {/* Coordinate display & capture */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => simulateCoordinate('pickup')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <Crosshair size={13} className="text-emerald-500" /> Koordinat Al
                </button>
                {form.pickupLat && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {form.pickupLat}, {form.pickupLng}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className={`bg-white dark:bg-slate-900 rounded-xl border p-5 ${errors.deliveryAddress ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Teslimat Adresi</span>
              </div>
              {foundCustomer && (
                <button
                  type="button"
                  onClick={() => setShowDeliverySaved(!showDeliverySaved)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                >
                  <Search size={12} /> Kayitli Adresler
                </button>
              )}
            </div>

            {/* Saved delivery addresses dropdown */}
            {showDeliverySaved && foundCustomer && (
              <div className="mb-3 space-y-1.5">
                {foundCustomer.addresses.map(addr => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectSavedAddress(addr, 'delivery')}
                    className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{addr.label}</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{addr.address}</p>
                    {addr.detail && <p className="text-[11px] text-slate-400">{addr.detail}</p>}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2.5">
              <input
                type="text"
                value={form.deliveryAddress}
                onChange={(e) => update('deliveryAddress', e.target.value)}
                placeholder="Teslimat adresi *"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 ${errors.deliveryAddress ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}
              />
              <input
                type="text"
                value={form.deliveryDetail}
                onChange={(e) => update('deliveryDetail', e.target.value)}
                placeholder="Bina, kat, daire (opsiyonel)"
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                value={form.deliveryNote}
                onChange={(e) => update('deliveryNote', e.target.value)}
                placeholder="Teslimat notu (opsiyonel)"
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {/* Coordinate display & capture */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => simulateCoordinate('delivery')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <Crosshair size={13} className="text-red-500" /> Koordinat Al
                </button>
                {form.deliveryLat && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {form.deliveryLat}, {form.deliveryLng}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mini Map showing both points */}
        {(form.pickupLat || form.deliveryLat) && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Harita Onizleme</span>
              </div>
              {form.pickupLat && form.deliveryLat && (
                <span className="text-[11px] text-slate-400">
                  ~{(Math.sqrt(Math.pow((form.deliveryLat - form.pickupLat) * 111, 2) + Math.pow((form.deliveryLng - form.pickupLng) * 85, 2))).toFixed(1)} km mesafe
                </span>
              )}
            </div>
            <div
              className="relative h-48 bg-slate-100 dark:bg-slate-800 cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width
                const y = (e.clientY - rect.top) / rect.height
                // Map click area to Istanbul coordinate range
                const lat = 41.2 - y * 0.35
                const lng = 28.7 + x * 0.6
                // Set delivery coordinate if no delivery yet, otherwise update delivery
                if (!form.deliveryLat) {
                  setForm(prev => ({ ...prev, deliveryLat: +lat.toFixed(4), deliveryLng: +lng.toFixed(4) }))
                } else {
                  setForm(prev => ({ ...prev, deliveryLat: +lat.toFixed(4), deliveryLng: +lng.toFixed(4) }))
                }
              }}
            >
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
                {[...Array(10)].map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
                ))}
                {[...Array(14)].map((_, i) => (
                  <line key={`v${i}`} x1={`${(i + 1) * 7.14}%`} y1="0" x2={`${(i + 1) * 7.14}%`} y2="100%" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
                ))}
              </svg>

              {/* Simulated road lines */}
              <svg className="absolute inset-0 w-full h-full opacity-15 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,60 Q120,40 200,55 T400,45 T600,65 T800,50" fill="none" stroke="#94a3b8" strokeWidth="2" />
                <path d="M50,0 Q60,80 80,120 T90,200" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M200,0 Q210,50 190,100 T220,200" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M0,120 Q150,130 300,110 T600,130" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              </svg>

              {/* Dashed route line between points */}
              {form.pickupLat && form.deliveryLat && (() => {
                const pxP = ((form.pickupLng - 28.7) / 0.6) * 100
                const pyP = ((41.2 - form.pickupLat) / 0.35) * 100
                const pxD = ((form.deliveryLng - 28.7) / 0.6) * 100
                const pyD = ((41.2 - form.deliveryLat) / 0.35) * 100
                return (
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line
                      x1={`${pxP}%`} y1={`${pyP}%`}
                      x2={`${pxD}%`} y2={`${pyD}%`}
                      stroke="#6366f1" strokeWidth="2" strokeDasharray="6,4" opacity="0.7"
                    />
                  </svg>
                )
              })()}

              {/* Pickup marker */}
              {form.pickupLat && (() => {
                const px = ((form.pickupLng - 28.7) / 0.6) * 100
                const py = ((41.2 - form.pickupLat) / 0.35) * 100
                return (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-10"
                    style={{ left: `${px}%`, top: `${py}%` }}
                  >
                    <div className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md mb-1 whitespace-nowrap shadow-lg">
                      Alis
                    </div>
                    <div className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg" />
                  </div>
                )
              })()}

              {/* Delivery marker */}
              {form.deliveryLat && (() => {
                const px = ((form.deliveryLng - 28.7) / 0.6) * 100
                const py = ((41.2 - form.deliveryLat) / 0.35) * 100
                return (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-10"
                    style={{ left: `${px}%`, top: `${py}%` }}
                  >
                    <div className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md mb-1 whitespace-nowrap shadow-lg">
                      Teslimat
                    </div>
                    <div className="w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-lg" />
                  </div>
                )
              })()}

              {/* Click hint */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                <span className="text-[10px] text-white/80">Haritaya tiklayarak teslimat noktasi secin</span>
              </div>
            </div>
          </div>
        )}

        {/* Phone match info */}
        {foundCustomer && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <Check size={14} className="text-emerald-600" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400">
              <strong>{foundCustomer.name}</strong> - {foundCustomer.addresses.length} kayitli adres bulundu
            </span>
          </div>
        )}

        {/* 4. Products */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Urunler</span>
            </div>
            <button type="button" onClick={addItem} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg cursor-pointer">
              <Plus size={14} /> Ekle
            </button>
          </div>

          {errors.items && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg">
              <AlertTriangle size={14} /> En az bir urun secin
            </div>
          )}

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={item.sku}
                  onChange={(e) => selectProduct(i, e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Urun secin...</option>
                  {PRODUCTS.map(p => (
                    <option key={p.sku} value={p.sku}>{p.name} - {formatCurrency(p.price)}</option>
                  ))}
                </select>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateQty(i, item.quantity - 1)}
                    className="px-2.5 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm"
                  >-</button>
                  <span className="w-8 text-center text-sm font-medium text-slate-800 dark:text-slate-200">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(i, item.quantity + 1)}
                    className="px-2.5 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm"
                  >+</button>
                </div>
                <span className="w-24 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.price > 0 ? formatCurrency(item.price * item.quantity) : '-'}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  className="p-2 text-slate-300 hover:text-red-500 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {total > 0 && (
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam</span>
              <span className="text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(total)}</span>
            </div>
          )}
        </div>

        {/* 5. Delivery & Payment - compact */}
        <div className="grid grid-cols-2 gap-5">
          {/* Delivery */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Teslimat</span>
            </div>
            <div className="space-y-2">
              {[
                { v: 'express', l: 'Hemen (Express)', icon: Zap, desc: 'En hizli kurye atanir' },
                { v: 'today', l: 'Bugun', icon: Clock, desc: 'Zaman dilimi sec' },
                { v: 'scheduled', l: 'Tarih Sec', icon: Clock, desc: 'Ileri tarih' },
              ].map(opt => (
                <label
                  key={opt.v}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    form.deliveryType === opt.v
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    value={opt.v}
                    checked={form.deliveryType === opt.v}
                    onChange={() => update('deliveryType', opt.v)}
                    className="accent-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{opt.l}</span>
                    <p className="text-[11px] text-slate-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {form.deliveryType === 'today' && (
              <div className="mt-3">
                <select
                  value={form.deliverySlot}
                  onChange={(e) => update('deliverySlot', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {form.deliveryType === 'scheduled' && (
              <div className="mt-3">
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(e) => update('deliveryDate', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={form.deliverySlot}
                  onChange={(e) => update('deliverySlot', e.target.value)}
                  className="w-full mt-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Odeme</span>
            </div>
            <div className="space-y-2">
              {[
                { v: 'card', l: 'Kredi Karti', icon: CreditCard },
                { v: 'cash', l: 'Kapida Nakit', icon: Banknote },
                { v: 'paid', l: 'Odenmi\u015F', icon: Check },
              ].map(opt => (
                <label
                  key={opt.v}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    form.paymentMethod === opt.v
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.v}
                    checked={form.paymentMethod === opt.v}
                    onChange={() => update('paymentMethod', opt.v)}
                    className="accent-primary"
                  />
                  <opt.icon size={16} className={form.paymentMethod === opt.v ? 'text-primary' : 'text-slate-400'} />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{opt.l}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div>
            {total > 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Toplam: <span className="text-lg font-bold text-slate-800 dark:text-white ml-1">{formatCurrency(total)}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Iptal
            </button>
            <button
              onClick={handleSaveAndNew}
              className="px-5 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 cursor-pointer"
            >
              Kaydet + Yeni
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
            >
              <Save size={16} /> Siparis Olustur
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
