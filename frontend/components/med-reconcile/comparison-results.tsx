"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MedResult, SummaryCount, MedStatus } from "./types";
import { SAMPLE_RESULTS } from "./sample-data";
import { SummaryBar } from "./summary-bar";
import { MedCard } from "./med-card";
import { ChevronLeft, ChevronRight, AlertTriangle, Activity, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SessionTopBar } from "@/components/session-top-bar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SORT_ORDER = ["interaction", "stopped", "changed", "uncertain", "new", "continued"];

export function ComparisonResults() {
  const router = useRouter();
  const [results, setResults] = useState<MedResult[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [overrideOpen, setOverrideOpen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allergyAlerts, setAllergyAlerts] = useState<any[]>([]);

  useEffect(() => {
    const rawResults = localStorage.getItem('recon_results');
    const rawPatient = localStorage.getItem('recon_patient');
    if (rawResults) {
      const data = JSON.parse(rawResults);
      setPatient(rawPatient ? JSON.parse(rawPatient) : null);
      if (data.allergy_alerts) {
        setAllergyAlerts(data.allergy_alerts);
      }
      
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
            strength: m.strength,
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
            strength: m.discharge_strength || m.strength,
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
            strength: m.strength,
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
    (r) => !r.autoConfirmed && !r.confirmed && r.status !== "continued" && !r.overridden
  ).length;

  function handleConfirm(id: string) {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, confirmed: true, overridden: false } : r))
    );
  }

  function handleOverride(id: string) {
    setOverrideOpen(id);
  }

  function handleRestore(id: string) {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, confirmed: false, overridden: false } : r))
    );
  }

  function confirmOverride() {
    if (!overrideOpen) return;
    setResults((prev) => 
      prev.map((r) => (r.id === overrideOpen ? { ...r, overridden: true, confirmed: false } : r))
    );
    setOverrideOpen(null);
  }

  const selectedOverride = useMemo(
    () => results.find((r) => r.id === overrideOpen),
    [results, overrideOpen]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SessionTopBar 
        patientName={patient?.name || "Margaret Thompson"}
        patientId={patient?.mrn || patient?.id || "S1234567A"}
        step={5}
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
        {/* Dynamic Allergy alerts */}
        {allergyAlerts.length > 0 ? (
          allergyAlerts.map((alert, idx) => (
            <div
              key={`allergy-${idx}`}
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-[color:var(--status-stopped-bg)] border border-[color:var(--status-stopped-border)] px-4 py-3"
            >
              <AlertTriangle
                className="w-4 h-4 text-[color:var(--status-stopped-badge)] mt-0.5 shrink-0"
                aria-hidden
              />
              <p className="text-sm text-[color:var(--status-stopped-text)] font-medium">
                <span className="font-bold">CRITICAL ALLERGY ALERT:</span> {alert.reason} (Found in prescription for {alert.medication})
              </p>
            </div>
          ))
        ) : (
          patient?.allergies?.length > 0 ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-[color:var(--status-new-bg)] border border-[color:var(--status-new-border)] px-4 py-3"
            >
              <Check
                className="w-4 h-4 text-[color:var(--status-new-badge)] mt-0.5 shrink-0"
                aria-hidden
              />
              <p className="text-sm text-[color:var(--status-new-text)] font-medium">
                <span className="font-bold">Allergy Check Passed:</span> No documented allergies ({patient.allergies.join(", ")}) were found in the discharge list.
              </p>
            </div>
          ) : null
        )}

        {/* Summary bar */}
        <SummaryBar counts={counts} />

        {/* Grouped Pending Results list */}
        <section aria-label="Medication results">
          <h2 className="sr-only">Medication comparison results</h2>
          <div className="space-y-6">
            {SORT_ORDER.map((status) => {
              // Get pending items for this status block
              const groupItems = results.filter((r) => r.status === status && !r.confirmed && !r.autoConfirmed && r.status !== "continued" && !r.overridden);
              if (groupItems.length === 0) return null;

              return (
                <div key={status} className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                    {status === "interaction" && "⚠️ Drug Interactions"}
                    {status === "stopped" && "🛑 Stopped Medications"}
                    {status === "changed" && "🔄 Dosage Changes"}
                    {status === "uncertain" && "❓ Uncertain Records"}
                    {status === "new" && "➕ New Prescriptions"}
                  </h3>
                  {groupItems.map((result) => (
                    <MedCard
                      key={result.id}
                      result={result}
                      onConfirm={handleConfirm}
                      onOverride={handleOverride}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        {/* Verified / Confirmed Pile */}
        {results.some(r => (r.confirmed || r.autoConfirmed || r.status === "continued") && !r.overridden) && (
          <section className="mt-8 border-t pt-6" aria-label="Verified medications">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-600 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4" /> Verified Medications
            </h3>
            <div className="space-y-3 opacity-80">
              {results.filter(r => (r.confirmed || r.autoConfirmed || r.status === "continued") && !r.overridden).map((result) => (
                <MedCard
                  key={result.id}
                  result={result}
                  onConfirm={handleConfirm}
                  onOverride={handleOverride}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          </section>
        )}

        {/* Dismissed Pile */}
        {results.some(r => r.overridden) && (
          <section className="mt-8 border-t pt-6" aria-label="Dismissed medications">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Dismissed
            </h3>
            <div className="space-y-3 opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100">
              {results.filter(r => r.overridden).map((result) => (
                <MedCard
                  key={result.id}
                  result={result}
                  onConfirm={handleConfirm}
                  onOverride={handleOverride}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          </section>
        )}

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

      <AlertDialog open={!!overrideOpen} onOpenChange={(val) => !val && setOverrideOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss AI Recommendation?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to discard the AI's flag for <strong>{selectedOverride?.drugName}</strong>. 
              This will remove the item from this list entirely. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmOverride} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Dismiss Result
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
