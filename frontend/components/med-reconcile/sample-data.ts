import { MedResult } from "./types";

export const SAMPLE_RESULTS: MedResult[] = [
  {
    id: "omeprazole",
    status: "stopped",
    drugName: "Omeprazole 20 mg",
    summary: "Home med not found on discharge list. Patient may still have supply at home.",
    confidence: "high",
    needsConfirmation: true,
    patientPrompt: "Were you told to stop taking your stomach medication (Omeprazole)?",
  },
  {
    id: "atorvastatin",
    status: "changed",
    drugName: "Atorvastatin (Lipitor)",
    originalNames: { home: "Lipitor 20 mg", discharge: "Atorvastatin 40 mg" },
    summary: "Same drug (brand ↔ generic match), but dose doubled from 20 mg to 40 mg.",
    confidence: "high",
    confidenceNote: "Brand-generic match via RxNorm",
    needsConfirmation: true,
    patientPrompt:
      "Your cholesterol medication dose has been increased from 20 mg to 40 mg. Did the doctor discuss this with you?",
  },
  {
    id: "enoxaparin",
    status: "new",
    drugName: "Enoxaparin 40 mg",
    summary: "On discharge list but not in home meds. Likely a new prescription from this hospital stay.",
    confidence: "high",
    needsConfirmation: false,
    patientPrompt: "You have a new blood-thinning injection that was started during your hospital stay.",
  },
  {
    id: "metformin",
    status: "continued",
    drugName: "Metformin 500 mg",
    summary: "Same drug, same dose, same frequency on both lists.",
    confidence: "high",
    needsConfirmation: false,
    patientPrompt: "",
    autoConfirmed: true,
  },
];
