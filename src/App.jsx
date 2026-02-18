import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/authStore'
import { getPortalType } from './utils/subdomain'
import DashboardLayout from './components/layout/DashboardLayout'
import PortalLayout from './components/layout/PortalLayout'
import Login from './pages/auth/Login'

// Admin pages
import Dashboard from './pages/dashboard/Dashboard'
import OrderList from './pages/orders/OrderList'
import OrderDetail from './pages/orders/OrderDetail'
import OrderCreate from './pages/orders/OrderCreate'
import ExcelImport from './pages/orders/ExcelImport'
import CourierList from './pages/couriers/CourierList'
import CourierDetail from './pages/couriers/CourierDetail'
import RouteList from './pages/routes/RouteList'
import RoutePlanning from './pages/routes/RoutePlanning'
import LiveTracking from './pages/tracking/LiveTracking'
import Analytics from './pages/analytics/Analytics'
import Finance from './pages/finance/Finance'
import SettingsPage from './pages/settings/SettingsPage'
import ProjectList from './pages/settings/ProjectList'
import UserList from './pages/users/UserList'
import InventoryDashboard from './pages/inventory/InventoryDashboard'
import Reconciliation from './pages/inventory/Reconciliation'
import EquipmentTracking from './pages/inventory/EquipmentTracking'
import CashRiskDashboard from './pages/inventory/CashRiskDashboard'
import PartnerDashboard from './pages/partners/PartnerDashboard'
import PartnerDetail from './pages/partners/PartnerDetail'
import PartnerCompare from './pages/partners/PartnerCompare'
import TransferRules from './pages/partners/TransferRules'
import OrderTransfer from './pages/partners/OrderTransfer'

// Corporate Portal pages
import CorporatePortal from './pages/corporate/CorporatePortal'

// Ship Chandler pages
import ShipChandler from './pages/corporate/ShipChandler'

// Restaurant Portal pages
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard'
import RestaurantCouriers from './pages/restaurant/RestaurantCouriers'
import RestaurantRouting from './pages/restaurant/RestaurantRouting'
import PoolOrders from './pages/restaurant/PoolOrders'
import RestaurantSettings from './pages/restaurant/RestaurantSettings'
import RestaurantReports from './pages/restaurant/RestaurantReports'

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Yukleniyor...</div>
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AdminRoutes() {
  return (
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="tracking" element={<LiveTracking />} />
      <Route path="orders" element={<OrderList />} />
      <Route path="orders/new" element={<OrderCreate />} />
      <Route path="orders/import" element={<ExcelImport />} />
      <Route path="orders/:orderId" element={<OrderDetail />} />
      <Route path="couriers" element={<CourierList />} />
      <Route path="couriers/:courierId" element={<CourierDetail />} />
      <Route path="routes" element={<RouteList />} />
      <Route path="routes/plan" element={<RoutePlanning />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="finance" element={<Finance />} />
      <Route path="inventory" element={<InventoryDashboard />} />
      <Route path="inventory/reconciliation" element={<Reconciliation />} />
      <Route path="inventory/equipment" element={<EquipmentTracking />} />
      <Route path="inventory/risk" element={<CashRiskDashboard />} />
      <Route path="partners" element={<PartnerDashboard />} />
      <Route path="partners/compare" element={<PartnerCompare />} />
      <Route path="partners/rules" element={<TransferRules />} />
      <Route path="partners/transfer" element={<OrderTransfer />} />
      <Route path="partners/:partnerId" element={<PartnerDetail />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="projects" element={<ProjectList />} />
      <Route path="users" element={<UserList />} />
    </Route>
  )
}

function CorporateRoutes() {
  return (
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <PortalLayout portal="corporate" />
        </ProtectedRoute>
      }
    >
      <Route index element={<CorporatePortal />} />
      <Route path="orders" element={<CorporatePortal />} />
      <Route path="tracking" element={<CorporatePortal />} />
      <Route path="reports" element={<CorporatePortal />} />
      <Route path="invoices" element={<CorporatePortal />} />
      <Route path="settings" element={<CorporatePortal />} />
    </Route>
  )
}

function RestaurantRoutes() {
  return (
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <PortalLayout portal="restaurant" />
        </ProtectedRoute>
      }
    >
      <Route index element={<RestaurantDashboard />} />
      <Route path="orders" element={<RestaurantDashboard />} />
      <Route path="couriers" element={<RestaurantCouriers />} />
      <Route path="routing" element={<RestaurantRouting />} />
      <Route path="pool" element={<PoolOrders />} />
      <Route path="reports" element={<RestaurantReports />} />
      <Route path="settings" element={<RestaurantSettings />} />
    </Route>
  )
}

function ShipRoutes() {
  return (
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <PortalLayout portal="ship" />
        </ProtectedRoute>
      }
    >
      <Route index element={<ShipChandler />} />
      <Route path="requests" element={<ShipChandler />} />
      <Route path="supplies" element={<ShipChandler />} />
      <Route path="deliveries" element={<ShipChandler />} />
      <Route path="partners" element={<ShipChandler />} />
      <Route path="finance" element={<ShipChandler />} />
      <Route path="settings" element={<ShipChandler />} />
    </Route>
  )
}

function App() {
  const portal = getPortalType()

  const getPortalRoutes = () => {
    switch (portal) {
      case 'corporate': return CorporateRoutes()
      case 'restaurant': return RestaurantRoutes()
      case 'ship': return ShipRoutes()
      default: return AdminRoutes()
    }
  }

  const defaultRedirect = portal === 'admin' ? '/dashboard' : '/'

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {getPortalRoutes()}
      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
  )
}

export default App
