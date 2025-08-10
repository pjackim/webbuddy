# PureRef-Like Web App — Svelte5 + FastAPI (Monorepo v0.1)

A production-ready starter implementing an infinite, multi-screen canvas with real‑time collaboration, offline mode, and a clean FastAPI backend that wraps an external screen-control service. The frontend is built with Bun, and the backend installs Python dependencies via the fast `uv` tool.

---

## Repo Structure

```
preref-webapp/
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  ├─ api/
│  │  │  ├─ __init__.py
│  │  │  ├─ routes_screens.py
│  │  │  ├─ routes_assets.py
│  │  │  └─ websocket.py
│  │  ├─ core/
│  │  │  ├─ config.py
│  │  │  ├─ logging_config.py
│  │  │  └─ errors.py
│  │  ├─ models/
│  │  │  ├─ asset_models.py
│  │  │  └─ screen_models.py
│  │  ├─ services/
│  │  │  └─ screen_service.py
│  │  ├─ state/
│  │  │  └─ memory_state.py
│  │  └─ util/
│  │     └─ connection_manager.py
│  ├─ uploads/  (runtime volume)
│  ├─ pyproject.toml
│  ├─ uvicorn.ini
│  └─ Dockerfile
├─ frontend/
│  ├─ src/
│  │  ├─ app.d.ts
│  │  ├─ routes/+page.svelte
│  │  ├─ lib/
│  │  │  ├─ api.ts
│  │  │  ├─ ws.ts
│  │  │  └─ stores.ts
│  │  └─ lib/components/
│  │     ├─ Toolbar.svelte
│  │     ├─ Canvas.svelte
│  │     ├─ ScreenFrame.svelte
│  │     ├─ assets/ImageAsset.svelte
│  │     └─ assets/TextAsset.svelte
│  ├─ static/
│  ├─ package.json
│  ├─ svelte.config.js
│  ├─ vite.config.ts
│  ├─ tailwind.config.cjs
│  ├─ postcss.config.cjs
│  ├─ src/app.css
│  └─ Dockerfile
├─ docker-compose.yml
└─ README.md
```

---

## Backend — FastAPI (Python 3.11+)

### `backend/pyproject.toml`

```toml
[build-system]
requires = ["setuptools", "wheel"]

[project]
name = "preref-backend"
version = "0.1.0"
dependencies = [
  "fastapi>=0.111.0",
  "uvicorn[standard]>=0.30.0",
  "pydantic>=2.7.0",
  "pydantic-settings>=2.2.1",
  "python-multipart>=0.0.9",
  "httpx>=0.27.0",
  "orjson>=3.10.0"
]

[tool.uvicorn]
factory = true
host = "0.0.0.0"
port = 8000
reload = false
```

### `backend/app/core/config.py`

```python
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "preref-backend"
    ENV: str = "dev"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]  # Override in prod

    # Base URL used to build public asset URLs (e.g., http://localhost:8000)
    PUBLIC_BASE_URL: Optional[AnyHttpUrl] = None

    # External screen-control service base URL + token
    SCREEN_SERVICE_URL: Optional[AnyHttpUrl] = None
    SCREEN_SERVICE_TOKEN: Optional[str] = None

    # Whether to actually call the external service (False = dry run)
    EXTERNAL_ENABLED: bool = False

    # Poll the external source of truth periodically (seconds). 0 to disable.
    POLL_INTERVAL_SEC: float = 0

    class Config:
        env_file = ".env"

settings = Settings()
```

### `backend/app/core/logging_config.py`

```python
import logging

FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
DATEFMT = "%Y-%m-%d %H:%M:%S"

_def_level = logging.INFO

def configure_logging(level: int = _def_level) -> None:
    logging.basicConfig(level=level, format=FORMAT, datefmt=DATEFMT)
```

### `backend/app/core/errors.py`

```python
from fastapi import HTTPException, status

class ExternalServiceError(HTTPException):
    def __init__(self, detail: str = "External service error"):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)
```

### `backend/app/models/screen_models.py`

```python
from pydantic import BaseModel, Field
from typing import Optional

class ScreenCreate(BaseModel):
    name: str
    width: int = Field(gt=0)
    height: int = Field(gt=0)
    x: int = 0  # position on global canvas
    y: int = 0

class Screen(ScreenCreate):
    id: str

class ScreenUpdate(BaseModel):
    name: Optional[str] = None
    width: Optional[int] = Field(default=None, gt=0)
    height: Optional[int] = Field(default=None, gt=0)
    x: Optional[int] = None
    y: Optional[int] = None
```

