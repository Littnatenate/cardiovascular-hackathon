"use client"

import { CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SessionHeaderProps {
  patientName: string
  dateTime: string
  onBackToDashboard: () => void
}

export function SessionHeader({ patientName, dateTime, onBackToDashboard }: SessionHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackToDashboard}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success">
            <CheckCircle2 className="h-6 w-6 text-success-foreground" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
              Session Complete
            </h1>
            <p className="text-muted-foreground">
              {patientName} &middot; {dateTime}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
