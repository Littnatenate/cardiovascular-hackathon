from fastapi import APIRouter, HTTPException
from app.services.safety_engine import compare_lists
from app.services.ocr_engine import simulate_ocr
from app.services.education_generator import generate_patient_instructions

router = APIRouter()

@router.post("/reconcile")
async def reconcile_medications(data: dict):
    # Expects data with "home_meds" and "discharge_meds" lists
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
    # Expects "image_name" (e.g. "margaret.png")
    image_name = data.get("image_name", "")
    if not image_name:
        raise HTTPException(status_code=400, detail="image_name is required")
    
    ocr_results = simulate_ocr(image_name)
    return {
        "status": "success",
        "medications": ocr_results
    }

from app.services.whatsapp_generator import generate_whatsapp_summary
from app.services.pdf_generator import pdf_engine
from fastapi.responses import Response

@router.post("/generate-education")
@router.post("/educate")
async def generate_education(data: dict):
    # Expects "results" from reconcile AND "patient" details for personalization
    results = data.get("results", {})
    patient = data.get("patient", {})
    target_lang = data.get("target_lang", "English")
    caregiver_lang = data.get("caregiver_lang", "None")
    
    if not results:
        raise HTTPException(status_code=400, detail="reconciliation results are required")
    
    # Calls the new async generative education service
    print(f"[API] Generating {target_lang} education (Caregiver: {caregiver_lang}) for {patient.get('name', 'Unknown')}")
    education_md = await generate_patient_instructions(results, patient, target_lang, caregiver_lang)
    print(f"[API] Generation complete. Length: {len(education_md)}")
    return {
        "status": "success",
        "education_plan": education_md
    }

@router.post("/whatsapp-summary")
async def create_whatsapp_summary(data: dict):
    # Expects the raw Markdown from the AI, so we don't have to rebuild it
    instructions_md = data.get("instructions_md", "")
    caregiver_lang = data.get("caregiver_lang", "None")
    
    if not instructions_md:
        raise HTTPException(status_code=400, detail="instructions_md is required to generate summary")
        
    print(f"[API] Generating WhatsApp summary. Language: {caregiver_lang}")
    whatsapp_text = await generate_whatsapp_summary(instructions_md, caregiver_lang)
    return {
        "status": "success",
        "summary": whatsapp_text
    }

@router.post("/export-pdf")
async def export_pdf(data: dict):
    # Expects raw Markdown to convert directly to PDF
    instructions_md = data.get("instructions_md", "")
    patient_name = data.get("patient_name", "Patient")
    
    if not instructions_md:
        raise HTTPException(status_code=400, detail="instructions_md is required for PDF export")
        
    print(f"[API] Generating PDF for {patient_name}")
    pdf_bytes = pdf_engine.generate_pdf(instructions_md, patient_name)
    
    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="Failed to convert Markdown to PDF")
        
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="MedSafe_Discharge_{patient_name.replace(" ", "_")}.pdf"'}
    )

