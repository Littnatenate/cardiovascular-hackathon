"use client";

import { SummaryCount } from "./types";
import { cn } from "@/lib/utils";

interface SummaryBarProps {
  counts: SummaryCount;
}

interface SummaryItem {
  icon: string;
  label: string;
  count: number;
  color: string;
  activeColor: string;
}

const ITEMS: ((counts: SummaryCount) => SummaryItem[]) = (counts) => [
  {
    icon: "✅",
    label: "Continued",
    count: counts.continued,
    color: "text-[color:var(--status-continued-text)]",
    activeColor: "bg-[color:var(--status-continued-bg)] border-[color:var(--status-continued-border)]",
  },
  {
    icon: "⚠️",
    label: "Changed",
    count: counts.changed,
    color: "text-[color:var(--status-changed-text)]",
    activeColor: "bg-[color:var(--status-changed-bg)] border-[color:var(--status-changed-border)]",
  },
  {
    icon: "🛑",
    label: "Stopped",
    count: counts.stopped,
    color: "text-[color:var(--status-stopped-text)]",
    activeColor: "bg-[color:var(--status-stopped-bg)] border-[color:var(--status-stopped-border)]",
  },
  {
    icon: "🆕",
    label: "New",
    count: counts.newMed,
    color: "text-[color:var(--status-new-text)]",
    activeColor: "bg-[color:var(--status-new-bg)] border-[color:var(--status-new-border)]",
  },
  {
    icon: "🚨",
    label: "Interactions",
    count: counts.interactions,
    color: "text-[color:var(--status-stopped-text)]",
    activeColor: "bg-[color:var(--status-stopped-bg)] border-[color:var(--status-stopped-border)]",
  },
  {
    icon: "❓",
    label: "Uncertain",
    count: counts.uncertain,
    color: "text-muted-foreground",
    activeColor: "bg-muted border-border",
  },
];

export function SummaryBar({ counts }: SummaryBarProps) {
  const items = ITEMS(counts);
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-wrap gap-2 items-center">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 shrink-0">
        Summary
      </span>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors",
            item.count > 0
              ? item.activeColor
              : "bg-muted/40 border-border/50 opacity-50"
          )}
        >
          <span className="text-sm leading-none">{item.icon}</span>
          <span className={cn("text-sm font-bold tabular-nums leading-none", item.count > 0 ? item.color : "text-muted-foreground")}>
            {item.count}
          </span>
          <span className={cn("text-xs leading-none", item.count > 0 ? item.color : "text-muted-foreground")}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
