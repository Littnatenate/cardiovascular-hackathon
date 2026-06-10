import { NewSessionForm } from "@/components/new-session-form"
import { SessionLayout } from "@/components/session-layout";
import { Suspense } from "react";

export default function NewSessionPage() {
  return (
    <SessionLayout>
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading form...</div>}>
        <NewSessionForm />
      </Suspense>
    </SessionLayout>
  )
}

