"use client"

import { useState, useEffect, Suspense } from "react"
import { 
  CheckCircle2, 
  Printer, 
  ChevronRight, 
  AlertCircle,
  Stethoscope,
  Check,
  FileText,
  Heart,
  ChevronLeft,
  Sparkles,
  Loader2,
  ShieldCheck,
  MessageCircle,
  Copy
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { SessionLayout } from "@/components/session-layout"
import { SessionTopBar } from "@/components/session-top-bar"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { generateEducation, generateWhatsappSummary, exportPdf, getSession, updateSession } from '@/lib/api'

const importantReminders = [
  "Don't stop any medication without asking your doctor first.",
  "Keep all your medications in a cool, dry place away from direct sunlight.",
  "Bring this sheet to your next doctor's appointment.",
  "If you feel unwell or have any concerns, contact your doctor or visit the clinic.",
]

function PatientInstructionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // -- State variables (Combination of Phase 1 and Phase 8) --
  const [aiInstructions, setAiInstructions] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [patientName, setPatientName] = useState("Loading...")
  const [patientId, setPatientId] = useState("Loading...")
  
  // Phase 8 Multilingual/WhatsApp state
  const [targetLang, setTargetLang] = useState("English")
  const [caregiverLang, setCaregiverLang] = useState("None")
  const [whatsappSummary, setWhatsappSummary] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const sessionId = searchParams.get("session_id") || (() => {
    try {
      const raw = sessionStorage.getItem("dischargeSession");
      return raw ? JSON.parse(raw).id : null;
    } catch (e) { return null; }
  })();

  // 1. Initial Load: Get session data
  useEffect(() => {
    if (!sessionId) {
      router.push("/dashboard");
      return;
    }

    async function loadSession() {
      try {
        const session = await getSession(sessionId);
        setPatientName(session.patient_name || "Unknown Patient")
        setPatientId(session.patient_id || "N/A")
        
        if (session.patient_education) {
          setAiInstructions(session.patient_education);
        }
        if (session.whatsapp_summary) {
          setWhatsappSummary(session.whatsapp_summary);
        }
      } catch (error) {
        console.error("Error loading session:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSession()
  }, [sessionId, router])

  // 2. Action Handlers
  const handlePrint = () => { window.print() }

  const handleDone = async () => {
    try {
      const session = await getSession(sessionId!);
      const results = session.reconciliation_results || {};
      
      // Determine escalation status
      const hasEscalation = (results.interactions && results.interactions.length > 0) || 
                            (results.discrepancies && results.discrepancies.length > 0);
      
      // Update session status in backend DB
      const updatedStatus = hasEscalation ? 'escalated' : 'completed';
      await updateSession(sessionId!, { status: updatedStatus });
      
      // Navigate to summary screen
      router.push(`/session-summary?session_id=${sessionId}`);
    } catch (e) {
      console.error("Failed to finalize session status", e);
      router.push(`/session-summary?session_id=${sessionId}`);
    }
  }

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true)
    try {
      const educationText = await generateEducation(sessionId!, targetLang, caregiverLang)
      setAiInstructions(educationText || "The AI did not return any instructions. Please try again.")

      // Fetch the updated session details to retrieve the WhatsApp summary (which was generated and saved in DB by the backend)
      try {
        const session = await getSession(sessionId!);
        if (session.whatsapp_summary) {
          setWhatsappSummary(session.whatsapp_summary);
        }
      } catch (e) {
        console.error("Failed to load generated whatsapp summary:", e);
      }
    } catch (error) {
      console.error("Failed to generate AI instructions:", error)
      setAiInstructions("Could not reach AI Nurse. Please try again.")
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const handleCopyWhatsapp = () => {
    navigator.clipboard.writeText(whatsappSummary)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleExportPdf = async () => {
    if (!aiInstructions) {
      alert("Please generate the AI summary first before exporting to PDF.")
      return
    }
    setIsExportingPdf(true)
    try {
      const pdfBlob = await exportPdf(aiInstructions, patientName)
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `MedSafe_Discharge_${patientName.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsExportingPdf(false)
    }
  }

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric"
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-3 text-muted-foreground">Initializing...</p>
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
      
      <main className="mx-auto max-w-4xl px-4 py-8 print:px-8 print:py-4">
        <div className="bg-card rounded-2xl border border-border p-6 md:p-10 shadow-sm print:shadow-none print:border-none">
          
          {/* Header */}
          <header className="mb-8 border-b border-border pb-8 print:mb-6">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-primary/10 p-3 rounded-full">
                 <Stethoscope className="w-8 h-8 text-primary" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-foreground">Discharge Medication Guide</h1>
                 <p className="text-muted-foreground">{patientName} • {patientId}</p>
               </div>
            </div>
          </header>

          {/* AI Generation Control or Instructions View */}
          <section className="mb-10 print:mb-8" aria-label="AI Summary">
            {!aiInstructions ? (
              <div className="rounded-xl border-2 border-primary/20 bg-card p-6 text-center shadow-sm print:hidden">
                <Heart className="size-8 text-primary/50 mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-2">Generate Patient-Friendly Guide</h2>
                <p className="text-muted-foreground mb-6">Our Local AI will translate the clinical results into clear instructions for the patient and family.</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                  <div className="flex flex-col text-left">
                    <label className="text-sm font-semibold mb-1 text-foreground">Instruction Language</label>
                    <select 
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="flex h-10 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="English">English</option>
                      <option value="Mandarin">Mandarin (中文)</option>
                      <option value="Malay">Malay (Bahasa Melayu)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-sm font-semibold mb-1 text-foreground">Caregiver/FDW Summary</label>
                    <select 
                      value={caregiverLang}
                      onChange={(e) => setCaregiverLang(e.target.value)}
                      className="flex h-10 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="None">None (English Only)</option>
                      <option value="Tagalog">Tagalog (Filipino FDW)</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia (FDW)</option>
                    </select>
                  </div>
                </div>

                <Button onClick={handleGenerateAi} disabled={isGeneratingAi} size="lg" className="gap-2">
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      AI Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-5" />
                      Generate Bilingual Guide
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Main Instruction Card */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 shadow-sm text-left prose prose-primary dark:prose-invert max-w-none relative">
                  <div className="md:absolute md:top-4 md:right-4 mb-4 md:mb-0 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 print:border print:border-green-200">
                    <ShieldCheck className="size-4" />
                    MedSafe Clinical Verification
                  </div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiInstructions}</ReactMarkdown>
                </div>

                {/* WhatsApp Family Summary - Hidden in print */}
                {whatsappSummary && (
                  <div className="rounded-xl border border-green-500/30 bg-green-50/50 p-6 shadow-sm print:hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-green-700 font-bold">
                        <MessageCircle className="size-5" />
                        <h3>WhatsApp Family Share</h3>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 bg-white hover:bg-green-100 text-green-700 border-green-200"
                        onClick={handleCopyWhatsapp}
                      >
                        {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        {isCopied ? "Copied!" : "Copy Text"}
                      </Button>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-100 whitespace-pre-wrap font-sans text-sm text-gray-800 shadow-inner">
                      {whatsappSummary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Important Reminders */}
          <section
            className="rounded-xl border border-border bg-muted/30 p-6 mb-8 print:break-inside-avoid print:bg-white print:border-gray-300"
            aria-label="Important reminders"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="size-6 text-primary shrink-0 mt-0.5 print:text-gray-700" />
              <h2 className="text-xl font-bold text-foreground">
                Final Review Checklist
              </h2>
            </div>
            <ul className="space-y-3 ml-9">
              {importantReminders.map((reminder, index) => (
                <li
                  key={index}
                  className="text-foreground leading-relaxed flex items-start gap-2"
                >
                  <span className="text-primary font-bold print:text-gray-700">•</span>
                  <span>{reminder}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Action Footer */}
          <footer className="mt-12 pt-8 border-t border-border print:hidden">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={handlePrint}
                className="gap-2 text-base px-6 h-12"
              >
                <Printer className="size-5" />
                Print Guide
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="gap-2 text-base px-6 h-12"
              >
                {isExportingPdf ? (
                   <>
                     <Loader2 className="size-5 animate-spin" />
                     Saving...
                   </>
                ) : (
                   <>
                     <FileText className="size-5" />
                     Save PDF
                   </>
                )}
              </Button>
              <Button
                size="lg"
                onClick={handleDone}
                className="gap-2 text-base px-8 h-12 shadow-lg"
              >
                <CheckCircle2 className="size-5" />
                Finalize & Close
              </Button>
            </div>
          </footer>

          {/* Print Only Footer */}
          <div className="hidden print:block mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Generated on {today} • MedSafe AI Platform • Pharmacist Review Required</p>
          </div>
        </div>
      </main>
    </SessionLayout>
  )
}

export default function PatientInstructions() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading patient instructions...</div>}>
      <PatientInstructionsContent />
    </Suspense>
  )
}
