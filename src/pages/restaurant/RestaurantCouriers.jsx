import { useState } from "react";
import {
  Users,
  UserPlus,
  MapPin,
  Phone,
  Package,
  Star,
  Clock,
  Bike,
  Navigation,
  X,
  Check,
} from "lucide-react";

const couriers = [
  {
    id: 1,
    name: "Mehmet Kaya",
    status: "online",
    phone: "0532 555 12 34",
    location: "Kadikoy, Moda Cd.",
    locationUpdated: "2 dk once",
    activeOrders: 2,
    todayDeliveries: 12,
    avgTime: 22,
    rating: 4.8,
    nextOrder: null,
    mapPosition: { top: "40%", left: "60%" },
  },
  {
    id: 2,
    name: "Ali Vural",
    status: "delivering",
    phone: "0533 444 56 78",
    location: "Besiktas, Ortakoy",
    locationUpdated: "5 dk once",
    activeOrders: 3,
    todayDeliveries: 15,
    avgTime: 25,
    rating: 4.7,
    nextOrder: { code: "#YS-4518", eta: "10 dk" },
    mapPosition: { top: "30%", left: "35%" },
  },
  {
    id: 3,
    name: "Veli Tunc",
    status: "online",
    phone: "0535 333 78 90",
    location: "Uskudar, Cengelkoy",
    locationUpdated: "1 dk once",
    activeOrders: 1,
    todayDeliveries: 8,
    avgTime: 20,
    rating: 4.9,
    nextOrder: null,
    mapPosition: { top: "45%", left: "70%" },
  },
  {
    id: 4,
    name: "Ayse Demir",
    status: "offline",
    phone: "0536 222 34 56",
    location: null,
    locationUpdated: null,
    activeOrders: 0,
    todayDeliveries: 0,
    avgTime: null,
    rating: null,
    lastSeen: "2 saat once",
    nextOrder: null,
    mapPosition: null,
  },
  {
    id: 5,
    name: "Hasan Celik",
    status: "delivering",
    phone: "0537 111 90 12",
    location: "Sisli, Mecidiyekoy",
    locationUpdated: "3 dk once",
    activeOrders: 2,
    todayDeliveries: 10,
    avgTime: 28,
    rating: 4.5,
    nextOrder: null,
    mapPosition: { top: "25%", left: "45%" },
  },
  {
    id: 6,
    name: "Zeynep Ak",
    status: "online",
    phone: "0538 999 67 89",
    location: "Kadikoy, Bahariye",
    locationUpdated: "az once",
    activeOrders: 0,
    todayDeliveries: 5,
    avgTime: 18,
    rating: 4.9,
    nextOrder: null,
    idle: true,
    mapPosition: { top: "50%", left: "55%" },
  },
];

const unassignedOrders = [
  {
    id: "YS-5021",
    customer: "Elif Yilmaz",
    address: "Kadikoy, Caferaga Mah.",
    items: 3,
    total: "185.00 TL",
    waitingMin: 8,
  },
  {
    id: "YS-5023",
    customer: "Burak Ozturk",
    address: "Besiktas, Levent Mah.",
    items: 1,
    total: "72.50 TL",
    waitingMin: 5,
  },
  {
    id: "YS-5025",
    customer: "Selin Arslan",
    address: "Uskudar, Altunizade",
    items: 4,
    total: "240.00 TL",
    waitingMin: 3,
  },
  {
    id: "YS-5027",
    customer: "Mert Koc",
    address: "Sisli, Nisantasi",
    items: 2,
    total: "130.00 TL",
    waitingMin: 12,
  },
];

