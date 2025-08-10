# Web Buddy — Infinite Canvas (SvelteKit 5) + FastAPI (Monorepo)

Production-ready monorepo for a PureRef-like, infinite canvas with multi-screen layout, real-time collaboration (WebSocket), uploads, and a clean FastAPI backend. The frontend is SvelteKit (Svelte 5) + Vite 7 + Tailwind CSS v4 (via @tailwindcss/vite) + DaisyUI v5 with ESLint, Prettier, and Vitest (browser + node) powered by Playwright. The backend targets Python 3.12+ and serves a custom Swagger UI.

---

## Repository Structure

```
webbuddy/
├─ backend/
│  ├─ app/
│  │  ├─ api/...
│  │  ├─ core/...
│  │  ├─ models/...
│  │  ├─ scripts/...
│  │  ├─ services/...
│  │  ├─ state/...
│  │  ├─ static/...
│  │  └─ util/...
│  ├─ pyproject.toml
│  ├─ uvicorn.ini
│  └─ Dockerfile
├─ frontend/
│  ├─ src/
│  │  ├─ app.html
│  │  ├─ app.d.ts
│  │  ├─ app.css
│  │  ├─ routes/{+layout.svelte,+page.svelte}
│  │  └─ lib/
│  │     ├─ api.ts
│  │     ├─ ws.ts
│  │     ├─ stores.ts
│  │     ├─ utils.ts
│  │     ├─ assets/favicon.svg
│  │     └─ components/{Toolbar.svelte,Canvas.svelte,ScreenFrame.svelte,Grid.svelte,assets/...}
│  ├─ static/robots.txt
│  ├─ package.json
│  ├─ eslint.config.js
│  ├─ svelte.config.js
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ tailwind.config.cjs
│  ├─ postcss.config.cjs
│  ├─ vitest-setup-client.ts
│  ├─ bun.lock
│  └─ Dockerfile
├─ docker-compose.yml
└─ README.md
```

Key files:
- App factory and mounts: [backend/app/main.py](backend/app/main.py) → [create_app()](backend/app/main.py:70)
- REST routers: [backend/app/api/routes_screens.py](backend/app/api/routes_screens.py), [backend/app/api/routes_assets.py](backend/app/api/routes_assets.py)
- WebSocket endpoint: [backend/app/api/websocket.py](backend/app/api/websocket.py)
- Settings: [backend/app/core/config.py](backend/app/core/config.py)
- Swagger UI CSS override: [backend/app/static/swagger-docs.css](backend/app/static/swagger-docs.css)
- Frontend canvas: [frontend/src/lib/components/Canvas.svelte](frontend/src/lib/components/Canvas.svelte), frames: [frontend/src/lib/components/ScreenFrame.svelte](frontend/src/lib/components/ScreenFrame.svelte), grid: [frontend/src/lib/components/Grid.svelte](frontend/src/lib/components/Grid.svelte)
- Frontend runtime config: [frontend/src/lib/api.ts](frontend/src/lib/api.ts), WebSocket client: [frontend/src/lib/ws.ts](frontend/src/lib/ws.ts)
- Compose: [docker-compose.yml](docker-compose.yml)
- Frontend build/test config: [frontend/vite.config.ts](frontend/vite.config.ts), [frontend/svelte.config.js](frontend/svelte.config.js), [frontend/tailwind.config.cjs](frontend/tailwind.config.cjs), [frontend/postcss.config.cjs](frontend/postcss.config.cjs)

---

## Backend — FastAPI (Python 3.12+)

The FastAPI app is initialized in [backend/app/main.py](backend/app/main.py) via [create_app()](backend/app/main.py:70). It mounts:
- REST API under `/api` (see routers in [backend/app/api/routes_screens.py](backend/app/api/routes_screens.py) and [backend/app/api/routes_assets.py](backend/app/api/routes_assets.py))
- WebSocket at `/ws` (see [backend/app/api/websocket.py](backend/app/api/websocket.py))
- Static uploads at `/uploads`
- Custom Swagger UI at `/docs` using [backend/app/static/swagger-docs.css](backend/app/static/swagger-docs.css)

Configuration is managed via Pydantic Settings in [backend/app/core/config.py](backend/app/core/config.py). Notable env vars:
- ENV
- CORS_ORIGINS (list JSON)
- PUBLIC_BASE_URL
- SCREEN_SERVICE_URL, SCREEN_SERVICE_TOKEN
- EXTERNAL_ENABLED
- POLL_INTERVAL_SEC

Scripts (exposed via pyproject entry points):
- [start()](backend/app/scripts/start.py:1) → `uvicorn` factory mode
- [test()](backend/app/scripts/test.py:1) → `pytest`
- [lint()](backend/app/scripts/lint.py:1) → `ruff check`
- [format()](backend/app/scripts/format.py:1) → `ruff format`
- [build()](backend/app/scripts/build.py:1) → `python -m build`
- [clean()](backend/app/scripts/clean.py:96) → remove build/cache artifacts

Dockerized backend installs via `uv` and runs Uvicorn; see [backend/Dockerfile](backend/Dockerfile).

