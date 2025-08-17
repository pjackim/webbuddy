import asyncio
import uuid
from typing import Dict, List

from app.models.asset_models import (
    Asset,
    AssetCreate,
    AssetUpdate,
    ImageAsset,
    TextAsset,
    VideoAsset,
)
from app.models.screen_models import Screen, ScreenCreate, ScreenUpdate


class InMemoryState:
    def __init__(self) -> None:
        self._screens: Dict[str, Screen] = {}
        self._assets: Dict[str, Asset] = {}
        self._lock = asyncio.Lock()

    async def list_screens(self) -> List[Screen]:
        return list(self._screens.values())

    async def get_screen(self, screen_id: str) -> Screen | None:
        return self._screens.get(screen_id)

    async def create_screen(self, data: ScreenCreate) -> Screen:
        async with self._lock:
            sid = str(uuid.uuid4())
            screen = Screen(id=sid, **data.model_dump())
            self._screens[sid] = screen
            return screen

    async def update_screen(self, screen_id: str, data: ScreenUpdate) -> Screen | None:
        async with self._lock:
            sc = self._screens.get(screen_id)
            if not sc:
                return None
            upd = sc.model_copy(
                update={k: v for k, v in data.model_dump(exclude_none=True).items()}
            )
            self._screens[screen_id] = upd
            return upd

    async def delete_screen(self, screen_id: str) -> bool:
        async with self._lock:
            existed = screen_id in self._screens
            if existed:
                # remove assets for that screen
                to_del = [
                    aid for aid, a in self._assets.items() if a.screen_id == screen_id
                ]
                for aid in to_del:
                    self._assets.pop(aid, None)
                self._screens.pop(screen_id, None)
            return existed

    async def list_assets(self, screen_id: str | None = None) -> List[Asset]:
        vals = list(self._assets.values())
        return [a for a in vals if (screen_id is None or a.screen_id == screen_id)]

    async def create_asset(self, data: AssetCreate) -> Asset:
        async with self._lock:
            aid = str(uuid.uuid4())
            if data.type == "image":
                asset: Asset = ImageAsset(id=aid, **data.model_dump())  # type: ignore
            elif data.type == "video":
                asset = VideoAsset(id=aid, **data.model_dump())  # type: ignore
            else:
                # default for text specifics
                payload = data.model_dump()
                payload.setdefault("text", "New Text")
                asset = TextAsset(id=aid, **payload)  # type: ignore
            self._assets[aid] = asset
            return asset

    async def update_asset(self, asset_id: str, data: AssetUpdate) -> Asset | None:
        async with self._lock:
            a = self._assets.get(asset_id)
            if not a:
                return None
            updated = a.model_copy(
                update={k: v for k, v in data.model_dump(exclude_none=True).items()}
            )
            self._assets[asset_id] = updated
            return updated

    async def delete_asset(self, asset_id: str) -> bool:
        async with self._lock:
            return self._assets.pop(asset_id, None) is not None


STATE = InMemoryState()
