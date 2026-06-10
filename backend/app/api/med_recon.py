from fastapi import APIRouter, HTTPException, Response
from app.services.safety_engine import compare_lists
from app.services.ocr_engine import simulate_ocr, scan_image_data
from app.services.education_generator import generate_patient_instructions
from app.services.whatsapp_generator import generate_whatsapp_summary
from app.services.pdf_generator import pdf_engine
from app.services.db import (
    get_all_sessions,
    get_session_by_id,
    create_session,
    update_session,
    delete_session,
)

router = APIRouter()

# ── Session CRUD Endpoints ──

@router.get("/sessions")
async def list_sessions():
    return get_all_sessions()

@router.post("/sessions")
async def start_session(data: dict):
    try:
        new_session = create_session(data)
        return new_session
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {e}")

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.put("/sessions/{session_id}")
async def edit_session(session_id: str, data: dict):
    session = update_session(session_id, data)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.delete("/sessions/{session_id}")
async def remove_session(session_id: str):
    success = delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "success", "message": "Session deleted"}

# ── Session Action Endpoints (Database-backed) ──

@router.post("/sessions/{session_id}/reconcile")
async def session_reconcile(session_id: str):
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    home_meds = session.get("home_meds", [])
    discharge_meds = session.get("discharge_meds", [])
    allergies = session.get("allergies", [])
    
    analysis_results = compare_lists(home_meds, discharge_meds, allergies)
    
    # Save the analysis results in the database
    update_session(session_id, {"reconciliation_results": analysis_results})
    
    return {
        "status": "success",
        "results": analysis_results
    }

@router.post("/sessions/{session_id}/educate")
async def session_educate(session_id: str, data: dict):
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    results = session.get("reconciliation_results", {})
    if not results:
        # Fallback to recalculate on-the-fly
        home_meds = session.get("home_meds", [])
        discharge_meds = session.get("discharge_meds", [])
        allergies = session.get("allergies", [])
        results = compare_lists(home_meds, discharge_meds, allergies)
        update_session(session_id, {"reconciliation_results": results})

    target_lang = data.get("target_lang", "English")
    caregiver_lang = data.get("caregiver_lang", "None")
    
    # Reconstruct patient details for the generative engine
    patient_info = {
        "name": session.get("patient_name", "Unknown"),
        "id": session.get("patient_id", "N/A"),
        "ward": session.get("ward"),
        "bed_number": session.get("bed_number"),
        "allergies": session.get("allergies", []),
        "discharge_date": session.get("discharge_date")
    }
    
    education_md = await generate_patient_instructions(results, patient_info, target_lang, caregiver_lang)
    
    # Save the generated education in the database
    update_session(session_id, {"patient_education": education_md})
    
    return {
        "status": "success",
        "education_plan": education_md
    }

@router.post("/sessions/{session_id}/whatsapp")
async def session_whatsapp(session_id: str, data: dict):
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    education_md = session.get("patient_education", "")
    if not education_md:
        raise HTTPException(status_code=400, detail="Patient education must be generated first")
        
    caregiver_lang = data.get("caregiver_lang", "None")
    whatsapp_text = await generate_whatsapp_summary(education_md, caregiver_lang)
    
    # Save the WhatsApp summary in the database
    update_session(session_id, {"whatsapp_summary": whatsapp_text})
    
    return {
        "status": "success",
        "summary": whatsapp_text
    }

# ── Generic/Legacy Endpoints (Preserved for compatibility) ──

@router.post("/reconcile")
async def reconcile_medications(data: dict):
    home_meds = data.get("home_meds", [])
    discharge_meds = data.get("discharge_meds", [])
    allergies = data.get("allergies", [])
    
    if not isinstance(home_meds, list) or not isinstance(discharge_meds, list):
         raise HTTPException(status_code=400, detail="home_meds and discharge_meds must be lists")

    analysis_results = compare_lists(home_meds, discharge_meds, allergies)
    
    return {
        "status": "success",
        "results": analysis_results
    }

@router.post("/scan")
async def scan_medication(data: dict):
    image_name = data.get("image_name", "")
    image_bytes = data.get("image_bytes", "")
    
    if not image_name and not image_bytes:
        raise HTTPException(status_code=400, detail="image_name or image_bytes is required")
    
    if image_bytes:
        if "," in image_bytes:
            image_bytes = image_bytes.split(",")[1]
        ocr_results = await scan_image_data(image_bytes)
    else:
        ocr_results = await simulate_ocr(image_name)
        
    return {
        "status": "success",
        "medications": ocr_results
    }

@router.post("/generate-education")
@router.post("/educate")
async def generate_education(data: dict):
    results = data.get("results", {})
    patient = data.get("patient", {})
    target_lang = data.get("target_lang", "English")
    caregiver_lang = data.get("caregiver_lang", "None")
    
    if not results:
        raise HTTPException(status_code=400, detail="reconciliation results are required")
    
    education_md = await generate_patient_instructions(results, patient, target_lang, caregiver_lang)
    return {
        "status": "success",
        "education_plan": education_md
    }

@router.post("/whatsapp-summary")
async def create_whatsapp_summary(data: dict):
    instructions_md = data.get("instructions_md", "")
    caregiver_lang = data.get("caregiver_lang", "None")
    
    if not instructions_md:
        raise HTTPException(status_code=400, detail="instructions_md is required to generate summary")
        
    whatsapp_text = await generate_whatsapp_summary(instructions_md, caregiver_lang)
    return {
        "status": "success",
        "summary": whatsapp_text
    }

@router.post("/export-pdf")
async def export_pdf(data: dict):
    instructions_md = data.get("instructions_md", "")
    patient_name = data.get("patient_name", "Patient")
    
    if not instructions_md:
        raise HTTPException(status_code=400, detail="instructions_md is required for PDF export")
        
    pdf_bytes = pdf_engine.generate_pdf(instructions_md, patient_name)
    
    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="Failed to convert Markdown to PDF")
        
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="MedSafe_Discharge_{patient_name.replace(" ", "_")}.pdf"'}
    )
