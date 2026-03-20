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

type ScreenState = "review" | "analyzing" | "done"

export default function PreAnalysisReview() {
  const router = useRouter()
  const [screen, setScreen] = useState<ScreenState>("review")
  const [homeMeds, setHomeMeds] = useState<Medication[]>([])
  const [dischargeMeds, setDischargeMeds] = useState<Medication[]>([])
  const [patient, setPatient] = useState(DEFAULT_PATIENT)

  useEffect(() => {
    // Load patient data from session (friend's feature)
    const savedSession = sessionStorage.getItem("dischargeSession")
    if (savedSession) {
      const data = JSON.parse(savedSession)
      setPatient({
        name: data.patientName,
        dob: "04/12/1951",
        mrn: data.patientId || "MRN-002847",
        allergies: (data.allergies && data.allergies.length > 0) ? data.allergies : ["None Known"],
        dischargeDate: data.dischargeDate || "Mar 19, 2026",
      })
    }

    // Load medication lists from localStorage (AI persistence)
    const rawHome = localStorage.getItem('medrecon_home_list')
    const rawDischarge = localStorage.getItem('medrecon_discharge_list')
    
    if (rawHome) {
      const parsed = JSON.parse(rawHome)
      setHomeMeds(parsed.map((m: any) => ({
        id: m.id,
        name: m.drugName || m.name,
        strength: m.strength,
        frequency: m.frequency,
        source: m.source
      })))
    }

    if (rawDischarge) {
      const parsed = JSON.parse(rawDischarge)
      setDischargeMeds(parsed.map((m: any) => ({
        id: m.id,
        name: m.drugName || m.name,
        strength: m.strength,
        frequency: m.frequency
      })))
    }
  }, [])

  async function handleRunAnalysis() {
    if (homeMeds.length === 0 || dischargeMeds.length === 0) {
      alert("Please ensure both medication lists have at least one entry.")
      return
    }
    
    setScreen("analyzing")
    try {
      const formattedHome = homeMeds.map(m => ({ name: m.name, dose: m.strength, frequency: m.frequency }))
      const formattedDischarge = dischargeMeds.map(m => ({ name: m.name, dose: m.strength, frequency: m.frequency }))

      // Pass patient allergies to the AI Safety Engine
      const allergyList = Array.isArray(patient.allergies) ? patient.allergies : []
      const results = await reconcileMedications(formattedHome, formattedDischarge, allergyList)
      
      localStorage.setItem('recon_results', JSON.stringify(results))
      localStorage.setItem('recon_patient', JSON.stringify(patient))
      
      setScreen("done")
      setTimeout(() => router.push('/ai-comparison'), 800)
    } catch (err) {
      console.error("AI Analysis failed:", err)
      setScreen("review")
      alert("AI Service unreachable. Please ensure the Python backend is running on port 8000.")
    }
  }

  return (
    <SessionLayout>
      <SessionTopBar 
        patientName={patient.name} 
        sessionId={patient.mrn} 
        step={4} 
        backRoute="/discharge-meds" 
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
            meds={dischargeMeds}
            variant="discharge"
            onEdit={() => router.push('/discharge-meds')}
          />
          <MedListColumn
            title="Home Meds"
            meds={homeMeds}
            variant="home"
            onEdit={() => router.push('/home-meds')}
          />
        </div>

        {/* Insight callout */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Quick look:</span> Discharge has {dischargeMeds.length} medications and
          home has {homeMeds.length}. The AI comparison will flag all discrepancies.
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
