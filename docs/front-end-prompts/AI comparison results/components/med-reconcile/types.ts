export type MedStatus = "stopped" | "changed" | "new" | "continued" | "interaction" | "uncertain";

export type Confidence = "high" | "medium" | "low";

export interface MedResult {
  id: string;
  status: MedStatus;
  drugName: string;
  originalNames?: { home?: string; discharge?: string };
  summary: string;
  confidence: Confidence;
  confidenceNote?: string;
  needsConfirmation: boolean;
  patientPrompt: string;
  autoConfirmed?: boolean;
  confirmed?: boolean;
  overridden?: boolean;
}

export interface SummaryCount {
  continued: number;
  changed: number;
  stopped: number;
  newMed: number;
  interactions: number;
  uncertain: number;
}
