"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, CalendarDays, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { dischargeSessions } from "@/lib/mock-data"
import { SessionTopBar } from "@/components/session-top-bar"

const WARD_OPTIONS = [
  "Ward 5A – General Medicine",
  "Ward 5B – General Surgery",
  "Ward 6A – Cardiology",
  "Ward 6B – Orthopaedics",
  "Ward 7A – Neurology",
  "Ward 7B – Oncology",
  "Ward 8A – Respiratory",
  "Ward 8B – Geriatrics",
  "ICU",
  "HDU",
  "Day Surgery",
]

interface FormErrors {
  patientName?: string
  patientId?: string
}

export function NewSessionForm() {
  const router = useRouter()
  const patientNameRef = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split("T")[0]

  const [patientName, setPatientName] = useState("")
  const [patientId, setPatientId] = useState("")
  const [ward, setWard] = useState("")
  const [bedNumber, setBedNumber] = useState("")
  const [allergies, setAllergies] = useState("")
  const [noneKnown, setNoneKnown] = useState(false)
  const [dischargeDate, setDischargeDate] = useState(today)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Auto-focus on the patient name field when the form loads, prefill if session exists
  useEffect(() => {
    patientNameRef.current?.focus()
    const raw = sessionStorage.getItem('dischargeSession')
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data.patientName) setPatientName(data.patientName)
        if (data.mrn && data.mrn !== 'N/A') setPatientId(data.mrn)
        if (data.ward) setWard(data.ward)
        if (data.bedNumber) setBedNumber(data.bedNumber)
        if (data.allergies && Array.isArray(data.allergies)) {
           setAllergies(data.allergies.join(", "))
           setNoneKnown(data.allergies.length === 0)
        }
        setIsEditing(true)
      } catch (e) {}
    }
  }, [])

  // When "None known" is checked, clear and disable allergy text
  const handleNoneKnown = (checked: boolean) => {
    setNoneKnown(checked)
    if (checked) setAllergies("")
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!patientName.trim()) {
      newErrors.patientName = "Patient name is required"
    }

    const nricValue = patientId.trim()
    if (!nricValue) {
      newErrors.patientId = "Patient ID / NRIC is required"
    } else if (!/^[STFGM]\d{7}[A-Z]$/i.test(nricValue)) {
      newErrors.patientId = "Please enter a valid NRIC (e.g. S1234567A)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    // Simulate session creation — replace with real API call
    await new Promise((r) => setTimeout(r, 400))

    // Store session data for use in subsequent screens
    let existingSessionId = `SESSION-${Date.now()}`
    let existingCreatedAt = new Date().toISOString()
    
    if (isEditing) {
       try {
         const existing = JSON.parse(sessionStorage.getItem('dischargeSession') || '{}')
         if (existing.id) existingSessionId = existing.id
         if (existing.createdAt) existingCreatedAt = existing.createdAt
       } catch (e) {}
    }
    
    const sessionDetail = {
      id: existingSessionId,
      patientName: patientName.trim(),
      mrn: patientId.trim(),
      ward,
      bedNumber,
      allergies: noneKnown ? [] : allergies.split(",").map((a) => a.trim()).filter(Boolean),
      dischargeDate,
      createdAt: existingCreatedAt,
    }

    // Clear previous session data for a clean start (if not demo and not editing)
    if (!isDemo && !isEditing) {
      localStorage.removeItem("medrecon_home_list")
    // We no longer use these static keys
    // localStorage.removeItem(\"medrecon_discharge_list\")
    // localStorage.removeItem(\"recon_results\")
    }

    sessionStorage.setItem("dischargeSession", JSON.stringify(sessionDetail))

    if (!isEditing) {
      // Save to dashboard list (friend's feature)
      const newDashboardSession = {
        id: sessionDetail.id,
        patientName: sessionDetail.patientName,
        status: 'in-progress',
        updatedAt: new Date(),
        createdAt: new Date(),
        mrn: sessionDetail.mrn
      }

      const saved = localStorage.getItem('medsafe_sessions')
      const currentSessions = saved ? JSON.parse(saved) : dischargeSessions
      currentSessions.unshift(newDashboardSession)
      localStorage.setItem('medsafe_sessions', JSON.stringify(currentSessions))
    } else {
      // Update existing session in dashboard list
      const saved = localStorage.getItem('medsafe_sessions')
      if (saved) {
        const currentSessions = JSON.parse(saved)
        const updatedSessions = currentSessions.map((s: any) => 
          s.id === sessionDetail.id 
            ? { ...s, patientName: sessionDetail.patientName, mrn: sessionDetail.mrn, updatedAt: new Date() }
            : s
        )
        localStorage.setItem('medsafe_sessions', JSON.stringify(updatedSessions))
      }
    }

    // Navigate to the next step (Home Medication entry)
    router.push('/home-meds')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SessionTopBar 
        patientName={patientName || "New Patient"}
        patientId={patientId || "Pending ID"}
        step={1}
      />

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-xl">
          {/* Page heading */}
          <div className="mb-8 p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
            <h2 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
              <Sparkles className="size-4" />
              Quick-Load Demo Scenarios
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-background hover:bg-primary/10 border-primary/20 text-primary font-bold"
                onClick={() => {
                  setPatientName("Margaret Thompson")
                  setPatientId("S1234567A")
                  setWard("Ward 6A – Cardiology")
                  setBedNumber("Bed 12B")
                  setAllergies("Penicillin, NSAIDs")
                  setNoneKnown(false)
                  setIsDemo(true)

                  // Pre-populate Stress Test Medications (8 Home, 5 Discharge)
                  const homeMeds = [
                    { id: "h1", drugName: "Aspirin", strength: "100mg", dose: "1 tab", frequency: "once daily", source: "admission" },
                    { id: "h2", drugName: "Atorvastatin", strength: "40mg", dose: "1 tab", frequency: "once daily", source: "admission" },
                    { id: "h3", drugName: "Lisinopril", strength: "10mg", dose: "1 tab", frequency: "once daily", source: "admission" },
                    { id: "h4", drugName: "Metformin", strength: "500mg", dose: "1 tab", frequency: "twice daily", source: "admission" },
                    { id: "h5", drugName: "Bisoprolol", strength: "2.5mg", dose: "1 tab", frequency: "once daily", source: "admission" },
                    { id: "h6", drugName: "Pantoprazole", strength: "40mg", dose: "1 tab", frequency: "once daily", source: "admission" },
                    { id: "h7", drugName: "Multivitamins", strength: "1 tab", dose: "1 tab", frequency: "once daily", source: "admission" },
                    { id: "h8", drugName: "Glucosamine", strength: "500mg", dose: "1 tab", frequency: "twice daily", source: "admission" }
                  ];
                  const dischargeMeds = [
                    { id: "d1", drugName: "Aspirin", strength: "100mg", dose: "1 tab", frequency: "once daily", source: "manual" },
                    { id: "d2", drugName: "Atorvastatin", strength: "80mg", dose: "1 tab", frequency: "once daily", source: "manual" },
                    { id: "d3", drugName: "Lisinopril", strength: "10mg", dose: "1 tab", frequency: "once daily", source: "manual" },
                    { id: "d4", drugName: "Clopidogrel", strength: "75mg", dose: "1 tab", frequency: "once daily", source: "manual" },
                    { id: "d5", drugName: "Metformin", strength: "500mg", dose: "1 tab", frequency: "twice daily", source: "manual" }
                  ];
                  
                  localStorage.setItem("medrecon_home_list", JSON.stringify(homeMeds));
                  localStorage.setItem("medrecon_discharge_list", JSON.stringify(dischargeMeds));
                }}
              >
                Load Case: Margaret Thompson (Cardiology)
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Patient Name */}
            <FieldBlock
              label="Patient Name"
              required
              error={errors.patientName}
              htmlFor="patient-name"
            >
              <input
                ref={patientNameRef}
                id="patient-name"
                type="text"
                placeholder="e.g. Tan Wei Ming"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value)
                  if (errors.patientName) setErrors((p) => ({ ...p, patientName: undefined }))
                }}
                autoComplete="off"
                className={fieldClass(!!errors.patientName)}
                aria-required="true"
                aria-describedby={errors.patientName ? "patient-name-error" : undefined}
              />
              {errors.patientName && (
                <FieldError id="patient-name-error" message={errors.patientName} />
              )}
            </FieldBlock>

            {/* Patient ID */}
            <FieldBlock
              label="Patient ID / NRIC"
              required
              error={errors.patientId}
              htmlFor="patient-id"
            >
              <input
                id="patient-id"
                type="text"
                placeholder="e.g. S1234567A"
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value.toUpperCase())
                  if (errors.patientId) setErrors((p) => ({ ...p, patientId: undefined }))
                }}
                autoComplete="off"
                className={fieldClass(!!errors.patientId)}
                aria-required="true"
                aria-describedby={errors.patientId ? "patient-id-error" : undefined}
              />
              {errors.patientId && (
                <FieldError id="patient-id-error" message={errors.patientId} />
              )}
            </FieldBlock>

            {/* Ward + Bed row */}
            <div className="flex gap-3">
              <FieldBlock label="Ward" htmlFor="ward" className="flex-[3]">
                <select
                  id="ward"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className={fieldClass(false) + " bg-card cursor-pointer"}
                >
                  <option value="">Select ward…</option>
                  {WARD_OPTIONS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </FieldBlock>

              <FieldBlock label="Bed Number" htmlFor="bed-number" className="flex-[1]">
                <input
                  id="bed-number"
                  type="text"
                  placeholder="e.g. 12B"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className={fieldClass(false)}
                  autoComplete="off"
                />
              </FieldBlock>
            </div>

            {/* Known Drug Allergies */}
            <FieldBlock
              label="Known Drug Allergies"
              htmlFor="allergies"
              hint="Separate multiple allergies with commas"
            >
              <input
                id="allergies"
                type="text"
                placeholder="e.g. Penicillin, Aspirin, Sulfonamides"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                disabled={noneKnown}
                className={
                  fieldClass(false) +
                  (noneKnown ? " opacity-40 cursor-not-allowed bg-muted" : "")
                }
                aria-disabled={noneKnown}
              />
              {/* None known checkbox */}
              <label className="mt-2.5 flex items-center gap-2.5 cursor-pointer w-fit">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    noneKnown
                      ? "bg-primary border-primary"
                      : "border-border bg-card"
                  }`}
                  role="checkbox"
                  aria-checked={noneKnown}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault()
                      handleNoneKnown(!noneKnown)
                    }
                  }}
                >
                  {noneKnown && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={noneKnown}
                  onChange={(e) => handleNoneKnown(e.target.checked)}
                  className="sr-only"
                  aria-label="No known drug allergies"
                />
                <span className="text-sm text-muted-foreground select-none">
                  None known
                </span>
              </label>
            </FieldBlock>

            {/* Date of Discharge */}
            <FieldBlock label="Date of Discharge" htmlFor="discharge-date">
              <div className="relative">
                <input
                  id="discharge-date"
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className={fieldClass(false) + " pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"}
                />
                <CalendarDays
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Auto-filled to today — edit if discharging on a future date.
              </p>
            </FieldBlock>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label="Start discharge counseling session"
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    Starting session…
                  </>
                ) : (
                  <>
                    {isEditing ? "Save & Continue" : "Start Session"}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <div className="flex justify-center">
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  aria-label="Cancel and return to home"
                >
                  Cancel
                </a>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

/* ── Sub-components ───────────────────────────────────────── */

function FieldBlock({
  label,
  htmlFor,
  required,
  error,
  hint,
  className = "",
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs text-destructive mt-1" role="alert">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

function fieldClass(hasError: boolean) {
  return [
    "w-full h-13 px-4 rounded-xl border text-base text-foreground",
    "bg-card placeholder:text-muted-foreground",
    "transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
    hasError
      ? "border-destructive focus:ring-destructive/40"
      : "border-border hover:border-muted-foreground/50",
  ].join(" ")
}
