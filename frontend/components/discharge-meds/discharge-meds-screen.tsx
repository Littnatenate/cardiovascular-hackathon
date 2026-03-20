"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pill, FileText, Plus, ArrowLeft, ArrowRight } from "lucide-react"
import { SessionTopBar } from "@/components/session-top-bar"
import { MedRow, type Medication } from "./med-row"
import { ImportTextModal } from "./import-text-modal"

const INITIAL_MEDS: Medication[] = []

function createId() {
  return Math.random().toString(36).substring(2, 11)
}

function parseImportedText(text: string): Medication[] {
  // Simple line-by-line parser for demo purposes
  return text.split("\n")
    .filter(line => line.trim().length > 0)
    .map(line => ({
      id: createId(),
      drugName: line.trim(),
      strength: "",
      dose: "",
      frequency: "Once daily",
      route: "Oral"
    }))
}

export function DischargeMedsScreen() {
  const router = useRouter()
  const [meds, setMeds] = useState<Medication[]>(INITIAL_MEDS)
  const [showImport, setShowImport] = useState(false)
  const [patientData, setPatientData] = useState({ name: "Sarah Johnson", id: "MRC-2024-0047" })

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

  const handleUpdate = (id: string, field: keyof Medication, value: string) => {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const handleDelete = (id: string) => {
    setMeds((prev) => prev.filter((m) => m.id !== id))
  }

  const handleAddMed = () => {
    const newMed: Medication = {
      id: createId(),
      drugName: "",
      strength: "",
      dose: "",
      frequency: "",
      route: "Oral",
    }
    setMeds((prev) => [...prev, newMed])
    // Scroll to bottom after paint
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    }, 50)
  }

  const handleImport = (text: string) => {
    const parsed = parseImportedText(text)
    if (parsed.length > 0) {
      setMeds((prev) => [...prev, ...parsed])
    }
    setShowImport(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SessionTopBar 
        patientName={patientData.name} 
        sessionId={patientData.id} 
        step={3} 
      />

      <main className="flex-1 px-4 py-4 space-y-4 pb-32">
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

        {/* Import shortcut */}
        <button
          type="button"
          onClick={() => setShowImport(true)}
          className="w-full flex items-center gap-2.5 px-4 py-3 border border-dashed border-primary/40 rounded-xl bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 hover:border-primary/60 transition-colors"
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span>Import from text</span>
          <span className="ml-auto text-xs font-normal text-primary/60 bg-primary/10 rounded-full px-2 py-0.5">AI-powered</span>
        </button>

        {/* Medication list */}
        <div className="space-y-2">
          {meds.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No medications added yet</p>
            </div>
          )}
          {meds.map((med, index) => (
            <MedRow
              key={med.id}
              med={med}
              index={index}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
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

        {/* Swipe hint — mobile only */}
        <p className="text-center text-[11px] text-muted-foreground/60 sm:hidden">
          Swipe left on a medication to delete it
        </p>
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 flex gap-3 shadow-lg">
        <button
          type="button"
          onClick={() => router.push('/home-meds')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={() => router.push('/medication-review')}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          Next: Review
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {showImport && (
        <ImportTextModal onClose={() => setShowImport(false)} onImport={handleImport} />
      )}
    </div>
  )
}
