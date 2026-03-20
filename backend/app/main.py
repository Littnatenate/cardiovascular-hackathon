import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.med_recon import router as med_recon_router
from app.middleware.security import SecurityMiddleware

app = FastAPI(title="MedSafe API", docs_url=None, redoc_url=None)  # Disable public docs in production

# ── Security Middleware (API Key + IP Whitelist + Rate Limit) ──
app.add_middleware(SecurityMiddleware)

# ── CORS — Only allow trusted frontend origins ──
ALLOWED_ORIGINS = os.getenv("MEDSAFE_CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)

# ── Routes ──
app.include_router(med_recon_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "MedSafe Backend is live!", "version": "1.0.0"}

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "service": "MedSafe AI Engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
