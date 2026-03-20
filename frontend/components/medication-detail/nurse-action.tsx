"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Pencil, MessageSquarePlus, Loader2 } from "lucide-react"

interface NurseActionProps {
  onConfirm: () => void
  onOverride: (reason: string) => void
  note: string
  onNoteChange: (note: string) => void
  actionTaken: string | null
}

const overrideReasons = [
  { value: "actually-continued", label: "Actually continued" },
  { value: "actually-stopped", label: "Actually stopped" },
  { value: "dose-correct", label: "Dose is correct" },
  { value: "other", label: "Other" },
]

export function NurseAction({
  onConfirm,
  onOverride,
  note,
  onNoteChange,
  actionTaken,
}: NurseActionProps) {
  const [overrideReason, setOverrideReason] = useState<string>("")
  const [showOverride, setShowOverride] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    onConfirm()
    setIsSubmitting(false)
  }

  const handleOverride = async () => {
    if (!overrideReason) return
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    onOverride(overrideReason)
    setIsSubmitting(false)
  }

  if (actionTaken) {
    const isConfirmed = actionTaken === "confirmed"
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex items-center gap-3 py-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-success/20">
            <CheckCircle2 className="size-5 text-success" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isConfirmed ? "Medication Confirmed" : "Override Applied"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isConfirmed
                ? "This medication has been verified and confirmed."
                : `Override reason: ${overrideReasons.find((r) => r.value === actionTaken.replace("override:", ""))?.label || actionTaken.replace("override:", "")}`}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Take Action</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-success text-success-foreground hover:bg-success/90"
          >
            {isSubmitting && !showOverride ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 size-4" />
            )}
            Confirm
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowOverride(!showOverride)}
            className="border-primary/30 text-primary hover:bg-primary/5"
          >
            <Pencil className="mr-2 size-4" />
            Override
          </Button>
        </div>

        {/* Override Options */}
        {showOverride && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="mb-3 text-sm font-medium">Select override reason</h4>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Select value={overrideReason} onValueChange={setOverrideReason}>
                <SelectTrigger className="sm:w-[240px]">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {overrideReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleOverride}
                disabled={!overrideReason || isSubmitting}
                size="sm"
              >
                {isSubmitting && showOverride ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Apply Override
              </Button>
            </div>
          </div>
        )}

        {/* Note Field */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <MessageSquarePlus className="size-4 text-muted-foreground" />
            <label htmlFor="note" className="text-sm font-medium text-muted-foreground">
              Add note (for audit trail)
            </label>
          </div>
          <Textarea
            id="note"
            placeholder="Enter any additional notes about this medication review..."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}
