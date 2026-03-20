"use client";

import { MedStatus, Confidence } from "./types";
import { cn } from "@/lib/utils";

interface StatusConfig {
  label: string;
  icon: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  iconBgClass: string;
}

export const STATUS_CONFIG: Record<MedStatus, StatusConfig> = {
  stopped: {
    label: "STOPPED",
    icon: "🛑",
    bgClass: "bg-[color:var(--status-stopped-bg)]",
    borderClass: "border-[color:var(--status-stopped-border)]",
    textClass: "text-[color:var(--status-stopped-text)]",
    badgeClass: "bg-[color:var(--status-stopped-badge)] text-white",
    iconBgClass: "bg-red-100",
  },
  changed: {
    label: "DOSE CHANGED",
    icon: "⚠️",
    bgClass: "bg-[color:var(--status-changed-bg)]",
    borderClass: "border-[color:var(--status-changed-border)]",
    textClass: "text-[color:var(--status-changed-text)]",
    badgeClass: "bg-[color:var(--status-changed-badge)] text-white",
    iconBgClass: "bg-amber-100",
  },
  new: {
    label: "NEW MEDICATION",
    icon: "🆕",
    bgClass: "bg-[color:var(--status-new-bg)]",
    borderClass: "border-[color:var(--status-new-border)]",
    textClass: "text-[color:var(--status-new-text)]",
    badgeClass: "bg-[color:var(--status-new-badge)] text-white",
    iconBgClass: "bg-blue-100",
  },
  continued: {
    label: "CONTINUED",
    icon: "✅",
    bgClass: "bg-[color:var(--status-continued-bg)]",
    borderClass: "border-[color:var(--status-continued-border)]",
    textClass: "text-[color:var(--status-continued-text)]",
    badgeClass: "bg-[color:var(--status-continued-badge)] text-white",
    iconBgClass: "bg-green-100",
  },
  interaction: {
    label: "INTERACTION",
    icon: "🚨",
    bgClass: "bg-[color:var(--status-stopped-bg)]",
    borderClass: "border-[color:var(--status-stopped-border)]",
    textClass: "text-[color:var(--status-stopped-text)]",
    badgeClass: "bg-[color:var(--status-stopped-badge)] text-white",
    iconBgClass: "bg-red-100",
  },
  uncertain: {
    label: "UNCERTAIN",
    icon: "❓",
    bgClass: "bg-muted",
    borderClass: "border-border",
    textClass: "text-muted-foreground",
    badgeClass: "bg-muted-foreground text-white",
    iconBgClass: "bg-gray-100",
  },
};

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  high: "bg-green-100 text-green-700 border border-green-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  low: "bg-red-100 text-red-700 border border-red-200",
};

interface ConfidenceBadgeProps {
  level: Confidence;
  note?: string;
}

export function ConfidenceBadge({ level, note }: ConfidenceBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", CONFIDENCE_STYLES[level])}>
      Confidence: {level.charAt(0).toUpperCase() + level.slice(1)}
      {note && <span className="font-normal opacity-80">({note})</span>}
    </span>
  );
}
