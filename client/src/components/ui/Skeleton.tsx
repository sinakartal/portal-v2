interface SkeletonProps {
  variant?: 'card' | 'row' | 'kpi' | 'text'
  count?: number
}

export function Skeleton({ variant = 'row', count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count })

  if (variant === 'kpi') {
    return (
      <div className="grid grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="bg-bg-secondary border border-border-subtle rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-bg-tertiary rounded w-24 mb-4" />
            <div className="h-8 bg-bg-tertiary rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div key={i} className="bg-bg-secondary border border-border-subtle rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-bg-tertiary rounded w-1/3 mb-3" />
            <div className="h-3 bg-bg-tertiary rounded w-2/3 mb-2" />
            <div className="h-3 bg-bg-tertiary rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((_, i) => (
        <div key={i} className="h-10 bg-bg-tertiary rounded-lg animate-pulse" />
      ))}
    </div>
  )
}
