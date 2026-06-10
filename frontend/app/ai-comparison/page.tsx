import { ComparisonResults } from "@/components/med-reconcile/comparison-results";
import { SessionLayout } from "@/components/session-layout";
import { Suspense } from "react";

export default function Page() {
  return (
    <SessionLayout>
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading comparison results...</div>}>
        <ComparisonResults />
      </Suspense>
    </SessionLayout>
  );
}

