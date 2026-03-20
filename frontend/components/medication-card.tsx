"use client"

import { cn } from "@/lib/utils"
import { Pill, AlertTriangle, X, Plus, ArrowUp } from "lucide-react"

export type MedicationStatus = "continued" | "changed" | "new" | "stopped"

export interface Medication {
  id: string
  brandName: string
  genericName?: string
  category: string
  purpose: string
  dosage: string
  timing: string
  withFood?: boolean
  specialInstructions?: string
  status: MedicationStatus
  changeDescription?: string
  warnings: string[]
}

interface MedicationCardProps {
  medication: Medication
}

const statusConfig: Record<MedicationStatus, { label: string; className: string; icon: React.ReactNode }> = {
  continued: {
    label: "No Change",
    className: "bg-muted text-muted-foreground",
    icon: null,
  },
  changed: {
    label: "Changed",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    icon: <ArrowUp className="size-4" />,
  },
  new: {
    label: "New",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    icon: <Plus className="size-4" />,
  },
  stopped: {
    label: "Stopped",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    icon: <X className="size-4" />,
  },
}

export function MedicationCard({ medication }: MedicationCardProps) {
  const status = statusConfig[medication.status]
  const isStopped = medication.status === "stopped"

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-6 print:break-inside-avoid",
        isStopped
          ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
          : "border-border bg-card"
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full",
              isStopped
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-primary/10 text-primary"
            )}
          >
            {isStopped ? <X className="size-6" /> : <Pill className="size-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground leading-tight">
              {medication.brandName}
              {medication.genericName && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  (also called {medication.genericName})
                </span>
              )}
            </h3>
            <p className="text-lg text-muted-foreground mt-1">
              {medication.category}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold",
            status.className
          )}
        >
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {!isStopped && (
          <>
            {/* What it's for */}
            <div>
              <h4 className="text-base font-semibold text-foreground mb-1">
                What it{"'"}s for
              </h4>
              <p className="text-lg text-foreground leading-relaxed">
                {medication.purpose}
              </p>
            </div>

            {/* How to take */}
            <div>
              <h4 className="text-base font-semibold text-foreground mb-1">
                How to take
              </h4>
              <p className="text-lg text-foreground leading-relaxed">
                Take <strong>{medication.dosage}</strong> {medication.timing}
                {medication.withFood !== undefined && (
                  <>, {medication.withFood ? "with food" : "with or without food"}</>
                )}
                .
                {medication.specialInstructions && (
                  <> {medication.specialInstructions}</>
                )}
              </p>
            </div>
          </>
        )}

        {/* What changed */}
        <div>
          <h4 className="text-base font-semibold text-foreground mb-1">
            What changed
          </h4>
          <p className="text-lg text-foreground leading-relaxed">
            {medication.status === "continued" && (
              <>Nothing — same medication and dose as before.</>
            )}
            {medication.status === "changed" && medication.changeDescription}
            {medication.status === "new" && (
              <>
                This is a <strong>new medication</strong> started during your hospital stay.
              </>
            )}
            {medication.status === "stopped" && (
              <>
                You were taking this before, but it is{" "}
                <strong>no longer on your discharge prescription.</strong>
                <br />
                <strong>Do not continue taking {medication.brandName}</strong> unless your
                doctor tells you otherwise.
                <br />
                If you still have pills at home, set them aside — do not throw them away
                yet. Ask your doctor at your next appointment if you{"'"}re unsure.
              </>
            )}
          </p>
        </div>

        {/* Warnings */}
        {!isStopped && medication.warnings.length > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/30 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Watch out for
                </h4>
                <ul className="text-lg text-amber-900 dark:text-amber-100 leading-relaxed space-y-1">
                  {medication.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
