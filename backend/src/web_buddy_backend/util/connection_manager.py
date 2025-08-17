import asyncio
import json

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            self.active.discard(websocket)

    async def broadcast(self, event: str, data):
        # Ensure data is JSON serializable
        if hasattr(data, 'model_dump'):
            # Pydantic model - serialize properly
            data = data.model_dump(mode='json')
        payload = json.dumps({"event": event, "data": data}, ensure_ascii=False)
        dead: list[WebSocket] = []
        for ws in list(self.active):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.disconnect(ws)


WS_MANAGER = ConnectionManager()
