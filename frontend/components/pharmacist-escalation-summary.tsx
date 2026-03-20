"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertTriangle,
  Send,
  Edit3,
  X,
  Clock,
  User,
  MapPin,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Pill,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FlaggedIssue {
  id: string
  severity: "high" | "medium" | "low"
  title: string
  description: string
  aiConfidence: "high" | "medium" | "low"
  aiReasoning: string
  nurseConfirmed: string
  unresolvedItems: string[]
  recommendedAction: string
}

interface Medication {
  name: string
  dose: string
  frequency: string
  status: "new" | "discontinued" | "modified" | "unchanged" | "unresolved"
}

interface EscalationData {
  urgency: "routine" | "urgent"
  patient: {
    name: string
    id: string
    ward: string
    bed: string
    allergies: string[]
    dischargeDate: string
  }
  flaggedIssues: FlaggedIssue[]
  medicationReconciliation: {
    homeList: Medication[]
    dischargeList: Medication[]
  }
  nurseNotes: string
  timestamps: {
    reconciliationStarted: string
    reconciliationCompleted: string
    escalationGenerated: string
  }
  nurse: {
    name: string
    id: string
  }
}

function formatDateTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  const config = {
    high: { label: "High Risk", className: "bg-destructive text-destructive-foreground" },
    medium: { label: "Medium Risk", className: "bg-[oklch(0.75_0.15_85)] text-[oklch(0.25_0.08_70)]" },
    low: { label: "Low Risk", className: "bg-muted text-muted-foreground" },
  }
  return <Badge className={cn("font-medium", config[severity].className)}>{config[severity].label}</Badge>
}

function ConfidenceBadge({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const config = {
    high: { label: "High Confidence", icon: CheckCircle2, className: "text-[oklch(0.5_0.15_145)]" },
    medium: { label: "Medium Confidence", icon: AlertCircle, className: "text-[oklch(0.6_0.15_85)]" },
    low: { label: "Low Confidence", icon: HelpCircle, className: "text-muted-foreground" },
  }
  const Icon = config[confidence].icon
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", config[confidence].className)}>
      <Icon className="h-4 w-4" />
      {config[confidence].label}
    </span>
  )
}

function MedicationStatusBadge({ status }: { status: Medication["status"] }) {
  const config = {
    new: { label: "New", className: "bg-[oklch(0.9_0.1_145)] text-[oklch(0.35_0.15_145)]" },
    discontinued: { label: "D/C", className: "bg-destructive/10 text-destructive" },
    modified: { label: "Modified", className: "bg-[oklch(0.92_0.08_85)] text-[oklch(0.4_0.12_70)]" },
    unchanged: { label: "Unchanged", className: "bg-muted text-muted-foreground" },
    unresolved: { label: "Unresolved", className: "bg-destructive/10 text-destructive border border-destructive/20" },
  }
  return <Badge variant="outline" className={cn("text-xs font-medium", config[status].className)}>{config[status].label}</Badge>
}

