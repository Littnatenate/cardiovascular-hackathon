import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Info,
} from "lucide-react"

interface ConfidenceFactor {
  label: string
  impact: "positive" | "negative" | "neutral"
}

interface Interaction {
  severity: "mild" | "moderate" | "severe"
  medication: string
  description: string
}

interface AIReasoningProps {
  matchMethod: string
  confidenceScore: number
  confidenceFactors: ConfidenceFactor[]
  interactions: Interaction[]
}

function ConfidenceBar({ score }: { score: number }) {
  const getColorClass = (score: number) => {
    if (score >= 90) return "bg-success"
    if (score >= 70) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${getColorClass(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="min-w-[3rem] text-right text-sm font-semibold tabular-nums">
        {score}%
      </span>
    </div>
  )
}

function FactorItem({ factor }: { factor: ConfidenceFactor }) {
  const icons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus,
  }

  const colors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }

  const Icon = icons[factor.impact]

  return (
    <li className="flex items-start gap-2.5 text-sm">
      <Icon className={`mt-0.5 size-4 shrink-0 ${colors[factor.impact]}`} />
      <span>{factor.label}</span>
    </li>
  )
}

function InteractionAlert({ interaction }: { interaction: Interaction }) {
  const severityConfig = {
    mild: {
      bg: "bg-info/10 border-info/20",
      icon: Info,
      iconColor: "text-info",
      label: "Mild",
    },
    moderate: {
      bg: "bg-warning/10 border-warning/20",
      icon: AlertTriangle,
      iconColor: "text-warning",
      label: "Moderate",
    },
    severe: {
      bg: "bg-destructive/10 border-destructive/20",
      icon: AlertTriangle,
      iconColor: "text-destructive",
      label: "Severe",
    },
  }

  const config = severityConfig[interaction.severity]
  const Icon = config.icon

  return (
    <div className={`rounded-lg border p-3 ${config.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 size-5 shrink-0 ${config.iconColor}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Interaction with {interaction.medication}</span>
            <Badge variant="outline" className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{interaction.description}</p>
        </div>
      </div>
    </div>
  )
}

export function AIReasoning({
  matchMethod,
  confidenceScore,
  confidenceFactors,
  interactions,
}: AIReasoningProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="size-5 text-primary" />
          AI Reasoning
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Match Method */}
        <div>
          <h4 className="mb-1.5 text-sm font-medium text-muted-foreground">
            How the match was made
          </h4>
          <p className="rounded-md bg-muted/50 px-3 py-2 text-sm font-medium">
            {matchMethod}
          </p>
        </div>

        {/* Confidence Score */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Confidence Score
          </h4>
          <ConfidenceBar score={confidenceScore} />
        </div>

        {/* Confidence Factors */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            What affected the score
          </h4>
          <ul className="flex flex-col gap-2">
            {confidenceFactors.map((factor, index) => (
              <FactorItem key={index} factor={factor} />
            ))}
          </ul>
        </div>

        {/* Interactions */}
        {interactions.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Drug Interactions
            </h4>
            <div className="flex flex-col gap-2">
              {interactions.map((interaction, index) => (
                <InteractionAlert key={index} interaction={interaction} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
