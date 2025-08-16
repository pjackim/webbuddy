import logging
from pathlib import Path

from app.api import api
from app.api.websocket import router as ws_router
from app.core.config import settings
from app.core.logging_config import configure_logging

# from app.models.screen_models import ScreenCreate  # removed: no default seeding
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import (
    get_swagger_ui_html,
)
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

configure_logging(logging.DEBUG if settings.ENV == "dev" else logging.INFO)
# Disable default docs so we can provide a customized /docs route below
app = FastAPI(title=settings.APP_NAME, docs_url=None, redoc_url=None)

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

# Static assets (e.g., custom Swagger CSS)
STATIC_DIR = Path(__file__).resolve().parent / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# REST API
app.include_router(api, prefix="/api")

# WS (must be added on app, not APIRouter under prefix)
app.include_router(ws_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
async def seed_default_data() -> None:
    # Do not auto-create a default screen.
    # Startup only ensures storage dirs exist (handled above).
    return None


@app.get("/docs", include_in_schema=False)
def custom_swagger_ui() -> HTMLResponse:
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title="Web Buddy Docs",
        # use the v5 bundle so selectors are consistent
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        # point to our overrides (which import the base CSS)
        swagger_css_url="/static/swagger-docs.css",
        swagger_ui_parameters={
            # dark code blocks
            "syntaxHighlight.theme": "monokai",
            # (optional) a couple nice defaults
            "displayRequestDuration": True,
            "tryItOutEnabled": True,
        },
    )


def create_app() -> FastAPI:
    """Factory function for Uvicorn's factory mode.

    Returns the already-initialized FastAPI application instance.
    """
    return app
