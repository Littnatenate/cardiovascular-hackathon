import { HomeMedsEntry } from "@/components/med-entry/home-meds-entry";
import { SessionLayout } from "@/components/session-layout";
import { Suspense } from "react";

export default function Page() {
  return (
    <SessionLayout>
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading home medications...</div>}>
        <HomeMedsEntry />
      </Suspense>
    </SessionLayout>
  );
}

