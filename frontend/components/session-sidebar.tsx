"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, ClipboardList, Pill, ScanSearch, FileText, FileCheck, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

const SESSION_STEPS = [
  { id: "new-session", label: "Patient Setup", href: "/new-session", icon: ClipboardList },
  { id: "home-meds", label: "Home Meds", href: "/home-meds", icon: Pill },
  { id: "discharge-meds", label: "Discharge Meds", href: "/discharge-meds", icon: FileText },
  { id: "review", label: "Review", href: "/medication-review", icon: ScanSearch },
  { id: "ai-comparison", label: "AI Results", href: "/ai-comparison", icon: FileCheck },
  { id: "instructions", label: "Instructions", href: "#", icon: Stethoscope },
]

export function SessionSidebar() {
  const pathname = usePathname()

  // Find current step index
  const currentIndex = SESSION_STEPS.findIndex(step => pathname.includes(step.href))
  
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

      <div className="relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-border -z-10" />

        <ul className="space-y-6">
          {SESSION_STEPS.map((step, index) => {
            const isActive = currentIndex === index
            const isCompleted = currentIndex > index
            const isFuture = currentIndex < index
            const Icon = step.icon

            return (
              <li key={step.id} className="relative">
                <Link
                  href={isFuture ? "#" : step.href}
                  className={cn(
                    "flex items-center gap-3 group",
                    isFuture && "pointer-events-none opacity-50"
                  )}
                >
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-200 bg-card",
                      isActive && "border-primary text-primary shadow-sm",
                      isCompleted && "border-primary/50 bg-primary/10 text-primary",
                      isFuture && "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors duration-200",
                        isActive && "text-primary",
                        isCompleted && "text-foreground",
                        isFuture && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] uppercase font-bold text-primary/70 tracking-wider">
                        Current Step
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
