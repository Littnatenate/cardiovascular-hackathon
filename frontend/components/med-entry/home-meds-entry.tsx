"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Medication, MedSource } from "./types";
import { MedRow } from "./med-row";
import { AddMedForm } from "./add-med-form";
import { InputMethodSelector } from "./input-method-selector";
import { Button } from "@/components/ui/button";
import { SessionTopBar } from "@/components/session-top-bar";
import { SAMPLE_HOME_MEDS } from "@/lib/mock-data";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Pill,
  Plus,
} from "lucide-react";

const SESSION_ID = "REC-2024-04821";
const PATIENT_NAME = "Margaret T. Holloway";

export function HomeMedsEntry() {
  const router = useRouter();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [activeMethod, setActiveMethod] = useState<MedSource | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [patientData, setPatientData] = useState({ name: PATIENT_NAME, id: SESSION_ID });

  useEffect(() => {
    let activeId = SESSION_ID;
    const sessionData = sessionStorage.getItem("dischargeSession");
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed.id) activeId = parsed.id;
      setPatientData({
        name: parsed.patientName || PATIENT_NAME,
        id: parsed.patientId || activeId
      });
    }

    const savedKey = `medrecon_home_list_${activeId}`;
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        setMeds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved home meds", e);
      }
    } else {
      // Seed data for demo sessions 1-7
      if (['1', '2', '3', '4', '5', '6', '7'].includes(activeId)) {
        setMeds(SAMPLE_HOME_MEDS.map(m => ({ ...m, id: crypto.randomUUID() })));
      } else {
        setMeds([]);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const savedKey = `medrecon_home_list_${patientData.id}`;
      localStorage.setItem(savedKey, JSON.stringify(meds));
    }
  }, [meds, isInitialized, patientData.id]);

  function handleMethodSelect(method: MedSource) {
    setActiveMethod(method);
    if (method === "manual") {
      setShowAddForm(true);
    } else if (method === "photo") {
      router.push('/photo-capture');
    } else if (method === "admission") {
      const importedMed: Medication = {
        id: crypto.randomUUID(),
        drugName: "Lisinopril",
        strength: "10 mg",
        dose: "1 tablet",
        frequency: "Once daily",
        source: "admission",
      };
      setMeds((prev) => [...prev, importedMed]);
    }
  }

  function handleAdd(med: Medication) {
    setMeds((prev) => [...prev, med]);
    setShowAddForm(false);
    setActiveMethod(null);
  }

  function handleUpdate(updated: Medication) {
    setMeds((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleDelete(id: string) {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <SessionTopBar 
        patientName={patientData.name} 
        patientId={patientData.id} 
        step={2} 
      />

      <main className="mx-auto max-w-3xl px-4 pb-32 pt-6">
        {/* Section heading */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground text-balance">
              Home Medications
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Enter what the patient was taking{" "}
            <strong className="text-foreground">before hospital admission</strong>.
            Mix any combination of input methods.
          </p>
        </div>

        {/* Input method selector */}
        <section aria-labelledby="input-method-heading" className="mb-6">
          <h2
            id="input-method-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Add medications via
          </h2>
          <InputMethodSelector
            onSelect={handleMethodSelect}
            activeMethod={activeMethod}
          />
        </section>

        {/* Inline add form */}
        {showAddForm && (
          <div className="mb-5">
            <AddMedForm
              defaultSource="manual"
              onAdd={handleAdd}
              onCancel={() => {
                setShowAddForm(false);
                setActiveMethod(null);
              }}
            />
          </div>
        )}

        {/* Med list */}
        <section aria-labelledby="med-list-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="med-list-heading"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Medications entered
            </h2>
            <span className="text-xs text-muted-foreground">
              {meds.length} {meds.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {/* Table header — desktop only */}
          {meds.length > 0 && (
            <div
              className="mb-1.5 hidden sm:grid w-full px-4 border border-transparent text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              style={{ gridTemplateColumns: "minmax(0, 1fr) 1px 6rem 1px 6rem 1px 12rem 80px" }}
              aria-hidden="true"
            >
              <div className="pr-4">Drug</div>
              <div />
              <div className="px-2">Dose</div>
              <div />
              <div className="px-2">Quantity</div>
              <div />
              <div className="px-2">Frequency</div>
              <div />
            </div>
          )}

          <div className="flex flex-col gap-2" role="list" aria-label="Home medications list">
            {meds.length === 0 && !showAddForm && (
              <Empty>
                <EmptyMedia variant="icon">
                  <Pill className="w-6 h-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No medications yet</EmptyTitle>
                  <EmptyDescription>
                    Use one of the input methods above to add home medications.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            {meds.map((med) => (
              <div key={med.id} role="listitem">
                <MedRow
                  med={med}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {meds.length > 0 && (
            <button
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              onClick={() => {
                setActiveMethod("manual");
                setShowAddForm(true);
              }}
              aria-label="Add another medication manually"
            >
              <Plus className="w-4 h-4" />
              Add another medication
            </button>
          )}
        </section>
      </main>

      {/* Bottom navigation bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
        aria-label="Step navigation"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Button variant="outline" className="gap-2" size="sm" onClick={() => router.push('/new-session')}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="text-xs text-muted-foreground text-center leading-relaxed hidden sm:block">
            {meds.length} home med{meds.length !== 1 && "s"} entered
          </div>

          <Button className="gap-2" size="sm" disabled={meds.length === 0} onClick={() => router.push('/discharge-meds')}>
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
