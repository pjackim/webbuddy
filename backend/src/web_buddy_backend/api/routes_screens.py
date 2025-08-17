from web_buddy_backend.models.screen_models import Screen, ScreenCreate, ScreenUpdate
from web_buddy_backend.state.memory_state import STATE
from web_buddy_backend.util.connection_manager import WS_MANAGER
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/screens", tags=["screens"])


@router.get("", response_model=list[Screen])
async def list_screens():
    return await STATE.list_screens()


@router.post("", response_model=Screen)
async def create_screen(payload: ScreenCreate):
    sc = await STATE.create_screen(payload)
    await WS_MANAGER.broadcast("screen_added", sc.model_dump())
    return sc


@router.put("/{screen_id}", response_model=Screen)
async def update_screen(screen_id: str, payload: ScreenUpdate):
    sc = await STATE.update_screen(screen_id, payload)
    if not sc:
        raise HTTPException(status_code=404, detail="Screen not found")
    await WS_MANAGER.broadcast("screen_updated", sc.model_dump())
    return sc


@router.delete("/{screen_id}")
async def delete_screen(screen_id: str):
    ok = await STATE.delete_screen(screen_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Screen not found")
    await WS_MANAGER.broadcast("screen_deleted", {"id": screen_id})
    return {"ok": True}