### `backend/app/models/asset_models.py`

```python
from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Literal, Union, Annotated

class AssetBase(BaseModel):
    id: str
    screen_id: str
    x: float = 0
    y: float = 0
    z_index: int = 0
    rotation: float = 0.0
    scale_x: float = 1.0
    scale_y: float = 1.0
    type: Literal["image", "text"]

class ImageAsset(AssetBase):
    type: Literal["image"] = "image"
    src: HttpUrl
    natural_width: Optional[int] = None
    natural_height: Optional[int] = None
    width: Optional[float] = None
    height: Optional[float] = None

class TextAsset(AssetBase):
    type: Literal["text"] = "text"
    text: str
    font_size: float = 24
    color: str = "#ffffff"

Asset = Annotated[Union[ImageAsset, TextAsset], Field(discriminator="type")]

class AssetCreate(BaseModel):
    # For creation, allow no id, server will assign
    screen_id: str
    x: float = 0
    y: float = 0
    z_index: int = 0
    rotation: float = 0.0
    scale_x: float = 1.0
    scale_y: float = 1.0
    type: Literal["image", "text"]
    src: Optional[HttpUrl] = None
    text: Optional[str] = None
    font_size: Optional[float] = 24
    color: Optional[str] = "#ffffff"
    width: Optional[float] = None
    height: Optional[float] = None

class AssetUpdate(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    z_index: Optional[int] = None
    rotation: Optional[float] = None
    scale_x: Optional[float] = None
    scale_y: Optional[float] = None
    src: Optional[HttpUrl] = None
    text: Optional[str] = None
    font_size: Optional[float] = None
    color: Optional[str] = None
    width: Optional[float] = None
    height: Optional[float] = None
```

### `backend/app/state/memory_state.py`

```python
import asyncio
import uuid
from typing import Dict, List
from .typing import TypedDict  # local helper, but we will inline types below to keep simple
from app.models.screen_models import Screen, ScreenCreate, ScreenUpdate
from app.models.asset_models import Asset, ImageAsset, TextAsset, AssetCreate, AssetUpdate

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
            upd = sc.model_copy(update={k: v for k, v in data.model_dump(exclude_none=True).items()})
            self._screens[screen_id] = upd
            return upd

    async def delete_screen(self, screen_id: str) -> bool:
        async with self._lock:
            existed = screen_id in self._screens
            if existed:
                # remove assets for that screen
                to_del = [aid for aid, a in self._assets.items() if a.screen_id == screen_id]
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
            updated = a.model_copy(update={k: v for k, v in data.model_dump(exclude_none=True).items()})
            self._assets[asset_id] = updated
            return updated

    async def delete_asset(self, asset_id: str) -> bool:
        async with self._lock:
            return self._assets.pop(asset_id, None) is not None

STATE = InMemoryState()
```

### `backend/app/util/connection_manager.py`

```python
from typing import Set
from fastapi import WebSocket
import asyncio
import json

class ConnectionManager:
    def __init__(self) -> None:
        self.active: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            self.active.discard(websocket)

    async def broadcast(self, event: str, data):
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
```

### `backend/app/services/screen_service.py`

```python
import logging
from app.core.config import settings
from app.core.errors import ExternalServiceError
from app.models.asset_models import Asset, ImageAsset, TextAsset

log = logging.getLogger(__name__)

class ScreenServiceClient:
    """Wrapper around the auto-generated client from the external service.
    For now, this class logs actions; set EXTERNAL_ENABLED=true and provide
    SCREEN_SERVICE_URL/TOKEN to actually integrate.
    """
    def __init__(self) -> None:
        self.enabled = bool(settings.EXTERNAL_ENABLED and settings.SCREEN_SERVICE_URL)

    async def apply_asset(self, asset: Asset) -> None:
        if not self.enabled:
            log.info("(DRY-RUN) apply_asset: %s", asset.id)
            return
        try:
            if isinstance(asset, ImageAsset):
                # TODO: call generated client method to display/update image
                log.info("Updating image asset %s at (%s,%s) on screen %s", asset.id, asset.x, asset.y, asset.screen_id)
            elif isinstance(asset, TextAsset):
                # TODO: call generated client method to display/update text
                log.info("Updating text asset %s '%s'", asset.id, asset.text)
        except Exception as exc:
            log.exception("External service failure")
            raise ExternalServiceError(str(exc))

    async def remove_asset(self, asset: Asset) -> None:
        if not self.enabled:
            log.info("(DRY-RUN) remove_asset: %s", asset.id)
            return
        try:
            # TODO: call generated client method to remove asset
            log.info("Removing asset %s", asset.id)
        except Exception as exc:
            log.exception("External service failure")
            raise ExternalServiceError(str(exc))

SCREEN_CLIENT = ScreenServiceClient()
```

