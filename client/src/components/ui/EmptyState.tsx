import { Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
        <Icon size={28} className="text-text-muted" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-sm mb-4">{description}</p>}
      {action && <Button variant="secondary" onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
