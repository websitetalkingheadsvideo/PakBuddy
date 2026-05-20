from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Header, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import String, Text, DateTime, select, desc
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
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
MYSQL_URL = os.environ['MYSQL_URL']

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get('CORS_ORIGINS', '').split(',')
    if o.strip()
]
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '').strip()
RL_MAX = int(os.environ.get('FLEET_RATE_LIMIT_MAX', '5'))
RL_WINDOW = int(os.environ.get('FLEET_RATE_LIMIT_WINDOW_SECONDS', '3600'))
_rate_buckets: "dict[str, deque[float]]" = defaultdict(deque)

# ----- DB -----
engine = create_async_engine(
    MYSQL_URL,
    pool_recycle=1800,
    pool_size=5,
    max_overflow=10,
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


class FleetInquiryRow(Base):
    __tablename__ = "fleet_inquiries"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False, index=True)
    company: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    crews: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)


async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session


# ----- App -----
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
api_router = APIRouter(prefix="/api")


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
        if "server" in response.headers:
            del response.headers["server"]
        return response


# ----- Schemas -----
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


class FleetInquiryCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default=None, max_length=160)
    crews: Optional[str] = Field(default=None, max_length=40)
    message: Optional[str] = Field(default=None, max_length=2000)
    # Honeypot — must remain empty
    website: Optional[str] = Field(default=None, max_length=200)

    @field_validator("name", "company", "crews", "message", mode="before")
    @classmethod
    def _strip_controls(cls, v):
        if isinstance(v, str):
            return _CONTROL_CHARS.sub("", v).strip()
        return v


class FleetInquiryOut(BaseModel):
    id: str
    name: str
    email: str
    company: Optional[str] = None
    crews: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime


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


def _constant_time_eq(a: str, b: str) -> bool:
    if len(a) != len(b):
        return False
    result = 0
    for x, y in zip(a.encode(), b.encode()):
        result |= x ^ y
    return result == 0


def _require_admin(authorization: Optional[str] = Header(default=None)) -> None:
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=404, detail="Not found")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ", 1)[1].strip()
    if not _constant_time_eq(token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized")


# ----- Routes -----
@api_router.get("/")
async def root():
    return {"message": "Pak Buddy API up"}


@api_router.post("/fleet-inquiry", response_model=FleetInquiryOut)
async def create_fleet_inquiry(
    payload: FleetInquiryCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    ip = _client_ip(request)
    _rate_limit(ip)

    # Honeypot — bots fill 'website'. Accept silently, never persist.
    if payload.website:
        logger.info("Honeypot triggered ip=%s", ip)
        return FleetInquiryOut(
            id=str(uuid.uuid4()),
            name=payload.name,
            email=str(payload.email),
            company=payload.company,
            crews=payload.crews,
            message=payload.message,
            created_at=datetime.now(timezone.utc),
        )

    row = FleetInquiryRow(
        id=str(uuid.uuid4()),
        name=payload.name,
        email=str(payload.email),
        company=payload.company,
        crews=payload.crews,
        message=payload.message,
        ip=ip,
        created_at=datetime.now(timezone.utc),
    )
    session.add(row)
    await session.commit()
    logger.info("Fleet inquiry stored id=%s ip=%s", row.id, ip)
    return FleetInquiryOut(
        id=row.id,
        name=row.name,
        email=row.email,
        company=row.company,
        crews=row.crews,
        message=row.message,
        created_at=row.created_at,
    )


@api_router.get("/fleet-inquiry", response_model=List[FleetInquiryOut])
async def list_fleet_inquiries(
    _: None = Depends(_require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(FleetInquiryRow).order_by(desc(FleetInquiryRow.created_at)).limit(500)
    )
    rows = result.scalars().all()
    return [
        FleetInquiryOut(
            id=r.id,
            name=r.name,
            email=r.email,
            company=r.company,
            crews=r.crews,
            message=r.message,
            created_at=r.created_at,
        )
        for r in rows
    ]


@app.exception_handler(Exception)
async def unhandled_exc(_: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(api_router)
app.add_middleware(SecurityHeadersMiddleware)
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


@app.on_event("startup")
async def on_startup():
    # Create tables if they don't exist (safe on every restart)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Pak Buddy backend started; MySQL schema ensured.")


@app.on_event("shutdown")
async def on_shutdown():
    await engine.dispose()
