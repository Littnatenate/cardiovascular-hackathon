"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { label: "Discharge Meds", short: "Discharge" },
  { label: "Home Meds", short: "Home" },
  { label: "Review", short: "Review" },
  { label: "Results", short: "Results" },
]

interface StepProgressProps {
  currentStep: number // 1-indexed
}

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const stepNum = i + 1
          const isDone = stepNum < currentStep
          const isActive = stepNum === currentStep
          const isLast = i === STEPS.length - 1

          return (
            <div key={step.label} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    isDone && "bg-primary/20 text-primary",
                    isActive && "bg-primary text-primary-foreground shadow-sm",
                    !isDone && !isActive && "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-tight text-center whitespace-nowrap",
                    isActive && "text-primary",
                    isDone && "text-primary/70",
                    !isDone && !isActive && "text-muted-foreground"
                  )}
                >
                  {step.short}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-px flex-1 mx-1.5 mb-4 transition-colors",
                    isDone ? "bg-primary/40" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
