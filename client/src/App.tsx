import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { AdminLayout } from './layouts/AdminLayout'
import { MerchantLayout } from './layouts/MerchantLayout'

// Lazy load pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const TenantsPage = lazy(() => import('./pages/admin/TenantsPage').then(m => ({ default: m.TenantsPage })))
const TenantDetailPage = lazy(() => import('./pages/admin/TenantDetailPage').then(m => ({ default: m.TenantDetailPage })))
const MerchantDashboard = lazy(() => import('./pages/merchant/MerchantDashboard').then(m => ({ default: m.MerchantDashboard })))
const OrdersPage = lazy(() => import('./pages/merchant/OrdersPage').then(m => ({ default: m.OrdersPage })))
const SLAPage = lazy(() => import('./pages/merchant/SLAPage').then(m => ({ default: m.SLAPage })))
const BillingPage = lazy(() => import('./pages/merchant/BillingPage').then(m => ({ default: m.BillingPage })))
const SettingsPage = lazy(() => import('./pages/merchant/SettingsPage').then(m => ({ default: m.SettingsPage })))
const TrackingPage = lazy(() => import('./pages/tracking/TrackingPage').then(m => ({ default: m.TrackingPage })))

function Loading() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ role, children }: { role: 'admin' | 'merchant'; children: React.ReactNode }) {
  const { isAuthenticated, role: userRole } = useAuth()
  if (!isAuthenticated || userRole !== role) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/track/:orderId" element={<TrackingPage />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="tenants/:projectId" element={<TenantDetailPage />} />
        </Route>

        {/* Merchant */}
        <Route path="/merchant" element={<ProtectedRoute role="merchant"><MerchantLayout /></ProtectedRoute>}>
          <Route index element={<MerchantDashboard />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="sla" element={<SLAPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
