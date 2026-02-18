import { useState } from "react";
import {
  Package,
  Clock,
  MapPin,
  Phone,
  Map,
  CheckCircle,
  Truck,
  AlertCircle,
  Eye,
} from "lucide-react";

const mockOrders = [
  // Bekliyor (3)
  {
    id: "YS-4530",
    customer: "Fatma S.",
    district: "Ataşehir",
    amount: 290,
    status: "bekliyor",
    partner: "Bringo",
    detail: "Kurye aranıyor",
  },
  {
    id: "YS-4531",
    customer: "Zeynep K.",
    district: "Üsküdar",
    amount: 175,
    status: "bekliyor",
    partner: "Trendyol",
    detail: "Kurye aranıyor",
  },
  {
    id: "YS-4532",
    customer: "Mehmet T.",
    district: "Beşiktaş",
    amount: 410,
    status: "bekliyor",
    partner: "Bringo",
    detail: "Kurye aranıyor",
  },

  // Atandı (8)
  {
    id: "YS-4528",
    customer: "Hasan M.",
    district: "Kadıköy",
    amount: 420,
    status: "atandı",
    partner: "Bringo",
    courier: "Ali R.",
    eta: 20,
  },
  {
    id: "YS-4527",
    customer: "Selin A.",
    district: "Maltepe",
    amount: 310,
    status: "atandı",
    partner: "Bringo",
    courier: "Murat K.",
    eta: 15,
  },
  {
    id: "YS-4526",
    customer: "Burak D.",
    district: "Kartal",
    amount: 195,
    status: "atandı",
    partner: "Trendyol",
    courier: "Emre B.",
    eta: 25,
  },
  {
    id: "YS-4529",
    customer: "Ayşe N.",
    district: "Beykoz",
    amount: 560,
    status: "atandı",
    partner: "Bringo",
    courier: "Kemal Y.",
    eta: 30,
  },
  {
    id: "YS-4533",
    customer: "Deniz Ç.",
    district: "Şişli",
    amount: 245,
    status: "atandı",
    partner: "Paket Taxi",
    courier: "Serkan M.",
    eta: 18,
  },
  {
    id: "YS-4534",
    customer: "Elif G.",
    district: "Bakırköy",
    amount: 380,
    status: "atandı",
    partner: "Bringo",
    courier: "Okan T.",
    eta: 22,
  },
  {
    id: "YS-4535",
    customer: "Murat P.",
    district: "Sarıyer",
    amount: 150,
    status: "atandı",
    partner: "Trendyol",
    courier: "Caner S.",
    eta: 28,
  },
  {
    id: "YS-4536",
    customer: "Gizem H.",
    district: "Ümraniye",
    amount: 475,
    status: "atandı",
    partner: "Bringo",
    courier: "Volkan A.",
    eta: 12,
  },

  // Yolda (10)
  {
    id: "YS-4525",
    customer: "Can Ö.",
    district: "Moda",
    amount: 350,
    status: "yolda",
    partner: "Bringo",
    location: "Caferağa Mh.",
    eta: 8,
  },
  {
    id: "YS-4524",
    customer: "Derya B.",
    district: "Fenerbahçe",
    amount: 280,
    status: "yolda",
    partner: "Bringo",
    location: "Zühtüpaşa Mh.",
    eta: 5,
  },
  {
    id: "YS-4523",
    customer: "Emre V.",
    district: "Bostancı",
    amount: 190,
    status: "yolda",
    partner: "Trendyol",
    location: "Bostancı Mh.",
    eta: 12,
  },
  {
    id: "YS-4522",
    customer: "Gökhan L.",
    district: "Caddebostan",
    amount: 445,
    status: "yolda",
    partner: "Bringo",
    location: "Erenköy Mh.",
    eta: 3,
  },
  {
    id: "YS-4537",
    customer: "İrem Z.",
    district: "Kozyatağı",
    amount: 320,
    status: "yolda",
    partner: "Bringo",
    location: "Kozyatağı Mh.",
    eta: 10,
  },
  {
    id: "YS-4538",
    customer: "Kaan U.",
    district: "Acıbadem",
    amount: 265,
    status: "yolda",
    partner: "Paket Taxi",
    location: "Acıbadem Mh.",
    eta: 6,
  },
  {
    id: "YS-4539",
    customer: "Lale E.",
    district: "Suadiye",
    amount: 510,
    status: "yolda",
    partner: "Bringo",
    location: "Suadiye Mh.",
    eta: 15,
  },
  {
    id: "YS-4540",
    customer: "Nihat F.",
    district: "Göztepe",
    amount: 185,
    status: "yolda",
    partner: "Bringo",
    location: "Göztepe Mh.",
    eta: 4,
  },
  {
    id: "YS-4541",
    customer: "Ozan R.",
    district: "Erenköy",
    amount: 370,
    status: "yolda",
    partner: "Trendyol",
    location: "Erenköy Mh.",
    eta: 9,
  },
  {
    id: "YS-4542",
    customer: "Pınar W.",
    district: "Fikirtepe",
    amount: 225,
    status: "yolda",
    partner: "Bringo",
    location: "Fikirtepe Mh.",
    eta: 7,
  },

  // Teslim (4)
  {
    id: "YS-4520",
    customer: "Ahmet Y.",
    district: "Kadıköy",
    amount: 285,
    status: "teslim",
    partner: "Bringo",
    duration: 28,
  },
  {
    id: "YS-4519",
    customer: "Berna C.",
    district: "Ataşehir",
    amount: 340,
    status: "teslim",
    partner: "Bringo",
    duration: 24,
  },
  {
    id: "YS-4518",
    customer: "Cenk İ.",
    district: "Maltepe",
    amount: 160,
    status: "teslim",
    partner: "Trendyol",
    duration: 35,
  },
  {
    id: "YS-4517",
    customer: "Dilek Ş.",
    district: "Kartal",
    amount: 490,
    status: "teslim",
    partner: "Bringo",
    duration: 22,
  },
];

