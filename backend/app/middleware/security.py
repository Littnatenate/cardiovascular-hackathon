# MedSafe Security Middleware
# Implements: API Key Auth, IP Whitelisting (Hospital Wifi Simulation), Rate Limiting
import os
import time
from collections import defaultdict
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# ── Configuration (loaded from environment variables) ──────────

# API Key — required for all /api/ requests
MEDSAFE_API_KEY = os.getenv("MEDSAFE_API_KEY", "medsafe-hackathon-2026")

# Hospital Wifi Simulation — comma-separated list of trusted IPs
# Set to "*" to disable (allow all IPs, demo mode)
TRUSTED_IPS_RAW = os.getenv("MEDSAFE_TRUSTED_IPS", "*")
TRUSTED_IPS = [ip.strip() for ip in TRUSTED_IPS_RAW.split(",")] if TRUSTED_IPS_RAW != "*" else None

# Rate Limiting — max requests per IP per window
RATE_LIMIT_MAX = int(os.getenv("MEDSAFE_RATE_LIMIT", "30"))  # requests
RATE_LIMIT_WINDOW = int(os.getenv("MEDSAFE_RATE_WINDOW", "60"))  # seconds


# ── Rate Limiter (In-Memory, per-IP) ───────────────────────────

class RateLimiter:
    """Simple sliding-window rate limiter."""
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        # Clean old entries
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if now - t < self.window
        ]
        if len(self.requests[client_ip]) >= self.max_requests:
            return False
        self.requests[client_ip].append(now)
        return True

_rate_limiter = RateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)


# ── Security Middleware ────────────────────────────────────────

class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Combined security middleware that enforces:
    1. IP Whitelisting (Hospital Wifi Simulation)
    2. API Key Authentication
    3. Rate Limiting
    
    Only applies to /api/ routes. Health checks and docs are exempt.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip security for non-API routes (docs, health checks)
        if not path.startswith("/api/"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"

        # ── Step 1: IP Whitelisting (Hospital Wifi Check) ──
        if TRUSTED_IPS is not None:
            # localhost variants are always trusted for development
            local_ips = {"127.0.0.1", "::1", "localhost"}
            allowed = local_ips.union(set(TRUSTED_IPS))
            
            if client_ip not in allowed:
                return JSONResponse(
                    status_code=403,
                    content={
                        "error": "ACCESS DENIED",
                        "detail": "Your device is not connected to the hospital's secure network.",
                        "client_ip": client_ip
                    }
                )

        # ── Step 2: API Key Authentication ──
        api_key = request.headers.get("X-API-Key") or request.query_params.get("api_key")
        if api_key != MEDSAFE_API_KEY:
            return JSONResponse(
                status_code=401,
                content={
                    "error": "UNAUTHORIZED",
                    "detail": "Invalid or missing API key. Include 'X-API-Key' header."
                }
            )

        # ── Step 3: Rate Limiting ──
        if not _rate_limiter.is_allowed(client_ip):
            return JSONResponse(
                status_code=429,
                content={
                    "error": "TOO MANY REQUESTS",
                    "detail": f"Rate limit exceeded. Max {RATE_LIMIT_MAX} requests per {RATE_LIMIT_WINDOW}s."
                }
            )

        # All checks passed — proceed
        response = await call_next(request)
        return response
