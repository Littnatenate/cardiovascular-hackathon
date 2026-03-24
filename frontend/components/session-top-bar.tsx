"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SessionStepList } from "./session-step-list"
import { useState } from "react"

interface SessionTopBarProps {
  patientName: string
  patientId: string
  step: number
  totalSteps?: number
}

export function SessionTopBar({ patientName, patientId, step, totalSteps = 6 }: SessionTopBarProps) {
  const [open, setOpen] = useState(false)
  const progressPercent = (step / totalSteps) * 100

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex w-full items-center gap-3 px-4 py-3">
        
        {/* Mobile Navigation Toggle */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden -ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-6">
            <SheetHeader className="text-left mb-8">
              <SheetTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Session Progress
              </SheetTitle>
            </SheetHeader>
            <SessionStepList onStepClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{patientName}</p>
          <p className="text-xs text-muted-foreground uppercase">{patientId}</p>
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
