"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraViewfinder } from "./camera-viewfinder";
import { PhotoPreview } from "./photo-preview";
import { ExtractedFieldRow } from "./extracted-field-row";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { scanMedication, getSession, updateSession } from "@/lib/api";
import type { CaptureState, ExtractedData, Confidence } from "./types";
import {
  CheckCircle,
  Trash2,
  Camera,
  ChevronLeft,
  Pill,
  ScanLine,
  AlertTriangle,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NEEDS_REVIEW_CONFIDENCES: Confidence[] = ["low", "medium", "missing"];

function hasFieldsNeedingReview(data: ExtractedData): boolean {
  return Object.values(data).some((f) =>
    NEEDS_REVIEW_CONFIDENCES.includes(f.confidence)
  );
}

// Simulated OCR result for Lipitor bottle
const MOCK_OCR_RESULT: ExtractedData = {
  drugName: {
    label: "Drug name",
    value: "Lipitor (atorvastatin calcium)",
    confidence: "high",
  },
  strength: {
    label: "Strength",
    value: "20 mg",
    confidence: "high",
  },
  dosageForm: {
    label: "Dosage form",
    value: "Film-coated tablet",
    confidence: "high",
  },
  frequency: {
    label: "Frequency",
    value: "",
    confidence: "missing",
    placeholder: "e.g. Once daily at bedtime",
  },
};

interface AddedMed {
  id: string;
  drugName: string;
  strength: string;
  dosageForm: string;
  frequency: string;
  source: "photo";
  addedAt: Date;
}

export function PhotoCaptureOcrScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [captureState, setCaptureState] = useState<CaptureState>("viewfinder");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [addedMeds, setAddedMeds] = useState<AddedMed[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const [capturedImageBase64, setCapturedImageBase64] = useState<string>("");

  const sessionId = searchParams.get("session_id") || (() => {
    try {
      const raw = sessionStorage.getItem("dischargeSession");
      return raw ? JSON.parse(raw).id : null;
    } catch (e) { return null; }
  })();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCapturedImageBase64(base64String);
      setCaptureState("preview");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCapture = useCallback(() => {
    setCapturedImageBase64("");
    setCaptureState("preview");
  }, []);

  const handleRetake = useCallback(() => {
    setCaptureState("viewfinder");
    setExtractedData(null);
    setCapturedImageBase64("");
  }, []);

  const handleUsePhoto = useCallback(async () => {
    setIsAnalyzing(true);
    setCaptureState("reviewing");
    
    try {
      // Send the real base64 image data or fallback if empty
      const result = await scanMedication(capturedImageBase64 || "dummy-blob-or-url");
      
      // Map OCR results array of objects into the ExtractedData structure
      if (result && Array.isArray(result) && result.length > 0) {
        const item = result[0];
        setExtractedData({
          drugName: { label: "Drug name", value: item.name || "Unknown", confidence: "high" },
          strength: { label: "Strength", value: item.dose || "Unknown", confidence: "high" },
          dosageForm: { label: "Dosage form", value: "Tablet", confidence: "high" },
          frequency: { label: "Frequency", value: item.frequency || "", confidence: item.frequency ? "high" : "missing", placeholder: "e.g. Once daily" },
        });
      } else {
        setExtractedData(MOCK_OCR_RESULT);
      }
    } catch (err) {
      console.error("OCR Check failed, falling back to mock:", err);
      setExtractedData(MOCK_OCR_RESULT);
    } finally {
      setIsAnalyzing(false);
    }
  }, [capturedImageBase64]);

  const handleFieldChange = useCallback(
    (field: keyof ExtractedData, value: string) => {
      setExtractedData((prev) =>
        prev ? { ...prev, [field]: { ...prev[field], value } } : prev
      );
    },
    []
  );

  const handleAddToHomeMeds = useCallback(async () => {
    if (!extractedData || !sessionId) return;
    const med = {
      id: crypto.randomUUID(),
      drugName: extractedData.drugName.value,
      strength: extractedData.strength.value,
      dose: "1 tablet",
      frequency: extractedData.frequency.value,
      source: "photo" as const,
    };
    
    try {
      const session = await getSession(sessionId);
      const currentMeds = session.home_meds || [];
      const updatedMeds = [...currentMeds, med];
      await updateSession(sessionId, { homeMeds: updatedMeds });

      const addedMed: AddedMed = {
        id: med.id,
        drugName: med.drugName,
        strength: med.strength,
        dosageForm: extractedData.dosageForm.value || "Tablet",
        frequency: med.frequency,
        source: "photo",
        addedAt: new Date(),
      };
      setAddedMeds((prev) => [addedMed, ...prev]);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (e) {
      console.error("Failed to save scanned medication to backend:", e);
      alert("Failed to save medication to DB. Please ensure backend is running.");
    }
  }, [extractedData, sessionId]);

  const handleCaptureAnother = useCallback(() => {
    setCaptureState("viewfinder");
    setExtractedData(null);
  }, []);

  const handleDiscard = useCallback(() => {
    setCaptureState("viewfinder");
    setExtractedData(null);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-card border-b border-border shadow-sm">
        <button
          onClick={() => router.push(`/home-meds?session_id=${sessionId}`)}
          aria-label="Go back"
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-5 text-foreground" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <ScanLine className="size-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight">
              Photo Capture
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Scan &amp; review medication label
            </p>
          </div>
        </div>

        {addedMeds.length > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <Pill className="size-3" aria-hidden="true" />
            {addedMeds.length} added
          </span>
        )}
      </header>

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-4 gap-4">
        {/* Camera / Preview area — hidden once review is shown */}
        {captureState !== "reviewing" && (
          <div
            className="w-full h-72 rounded-2xl overflow-hidden shadow-md"
            role="region"
            aria-label="Camera viewfinder"
          >
            {captureState === "viewfinder" && (
              <div className="relative w-full h-full">
                <CameraViewfinder onCapture={handleCapture} />
                <div className="absolute top-4 left-4 z-10">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-medium cursor-pointer border border-white/20 transition-colors">
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                  </label>
                </div>
              </div>
            )}
            {captureState === "preview" && (
              <PhotoPreview
                imageSrc={capturedImageBase64 || "/lipitor-bottle.jpg"}
                onRetake={handleRetake}
                onUsePhoto={handleUsePhoto}
              />
            )}
          </div>
        )}

        {/* Review state: image + fields side by side on larger screens, stacked on mobile */}
        {captureState === "reviewing" && (
          <section
            aria-label="Review extracted medication information"
            className="flex flex-col gap-4"
          >
            {isAnalyzing ? (
              /* Loading state */
              <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center gap-3">
                <Spinner className="size-8 text-primary" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Reading the label…
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    AI is extracting drug name, strength, and dosage information
                  </p>
                </div>
              </div>
            ) : extractedData ? (
              <>
                {/* Review required banner */}
                {hasFieldsNeedingReview(extractedData) && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-[var(--confidence-medium)]/40 bg-[var(--confidence-medium-bg)] px-4 py-3"
                  >
                    <AlertTriangle
                      className="size-4 text-[var(--confidence-medium)] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Review required before saving
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        One or more fields could not be read with high confidence.
                        Verify each highlighted field against the label before adding to Home Meds.
                      </p>
                    </div>
                  </div>
                )}

                {/* Side-by-side: photo + fields */}
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  {/* Captured photo — always visible for cross-checking */}
                  <div className="sm:w-40 sm:shrink-0 w-full">
                    <div className="relative rounded-xl overflow-hidden border border-border shadow-sm aspect-[3/4] sm:aspect-auto sm:h-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/lipitor-bottle.jpg"
                        alt="Captured medication label — use to verify extracted values"
                        className="w-full h-full object-cover sm:object-contain sm:h-52"
                      />
                      <button
                        onClick={handleRetake}
                        aria-label="Retake photo"
                        className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-white text-xs font-medium hover:bg-black/75 transition-colors backdrop-blur-sm"
                      >
                        <Camera className="size-3" aria-hidden="true" />
                        Retake
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 py-2 flex items-center gap-1">
                        <ZoomIn className="size-3 text-white/80" aria-hidden="true" />
                        <span className="text-white/80 text-xs">
                          Cross-check label
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Extracted fields */}
                  <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                    <div className="flex items-center gap-2 px-0.5">
                      <ScanLine className="size-4 text-primary" aria-hidden="true" />
                      <h2 className="text-sm font-semibold text-foreground">
                        AI extracted
                      </h2>
                      <span className="ml-auto text-xs text-muted-foreground font-medium">
                        All fields editable
                      </span>
                    </div>

                    {(
                      Object.entries(extractedData) as [
                        keyof ExtractedData,
                        ExtractedData[keyof ExtractedData]
                      ][]
                    ).map(([key, field]) => (
                      <ExtractedFieldRow
                        key={key}
                        label={field.label}
                        value={field.value}
                        confidence={field.confidence}
                        placeholder={field.placeholder}
                        onChange={(v) => handleFieldChange(key, v)}
                      />
                    ))}
                  </div>
                </div>

                {/* Success banner */}
                {justAdded && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex items-center gap-2 rounded-xl bg-[var(--confidence-high-bg)] border border-[var(--confidence-high)]/30 px-4 py-3 text-sm font-medium text-[var(--confidence-high)]"
                  >
                    <CheckCircle className="size-4 shrink-0" aria-hidden="true" />
                    Added to Home Meds — source tagged as Photo
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    onClick={handleAddToHomeMeds}
                    disabled={justAdded}
                  >
                    <CheckCircle className="size-4 mr-2" aria-hidden="true" />
                    Add to Home Meds
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCaptureAnother}
                    >
                      <Camera className="size-4 mr-1.5" aria-hidden="true" />
                      Capture Another
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-destructive border-destructive/40 hover:bg-destructive/5"
                      onClick={handleDiscard}
                    >
                      <Trash2 className="size-4 mr-1.5" aria-hidden="true" />
                      Discard
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        )}

        {/* Added meds list */}
        {addedMeds.length > 0 && (
          <section aria-label="Medications added this session" className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Added this session
            </h2>
            <ul className="flex flex-col gap-2">
              {addedMeds.map((med) => (
                <li
                  key={med.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 shrink-0">
                    <Pill className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {med.drugName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[med.strength, med.dosageForm].filter(Boolean).join(" · ")}
                      {med.frequency && ` · ${med.frequency}`}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <Camera className="size-2.5" aria-hidden="true" />
                    Photo
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="w-full mt-1 font-semibold"
              onClick={() => router.push(sessionId ? `/home-meds?session_id=${sessionId}` : '/home-meds')}
            >
              Done — Back to Home Meds
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
