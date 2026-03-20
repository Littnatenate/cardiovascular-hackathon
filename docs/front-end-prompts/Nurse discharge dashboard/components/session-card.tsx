'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { formatRelativeTime } from '@/lib/mock-data'
import type { DischargeSession } from '@/lib/types'
import {
  MapPin,
  Clock,
  ChevronRight,
  Archive,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: DischargeSession
  onTap?: (session: DischargeSession) => void
  onArchive?: (session: DischargeSession) => void
}

export function SessionCard({ session, onTap, onArchive }: SessionCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [showArchive, setShowArchive] = useState(false)
  const startX = useRef<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const currentX = e.touches[0].clientX
    const diff = startX.current - currentX
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 100))
    }
  }

  const handleTouchEnd = () => {
    if (swipeOffset > 60) {
      setShowArchive(true)
      setSwipeOffset(80)
    } else {
      setSwipeOffset(0)
      setShowArchive(false)
    }
    startX.current = null
  }

  const handleArchiveClick = () => {
    onArchive?.(session)
    setSwipeOffset(0)
    setShowArchive(false)
  }

  const resetSwipe = () => {
    setSwipeOffset(0)
    setShowArchive(false)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Archive Action Background */}
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-end bg-destructive/10 transition-opacity',
          showArchive ? 'opacity-100' : 'opacity-0'
        )}
        style={{ width: swipeOffset }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 h-10 w-10 text-destructive hover:bg-destructive/20 hover:text-destructive"
          onClick={handleArchiveClick}
        >
          <Archive className="h-5 w-5" />
          <span className="sr-only">Archive session</span>
        </Button>
      </div>

      {/* Card */}
      <Card
        ref={cardRef}
        className={cn(
          'cursor-pointer border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md',
          session.status === 'escalated' && 'border-l-4 border-l-destructive'
        )}
        style={{ transform: `translateX(-${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (swipeOffset === 0) {
            onTap?.(session)
          } else {
            resetSwipe()
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Patient Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-foreground">
                  {session.patientName}
                </h3>
                {session.status === 'escalated' && (
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {session.ward} / {session.bed}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <StatusBadge status={session.status} />
          </div>

          {/* Timestamps */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created: {formatRelativeTime(session.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Updated: {formatRelativeTime(session.updatedAt)}</span>
            </div>
          </div>

          {/* Notes preview for escalated */}
          {session.status === 'escalated' && session.notes && (
            <p className="mt-2 line-clamp-2 rounded-md bg-destructive/5 px-2 py-1.5 text-xs text-destructive">
              {session.notes}
            </p>
          )}

          {/* Tap indicator */}
          <div className="absolute bottom-4 right-4 opacity-50">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
