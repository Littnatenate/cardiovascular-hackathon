'use client'

import { SessionCard } from '@/components/session-card'
import type { DischargeSession } from '@/lib/types'
import { FileText, AlertCircle } from 'lucide-react'

interface SessionListProps {
  sessions: DischargeSession[]
  onSessionTap?: (session: DischargeSession) => void
  onDelete?: (session: DischargeSession) => void
  selectedIds?: Set<string>
  onSelect?: (id: string, checked: boolean) => void
  isSelectMode?: boolean
  isLoading?: boolean
}

export function SessionList({
  sessions,
  onSessionTap,
  onDelete,
  selectedIds,
  onSelect,
  isSelectMode,
  isLoading,
}: SessionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-card"
          />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileText className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">
          No sessions found
        </h3>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          No discharge sessions match your current filters.
          <br />
          Try adjusting your filters or create a new session.
        </p>
      </div>
    )
  }

  // Group sessions by priority (escalated first, then in-progress, then others)
  const escalatedSessions = sessions.filter((s) => s.status === 'escalated')
  const otherSessions = sessions.filter((s) => s.status !== 'escalated')

  return (
    <div className="space-y-3">
      {/* Escalated Alert Banner */}
      {escalatedSessions.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{escalatedSessions.length}</strong> escalated session
            {escalatedSessions.length > 1 ? 's' : ''} requiring attention
          </span>
        </div>
      )}

      {/* Session Cards */}
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onTap={onSessionTap}
          onDelete={onDelete}
          isSelected={selectedIds?.has(session.id)}
          onSelect={onSelect}
          isSelectMode={isSelectMode}
        />
      ))}
    </div>
  )
}
