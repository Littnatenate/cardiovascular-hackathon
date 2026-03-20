from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.med_recon import router as med_recon_router

app = FastAPI(title="MedSafe API")

# Add CORS so the Next.js frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(med_recon_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
