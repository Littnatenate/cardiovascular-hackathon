"use client";

import { Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraViewfinderProps {
  onCapture: () => void;
}

export function CameraViewfinder({ onCapture }: CameraViewfinderProps) {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full bg-foreground rounded-2xl overflow-hidden">
      {/* Simulated camera feed */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/90 via-foreground/70 to-foreground/90" />

      {/* Corner guides */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-64 h-40">
          {/* top-left */}
          <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/80 rounded-tl" />
          {/* top-right */}
          <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/80 rounded-tr" />
          {/* bottom-left */}
          <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/80 rounded-bl" />
          {/* bottom-right */}
          <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/80 rounded-br" />

          <p className="absolute inset-0 flex items-center justify-center text-white/60 text-xs text-center px-4 leading-relaxed">
            Align the medication label within the frame
          </p>
        </div>
      </div>

      {/* Scan line animation */}
      <div
        className="absolute left-0 right-0 h-0.5 bg-primary/70 animate-bounce"
        style={{ top: "45%", animationDuration: "2s" }}
        aria-hidden="true"
      />

      {/* Bottom controls */}
      <div className="absolute bottom-5 inset-x-0 flex items-center justify-center z-10">
        <button
          onClick={onCapture}
          aria-label="Capture photo"
          className="w-16 h-16 rounded-full bg-white border-4 border-white/40 shadow-xl flex items-center justify-center
                     hover:bg-white/90 active:scale-95 transition-transform focus:outline-none focus:ring-4 focus:ring-white/50"
        >
          <Camera className="size-7 text-foreground" aria-hidden="true" />
        </button>
      </div>

      {/* Flash toggle — decorative */}
      <div className="absolute top-4 right-4 z-10">
        <button
          aria-label="Toggle flash"
          className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors"
        >
          <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
