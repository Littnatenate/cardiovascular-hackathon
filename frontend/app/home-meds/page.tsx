import { HomeMedsEntry } from "@/components/med-entry/home-meds-entry";
import { SessionLayout } from "@/components/session-layout";

export default function Page() {
  return (
    <SessionLayout>
      <HomeMedsEntry />
    </SessionLayout>
  );
}
