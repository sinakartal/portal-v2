import { Timeline } from '../ui/Timeline'
import type { TimelineEvent } from '../../types'

interface OrderTimelineProps {
  events?: TimelineEvent[]
  status?: string
}

const defaultTimeline: TimelineEvent[] = [
  { event: 'created', label: 'Siparis Alindi', timestamp: null, completed: false, active: false },
  { event: 'assigned', label: 'Kuryeye Atandi', timestamp: null, completed: false, active: false },
  { event: 'picked_up', label: 'Magazadan Alindi', timestamp: null, completed: false, active: false },
  { event: 'in_transit', label: 'Yolda', timestamp: null, completed: false, active: false },
  { event: 'delivered', label: 'Teslim Edildi', timestamp: null, completed: false, active: false },
]

const statusOrder = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']

export function OrderTimeline({ events, status }: OrderTimelineProps) {
  if (events && events.length > 0) {
    return <Timeline events={events} />
  }

  // Generate timeline from status
  const currentIdx = status ? statusOrder.indexOf(status) : -1
  const generated = defaultTimeline.map((step, i) => ({
    ...step,
    completed: i < currentIdx || (i === currentIdx && status === 'delivered'),
    active: i === currentIdx && status !== 'delivered',
  }))

  return <Timeline events={generated} />
}
