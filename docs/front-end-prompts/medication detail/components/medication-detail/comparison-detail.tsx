import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Home, Building2 } from "lucide-react"

interface MedEntry {
  name: string
  strength: string
  dose: string
  frequency: string
  source?: string
}

interface Change {
  field: string
  type: "brand-to-generic" | "dose-change" | "frequency-change" | "new" | "stopped"
}

interface ComparisonDetailProps {
  homeMed: MedEntry
  dischargeMed: MedEntry
  changes: Change[]
}

function MedEntryCard({
  entry,
  type,
  changes,
}: {
  entry: MedEntry
  type: "home" | "discharge"
  changes: Change[]
}) {
  const isHome = type === "home"
  const Icon = isHome ? Home : Building2

  const getHighlightClass = (field: string) => {
    const change = changes.find((c) => c.field === field)
    if (!change) return ""

    switch (change.type) {
      case "dose-change":
        return "bg-warning/20 text-foreground rounded px-1.5 py-0.5"
      case "brand-to-generic":
        return "bg-info/20 text-foreground rounded px-1.5 py-0.5"
      case "new":
        return "bg-success/20 text-foreground rounded px-1.5 py-0.5"
      case "stopped":
        return "bg-destructive/20 text-foreground rounded px-1.5 py-0.5"
      default:
        return ""
    }
  }

  return (
    <div className="flex-1 rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {isHome ? "Home Medication" : "Discharge Medication"}
      </div>
      <div className="flex flex-col gap-2.5">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Name
          </span>
          <p className={`mt-0.5 text-base font-semibold ${getHighlightClass("name")}`}>
            {entry.name}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Strength
            </span>
            <p className={`mt-0.5 font-medium ${getHighlightClass("strength")}`}>
              {entry.strength}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Dose
            </span>
            <p className={`mt-0.5 font-medium ${getHighlightClass("dose")}`}>{entry.dose}</p>
          </div>
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Frequency
          </span>
          <p className={`mt-0.5 font-medium ${getHighlightClass("frequency")}`}>
            {entry.frequency}
          </p>
        </div>
        {entry.source && (
          <div className="mt-1 border-t pt-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Source
            </span>
            <p className="mt-0.5 text-sm text-muted-foreground">{entry.source}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ChangeLegend({ changes }: { changes: Change[] }) {
  const changeLabels: Record<Change["type"], string> = {
    "brand-to-generic": "Brand → Generic",
    "dose-change": "Dose Changed",
    "frequency-change": "Frequency Changed",
    new: "New Medication",
    stopped: "Medication Stopped",
  }

  const changeColors: Record<Change["type"], string> = {
    "brand-to-generic": "bg-info/20 border-info/30",
    "dose-change": "bg-warning/20 border-warning/30",
    "frequency-change": "bg-primary/20 border-primary/30",
    new: "bg-success/20 border-success/30",
    stopped: "bg-destructive/20 border-destructive/30",
  }

  const uniqueTypes = [...new Set(changes.map((c) => c.type))]

  return (
    <div className="flex flex-wrap gap-2">
      {uniqueTypes.map((type) => (
        <span
          key={type}
          className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${changeColors[type]}`}
        >
          {changeLabels[type]}
        </span>
      ))}
    </div>
  )
}

export function ComparisonDetail({ homeMed, dischargeMed, changes }: ComparisonDetailProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Medication Comparison</CardTitle>
        {changes.length > 0 && <ChangeLegend changes={changes} />}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <MedEntryCard entry={homeMed} type="home" changes={changes} />
          <div className="flex shrink-0 items-center justify-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <ArrowRight className="size-5 text-muted-foreground lg:rotate-0 rotate-90" />
            </div>
          </div>
          <MedEntryCard entry={dischargeMed} type="discharge" changes={changes} />
        </div>
      </CardContent>
    </Card>
  )
}
