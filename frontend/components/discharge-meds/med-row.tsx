"use client"

import { useState, useRef } from "react"
import { Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { DrugAutocomplete } from "./drug-autocomplete"

export interface Medication {
  id: string
  drugName: string
  strength: string
  dose: string
  frequency: string
  route: string
}

const ROUTES = ["Oral", "Subcutaneous", "IV", "IM", "Topical", "Inhaled", "Sublingual", "Rectal"]
const FREQUENCIES = [
  "Once daily", "Once daily (morning)", "Once daily (night)",
  "Twice daily", "Three times daily", "Four times daily",
  "Every 6 hours", "Every 8 hours", "Every 12 hours",
  "As needed", "Weekly", "Monthly",
]

interface MedRowProps {
  med: Medication
  onUpdate: (id: string, field: keyof Medication, value: string) => void
  onDelete: (id: string) => void
  index: number
}

export function MedRow({ med, onUpdate, onDelete, index }: MedRowProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)
  const rowRef = useRef<HTMLDivElement>(null)

  const SWIPE_THRESHOLD = 80

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsSwiping(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - startX.current
    if (delta < 0) {
      setSwipeX(Math.max(delta, -SWIPE_THRESHOLD - 20))
      setIsSwiping(true)
    }
  }

  const handleTouchEnd = () => {
    if (swipeX < -SWIPE_THRESHOLD / 2) {
      setSwipeX(-SWIPE_THRESHOLD)
    } else {
      setSwipeX(0)
    }
    setIsSwiping(false)
  }

  const resetSwipe = () => setSwipeX(0)

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete reveal */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-20 bg-destructive flex items-center justify-center rounded-r-lg transition-opacity",
          swipeX <= -SWIPE_THRESHOLD / 2 ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          type="button"
          onClick={() => onDelete(med.id)}
          className="flex flex-col items-center gap-0.5 text-destructive-foreground"
          aria-label={`Delete ${med.drugName || "medication"}`}
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Delete</span>
        </button>
      </div>

      {/* Row content */}
      <div
        ref={rowRef}
        style={{ transform: `translateX(${swipeX}px)` }}
        className={cn(
          "bg-card border border-border rounded-lg p-3 transition-transform",
          isSwiping ? "transition-none" : "transition-transform duration-200"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={swipeX < 0 ? resetSwipe : undefined}
      >
        <div className="flex items-start gap-2">
          {/* Drag handle + index */}
          <div className="flex flex-col items-center gap-0.5 pt-1.5 flex-shrink-0">
            <GripVertical className="w-4 h-4 text-muted-foreground/40" />
            <span className="text-[10px] font-bold text-muted-foreground">{index + 1}</span>
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            {/* Drug name — full width */}
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                Drug Name
              </label>
              <DrugAutocomplete
                value={med.drugName}
                onChange={(v) => onUpdate(med.id, "drugName", v)}
                placeholder="Search drug…"
                className="w-full"
              />
            </div>

            {/* Strength + Dose side by side */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Strength
                </label>
                <input
                  type="text"
                  value={med.strength}
                  onChange={(e) => onUpdate(med.id, "strength", e.target.value)}
                  placeholder="e.g. 40 mg"
                  className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Dose
                </label>
                <input
                  type="text"
                  value={med.dose}
                  onChange={(e) => onUpdate(med.id, "dose", e.target.value)}
                  placeholder="e.g. 1 tablet"
                  className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Frequency + Route side by side */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Frequency
                </label>
                <select
                  value={med.frequency}
                  onChange={(e) => onUpdate(med.id, "frequency", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors appearance-none"
                >
                  <option value="">Select…</option>
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Route
                </label>
                <select
                  value={med.route}
                  onChange={(e) => onUpdate(med.id, "route", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors appearance-none"
                >
                  <option value="">Select…</option>
                  {ROUTES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Desktop delete */}
          <button
            type="button"
            onClick={() => onDelete(med.id)}
            aria-label={`Delete ${med.drugName || "medication"}`}
            className="hidden sm:flex flex-shrink-0 mt-1 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
