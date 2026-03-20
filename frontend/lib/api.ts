const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function reconcileMedications(homeMeds: any[], dischargeMeds: any[]) {
  console.log("[API] Calling reconcileMedications with:", { homeMeds, dischargeMeds });
  try {
    const response = await fetch(`${API_BASE_URL}/reconcile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        home_meds: homeMeds,
        discharge_meds: dischargeMeds,
      }),
    });

    if (!response.ok) {
      console.warn(`[API] Server responded with error: ${response.status}. Using mock fallback.`);
      return getMockReconciliation();
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API] Network/Connection error:", error);
    console.log("[API] Using mock fallback for demonstration.");
    return getMockReconciliation();
  }
}

export async function generateEducation(results: any, patient: any) {
  console.log("[API] Calling generateEducation with results length:", Object.keys(results).length);
  try {
    const response = await fetch(`${API_BASE_URL}/educate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        results: results,
        patient: patient,
      }),
    });

    if (!response.ok) {
      console.warn(`[API] Server error ${response.status} on educate. Using fallback.`);
      return getMockEducation();
    }

    const data = await response.json();
    return data.education_plan || data;
  } catch (error) {
    console.error("[API] generateEducation error:", error);
    return getMockEducation();
  }
}

function getMockReconciliation() {
  // A realistic mock for demo purposes if backend is down
  return {
    "atorvastatin-40": {
      status: "changed",
      reason: "Dose increased for intensive lipid management following acute cardiac event.",
      recommendation: "Increase Atorvastatin to 40mg once nightly.",
      discrepancy: false,
      severity: "low"
    },
    "metformin-500": {
      status: "continued",
      reason: "HbA1c remains within target; no contraindications present.",
      discrepancy: false
    },
    "lisinopril-10": {
      status: "discrepancy",
      reason: "Lisinopril accidentally omitted from discharge script despite stable BP.",
      recommendation: "Escalate to physician to confirm re-initiation.",
      discrepancy: true,
      severity: "high"
    }
  };
}

function getMockEducation() {
  return `### Your Medication Plan

Based on the reconciliation of your medications, we have prepared the following instructions for your recovery.

**Atorvastatin (40mg)**
- **Why?** This helps lower your cholesterol and protects your heart.
- **Dose?** Take 1 tablet every night.
- **What's changed?** Your dose has been increased to better control your cholesterol levels.

**Metformin (500mg)**
- **Why?** This controls your blood sugar.
- **Dose?** Take 1 tablet in the morning and 1 at night.

**Enoxaparin (40mg Injection)**
- **Why?** This prevents blood clots while you recover.
- **Dose?** One injection every morning.

**Important Reminders:**
- Do not stop any medications without consulting your doctor.
- Report any unusual muscle pain or unexpected bleeding immediately.
`;
}
