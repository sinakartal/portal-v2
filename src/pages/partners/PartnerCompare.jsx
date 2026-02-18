import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Trophy,
  Lightbulb,
  TrendingUp,
  MapPin,
  BarChart3,
  Zap
} from 'lucide-react'

const performanceData = [
  {
    metric: 'Siparis',
    bringo: '12,450',
    trendyol: '4,521',
    paketTaxi: '3,842',
    getir: '1,245',
    best: null,
    bestKey: null,
    worstKey: null,
    type: 'info',
  },
  {
    metric: 'Teslim %',
    bringo: 94.2,
    trendyol: 96.2,
    paketTaxi: 93.8,
    getir: 91.4,
    best: 'Trendyol Go',
    bestKey: 'trendyol',
    worstKey: 'getir',
    type: 'higher',
  },
  {
    metric: 'Ort. Sure',
    bringo: '42dk',
    trendyol: '35dk',
    paketTaxi: '42dk',
    getir: '48dk',
    best: 'Trendyol Go',
    bestKey: 'trendyol',
    worstKey: 'getir',
    type: 'lower',
  },
  {
    metric: 'SLA Uyum %',
    bringo: 96.5,
    trendyol: 98.5,
    paketTaxi: 95.2,
    getir: 88.7,
    best: 'Trendyol Go',
    bestKey: 'trendyol',
    worstKey: 'getir',
    type: 'higher',
  },
  {
    metric: 'Birim Maliyet',
    bringo: 28,
    trendyol: 32,
    paketTaxi: 38,
    getir: 45,
    best: 'Bringo',
    bestKey: 'bringo',
    worstKey: 'getir',
    type: 'cost',
  },
  {
    metric: 'Iptal %',
    bringo: 2.8,
    trendyol: 2.1,
    paketTaxi: 3.2,
    getir: 4.5,
    best: 'Trendyol Go',
    bestKey: 'trendyol',
    worstKey: 'getir',
    type: 'lower',
  },
]

const regionData = [
  { region: 'Kadikoy', bestPartner: 'Trendyol Go', deliveryRate: 98.2, reason: 'Yogun kurye agi ve kisa mesafe optimizasyonu' },
  { region: 'Besiktas', bestPartner: 'Trendyol Go', deliveryRate: 97.5, reason: 'Yuksek musteri yogunlugu ve deneyimli kuryeler' },
  { region: 'Sisli', bestPartner: 'Paket Taxi', deliveryRate: 95.8, reason: 'Trafik bilgisi ve alternatif rota kullanimi' },
  { region: 'Uskudar', bestPartner: 'Bringo', deliveryRate: 96.2, reason: 'Yerel depo yakinligi ve hizli dagitim' },
  { region: 'Esenyurt', bestPartner: 'Getir Kurye', deliveryRate: 89.2, reason: 'Genis kapsama alani ancak dusuk performans' },
]

const recommendations = [
  {
    text: "Kadikoy'de Trendyol Go'ya %20 daha fazla aktar",
    icon: TrendingUp,
    color: 'text-green-600',
  },
  {
    text: 'Getir Kurye Esenyurt disinda kullanilmamali',
    icon: Zap,
    color: 'text-red-500',
  },
  {
    text: 'Peak saatlerde (12-14) Paket Taxi tercih edilmeli',
    icon: BarChart3,
    color: 'text-amber-600',
  },
  {
    text: '15,000 TL/ay tasarruf potansiyeli tespit edildi',
    icon: Trophy,
    color: 'text-emerald-600',
  },
]

function formatCellValue(row, key) {
  if (row.type === 'info') return row[key]
  if (row.type === 'cost') return `${String.fromCharCode(8378)}${row[key]}`
  if (row.type === 'lower') return row[key]
  return row[key]
}

function getCellStyle(row, key) {
  if (!row.bestKey) return ''
  if (key === row.bestKey) return 'bg-green-50 text-green-700 font-semibold'
  if (key === row.worstKey) return 'bg-red-50 text-red-500'
  return ''
}

export default function PartnerCompare() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/partners')}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Partner Karsilastirma</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tum partnerlerin performans karsilastirmasi</p>
        </div>
      </div>

      {/* Performance Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <BarChart3 size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Performans Karsilastirmasi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600 w-36">Metrik</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">
                  <span className="inline-flex items-center gap-1">Bringo <span className="text-xs text-slate-400">(Kendi)</span></span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Trendyol Go</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Paket Taxi</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Getir Kurye</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600 w-32">En Iyi</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((row, idx) => (
                <tr
                  key={row.metric}
                  className={`border-b border-slate-100 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-slate-700">{row.metric}</td>
                  {['bringo', 'trendyol', 'paketTaxi', 'getir'].map((key) => (
                    <td
                      key={key}
                      className={`px-4 py-3 text-center ${getCellStyle(row, key)}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {formatCellValue(row, key)}
                        {key === row.bestKey && <Trophy size={14} className="text-green-600" />}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-slate-500 text-xs font-medium">
                    {row.best ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                        {row.best}
                      </span>
                    ) : (
                      <span className="text-slate-300">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Region-Based Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <MapPin size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Bolge Bazli Karsilastirma</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Bolge</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">En Iyi Partner</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Teslim %</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Neden</th>
              </tr>
            </thead>
            <tbody>
              {regionData.map((row, idx) => {
                const rateColor =
                  row.deliveryRate >= 96
                    ? 'text-green-600 bg-green-50'
                    : row.deliveryRate >= 93
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-amber-600 bg-amber-50'
                return (
                  <tr
                    key={row.region}
                    className={`border-b border-slate-100 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                        <MapPin size={14} className="text-slate-400" />
                        {row.region}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                        <Trophy size={12} />
                        {row.bestPartner}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rateColor}`}>
                        %{row.deliveryRate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{row.reason}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
            <Lightbulb size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">AI Onerileri</h3>
            <p className="text-xs text-slate-500">Yapay zeka tabanli optimizasyon onerileri</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec, idx) => {
            const RecIcon = rec.icon
            return (
              <div
                key={idx}
                className="flex items-start gap-3 bg-white rounded-lg border border-blue-100 p-4"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RecIcon size={16} className={rec.color} />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{rec.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
