import logging
from pathlib import Path

from app.api import api
from app.api.websocket import router as ws_router
from app.core.config import settings
from app.core.logging_config import configure_logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

configure_logging(logging.DEBUG if settings.ENV == "dev" else logging.INFO)
app = FastAPI(title=settings.APP_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static uploads
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# REST API
app.include_router(api, prefix="/api")

# WS (must be added on app, not APIRouter under prefix)
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
