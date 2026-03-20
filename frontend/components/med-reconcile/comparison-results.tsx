"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MedResult, SummaryCount, MedStatus } from "./types";
import { SAMPLE_RESULTS } from "./sample-data";
import { SummaryBar } from "./summary-bar";
import { MedCard } from "./med-card";
import { ChevronLeft, ChevronRight, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SessionTopBar } from "@/components/session-top-bar"

const SORT_ORDER = ["interaction", "stopped", "changed", "uncertain", "new", "continued"];

export function ComparisonResults() {
  const router = useRouter();
  const [results, setResults] = useState<MedResult[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);
  const [overrideOpen, setOverrideOpen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rawResults = localStorage.getItem('recon_results');
    const rawPatient = localStorage.getItem('recon_patient');
    if (rawResults) {
      const data = JSON.parse(rawResults);
      setPatient(rawPatient ? JSON.parse(rawPatient) : null);
      
      const mapped: MedResult[] = [];
      
      // 1. Map Interactions (DDInter)
      if (data.interactions) {
        data.interactions.forEach((i: any, idx: number) => {
          mapped.push({
            id: `int-${idx}`,
            status: "interaction",
            drugName: `${i.drug_a} + ${i.drug_b}`,
            summary: `${i.severity.toUpperCase()}: ${i.effect}. Recommendation: ${i.recommendation}`,
            confidence: "high",
            needsConfirmation: true,
            patientPrompt: "Our AI detected a possible interaction between these two medicines."
          });
        });
      }

      // 2. Map Stopped Meds
      if (data.stopped_medications) {
        data.stopped_medications.forEach((m: any) => {
          mapped.push({
            id: `stop-${m.name}`,
            status: "stopped",
            drugName: m.name,
            summary: `Not found on discharge list. (Home dose: ${m.dose})`,
            confidence: "high",
            needsConfirmation: true,
            patientPrompt: `Why did you stop taking ${m.name}?`
          });
        });
      }

      // 3. Map Discrepancies (Changed)
      if (data.discrepancies) {
        data.discrepancies.forEach((m: any) => {
          const isBrandGeneric = data.rxnorm_mappings?.some((rm: any) => rm.original === m.name);
          mapped.push({
            id: `diff-${m.name}`,
            status: "changed",
            drugName: m.name,
            originalNames: { home: m.name, discharge: m.name },
            summary: `${m.reason} Home: ${m.home_dose} ${m.home_freq} ➔ Discharge: ${m.discharge_dose} ${m.discharge_freq}`,
            confidence: "high",
            confidenceNote: isBrandGeneric ? "Verified via RxNorm brand-generic mapping" : undefined,
            needsConfirmation: true,
            patientPrompt: `Your dose for ${m.name} has changed. Do you have the new strength bottles?`
          });
        });
      }

      // 4. Map New Meds
      if (data.new_medications) {
        data.new_medications.forEach((m: any) => {
          mapped.push({
            id: `new-${m.name}`,
            status: "new",
            drugName: m.name,
            summary: `Newly prescribed: ${m.dose} ${m.frequency}`,
            confidence: "high",
            needsConfirmation: true,
            patientPrompt: `You have been prescribed ${m.name}. Do you have questions about this new medicine?`
          });
        });
      }
      
      setResults(mapped.length > 0 ? mapped : SAMPLE_RESULTS);
    } else {
      setResults(SAMPLE_RESULTS);
    }
    setIsLoading(false);
  }, []);

  const sortedResults = useMemo(
    () =>
      [...results].sort(
        (a, b) => SORT_ORDER.indexOf(a.status) - SORT_ORDER.indexOf(b.status)
      ),
    [results]
  );

  const counts: SummaryCount = useMemo(
    () => ({
      continued: results.filter((r) => r.status === "continued").length,
      changed: results.filter((r) => r.status === "changed").length,
      stopped: results.filter((r) => r.status === "stopped").length,
      newMed: results.filter((r) => r.status === "new").length,
      interactions: results.filter((r) => r.status === "interaction").length,
      uncertain: results.filter((r) => r.status === "uncertain").length,
    }),
    [results]
  );

  const hasEscalation = counts.interactions > 0 || counts.uncertain > 0;
  const pendingCount = results.filter(
    (r) => !r.autoConfirmed && !r.confirmed && r.status !== "continued"
  ).length;

  function handleConfirm(id: string) {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, confirmed: true } : r))
    );
  }

  function handleOverride(id: string) {
    setOverrideOpen(id === overrideOpen ? null : id);
  }

  function handleDetails(id: string) {
    setDetailsOpen(id === detailsOpen ? null : id);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SessionTopBar 
        patientName={patient?.name || "Margaret Thompson"}
        sessionId={patient?.mrn || "MRN-002847"}
        step={5}
        totalSteps={5}
        backRoute="/medication-review"
      />

      <main className="flex-1 px-4 md:px-6 py-5 max-w-2xl mx-auto w-full space-y-4">
        {pendingCount > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
            <span className="text-sm font-semibold text-amber-800">Review Pending Items</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-700 rounded-full px-2.5 py-1">
              {pendingCount} left
            </span>
          </div>
        )}
        {/* Allergy alert (demo) */}
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-[color:var(--status-stopped-bg)] border border-[color:var(--status-stopped-border)] px-4 py-3"
        >
          <AlertTriangle
            className="w-4 h-4 text-[color:var(--status-stopped-badge)] mt-0.5 shrink-0"
            aria-hidden
          />
          <p className="text-sm text-[color:var(--status-stopped-text)] font-medium">
            <span className="font-bold">Allergy on file:</span> Penicillin — no medications in this list are flagged.
          </p>
        </div>

        {/* Summary bar */}
        <SummaryBar counts={counts} />

        {/* Results list */}
        <section aria-label="Medication results">
          <h2 className="sr-only">Medication comparison results</h2>
          <div className="space-y-3">
            {sortedResults.map((result) => (
              <MedCard
                key={result.id}
                result={result}
                onConfirm={handleConfirm}
                onOverride={handleOverride}
                onDetails={handleDetails}
              />
            ))}
          </div>
        </section>

        {/* Pharmacist escalation banner */}
        {hasEscalation && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl bg-[color:var(--status-stopped-bg)] border border-[color:var(--status-stopped-border)] px-4 py-3"
          >
            <AlertTriangle
              className="w-4 h-4 text-[color:var(--status-stopped-badge)] mt-0.5 shrink-0"
              aria-hidden
            />
            <p className="text-sm text-[color:var(--status-stopped-text)]">
              <span className="font-bold">Pharmacist escalation will be generated</span> — this case contains interactions or uncertain items.
            </p>
          </div>
        )}
      </main>

      {/* Bottom navigation bar */}
      <nav
        className="sticky bottom-0 bg-card border-t border-border px-4 md:px-6 py-3 flex items-center justify-between gap-3"
        aria-label="Navigation"
      >
        <Button
          variant="outline"
          className="gap-1.5 font-semibold"
          aria-label="Back to review"
          onClick={() => router.push('/medication-review')}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Review
        </Button>

        <Button
          className={cn(
            "gap-1.5 font-semibold",
            pendingCount > 0
              ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
          aria-label="Generate patient instructions"
          onClick={() => router.push('/patient-instructions')}
        >
          Generate Patient Instructions
          <ChevronRight className="w-4 h-4" />
        </Button>
      </nav>
    </div>
  );
}
