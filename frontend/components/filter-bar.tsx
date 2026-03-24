'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, ArrowUpDown, RotateCcw } from 'lucide-react'
import type { SessionStatus } from '@/lib/types'

export type SortOption = 'updated-desc' | 'updated-asc' | 'created-desc' | 'created-asc'

interface FilterBarProps {
  statusFilter: SessionStatus | 'all'
  sortBy: SortOption
  onStatusFilterChange: (status: SessionStatus | 'all') => void
  onSortChange: (sort: SortOption) => void
  onReset: () => void
  sessionCount: number
  totalCount: number
  children?: React.ReactNode
}

export function FilterBar({
  statusFilter,
  sortBy,
  onStatusFilterChange,
  onSortChange,
  onReset,
  sessionCount,
  totalCount,
  children,
}: FilterBarProps) {
  const hasActiveFilters = statusFilter !== 'all' || sortBy !== 'updated-desc'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Session Count */}
      <div className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">{sessionCount}</span> of{' '}
        <span className="font-medium text-foreground">{totalCount}</span>{' '}
        sessions
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            onStatusFilterChange(value as SessionStatus | 'all')
          }
        >
          <SelectTrigger className="w-[140px] bg-card">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-[160px] bg-card">
            <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated-desc">Last Updated</SelectItem>
            <SelectItem value="updated-asc">Oldest Updated</SelectItem>
            <SelectItem value="created-desc">Newest Created</SelectItem>
            <SelectItem value="created-asc">Oldest Created</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset filters</span>
          </Button>
        )}

        {/* Slot for Bulk Actions */}
        {children}
      </div>
    </div>
  )
}