const statusConfig = {
  bekliyor: {
    label: "KURYE BEKLİYOR",
    emoji: "\u23F3",
    borderColor: "border-l-orange-400",
    badgeClass: "bg-orange-50 text-orange-700",
  },
  atandı: {
    label: "KURYE ATANDI",
    emoji: "\uD83D\uDD35",
    borderColor: "border-l-blue-400",
    badgeClass: "bg-blue-50 text-blue-700",
  },
  yolda: {
    label: "YOLDA",
    emoji: "\uD83D\uDFE2",
    borderColor: "border-l-green-400",
    badgeClass: "bg-green-50 text-green-700",
  },
  teslim: {
    label: "TESLİM EDİLDİ",
    emoji: "\u2705",
    borderColor: "border-l-gray-400",
    badgeClass: "bg-gray-50 text-gray-500",
  },
};

const tabs = [
  { key: "tümü", label: "Tümü" },
  { key: "bekliyor", label: "Bekliyor" },
  { key: "atandı", label: "Atandı" },
  { key: "yolda", label: "Yolda" },
  { key: "teslim", label: "Teslim" },
];

const poolStats = [
  { partner: "Bringo", orders: 18, cost: "₺504", avgTime: "26 dk" },
  { partner: "Trendyol", orders: 5, cost: "₺160", avgTime: "32 dk" },
  { partner: "Paket Taxi", orders: 2, cost: "₺76", avgTime: "38 dk" },
];

