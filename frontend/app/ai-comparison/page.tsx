import { ComparisonResults } from "@/components/med-reconcile/comparison-results";
import { SessionLayout } from "@/components/session-layout";

export default function Page() {
  return (
    <SessionLayout>
      <ComparisonResults />
    </SessionLayout>
  );
}
