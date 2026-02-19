import { createRouter, createWebHistory } from 'vue-router'
import { getPortalType } from '@/utils/subdomain'

const Login = () => import('@/pages/auth/Login.vue')

function getRoutes() {
  const portal = getPortalType()

  const commonRoutes = [
    { path: '/login', name: 'login', component: Login },
  ]

  if (portal === 'corporate') {
    return [
      ...commonRoutes,
      {
        path: '/',
        component: () => import('@/components/layout/PortalLayout.vue'),
        props: { portal: 'corporate' },
        meta: { requiresAuth: true },
        children: [
          { path: '', component: () => import('@/pages/corporate/CorporatePortal.vue') },
          { path: 'orders', component: () => import('@/pages/corporate/CorporatePortal.vue') },
          { path: 'tracking', component: () => import('@/pages/corporate/CorporatePortal.vue') },
          { path: 'reports', component: () => import('@/pages/corporate/CorporatePortal.vue') },
          { path: 'invoices', component: () => import('@/pages/corporate/CorporatePortal.vue') },
          { path: 'settings', component: () => import('@/pages/corporate/CorporatePortal.vue') },
        ],
      },
    ]
  }

  if (portal === 'restaurant') {
    return [
      ...commonRoutes,
      {
        path: '/',
        component: () => import('@/components/layout/PortalLayout.vue'),
        props: { portal: 'restaurant' },
        meta: { requiresAuth: true },
        children: [
          { path: '', component: () => import('@/pages/restaurant/RestaurantDashboard.vue') },
          { path: 'orders', component: () => import('@/pages/restaurant/RestaurantDashboard.vue') },
          { path: 'couriers', component: () => import('@/pages/restaurant/RestaurantCouriers.vue') },
          { path: 'routing', component: () => import('@/pages/restaurant/RestaurantRouting.vue') },
          { path: 'pool', component: () => import('@/pages/restaurant/PoolOrders.vue') },
          { path: 'reports', component: () => import('@/pages/restaurant/RestaurantReports.vue') },
          { path: 'settings', component: () => import('@/pages/restaurant/RestaurantSettings.vue') },
        ],
      },
    ]
  }

  if (portal === 'ship') {
    return [
      ...commonRoutes,
      {
        path: '/',
        component: () => import('@/components/layout/PortalLayout.vue'),
        props: { portal: 'ship' },
        meta: { requiresAuth: true },
        children: [
          { path: '', component: () => import('@/pages/corporate/ShipChandler.vue') },
          { path: 'requests', component: () => import('@/pages/corporate/ShipChandler.vue') },
          { path: 'supplies', component: () => import('@/pages/corporate/ShipChandler.vue') },
          { path: 'deliveries', component: () => import('@/pages/corporate/ShipChandler.vue') },
          { path: 'partners', component: () => import('@/pages/corporate/ShipChandler.vue') },
          { path: 'finance', component: () => import('@/pages/corporate/ShipChandler.vue') },
          { path: 'settings', component: () => import('@/pages/corporate/ShipChandler.vue') },
        ],
      },
    ]
  }

  // Default: Admin routes
  return [
    ...commonRoutes,
    {
      path: '/',
      component: () => import('@/components/layout/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('@/pages/dashboard/Dashboard.vue') },
        { path: 'tracking', component: () => import('@/pages/tracking/LiveTracking.vue') },
        { path: 'orders', component: () => import('@/pages/orders/OrderList.vue') },
        { path: 'orders/new', component: () => import('@/pages/orders/OrderCreate.vue') },
        { path: 'orders/import', component: () => import('@/pages/orders/ExcelImport.vue') },
        { path: 'orders/:orderId', component: () => import('@/pages/orders/OrderDetail.vue'), props: true },
        { path: 'couriers', component: () => import('@/pages/couriers/CourierList.vue') },
        { path: 'couriers/:courierId', component: () => import('@/pages/couriers/CourierDetail.vue'), props: true },
        { path: 'routes', component: () => import('@/pages/routes/RouteList.vue') },
        { path: 'routes/plan', component: () => import('@/pages/routes/RoutePlanning.vue') },
        { path: 'analytics', component: () => import('@/pages/analytics/Analytics.vue') },
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

router.beforeEach((to, from, next) => {
  // Cross-subdomain auth: pick up token & user from URL params
  const urlToken = to.query.auth_token
  const urlUser = to.query.auth_user
  if (urlToken && urlUser) {
    localStorage.setItem('bringo_token', urlToken)
    localStorage.setItem('bringo_user', decodeURIComponent(urlUser))
    // Remove auth params from URL and continue
    const { auth_token, auth_user, ...rest } = to.query
    return next({ path: to.path, query: rest, replace: true })
  }

  const token = localStorage.getItem('bringo_token')
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
