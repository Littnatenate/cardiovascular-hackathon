"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Pill, FileText, Plus, ArrowLeft, ArrowRight, Trash2 } from "lucide-react"
import { SessionTopBar } from "@/components/session-top-bar"
import { getSession, updateSession } from "@/lib/api"

// ── Types ──────────────────────────────────────────────────────
interface Medication {
  id: string
  drugName: string
  strength: string
  dose: string
  frequency: string
  route?: string
}

function createId() {
  return Math.random().toString(36).substring(2, 11)
}

// ── Component ──────────────────────────────────────────────────
export function DischargeMedsScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [meds, setMeds] = useState<Medication[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [patientData, setPatientData] = useState({ name: "Loading...", id: "Loading..." })

  const sessionId = searchParams.get("session_id") || (() => {
    try {
      const raw = sessionStorage.getItem("dischargeSession");
      return raw ? JSON.parse(raw).id : null;
    } catch (e) { return null; }
  })();

  // Load patient data and medications from DB on mount
  useEffect(() => {
    if (!sessionId) {
      router.push("/dashboard");
      return;
    }
    
    async function fetchSessionData() {
      try {
        const session = await getSession(sessionId);
        setPatientData({
          name: session.patient_name,
          id: session.id
        });
        
        if (session.discharge_meds) {
          const parsed = session.discharge_meds;
          // Sanitize legacy data
          const fixedMeds = parsed.map((m: any, idx: number) => ({
            ...m,
            id: m.id || `legacy-discharge-${idx}`,
            drugName: m.drugName || m.name || "Unknown",
            source: m.source || "manual",
            strength: m.strength || "100mg"
          }));
          setMeds(fixedMeds);
        }
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to load session details:", err);
      }
    }

    fetchSessionData();
  }, [sessionId, router]);

  // Save to DB on change
  useEffect(() => {
    if (isInitialized && sessionId) {
      async function saveDischargeMeds() {
        try {
          await updateSession(sessionId, { dischargeMeds: meds });
        } catch (err) {
          console.error("Failed to save discharge meds:", err);
        }
      }
      saveDischargeMeds();
    }
  }, [meds, isInitialized, sessionId]);

  const handleUpdate = (id: string, field: keyof Medication, value: string) => {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const handleDelete = (id: string) => {
    setMeds((prev) => prev.filter((m) => m.id !== id))
  }

  const handleAddMed = () => {
    const newMed: Medication = {
      id: crypto.randomUUID(),
      drugName: "",
      strength: "",
      dose: "",
      frequency: "",
      route: "Oral",
    }
    setMeds((prev) => [...prev, newMed])
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    }, 50)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SessionTopBar 
        patientName={patientData.name} 
        sessionId={patientData.id} 
        step={3} 
      />

      <main className="flex-1 px-4 py-4 space-y-4 pb-32 mx-auto max-w-3xl w-full">
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight text-balance">
              Discharge Medications
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              Enter medications from the doctor&apos;s discharge prescription
            </p>
          </div>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Pill className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Medication list */}
        <div className="space-y-2">
          {meds.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No medications added yet</p>
            </div>
          )}
          {meds.map((med, index) => (
            <div
              key={med.id}
              className="rounded-xl border border-border bg-card p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Med #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(med.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Delete medication ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Drug name"
                  value={med.drugName}
                  onChange={(e) => handleUpdate(med.id, "drugName", e.target.value)}
                  className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Strength (e.g. 40mg)"
                  value={med.strength}
                  onChange={(e) => handleUpdate(med.id, "strength", e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Dose (e.g. 1 tablet)"
                  value={med.dose}
                  onChange={(e) => handleUpdate(med.id, "dose", e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  value={med.frequency}
                  onChange={(e) => handleUpdate(med.id, "frequency", e.target.value)}
                  className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add medication button */}
        <button
          type="button"
          onClick={handleAddMed}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add medication
        </button>
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 flex gap-3 shadow-lg">
        <button
          type="button"
          onClick={() => router.push(`/home-meds?session_id=${sessionId}`)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          disabled={meds.length === 0}
          onClick={() => router.push(`/medication-review?session_id=${sessionId}`)}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Review
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  )
}
