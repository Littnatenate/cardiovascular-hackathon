const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_MEDSAFE_API_KEY || "medsafe-hackathon-2026";

function secureHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };
}

// ── Auth ──

export async function loginUser(employeeId: string, password: string) {
  console.log("[API] loginUser:", employeeId);
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: secureHeaders(),
    body: JSON.stringify({ employee_id: employeeId, password }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Invalid credentials");
  }
  
  return await response.json();
}

// ── Session CRUD ──

export async function getSessions() {
  console.log("[API] getSessions");
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: "GET",
    headers: secureHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.statusText}`);
  }
  return await response.json();
}

export async function getSession(id: string) {
  console.log("[API] getSession:", id);
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
    method: "GET",
    headers: secureHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch session ${id}: ${response.statusText}`);
  }
  return await response.json();
}

export async function createSession(patientData: any) {
  console.log("[API] createSession:", patientData);
  
  // Format keys to match Python backend db conventions
  const payload = {
    id: patientData.id,
    patient_name: patientData.patientName,
    patient_id: patientData.patientId,
    ward: patientData.ward,
    bed_number: patientData.bedNumber,
    allergies: patientData.allergies,
    discharge_date: patientData.dischargeDate,
    status: patientData.status || "in-progress",
    home_meds: patientData.homeMeds || [],
    discharge_meds: patientData.dischargeMeds || []
  };

  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: "POST",
    headers: secureHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }
  return await response.json();
}

export async function updateSession(id: string, updates: any) {
  console.log("[API] updateSession:", id, updates);
  
  // Map frontend keys to backend database column names if they are present
  const payload: any = {};
  if (updates.patientName !== undefined) payload.patient_name = updates.patientName;
  if (updates.patientId !== undefined) payload.patient_id = updates.patientId;
  if (updates.ward !== undefined) payload.ward = updates.ward;
  if (updates.bedNumber !== undefined) payload.bed_number = updates.bedNumber;
  if (updates.allergies !== undefined) payload.allergies = updates.allergies;
  if (updates.dischargeDate !== undefined) payload.discharge_date = updates.dischargeDate;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.homeMeds !== undefined) payload.home_meds = updates.homeMeds;
  if (updates.dischargeMeds !== undefined) payload.discharge_meds = updates.dischargeMeds;
  if (updates.reconciliationResults !== undefined) payload.reconciliation_results = updates.reconciliationResults;
  if (updates.patientEducation !== undefined) payload.patient_education = updates.patientEducation;
  if (updates.whatsappSummary !== undefined) payload.whatsapp_summary = updates.whatsappSummary;

  // Include direct fields if they are already mapped
  const directFields = ["patient_name", "patient_id", "ward", "bed_number", "allergies", "discharge_date", "status", "home_meds", "discharge_meds", "reconciliation_results", "patient_education", "whatsapp_summary"];
  for (const f of directFields) {
    if (updates[f] !== undefined) {
      payload[f] = updates[f];
    }
  }

  const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
    method: "PUT",
    headers: secureHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to update session ${id}: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteSession(id: string) {
  console.log("[API] deleteSession:", id);
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
    method: "DELETE",
    headers: secureHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete session ${id}: ${response.statusText}`);
  }
  return await response.json();
}

// ── Database-backed Actions ──

export async function reconcileMedications(sessionId: string) {
  console.log("[API] reconcileMedications for session:", sessionId);
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/reconcile`, {
    method: "POST",
    headers: secureHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Reconciliation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || data;
}

export async function generateEducation(sessionId: string, targetLang: string = "English", caregiverLang: string = "None") {
  console.log("[API] generateEducation for session:", sessionId);
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/educate`, {
    method: "POST",
    headers: secureHeaders(),
    body: JSON.stringify({
      target_lang: targetLang,
      caregiver_lang: caregiverLang
    }),
  });

  if (!response.ok) {
    throw new Error(`Education generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.education_plan || data;
}

export async function generateWhatsappSummary(sessionId: string, caregiverLang: string = "None") {
  console.log("[API] generateWhatsappSummary for session:", sessionId);
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/whatsapp`, {
    method: "POST",
    headers: secureHeaders(),
    body: JSON.stringify({
      caregiver_lang: caregiverLang
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp summary generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.summary;
}

// ── File/OCR Upload ──

export async function scanMedication(imageBytesOrName: string) {
  console.log("[API] scanMedication");
  
  // If it is a base64 string, pass it as image_bytes, else as image_name
  const isBase64 = imageBytesOrName.includes(";base64,") || imageBytesOrName.length > 500;
  const bodyPayload = isBase64 
    ? { image_bytes: imageBytesOrName } 
    : { image_name: imageBytesOrName };

  const response = await fetch(`${API_BASE_URL}/scan`, {
    method: "POST",
    headers: secureHeaders(),
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    throw new Error(`Medication scan failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.medications;
}

export async function exportPdf(instructionsMd: string, patientName: string = "Patient") {
  const response = await fetch(`${API_BASE_URL}/export-pdf`, {
    method: "POST",
    headers: secureHeaders(),
    body: JSON.stringify({
      instructions_md: instructionsMd,
      patient_name: patientName
    }),
  });

  if (!response.ok) {
    throw new Error(`PDF export failed: ${response.statusText}`);
  }

  return await response.blob();
}
