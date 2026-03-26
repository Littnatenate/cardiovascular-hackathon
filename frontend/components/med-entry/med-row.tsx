"use client";

import { useState } from "react";
import { Medication } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface MedRowProps {
  med: Medication;
  onUpdate: (updated: Medication) => void;
  onDelete: (id: string) => void;
}

export function MedRow({ med, onUpdate, onDelete }: MedRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(med);

  function formatDose(val: string) {
    const trimmed = val.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed) === 1 ? `${trimmed} tab` : `${trimmed} tabs`;
    }
    return val;
  }

  function handleSave() {
    onUpdate({
      ...draft,
      dose: formatDose(draft.dose),
    });
    setEditing(false);
  }

  function handleCancel() {
    setDraft(med);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-lg border-2 border-primary/40 bg-accent/40 p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Drug Name</label>
            <Input
              value={draft.drugName}
              onChange={(e) => setDraft({ ...draft, drugName: e.target.value })}
              className="h-8 text-sm"
              aria-label="Drug name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Dose</label>
            <Input
              value={draft.strength}
              onChange={(e) => setDraft({ ...draft, strength: e.target.value })}
              className="h-8 text-sm"
              aria-label="Dose"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Quantity</label>
            <Input
              value={draft.dose}
              onChange={(e) => setDraft({ ...draft, dose: e.target.value })}
              className="h-8 text-sm"
              aria-label="Quantity"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Frequency</label>
            <Input
              value={draft.frequency}
              onChange={(e) => setDraft({ ...draft, frequency: e.target.value })}
              className="h-8 text-sm"
              aria-label="Frequency"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={handleCancel} className="gap-1">
            <X className="w-3.5 h-3.5" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1">
            <Check className="w-3.5 h-3.5" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:bg-accent/30 hover:border-primary/20 shadow-sm"
    >
      <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_6rem_auto_6rem_auto_10rem_80px] md:items-center gap-2 md:gap-0">
        
        {/* Drug name - Full width on mobile */}
        <div className="min-w-0 md:pr-4">
          <p className="font-bold text-foreground text-base md:text-sm truncate">{med.drugName}</p>
        </div>

        {/* Dividers hidden on mobile */}
        <div className="hidden md:block w-px h-8 bg-border mx-2" aria-hidden="true" />
        
        {/* Secondary details in a grid on mobile for compactness */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 md:contents">
          <div className="flex flex-col md:block">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold md:hidden">Strength</span>
            <span className="text-sm font-medium text-foreground">{med.strength}</span>
          </div>

          <div className="hidden md:block w-px h-8 bg-border mx-2" aria-hidden="true" />

          <div className="flex flex-col md:block">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold md:hidden">Quantity</span>
            <span className="text-sm font-medium text-foreground">{med.dose}</span>
          </div>

          <div className="hidden md:block w-px h-8 bg-border mx-2" aria-hidden="true" />

          <div className="flex flex-col md:block col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold md:hidden">Frequency</span>
            <span className="text-sm text-muted-foreground leading-relaxed truncate">{med.frequency}</span>
          </div>
        </div>

        {/* Actions - Bottom right on mobile, end of row on desktop */}
        <div className="flex items-center justify-end gap-1 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 border-border md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${med.drugName}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => onDelete(med.id)}
            aria-label={`Delete ${med.drugName}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
