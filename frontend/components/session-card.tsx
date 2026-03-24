'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { formatRelativeTime } from '@/lib/mock-data'
import type { DischargeSession } from '@/lib/types'
import {
  MapPin,
  Clock,
  ChevronRight,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: DischargeSession
  onTap?: (session: DischargeSession) => void
  onDelete?: (session: DischargeSession) => void
  isSelected?: boolean
  onSelect?: (id: string, checked: boolean) => void
  isSelectMode?: boolean
}

export function SessionCard({ 
  session, 
  onTap, 
  onDelete,
  isSelected = false,
  onSelect,
  isSelectMode = false
}: SessionCardProps) {
  const [isMounted, setIsMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleDeleteClick = () => {
    onDelete?.(session)
  }

  return (
    <div className="group relative overflow-hidden rounded-xl">
      <Card
        ref={cardRef}
        className={cn(
          'cursor-pointer border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md',
          isSelectMode ? 'pl-12' : 'pl-4',
          session.status === 'escalated' && 'border-l-4 border-l-destructive',
          isSelected && 'bg-primary/5 border-primary ring-1 ring-primary/20'
        )}
        onClick={() => {
          if (isSelectMode) {
            onSelect?.(session.id, !isSelected)
          } else {
            onTap?.(session)
          }
        }}
      >
        <CardContent className="p-4 pl-0">
          {/* Checkbox Overlay */}
          {isSelectMode && (
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect?.(session.id, e.target.checked)}
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer transition-transform hover:scale-110"
              />
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            {/* Patient Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-foreground">
                  {session.patientName}
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                  {session.mrn}
                </span>
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

            {/* Actions & Status */}
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={session.status} />
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete session</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {session.patientName}'s session? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteClick}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created: {isMounted ? formatRelativeTime(session.createdAt) : '...'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Updated: {isMounted ? formatRelativeTime(session.updatedAt) : '...'}</span>
            </div>
          </div>

          {/* Notes preview for escalated */}
          {session.status === 'escalated' && session.notes && (
            <p className="mt-2 line-clamp-2 rounded-md bg-destructive/5 px-2 py-1.5 text-xs text-destructive">
              {session.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
