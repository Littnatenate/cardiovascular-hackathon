'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { NavigationHeader } from '@/components/navigation-header'
import { FilterBar, type SortOption } from '@/components/filter-bar'
import { SessionList } from '@/components/session-list'
import { Button } from '@/components/ui/button'
import type { DischargeSession, SessionStatus } from '@/lib/types'
import { Plus, Activity, Clock, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'
import { getSessions, deleteSession } from '@/lib/api'

// ── Recent Activity Item ──
interface RecentActivity {
  id: string
  patientName: string
  action: string
  status: SessionStatus
  timestamp: Date
}

export default function DashboardPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<DischargeSession[]>([])
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [wardFilter, setWardFilter] = useState('all')
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const { toast } = useToast()

  // Load from backend database
  const loadSessions = useCallback(async () => {
    try {
      const data = await getSessions()
      const mapped = data.map((s: any) => ({
        id: s.id,
        patientName: s.patient_name,
        mrn: s.patient_id || 'N/A',
        ward: s.ward || 'N/A',
        bed: s.bed_number || 'N/A',
        status: s.status,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
        assignedNurse: 'Sarah Chen',
      }))
      setSessions(mapped)
      setLastSynced(new Date())
    } catch (err) {
      console.error("Failed to load sessions:", err)
      toast({
        title: 'Connection Error',
        description: 'Could not load sessions from the server. Ensure the backend is running.',
        variant: 'destructive',
      })
    }
  }, [toast])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Extract unique wards from sessions
  const availableWards = useMemo(() => {
    const wards = new Set(sessions.map((s) => s.ward).filter((w) => w && w !== 'N/A'))
    return Array.from(wards).sort()
  }, [sessions])

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions]

    // Apply text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((s) =>
        s.patientName.toLowerCase().includes(q) ||
        (s.mrn && s.mrn.toLowerCase().includes(q))
      )
    }

    // Apply ward filter
    if (wardFilter !== 'all') {
      result = result.filter((s) => s.ward === wardFilter)
    }

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
  }, [sessions, statusFilter, sortBy, searchQuery, wardFilter])

  // Build recent activity feed from latest session updates
  const recentActivity = useMemo<RecentActivity[]>(() => {
    const sorted = [...sessions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    return sorted.slice(0, 5).map((s) => {
      let action = 'Updated'
      if (s.status === 'completed') action = 'Completed'
      else if (s.status === 'escalated') action = 'Escalated'
      else if (s.status === 'draft') action = 'Created (draft)'
      else if (s.status === 'in-progress') action = 'In progress'
      return {
        id: s.id,
        patientName: s.patientName,
        action,
        status: s.status,
        timestamp: s.updatedAt,
      }
    })
  }, [sessions])

  const handleNewSession = () => {
    sessionStorage.removeItem('dischargeSession');
    router.push('/new-session')
  }

  const handleSessionTap = (session: DischargeSession) => {
    sessionStorage.setItem('dischargeSession', JSON.stringify({
      id: session.id,
      patientName: session.patientName,
      patientId: session.mrn || "N/A",
      ward: session.ward,
      bedNumber: session.bed,
    }));
    if (session.status === 'completed' || session.status === 'escalated') {
      sessionStorage.setItem('sessionMaxStep', "5");
    } else {
      sessionStorage.removeItem('sessionMaxStep');
    }
    router.push(`/home-meds?session_id=${session.id}`)
  }

  const handleArchive = async (session: DischargeSession) => {
    try {
      await deleteSession(session.id)
      setSessions((prev) => prev.filter((s) => s.id !== session.id))
      toast({
        title: 'Session Archived',
        description: `${session.patientName}'s session has been archived.`,
      })
    } catch (err) {
      console.error("Failed to archive session:", err)
      toast({
        title: 'Archive Failed',
        description: 'Could not archive this session. Please try again.',
        variant: 'destructive',
      })
    }
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
    setSearchQuery('')
    setWardFilter('all')
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

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  // Status dot color mapping
  const statusDotColor = (status: SessionStatus) => {
    switch (status) {
      case 'in-progress': return 'bg-status-in-progress'
      case 'completed': return 'bg-status-completed'
      case 'escalated': return 'bg-status-escalated'
      case 'draft': return 'bg-status-draft'
    }
  }

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
            searchQuery={searchQuery}
            wardFilter={wardFilter}
            availableWards={availableWards}
            onStatusFilterChange={setStatusFilter}
            onSortChange={setSortBy}
            onSearchChange={setSearchQuery}
            onWardFilterChange={setWardFilter}
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

        {/* Recent Activity Feed */}
        {recentActivity.length > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Activity
              </h2>
            </div>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleSessionTap({
                    id: activity.id,
                    patientName: activity.patientName,
                    ward: 'N/A',
                    bed: 'N/A',
                    status: activity.status,
                    createdAt: activity.timestamp,
                    updatedAt: activity.timestamp,
                  } as DischargeSession)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${statusDotColor(activity.status)}`} />
                    <span className="font-medium text-foreground">{activity.patientName}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">{activity.action}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(activity.timestamp)}</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>Last synced: {lastSynced ? formatRelativeTime(lastSynced) : 'Syncing...'}</span>
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
