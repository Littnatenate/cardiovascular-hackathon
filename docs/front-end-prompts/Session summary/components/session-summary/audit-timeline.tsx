import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Play, 
  FileText, 
  Home, 
  Camera, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  FileOutput,
  Flag
} from "lucide-react"

export interface AuditEvent {
  id: string
  type: 
    | "session_created" 
    | "discharge_meds_entered" 
    | "home_meds_entered" 
    | "photo_captured" 
    | "ai_comparison" 
    | "nurse_confirmed" 
    | "nurse_stopped" 
    | "instructions_generated" 
    | "session_completed"
  description: string
  timestamp: string
  details?: string
}

interface AuditTimelineProps {
  events: AuditEvent[]
}

export function AuditTimeline({ events }: AuditTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 h-full w-px bg-border" aria-hidden="true" />
          
          <ul className="space-y-0" role="list" aria-label="Session audit trail">
            {events.map((event, index) => (
              <TimelineEvent 
                key={event.id} 
                event={event} 
                isLast={index === events.length - 1}
              />
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

interface TimelineEventProps {
  event: AuditEvent
  isLast: boolean
}

function TimelineEvent({ event, isLast }: TimelineEventProps) {
  const { icon: Icon, bgColor, iconColor } = getEventStyle(event.type)
  
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Icon */}
      <div 
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgColor}`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      
      {/* Content */}
      <div className={`flex-1 pt-0.5 ${!isLast ? 'pb-2' : ''}`}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground">{event.description}</p>
          <time className="text-xs text-muted-foreground">{event.timestamp}</time>
        </div>
        {event.details && (
          <p className="mt-1 text-sm text-muted-foreground">{event.details}</p>
        )}
      </div>
    </li>
  )
}

function getEventStyle(type: AuditEvent["type"]) {
  const styles: Record<AuditEvent["type"], { icon: React.ComponentType<{ className?: string }>; bgColor: string; iconColor: string }> = {
    session_created: {
      icon: Play,
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    discharge_meds_entered: {
      icon: FileText,
      bgColor: "bg-muted",
      iconColor: "text-muted-foreground"
    },
    home_meds_entered: {
      icon: Home,
      bgColor: "bg-muted",
      iconColor: "text-muted-foreground"
    },
    photo_captured: {
      icon: Camera,
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    ai_comparison: {
      icon: Bot,
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    nurse_confirmed: {
      icon: CheckCircle2,
      bgColor: "bg-success/10",
      iconColor: "text-success"
    },
    nurse_stopped: {
      icon: XCircle,
      bgColor: "bg-destructive/10",
      iconColor: "text-destructive"
    },
    instructions_generated: {
      icon: FileOutput,
      bgColor: "bg-muted",
      iconColor: "text-muted-foreground"
    },
    session_completed: {
      icon: Flag,
      bgColor: "bg-success",
      iconColor: "text-success-foreground"
    }
  }
  
  return styles[type]
}
