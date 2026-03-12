import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCopilotContextStore = defineStore('copilotContext', () => {
  // Dashboard feeds these refs
  const orders = ref([])
  const routes = ref([])
  const couriers = ref([])
  const stats = ref(null)
  const selectedAlgorithms = ref(null)

  function setSimulationData({ orders: o, routes: r, couriers: c, stats: s, algorithms: a }) {
    if (o) orders.value = o
    if (r) routes.value = r
    if (c) couriers.value = c
    if (s) stats.value = s
    if (a) selectedAlgorithms.value = a
  }

  const summary = computed(() => {
    const o = orders.value
    const r = routes.value
    const c = couriers.value
    return {
      totalOrders: o.length,
      pendingOrders: o.filter(x => x.status === 'pending' || x.status === 'new').length,
      activeOrders: o.filter(x => x.status === 'dispatched' || x.status === 'assigned' || x.status === 'in_transit').length,
      deliveredOrders: o.filter(x => x.status === 'delivered').length,
      totalRoutes: r.length,
      totalCouriers: c.length,
      activeCouriers: c.filter(x => x.status === 'active' || x.status === 'busy').length,
    }
  })

  return { orders, routes, couriers, stats, selectedAlgorithms, setSimulationData, summary }
})
