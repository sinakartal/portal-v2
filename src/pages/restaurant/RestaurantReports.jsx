import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  Truck,
  Star,
  Lightbulb,
  Calendar,
  DollarSign,
} from "lucide-react";

const weeklyTrendData = [
  { day: "Pzt", kendiKurye: 62, havuz: 18 },
  { day: "Sal", kendiKurye: 55, havuz: 22 },
  { day: "Çar", kendiKurye: 58, havuz: 20 },
  { day: "Per", kendiKurye: 60, havuz: 25 },
  { day: "Cum", kendiKurye: 70, havuz: 30 },
  { day: "Cmt", kendiKurye: 48, havuz: 22 },
  { day: "Paz", kendiKurye: 34, havuz: 18 },
];

const hourlyDeliveryData = [
  { saat: "10:00", ortSure: 20 },
  { saat: "11:00", ortSure: 22 },
  { saat: "12:00", ortSure: 30 },
  { saat: "13:00", ortSure: 32 },
  { saat: "14:00", ortSure: 25 },
  { saat: "15:00", ortSure: 21 },
  { saat: "16:00", ortSure: 19 },
  { saat: "17:00", ortSure: 23 },
  { saat: "18:00", ortSure: 28 },
  { saat: "19:00", ortSure: 35 },
  { saat: "20:00", ortSure: 33 },
  { saat: "21:00", ortSure: 27 },
  { saat: "22:00", ortSure: 22 },
];

const courierData = [
  { name: "Mehmet K.", deliveries: 125, avgTime: 22, rating: 4.9 },
  { name: "Ali V.", deliveries: 98, avgTime: 25, rating: 4.7 },
  { name: "Veli T.", deliveries: 87, avgTime: 28, rating: 4.6 },
  { name: "Hasan \u00C7.", deliveries: 72, avgTime: 30, rating: 4.5 },
  { name: "Zeynep A.", deliveries: 45, avgTime: 18, rating: 4.9 },
];

const poolPartnerData = [
  { name: "Bringo", orders: 98, avgTime: 26, cost: 2744, sla: 98.2 },
  { name: "Trendyol Go", orders: 42, avgTime: 30, cost: 1344, sla: 96.5 },
  { name: "Paket Taxi", orders: 15, avgTime: 38, cost: 570, sla: 93.8 },
];

const dateRangeOptions = [
  { key: "week", label: "Bu Hafta" },
  { key: "month", label: "Bu Ay" },
  { key: "30days", label: "Son 30 G\u00FCn" },
];

const maxDeliveries = Math.max(...courierData.map((c) => c.deliveries));

export default function RestaurantReports() {
  const [dateRange, setDateRange] = useState("week");

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Raporlar
        </h1>
        <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          {dateRangeOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setDateRange(option.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                dateRange === option.key
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Toplam Sipari\u015F</span>
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">542</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Kendi Kurye</span>
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-800">387</p>
            <span className="text-sm font-medium text-emerald-600">%71</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Havuz Sipari\u015F</span>
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-800">155</p>
            <span className="text-sm font-medium text-orange-600">%29</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Havuz Maliyeti</span>
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            \u20BA4,340
          </p>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Courier Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            Kurye Performans\u0131
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">
                    Kurye
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">
                    Teslimat
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">
                    Ort.S\u00FCre
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">
                    Puan
                  </th>
                </tr>
              </thead>
              <tbody>
                {courierData.map((courier, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-3 pr-3">
                      <span className="font-medium text-slate-700">
                        {courier.name}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700 w-8">
                          {courier.deliveries}
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{
                              width: `${(courier.deliveries / maxDeliveries) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-sm text-slate-600">
                        {courier.avgTime} dk
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-slate-700 flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        {courier.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pool Partner Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-orange-500" />
            Havuz Partner Performans\u0131
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">
                    Partner
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">
                    Sipari\u015F
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">
                    Ort.S\u00FCre
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 pr-3">
                    Maliyet
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">
                    SLA
                  </th>
                </tr>
              </thead>
              <tbody>
                {poolPartnerData.map((partner, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-3 pr-3">
                      <span className="font-medium text-slate-700">
                        {partner.name}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-sm font-semibold text-slate-700">
                        {partner.orders}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-sm text-slate-600">
                        {partner.avgTime} dk
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-sm font-semibold text-slate-700">
                        \u20BA{partner.cost.toLocaleString("tr-TR")}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-sm font-semibold ${
                          partner.sla >= 97
                            ? "text-emerald-600"
                            : partner.sla >= 95
                              ? "text-amber-600"
                              : "text-red-500"
                        }`}
                      >
                        %{partner.sla}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Order Trend - Stacked Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Haftal\u0131k Sipari\u015F Trendi
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "13px" }}
              />
              <Bar
                dataKey="kendiKurye"
                name="Kendi Kurye"
                stackId="a"
                fill="#3b82f6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="havuz"
                name="Havuz"
                stackId="a"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery Time Distribution - Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Teslimat S\u00FCresi Da\u011F\u0131l\u0131m\u0131
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hourlyDeliveryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="saat"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                unit=" dk"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                formatter={(value) => [`${value} dk`, "Ort. S\u00FCre"]}
              />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
              <Line
                type="monotone"
                dataKey="ortSure"
                name="Ort. S\u00FCre (dk)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendation Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-5 flex items-start gap-3">
        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-amber-800 mb-1">\u00D6neri</p>
          <p className="text-amber-700 text-sm">
            Paket Taxi yerine daha fazla Bringo kullan\u0131n — Ayl\u0131k{" "}
            <span className="font-semibold">\u20BA850 tasarruf</span>{" "}
            potansiyeli
          </p>
        </div>
      </div>
    </div>
  );
}
