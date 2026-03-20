"use client"

import { AlertCircle, Calendar, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PatientBannerProps {
  name: string
  dob: string
  mrn: string
  allergies: string[]
  dischargeDate: string
}

export function PatientBanner({
  name,
  dob,
  mrn,
  allergies,
  dischargeDate,
}: PatientBannerProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: Patient identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">{name}</p>
            <p className="text-sm text-muted-foreground">
              DOB: {dob} &middot; MRN: {mrn}
            </p>
          </div>
        </div>

        {/* Right: Discharge date + allergies */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Discharged {dischargeDate}
          </span>
          <span className="flex items-center gap-1.5 text-destructive font-medium">
            <AlertCircle className="h-4 w-4" />
            Allergies:&nbsp;
            {allergies.map((a) => (
              <Badge key={a} variant="destructive" className="text-xs font-medium">
                {a}
              </Badge>
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}
