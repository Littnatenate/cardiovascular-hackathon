"use client";

import { MedSource } from "./types";
import { Camera, Keyboard, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const sourceConfig: Record<
  MedSource,
  { label: string; icon: React.ReactNode; className: string }
> = {
  photo: {
    label: "Photo",
    icon: <Camera className="w-3 h-3" />,
    className: "bg-[--source-photo] text-[--source-photo-text]",
  },
  manual: {
    label: "Manual",
    icon: <Keyboard className="w-3 h-3" />,
    className: "bg-[--source-manual] text-[--source-manual-text]",
  },
  admission: {
    label: "Admission",
    icon: <ClipboardList className="w-3 h-3" />,
    className: "bg-[--source-admission] text-[--source-admission-text]",
  },
  voice: {
    label: "Voice",
    icon: null,
    className: "bg-muted text-muted-foreground",
  },
};

export function SourceBadge({ source }: { source: MedSource }) {
  const config = sourceConfig[source];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
