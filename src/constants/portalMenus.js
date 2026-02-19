import {
  LayoutDashboard, Package, Truck, MapPin, Settings,
  Ship, Briefcase, BarChart3, Users, FileText,
  Store, Route, Layers, ClipboardList, Handshake,
  TrendingUp, CreditCard, Building2
} from 'lucide-vue-next'

export const CORPORATE_MENU = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Siparisler',
    path: '/orders',
    icon: Package,
  },
  {
    title: 'Takip',
    path: '/tracking',
    icon: MapPin,
  },
  {
    title: 'Raporlar',
    path: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Faturalar',
    path: '/invoices',
    icon: FileText,
  },
  {
    title: 'Ayarlar',
    path: '/settings',
    icon: Settings,
  },
]

export const RESTAURANT_MENU = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Siparisler',
    path: '/orders',
    icon: Package,
  },
  {
    title: 'Kuryeler',
    path: '/couriers',
    icon: Truck,
  },
  {
    title: 'Rotalama',
    path: '/routing',
    icon: Route,
  },
  {
    title: 'Havuz Siparisler',
    path: '/pool',
    icon: Layers,
  },
  {
    title: 'Raporlar',
    path: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Ayarlar',
    path: '/settings',
    icon: Settings,
  },
]

export const SHIP_MENU = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Talepler',
    path: '/requests',
    icon: ClipboardList,
  },
  {
    title: 'Tedarikler',
    path: '/supplies',
    icon: Package,
  },
  {
    title: 'Teslimatlar',
    path: '/deliveries',
    icon: Truck,
  },
  {
    title: 'Partnerler',
    path: '/partners',
    icon: Handshake,
  },
  {
    title: 'Finans',
    path: '/finance',
    icon: CreditCard,
  },
  {
    title: 'Ayarlar',
    path: '/settings',
    icon: Settings,
  },
]

export const PORTAL_CONFIG = {
  corporate: {
    title: 'Kurumsal Portal',
    subtitle: 'kurumsal',
    menu: CORPORATE_MENU,
    color: '#2563eb',
    icon: Briefcase,
  },
  restaurant: {
    title: 'Restoran Panel',
    subtitle: 'restoran',
    menu: RESTAURANT_MENU,
    color: '#f97316',
    icon: Store,
  },
  ship: {
    title: 'Gemi Tedarik',
    subtitle: 'gemi tedarik',
    menu: SHIP_MENU,
    color: '#0891b2',
    icon: Ship,
  },
}
