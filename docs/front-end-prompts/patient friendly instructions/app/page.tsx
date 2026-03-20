"use client"

import { Button } from "@/components/ui/button"
import { MedicationCard, type Medication } from "@/components/medication-card"
import { Printer, FileText, Check, Heart, AlertCircle } from "lucide-react"

// Sample patient data
const patientData = {
  name: "Mr. Tan Wei Ming",
  date: "20 March 2026",
}

// Sample medications based on the spec
const medications: Medication[] = [
  {
    id: "1",
    brandName: "Atorvastatin",
    genericName: "Lipitor",
    category: "Cholesterol medicine",
    purpose: "Helps lower your cholesterol to protect your heart.",
    dosage: "1 tablet",
    timing: "every night",
    withFood: undefined,
    status: "changed",
    changeDescription:
      "Your dose has been increased from 20 mg to 40 mg. This is a stronger dose to better control your cholesterol.",
    warnings: [
      "Muscle pain or weakness — tell your doctor if this happens.",
      "Avoid eating large amounts of grapefruit.",
    ],
  },
  {
    id: "2",
    brandName: "Metformin",
    category: "Diabetes medicine",
    purpose: "Helps control your blood sugar levels.",
    dosage: "1 tablet",
    timing: "in the morning and 1 tablet at night",
    withFood: true,
    status: "continued",
    warnings: [
      "Stomach upset is common at first. Take with meals to reduce this.",
    ],
  },
  {
    id: "3",
    brandName: "Enoxaparin",
    category: "Blood thinner injection",
    purpose: "Prevents blood clots after your hospital stay.",
    dosage: "1 injection under the skin",
    timing: "once daily",
    specialInstructions: "Your nurse or caregiver will show you how.",
    status: "new",
    warnings: [
      "Bruising at the injection site is normal.",
      "Seek help immediately if you see unusual bleeding (e.g. blood in urine, black stools, bleeding that won't stop).",
    ],
  },
  {
    id: "4",
    brandName: "Omeprazole",
    category: "Stomach medicine",
    purpose: "",
    dosage: "",
    timing: "",
    status: "stopped",
    warnings: [],
  },
]

const importantReminders = [
  "Don't stop any medication without asking your doctor first.",
  "Keep all your medications in a cool, dry place away from direct sunlight.",
  "Bring this sheet to your next doctor's appointment.",
  "If you feel unwell or have any concerns, contact your doctor or visit the clinic.",
]

export default function PatientInstructions() {
  const handlePrint = () => {
    window.print()
  }

  const handleSaveAsPDF = () => {
    window.print()
  }

  const handleDone = () => {
    alert("Instructions acknowledged!")
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
            <p className="font-medium text-foreground">{patientData.name}</p>
            <p>{patientData.date}</p>
          </div>
        </header>

        {/* Medications List */}
        <section className="space-y-6 mb-10" aria-label="Medications">
          {medications.map((medication) => (
            <MedicationCard key={medication.id} medication={medication} />
          ))}
        </section>

        {/* Important Reminders */}
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
            onClick={handleSaveAsPDF}
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
          <p>Generated on {patientData.date} • For questions, contact your healthcare provider</p>
        </div>
      </main>
    </div>
  )
}
