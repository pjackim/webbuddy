# AI agent guide for this repo

Purpose: Give AI coding agents just enough project-specific context to make correct edits fast. Keep changes aligned with the stack and conventions below.

## Stack and boundaries
- Frontend: SvelteKit (Svelte 5), TypeScript, Vite 7, Tailwind v4 + DaisyUI, Vitest (+ Playwright browser env). Package runner: bun.
- Backend: FastAPI, Pydantic v2, Uvicorn. In-memory state (no DB). Package runner: uv or dockerized uvicorn.
- Do not add alternative tools (no npm/yarn/pip if bun/uv are available). Keep OpenAPI valid at /openapi.json and docs at /docs.

## Architecture map (read these first)
- Backend
  - App entry: backend/app/main.py (CORS, /uploads static, REST under /api, WS under /ws) → includes routers from backend/app/api.
  - Routers: backend/app/api/routes_screens.py (/api/screens) and routes_assets.py (/api/assets); websocket.py exposes /ws on app root (not under /api).
  - Models: backend/app/models/{screen_models.py,asset_models.py} with Pydantic v2; Asset is a discriminated union by type.
  - State: backend/app/state/memory_state.py (thread-safe via asyncio.Lock); all CRUD uses this singleton STATE.
  - Integration: backend/app/services/screen_service.py (ScreenServiceClient) is a dry-run wrapper unless EXTERNAL_ENABLED=true.
  - WS fanout: backend/app/util/connection_manager.py (broadcast JSON {event,data}).
- Frontend
  - HTTP/WS helpers: frontend/src/lib/{api.ts,ws.ts}.
  - State: frontend/src/lib/stores.ts (assets, screens; z_index sorting per screen; upsert/remove helpers).
  - UI: frontend/src/lib/components/{Canvas.svelte,ScreenFrame.svelte,Toolbar.svelte} and assets/* for specific renderers.

## Data contracts and events
- REST base: API_BASE = env VITE_API_BASE or http://localhost:8000/api
  - Screens: GET/POST/PUT/DELETE /api/screens and /api/screens/{id}
    - Screen shape: { id, name, width, height, x, y }
  - Assets: GET/POST/PUT/DELETE /api/assets and /api/assets/{id}
    - Asset is discriminated by type: "image" | "text"
    - ImageAsset: { id, screen_id, x, y, z_index, rotation, scale_x, scale_y, type:"image", src, width?, height?, natural_width?, natural_height? }
    - TextAsset: { id, screen_id, ..., type:"text", text, font_size, color }
  - Uploads: POST /api/assets/upload → { url } and files are served under /uploads (mounted in main.py).
- WebSocket base: WS_BASE = (env VITE_WS_BASE or ws://localhost:8000) + "/ws"
  - Message shape from server: { "event": string, "data": any }
  - Known events: asset_added, asset_updated, asset_deleted, screen_added, screen_updated, screen_deleted
  - Frontend handler: ws.ts updates stores via upsert/remove helpers.

## Conventions to follow
- Keep routes thin; put business logic in services (screen_service.py). Always broadcast via WS_MANAGER after state changes so clients stay in sync.
- Preserve WS route at /ws on the app (not under /api); if you refactor routers, keep this invariant.
- Maintain Asset discriminated union in both Python and TS. When adding a type:
  - Backend: extend asset_models.py union and adjust STATE create/update if needed.
  - Frontend: extend Asset union in stores.ts and add a renderer in lib/components/assets/.
- Frontend state ordering: assetsByScreen sorts by z_index; keep this stable when mutating state.

## Dev, build, and tests (local)
- Backend (Python 3.11+)
  - Run dev: uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  - Install: uv pip install -e ./backend (pyproject in backend/)
  - Env: backend/.env or compose (CORS_ORIGINS, PUBLIC_BASE_URL, EXTERNAL_ENABLED, SCREEN_SERVICE_URL, SCREEN_SERVICE_TOKEN)
- Frontend
  - Install: (cd frontend && bun install)
  - Dev: (cd frontend && bun run dev)
  - Tests: (cd frontend && bunx vitest --run) — two projects configured (browser "client" and node "server") in vite.config.ts
  - Lint/format: (cd frontend && bun run lint) and bun run format
- Docker (recommended quickstart)
  - docker compose up --build → backend on 8000 (/docs), frontend on 5173

## Cross-component flows (examples)
- Dropped image → frontend uploads file → POST /api/assets { type:"image", screen_id, x, y, src } → STATE persists → ScreenServiceClient.apply_asset (dry-run by default) → WS broadcast asset_added → clients upsertAsset.
- Asset transform (position/size/etc.) → PUT /api/assets/{id} with changed fields → same broadcast pattern with event asset_updated.

## Key files to reference when editing
- backend/app/{main.py,api/*.py,models/*.py,services/screen_service.py,state/memory_state.py,util/connection_manager.py,core/config.py}
- frontend/src/lib/{api.ts,ws.ts,stores.ts,components/**}
- docker-compose.yml (ports and env), frontend/vite.config.ts (dev server and vitest projects)

## Guardrails
- Don’t introduce npm/yarn/pip if bun/uv are already used. Keep OpenAPI and Swagger UI working. Respect CORS settings in config.
- If adding features that change API shapes, update both backend models and frontend TS types, and ensure WS events remain consistent.
