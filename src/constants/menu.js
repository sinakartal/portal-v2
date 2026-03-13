import {
  LayoutDashboard, Package, Truck, MapPin, BarChart3,
  Wallet, Settings, Users, Building2,
  ClipboardList, Handshake, FileBarChart, Gift, Award, ShoppingCart, FolderOpen,
  Map, DollarSign, Cpu
} from 'lucide-vue-next'

export const MENU_SECTIONS = [
  {
    label: 'Operasyon',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: null },
      { title: 'Canli Harita', path: '/live-map', icon: Map, permission: null },
      { title: 'Fiyatlama', path: '/pricing', icon: DollarSign, permission: null },
      { title: 'Algoritma', path: '/algorithm', icon: Cpu, permission: null },
      { title: 'Siparisler', path: '/orders', icon: Package, permission: 'orders:read', badgeKey: 'activeOrders' },
      { title: 'Zimmet & Nakit', path: '/inventory', icon: ClipboardList, permission: 'couriers:read', beta: true },
      { title: 'Kuryeler', path: '/couriers', icon: Truck, permission: 'couriers:read', badgeKey: 'onlineCouriers' },
      { title: 'Rotalar', path: '/routes', icon: MapPin, permission: 'routes:read' },
    ],
  },
  {
    label: 'Analiz',
    items: [
      { title: 'Analitik', path: '/analytics', icon: BarChart3, permission: 'analytics:read' },
      { title: 'Raporlar', path: '/reports', icon: FileBarChart, permission: 'analytics:read' },
      { title: 'Finans', path: '/finance', icon: Wallet, permission: 'finance:read' },
    ],
  },
  {
    label: 'Ozellikler',
    items: [
      { title: 'Teklifler', path: '/offers', icon: Gift, permission: 'orders:read' },
      { title: 'Tesvikler', path: '/incentives', icon: Award, permission: 'analytics:read' },
      { title: 'Checkout Widget', path: '/checkout-preview', icon: ShoppingCart, permission: 'settings:read' },
    ],
  },
  {
    label: 'Yonetim',
    items: [
      { title: '3PL Partnerler', path: '/partners', icon: Handshake, permission: 'settings:read' },
      { title: 'Projeler', path: '/projects', icon: FolderOpen, permission: 'settings:read' },
      { title: 'Tenant Yonetimi', path: '/tenants', icon: Building2, permission: null },
      { title: 'Kullanicilar', path: '/users', icon: Users, permission: 'users:read' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { title: 'Ayarlar', path: '/settings', icon: Settings, permission: 'settings:read' },
    ],
  },
]

// Flat MENU_ITEMS for backward compatibility
export const MENU_ITEMS = MENU_SECTIONS.flatMap(s => s.items)

export const ORDER_STATUSES = {
  pending: { label: 'Beklemede', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: 'Onaylandi', color: '#3b82f6', bg: '#dbeafe' },
  processing: { label: 'Isleniyor', color: '#8b5cf6', bg: '#ede9fe' },
  preparing: { label: 'Hazirlaniyor', color: '#f97316', bg: '#fff7ed' },
  ready_for_pickup: { label: 'Teslim Alinmaya Hazir', color: '#06b6d4', bg: '#cffafe' },
  picked_up: { label: 'Teslim Alindi', color: '#0ea5e9', bg: '#e0f2fe' },
  assigned: { label: 'Kuryeye Atandi', color: '#6366f1', bg: '#e0e7ff' },
  routed: { label: 'Rotaya Eklendi', color: '#7c3aed', bg: '#ede9fe' },
  dispatched: { label: 'Yola Cikti', color: '#2563eb', bg: '#dbeafe' },
  in_transit: { label: 'Yolda', color: '#0284c7', bg: '#e0f2fe' },
  arriving: { label: 'Variyor', color: '#0891b2', bg: '#cffafe' },
  at_location: { label: 'Lokasyonda', color: '#059669', bg: '#d1fae5' },
  attempting_delivery: { label: 'Teslimat Deneniyor', color: '#d97706', bg: '#fef3c7' },
  delivered: { label: 'Teslim Edildi', color: '#10b981', bg: '#d1fae5' },
  partially_delivered: { label: 'Kismen Teslim', color: '#84cc16', bg: '#ecfccb' },
  failed_delivery: { label: 'Teslimat Basarisiz', color: '#ef4444', bg: '#fee2e2' },
  customer_unavailable: { label: 'Musteri Bulunamadi', color: '#f97316', bg: '#fff7ed' },
  wrong_address: { label: 'Yanlis Adres', color: '#dc2626', bg: '#fee2e2' },
  refused: { label: 'Reddedildi', color: '#be123c', bg: '#ffe4e6' },
  damaged: { label: 'Hasarli', color: '#9f1239', bg: '#ffe4e6' },
  cancelled: { label: 'Iptal Edildi', color: '#6b7280', bg: '#f3f4f6' },
  returned: { label: 'Iade Edildi', color: '#78716c', bg: '#f5f5f4' },
  return_in_progress: { label: 'Iade Surecinde', color: '#a16207', bg: '#fef9c3' },
}

export const COURIER_STATUSES = {
  pending: { label: 'Basvuru Bekliyor', color: '#f59e0b', bg: '#fef3c7' },
  document_review: { label: 'Evrak Kontrolu', color: '#3b82f6', bg: '#dbeafe' },
  training: { label: 'Egitimde', color: '#8b5cf6', bg: '#ede9fe' },
  active: { label: 'Aktif', color: '#10b981', bg: '#d1fae5' },
  suspended: { label: 'Askiya Alindi', color: '#ef4444', bg: '#fee2e2' },
  inactive: { label: 'Pasif', color: '#6b7280', bg: '#f3f4f6' },
}

export const ROLES = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  operator: 'Operator',
  viewer: 'Viewer',
}
