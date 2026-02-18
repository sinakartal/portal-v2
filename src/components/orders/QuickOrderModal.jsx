import { useState, useEffect, useRef } from 'react'
import {
  X,
  Search,
  Phone,
  MapPin,
  Clock,
  Package,
  CreditCard,
  Banknote,
  Star,
  AlertTriangle,
  User,
  ChevronDown,
  Zap,
  Calendar,
  Plus,
} from 'lucide-react'

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: 'Ayşe Yılmaz',
    phone: '0532 412 78 90',
    district: 'Kadıköy',
    vip: true,
    orderCount: 47,
    avgSpend: 285,
    lastOrder: '2026-02-11',
    paymentPref: 'Kart',
    notes: 'Kapıda beklemeyin, zili çalın.',
    addresses: [
      { label: 'Ev', full: 'Moda Caddesi No:12/4, Caferağa, Kadıköy/İstanbul', detail: 'Bina: 12, Kat: 4' },
      { label: 'İş', full: 'Bağdat Caddesi No:200, Suadiye, Kadıköy/İstanbul', detail: 'Plaza B Blok, Kat: 7' },
    ],
  },
  {
    id: 2,
    name: 'Mehmet Kaya',
    phone: '0545 678 34 12',
    district: 'Beşiktaş',
    vip: false,
    orderCount: 12,
    avgSpend: 150,
    lastOrder: '2026-02-08',
    paymentPref: 'Kapıda Nakit',
    notes: '',
    addresses: [
      { label: 'Ev', full: 'Barbaros Bulvarı No:45/2, Beşiktaş/İstanbul', detail: 'Kat: 2, Daire: 5' },
    ],
  },
  {
    id: 3,
    name: 'Zeynep Demir',
    phone: '0533 901 22 55',
    district: 'Şişli',
    vip: true,
    orderCount: 31,
    avgSpend: 420,
    lastOrder: '2026-02-12',
    paymentPref: 'Ödenmiş',
    notes: 'Hassas ürünlere dikkat.',
    addresses: [
      { label: 'Ev', full: 'Halaskargazi Caddesi No:88, Osmanbey, Şişli/İstanbul', detail: 'Kat: 3, Daire: 9' },
    ],
  },
  {
    id: 4,
    name: 'Ali Öztürk',
    phone: '0542 333 11 77',
    district: 'Üsküdar',
    vip: false,
    orderCount: 5,
    avgSpend: 95,
    lastOrder: '2026-01-29',
    paymentPref: 'Kart',
    notes: '',
    addresses: [
      { label: 'Ev', full: 'Selimiye Caddesi No:7, Üsküdar/İstanbul', detail: 'Kat: 1' },
    ],
  },
  {
    id: 5,
    name: 'Fatma Çelik',
    phone: '0535 888 44 60',
    district: 'Kadıköy',
    vip: false,
    orderCount: 19,
    avgSpend: 210,
    lastOrder: '2026-02-10',
    paymentPref: 'Kapıda Nakit',
    notes: 'Bahçe kapısından girin.',
    addresses: [
      { label: 'Ev', full: 'Bahariye Caddesi No:56/1, Kadıköy/İstanbul', detail: 'Giriş kat' },
      { label: 'Diğer', full: 'Fenerbahçe Mahallesi, Münir Nurettin Sk. No:3, Kadıköy/İstanbul', detail: 'Kat: 5, Daire: 10' },
    ],
  },
]

const ADDRESS_SUGGESTIONS = [
  'Moda Caddesi, Caferağa, Kadıköy/İstanbul',
  'Bağdat Caddesi, Suadiye, Kadıköy/İstanbul',
  'Barbaros Bulvarı, Beşiktaş/İstanbul',
  'Halaskargazi Caddesi, Osmanbey, Şişli/İstanbul',
  'Selimiye Caddesi, Üsküdar/İstanbul',
  'Bahariye Caddesi, Kadıköy/İstanbul',
  'İstiklal Caddesi, Beyoğlu/İstanbul',
  'Nişantaşı, Abdi İpekçi Caddesi, Şişli/İstanbul',
  'Acıbadem Caddesi, Acıbadem, Kadıköy/İstanbul',
  'Altunizade Mahallesi, Üsküdar/İstanbul',
]