function FlaggedIssueCard({ issue }: { issue: FlaggedIssue }) {
  const borderColor = {
    high: "border-l-destructive",
    medium: "border-l-[oklch(0.75_0.15_85)]",
    low: "border-l-muted-foreground",
  }

  return (
    <Card className={cn("border-l-4 shadow-sm", borderColor[issue.severity])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <SeverityBadge severity={issue.severity} />
              <h3 className="font-semibold text-foreground">{issue.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{issue.description}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  AI Analysis
                </span>
                <ConfidenceBadge confidence={issue.aiConfidence} />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{issue.aiReasoning}</p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1.5">
                Nurse Confirmation
              </span>
              <p className="text-sm text-foreground/80 leading-relaxed">{issue.nurseConfirmed}</p>
            </div>
          </div>

          <div className="space-y-3">
            {issue.unresolvedItems.length > 0 && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1.5">
                  Unresolved Items
                </span>
                <ul className="space-y-1">
                  {issue.unresolvedItems.map((item, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-primary/5 border border-primary/10 rounded-md p-3">
              <span className="text-xs font-medium uppercase tracking-wide text-primary block mb-1.5">
                Recommended Action
              </span>
              <p className="text-sm text-foreground font-medium leading-relaxed">
                {issue.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PharmacistEscalationSummary({ data }: { data: EscalationData }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Document Header */}
      <header className="bg-card border rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Pharmacist Review Required</h1>
              <p className="text-sm text-muted-foreground">Medication Reconciliation Escalation</p>
            </div>
          </div>
          <Badge
            className={cn(
              "text-sm font-semibold px-3 py-1.5 self-start sm:self-auto",
              data.urgency === "urgent"
                ? "bg-destructive text-destructive-foreground"
                : "bg-[oklch(0.75_0.15_85)] text-[oklch(0.25_0.08_70)]"
            )}
          >
            {data.urgency === "urgent" ? "Urgent Review" : "Routine Review"}
          </Badge>
        </div>

        <Separator className="my-4" />

        {/* Timestamps */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Reconciliation started: {formatDateTime(data.timestamps.reconciliationStarted)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Escalation generated: {formatDateTime(data.timestamps.escalationGenerated)}
          </span>
        </div>
      </header>

      {/* Patient Summary */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">
                Patient Name
              </span>
              <p className="font-semibold text-foreground">{data.patient.name}</p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">
                MRN
              </span>
              <p className="font-mono text-sm text-foreground">{data.patient.id}</p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">
                Location
              </span>
              <p className="text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {data.patient.ward} / {data.patient.bed}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">
                Discharge Date
              </span>
              <p className="text-foreground">{formatDate(data.patient.dischargeDate)}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-2">
              Documented Allergies
            </span>
            <div className="flex flex-wrap gap-2">
              {data.patient.allergies.map((allergy, i) => (
                <Badge key={i} variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 font-medium">
                  <AlertTriangle className="h-3 w-3 mr-1.5" />
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Issues */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">
            Flagged Issues ({data.flaggedIssues.length})
          </h2>
        </div>
        <div className="space-y-4">
          {data.flaggedIssues.map((issue) => (
            <FlaggedIssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      {/* Medication Reconciliation Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" />
            Medication Reconciliation Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Home Medications */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Home Medication List
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Medication</TableHead>
                      <TableHead className="font-semibold">Dose</TableHead>
                      <TableHead className="font-semibold">Freq</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.medicationReconciliation.homeList.map((med, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{med.name}</TableCell>
                        <TableCell className="text-muted-foreground">{med.dose}</TableCell>
                        <TableCell className="text-muted-foreground">{med.frequency}</TableCell>
                        <TableCell>
                          <MedicationStatusBadge status={med.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Discharge Medications */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Discharge Medication List
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Medication</TableHead>
                      <TableHead className="font-semibold">Dose</TableHead>
                      <TableHead className="font-semibold">Freq</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.medicationReconciliation.dischargeList.map((med, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{med.name}</TableCell>
                        <TableCell className="text-muted-foreground">{med.dose}</TableCell>
                        <TableCell className="text-muted-foreground">{med.frequency}</TableCell>
                        <TableCell>
                          <MedicationStatusBadge status={med.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t">
            <span className="text-xs font-medium text-muted-foreground mr-3">Legend:</span>
            <div className="inline-flex flex-wrap gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[oklch(0.5_0.15_145)]" />
                New
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[oklch(0.6_0.15_85)]" />
                Modified
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                Unchanged
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                Unresolved
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nurse Notes */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              Nurse Notes
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {data.nurse.name} ({data.nurse.id})
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-muted/30 border rounded-md p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {data.nurseNotes}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <footer className="bg-card border rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            variant="outline"
            className="sm:order-1"
            onClick={() => console.log("Skip escalation")}
          >
            <X className="h-4 w-4 mr-2" />
            Skip Escalation
          </Button>
          <Button
            variant="secondary"
            className="sm:order-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Before Sending
          </Button>
          <Button
            className="sm:order-3 bg-primary hover:bg-primary/90"
            onClick={() => console.log("Send to pharmacist")}
          >
            <Send className="h-4 w-4 mr-2" />
            Send to Pharmacist
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
