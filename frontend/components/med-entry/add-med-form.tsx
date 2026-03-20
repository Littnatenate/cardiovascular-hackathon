"use client";

import { useState } from "react";
import { Medication, MedSource } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddMedFormProps {
  defaultSource: MedSource;
  onAdd: (med: Medication) => void;
  onCancel: () => void;
}

const emptyForm = {
  drugName: "",
  strength: "",
  dose: "",
  frequency: "",
};

export function AddMedForm({ defaultSource, onAdd, onCancel }: AddMedFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [source] = useState<MedSource>(defaultSource);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.drugName.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      ...form,
      source,
    });
    setForm(emptyForm);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border-2 border-dashed border-primary/40 bg-accent/20 p-4"
      aria-label="Add new medication"
    >
      <p className="mb-3 text-sm font-semibold text-foreground">New Medication</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
          <label htmlFor="drugName" className="text-xs font-medium text-muted-foreground">
            Drug Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="drugName"
            placeholder="e.g. Metformin"
            value={form.drugName}
            onChange={(e) => setForm({ ...form, drugName: e.target.value })}
            className="h-9 text-sm"
            required
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="strength" className="text-xs font-medium text-muted-foreground">
            Strength
          </label>
          <Input
            id="strength"
            placeholder="e.g. 500 mg"
            value={form.strength}
            onChange={(e) => setForm({ ...form, strength: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="dose" className="text-xs font-medium text-muted-foreground">
            Dose
          </label>
          <Input
            id="dose"
            placeholder="e.g. 1 tablet"
            value={form.dose}
            onChange={(e) => setForm({ ...form, dose: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="frequency" className="text-xs font-medium text-muted-foreground">
            Frequency
          </label>
          <Input
            id="frequency"
            placeholder="e.g. Twice daily"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Source: <span className="font-medium capitalize">{source}</span>
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Medication
          </Button>
        </div>
      </div>
    </form>
  );
}