const PROJECTS = ['File Market', 'Express Teslimat', 'Gıda Dağıtım', 'E-Ticaret Lojistik']
const BRANCHES = ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar']
const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatPhoneDisplay(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.length <= 4) return digits
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
  if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`
}

function stripPhone(val) {
  return val.replace(/\D/g, '')
}

// ── Component ────────────────────────────────────────────────────────────────
export default function QuickOrderModal({ isOpen, onClose, onSave }) {
  // Form state
  const [project, setProject] = useState(PROJECTS[0])
  const [branch, setBranch] = useState(BRANCHES[0])
  const [phoneInput, setPhoneInput] = useState('')
  const [customerResults, setCustomerResults] = useState([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [address, setAddress] = useState('')
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [addressDetail, setAddressDetail] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [externalRef, setExternalRef] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [deliveryType, setDeliveryType] = useState('express')
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0])
  const [selectedDate, setSelectedDate] = useState('')
  const [priority, setPriority] = useState('normal')

  const phoneRef = useRef(null)
  const customerDropdownRef = useRef(null)
  const addressDropdownRef = useRef(null)

  // Focus phone on open
  useEffect(() => {
    if (isOpen && phoneRef.current) {
      setTimeout(() => phoneRef.current.focus(), 150)
    }
  }, [isOpen])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setShowCustomerDropdown(false)
      }
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(e.target)) {
        setShowAddressSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keyboard: Escape to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // ── Phone search ─────────────────────────────────────────────────────────
  function handlePhoneChange(e) {
    const raw = stripPhone(e.target.value)
    if (raw.length > 11) return
    const formatted = formatPhoneDisplay(raw)
    setPhoneInput(formatted)

    if (raw.length >= 7) {
      const matches = MOCK_CUSTOMERS.filter((c) => stripPhone(c.phone).includes(raw))
      setCustomerResults(matches)
      setShowCustomerDropdown(true)
    } else {
      setCustomerResults([])
      setShowCustomerDropdown(false)
    }
  }

  function handleSearchClick() {
    const raw = stripPhone(phoneInput)
    if (raw.length >= 4) {
      const matches = MOCK_CUSTOMERS.filter((c) => stripPhone(c.phone).includes(raw))
      setCustomerResults(matches)
      setShowCustomerDropdown(true)
    }
  }

  function selectCustomer(customer) {
    setSelectedCustomer(customer)
    setCustomerName(customer.name)
    setPhoneInput(customer.phone)
    setShowCustomerDropdown(false)
    if (customer.addresses.length > 0) {
      setAddress(customer.addresses[0].full)
      setAddressDetail(customer.addresses[0].detail)
    }
  }

  function handleNewCustomer() {
    setSelectedCustomer(null)
    setCustomerName('')
    setShowCustomerDropdown(false)
  }

  // ── Address search ───────────────────────────────────────────────────────
  function handleAddressChange(e) {
    const val = e.target.value
    setAddress(val)
    if (val.length >= 2) {
      const filtered = ADDRESS_SUGGESTIONS.filter((a) =>
        a.toLocaleLowerCase('tr').includes(val.toLocaleLowerCase('tr'))
      )
      setAddressSuggestions(filtered)
      setShowAddressSuggestions(filtered.length > 0)
    } else {
      setShowAddressSuggestions(false)
    }
  }

  function selectAddress(addr) {
    setAddress(addr)
    setShowAddressSuggestions(false)
  }

  function selectSavedAddress(addr) {
    setAddress(addr.full)
    setAddressDetail(addr.detail)
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  function buildOrder() {
    return {
      project,
      branch,
      customer: {
        name: customerName,
        phone: phoneInput,
        existingId: selectedCustomer?.id || null,
      },
      address: {
        full: address,
        detail: addressDetail,
        note: deliveryNote,
      },
      order: {
        externalRef,
        amount: parseFloat(amount) || 0,
        paymentMethod,
      },
      delivery: {
        type: deliveryType,
        timeSlot: deliveryType === 'today' ? timeSlot : null,
        date: deliveryType === 'scheduled' ? selectedDate : null,
        priority,
      },
    }
  }

  function handleSave() {
    onSave?.(buildOrder())
    resetForm()
    onClose()
  }

  function handleSaveAndNew() {
    onSave?.(buildOrder())
    resetForm()
    setTimeout(() => phoneRef.current?.focus(), 100)
  }

  function resetForm() {
    setPhoneInput('')
    setCustomerResults([])
    setShowCustomerDropdown(false)
    setSelectedCustomer(null)
    setCustomerName('')
    setAddress('')
    setAddressDetail('')
    setDeliveryNote('')
    setExternalRef('')
    setAmount('')
    setPaymentMethod('cash')
    setDeliveryType('express')
    setTimeSlot(TIME_SLOTS[0])
    setSelectedDate('')
    setPriority('normal')
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (!isOpen) return null

  const inputBase =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
  const selectBase =
    'w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
  const labelBase = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'
  const sectionTitle = 'mb-3 flex items-center gap-2 text-sm font-bold text-gray-700'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-300" />
            <h2 className="text-lg font-extrabold tracking-wide text-white">HIZLI SİPARİŞ</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto px-6 py-5">
          {/* ── 1. Project & Branch ──────────────────────────────────────── */}
          <section>
            <div className={sectionTitle}>
              <Package className="h-4 w-4 text-indigo-500" />
              Proje & Şube
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelBase}>Proje</label>
                <div className="relative">
                  <select
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className={selectBase}
                  >
                    {PROJECTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={labelBase}>Şube</label>
                <div className="relative">
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className={selectBase}
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ── 2. Customer Search ───────────────────────────────────────── */}
          <section>
            <div className={sectionTitle}>
              <Phone className="h-4 w-4 text-indigo-500" />
              Telefon ile Müşteri Bul
            </div>

            <div className="relative" ref={customerDropdownRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={phoneRef}
                    type="text"
                    value={phoneInput}
                    onChange={handlePhoneChange}
                    placeholder="0532 ___ __ __"
                    className={`${inputBase} pl-9`}
                  />
                </div>
                <button
                  onClick={handleSearchClick}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97]"
                >
                  <Search className="h-4 w-4" />
                  Ara
                </button>
              </div>

              {/* Customer dropdown */}
              {showCustomerDropdown && (
                <div className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                  {customerResults.length > 0 ? (
                    customerResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => selectCustomer(c)}
                        className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition last:border-0 hover:bg-indigo-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-gray-900">
                              {c.name}
                            </span>
                            {c.vip && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                <Star className="h-3 w-3" />
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{c.phone}</span>
                            <span className="text-gray-300">|</span>
                            <span>{c.district}</span>
                            <span className="text-gray-300">|</span>
                            <span>{c.orderCount} sipariş</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-gray-400">
                            Son sipariş: {c.lastOrder}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-sm text-gray-500">
                      Eşleşen müşteri bulunamadı
                    </div>
                  )}
                  <button
                    onClick={handleNewCustomer}
                    className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <Plus className="h-4 w-4" />
                    Yeni müşteri olarak ekle
                  </button>
                </div>
              )}
            </div>

            {/* Customer info card */}
            {selectedCustomer && (
              <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {selectedCustomer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        {selectedCustomer.name}
                        {selectedCustomer.vip && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            <Star className="h-3 w-3" />
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{selectedCustomer.phone}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null)
                      setCustomerName('')
                      setAddress('')
                      setAddressDetail('')
                    }}
                    className="rounded p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                  <div>
                    <span className="text-gray-500">Sipariş:</span>{' '}
                    <span className="font-semibold text-gray-700">{selectedCustomer.orderCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ort. Tutar:</span>{' '}
                    <span className="font-semibold text-gray-700">{selectedCustomer.avgSpend} ₺</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ödeme:</span>{' '}
                    <span className="font-semibold text-gray-700">{selectedCustomer.paymentPref}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Son Sipariş:</span>{' '}
                    <span className="font-semibold text-gray-700">{selectedCustomer.lastOrder}</span>
                  </div>
                </div>

                {selectedCustomer.notes && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    {selectedCustomer.notes}
                  </div>
                )}

                {/* Saved addresses */}
                {selectedCustomer.addresses.length > 0 && (
                  <div className="mt-3">
                    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Kayıtlı Adresler
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.addresses.map((a, i) => (
                        <button
                          key={i}
                          onClick={() => selectSavedAddress(a)}
                          className={`rounded-lg border px-3 py-1.5 text-left text-xs transition ${
                            address === a.full
                              ? 'border-indigo-400 bg-indigo-100 text-indigo-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          <span className="font-semibold">{a.label}:</span> {a.full}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <hr className="border-gray-100" />

          {/* ── 3. Customer Info ─────────────────────────────────────────── */}
          <section>
            <div className={sectionTitle}>
              <User className="h-4 w-4 text-indigo-500" />
              Müşteri Bilgileri
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelBase}>Ad Soyad</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Müşteri adı"
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelBase}>Telefon</label>
                <input
                  type="text"
                  value={phoneInput}
                  readOnly
                  className={`${inputBase} bg-gray-50 text-gray-500`}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ── 4. Address ──────────────────────────────────────────────── */}
          <section>
            <div className={sectionTitle}>
              <MapPin className="h-4 w-4 text-indigo-500" />
              Adres
            </div>

            <div className="space-y-3">
              <div className="relative" ref={addressDropdownRef}>
                <label className={labelBase}>Adres</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={handleAddressChange}
                    onFocus={() => {
                      if (address.length >= 2) {
                        const filtered = ADDRESS_SUGGESTIONS.filter((a) =>
                          a.toLocaleLowerCase('tr').includes(address.toLocaleLowerCase('tr'))
                        )
                        if (filtered.length > 0) {
                          setAddressSuggestions(filtered)
                          setShowAddressSuggestions(true)
                        }
                      }
                    }}
                    placeholder="Adres aramaya başlayın..."
                    className={`${inputBase} pl-9`}
                  />
                </div>

                {showAddressSuggestions && (
                  <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    {addressSuggestions.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => selectAddress(a)}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-indigo-50"
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelBase}>Bina / Kat</label>
                  <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="Bina no, kat, daire"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Not (Teslimat notu)</label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Kapı kodu, yol tarifi..."
                    className={inputBase}
                  />
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
              >
                <MapPin className="h-3.5 w-3.5" />
                Haritada Göster
              </button>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ── 5. Order ────────────────────────────────────────────────── */}
          <section>
            <div className={sectionTitle}>
              <Package className="h-4 w-4 text-indigo-500" />
              Sipariş
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelBase}>Harici No (opsiyonel)</label>
                <input
                  type="text"
                  value={externalRef}
                  onChange={(e) => setExternalRef(e.target.value)}
                  placeholder="Dış sistem referansı"
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelBase}>Tutar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    ₺
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`${inputBase} pl-8`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className={labelBase}>Ödeme Yöntemi</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'cash', label: 'Kapıda Nakit', icon: Banknote, color: 'emerald' },
                  { value: 'card', label: 'Kart', icon: CreditCard, color: 'blue' },
                  { value: 'paid', label: 'Ödenmiş', icon: CreditCard, color: 'violet' },
                ].map((opt) => {
                  const Icon = opt.icon
                  const isActive = paymentMethod === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPaymentMethod(opt.value)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? `border-${opt.color}-400 bg-${opt.color}-50 text-${opt.color}-700 ring-2 ring-${opt.color}-500/20`
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ── 6. Delivery ─────────────────────────────────────────────── */}
          <section>
            <div className={sectionTitle}>
              <Clock className="h-4 w-4 text-indigo-500" />
              Teslimat
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'express', label: 'Hemen (Express)', icon: Zap },
                  { value: 'today', label: 'Bugün', icon: Clock },
                  { value: 'scheduled', label: 'Tarih Seç', icon: Calendar },
                ].map((opt) => {
                  const Icon = opt.icon
                  const isActive = deliveryType === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDeliveryType(opt.value)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {deliveryType === 'today' && (
                <div>
                  <label className={labelBase}>Zaman Dilimi</label>
                  <div className="relative">
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className={selectBase}
                    >
                      {TIME_SLOTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}

              {deliveryType === 'scheduled' && (
                <div>
                  <label className={labelBase}>Tarih</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={inputBase}
                  />
                </div>
              )}

              <div>
                <label className={labelBase}>Öncelik</label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={selectBase}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  {priority === 'urgent' && (
                    <AlertTriangle className="pointer-events-none absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            İptal
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSaveAndNew}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-100"
            >
              Kaydet + Yeni
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