---

## Frontend — SvelteKit (Svelte 5), Vite 7, Tailwind v4 + DaisyUI, Konva

- SvelteKit 2 + Vite 7 with Tailwind v4 via @tailwindcss/vite (see [frontend/vite.config.ts](frontend/vite.config.ts))
- UI stack: DaisyUI v5, Bits UI, Lucide icons, mode-watcher (for theme), runed/paneforge (utils)
- Infinite canvas via Konva + svelte-konva with smooth pan/zoom ([frontend/src/lib/components/Canvas.svelte](frontend/src/lib/components/Canvas.svelte))
- Global styles/colors using CSS custom properties in [frontend/src/app.css](frontend/src/app.css)
- SSR-safe layout and favicon wiring in [frontend/src/routes/+layout.svelte](frontend/src/routes/+layout.svelte)

Key scripts (see [frontend/package.json](frontend/package.json)):
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "prepare": "svelte-kit sync || echo ''",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "test:unit": "vitest",
    "test": "npm run test:unit -- --run",
    "format": "prettier --write .",
    "lint": "prettier --check . && eslint ."
  }
}
```

Frontend environment variables:
- `VITE_API_BASE` (default `http://localhost:8000/api`) read in [API_BASE](frontend/src/lib/api.ts:1)
- `VITE_WS_BASE` (default `ws://localhost:8000`) read in [WS_BASE](frontend/src/lib/api.ts:2)

Testing:
- Vitest projects for browser + node configured in [frontend/vite.config.ts](frontend/vite.config.ts)
- Playwright powers browser runs
- Setup file: [frontend/vitest-setup-client.ts](frontend/vitest-setup-client.ts)

---

## Docker and Compose

- Backend: Python 3.12, installed via `uv`, runs with Uvicorn factory; uploads volume persisted
- Frontend: Bun-based image builds SvelteKit and serves `vite preview` (no Nginx) from port `3000` by default; optional test run during build controlled by `RUN_TESTS`

See [docker-compose.yml](docker-compose.yml) for full configuration. Defaults:
- Backend: `http://localhost:8000` (ENV `BACKEND_PORT=8000`, `BACKEND_CONTAINER_PORT=8000`)
- Frontend: `http://localhost:${FRONTEND_PORT:-3000}` (default `3000`)
- CORS defaults to allowing the frontend origin: `CORS_ORIGINS='["http://localhost:3000"]'`
- Uploads persisted at `backend_uploads` volume

---

## Quickstart

Using Docker (recommended):

```bash
docker compose up --build
```

Then:
- Backend API: http://localhost:8000 (Swagger UI at `/docs`)
- Frontend: http://localhost:3000

Local development (optional):
- Backend
  - From `backend/`: install with `uv pip install -e .` (first time), then `uv run start`
- Frontend
  - From `frontend/`: `npm install` (or `bun install`), then `npm run dev` (Vite dev server on 5173)

---

## Features

- Infinite canvas with smooth pan/zoom (Konva + svelte-konva)
- Multi-screen layout: add/drag screen frames; per-screen assets
- Image & text assets; drag to move; drop-to-upload on canvas
- Real-time collaboration via WebSocket broadcast
- Offline mode toggle (local-only edits if off)
- File uploads to backend (`/api/assets/upload`) served from `/uploads`
- Clean Pydantic v2 models with discriminated unions
- Custom Swagger UI with dark code highlighting
- Tailwind CSS v4 + DaisyUI v5
- Vitest (browser + node) with Playwright, ESLint + Prettier

---

## Configuration

Backend (.env or docker-compose env):
- `ENV`
- `CORS_ORIGINS` — list JSON; default allows local frontend
- `PUBLIC_BASE_URL` — used for absolute upload URLs
- `EXTERNAL_ENABLED` — enable external screen service calls
- `SCREEN_SERVICE_URL`, `SCREEN_SERVICE_TOKEN` — external service integration
- `POLL_INTERVAL_SEC` — optional background polling (0 disables)

Frontend (.env, optional):
- `VITE_API_BASE` — override backend API base
- `VITE_WS_BASE` — override WebSocket base

---

## Extending

- Add a new asset type: backend model + endpoints and a Svelte component; broadcast via WS in relevant route handler(s)
- Resize/rotate: attach Konva Transformer to selected nodes; persist `width/height/rotation`
- Offline merging: queue diffs locally; push on reconnect (current behavior = discard)

Reference code:
- WS events broadcast: [broadcast()](backend/app/util/connection_manager.py:?) usage in [routes_assets.py](backend/app/api/routes_assets.py) and [routes_screens.py](backend/app/api/routes_screens.py)
- Frontend WS handling: [connectWS()](frontend/src/lib/ws.ts:6) and update stores in [stores.ts](frontend/src/lib/stores.ts)

---

## Roadmap

- ✅ Infinite canvas, multi-screen frames, image/text assets, WS, offline toggle, uploads, Dockerized, Tailwind v4, tests and linting
- 🔜 Konva Transformer (resize/rotate), snapping guides, background polling to single source-of-truth, Redis cache, auth