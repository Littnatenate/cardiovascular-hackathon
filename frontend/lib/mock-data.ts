import type { DischargeSession, Nurse, MedSource } from './types'

export const currentNurse: Nurse = {
  id: '1',
  name: 'Sarah Chen',
  role: 'Senior Registered Nurse',
}

export const dischargeSessions: DischargeSession[] = [
  {
    id: '1',
    patientName: 'Tan Ah Kow',
    mrn: 'S1234567A',
    ward: 'Ward 43',
    bed: 'Bed 12A',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    assignedNurse: 'Sarah Chen',
  },
  {
    id: '2',
    patientName: 'Siti Aminah',
    mrn: 'S7654321B',
    ward: 'Ward 21',
    bed: 'Bed 8B',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    assignedNurse: 'Sarah Chen',
  },
  {
    id: '3',
    patientName: 'Rajesh Kumar',
    mrn: 'S1122334C',
    ward: 'Ward 43',
    bed: 'Bed 3C',
    status: 'escalated',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28), // Yesterday
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
    assignedNurse: 'Sarah Chen',
    notes: 'Requires physician review for medication reconciliation',
  },
  {
    id: '4',
    patientName: 'Lim Wei Ming',
    mrn: 'S5566778D',
    ward: 'Ward 12',
    bed: 'Bed 5A',
    status: 'draft',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    assignedNurse: 'Sarah Chen',
  },
  {
    id: '5',
    patientName: 'Maria Santos',
    mrn: 'G9988776E',
    ward: 'Ward 21',
    bed: 'Bed 2A',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 10), // 10 min ago
    assignedNurse: 'Sarah Chen',
  },
  {
    id: '6',
    patientName: 'Ahmad bin Hassan',
    mrn: 'S1357924F',
    ward: 'Ward 12',
    bed: 'Bed 9B',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    assignedNurse: 'Sarah Chen',
  },
  {
    id: '7',
    patientName: 'Wong Mei Ling',
    mrn: 'S2468135G',
    ward: 'Ward 43',
    bed: 'Bed 7A',
    status: 'draft',
    createdAt: new Date(Date.now() - 1000 * 60 * 20), // 20 min ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    assignedNurse: 'Sarah Chen',
  },
]

export const SAMPLE_HOME_MEDS = [
  {
    id: 'h1',
    drugName: "Amlodipine",
    strength: "5 mg",
    dose: "1 tablet",
    frequency: "Once daily",
    source: "manual" as MedSource,
  },
  {
    id: 'h2',
    drugName: "Metformin",
    strength: "500 mg",
    dose: "1 tablet",
    frequency: "Twice daily",
    source: "manual" as MedSource,
  }
];

export const SAMPLE_DISCHARGE_MEDS = [
  {
    id: 'd1',
    drugName: "Amlodipine",
    strength: "10 mg",
    dose: "1 tablet",
    frequency: "Once daily",
    source: "manual" as MedSource,
  },
  {
    id: 'd2',
    drugName: "Metformin",
    strength: "500 mg",
    dose: "1 tablet",
    frequency: "Twice daily",
    source: "manual" as MedSource,
  },
  {
    id: 'd3',
    drugName: "Clopidogrel",
    strength: "75 mg",
    dose: "1 tablet",
    frequency: "Once daily",
    source: "manual" as MedSource,
  }
];

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}
