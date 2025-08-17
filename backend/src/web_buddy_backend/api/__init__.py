from fastapi import APIRouter

from .routes_assets import router as assets
from .routes_screens import router as screens
from .websocket import router as ws  # noqa: F401

api = APIRouter()
api.include_router(screens)
api.include_router(assets)
# WebSocket routes are included in main (need app.websocket)
