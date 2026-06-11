'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, ArrowUpDown, RotateCcw, Search } from 'lucide-react'
import type { SessionStatus } from '@/lib/types'

export type SortOption = 'updated-desc' | 'updated-asc' | 'created-desc' | 'created-asc'

interface FilterBarProps {
  statusFilter: SessionStatus | 'all'
  sortBy: SortOption
  searchQuery: string
  wardFilter: string
  availableWards: string[]
  onStatusFilterChange: (status: SessionStatus | 'all') => void
  onSortChange: (sort: SortOption) => void
  onSearchChange: (query: string) => void
  onWardFilterChange: (ward: string) => void
  onReset: () => void
  sessionCount: number
  totalCount: number
}

export function FilterBar({
  statusFilter,
  sortBy,
  searchQuery,
  wardFilter,
  availableWards,
  onStatusFilterChange,
  onSortChange,
  onSearchChange,
  onWardFilterChange,
  onReset,
  sessionCount,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilters = statusFilter !== 'all' || sortBy !== 'updated-desc' || searchQuery !== '' || wardFilter !== 'all'

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="session-search"
          type="text"
          placeholder="Search by patient name or MRN..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Ward Quick-Filter Pills */}
      {availableWards.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onWardFilterChange('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              wardFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All Wards
          </button>
          {availableWards.map((ward) => (
            <button
              key={ward}
              onClick={() => onWardFilterChange(ward)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                wardFilter === ward
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {ward}
            </button>
          ))}
        </div>
      )}

      {/* Status / Sort / Count Row */}
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
        </div>
      </div>
    </div>
  )
}
