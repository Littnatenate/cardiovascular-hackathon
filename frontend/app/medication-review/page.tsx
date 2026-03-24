"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ScanSearch, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientBanner } from "@/components/med-review/patient-banner"
import { MedListColumn, type Medication } from "@/components/med-review/med-list-column"
import { reconcileMedications } from "@/lib/api"
import { SessionLayout } from "@/components/session-layout"
import { SessionTopBar } from "@/components/session-top-bar"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

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
  const isCancelledRef = useRef(false)

  useEffect(() => {
    // Load patient data from session (friend's feature)
    const savedSession = sessionStorage.getItem("dischargeSession")
    let activeId = "MRC-2024-0047";
    if (savedSession) {
      const data = JSON.parse(savedSession)
      if (data.id) activeId = data.id;
      setPatient({
        name: data.patientName || "Margaret Thompson",
        dob: "04/12/1951",
        mrn: data.mrn || "S1234567A",
        allergies: (data.allergies && data.allergies.length > 0) ? data.allergies : ["None Known"],
        dischargeDate: data.dischargeDate || "Mar 19, 2026",
      })
    }

    // Load medication lists from localStorage (AI persistence)
    const rawHome = localStorage.getItem(`medrecon_home_list_${activeId}`)
    const rawDischarge = localStorage.getItem(`medrecon_discharge_list_${activeId}`)
    
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
    isCancelledRef.current = false
    
    try {
      const formattedHome = homeMeds.map(m => ({ name: m.name, dose: m.strength, frequency: m.frequency }))
      const formattedDischarge = dischargeMeds.map(m => ({ name: m.name, dose: m.strength, frequency: m.frequency }))

      // Pass patient allergies to the AI Safety Engine
      const allergyList = Array.isArray(patient.allergies) ? patient.allergies : []
      const results = await reconcileMedications(formattedHome, formattedDischarge, allergyList)
      
      if (isCancelledRef.current) {
        setScreen("review")
        return // Abort redirect if cancelled
      }
      
      const sessionData = sessionStorage.getItem("dischargeSession")
      let activeId = "MRC-2024-0047";
      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        if (parsed.id) activeId = parsed.id;
      }

      localStorage.setItem(`medrecon_results_${activeId}`, JSON.stringify(results))
      localStorage.setItem(`medrecon_patient_${activeId}`, JSON.stringify(patient))
      
      setScreen("done")
      setTimeout(() => {
        if (!isCancelledRef.current) {
           router.push('/ai-comparison')
        }
      }, 800)
    } catch (err) {
      if (isCancelledRef.current) return
      console.error("AI Analysis failed:", err)
      setScreen("review")
      alert("AI Service unreachable. Please ensure the Python backend is running on port 8000.")
    }
  }

  const handleCancelAnalysis = () => {
    isCancelledRef.current = true
    setScreen("review")
  }

  return (
    <SessionLayout>
      <SessionTopBar 
        patientName={patient.name} 
        patientId={patient.mrn} 
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
            disabled={screen === "done"}
          >
            {screen === "done" ? (
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

      {/* Loading Modal */}
      <AlertDialog open={screen === "analyzing"}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">Analyzing Medications</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              The AI Safety Engine is currently cross-referencing discharge medications against home meds, known guidelines, and allergy profiles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel onClick={handleCancelAnalysis} className="mt-4">
              Cancel Analysis
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SessionLayout>
  )
}
