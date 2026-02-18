import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Trash2,
  Eye,
  FileText,
  Loader2,
  ChevronDown,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

const TURKISH_NAMES = [
  'Ahmet Yılmaz', 'Mehmet Kaya', 'Ayşe Demir', 'Fatma Çelik', 'Ali Şahin',
  'Zeynep Arslan', 'Hasan Doğan', 'Elif Aydın', 'Mustafa Özdemir', 'Emine Koç',
  'Hüseyin Yıldız', 'Hatice Kurt', 'İbrahim Öztürk', 'Meryem Kılıç', 'Ömer Aksoy',
  'Zübeyde Polat', 'Yusuf Erdoğan', 'Havva Tekin', 'Osman Güneş', 'Rabia Çetin',
  'Süleyman Korkmaz', 'Esra Acar', 'Kadir Balcı', 'Büşra Şen', 'Emre Yıldırım',
  'Seda Uysal', 'Burak Aktaş', 'Derya Duman', 'Cem Karaca', 'Gizem Tunç',
]

const STREETS = [
  'Atatürk Cad.', 'Cumhuriyet Mah.', 'İstiklal Sk.', 'Fatih Blv.', 'Mevlana Cad.',
  'Barbaros Mah.', 'Çankaya Sk.', 'Kızılay Mah.', 'Bahçelievler Cad.', 'Yıldırım Sk.',
]

const DISTRICTS = [
  'Kadıköy', 'Beşiktaş', 'Üsküdar', 'Bakırköy', 'Şişli',
  'Beyoğlu', 'Fatih', 'Kartal', 'Pendik', 'Maltepe',
]

const NOTES = [
  'Kapıda ödeme', 'Zili çalın', 'Bahçe kapısından girin', '2. kat',
  'Akşam teslimat', 'Sabah teslimat', 'Kırılgan ürün', 'Soğuk zincir',
  '', '', '', '',
]

const ERROR_ROWS_CONFIG = [
  { index: 7, error: 'Müşteri adı boş', clearField: 'customer' },
  { index: 23, error: 'Geçersiz telefon numarası', corruptField: 'phone' },
  { index: 41, error: 'Adres bilgisi eksik', clearField: 'address' },
  { index: 58, error: 'Sipariş tutarı geçersiz', corruptField: 'amount' },
  { index: 74, error: 'Telefon numarası boş', clearField: 'phone' },
  { index: 95, error: 'Müşteri adı çok kısa', corruptField: 'customer' },
  { index: 112, error: 'Geçersiz adres formatı', corruptField: 'address' },
  { index: 138, error: 'Tutar negatif olamaz', corruptField: 'amount' },
]

function generateMockRows(count = 150) {
  const rows = []
  const errorIndices = new Set(ERROR_ROWS_CONFIG.map((e) => e.index))

  for (let i = 0; i < count; i++) {
    const name = TURKISH_NAMES[i % TURKISH_NAMES.length]
    const phone = `05${String(Math.floor(Math.random() * 900000000 + 100000000)).slice(0, 9)}`
    const street = STREETS[i % STREETS.length]
    const district = DISTRICTS[i % DISTRICTS.length]
    const no = Math.floor(Math.random() * 80) + 1
    const amount = (Math.random() * 900 + 50).toFixed(2)
    const note = NOTES[i % NOTES.length]

    const row = {
      id: i + 1,
      customer: name,
      phone,
      address: `${street} No:${no}, ${district}/İstanbul`,
      amount: parseFloat(amount),
      note,
      valid: true,
      error: null,
    }

    if (errorIndices.has(i)) {
      const cfg = ERROR_ROWS_CONFIG.find((e) => e.index === i)
      row.valid = false
      row.error = cfg.error
      if (cfg.clearField) row[cfg.clearField] = ''
      if (cfg.corruptField) {
        if (cfg.corruptField === 'phone') row.phone = '123'
        if (cfg.corruptField === 'customer') row.customer = 'A'
        if (cfg.corruptField === 'address') row.address = 'X'
        if (cfg.corruptField === 'amount') row.amount = -15
      }
    }

    rows.push(row)
  }
  return rows
}

const MOCK_DATA = generateMockRows(150)

const PROJECTS = [
  { id: 1, name: 'İstanbul Anadolu Dağıtım' },
  { id: 2, name: 'İstanbul Avrupa Dağıtım' },
  { id: 3, name: 'Ankara Merkez' },
]

const EXCEL_COLUMNS = [
  { key: 'A', label: 'A: Müşteri' },
  { key: 'B', label: 'B: Tel' },
  { key: 'C', label: 'C: Adres' },
  { key: 'D', label: 'D: Tutar' },
  { key: 'E', label: 'E: Not' },
]

