"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Medication, MedSource } from "./types";
import { MedRow } from "./med-row";
import { AddMedForm } from "./add-med-form";
import { InputMethodSelector } from "./input-method-selector";
import { Button } from "@/components/ui/button";
import { SessionTopBar } from "@/components/session-top-bar";
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

  // Load patient data from session (friend's feature)
  useEffect(() => {
    const saved = sessionStorage.getItem("dischargeSession");
    if (saved) {
      const data = JSON.parse(saved);
      setPatientData({
        name: data.patientName,
        id: data.id || SESSION_ID
      });
    }
  }, []);

  // Load from localStorage on mount (AI persistence)
  useEffect(() => {
    const saved = localStorage.getItem('medrecon_home_list');
    if (saved) {
      try {
        setMeds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved home meds", e);
      }
    } else {
      setMeds([]);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage on change (AI persistence)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('medrecon_home_list', JSON.stringify(meds));
    }
  }, [meds, isInitialized]);

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
        sessionId={patientData.id} 
        step={2} 
        backRoute="/new-session" 
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
              className="mb-1.5 hidden sm:grid px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              style={{ gridTemplateColumns: "1fr 1px 6rem 1px 10rem 1px 6rem 2.5rem" }}
              aria-hidden="true"
            >
              <span>Drug / Strength</span>
              <span />
              <span>Dose</span>
              <span />
              <span>Frequency</span>
              <span />
              <span>Source</span>
              <span />
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
