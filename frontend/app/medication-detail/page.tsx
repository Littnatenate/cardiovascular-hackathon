"use client"

import { useState } from "react"
import { MedicationHeader } from "@/components/medication-detail/medication-header"
import { ComparisonDetail } from "@/components/medication-detail/comparison-detail"
import { AIReasoning } from "@/components/medication-detail/ai-reasoning"
import { ClinicalContext } from "@/components/medication-detail/clinical-context"
import { NurseAction } from "@/components/medication-detail/nurse-action"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample medication data
const medicationData = {
  id: "med-001",
  drugName: "Atorvastatin",
  status: "needs_review" as const,
  homeMed: {
    name: "Lipitor",
    strength: "20mg",
    dose: "1 tablet",
    frequency: "Once daily at bedtime",
    source: "Patient medication list (pharmacy verified)",
  },
  dischargeMed: {
    name: "Atorvastatin",
    strength: "40mg",
    dose: "1 tablet",
    frequency: "Once daily at bedtime",
  },
  changes: [
    { field: "name", type: "brand-to-generic" as const },
    { field: "strength", type: "dose-change" as const },
  ],
  aiReasoning: {
    matchMethod: "Lipitor → Atorvastatin via RxNorm brand-generic mapping",
    confidenceScore: 94,
    confidenceFactors: [
      { label: "Brand-generic match confirmed", impact: "positive" as const },
      { label: "Dose increase detected (20mg → 40mg)", impact: "neutral" as const },
      { label: "Same therapeutic class", impact: "positive" as const },
    ],
    interactions: [
      {
        severity: "moderate" as const,
        medication: "Warfarin",
        description: "May increase anticoagulant effect. Monitor INR closely.",
      },
    ],
  },
  clinicalContext: {
    drugClass: "HMG-CoA Reductase Inhibitor (Statin)",
    indication: "Cholesterol management, cardiovascular risk reduction",
    commonReasons: [
      "Dose increase for inadequate LDL control",
      "Brand to generic substitution for cost savings",
      "Titration as part of lipid management protocol",
    ],
    referenceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=atorvastatin",
  },
}

export default function MedicationDetailPage() {
  const [actionTaken, setActionTaken] = useState<string | null>(null)
  const [note, setNote] = useState("")

  const handleConfirm = () => {
    setActionTaken("confirmed")
    // In real app: navigate back to Screen 7
  }

  const handleOverride = (reason: string) => {
    setActionTaken(`override:${reason}`)
    // In real app: navigate back to Screen 7
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to medication list
        </Button>

        {/* Header with drug name and status */}
        <MedicationHeader
          drugName={medicationData.drugName}
          status={medicationData.status}
        />

        <div className="mt-6 flex flex-col gap-6">
          {/* Section 1: Comparison Detail */}
          <ComparisonDetail
            homeMed={medicationData.homeMed}
            dischargeMed={medicationData.dischargeMed}
            changes={medicationData.changes}
          />

          {/* Section 2: AI Reasoning */}
          <AIReasoning
            matchMethod={medicationData.aiReasoning.matchMethod}
            confidenceScore={medicationData.aiReasoning.confidenceScore}
            confidenceFactors={medicationData.aiReasoning.confidenceFactors}
            interactions={medicationData.aiReasoning.interactions}
          />

          {/* Section 3: Clinical Context */}
          <ClinicalContext
            drugClass={medicationData.clinicalContext.drugClass}
            indication={medicationData.clinicalContext.indication}
            commonReasons={medicationData.clinicalContext.commonReasons}
            referenceUrl={medicationData.clinicalContext.referenceUrl}
          />

          {/* Section 4: Nurse Action */}
          <NurseAction
            onConfirm={handleConfirm}
            onOverride={handleOverride}
            note={note}
            onNoteChange={setNote}
            actionTaken={actionTaken}
          />
        </div>
      </div>
    </main>
  )
}
