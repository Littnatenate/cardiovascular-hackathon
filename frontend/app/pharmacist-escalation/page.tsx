"use client"

import { useState } from "react"
import { PharmacistEscalationSummary } from "@/components/pharmacist-escalation-summary"

// Sample data matching the specification
const sampleEscalationData = {
  urgency: "urgent" as const,
  patient: {
    name: "Margaret Thompson",
    id: "MRN-2024-78432",
    ward: "Cardiac Care Unit",
    bed: "CCU-12",
    allergies: ["Penicillin", "Sulfa drugs", "Iodine contrast"],
    dischargeDate: "2026-03-22",
  },
  flaggedIssues: [
    {
      id: "1",
      severity: "high" as const,
      title: "Anticoagulant newly prescribed",
      description:
        "Enoxaparin 40 mg (new) prescribed alongside existing aspirin (if detected). Potential bleeding risk.",
      aiConfidence: "medium" as const,
      aiReasoning:
        "Aspirin not explicitly in either list but referenced in admission notes. Cross-referencing found mention of 'daily aspirin therapy' in patient history.",
      nurseConfirmed:
        "Enoxaparin is intentional per cardiology consult. Aspirin status unclear - not on current medication list but patient reports taking it at home.",
      unresolvedItems: ["Aspirin continuation status", "INR monitoring schedule"],
      recommendedAction:
        "Pharmacist to verify whether aspirin should be continued, held, or stopped. Consider bleeding risk assessment.",
    },
    {
      id: "2",
      severity: "medium" as const,
      title: "Multiple dose changes in session",
      description:
        "Metformin dosage changed from 500mg BID to 1000mg BID. Lisinopril changed from 10mg to 20mg daily.",
      aiConfidence: "high" as const,
      aiReasoning:
        "Both changes documented in discharge orders. Changes align with standard titration protocols.",
      nurseConfirmed:
        "Confirmed both dose increases with attending physician. Patient counseled on new dosing.",
      unresolvedItems: ["Renal function check timing for metformin"],
      recommendedAction:
        "Verify renal function supports metformin increase. Confirm BP monitoring plan for lisinopril.",
    },
    {
      id: "3",
      severity: "low" as const,
      title: "Low-confidence medication match",
      description:
        'AI matched "Vitamin D" from home list to "Cholecalciferol 1000 IU" on discharge - confidence 72%.',
      aiConfidence: "low" as const,
      aiReasoning:
        "Generic 'Vitamin D' could refer to D2 or D3, various strengths. Matched based on common prescribing patterns.",
      nurseConfirmed: "Patient unsure of exact vitamin D product used at home.",
      unresolvedItems: ["Exact home vitamin D formulation"],
      recommendedAction: "Clarify vitamin D formulation and strength with patient or family.",
    },
  ],
  medicationReconciliation: {
    homeList: [
      { name: "Lisinopril", dose: "10 mg", frequency: "Daily", status: "modified" as const },
      { name: "Metformin", dose: "500 mg", frequency: "BID", status: "modified" as const },
      { name: "Atorvastatin", dose: "40 mg", frequency: "Daily", status: "unchanged" as const },
      { name: "Vitamin D", dose: "Unknown", frequency: "Daily", status: "unresolved" as const },
      { name: "Aspirin", dose: "81 mg", frequency: "Daily", status: "unresolved" as const },
    ],
    dischargeList: [
      { name: "Lisinopril", dose: "20 mg", frequency: "Daily", status: "modified" as const },
      { name: "Metformin", dose: "1000 mg", frequency: "BID", status: "modified" as const },
      { name: "Atorvastatin", dose: "40 mg", frequency: "Daily", status: "unchanged" as const },
      { name: "Enoxaparin", dose: "40 mg", frequency: "Daily", status: "new" as const },
      { name: "Cholecalciferol", dose: "1000 IU", frequency: "Daily", status: "unresolved" as const },
    ],
  },
  nurseNotes:
    "Patient is 78 y/o female admitted for CHF exacerbation. Cardiology consulted for new AFib - initiated anticoagulation. Family reports patient was taking 'blood thinner' at home but unsure if aspirin or something else. Recommend pharmacy verification before discharge. Patient has follow-up with cardiology in 1 week.",
  timestamps: {
    reconciliationStarted: "2026-03-20T09:15:00Z",
    reconciliationCompleted: "2026-03-20T09:42:00Z",
    escalationGenerated: "2026-03-20T09:42:18Z",
  },
  nurse: {
    name: "Sarah Chen, RN",
    id: "RN-4521",
  },
}

export default function PharmacistEscalationPage() {
  const [data] = useState(sampleEscalationData)

  return (
    <main className="min-h-screen bg-background">
      <PharmacistEscalationSummary data={data} />
    </main>
  )
}
