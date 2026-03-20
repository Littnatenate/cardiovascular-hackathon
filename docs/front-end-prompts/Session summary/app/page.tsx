"use client"

import { SessionHeader } from "@/components/session-summary/session-header"
import { SummaryStats } from "@/components/session-summary/summary-stats"
import { AuditTimeline, type AuditEvent } from "@/components/session-summary/audit-timeline"
import { QuickActions } from "@/components/session-summary/quick-actions"

// Mock data for demonstration
const mockSessionData = {
  patientName: "Eleanor Vance",
  dateTime: "March 20, 2026 at 2:45 PM",
  stats: {
    totalMedications: 7,
    confirmed: 4,
    changed: 1,
    stopped: 1,
    newMeds: 1,
    escalated: 0,
    timeTaken: 12,
    pharmacistEscalation: false
  }
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: "1",
    type: "session_created",
    description: "Session created",
    timestamp: "2:33 PM"
  },
  {
    id: "2",
    type: "discharge_meds_entered",
    description: "Discharge medications entered",
    timestamp: "2:34 PM",
    details: "4 medications added from discharge summary"
  },
  {
    id: "3",
    type: "home_meds_entered",
    description: "Home medications entered",
    timestamp: "2:36 PM",
    details: "3 medications added manually"
  },
  {
    id: "4",
    type: "photo_captured",
    description: "Photo captured: Lipitor bottle",
    timestamp: "2:37 PM",
    details: "Extracted successfully — Atorvastatin 20mg"
  },
  {
    id: "5",
    type: "ai_comparison",
    description: "AI comparison run",
    timestamp: "2:38 PM",
    details: "2 discrepancies identified for review"
  },
  {
    id: "6",
    type: "nurse_confirmed",
    description: "Nurse confirmed: Atorvastatin dose change",
    timestamp: "2:40 PM",
    details: "Changed from 20mg to 40mg per discharge orders"
  },
  {
    id: "7",
    type: "nurse_stopped",
    description: "Nurse confirmed: Omeprazole stopped",
    timestamp: "2:41 PM",
    details: "Discontinued per physician recommendation"
  },
  {
    id: "8",
    type: "instructions_generated",
    description: "Patient instructions generated",
    timestamp: "2:44 PM"
  },
  {
    id: "9",
    type: "session_completed",
    description: "Session completed",
    timestamp: "2:45 PM"
  }
]

export default function SessionSummaryPage() {
  const handleBackToDashboard = () => {
    // Navigate back to dashboard
    console.log("Navigating to dashboard...")
  }

  const handleViewInstructions = () => {
    console.log("Opening patient instructions...")
  }

  const handleViewEscalation = () => {
    console.log("Opening escalation summary...")
  }

  const handleEditSession = () => {
    console.log("Editing session...")
  }

  const handleExportPdf = () => {
    console.log("Exporting as PDF...")
  }

  return (
    <div className="min-h-screen bg-background">
      <SessionHeader
        patientName={mockSessionData.patientName}
        dateTime={mockSessionData.dateTime}
        onBackToDashboard={handleBackToDashboard}
      />
      
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="space-y-6">
          <SummaryStats {...mockSessionData.stats} />
          
          <AuditTimeline events={mockAuditEvents} />
          
          <QuickActions
            onViewInstructions={handleViewInstructions}
            onViewEscalation={handleViewEscalation}
            onEditSession={handleEditSession}
            onExportPdf={handleExportPdf}
            hasEscalation={mockSessionData.stats.pharmacistEscalation}
          />
        </div>
      </main>
    </div>
  )
}
