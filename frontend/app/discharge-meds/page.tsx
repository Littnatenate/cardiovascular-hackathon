import { DischargeMedsScreen } from "@/components/discharge-meds/discharge-meds-screen"
import { SessionLayout } from "@/components/session-layout";
import { Suspense } from "react";

export default function Page() {
  return (
    <SessionLayout>
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading discharge medications...</div>}>
        <DischargeMedsScreen />
      </Suspense>
    </SessionLayout>
  )
}

