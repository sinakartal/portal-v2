import { Check } from 'lucide-react'
import type { TimelineEvent } from '../../types'

interface TimelineProps {
  events: TimelineEvent[]
}

function formatTime(ts: string | null) {
  if (!ts) return null
  const d = new Date(ts)
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      {events.map((event, i) => {
        const isLast = i === events.length - 1
        return (
          <div key={event.event} className="flex gap-3 relative">
            {/* Line */}
            {!isLast && (
              <div className={`absolute left-[11px] top-6 w-0.5 h-full ${event.completed ? 'bg-green-500' : event.active ? 'bg-accent' : 'bg-border-subtle'}`} />
            )}
            {/* Dot */}
            <div className="relative z-10 mt-0.5 shrink-0">
              {event.completed ? (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              ) : event.active ? (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-bg-tertiary border border-border" />
              )}
            </div>
            {/* Content */}
            <div className="pb-6">
              <p className={`text-sm font-medium ${event.active ? 'text-accent' : event.completed ? 'text-text-primary' : 'text-text-muted'}`}>
                {event.label}
              </p>
              {formatTime(event.timestamp) && (
                <p className="text-xs text-text-muted mt-0.5">{formatTime(event.timestamp)}</p>
              )}
              {event.details && Object.entries(event.details).map(([k, v]) => (
                <p key={k} className="text-xs text-text-secondary mt-0.5">{String(v)}</p>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
