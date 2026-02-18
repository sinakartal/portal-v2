import { useState } from "react";
import {
  Map,
  MapPin,
  Navigation,
  Package,
  Check,
  Route,
  Truck,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";

const mockOrders = [
  { id: "YS-4521", district: "Kadıköy", customer: "Ahmet Y.", amount: 285, distance: 2.1 },
  { id: "YS-4520", district: "Moda", customer: "Ayşe D.", amount: 142, distance: 1.8 },
  { id: "YS-4519", district: "Fenerbahçe", customer: "Can Ö.", amount: 420, distance: 3.2 },
  { id: "YS-4518", district: "Beşiktaş", customer: "Fatma S.", amount: 350, distance: 4.5 },
  { id: "YS-4517", district: "Üsküdar", customer: "Hasan M.", amount: 290, distance: 2.8 },
];

const mockCouriers = [
  { id: 1, name: "Mehmet K.", status: "Müsait", color: "green", busy: false },
  { id: 2, name: "Veli T.", status: "1 sipariş", color: "green", busy: false },
  { id: 3, name: "Ali V.", status: "3 sipariş", color: "blue", busy: true },
];

const mapPoints = [
  { x: 45, y: 55, label: "R", type: "restaurant" },
  { x: 25, y: 30, label: "1", type: "delivery" },
  { x: 60, y: 20, label: "2", type: "delivery" },
  { x: 80, y: 40, label: "3", type: "delivery" },
  { x: 70, y: 70, label: "4", type: "delivery" },
  { x: 30, y: 75, label: "5", type: "delivery" },
];

export default function RestaurantRouting() {
  const [selectedOrders, setSelectedOrders] = useState(["YS-4521", "YS-4520", "YS-4519"]);
  const [selectedCourier, setSelectedCourier] = useState(1);
  const [isOptimized, setIsOptimized] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const selectAll = () => {
    if (selectedOrders.length === mockOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(mockOrders.map((o) => o.id));
    }
  };

  const handleOptimize = () => {
    setIsOptimized(true);
  };

  const handleAssign = () => {
    const courier = mockCouriers.find((c) => c.id === selectedCourier);
    if (courier && selectedOrders.length > 0) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  const selectedCount = selectedOrders.length;
  const courier = mockCouriers.find((c) => c.id === selectedCourier);

  const routePath =
    mapPoints
      .map((p, i) => `${p.x}%,${p.y}%`)
      .join(" ") + ` ${mapPoints[0].x}%,${mapPoints[0].y}%`;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5" />
          <span className="font-medium">
            {selectedCount} sipariş {courier?.name}'ya atandı
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">🗺</span> Rota Planlama
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Siparişleri seçin, rotayı optimize edin ve kuryeye atayın
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Ready Orders List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Hazır Siparişler ({mockOrders.length})
              </h2>
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {selectedOrders.length === mockOrders.length ? "Seçimi Kaldır" : "Tümünü Seç"}
              </button>
            </div>

            <div className="space-y-2">
              {mockOrders.map((order) => {
                const isSelected = selectedOrders.includes(order.id);
                return (
                  <label
                    key={order.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-blue-50 border-blue-200"
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOrder(order.id)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-slate-700">
                          #{order.id}
                        </span>
                        <span className="font-semibold text-slate-800">
                          ₺{order.amount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-slate-500">
                          {order.district}, {order.customer}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {order.distance} km
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Seçili: <span className="font-semibold text-slate-700">{selectedCount} sipariş</span>
              </span>
              <span className="text-sm text-slate-400">
                Toplam: ₺
                {mockOrders
                  .filter((o) => selectedOrders.includes(o.id))
                  .reduce((sum, o) => sum + o.amount, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Simulated Map */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Map className="w-5 h-5 text-blue-500" />
              Rota Haritası
            </h2>

            {/* Map Area */}
            <div className="relative bg-slate-100 rounded-xl h-64 overflow-hidden border border-slate-200">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute w-full border-t border-slate-300"
                    style={{ top: `${(i + 1) * 12.5}%` }}
                  />
                ))}
                {[...Array(10)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full border-l border-slate-300"
                    style={{ left: `${(i + 1) * 10}%` }}
                  />
                ))}
              </div>

              {/* Dashed route line via SVG */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points="45,55 25,30 60,20 80,40 70,70 30,75 45,55"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="0.6"
                  strokeDasharray="2,1.5"
                  opacity="0.7"
                />
              </svg>

              {/* Map points */}
              {mapPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  {point.type === "restaurant" ? (
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      <Navigation className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      <span className="text-[10px] font-bold text-white">{point.label}</span>
                    </div>
                  )}
                  {point.type === "restaurant" && (
                    <span className="text-[10px] font-semibold text-red-600 mt-0.5 bg-white/80 px-1 rounded">
                      Restoran
                    </span>
                  )}
                </div>
              ))}

              {/* Map label */}
              <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-white/70 px-2 py-0.5 rounded">
                Simüle Harita Görünümü
              </div>
            </div>

            {/* Stats below map */}
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4 text-blue-500" />
                Toplam: {selectedCount} sipariş
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <Route className="w-4 h-4 text-blue-500" />
                Mesafe: {isOptimized ? "7.1" : "8.5"} km
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
                Tahmini süre: {isOptimized ? "35" : "42"} dk
              </span>
            </div>

            {/* Optimize Button */}
            <div className="mt-4">
              {!isOptimized ? (
                <button
                  onClick={handleOptimize}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>🗺</span> Rotayı Optimize Et
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                    <Check className="w-5 h-5" />
                    Rota Optimize Edildi
                  </div>
                  <div className="text-sm text-emerald-600 space-y-1">
                    <p className="flex items-center gap-2">
                      Önceki mesafe: <span className="line-through text-slate-400">8.5 km</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-semibold">Yeni mesafe: 7.1 km</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Route className="w-4 h-4" />
                      <span className="font-semibold text-emerald-700">%17 daha kısa rota</span>
                      <span className="text-slate-400">|</span>
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold text-emerald-700">7 dk tasarruf</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Courier Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-indigo-500" />
              Kurye Seçimi
            </h2>

            <div className="space-y-2">
              {mockCouriers.map((c) => {
                const isSelected = selectedCourier === c.id;
                const statusDot = c.color === "green" ? "🟢" : "🔵";
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="courier"
                      checked={isSelected}
                      onChange={() => setSelectedCourier(c.id)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span>{statusDot}</span>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">{c.name}</span>
                      </div>
                      <span className="text-sm text-slate-400">({c.status})</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-500" />
                    )}
                  </label>
                );
              })}
            </div>

            <button
              onClick={handleAssign}
              disabled={selectedCount === 0}
              className={`w-full mt-4 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                selectedCount > 0
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>📦</span> Kuryeye Ata
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