const SYSTEM_FIELDS = [
  { key: 'customer_name', label: 'Müşteri Adı' },
  { key: 'phone', label: 'Telefon' },
  { key: 'address', label: 'Adres' },
  { key: 'order_amount', label: 'Sipariş Tutarı' },
  { key: 'delivery_note', label: 'Teslimat Notu' },
  { key: 'external_no', label: 'Harici No' },
  { key: 'payment_method', label: 'Ödeme Yöntemi' },
]

const DEFAULT_MAPPINGS = {
  A: 'customer_name',
  B: 'phone',
  C: 'address',
  D: 'order_amount',
  E: 'delivery_note',
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEPS = [
  { num: 1, label: 'Dosya Yükle' },
  { num: 2, label: 'Sütun Eşleştirme' },
  { num: 3, label: 'Önizleme' },
  { num: 4, label: 'Import' },
]

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const isActive = step.num === current
        const isDone = step.num < current
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isDone ? <CheckCircle className="w-5 h-5" /> : step.num}
              </div>
              <span
                className={`mt-2 text-xs font-medium whitespace-nowrap ${
                  isActive ? 'text-blue-600' : isDone ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-20 h-0.5 mx-2 mt-[-18px] transition-colors duration-300 ${
                  step.num < current ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 - File Upload
// ---------------------------------------------------------------------------

function StepFileUpload({ file, setFile, project, setProject, onNext, onCancel }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer?.files?.[0]
    if (droppedFile) simulateUpload(droppedFile)
  }

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0]
    if (selected) simulateUpload(selected)
  }

  const simulateUpload = (f) => {
    setFile({
      name: f.name || 'siparis_listesi.xlsx',
      size: f.size || 245760,
      rows: 150,
      raw: f,
    })
  }

  const handleMockUpload = () => {
    setFile({
      name: 'siparis_listesi.xlsx',
      size: 245760,
      rows: 150,
      raw: null,
    })
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Project selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Proje Seçin</label>
        <div className="relative">
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
          >
            <option value="">Proje seçin...</option>
            {PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Drag-drop area */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={handleMockUpload}
          className={`relative cursor-pointer border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-base font-medium text-gray-700 mb-1">
              Dosyanızı sürükleyip bırakın veya tıklayın
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Excel veya CSV dosyanızı buraya yükleyin
            </p>
            <div className="flex items-center gap-2">
              {['.xlsx', '.xls', '.csv'].map((ext) => (
                <span
                  key={ext}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600"
                >
                  <FileSpreadsheet className="w-3 h-3 mr-1" />
                  {ext}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Maks. 5MB, 1000 satır</p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{formatSize(file.size)}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="text-xs text-gray-500">{file.rows} satır</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="inline-flex items-center text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Yüklendi
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Template downloads */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Şablon indir:</span>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
          <Download className="w-3.5 h-3.5" />
          Excel Şablon
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
          <Download className="w-3.5 h-3.5" />
          CSV Şablon
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          İptal
        </button>
        <button
          onClick={onNext}
          disabled={!file || !project}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          Devam
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 - Column Mapping
// ---------------------------------------------------------------------------

function StepColumnMapping({ mappings, setMappings, onNext, onBack }) {
  const isAutoMatched = (excelKey) => {
    return DEFAULT_MAPPINGS[excelKey] === mappings[excelKey]
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Otomatik eşleştirme yapıldı</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Excel sütunları sistem alanlarıyla otomatik olarak eşleştirildi. Gerekirse değiştirebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_40px_1fr_48px] items-center px-5 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Excel Sütunu
          </span>
          <span />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sistem Alanı
          </span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
            Durum
          </span>
        </div>

        {/* Rows */}
        {EXCEL_COLUMNS.map((col) => (
          <div
            key={col.key}
            className="grid grid-cols-[1fr_40px_1fr_48px] items-center px-5 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition"
          >
            {/* Excel column */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald-600">{col.key}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{col.label.split(': ')[1]}</span>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </div>

            {/* System field dropdown */}
            <div className="relative">
              <select
                value={mappings[col.key] || ''}
                onChange={(e) =>
                  setMappings((prev) => ({ ...prev, [col.key]: e.target.value }))
                }
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              >
                <option value="">-- Eşleştirme yok --</option>
                {SYSTEM_FIELDS.map((sf) => (
                  <option key={sf.key} value={sf.key}>
                    {sf.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Status */}
            <div className="flex justify-center">
              {mappings[col.key] ? (
                isAutoMatched(col.key) ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  </div>
                )
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unmapped system fields info */}
      {(() => {
        const mapped = new Set(Object.values(mappings).filter(Boolean))
        const unmapped = SYSTEM_FIELDS.filter((sf) => !mapped.has(sf.key))
        if (unmapped.length === 0) return null
        return (
          <div className="text-xs text-gray-400">
            Eşleştirilmemiş sistem alanları:{' '}
            {unmapped.map((u) => u.label).join(', ')}
          </div>
        )
      })()}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
        >
          Devam
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 - Preview & Validation
// ---------------------------------------------------------------------------

function StepPreview({ data, skipErrors, setSkipErrors, onNext, onBack }) {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(0)
  const PER_PAGE = 20

  const totalCount = data.length
  const validCount = data.filter((r) => r.valid).length
  const errorCount = data.filter((r) => !r.valid).length

  const filtered =
    filter === 'valid'
      ? data.filter((r) => r.valid)
      : filter === 'error'
      ? data.filter((r) => !r.valid)
      : data

  const pageCount = Math.ceil(filtered.length / PER_PAGE)
  const pageData = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  useEffect(() => {
    setPage(0)
  }, [filter])

  const importableCount = skipErrors ? validCount : totalCount

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Toplam</p>
            <p className="text-lg font-bold text-gray-800">{totalCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Geçerli</p>
            <p className="text-lg font-bold text-emerald-700">{validCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Hatalı</p>
            <p className="text-lg font-bold text-red-600">{errorCount}</p>
          </div>
        </div>
      </div>

      {/* Tab filters */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: 'all', label: 'Tümü', count: totalCount },
          { key: 'valid', label: 'Geçerli', count: validCount },
          { key: 'error', label: 'Hatalı', count: errorCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition ${
              filter === tab.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.key ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/60 text-gray-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                  Durum
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Adres
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageData.map((row) => (
                <tr
                  key={row.id}
                  className={`transition ${
                    !row.valid ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{row.id}</td>
                  <td className="px-4 py-2.5">
                    {row.valid ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </td>
                  <td className={`px-4 py-2.5 font-medium ${!row.valid && !row.customer ? 'text-red-500 italic' : 'text-gray-800'}`}>
                    {row.customer || '(boş)'}
                  </td>
                  <td className={`px-4 py-2.5 ${!row.valid && (row.phone === '123' || !row.phone) ? 'text-red-500' : 'text-gray-600'}`}>
                    {row.phone || '(boş)'}
                  </td>
                  <td className={`px-4 py-2.5 max-w-[220px] truncate ${!row.valid && (row.address === 'X' || !row.address) ? 'text-red-500' : 'text-gray-600'}`}>
                    {row.address || '(boş)'}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-mono ${row.amount < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                    {row.amount < 0 ? row.amount.toFixed(2) : row.amount.toFixed(2)} TL
                  </td>
                  <td className="px-4 py-2.5">
                    {row.error && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        {row.error}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">
              {page * PER_PAGE + 1} - {Math.min((page + 1) * PER_PAGE, filtered.length)} / {filtered.length} satır
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                let pageNum = i
                if (pageCount > 5) {
                  if (page <= 2) pageNum = i
                  else if (page >= pageCount - 3) pageNum = pageCount - 5 + i
                  else pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-md text-xs font-medium transition ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Skip errors checkbox */}
      {errorCount > 0 && (
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={skipErrors}
            onChange={(e) => setSkipErrors(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">
            Hatalı satırları atla
            <span className="text-gray-400 ml-1">
              ({skipErrors ? validCount : totalCount} sipariş import edilecek)
            </span>
          </span>
        </label>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
        >
          Import
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4 - Progress & Completion
// ---------------------------------------------------------------------------

function StepProgress({ data, skipErrors, onViewOrders, onNewImport, onClose }) {
  const [progress, setProgress] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)
  const [logs, setLogs] = useState([])
  const [done, setDone] = useState(false)
  const [startTime] = useState(Date.now())
  const [eta, setEta] = useState('')

  const importable = skipErrors ? data.filter((r) => r.valid) : data
  const totalToImport = importable.length

  useEffect(() => {
    if (done) return

    const interval = setInterval(() => {
      setProcessedCount((prev) => {
        const next = prev + Math.floor(Math.random() * 3) + 1
        if (next >= totalToImport) {
          clearInterval(interval)
          setProgress(100)
          setProcessedCount(totalToImport)
          setDone(true)

          setLogs((prevLogs) => {
            const remaining = importable.slice(prevLogs.length).map((r) => ({
              id: r.id,
              customer: r.customer,
              success: true,
            }))
            return [...prevLogs, ...remaining]
          })

          return totalToImport
        }

        const pct = Math.round((next / totalToImport) * 100)
        setProgress(pct)

        // ETA calculation
        const elapsed = Date.now() - startTime
        const perItem = elapsed / next
        const remaining = (totalToImport - next) * perItem
        if (remaining > 60000) {
          setEta(`~${Math.ceil(remaining / 60000)} dk kaldı`)
        } else {
          setEta(`~${Math.ceil(remaining / 1000)} sn kaldı`)
        }

        // Add log entries
        setLogs((prevLogs) => {
          const newLogs = []
          for (let i = prevLogs.length; i < next && i < importable.length; i++) {
            newLogs.push({
              id: importable[i].id,
              customer: importable[i].customer,
              success: true,
            })
          }
          return [...prevLogs, ...newLogs]
        })

        return next
      })
    }, 120)

    return () => clearInterval(interval)
  }, [done, totalToImport, importable, startTime])

  return (
    <div className="space-y-6">
      {!done ? (
        <>
          {/* Progress header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Siparişler import ediliyor...</h3>
            <p className="text-sm text-gray-500 mt-1">Lütfen bu sayfadan ayrılmayın</p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {processedCount} / {totalToImport} sipariş
              </span>
              <span className="text-sm font-semibold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-end mt-1.5">
              <span className="text-xs text-gray-400">{eta}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Completion header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Import tamamlandı!</h3>
            <p className="text-sm text-gray-500 mt-1">
              Tüm siparişler başarıyla oluşturuldu
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">{totalToImport}</p>
              <p className="text-xs text-emerald-600 mt-1">Oluşturulan</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-2xl font-bold text-gray-700">
                {skipErrors ? data.filter((r) => !r.valid).length : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Atlanan</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-2xl font-bold text-blue-700">
                {((Date.now() - startTime) / 1000).toFixed(1)}s
              </p>
              <p className="text-xs text-blue-600 mt-1">Süre</p>
            </div>
          </div>
        </>
      )}

      {/* Log */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          İşlem Kaydı
        </p>
        <div className="border border-gray-200 rounded-xl bg-gray-50 h-56 overflow-y-auto p-3 space-y-1 font-mono text-xs">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="text-gray-400">#{String(log.id).padStart(3, '0')}</span>
              <span className="truncate">{log.customer}</span>
              <span className="text-emerald-600 ml-auto shrink-0">oluşturuldu</span>
            </div>
          ))}
          {!done && (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>İşleniyor...</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {done && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Kapat
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onNewImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-blue-200 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
            >
              <Upload className="w-4 h-4" />
              Yeni Import
            </button>
            <button
              onClick={onViewOrders}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
            >
              <Eye className="w-4 h-4" />
              Siparişleri Gör
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ExcelImport() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [file, setFile] = useState(null)
  const [project, setProject] = useState('')
  const [mappings, setMappings] = useState({ ...DEFAULT_MAPPINGS })
  const [skipErrors, setSkipErrors] = useState(true)

  const handleReset = () => {
    setStep(1)
    setFile(null)
    setProject('')
    setMappings({ ...DEFAULT_MAPPINGS })
    setSkipErrors(true)
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Excel Import</h1>
              <p className="text-sm text-gray-500">Toplu sipariş yükleme sihirbazı</p>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Step title */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              {step === 1 && 'Dosya Yükle'}
              {step === 2 && 'Sütun Eşleştirme'}
              {step === 3 && 'Önizleme ve Doğrulama'}
              {step === 4 && (step === 4 ? 'Import' : '')}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {step === 1 && 'Excel veya CSV dosyanızı yükleyin ve projenizi seçin'}
              {step === 2 && 'Excel sütunlarını sistem alanlarıyla eşleştirin'}
              {step === 3 && 'Verileri kontrol edin ve hataları inceleyin'}
              {step === 4 && 'Siparişler sisteme aktarılıyor'}
            </p>
          </div>

          {/* Step content */}
          {step === 1 && (
            <StepFileUpload
              file={file}
              setFile={setFile}
              project={project}
              setProject={setProject}
              onNext={() => setStep(2)}
              onCancel={() => navigate(-1)}
            />
          )}

          {step === 2 && (
            <StepColumnMapping
              mappings={mappings}
              setMappings={setMappings}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepPreview
              data={MOCK_DATA}
              skipErrors={skipErrors}
              setSkipErrors={setSkipErrors}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <StepProgress
              data={MOCK_DATA}
              skipErrors={skipErrors}
              onViewOrders={() => navigate('/orders')}
              onNewImport={handleReset}
              onClose={() => navigate(-1)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
