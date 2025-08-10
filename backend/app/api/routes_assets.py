from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uuid
from app.core.config import settings
from app.state.memory_state import STATE
from app.models.asset_models import Asset, AssetCreate, AssetUpdate
from app.util.connection_manager import WS_MANAGER
from app.services.screen_service import SCREEN_CLIENT

router = APIRouter(prefix="/assets", tags=["assets"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Expose uploads as static at /uploads (mounted in main)

@router.get("", response_model=list[Asset])
async def list_assets(screen_id: str | None = None):
    return await STATE.list_assets(screen_id)

@router.post("", response_model=Asset)
async def create_asset(payload: AssetCreate):
    # TODO: validate screen exists
    asset = await STATE.create_asset(payload)
    await SCREEN_CLIENT.apply_asset(asset)
    await WS_MANAGER.broadcast("asset_added", asset.model_dump())
    return asset

@router.put("/{asset_id}", response_model=Asset)
async def update_asset(asset_id: str, payload: AssetUpdate):
    asset = await STATE.update_asset(asset_id, payload)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    await SCREEN_CLIENT.apply_asset(asset)
    await WS_MANAGER.broadcast("asset_updated", asset.model_dump())
    return asset

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    # capture snapshot for external removal
    existing = [a for a in await STATE.list_assets() if a.id == asset_id]
    ok = await STATE.delete_asset(asset_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Asset not found")
    if existing:
        await SCREEN_CLIENT.remove_asset(existing[0])
    await WS_MANAGER.broadcast("asset_deleted", {"id": asset_id})
    return {"ok": True}

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix or ".bin"
    name = f"{uuid.uuid4()}{suffix}"
    dest = UPLOAD_DIR / name
    content = await file.read()
    dest.write_bytes(content)
    if settings.PUBLIC_BASE_URL:
        url = f"{settings.PUBLIC_BASE_URL.rstrip('/')}/uploads/{name}"
    else:
        url = f"/uploads/{name}"
    return JSONResponse({"url": url, "filename": file.filename})
