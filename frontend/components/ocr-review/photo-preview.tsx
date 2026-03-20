"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";

interface PhotoPreviewProps {
  imageSrc: string;
  onRetake: () => void;
  onUsePhoto: () => void;
}

export function PhotoPreview({ imageSrc, onRetake, onUsePhoto }: PhotoPreviewProps) {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-foreground flex flex-col">
      <div className="flex-1 relative">
        <Image
          src={imageSrc}
          alt="Captured medication label photo"
          fill
          className="object-cover"
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-foreground/10" />
      </div>

      {/* Action bar */}
      <div className="absolute bottom-4 inset-x-4 flex gap-3 z-10">
        <Button
          variant="outline"
          className="flex-1 bg-foreground/60 text-white border-white/30 hover:bg-foreground/80 backdrop-blur-sm"
          onClick={onRetake}
        >
          <RotateCcw className="size-4 mr-2" aria-hidden="true" />
          Retake
        </Button>
        <Button
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onUsePhoto}
        >
          <Check className="size-4 mr-2" aria-hidden="true" />
          Use this photo
        </Button>
      </div>
    </div>
  );
}
