"use client";

import { cn } from "@/lib/utils";
import type { Confidence } from "./types";
import { CheckCircle, AlertCircle, XCircle, HelpCircle } from "lucide-react";

interface ConfidenceBadgeProps {
  confidence: Confidence;
  className?: string;
}

const config: Record<
  Confidence,
  { label: string; className: string; icon: React.ReactNode }
> = {
  high: {
    label: "High confidence",
    className:
      "bg-[var(--confidence-high-bg)] text-[var(--confidence-high)] border border-[var(--confidence-high)]/30",
    icon: <CheckCircle className="size-3.5" aria-hidden="true" />,
  },
  medium: {
    label: "Medium confidence",
    className:
      "bg-[var(--confidence-medium-bg)] text-[var(--confidence-medium)] border border-[var(--confidence-medium)]/30",
    icon: <AlertCircle className="size-3.5" aria-hidden="true" />,
  },
  low: {
    label: "Low confidence — verify",
    className:
      "bg-[var(--confidence-low-bg)] text-[var(--confidence-low)] border border-[var(--confidence-low)]/30",
    icon: <XCircle className="size-3.5" aria-hidden="true" />,
  },
  missing: {
    label: "Not found — enter manually",
    className:
      "bg-muted text-muted-foreground border border-border",
    icon: <HelpCircle className="size-3.5" aria-hidden="true" />,
  },
};

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const { label, className: badgeClass, icon } = config[confidence];
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        badgeClass,
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}
