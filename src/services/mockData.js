// Mock Data Generator
const generateId = () => Math.random().toString(36).substr(2, 12)
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

const customerNames = [
  'Ahmet Yilmaz', 'Mehmet Kaya', 'Fatma Demir', 'Ayse Celik', 'Ali Sahin',
  'Zeynep Arslan', 'Mustafa Dogan', 'Emine Koc', 'Hasan Yildiz', 'Hatice Ozturk',
  'Huseyin Aydin', 'Merve Polat', 'Omer Cetin', 'Elif Kilic', 'Burak Ozdemir',
  'Selin Erdogan', 'Emre Acar', 'Busra Kurt', 'Oguz Taskin', 'Gul Coskun'
]

const streets = [
  'Ataturk Cad.', 'Cumhuriyet Blv.', 'Istiklal Cad.', 'Barbaros Blv.', 'Bagdat Cad.',
  'Halaskargazi Cad.', 'Abdi Ipekci Cad.', 'Turan Gunes Blv.', 'Eskisehir Yolu',
  'Anitkabir Cad.', 'Gazi Mustafa Kemal Blv.', 'Mevlana Cad.', 'Konya Yolu'
]

const districts = [
  'Kadikoy', 'Besiktas', 'Sisli', 'Uskudar', 'Bakirkoy', 'Fatih',
  'Beyoglu', 'Sariyer', 'Maltepe', 'Kartal', 'Pendik', 'Umraniye',
  'Atasehir', 'Cankaya', 'Kecioren', 'Yenimahalle', 'Etimesgut', 'Mamak'
]

const products = [
  'Elektronik Esya', 'Giyim Paketi', 'Gida Siparis', 'Kozmetik Urun',
  'Kitap/Kirtasiye', 'Ev Tekstili', 'Spor Malzemesi', 'Oyuncak',
  'Aksesuar', 'Mutfak Gereci', 'Telefon Aksesuari', 'Bilgisayar Parcasi'
]

const courierNames = [
  'Serkan Acar', 'Murat Yildirim', 'Hakan Tekin', 'Kemal Bas', 'Selim Dursun',
  'Taner Gul', 'Volkan Aslan', 'Cem Ozkan', 'Baris Ay', 'Erkan Sahin',
  'Firat Kocer', 'Deniz Uysal', 'Caner Aktas', 'Onur Cevik', 'Tolga Eren'
]

const projectNames = [
  'Istanbul Ana Dagitim', 'Ankara Bolge', 'Izmir Sahil', 'Antalya Turizm',
  'Bursa Sanayi', 'Express Teslimat', 'Gida Dagitim', 'E-Ticaret Lojistik'
]

const statuses = [
  'pending', 'confirmed', 'processing', 'preparing', 'ready_for_pickup',
  'picked_up', 'assigned', 'routed', 'dispatched', 'in_transit',
  'arriving', 'at_location', 'delivered', 'delivered', 'delivered',
  'failed_delivery', 'cancelled'
]

const courierStatuses = ['active', 'active', 'active', 'active', 'pending', 'suspended']
const vehicleTypes = ['Motosiklet', 'Bisiklet', 'Minivan', 'Otomobil']

