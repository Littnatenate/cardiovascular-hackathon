from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.db import verify_user_login

router = APIRouter()

class LoginRequest(BaseModel):
    employee_id: str
    password: str

@router.post("/login")
async def login(data: LoginRequest):
    user = verify_user_login(data.employee_id, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid employee ID or password")
    
    return {
        "status": "success",
        "user": user,
        "token": f"mock-jwt-token-{user['id']}" # Simulated session token
    }
