"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SessionTopBarProps {
  patientName: string
  sessionId: string
  step: number
  totalSteps?: number
  backRoute: string
}

export function SessionTopBar({ patientName, sessionId, step, totalSteps = 4, backRoute }: SessionTopBarProps) {
  const router = useRouter()
  const progressPercent = (step / totalSteps) * 100

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex w-full items-center gap-3 px-4 py-3">
        <button
          onClick={() => router.push(backRoute)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only sm:not-sr-only">Back</span>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{patientName}</p>
          <p className="text-xs text-muted-foreground">{sessionId}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            Step {step} of {totalSteps}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted" aria-hidden="true">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>
    </header>
  )
}
