import { PhotoCaptureOcrScreen } from "@/components/ocr-review/photo-capture-ocr-screen";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading camera interface...</div>}>
      <PhotoCaptureOcrScreen />
    </Suspense>
  );
}

