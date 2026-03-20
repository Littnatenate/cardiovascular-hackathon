"use client"

import { useState, useEffect } from "react"
import { 
  CheckCircle2, 
  Printer, 
  ChevronRight, 
  AlertCircle,
  Stethoscope,
  Check
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SessionLayout } from "@/components/session-layout"
import { SessionTopBar } from "@/components/session-top-bar"
import { Button } from "@/components/ui/button"
import { MedicationCard, type Medication } from "@/components/medication-card"
import { generateEducation } from "@/lib/api"

export default function PatientInstructions() {
  const router = useRouter()
  const [aiInstructions, setAiInstructions] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [patientName, setPatientName] = useState("Margaret Thompson")
  const [patientId, setPatientId] = useState("MRN-002847")

  useEffect(() => {
    async function loadData() {
      try {
        const savedSession = sessionStorage.getItem('dischargeSession')
        if (savedSession) {
          const data = JSON.parse(savedSession)
          setPatientName(data.patientName || "Margaret Thompson")
          setPatientId(data.id || "MRN-002847")
        }

        const rawResults = localStorage.getItem('recon_results')
        const rawPatient = localStorage.getItem('recon_patient')
        
        const results = rawResults ? JSON.parse(rawResults) : {}
        const patient = rawPatient ? JSON.parse(rawPatient) : {}
        
        if (!results || Object.keys(results).length === 0) {
          setAiInstructions("No reconciliation data found. Please run the AI Comparison first.")
          setIsLoading(false)
          return
        }
        
        console.log("[FE] Requesting AI Education...", { results, patient })
        const educationText = await generateEducation(results, patient)
        setAiInstructions(educationText)
      } catch (error) {
        console.error("Error loading education:", error)
        setAiInstructions("Failed to load instructions. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleDone = () => {
    // Mark the session as completed in local storage for the dashboard
    const savedSession = sessionStorage.getItem('dischargeSession');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        const sessions = JSON.parse(localStorage.getItem('discharge_sessions') || '[]');
        
        // Check if there was an escalation or alert in the comparative results
        const rawResults = localStorage.getItem('recon_results');
        const results = rawResults ? JSON.parse(rawResults) : {};
        const hasEscalation = Object.values(results).some((r: any) => r.status === 'discrepancy' || r.status === 'alert');

        const updatedSessions = sessions.map((s: any) => {
          if (s.id === sessionData.id) {
            return { ...s, status: hasEscalation ? 'escalated' : 'completed' };
          }
          return s;
        });
        localStorage.setItem('discharge_sessions', JSON.stringify(updatedSessions));
      } catch (e) {
        console.error("Failed to update session status", e);
      }
    }
    router.push('/session-summary')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-3 text-muted-foreground">Loading instructions...</p>
      </div>
    )
  }

  return (
    <SessionLayout>
      <SessionTopBar 
        patientName={patientName} 
        sessionId={patientId} 
        step={6} 
      />
      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 print:px-8 print:py-4">
        <div className="bg-card rounded-2xl border border-border p-6 md:p-10 shadow-sm print:shadow-none print:border-none">
          <header className="mb-8 border-b border-border pb-8 print:mb-6">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-primary/10 p-3 rounded-full">
                 <Stethoscope className="w-8 h-8 text-primary" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-foreground">Discharge Instructions</h1>
                 <p className="text-muted-foreground">{patientName} • {patientId}</p>
               </div>
            </div>
          </header>

          <div className="prose prose-blue max-w-none dark:prose-invert">
            {aiInstructions ? (
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(aiInstructions) }} />
            ) : (
              <p>No instructions available.</p>
            )}
          </div>

          <section className="mt-12 p-6 border-t border-border print:hidden">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Finalize Session
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Please review these instructions with the patient. Once completed, acknowledge the session.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" /> Print Instructions
              </Button>
              <Button onClick={handleDone} className="gap-2">
                <Check className="w-4 h-4" /> Done & Finalize
              </Button>
            </div>
          </section>
        </div>
      </main>
    </SessionLayout>
  )
}

function formatMarkdown(text: string) {
  // Simple markdown-to-html converter for the demo
  return text
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
    .replace(/\n/gim, '<br />');
}
