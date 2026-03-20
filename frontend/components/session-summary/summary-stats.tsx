import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pill, CheckCircle2, RefreshCw, XCircle, PlusCircle, AlertTriangle, Clock } from "lucide-react"

interface SummaryStatsProps {
  totalMedications: number
  confirmed: number
  changed: number
  stopped: number
  newMeds: number
  escalated: number
  timeTaken: number
  pharmacistEscalation: boolean
}

export function SummaryStats({
  totalMedications,
  confirmed,
  changed,
  stopped,
  newMeds,
  escalated,
  timeTaken,
  pharmacistEscalation
}: SummaryStatsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Session Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main stat */}
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{totalMedications}</p>
            <p className="text-sm text-muted-foreground">Total Medications Reviewed</p>
          </div>
        </div>

        {/* Medication breakdown */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatBadge icon={CheckCircle2} label="Confirmed" value={confirmed} color="success" />
          <StatBadge icon={RefreshCw} label="Changed" value={changed} color="warning" />
          <StatBadge icon={XCircle} label="Stopped" value={stopped} color="destructive" />
          <StatBadge icon={PlusCircle} label="New" value={newMeds} color="primary" />
          <StatBadge icon={AlertTriangle} label="Escalated" value={escalated} color="warning" />
        </div>

        {/* Time and escalation */}
        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Time taken:</span>
            <span className="font-medium text-foreground">{timeTaken} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Pharmacist escalation:</span>
            <Badge variant={pharmacistEscalation ? "destructive" : "secondary"}>
              {pharmacistEscalation ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatBadgeProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: "success" | "warning" | "destructive" | "primary"
}

function StatBadge({ icon: Icon, label, value, color }: StatBadgeProps) {
  const colorClasses = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    primary: "bg-primary/10 text-primary"
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 text-center">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colorClasses[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xl font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
