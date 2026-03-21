"use client";

import { useState } from "react";
import { MedResult } from "./types";
import { STATUS_CONFIG, ConfidenceBadge } from "./status-config";
import { cn } from "@/lib/utils";
import { Check, Pencil, Info, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedCardProps {
  result: MedResult;
  onConfirm: (id: string) => void;
  onOverride: (id: string) => void;
  onDetails: (id: string) => void;
}

export function MedCard({ result, onConfirm, onOverride, onDetails }: MedCardProps) {
  const [expanded, setExpanded] = useState(result.status !== "continued");
  const cfg = STATUS_CONFIG[result.status];

  const isContinued = result.status === "continued";

  return (
    <div
      className={cn(
        "rounded-xl border-l-4 border border-border overflow-hidden transition-all",
        cfg.bgClass,
        cfg.borderClass
      )}
      style={{ borderLeftColor: `var(--status-${result.status === "new" ? "new" : result.status === "changed" ? "changed" : result.status === "stopped" ? "stopped" : "continued"}-badge)` }}
    >
      {/* Card Header — always visible */}
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={`${result.drugName} — ${cfg.label}. Click to ${expanded ? "collapse" : "expand"}`}
      >
        {/* Status icon */}
        <span
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg text-lg shrink-0 mt-0.5",
            cfg.iconBgClass
          )}
          aria-hidden
        >
          {cfg.icon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("text-base font-bold leading-tight", cfg.textClass)}>
              {result.drugName}
            </span>
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                cfg.badgeClass
              )}
            >
              {cfg.label}
            </span>
            {result.autoConfirmed && (
              <span className="text-xs font-semibold text-[color:var(--status-continued-badge)] bg-[color:var(--status-continued-bg)] border border-[color:var(--status-continued-border)] px-2 py-0.5 rounded-full">
                Auto-confirmed
              </span>
            )}
            {result.confirmed && !result.autoConfirmed && (
              <span className="text-xs font-semibold text-[color:var(--status-continued-badge)] bg-[color:var(--status-continued-bg)] border border-[color:var(--status-continued-border)] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Confirmed
              </span>
            )}
          </div>

          {/* Original name diff */}
          {result.originalNames && (
            <p className="text-xs text-muted-foreground mt-1">
              Home:{" "}
              <span className="font-medium">{result.originalNames.home}</span>
              {" → "}Discharge:{" "}
              <span className="font-medium">{result.originalNames.discharge}</span>
            </p>
          )}
        </div>

        {/* Chevron toggle */}
        <span className="text-muted-foreground shrink-0 mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Summary */}
          <p className="text-sm text-foreground leading-relaxed">
            {result.summary}
          </p>

          {/* Confidence */}
          <ConfidenceBadge level={result.confidence} note={result.confidenceNote} />

          {/* Patient prompt */}
          {result.patientPrompt && (
            <div
              className={cn(
                "flex gap-2 rounded-lg border p-3",
                isContinued
                  ? "bg-[color:var(--status-continued-bg)] border-[color:var(--status-continued-border)]"
                  : result.needsConfirmation
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-[color:var(--status-new-bg)] border-[color:var(--status-new-border)]"
              )}
            >
              <MessageSquare
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  isContinued
                    ? "text-[color:var(--status-continued-text)]"
                    : result.needsConfirmation
                    ? "text-amber-600"
                    : "text-[color:var(--status-new-text)]"
                )}
                aria-hidden
              />
              <div className="text-sm">
                <span className="font-semibold text-foreground mr-1">
                  {result.needsConfirmation ? "Ask the patient:" : "Tell the patient:"}
                </span>
                <span className="italic text-foreground/80">&ldquo;{result.patientPrompt}&rdquo;</span>
              </div>
            </div>
          )}

          {/* Action buttons — hide for auto-confirmed */}
          {!result.autoConfirmed && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "gap-1.5 font-semibold border-2",
                  result.confirmed
                    ? "border-[color:var(--status-continued-badge)] text-[color:var(--status-continued-text)] bg-[color:var(--status-continued-bg)]"
                    : "border-[color:var(--status-continued-badge)] text-[color:var(--status-continued-text)] hover:bg-[color:var(--status-continued-bg)]"
                )}
                onClick={() => onConfirm(result.id)}
                aria-label={`Confirm ${result.drugName}`}
              >
                <Check className="w-3.5 h-3.5" />
                Confirm {cfg.label === "CONTINUED" ? "" : cfg.label.toLowerCase().replace("dose ", "")}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-2 border-[color:var(--status-changed-badge)] text-[color:var(--status-changed-text)] hover:bg-[color:var(--status-changed-bg)]"
                onClick={() => onOverride(result.id)}
                aria-label={`Override ${result.drugName}`}
              >
                <Pencil className="w-3.5 h-3.5" />
                Override
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-primary hover:text-primary"
                onClick={() => onDetails(result.id)}
                aria-label={`View details for ${result.drugName}`}
              >
                <Info className="w-3.5 h-3.5" />
                Details
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
