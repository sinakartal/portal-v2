import { createRouter, createWebHistory } from 'vue-router'

const Login = () => import('@/pages/auth/Login.vue')

function getRoutes() {
  return [
    { path: '/login', name: 'login', component: Login },
    {
      path: '/',
      component: () => import('@/components/layout/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('@/pages/dashboard/Dashboard.vue') },
        { path: 'live-map', name: 'live-map', component: () => import('@/pages/dashboard/Dashboard.vue') },
        { path: 'pricing', name: 'pricing', component: () => import('@/pages/dashboard/Dashboard.vue') },
        { path: 'algorithm', name: 'algorithm', component: () => import('@/pages/dashboard/Dashboard.vue') },
        { path: 'orders', component: () => import('@/pages/orders/OrderList.vue') },
        { path: 'orders/new', component: () => import('@/pages/orders/OrderCreate.vue') },
        { path: 'orders/import', component: () => import('@/pages/orders/ExcelImport.vue') },
        { path: 'orders/:orderId', component: () => import('@/pages/orders/OrderDetail.vue'), props: true },
        { path: 'couriers', component: () => import('@/pages/couriers/CourierList.vue') },
        { path: 'couriers/:courierId', component: () => import('@/pages/couriers/CourierDetail.vue'), props: true },
        { path: 'routes', component: () => import('@/pages/routes/RouteList.vue') },
        { path: 'routes/plan', component: () => import('@/pages/routes/RoutePlanning.vue') },
        { path: 'analytics', component: () => import('@/pages/analytics/Analytics.vue') },
        { path: 'reports', component: () => import('@/pages/reports/Reports.vue') },
        { path: 'finance', component: () => import('@/pages/finance/Finance.vue') },
        { path: 'inventory', component: () => import('@/pages/inventory/InventoryDashboard.vue') },
        { path: 'inventory/reconciliation', component: () => import('@/pages/inventory/Reconciliation.vue') },
        { path: 'inventory/equipment', component: () => import('@/pages/inventory/EquipmentTracking.vue') },
        { path: 'inventory/risk', component: () => import('@/pages/inventory/CashRiskDashboard.vue') },
        { path: 'partners', component: () => import('@/pages/partners/PartnerDashboard.vue') },
        { path: 'partners/compare', component: () => import('@/pages/partners/PartnerCompare.vue') },
        { path: 'partners/rules', component: () => import('@/pages/partners/TransferRules.vue') },
        { path: 'partners/transfer', component: () => import('@/pages/partners/OrderTransfer.vue') },
        { path: 'partners/:partnerId', component: () => import('@/pages/partners/PartnerDetail.vue'), props: true },
        { path: 'offers', component: () => import('@/pages/offers/OfferList.vue') },
        { path: 'checkout-preview', component: () => import('@/pages/checkout/CheckoutPreview.vue') },
        { path: 'incentives', component: () => import('@/pages/incentives/IncentiveDashboard.vue') },
        { path: 'tenants', component: () => import('@/pages/tenants/TenantManagement.vue') },
        { path: 'settings', component: () => import('@/pages/settings/SettingsPage.vue') },
        { path: 'projects', component: () => import('@/pages/settings/ProjectList.vue') },
        { path: 'users', component: () => import('@/pages/users/UserList.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ]
}

const router = createRouter({
  history: createWebHistory(),
  routes: getRoutes(),
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()
    const valid = await auth.verifyToken()
    if (!valid) return next('/login')
  }
  next()
})

export default router
