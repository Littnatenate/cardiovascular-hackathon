"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, AlertTriangle, Pencil, Download } from "lucide-react"

interface QuickActionsProps {
  onViewInstructions: () => void
  onViewEscalation: () => void
  onEditSession: () => void
  onExportPdf: () => void
  hasEscalation: boolean
}

export function QuickActions({
  onViewInstructions,
  onViewEscalation,
  onEditSession,
  onExportPdf,
  hasEscalation
}: QuickActionsProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Quick Access</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onViewInstructions}>
            <FileText className="mr-1.5 h-4 w-4" />
            View Patient Instructions
          </Button>
          {hasEscalation && (
            <Button variant="outline" size="sm" onClick={onViewEscalation}>
              <AlertTriangle className="mr-1.5 h-4 w-4" />
              View Escalation Summary
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onEditSession}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit Session
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPdf}>
            <Download className="mr-1.5 h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
