"use client";

import { useState } from "react";
import { MedResult } from "./types";
import { STATUS_CONFIG, ConfidenceBadge } from "./status-config";
import { cn } from "@/lib/utils";
import { Check, Trash2, Info, ChevronDown, ChevronUp, MessageSquare, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedCardProps {
  result: MedResult;
  onConfirm: (id: string) => void;
  onOverride: (id: string) => void;
  onRestore?: (id: string) => void;
  onDetails?: (id: string) => void;
}

export function MedCard({ result, onConfirm, onOverride, onRestore }: Omit<MedCardProps, 'onDetails'>) {
  const [expanded, setExpanded] = useState(result.status !== "continued");
  const cfg = STATUS_CONFIG[result.status];

  const isContinued = result.status === "continued" || result.confirmed || result.autoConfirmed;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden transition-all shadow-sm",
      )}
    >
      {/* Card Header — always visible */}
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={`${result.drugName} — ${cfg.label}. Click to ${expanded ? "collapse" : "expand"}`}
      >
        {/* Card Header Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground truncate">
              {result.drugName}
            </span>
            {result.strength && (
              <span className="text-sm text-muted-foreground ml-2">
                ({result.strength})
              </span>
            )}
            
            {isContinued && (
              <span className="text-xs font-semibold text-[color:var(--status-continued-badge)] bg-[color:var(--status-continued-bg)] border border-[color:var(--status-continued-border)] px-2 py-0.5 rounded-full flex items-center gap-1">
                {result.autoConfirmed ? "Auto-confirmed" : <><Check className="w-3 h-3" /> Confirmed</>}
              </span>
            )}
          </div>
          
          {/* Original name diff */}
          {result.originalNames && (
            <p className="text-xs text-muted-foreground mt-1.5 ml-6">
              Home: <span className="font-medium">{result.originalNames.home}</span>
              {" → "}Discharge: <span className="font-medium">{result.originalNames.discharge}</span>
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

          {/* Action buttons — hide for confirmed unless onRestore */}
          {!isContinued && !result.overridden ? (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t mt-3">
              <Button
                size="sm"
                className="gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onConfirm(result.id)}
                aria-label={`Confirm ${result.drugName}`}
              >
                <Check className="w-3.5 h-3.5" />
                Mark as Verified
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onOverride(result.id)}
                aria-label={`Dismiss ${result.drugName}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Dismiss
              </Button>
            </div>
          ) : (
            onRestore && (result.confirmed || result.overridden) && (
              <div className="flex justify-end pt-2 border-t mt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => onRestore(result.id)}
                  aria-label={`Restore ${result.drugName}`}
                >
                  <Undo2 className="w-3.5 h-3.5 mr-0.5" />
                  Restore to List
                </Button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
