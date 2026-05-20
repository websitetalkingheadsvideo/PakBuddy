from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Header, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import time
from collections import defaultdict, deque
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ----- Config -----
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Explicit origin allow-list. No wildcard default.
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get('CORS_ORIGINS', '').split(',')
    if o.strip()
]

# Admin token to gate read endpoints. If unset, listing is disabled entirely.
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '').strip()

# Rate limiting (per IP, sliding window)
RL_MAX = int(os.environ.get('FLEET_RATE_LIMIT_MAX', '5'))
RL_WINDOW = int(os.environ.get('FLEET_RATE_LIMIT_WINDOW_SECONDS', '3600'))
_rate_buckets: "dict[str, deque[float]]" = defaultdict(deque)


app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
api_router = APIRouter(prefix="/api")


# ----- Security headers middleware -----
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=()"
        )
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        # Remove server identity
        if "server" in response.headers:
            del response.headers["server"]
        return response


# ----- Models -----
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _clean(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return _CONTROL_CHARS.sub("", value).strip()


class FleetInquiryCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")  # reject unknown fields

    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default=None, max_length=160)
    crews: Optional[str] = Field(default=None, max_length=40)
    message: Optional[str] = Field(default=None, max_length=2000)
    # Honeypot: must be empty. Bots fill it out.
    website: Optional[str] = Field(default=None, max_length=200)

    @field_validator("name", "company", "crews", "message", mode="before")
    @classmethod
    def _strip_controls(cls, v):
        if isinstance(v, str):
            return _CONTROL_CHARS.sub("", v).strip()
        return v


class FleetInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    company: Optional[str] = None
    crews: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ----- Helpers -----
def _client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _rate_limit(ip: str) -> None:
    now = time.time()
    bucket = _rate_buckets[ip]
    cutoff = now - RL_WINDOW
    while bucket and bucket[0] < cutoff:
        bucket.popleft()
    if len(bucket) >= RL_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )
    bucket.append(now)


def _require_admin(authorization: Optional[str] = Header(default=None)) -> None:
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=404, detail="Not found")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ", 1)[1].strip()
    # constant-time compare
    if not _constant_time_eq(token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized")


def _constant_time_eq(a: str, b: str) -> bool:
    if len(a) != len(b):
        return False
    result = 0
    for x, y in zip(a.encode(), b.encode()):
        result |= x ^ y
    return result == 0


# ----- Routes -----
@api_router.get("/")
async def root():
    return {"message": "Pak Buddy API up"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(_: None = Depends(_require_admin)):
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/fleet-inquiry", response_model=FleetInquiry)
async def create_fleet_inquiry(payload: FleetInquiryCreate, request: Request):
    ip = _client_ip(request)
    _rate_limit(ip)

    # Honeypot: silently accept but discard
    if payload.website:
        logger.info("Honeypot triggered from ip=%s", ip)
        # Return a plausible-looking response without persisting
        return FleetInquiry(
            name=payload.name,
            email=payload.email,
            company=payload.company,
            crews=payload.crews,
            message=payload.message,
        )

    inquiry = FleetInquiry(
        name=payload.name,
        email=str(payload.email),
        company=payload.company,
        crews=payload.crews,
        message=payload.message,
    )
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.fleet_inquiries.insert_one(doc)
    logger.info("Fleet inquiry stored id=%s ip=%s", inquiry.id, ip)
    return inquiry


@api_router.get("/fleet-inquiry", response_model=List[FleetInquiry])
async def list_fleet_inquiries(_: None = Depends(_require_admin)):
    rows = await db.fleet_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for r in rows:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return rows


# Generic JSON error handler — no stack traces or internals leak
@app.exception_handler(Exception)
async def unhandled_exc(_: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(api_router)
app.add_middleware(SecurityHeadersMiddleware)

# CORS — strict allow-list. If env unset, no cross-origin is permitted.
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=ALLOWED_ORIGINS or [],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("pakbuddy")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
