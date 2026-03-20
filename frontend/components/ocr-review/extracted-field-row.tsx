"use client";

import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "./confidence-badge";
import type { Confidence } from "./types";
import { Pencil } from "lucide-react";

interface ExtractedFieldRowProps {
  label: string;
  value: string;
  confidence: Confidence;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function ExtractedFieldRow({
  label,
  value,
  confidence,
  placeholder = "Enter manually...",
  onChange,
}: ExtractedFieldRowProps) {
  const isMedium = confidence === "medium";
  const isLow = confidence === "low";
  const isMissing = confidence === "missing";
  const needsAttention = isLow || isMissing || isMedium;

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-colors relative overflow-hidden",
        isLow || isMissing
          ? "border-[var(--confidence-low)]/40 bg-[var(--confidence-low-bg)]"
          : isMedium
          ? "border-[var(--confidence-medium)]/40 bg-[var(--confidence-medium-bg)]"
          : "border-border bg-card"
      )}
    >
      {/* Left accent stripe for fields needing attention */}
      {needsAttention && (
        <div
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
            isLow || isMissing
              ? "bg-[var(--confidence-low)]"
              : "bg-[var(--confidence-medium)]"
          )}
        />
      )}
      <div className={cn("flex items-center justify-between mb-2", needsAttention && "pl-1")}>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <ConfidenceBadge confidence={confidence} />
      </div>

      <div className={cn("relative flex items-center", needsAttention && "pl-1")}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2 pr-9 text-sm font-medium text-foreground",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
            "transition-colors",
            isLow || isMissing
              ? "border-[var(--confidence-low)]/50 focus:border-[var(--confidence-low)]"
              : isMedium
              ? "border-[var(--confidence-medium)]/50 focus:border-[var(--confidence-medium)]"
              : "border-input focus:border-primary"
          )}
        />
        <Pencil
          className="absolute right-3 size-3.5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {needsAttention && (
        <p
          className={cn(
            "mt-1.5 pl-1 text-xs font-medium",
            isLow || isMissing
              ? "text-[var(--confidence-low)]"
              : "text-[var(--confidence-medium)]"
          )}
        >
          {isMissing
            ? "Not found on label — enter manually and verify against the photo."
            : isLow
            ? "Low confidence — verify this value against the label photo."
            : "Partially read — check the label photo to confirm."}
        </p>
      )}
    </div>
  );
}
