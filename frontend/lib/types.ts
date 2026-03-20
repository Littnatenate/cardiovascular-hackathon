export type SessionStatus = 'in-progress' | 'completed' | 'escalated' | 'draft'

export interface DischargeSession {
  id: string
  patientName: string
  ward: string
  bed: string
  status: SessionStatus
  createdAt: Date
  updatedAt: Date
  assignedNurse?: string
  notes?: string
}

export interface Nurse {
  id: string
  name: string
  role: string
  avatar?: string
}
