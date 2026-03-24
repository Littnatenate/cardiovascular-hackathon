export type SessionStatus = 'in-progress' | 'completed' | 'escalated' | 'draft'
export type MedSource = "photo" | "manual" | "admission";

export interface Medication {
  id: string;
  drugName: string;
  strength: string;
  dose: string;
  frequency: string;
  source: MedSource;
}

export interface DischargeSession {
  id: string
  patientName: string
  mrn: string
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
