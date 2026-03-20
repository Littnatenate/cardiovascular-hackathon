export type MedSource = "photo" | "manual" | "admission" | "voice";

export interface Medication {
  id: string;
  drugName: string;
  strength: string;
  dose: string;
  frequency: string;
  source: MedSource;
}