// Generate mock orders
export function generateOrders(count = 100) {
  const orders = []
  for (let i = 0; i < count; i++) {
    const status = randomItem(statuses)
    const createdAt = randomDate(new Date(2026, 0, 1), new Date())
    orders.push({
      _id: generateId(),
      orderNumber: `BRN-${String(1000 + i).padStart(6, '0')}`,
      externalId: `EXT-${Math.floor(Math.random() * 100000)}`,
      project: randomItem(projectNames),
      customer: {
        name: randomItem(customerNames),
        phone: `05${Math.floor(Math.random() * 100).toString().padStart(2, '0')} ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')} ${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        address: `${randomItem(streets)} No:${Math.floor(Math.random() * 200)} D:${Math.floor(Math.random() * 20)} ${randomItem(districts)}`,
      },
      items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
        name: randomItem(products),
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.floor(Math.random() * 500) + 50,
      })),
      status,
      courier: status !== 'pending' && status !== 'confirmed' ? randomItem(courierNames) : null,
      totalPrice: Math.floor(Math.random() * 2000) + 100,
      payment: { method: randomItem(['Kredi Karti', 'Kapida Nakit', 'Havale']), isPaid: Math.random() > 0.3 },
      priority: randomItem(['low', 'normal', 'normal', 'normal', 'high', 'urgent']),
      deliveryWindow: {
        start: new Date(createdAt.getTime() + 3600000),
        end: new Date(createdAt.getTime() + 14400000),
      },
      createdAt: createdAt.toISOString(),
    })
  }
  return orders
}

// Generate mock couriers
export function generateCouriers(count = 15) {
  return courierNames.slice(0, count).map((name, i) => ({
    _id: generateId(),
    name,
    phone: `05${Math.floor(Math.random() * 100).toString().padStart(2, '0')} ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')} ${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    status: randomItem(courierStatuses),
    vehicle: { type: randomItem(vehicleTypes), plate: `34 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 9000 + 1000)}` },
    region: randomItem(districts),
    performanceScore: Math.floor(Math.random() * 30) + 70,
    totalDeliveries: Math.floor(Math.random() * 500) + 50,
    todayDeliveries: Math.floor(Math.random() * 20),
    onTimeRate: Math.floor(Math.random() * 20) + 80,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    lastActive: randomDate(new Date(Date.now() - 86400000), new Date()).toISOString(),
    createdAt: randomDate(new Date(2025, 0, 1), new Date(2026, 0, 1)).toISOString(),
  }))
}

// Generate dashboard KPIs
export function generateKPIs() {
  return {
    todayOrders: { value: Math.floor(Math.random() * 500) + 800, change: Math.floor(Math.random() * 20) - 5 },
    activeRoutes: { value: Math.floor(Math.random() * 30) + 20, change: Math.floor(Math.random() * 10) - 3 },
    onlineCouriers: { value: Math.floor(Math.random() * 20) + 30, total: 50, change: Math.floor(Math.random() * 10) },
    deliveryRate: { value: Math.floor(Math.random() * 10) + 88, change: Math.floor(Math.random() * 6) - 2 },
    avgDeliveryTime: { value: Math.floor(Math.random() * 15) + 25, change: -Math.floor(Math.random() * 5) },
    dailyRevenue: { value: Math.floor(Math.random() * 50000) + 100000, change: Math.floor(Math.random() * 15) },
    cancelRate: { value: (Math.random() * 3 + 1).toFixed(1), change: -Math.floor(Math.random() * 2) },
    customerRating: { value: (Math.random() * 0.5 + 4.2).toFixed(1), change: Math.floor(Math.random() * 3) },
  }
}

// Generate chart data
export function generateWeeklyData() {
  const days = ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz']
  return days.map(day => ({
    name: day,
    buHafta: Math.floor(Math.random() * 200) + 100,
    gecenHafta: Math.floor(Math.random() * 200) + 80,
  }))
}

export function generateHourlyData() {
  const hours = []
  for (let h = 8; h <= 22; h++) {
    hours.push({
      name: `${h}:00`,
      siparis: Math.floor(Math.random() * 80) + 10,
      ortalama: Math.floor(Math.random() * 50) + 20,
    })
  }
  return hours
}

export function generateStatusDistribution(orders) {
  const counts = {}
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
  return Object.entries(counts).map(([status, count]) => ({
    name: status,
    value: count,
  }))
}

// Generate projects
export function generateProjects() {
  return projectNames.map((name, i) => ({
    _id: generateId(),
    name,
    code: `PRJ-${String(i + 1).padStart(3, '0')}`,
    client: randomItem(customerNames),
    orderCount: Math.floor(Math.random() * 1000) + 200,
    revenue: Math.floor(Math.random() * 500000) + 100000,
    slaCompliance: Math.floor(Math.random() * 10) + 88,
    isActive: Math.random() > 0.2,
    createdAt: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
  }))
}
