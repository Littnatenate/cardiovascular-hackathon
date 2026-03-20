const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_MEDSAFE_API_KEY || "medsafe-hackathon-2026";

// Shared headers for all API calls — includes security API key
function secureHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };
}

export async function reconcileMedications(homeMeds: any[], dischargeMeds: any[], allergies: string[] = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/reconcile`, {
      method: "POST",
      headers: secureHeaders(),
      body: JSON.stringify({
        home_meds: homeMeds,
        discharge_meds: dischargeMeds,
        allergies: allergies,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results; // Return the nested results object
  } catch (error) {
    console.error("Error reconciling medications:", error);
    throw error;
  }
}

export async function scanMedication(imageName: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: "POST",
      headers: secureHeaders(),
      body: JSON.stringify({ image_name: imageName }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.medications;
  } catch (error) {
    console.error("Error scanning medication:", error);
    throw error;
  }
}

export async function generateEducation(results: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-education`, {
      method: "POST",
      headers: secureHeaders(),
      body: JSON.stringify({ results }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.education_plan;
  } catch (error) {
    console.error("Error generating education plan:", error);
    throw error;
  }
}
