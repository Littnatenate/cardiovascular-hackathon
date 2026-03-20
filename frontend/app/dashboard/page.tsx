'use client'

import { useState, useMemo } from 'react'
import { NavigationHeader } from '@/components/navigation-header'
import { FilterBar, type SortOption } from '@/components/filter-bar'
import { SessionList } from '@/components/session-list'
import { Button } from '@/components/ui/button'
import { currentNurse, dischargeSessions } from '@/lib/mock-data'
import type { DischargeSession, SessionStatus } from '@/lib/types'
import { Plus, Activity } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<DischargeSession[]>(dischargeSessions)
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc')
  const { toast } = useToast()

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
    router.push('/new-session')
  }

  const handleSessionTap = (session: DischargeSession) => {
    // For the demo, all sessions lead to the Review flow
    router.push('/medication-review')
  }

  const handleArchive = (session: DischargeSession) => {
    setSessions((prev) => prev.filter((s) => s.id !== session.id))
    toast({
      title: 'Session Archived',
      description: `${session.patientName}'s session has been archived.`,
    })
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
      <NavigationHeader nurse={currentNurse} onLogout={handleLogout} />

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
          />
        </div>

        {/* Session List */}
        <SessionList
          sessions={filteredSessions}
          onSessionTap={handleSessionTap}
          onArchive={handleArchive}
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
