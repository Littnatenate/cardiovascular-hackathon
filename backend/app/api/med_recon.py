from fastapi import APIRouter, HTTPException
from app.services.safety_engine import compare_lists

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
        "message": "Analysis complete", 
        "data": analysis_results
    }

