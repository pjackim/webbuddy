# Web Buddy — Backend (FastAPI)

Developer guide for running, configuring, and contributing to the backend service.

## Quick start

- Requirements: Python 3.12+ (local dev), PowerShell, and optionally uv (fast Python package manager).
- All commands are meant to be run from the `backend/` folder unless noted.

### Option A: Using uv (recommended)

```powershell
# From backend/
uv sync            # install deps from pyproject.toml / uv.lock
uv run debug       # start with auto-reload (dev)
# or
uv run start       # start without reload (prod-like)
```

Services will listen on <http://localhost:8000> by default.

### Option B: Python venv

```powershell
# From backend/
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
python -m pip install -e .

# Start (reload)
python -m app.scripts.debug
# or
python -m app.scripts.start
```

Alternatively, run Uvicorn directly:

```powershell
python -m uvicorn app.main:create_app --factory --host 0.0.0.0 --port 8000 --reload
```

## Running with Docker

From the repository root (not backend/):

```powershell
docker compose up --build
```

- Backend: <http://localhost:8000>
- Frontend: <http://localhost:5173>
- Uploads are persisted via the `backend_uploads` volume and served from `/uploads`.

Note: The current Dockerfile uses `python:3.11-slim` while `pyproject.toml` declares `requires-python = ">=3.12"`. If you rely on Python 3.12-only features, consider updating the Docker base image to `python:3.12-slim`.

## Configuration

Configuration is provided via environment variables (and an optional `.env` file in `backend/`). Defaults are sensible for development.

- APP_NAME: Service name (default: `preref-backend`).
- ENV: Environment string, e.g. `dev`, `prod` (default: `dev`).
- CORS_ORIGINS: JSON-style list of allowed origins. Example: `["http://localhost:5173"]`. Default allows `*` in dev.
- PUBLIC_BASE_URL: Public base URL for this backend (used to build absolute asset URLs for uploads). Example: `http://localhost:8000`.
- SCREEN_SERVICE_URL: Optional external screen-control service base URL.
- SCREEN_SERVICE_TOKEN: Optional token for the external screen service.
- EXTERNAL_ENABLED: `true`/`false`. When false, external service calls are skipped (dry run). Default: `false`.
- POLL_INTERVAL_SEC: Number of seconds between polling an external source of truth (0 disables). Default: `0`.

Example `.env` for local dev (place in `backend/.env`):

```dotenv
ENV=dev
CORS_ORIGINS=["http://localhost:5173"]
PUBLIC_BASE_URL=http://localhost:8000
EXTERNAL_ENABLED=false
POLL_INTERVAL_SEC=0
```

In Docker Compose (root `docker-compose.yml`), environment defaults are already set for local development.

## Developer scripts

The following scripts are exposed via `pyproject.toml` and work with either `uv run <script>` or `python -m app.scripts.<name>`.

- start: Run the server (no reload)
- debug: Run the server with reload
- lint: Run Ruff checks
- format: Apply Ruff formatting
- test: Run pytest (forwards extra args)
- build: Build the package (PEP 517)
- clean: Remove build/cache artifacts

Examples:

```powershell
uv run lint
uv run format
uv run test -q -k "my_test"
uv run clean --dry-run
```

## API overview

Base URL: `http://localhost:8000`

- GET /health → { status: "ok" }
- Static: /uploads/* (serves uploaded files)
- WebSocket: /ws

REST API (prefixed with `/api`):

- Screens
	- GET /api/screens → list screens
	- POST /api/screens → create screen
	- PUT /api/screens/{screen_id} → update screen
	- DELETE /api/screens/{screen_id} → delete screen

- Assets
	- GET /api/assets[?screen_id=...] → list assets (optionally filtered by screen)
	- POST /api/assets → create asset
	- PUT /api/assets/{asset_id} → update asset
	- DELETE /api/assets/{asset_id} → delete asset
	- POST /api/assets/upload (multipart/form-data, field: `file`) → upload a file
		- Returns `{ url, filename }`. If `PUBLIC_BASE_URL` is set, `url` is absolute; otherwise, it's a relative `/uploads/...` path.

WebSocket events (broadcast to all connected clients via `/ws`):

- screen_added, screen_updated, screen_deleted
- asset_added, asset_updated, asset_deleted

## Uploads

- Files uploaded via `/api/assets/upload` are saved under `backend/uploads/` locally (or mounted volume in Docker) and served from `/uploads`.
- Ensure `PUBLIC_BASE_URL` is set when you need absolute URLs returned to clients (e.g., `http://localhost:8000`).

## Development tips

- Use `uv run debug` for hot-reload during development.
- CORS defaults to permissive in dev; set `CORS_ORIGINS` explicitly for stricter control.
- In-memory state: The service uses an in-memory store (see `app/state/memory_state.py`). Data is reset on restart.

## Testing, linting, formatting

```powershell
# Lint
uv run lint

# Format
uv run format

# Tests (pass any pytest args)
uv run test -q
```

## Project layout (backend)

- app/main.py: FastAPI app creation, CORS, static mounts, routers
- app/api/: REST and WebSocket routes
- app/core/: settings and logging config
- app/models/: pydantic models for assets/screens
- app/services/: external integrations (screen client)
- app/state/: in-memory state layer
- app/util/: utilities (WebSocket connection manager)
- uploads/: local upload storage (mounted at /uploads)

## Troubleshooting

- Port in use: Change the `--port` in your run command or stop the conflicting process.
- CORS errors: Set `CORS_ORIGINS` to include your frontend origin (e.g., `http://localhost:5173`).
- Wrong URLs in uploads response: Ensure `PUBLIC_BASE_URL` points to how clients reach the backend (container vs host).
- uv not installed: Either install uv (see Astral uv docs) or use a Python venv with `python -m app.scripts.*`.

---

Happy hacking!
