import { cn } from '@/lib/utils'
import type { SessionStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: SessionStatus
  className?: string
}

const statusConfig: Record<
  SessionStatus,
  { label: string; className: string }
> = {
  'in-progress': {
    label: 'In Progress',
    className: 'bg-status-in-progress text-status-in-progress-foreground',
  },
  completed: {
    label: 'Completed',
    className: 'bg-status-completed text-status-completed-foreground',
  },
  escalated: {
    label: 'Escalated',
    className: 'bg-status-escalated text-status-escalated-foreground',
  },
  draft: {
    label: 'Draft',
    className: 'bg-status-draft text-status-draft-foreground',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
