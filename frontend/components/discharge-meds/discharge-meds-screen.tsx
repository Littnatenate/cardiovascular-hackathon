"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pill, FileText, Plus, ArrowLeft, ArrowRight, Trash2 } from "lucide-react"
import { SessionTopBar } from "@/components/session-top-bar"

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
  const [meds, setMeds] = useState<Medication[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [patientData, setPatientData] = useState({ name: "Sarah Johnson", id: "MRC-2024-0047" })

  // Load patient data from session (friend's feature)
  useEffect(() => {
    const saved = sessionStorage.getItem("dischargeSession")
    if (saved) {
      const data = JSON.parse(saved)
      setPatientData({
        name: data.patientName,
        id: data.id || "MRC-2024-0047"
      })
    }
  }, [])

  // Load from localStorage on mount (AI persistence)
  useEffect(() => {
    const saved = localStorage.getItem("medrecon_discharge_list")
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Sanitize legacy mock data
        const fixedMeds = parsed.map((m: any, idx: number) => ({
          ...m,
          id: m.id || `legacy-discharge-${idx}`,
          drugName: m.drugName || m.name || "Unknown",
          source: m.source || "manual",
          strength: m.strength || "100mg"
        }));
        setMeds(fixedMeds);
      } catch (e) {
        console.error("Failed to parse saved discharge meds", e)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save to localStorage on change (AI persistence)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("medrecon_discharge_list", JSON.stringify(meds))
    }
  }, [meds, isInitialized])

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
          onClick={() => router.push("/home-meds")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          disabled={meds.length === 0}
          onClick={() => router.push("/medication-review")}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Review
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  )
}