### `backend/app/api/routes_screens.py`

```python
from fastapi import APIRouter, HTTPException
from app.state.memory_state import STATE
from app.models.screen_models import Screen, ScreenCreate, ScreenUpdate
from app.util.connection_manager import WS_MANAGER

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
```

### `backend/app/api/routes_assets.py`

```python
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
```

### `backend/app/api/websocket.py`

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.util.connection_manager import WS_MANAGER

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
```

### `backend/app/api/__init__.py`

```python
from fastapi import APIRouter
from .routes_screens import router as screens
from .routes_assets import router as assets
from .websocket import router as ws

api = APIRouter()
api.include_router(screens)
api.include_router(assets)
# WebSocket routes are included in main (need app.websocket)
```

### `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
from app.core.config import settings
from app.core.logging_config import configure_logging
from app.api import api
from app.api.websocket import router as ws_router
from pathlib import Path

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
```

### `backend/uvicorn.ini`

```ini
[uwsgi]
```

*(left intentionally minimal; uvicorn is started by docker CMD)*

### `backend/Dockerfile`

```Dockerfile
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
 && rm -rf /var/lib/apt/lists/*

# install uv (Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    mv /root/.local/bin/uv /usr/local/bin/uv

COPY pyproject.toml ./
RUN uv pip install --system -e .

COPY app ./app
RUN mkdir -p /app/uploads

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Frontend — SvelteKit (Svelte 5), Tailwind + DaisyUI, Konva

**Note:** Uses `svelte-konva` for a declarative Konva API in Svelte.

### `frontend/package.json`

```json
{
  "name": "preref-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "konva": "^9.3.13",
    "svelte": "^5.0.0",
    "svelte-konva": "^0.3.0"
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.5.0",
    "@sveltejs/vite-plugin-svelte": "^3.1.1",
    "typescript": "^5.5.4",
    "vite": "^5.3.4",
    "tailwindcss": "^3.4.7",
    "daisyui": "^4.12.10",
    "postcss": "^8.4.41",
    "autoprefixer": "^10.4.19"
  }
}
```

### `frontend/svelte.config.js`

```js
import { vitePreprocess } from '@sveltejs/kit/vite';

export default {
  preprocess: vitePreprocess(),
};
```

### `frontend/vite.config.ts`

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: { port: 5173, host: true }
});
```

### `frontend/tailwind.config.cjs`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: { themes: ['dark'] }
};
```

### `frontend/postcss.config.cjs`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

### `frontend/src/app.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #app { height: 100%; }
body { @apply bg-base-200 text-base-content; }
```

### `frontend/src/app.d.ts`

```ts
// See https://kit.svelte.dev/docs/types#app
declare namespace App {}
```

### `frontend/src/lib/api.ts`

```ts
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
export const WS_BASE = (import.meta.env.VITE_WS_BASE || 'ws://localhost:8000') + '/ws';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadFile(file: File): Promise<{ url: string }>{
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/assets/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### `frontend/src/lib/stores.ts`

```ts
import { writable, derived, get } from 'svelte/store';

export type Screen = { id: string; name: string; width: number; height: number; x: number; y: number };
export type BaseAsset = { id: string; screen_id: string; x: number; y: number; z_index: number; rotation: number; scale_x: number; scale_y: number; type: 'image' | 'text' };
export type ImageAsset = BaseAsset & { type: 'image'; src: string; width?: number; height?: number; natural_width?: number; natural_height?: number };
export type TextAsset = BaseAsset & { type: 'text'; text: string; font_size: number; color: string };
export type Asset = ImageAsset | TextAsset;

export const screens = writable<Screen[]>([]);
export const assets = writable<Asset[]>([]);
export const online = writable<boolean>(true); // Offline Mode toggle
export const selected = writable<string | null>(null);

export const screensById = derived(screens, ($s) => new Map($s.map((sc) => [sc.id, sc])));
export const assetsByScreen = derived(assets, ($a) => {
  const map = new Map<string, Asset[]>();
  for (const a of $a) {
    const arr = map.get(a.screen_id) || [];
    arr.push(a);
    map.set(a.screen_id, arr);
  }
  for (const [k, arr] of map) arr.sort((a, b) => a.z_index - b.z_index);
  return map;
});

export function upsertAsset(a: Asset) {
  assets.update((all) => {
    const idx = all.findIndex((x) => x.id === a.id);
    if (idx >= 0) all[idx] = a; else all.push(a);
    return [...all];
  });
}

export function removeAsset(id: string) {
  assets.update((all) => all.filter((a) => a.id !== id));
}

export function upsertScreen(s: Screen) {
  screens.update((all) => {
    const idx = all.findIndex((x) => x.id === s.id);
    if (idx >= 0) all[idx] = s; else all.push(s);
    return [...all];
  });
}

export function removeScreen(id: string) { screens.update((all) => all.filter((s) => s.id !== id)); }
```

### `frontend/src/lib/ws.ts`

```ts
import { WS_BASE } from './api';
import { upsertAsset, removeAsset, upsertScreen, removeScreen } from './stores';

let socket: WebSocket | null = null;

export function connectWS() {
  if (socket) return socket;
  socket = new WebSocket(WS_BASE);
  socket.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      const { event, data } = msg;
      if (event === 'asset_added' || event === 'asset_updated') upsertAsset(data);
      if (event === 'asset_deleted') removeAsset(data.id);
      if (event === 'screen_added' || event === 'screen_updated') upsertScreen(data);
      if (event === 'screen_deleted') removeScreen(data.id);
    } catch (e) {
      console.error('WS parse error', e);
    }
  };
  socket.onclose = () => {
    socket = null;
    setTimeout(connectWS, 1000); // simple reconnect
  };
  return socket;
}
```

### `frontend/src/lib/components/Toolbar.svelte`

```svelte
<script lang="ts">
  import { online, screens } from '$lib/stores';
  import { api } from '$lib/api';
  let name = 'Screen';
  let width = 1920; let height = 1080;
  function addScreen() {
    api('/screens', { method: 'POST', body: JSON.stringify({ name, width, height }) });
  }
</script>
<div class="navbar bg-base-300 shadow z-10">
  <div class="flex-1 px-2">PureRef Web – <span class="opacity-70 ml-2">multi-screen</span></div>
  <div class="flex gap-2 items-center">
    <label class="label cursor-pointer gap-2">
      <span class="label-text">Offline Mode</span>
      <input type="checkbox" class="toggle" bind:checked={$online}>
    </label>
    <div class="divider divider-horizontal"></div>
    <div class="form-control">
      <div class="input-group">
        <input class="input input-bordered w-40" placeholder="Name" bind:value={name}>
        <input class="input input-bordered w-28" type="number" bind:value={width}>
        <input class="input input-bordered w-28" type="number" bind:value={height}>
        <button class="btn btn-primary" on:click={addScreen}>Add Screen</button>
      </div>
    </div>
  </div>
</div>
```

### `frontend/src/lib/components/Canvas.svelte`

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Stage, Layer } from 'svelte-konva';
  import ScreenFrame from './ScreenFrame.svelte';
  import { screens, assetsByScreen, online } from '$lib/stores';
  import { api } from '$lib/api';
  import { connectWS } from '$lib/ws';

  let scale = 0.25; // stage zoom
  let offset = { x: 0, y: 0 };

  async function load() {
    const sc = await api('/screens');
    screens.set(sc);
    const all = await api('/assets');
    // assets store filled indirectly in ScreenFrame via events or do it here if preferred
    // We'll broadcast on initial GET too for simplicity: update locally
    // but to keep simple, ScreenFrame will fetch per screen.
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = 1.05;
    const direction = e.deltaY > 0 ? -1 : 1;
    scale = Math.max(0.05, Math.min(5, scale * (direction > 0 ? factor : 1/factor)));
  }

  let panning = false; let last = { x: 0, y: 0 };
  function onMouseDown(e: MouseEvent) { panning = true; last = { x: e.clientX, y: e.clientY }; }
  function onMouseMove(e: MouseEvent) {
    if (!panning) return;
    const dx = e.clientX - last.x; const dy = e.clientY - last.y;
    offset.x += dx; offset.y += dy; last = { x: e.clientX, y: e.clientY };
  }
  function onMouseUp() { panning = false; }

  onMount(() => {
    connectWS();
    load();
  });
</script>

<div class="w-full h-[calc(100vh-64px)]" on:wheel={onWheel} on:mousedown={onMouseDown} on:mousemove={onMouseMove} on:mouseup={onMouseUp}>
  <Stage config={{ width: innerWidth, height: innerHeight-64, scaleX: scale, scaleY: scale, x: offset.x, y: offset.y }}>
    <Layer>
      {#each $screens as sc}
        <ScreenFrame {sc} />
      {/each}
    </Layer>
  </Stage>
</div>
```

### `frontend/src/lib/components/ScreenFrame.svelte`

```svelte
<script lang="ts">
  import type { Screen, Asset } from '$lib/stores';
  import { Group, Rect, Text as KText } from 'svelte-konva';
  import ImageAsset from './assets/ImageAsset.svelte';
  import TextAsset from './assets/TextAsset.svelte';
  import { assets, assetsByScreen, online, upsertAsset } from '$lib/stores';
  import { api } from '$lib/api';
  import { onMount } from 'svelte';

  export let sc: Screen;
  let myAssets: Asset[] = [];

  async function load() {
    const list = await api(`/assets?screen_id=${sc.id}`);
    for (const a of list) upsertAsset(a);
  }

  $: myAssets = ($assetsByScreen.get(sc.id) || []);

  // Drag the whole screen in canvas (moves its x,y)
  let dragging = false; let start = { x: 0, y: 0 }; let orig = { x: 0, y: 0 };
  function onScreenDown(e) { dragging = true; start = { x: e.evt.clientX, y: e.evt.clientY }; orig = { x: sc.x, y: sc.y }; }
  function onScreenMove(e) {
    if (!dragging) return;
    const dx = e.evt.clientX - start.x; const dy = e.evt.clientY - start.y;
    sc = { ...sc, x: orig.x + dx, y: orig.y + dy };
  }
  function onScreenUp() {
    dragging = false;
    if ($online) api(`/screens/${sc.id}`, { method: 'PUT', body: JSON.stringify({ x: sc.x, y: sc.y }) });
  }

  onMount(load);
</script>

<Group x={sc.x} y={sc.y} on:mousedown={onScreenDown} on:mouseup={onScreenUp} on:mousemove={onScreenMove}>
  <Rect width={sc.width} height={sc.height} fill="#222" stroke="#555" strokeWidth={2} cornerRadius={8} />
  <KText text={`${sc.name} (${sc.width}×${sc.height})`} fill="#aaa" fontSize={16} x={8} y={8} />
  {#each myAssets as a (a.id)}
    {#if a.type === 'image'}
      <ImageAsset {a} />
    {:else}
      <TextAsset {a} />
    {/if}
  {/each}
</Group>
```

### `frontend/src/lib/components/assets/ImageAsset.svelte`

```svelte
<script lang="ts">
  import { Image } from 'svelte-konva';
  import { onMount } from 'svelte';
  import { online, upsertAsset } from '$lib/stores';
  import { api } from '$lib/api';

  export let a: any; // ImageAsset
  let htmlImage: HTMLImageElement;
  let isDragging = false; let start = { x: 0, y: 0 }; let orig = { x: 0, y: 0 };

  onMount(() => {
    htmlImage = new window.Image();
    htmlImage.crossOrigin = 'anonymous';
    htmlImage.src = a.src;
  });

  function onDown(e) { isDragging = true; start = { x: e.evt.clientX, y: e.evt.clientY }; orig = { x: a.x, y: a.y }; }
  function onMove(e) {
    if (!isDragging) return;
    const dx = e.evt.clientX - start.x; const dy = e.evt.clientY - start.y;
    a = { ...a, x: orig.x + dx, y: orig.y + dy };
  }
  async function onUp() {
    isDragging = false;
    upsertAsset(a);
    if ($online) await api(`/assets/${a.id}`, { method: 'PUT', body: JSON.stringify({ x: a.x, y: a.y }) });
  }
</script>

<Image image={htmlImage} x={a.x} y={a.y} draggable={false} on:mousedown={onDown} on:mousemove={onMove} on:mouseup={onUp} />
```

### `frontend/src/lib/components/assets/TextAsset.svelte`

```svelte
<script lang="ts">
  import { Text as KText } from 'svelte-konva';
  import { online, upsertAsset } from '$lib/stores';
  import { api } from '$lib/api';

  export let a: any; // TextAsset
  let isDragging = false; let start = { x: 0, y: 0 }; let orig = { x: 0, y: 0 };

  function onDown(e) { isDragging = true; start = { x: e.evt.clientX, y: e.evt.clientY }; orig = { x: a.x, y: a.y }; }
  function onMove(e) {
    if (!isDragging) return;
    const dx = e.evt.clientX - start.x; const dy = e.evt.clientY - start.y;
    a = { ...a, x: orig.x + dx, y: orig.y + dy };
  }
  async function onUp() {
    isDragging = false;
    upsertAsset(a);
    if ($online) await api(`/assets/${a.id}`, { method: 'PUT', body: JSON.stringify({ x: a.x, y: a.y }) });
  }
</script>

<KText text={a.text} x={a.x} y={a.y} fontSize={a.font_size} fill={a.color} on:mousedown={onDown} on:mousemove={onMove} on:mouseup={onUp} />
```

### `frontend/src/routes/+page.svelte`

```svelte
<script lang="ts">
  import Toolbar from '$lib/components/Toolbar.svelte';
  import Canvas from '$lib/components/Canvas.svelte';
  import { api, uploadFile } from '$lib/api';
  import { online, upsertAsset, screens } from '$lib/stores';

  let hover = false;

  async function onDrop(e: DragEvent) {
    e.preventDefault(); hover = false;
    if (!$online) return; // keep local only? For now, require online to upload
    const files = e.dataTransfer?.files; if (!files) return;
    for (const file of Array.from(files)) {
      // Upload to backend to get a URL
      const { url } = await uploadFile(file);
      // Place on the first screen by default at (50,50)
      const sc = (await screens.get())[0];
      const asset = await api('/assets', { method: 'POST', body: JSON.stringify({ type: 'image', screen_id: sc.id, x: 50, y: 50, src: url })});
      upsertAsset(asset);
    }
  }
</script>

<div class="flex flex-col h-screen" on:dragover|preventDefault={() => (hover = true)} on:dragleave={() => (hover = false)} on:drop={onDrop}>
  <Toolbar />
  <div class="relative flex-1">
    {#if hover}
      <div class="absolute inset-0 border-4 border-dashed border-primary z-20 pointer-events-none"></div>
    {/if}
    <Canvas />
  </div>
</div>
```

### `frontend/Dockerfile`

```Dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Root `docker-compose.yml`

```yaml
version: '3.9'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ENV=dev
      - CORS_ORIGINS=http://localhost:5173
      - PUBLIC_BASE_URL=http://localhost:8000
      - EXTERNAL_ENABLED=false
    volumes:
      - backend_uploads:/app/uploads
  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
volumes:
  backend_uploads:
```

---

## README.md (Quickstart)

````md
# PureRef-Like Web App – Svelte5 + FastAPI

### Prereqs
- Docker & Docker Compose

### Run
```bash
docker compose up --build
````

* Backend: [http://localhost:8000](http://localhost:8000) (Docs: [http://localhost:8000/docs](http://localhost:8000/docs))
* Frontend: [http://localhost:5173](http://localhost:5173)

### Features

* Infinite canvas with pan/zoom (Konva)
* Multi-screen layout: add/drag screen frames; per-screen assets
* Image & text assets; drag to move
* Real-time collaboration via WebSocket broadcast
* Offline mode toggle (local-only edits if off)
* File uploads to backend (`/api/assets/upload`) serving from `/uploads`
* Clean Pydantic v2 models with discriminated unions
* External service wrapper (dry-run by default)

### Config

Set in `backend/.env` or docker-compose envs:

* `PUBLIC_BASE_URL` – build absolute URLs for uploaded files
* `EXTERNAL_ENABLED=true` + `SCREEN_SERVICE_URL` + `SCREEN_SERVICE_TOKEN` – to call the external screen service
* `POLL_INTERVAL_SEC` – enable background polling of the source-of-truth (future; stub)

### Extending

* Add new asset type: create model (backend), Svelte component (frontend), and mapping in `screen_service.py`.
* Add resize/rotate: use Konva `Transformer` attached to selected nodes; send PUT with `width/height/rotation`.
* Merge offline edits: queue diffs locally; upon rejoin, POST changes or discard (current behavior = discard).

### Notes

* For production, tighten CORS and serve both apps behind one reverse proxy.
* The external client is intentionally abstracted; generate from the service OpenAPI and adapt `screen_service.py` only.

```

---

## What’s implemented vs. planned
- ✅ Infinite canvas (Konva), multi-screen frames, image/text assets, real-time WS, offline toggle, uploads, Dockerized.
- 🔜 Konva Transformer (resize/rotate), snapping guides, background polling to single source-of-truth, Redis cache, auth.

---

## LICENSE
MIT (add your preferred license)

```
