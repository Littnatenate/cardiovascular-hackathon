"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PharmacistEscalationSummary } from "@/components/pharmacist-escalation-summary"
import { getSession } from "@/lib/api"

function PharmacistEscalationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const sessionId = searchParams.get("session_id") || (() => {
    try {
      const raw = sessionStorage.getItem("dischargeSession");
      return raw ? JSON.parse(raw).id : null;
    } catch (e) { return null; }
  })();

  useEffect(() => {
    if (!sessionId) {
      router.push("/dashboard")
      return
    }

    async function loadEscalationData() {
      try {
        const session = await getSession(sessionId!)
        const results = session.reconciliation_results || {}
        
        // Build flagged issues from AI results
        const flaggedIssues: any[] = []

        // 1. Drug interactions -> High severity flags
        if (results.interactions) {
          results.interactions.forEach((inter: any, i: number) => {
            flaggedIssues.push({
              id: `inter-${i}`,
              severity: inter.severity === "major" || inter.severity === "high" || inter.severity === "critical" ? "high" : "medium",
              title: `Drug Interaction: ${inter.drug_a} + ${inter.drug_b}`,
              description: inter.effect || "Potential drug-drug interaction detected.",
              aiConfidence: "high",
              aiReasoning: `Detected via DDInter interaction database. ${inter.recommendation || ""}`,
              nurseConfirmed: "Pending nurse verification during discharge counseling.",
              unresolvedItems: [`Verify ${inter.drug_a} and ${inter.drug_b} combination is intentional`],
              recommendedAction: inter.recommendation || "Pharmacist to verify clinical appropriateness.",
            })
          })
        }

        // 2. Discrepancies -> Medium severity flags
        if (results.discrepancies) {
          results.discrepancies.forEach((d: any, i: number) => {
            flaggedIssues.push({
              id: `disc-${i}`,
              severity: "medium",
              title: `Dose Change: ${d.name}`,
              description: `${d.reason || "Dose discrepancy detected"}. Home: ${d.home_dose} ${d.home_freq} → Discharge: ${d.discharge_dose} ${d.discharge_freq}`,
              aiConfidence: "high",
              aiReasoning: "Dose or frequency change detected between home and discharge lists.",
              nurseConfirmed: "Pending nurse confirmation.",
              unresolvedItems: [`Confirm ${d.name} dose change is intentional`],
              recommendedAction: `Verify the ${d.name} dose change with the prescribing physician.`,
            })
          })
        }

        const homeMeds = session.home_meds || []
        const dischargeMeds = session.discharge_meds || []

        const homeList = homeMeds.map((m: any) => ({
          name: m.drugName || m.name,
          dose: m.strength || m.dose || "",
          frequency: m.frequency || "",
          status: results.stopped_medications?.some((s: any) => (s.name || s.drugName || "").toLowerCase() === (m.drugName || m.name).toLowerCase())
            ? "discontinued" as const
            : results.discrepancies?.some((d: any) => (d.name || "").toLowerCase() === (m.drugName || m.name).toLowerCase())
            ? "modified" as const
            : "unchanged" as const,
        }))

        const dischargeList = dischargeMeds.map((m: any) => ({
          name: m.drugName || m.name,
          dose: m.strength || m.dose || "",
          frequency: m.frequency || "",
          status: results.new_medications?.some((n: any) => (n.name || n.drugName || "").toLowerCase() === (m.drugName || m.name).toLowerCase())
            ? "new" as const
            : results.discrepancies?.some((d: any) => (d.name || "").toLowerCase() === (m.drugName || m.name).toLowerCase())
            ? "modified" as const
            : "unchanged" as const,
        }))

        const now = new Date().toISOString()

        const escalationData = {
          urgency: flaggedIssues.some((f: any) => f.severity === "high") ? "urgent" as const : "routine" as const,
          patient: {
            name: session.patient_name || "Patient",
            id: session.patient_id || "N/A",
            ward: session.ward || "General Medicine",
            bed: session.bed_number || "N/A",
            allergies: session.allergies || [],
            dischargeDate: session.discharge_date || new Date().toISOString().split("T")[0],
          },
          flaggedIssues,
          medicationReconciliation: {
            homeList,
            dischargeList,
          },
          nurseNotes: `Automated AI reconciliation completed. ${flaggedIssues.length} issue(s) flagged for pharmacist review.`,
          timestamps: {
            reconciliationStarted: session.created_at || now,
            reconciliationCompleted: session.updated_at || now,
            escalationGenerated: now,
          },
          nurse: {
            name: "Discharge Nurse",
            id: "RN-0001",
          },
        }

        setData(escalationData)
      } catch (err) {
        console.error("Failed to load escalation data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadEscalationData()
  }, [sessionId, router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading escalation data...</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Session data not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <PharmacistEscalationSummary data={data} />
    </main>
  )
}

export default function PharmacistEscalationPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground p-6 text-center">Loading pharmacist escalation...</p>}>
      <PharmacistEscalationContent />
    </Suspense>
  )
}
