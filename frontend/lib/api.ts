const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function reconcileMedications(homeMeds: any[], dischargeMeds: any[]) {
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
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error reconciling medications:", error);
    throw error;
  }
}
