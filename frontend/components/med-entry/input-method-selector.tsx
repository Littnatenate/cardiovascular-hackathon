"use client";

import { MedSource } from "./types";
import { Camera, Keyboard, ClipboardList, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputMethodSelectorProps {
  onSelect: (method: MedSource) => void;
  activeMethod: MedSource | null;
}

const methods: {
  key: MedSource;
  label: string;
  icon: React.ReactNode;
  description: string;
  disabled?: boolean;
}[] = [
  {
    key: "photo",
    label: "Photograph",
    icon: <Camera className="w-6 h-6" />,
    description: "Scan a pill bottle or med sheet",
  },
  {
    key: "manual",
    label: "Manual Entry",
    icon: <Keyboard className="w-6 h-6" />,
    description: "Type medication details",
  },
  {
    key: "admission",
    label: "Import Records",
    icon: <ClipboardList className="w-6 h-6" />,
    description: "Pull from admission records",
  },
  {
    key: "voice",
    label: "Voice Entry",
    icon: <Mic className="w-6 h-6" />,
    description: "Dictate — AI transcribes",
    disabled: true,
  },
];

export function InputMethodSelector({
  onSelect,
  activeMethod,
}: InputMethodSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {methods.map((m) => (
        <button
          key={m.key}
          disabled={m.disabled}
          onClick={() => !m.disabled && onSelect(m.key)}
          aria-pressed={activeMethod === m.key}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border-2 px-3 py-4 text-sm font-medium transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            activeMethod === m.key
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent",
            m.disabled && "cursor-not-allowed opacity-40"
          )}
        >
          {m.icon}
          <span className="leading-tight text-center">{m.label}</span>
          <span
            className={cn(
              "text-xs font-normal leading-relaxed text-center",
              activeMethod === m.key ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {m.description}
          </span>
          {m.disabled && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Coming soon
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
