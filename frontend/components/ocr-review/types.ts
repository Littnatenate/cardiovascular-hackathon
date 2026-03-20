export type Confidence = "high" | "medium" | "low" | "missing";

export interface ExtractedField {
  label: string;
  value: string;
  confidence: Confidence;
  placeholder?: string;
}

export interface ExtractedData {
  drugName: ExtractedField;
  strength: ExtractedField;
  dosageForm: ExtractedField;
  frequency: ExtractedField;
}

export type CaptureState = "viewfinder" | "preview" | "reviewing";
