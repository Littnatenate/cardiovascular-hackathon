import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Stethoscope, ExternalLink, Lightbulb } from "lucide-react"

interface ClinicalContextProps {
  drugClass: string
  indication: string
  commonReasons: string[]
  referenceUrl?: string
}

export function ClinicalContext({
  drugClass,
  indication,
  commonReasons,
  referenceUrl,
}: ClinicalContextProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Stethoscope className="size-5 text-primary" />
          Clinical Context
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Drug Class & Indication */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-1.5 text-sm font-medium text-muted-foreground">Drug Class</h4>
            <p className="font-medium">{drugClass}</p>
          </div>
          <div>
            <h4 className="mb-1.5 text-sm font-medium text-muted-foreground">Indication</h4>
            <p className="font-medium">{indication}</p>
          </div>
        </div>

        {/* Common Reasons */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="size-4 text-warning" />
            <h4 className="text-sm font-medium text-muted-foreground">
              Common reasons for this type of change
            </h4>
          </div>
          <ul className="flex flex-col gap-1.5 pl-6">
            {commonReasons.map((reason, index) => (
              <li key={index} className="list-disc text-sm">
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Reference Link */}
        {referenceUrl && (
          <div className="border-t pt-4">
            <Button variant="outline" size="sm" asChild>
              <a href={referenceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 size-4" />
                View Drug Reference
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
