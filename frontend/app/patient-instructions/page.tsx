"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MedicationCard, type Medication } from "@/components/medication-card"
import { Printer, FileText, Check, Heart, AlertCircle, ChevronLeft } from "lucide-react"

const importantReminders = [
  "Don't stop any medication without asking your doctor first.",
  "Keep all your medications in a cool, dry place away from direct sunlight.",
  "Bring this sheet to your next doctor's appointment.",
  "If you feel unwell or have any concerns, contact your doctor or visit the clinic.",
]

export default function PatientInstructions() {
  const router = useRouter()
  const [patientName, setPatientName] = useState("Patient")
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load patient info
    const rawPatient = localStorage.getItem('recon_patient')
    if (rawPatient) {
      const patient = JSON.parse(rawPatient)
      setPatientName(patient.name || "Patient")
    }

    // Load AI reconciliation results and convert to patient-friendly medication cards
    const rawResults = localStorage.getItem('recon_results')
    if (rawResults) {
      const data = JSON.parse(rawResults)
      const meds: Medication[] = []

      // 1. Discrepancies (Changed medications)
      if (data.discrepancies) {
        data.discrepancies.forEach((d: any, i: number) => {
          meds.push({
            id: `changed-${i}`,
            brandName: d.name,
            category: "Prescription medicine",
            purpose: `This medicine was adjusted during your hospital stay.`,
            dosage: d.discharge_dose || "As prescribed",
            timing: d.discharge_freq || "As directed",
            status: "changed",
            changeDescription: `${d.reason}. Your previous dose was ${d.home_dose} ${d.home_freq}. Your new dose is ${d.discharge_dose} ${d.discharge_freq}.`,
            warnings: [],
          })
        })
      }

      // 2. New medications
      if (data.new_medications) {
        data.new_medications.forEach((m: any, i: number) => {
          meds.push({
            id: `new-${i}`,
            brandName: m.name,
            category: "Newly prescribed medicine",
            purpose: "This is a new medication started during your hospital stay.",
            dosage: m.dose || "As prescribed",
            timing: m.frequency || "As directed",
            status: "new",
            warnings: [
              "This is new — report any unusual side effects to your doctor.",
            ],
          })
        })
      }

      // 3. Stopped medications
      if (data.stopped_medications) {
        data.stopped_medications.forEach((m: any, i: number) => {
          meds.push({
            id: `stopped-${i}`,
            brandName: m.name,
            category: "Previously taken medicine",
            purpose: "",
            dosage: "",
            timing: "",
            status: "stopped",
            warnings: [],
          })
        })
      }

      // 4. Continued medications (from summary)
      if (data.continued_medications) {
        data.continued_medications.forEach((m: any, i: number) => {
          meds.push({
            id: `cont-${i}`,
            brandName: m.name,
            category: "Ongoing medicine",
            purpose: "Continue taking this medicine as before.",
            dosage: m.dose || "As prescribed",
            timing: m.frequency || "As directed",
            status: "continued",
            warnings: [],
          })
        })
      }

      // 5. Interactions — add warnings to relevant meds
      if (data.interactions) {
        data.interactions.forEach((inter: any) => {
          const warning = `⚠️ INTERACTION: ${inter.drug_a} + ${inter.drug_b} — ${inter.effect}. ${inter.recommendation}`
          // Try to attach warnings to existing medications
          const matchA = meds.find(m => m.brandName.toLowerCase() === inter.drug_a.toLowerCase())
          const matchB = meds.find(m => m.brandName.toLowerCase() === inter.drug_b.toLowerCase())
          if (matchA) matchA.warnings.push(warning)
          if (matchB && matchB !== matchA) matchB.warnings.push(warning)
        })
      }

      // Add RxNorm genericName mapping
      if (data.rxnorm_mappings) {
        data.rxnorm_mappings.forEach((rm: any) => {
          const match = meds.find(m => m.brandName.toLowerCase() === rm.original.toLowerCase() || m.brandName.toLowerCase() === rm.generic.toLowerCase())
          if (match && rm.original !== rm.generic) {
            match.genericName = rm.original === match.brandName ? rm.generic : rm.original
          }
        })
      }

      setMedications(meds)
    }
    setIsLoading(false)
  }, [])

  const handlePrint = () => { window.print() }
  const handleDone = () => { router.push('/session-summary') }

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric"
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading instructions...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 print:px-8 print:py-4">
        {/* Header */}
        <header className="mb-8 text-center print:mb-6">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 print:bg-gray-100">
              <Heart className="size-7 text-primary print:text-gray-700" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 print:text-2xl">
            Your Medication Plan
          </h1>
          <div className="text-lg text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{patientName}</p>
            <p>{today}</p>
          </div>
        </header>

        {/* Medications List */}
        <section className="space-y-6 mb-10" aria-label="Medications">
          {medications.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No reconciliation results found. Please run the AI comparison first.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/medication-review')}>
                <ChevronLeft className="size-4 mr-1" /> Go to Review
              </Button>
            </div>
          ) : (
            medications.map((medication) => (
              <MedicationCard key={medication.id} medication={medication} />
            ))
          )}
        </section>

        {/* Important Reminders */}
        {medications.length > 0 && (
          <section
            className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 mb-8 print:break-inside-avoid print:border-gray-300 print:bg-gray-50"
            aria-label="Important reminders"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="size-6 text-primary shrink-0 mt-0.5 print:text-gray-700" />
              <h2 className="text-xl font-bold text-foreground">
                Important Reminders
              </h2>
            </div>
            <ul className="space-y-3 ml-9">
              {importantReminders.map((reminder, index) => (
                <li
                  key={index}
                  className="text-lg text-foreground leading-relaxed flex items-start gap-2"
                >
                  <span className="text-primary font-bold print:text-gray-700">•</span>
                  <span>{reminder}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Action Buttons - Hidden in Print */}
        <footer className="flex flex-wrap items-center justify-center gap-4 print:hidden">
          <Button
            size="lg"
            variant="outline"
            onClick={handlePrint}
            className="gap-2 text-base px-6"
          >
            <Printer className="size-5" />
            Print
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handlePrint}
            className="gap-2 text-base px-6"
          >
            <FileText className="size-5" />
            Save as PDF
          </Button>
          <Button
            size="lg"
            onClick={handleDone}
            className="gap-2 text-base px-6"
          >
            <Check className="size-5" />
            Done
          </Button>
        </footer>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Generated on {today} • For questions, contact your healthcare provider</p>
        </div>
      </main>
    </div>
  )
}