export default function PoolOrders() {
  const [activeFilter, setActiveFilter] = useState("tümü");

  const filteredOrders =
    activeFilter === "tümü"
      ? mockOrders
      : mockOrders.filter((order) => order.status === activeFilter);

  const counts = {
    tümü: mockOrders.length,
    bekliyor: mockOrders.filter((o) => o.status === "bekliyor").length,
    atandı: mockOrders.filter((o) => o.status === "atandı").length,
    yolda: mockOrders.filter((o) => o.status === "yolda").length,
    teslim: mockOrders.filter((o) => o.status === "teslim").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="w-7 h-7 text-slate-700" />
          Havuz Siparişleri
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Aktif havuz siparişlerini takip edin ve yönetin
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === tab.key
                ? "bg-slate-800 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status];
          const isTeslim = order.status === "teslim";

          return (
            <div
              key={order.id}
              className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${config.borderColor} p-4 ${
                isTeslim ? "opacity-70" : ""
              }`}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.badgeClass}`}
                >
                  {config.emoji} {config.label}
                </span>
                {order.eta && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ETA: {order.eta} dk
                  </span>
                )}
              </div>

              {/* Order Info */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-slate-800">
                  #{order.id}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-sm text-slate-600">
                  {order.customer}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {order.district}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-sm font-semibold text-slate-700">
                  ₺{order.amount}
                </span>
              </div>

              {/* Status Details */}
              <div className="text-xs text-slate-500 space-y-1">
                {order.status === "bekliyor" && (
                  <p>
                    <span className="font-medium text-slate-600">Partner:</span>{" "}
                    {order.partner} &nbsp;|&nbsp;{" "}
                    <span className="font-medium text-slate-600">Durum:</span>{" "}
                    {order.detail}
                  </p>
                )}

                {order.status === "atandı" && (
                  <p>
                    <span className="font-medium text-slate-600">Partner:</span>{" "}
                    {order.partner} &nbsp;|&nbsp;{" "}
                    <span className="font-medium text-slate-600">Kurye:</span>{" "}
                    {order.courier} &nbsp;|&nbsp;{" "}
                    <span className="font-medium text-slate-600">ETA:</span>{" "}
                    {order.eta} dk
                  </p>
                )}

                {order.status === "yolda" && (
                  <>
                    <p>
                      <span className="font-medium text-slate-600">
                        Partner:
                      </span>{" "}
                      {order.partner} &nbsp;|&nbsp;{" "}
                      <span className="flex-inline items-center gap-0.5">
                        📍 {order.location}
                      </span>{" "}
                      &nbsp;|&nbsp;{" "}
                      <span className="font-medium text-slate-600">ETA:</span>{" "}
                      {order.eta} dk
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium">
                        <Map className="w-3.5 h-3.5" />
                        Haritada Gör
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-xs font-medium">
                        <Phone className="w-3.5 h-3.5" />
                        Kuryeyi Ara
                      </button>
                    </div>
                  </>
                )}

                {order.status === "teslim" && (
                  <div className="flex items-center justify-between">
                    <p>
                      <span className="font-medium text-slate-600">
                        Partner:
                      </span>{" "}
                      {order.partner} &nbsp;|&nbsp;{" "}
                      <span className="font-medium text-slate-600">Süre:</span>{" "}
                      {order.duration} dk
                    </p>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-medium">
                      <Eye className="w-3.5 h-3.5" />
                      Detay
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pool Statistics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-slate-600" />
          Havuz İstatistikleri
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-semibold">
                  Partner
                </th>
                <th className="text-left py-3 px-4 text-slate-500 font-semibold">
                  Sipariş
                </th>
                <th className="text-left py-3 px-4 text-slate-500 font-semibold">
                  Maliyet
                </th>
                <th className="text-left py-3 px-4 text-slate-500 font-semibold">
                  Ort. Süre
                </th>
              </tr>
            </thead>
            <tbody>
              {poolStats.map((stat) => (
                <tr
                  key={stat.partner}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {stat.partner}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{stat.orders}</td>
                  <td className="py-3 px-4 text-slate-600">{stat.cost}</td>
                  <td className="py-3 px-4 text-slate-600">{stat.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
