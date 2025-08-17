from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from web_buddy_backend.util.connection_manager import WS_MANAGER

router = APIRouter()


@router.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await WS_MANAGER.connect(websocket)
    try:
        while True:
            # We don't expect messages from client yet; keep alive by awaiting
            await websocket.receive_text()
    except WebSocketDisconnect:
        await WS_MANAGER.disconnect(websocket)
    except Exception:
        await WS_MANAGER.disconnect(websocket)
