'use client'

import { useState, useMemo, useEffect } from 'react'
import { NavigationHeader } from '@/components/navigation-header'
import { FilterBar, type SortOption } from '@/components/filter-bar'
import { SessionList } from '@/components/session-list'
import { Button } from '@/components/ui/button'
import { currentNurse, dischargeSessions } from '@/lib/mock-data'
import type { DischargeSession, SessionStatus } from '@/lib/types'
import { Plus, Activity, Trash2 } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<DischargeSession[]>([])
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)
  const { toast } = useToast()

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('medsafe_sessions')
    if (saved) {
      const parsed = JSON.parse(saved).map((s: any) => ({
        ...s,
        updatedAt: new Date(s.updatedAt),
        createdAt: new Date(s.createdAt)
      }))
      setSessions(parsed)
    } else {
      setSessions(dischargeSessions)
      localStorage.setItem('medsafe_sessions', JSON.stringify(dischargeSessions))
    }
  }, [])

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions]

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'updated-desc':
          return b.updatedAt.getTime() - a.updatedAt.getTime()
        case 'updated-asc':
          return a.updatedAt.getTime() - b.updatedAt.getTime()
        case 'created-desc':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'created-asc':
          return a.createdAt.getTime() - b.createdAt.getTime()
        default:
          return 0
      }
    })

    return result
  }, [sessions, statusFilter, sortBy])

  const handleNewSession = () => {
    sessionStorage.removeItem('dischargeSession');
    router.push('/new-session')
  }

  const handleSessionTap = (session: DischargeSession) => {
    // Navigate to the start of the process
    sessionStorage.setItem('dischargeSession', JSON.stringify({
      id: session.id,
      patientName: session.patientName,
      patientId: (session as any).mrn || "N/A",
      ward: session.ward,
      bedNumber: session.bed,
    }));
    
    // If returning to a completed/escalated session, unlock all steps
    if (session.status === 'completed' || session.status === 'escalated') {
      localStorage.setItem(`medsafe_step_${session.id}`, "5");
    }
    
    router.push('/home-meds')
  }

  const handleDelete = (session: DischargeSession) => {
    const updatedSessions = sessions.filter((s) => s.id !== session.id)
    setSessions(updatedSessions)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(session.id)
      return next
    })
    localStorage.setItem('medsafe_sessions', JSON.stringify(updatedSessions))
    toast({
      title: 'Session Deleted',
      description: `${session.patientName}'s session has been removed.`,
    })
  }

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSessions.map((s) => s.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleDeleteSelected = () => {
    const updatedSessions = sessions.filter((s) => !selectedIds.has(s.id))
    setSessions(updatedSessions)
    localStorage.setItem('medsafe_sessions', JSON.stringify(updatedSessions))
    toast({
      title: selectedIds.size === 1 ? 'Session Deleted' : 'Sessions Deleted',
      description: `${selectedIds.size} session${selectedIds.size === 1 ? '' : 's'} have been removed.`,
    })
    setSelectedIds(new Set())
  }

  const handleLogout = () => {
    toast({
      title: 'Logging out...',
      description: 'You will be redirected to the login page.',
    })
  }

  const resetFilters = () => {
    setStatusFilter('all')
    setSortBy('updated-desc')
    setSelectedIds(new Set())
    setIsSelectMode(false)
  }

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: sessions.length,
      inProgress: sessions.filter((s) => s.status === 'in-progress').length,
      completed: sessions.filter((s) => s.status === 'completed').length,
      escalated: sessions.filter((s) => s.status === 'escalated').length,
      draft: sessions.filter((s) => s.status === 'draft').length,
    }
  }, [sessions])

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Discharge Sessions
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage patient discharge sessions for your current shift
            </p>
          </div>

          {/* New Session Button */}
          <Button
            onClick={handleNewSession}
            size="lg"
            className="gap-2 shadow-md"
          >
            <Plus className="h-5 w-5" />
            New Discharge Session
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickStatCard
            label="In Progress"
            value={stats.inProgress}
            color="bg-status-in-progress"
          />
          <QuickStatCard
            label="Completed"
            value={stats.completed}
            color="bg-status-completed"
          />
          <QuickStatCard
            label="Escalated"
            value={stats.escalated}
            color="bg-status-escalated"
          />
          <QuickStatCard
            label="Draft"
            value={stats.draft}
            color="bg-status-draft"
          />
        </div>

        {/* Filter Bar */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <FilterBar
            statusFilter={statusFilter}
            sortBy={sortBy}
            onStatusFilterChange={setStatusFilter}
            onSortChange={setSortBy}
            onReset={resetFilters}
            sessionCount={filteredSessions.length}
            totalCount={sessions.length}
          >
            <div className="flex items-center gap-2 border-l border-border pl-4">
              {selectedIds.size > 0 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedIds.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedIds.size} Session{selectedIds.size === 1 ? '' : 's'}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {selectedIds.size === 1 ? 'this session' : 'these sessions'}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {selectedIds.size === 1 ? 'Delete Session' : 'Delete All'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button 
                  variant={isSelectMode ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => {
                    setIsSelectMode(!isSelectMode)
                    setSelectedIds(new Set())
                  }}
                >
                  {isSelectMode ? "Cancel Select" : "Select Sessions"}
                </Button>
              )}
            </div>
          </FilterBar>
        </div>

        {/* Bulk Selection Info */}
        {isSelectMode && filteredSessions.length > 0 && (
          <div className="mb-3 flex items-center gap-2 px-1 animate-in fade-in slide-in-from-top-1">
            <input
              type="checkbox"
              id="select-all"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              checked={selectedIds.size === filteredSessions.length && filteredSessions.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <label htmlFor="select-all" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select All'}
            </label>
          </div>
        )}

        {/* Session List */}
        <SessionList
          sessions={filteredSessions}
          onSessionTap={handleSessionTap}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          isSelectMode={isSelectMode}
        />

        {/* Activity Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>Last synced: Just now</span>
        </div>
      </main>

      <Toaster />
    </div>
  )
}

interface QuickStatCardProps {
  label: string
  value: number
  color: string
}

function QuickStatCard({ label, value, color }: QuickStatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className={`h-3 w-3 rounded-full ${color}`} />
      <div>
        <p className="text-lg font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
