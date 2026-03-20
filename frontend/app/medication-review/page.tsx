"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ScanSearch, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientBanner } from "@/components/med-review/patient-banner"
import { MedListColumn, type Medication } from "@/components/med-review/med-list-column"
import { reconcileMedications } from "@/lib/api"
import { SessionLayout } from "@/components/session-layout"
import { SessionTopBar } from "@/components/session-top-bar"

const DEFAULT_PATIENT = {
  name: "Margaret Thompson",
  dob: "04/12/1951",
  mrn: "MRN-002847",
  allergies: ["Penicillin", "Sulfa"],
  dischargeDate: "Mar 19, 2026",
}

const DISCHARGE_MEDS: Medication[] = [
  { id: "d1", name: "Atorvastatin", strength: "40 mg", frequency: "Once daily" },
  { id: "d2", name: "Metformin", strength: "500 mg", frequency: "Twice daily" },
  { id: "d3", name: "Amlodipine", strength: "5 mg", frequency: "Once daily" },
  { id: "d4", name: "Enoxaparin", strength: "40 mg", frequency: "Once daily (inject.)" },
]

const HOME_MEDS: Medication[] = [
  { id: "h1", name: "Lipitor", strength: "20 mg", frequency: "Once daily", source: "photo" },
  { id: "h2", name: "Metformin", strength: "500 mg", frequency: "Twice daily", source: "admission" },
  { id: "h3", name: "Omeprazole", strength: "20 mg", frequency: "Once daily", source: "manual" },
]

type ScreenState = "review" | "analyzing" | "done"

export default function PreAnalysisReview() {
  const router = useRouter()
  const [screen, setScreen] = useState<ScreenState>("review")
  const [patient, setPatient] = useState(DEFAULT_PATIENT)

  useEffect(() => {
    const saved = sessionStorage.getItem("dischargeSession")
    if (saved) {
      const data = JSON.parse(saved)
      setPatient({
        name: data.patientName,
        dob: "04/12/1951",
        mrn: data.patientId || "MRN-002847",
        allergies: (data.allergies && data.allergies.length > 0) ? data.allergies : ["None Known"],
        dischargeDate: data.dischargeDate || "Mar 19, 2026",
      })
    }
  }, [])

  async function handleRunAnalysis() {
    setScreen("analyzing")
    try {
      // Small artificial delay for UX feel
      await new Promise(r => setTimeout(r, 1000))
      
      const results = await reconcileMedications(HOME_MEDS, DISCHARGE_MEDS)
      console.log("Analysis results:", results)
      
      setScreen("done")
      // Wait a moment for the "Done" state to show before navigating
      setTimeout(() => router.push('/ai-comparison'), 800)
    } catch (err) {
      console.error(err)
      setScreen("review")
      alert("Backend server not reached. Make sure it is running!")
    }
  }

  return (
    <SessionLayout>
      <SessionTopBar 
        patientName={patient.name} 
        sessionId={patient.mrn} 
        step={4} 
      />
      {/* Page body */}
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-5">
        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-foreground text-balance">
            Review Before Analysis
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            Confirm both medication lists are complete and accurate before running the AI comparison.
          </p>
        </div>

        {/* Patient info banner */}
        <PatientBanner {...patient} />

        {/* Two-column med lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MedListColumn
            title="Discharge Meds"
            meds={DISCHARGE_MEDS}
            variant="discharge"
            onEdit={() => router.push('/discharge-meds')}
          />
          <MedListColumn
            title="Home Meds"
            meds={HOME_MEDS}
            variant="home"
            onEdit={() => router.push('/home-meds')}
          />
        </div>

        {/* Insight callout */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Quick look:</span> Discharge has {DISCHARGE_MEDS.length} medications and
          home has {HOME_MEDS.length}. Omeprazole appears on the home list but not on discharge — it may have been
          intentionally stopped. The AI comparison will flag all discrepancies.
        </div>

        {/* Bottom action row */}
        <div className="flex flex-col items-center gap-3 pt-1">
          {/* Primary CTA */}
          <Button
            size="lg"
            className="w-full max-w-sm gap-2 text-base font-semibold shadow-md"
            onClick={handleRunAnalysis}
            disabled={screen !== "review"}
          >
            {screen === "analyzing" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                Analyzing medications...
              </>
            ) : screen === "done" ? (
              <>
                <ShieldCheck className="h-5 w-5" />
                Analysis Complete — View Results
              </>
            ) : (
              <>
                <ScanSearch className="h-5 w-5" />
                Run AI Comparison
              </>
            )}
          </Button>

        </div>
      </main>
    </SessionLayout>
  )
}