const statusConfig = {
  online: {
    label: "Online",
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-50",
  },
  delivering: {
    label: "Dagitimda",
    dot: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  offline: {
    label: "Offline",
    dot: "bg-gray-400",
    text: "text-gray-600",
    bg: "bg-gray-100",
  },
};

export default function RestaurantCouriers() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [newCourier, setNewCourier] = useState({
    name: "",
    phone: "",
    vehicleType: "motorcycle",
    workStart: "09:00",
    workEnd: "22:00",
  });

  const summaryCards = [
    {
      label: "Toplam",
      value: 6,
      icon: Users,
      color: "text-slate-700",
      bg: "bg-slate-50",
    },
    {
      label: "Online",
      value: 3,
      icon: Users,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Dagitimda",
      value: 2,
      icon: Navigation,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Offline",
      value: 1,
      icon: Users,
      color: "text-gray-500",
      bg: "bg-gray-50",
    },
  ];

  const handleOpenAssign = (courier) => {
    setAssignTarget(courier);
    setSelectedOrder(null);
    setShowAssignModal(true);
  };

  const handleConfirmAssign = () => {
    setShowAssignModal(false);
    setAssignTarget(null);
    setSelectedOrder(null);
  };

  const handleSaveCourier = () => {
    setShowAddModal(false);
    setNewCourier({
      name: "",
      phone: "",
      vehicleType: "motorcycle",
      workStart: "09:00",
      workEnd: "22:00",
    });
  };

  const handleSendSms = () => {
    // Mock SMS invitation
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kuryelerim</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <UserPlus size={18} />
          Kurye Ekle
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                  <Icon size={20} className={card.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Courier List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {couriers.map((courier) => {
          const status = statusConfig[courier.status];
          return (
            <div
              key={courier.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
            >
              {/* Name + Status */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">{courier.name}</h3>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${status.dot}`}
                  ></span>
                  {status.label}
                  {courier.idle && (
                    <span className="text-green-500 ml-0.5">(bosta)</span>
                  )}
                </span>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                {/* Phone */}
                {courier.status !== "offline" && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span>{courier.phone}</span>
                  </div>
                )}

                {/* Location */}
                {courier.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span>
                      {courier.location}{" "}
                      <span className="text-slate-400">
                        ({courier.locationUpdated})
                      </span>
                    </span>
                  </div>
                )}

                {/* Offline: last seen */}
                {courier.status === "offline" && courier.lastSeen && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span>Son gorulme: {courier.lastSeen}</span>
                  </div>
                )}

                {/* Active orders */}
                {courier.status !== "offline" && (
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-slate-400" />
                    <span>
                      Uzerinde:{" "}
                      <span className="font-medium">
                        {courier.activeOrders} siparis
                      </span>
                    </span>
                  </div>
                )}

                {/* Next order */}
                {courier.nextOrder && (
                  <div className="flex items-center gap-2">
                    <Navigation size={14} className="text-blue-500" />
                    <span>
                      Sonraki:{" "}
                      <span className="font-medium">
                        {courier.nextOrder.code}
                      </span>{" "}
                      <span className="text-slate-400">
                        (ETA: {courier.nextOrder.eta})
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Today stats */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Bugun:{" "}
                  <span className="font-semibold text-slate-700">
                    {courier.todayDeliveries}
                  </span>{" "}
                  teslimat
                </span>
                {courier.avgTime && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span>
                      Ort:{" "}
                      <span className="font-semibold text-slate-700">
                        {courier.avgTime} dk
                      </span>
                    </span>
                  </>
                )}
                {courier.rating && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Star
                        size={12}
                        className="text-amber-400 fill-amber-400"
                      />
                      <span className="font-semibold text-slate-700">
                        {courier.rating}
                      </span>
                    </span>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                {courier.status !== "offline" && (
                  <>
                    <button className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                      <MapPin size={13} />
                      Konum
                    </button>
                    <button
                      onClick={() => handleOpenAssign(courier)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Package size={13} />
                      Siparis Ata
                    </button>
                  </>
                )}
                <button className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Phone size={13} />
                  Ara
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Mini Map */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-orange-500" />
          Kurye Konumlari
        </h2>
        <div className="relative w-full h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full border-t border-slate-300"
                style={{ top: `${(i + 1) * 11.11}%` }}
              />
            ))}
            {[...Array(8)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full border-l border-slate-300"
                style={{ left: `${(i + 1) * 11.11}%` }}
              />
            ))}
          </div>

          {/* Restaurant marker (center) */}
          <div
            className="absolute flex flex-col items-center"
            style={{ top: "45%", left: "48%", transform: "translate(-50%, -50%)" }}
          >
            <div className="w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">R</span>
            </div>
            <span className="text-[10px] font-medium text-orange-700 mt-0.5 bg-white/80 px-1 rounded">
              Restoran
            </span>
          </div>

          {/* Courier dots */}
          {couriers.map((courier) => {
            if (!courier.mapPosition) return null;
            const dotColor =
              courier.status === "online"
                ? "bg-green-500"
                : courier.status === "delivering"
                ? "bg-blue-500"
                : "bg-gray-400";
            return (
              <div
                key={courier.id}
                className="absolute flex flex-col items-center group"
                style={{
                  top: courier.mapPosition.top,
                  left: courier.mapPosition.left,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className={`w-3.5 h-3.5 ${dotColor} rounded-full border-2 border-white shadow-md cursor-pointer`}
                />
                <span className="text-[9px] font-medium text-slate-700 mt-0.5 bg-white/90 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {courier.name}
                </span>
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-2 right-2 bg-white/90 rounded-lg px-3 py-1.5 flex items-center gap-3 text-[10px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Restoran
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Online
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Dagitimda
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              Offline
            </span>
          </div>
        </div>
      </div>

      {/* Add Courier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Yeni Kurye Ekle
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={newCourier.name}
                  onChange={(e) =>
                    setNewCourier({ ...newCourier, name: e.target.value })
                  }
                  placeholder="Kurye adi ve soyadi"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={newCourier.phone}
                  onChange={(e) =>
                    setNewCourier({ ...newCourier, phone: e.target.value })
                  }
                  placeholder="05XX XXX XX XX"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Arac Tipi
                </label>
                <div className="flex items-center gap-4">
                  {[
                    { value: "motorcycle", label: "Motorsiklet" },
                    { value: "bicycle", label: "Bisiklet" },
                    { value: "walking", label: "Yaya" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="vehicleType"
                        value={opt.value}
                        checked={newCourier.vehicleType === opt.value}
                        onChange={(e) =>
                          setNewCourier({
                            ...newCourier,
                            vehicleType: e.target.value,
                          })
                        }
                        className="accent-orange-500"
                      />
                      <span className="text-sm text-slate-600">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Calisma Saatleri
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={newCourier.workStart}
                    onChange={(e) =>
                      setNewCourier({
                        ...newCourier,
                        workStart: e.target.value,
                      })
                    }
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="time"
                    value={newCourier.workEnd}
                    onChange={(e) =>
                      setNewCourier({
                        ...newCourier,
                        workEnd: e.target.value,
                      })
                    }
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* SMS Invite */}
              <button
                onClick={handleSendSms}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg px-4 py-2.5 transition-colors"
              >
                <Phone size={15} />
                SMS ile Davet Gonder
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={handleSaveCourier}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg transition-colors"
              >
                <Check size={15} />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Order Modal */}
      {showAssignModal && assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Siparis Ata
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Kurye:{" "}
                  <span className="font-medium text-slate-700">
                    {assignTarget.name}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-3">
              Atanmamis siparislerden birini secin:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {unassignedOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedOrder === order.id
                      ? "border-orange-400 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      #{order.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      {order.waitingMin} dk bekliyor
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">
                      {order.customer}
                    </span>
                    <span className="text-xs font-medium text-slate-700">
                      {order.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <MapPin size={11} />
                    <span>{order.address}</span>
                    <span className="ml-auto">
                      {order.items} urun
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedOrder}
                className={`inline-flex items-center gap-1.5 text-sm font-medium text-white px-5 py-2 rounded-lg transition-colors ${
                  selectedOrder
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                <Check size={15} />
                Onayla ve Ata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
