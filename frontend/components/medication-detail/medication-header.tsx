import { Badge } from "@/components/ui/badge"
import { Pill, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

type MedicationStatus = "needs_review" | "confirmed" | "discrepancy" | "stopped"

interface MedicationHeaderProps {
  drugName: string
  status: MedicationStatus
}

const statusConfig = {
  needs_review: {
    label: "Needs Review",
    variant: "outline" as const,
    className: "border-warning bg-warning/10 text-warning-foreground",
    icon: AlertCircle,
  },
  confirmed: {
    label: "Confirmed",
    variant: "outline" as const,
    className: "border-success bg-success/10 text-success",
    icon: CheckCircle2,
  },
  discrepancy: {
    label: "Discrepancy",
    variant: "destructive" as const,
    className: "",
    icon: XCircle,
  },
  stopped: {
    label: "Stopped",
    variant: "secondary" as const,
    className: "",
    icon: XCircle,
  },
}

export function MedicationHeader({ drugName, status }: MedicationHeaderProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
          <Pill className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {drugName}
        </h1>
      </div>
      <Badge
        variant={config.variant}
        className={`${config.className} flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium`}
      >
        <StatusIcon className="size-4" />
        {config.label}
      </Badge>
    </header>
  )
}
