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
    
    if not isinstance(home_meds, list) or not isinstance(discharge_meds, list):
         raise HTTPException(status_code=400, detail="home_meds and discharge_meds must be lists")

    analysis_results = compare_lists(home_meds, discharge_meds)
    
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

@router.post("/generate-education")
async def generate_education(data: dict):
    # Expects the results from the reconcile endpoint
    results = data.get("results", {})
    if not results:
        raise HTTPException(status_code=400, detail="reconciliation results are required")
    
    education_md = generate_patient_instructions(results)
    return {
        "status": "success",
        "education_plan": education_md
    }

