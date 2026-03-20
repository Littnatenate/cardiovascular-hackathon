"use client"

import { Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SourceType = "photo" | "admission" | "manual"

export interface Medication {
  id: string
  name: string
  strength: string
  frequency: string
  source?: SourceType
}

const sourceLabels: Record<SourceType, string> = {
  photo: "Photo",
  admission: "Admission",
  manual: "Manual",
}

const sourceColors: Record<SourceType, string> = {
  photo: "bg-amber-100 text-amber-700 border-amber-200",
  admission: "bg-sky-100 text-sky-700 border-sky-200",
  manual: "bg-slate-100 text-slate-600 border-slate-200",
}

interface MedListColumnProps {
  title: string
  meds: Medication[]
  variant: "discharge" | "home"
  onEdit: () => void
}

export function MedListColumn({ title, meds, variant, onEdit }: MedListColumnProps) {
  const isDischarge = variant === "discharge"

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border shadow-sm overflow-hidden",
        isDischarge
          ? "border-[oklch(0.80_0.08_240)] bg-[oklch(0.97_0.015_240)]"
          : "border-[oklch(0.80_0.08_160)] bg-[oklch(0.97_0.015_160)]"
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          isDischarge
            ? "bg-[oklch(0.46_0.16_240)] border-[oklch(0.40_0.16_240)] text-white"
            : "bg-[oklch(0.44_0.14_160)] border-[oklch(0.38_0.14_160)] text-white"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-wide uppercase">{title}</span>
          <Badge
            className={cn(
              "text-xs font-bold border",
              isDischarge
                ? "bg-white/20 text-white border-white/30 hover:bg-white/20"
                : "bg-white/20 text-white border-white/30 hover:bg-white/20"
            )}
          >
            {meds.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 gap-1.5 text-white/80 hover:text-white hover:bg-white/15 text-xs font-medium px-2.5"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>

      {/* Medication rows */}
      <ul className="flex flex-col divide-y divide-border/60 flex-1">
        {meds.map((med, idx) => (
          <li
            key={med.id}
            className="flex items-start gap-3 px-4 py-3 bg-card hover:bg-accent/30 transition-colors"
          >
            {/* Row number */}
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                isDischarge
                  ? "bg-[oklch(0.46_0.16_240)]/10 text-[oklch(0.30_0.14_240)]"
                  : "bg-[oklch(0.44_0.14_160)]/10 text-[oklch(0.28_0.12_160)]"
              )}
            >
              {idx + 1}
            </span>

            {/* Med info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm leading-snug">
                {med.name}{" "}
                <span className="text-muted-foreground font-normal">{med.strength}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{med.frequency}</p>
            </div>

            {/* Source badge */}
            {med.source && (
              <Badge
                variant="outline"
                className={cn("shrink-0 text-[10px] font-medium px-1.5 py-0.5 border", sourceColors[med.source])}
              >
                {sourceLabels[med.source]}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
