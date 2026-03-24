"use client"

import { SessionStepList } from "./session-step-list"

export function SessionSidebar() {
  return (
    <div className="w-64 flex-shrink-0 border-r border-border bg-card/50 min-h-screen p-6 hidden md:block">
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">
          Session Progress
        </h2>
        <p className="text-xs text-muted-foreground">
          Complete all steps to finalize
        </p>
      </div>

      <SessionStepList />
    </div>
  )
}
