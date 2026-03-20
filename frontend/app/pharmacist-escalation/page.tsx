"use client"

import { useState, useEffect } from "react"
import { PharmacistEscalationSummary } from "@/components/pharmacist-escalation-summary"

export default function PharmacistEscalationPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const rawResults = localStorage.getItem('recon_results')
    const rawPatient = localStorage.getItem('recon_patient')
    const rawSession = sessionStorage.getItem('dischargeSession')

    const patient = rawPatient ? JSON.parse(rawPatient) : {}
    const session = rawSession ? JSON.parse(rawSession) : {}
    const results = rawResults ? JSON.parse(rawResults) : {}

    // Build flagged issues from AI results
    const flaggedIssues: any[] = []

    // 1. Drug interactions → High severity flags
    if (results.interactions) {
      results.interactions.forEach((inter: any, i: number) => {
        flaggedIssues.push({
          id: `inter-${i}`,
          severity: inter.severity === "major" ? "high" : inter.severity === "moderate" ? "medium" : "low",
          title: `Drug Interaction: ${inter.drug_a} + ${inter.drug_b}`,
          description: inter.effect || "Potential drug-drug interaction detected by DDInter database.",
          aiConfidence: "high",
          aiReasoning: `Detected via DDInter ${inter.category || "cardiovascular"} interaction database. ${inter.recommendation || ""}`,
          nurseConfirmed: "Pending nurse verification during discharge counseling.",
          unresolvedItems: [`Verify ${inter.drug_a} and ${inter.drug_b} combination is intentional`],
          recommendedAction: inter.recommendation || "Pharmacist to verify clinical appropriateness of this drug combination.",
        })
      })
    }

    // 2. Discrepancies → Medium severity flags
    if (results.discrepancies) {
      results.discrepancies.forEach((d: any, i: number) => {
        flaggedIssues.push({
          id: `disc-${i}`,
          severity: "medium",
          title: `Dose Change: ${d.name}`,
          description: `${d.reason}. Home: ${d.home_dose} ${d.home_freq} → Discharge: ${d.discharge_dose} ${d.discharge_freq}`,
          aiConfidence: "high",
          aiReasoning: results.rxnorm_mappings?.some((rm: any) => rm.original === d.name)
            ? "Verified via RxNorm brand-generic mapping. Dose discrepancy detected."
            : "Dose or frequency change detected between home and discharge lists.",
          nurseConfirmed: "Pending nurse confirmation.",
          unresolvedItems: [`Confirm ${d.name} dose change is intentional`],
          recommendedAction: `Verify the ${d.name} dose change with the prescribing physician.`,
        })
      })
    }

    // Build medication reconciliation tables from localStorage lists
    const rawHome = localStorage.getItem('medrecon_home_list')
    const rawDischarge = localStorage.getItem('medrecon_discharge_list')
    const homeMeds = rawHome ? JSON.parse(rawHome) : []
    const dischargeMeds = rawDischarge ? JSON.parse(rawDischarge) : []

    const homeList = homeMeds.map((m: any) => ({
      name: m.drugName || m.name,
      dose: m.strength || m.dose || "",
      frequency: m.frequency || "",
      status: results.stopped_medications?.some((s: any) => s.name.toLowerCase() === (m.drugName || m.name).toLowerCase())
        ? "discontinued" as const
        : results.discrepancies?.some((d: any) => d.name.toLowerCase() === (m.drugName || m.name).toLowerCase())
        ? "modified" as const
        : "unchanged" as const,
    }))

    const dischargeList = dischargeMeds.map((m: any) => ({
      name: m.drugName || m.name,
      dose: m.strength || m.dose || "",
      frequency: m.frequency || "",
      status: results.new_medications?.some((n: any) => n.name.toLowerCase() === (m.drugName || m.name).toLowerCase())
        ? "new" as const
        : results.discrepancies?.some((d: any) => d.name.toLowerCase() === (m.drugName || m.name).toLowerCase())
        ? "modified" as const
        : "unchanged" as const,
    }))

    const now = new Date().toISOString()

    const escalationData = {
      urgency: flaggedIssues.some((f: any) => f.severity === "high") ? "urgent" as const : "routine" as const,
      patient: {
        name: patient.name || session.patientName || "Patient",
        id: patient.mrn || session.patientId || "N/A",
        ward: session.ward || "General Medicine",
        bed: session.bedNumber || "N/A",
        allergies: patient.allergies || session.allergies || [],
        dischargeDate: patient.dischargeDate || session.dischargeDate || new Date().toISOString().split("T")[0],
      },
      flaggedIssues,
      medicationReconciliation: {
        homeList,
        dischargeList,
      },
      nurseNotes: `Automated AI reconciliation completed. ${flaggedIssues.length} issue(s) flagged for pharmacist review. ${results.summary?.continued || 0} medications continued, ${results.summary?.changed || 0} changed, ${results.summary?.stopped || 0} stopped, ${results.summary?.new_meds || 0} new.`,
      timestamps: {
        reconciliationStarted: now,
        reconciliationCompleted: now,
        escalationGenerated: now,
      },
      nurse: {
        name: "Discharge Nurse",
        id: "RN-0001",
      },
    }

    setData(escalationData)
    setIsLoading(false)
  }, [])

  if (isLoading || !data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading escalation data...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <PharmacistEscalationSummary data={data} />
    </main>
  )
}
