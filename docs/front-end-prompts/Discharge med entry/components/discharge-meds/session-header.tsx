"use client"

import { User, Hash } from "lucide-react"

interface SessionHeaderProps {
  patientName: string
  sessionId: string
}

export function SessionHeader({ patientName, sessionId }: SessionHeaderProps) {
  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{patientName}</p>
          <p className="text-xs text-muted-foreground leading-tight">Patient</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 bg-muted rounded-md px-2.5 py-1">
        <Hash className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">{sessionId}</span>
      </div>
    </header>
  )
}
