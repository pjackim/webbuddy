
# AGENTS.md

Authoritative guidance for AI/code agents (OpenAI Codex) working in this repository.

Codex reads and **merges** `AGENTS.md` from:

1) `~/.codex/AGENTS.md` (global) → 2) repo root (this file) → 3) subdirectory `AGENTS.md` (feature-specific). More specific files override general ones.

---

## Stack & Intent

- **Frontend:** Svelte 5 (runes), TypeScript, Vite, Tailwind. Package/runtime: **bun**.
- **Backend:** FastAPI, **Pydantic v2** (write code v3-aware), Uvicorn. Package/runner: **uv**.
- **API:** OpenAPI 3 (keep `/openapi.json` valid and `/docs` working).
- **Principles:** Clean Code, DRY, small pure modules, explicit errors, strong typing.

Do not introduce alternative stacks (no npm/yarn/pip unless explicitly required).

---

## Repo Map (source of truth)

- `frontend/` — Svelte 5 app and assets
- `backend/` — FastAPI app, Pydantic models, services, routers
- `docker-compose.yml` — local orchestration
- `.github/` — GitHub Actions workflows

If you add new top-level paths, update this section.

---

## Commands (copy-paste runnable)

### Backend (Python 3.11+)

- Create venv (optional) & activate:

  ```bash
  uv venv .venv && source .venv/bin/activate
  ```

- Install deps:

  ```bash
  uv pip install -r backend/requirements.txt
  # or, if a backend package exists:
  uv pip install -e ./backend
  ```

- Run dev server:

  ```bash
  uv run uvicorn app.main:app --factory --host 0.0.0.0 --port 8000 --reload
  ```

- Lint/format/tests (if configured):

  ```bash
  uv run ruff check . && uv run ruff format .
  uv run pytest -q
  ```

### Frontend

- Install deps:

  ```bash
  (cd frontend && bun install)
  ```

- Dev server:

  ```bash
  (cd frontend && bun --bun run dev)
  ```

- Build / lint / format:

  ```bash
  (cd frontend && bun run build)
  (cd frontend && bun run lint)
  (cd frontend && bun run format)
  ```

### Docker (optional)

```bash
docker compose up --build
```

---

## Coding Standards

### General (Clean Code / DRY)

- Small, cohesive modules; descriptive names; no duplication—extract shared logic to `frontend/src/lib/**` or `backend/app/**/util.py`.
- Prefer pure functions; push validation to types/models.
- Comments explain **why**, not what; code should be self-evident.

### Backend (FastAPI + Pydantic v2, v3-aware)

- **Models:** `backend/app/models/`. Use `Field`, `Annotated[...]`, discriminated unions. Use `model_dump()` / `model_validate()`.
- **Routers:** `backend/app/api/<domain>.py` with `APIRouter(prefix="/<domain>", tags=["<Domain>"])` and `response_model=...`.
- **Services:** business logic in `backend/app/services/`; keep routes thin.
- **Config:** `pydantic-settings`; no secrets in code; use env.
- **Serialization:** prefer `orjson` responses if available.
- **Migrations:** for breaking changes, add new versioned models/routes and deprecate old ones with a window.

### Frontend (Svelte 5)

- Use **runes** (`$state`, `$derived`, `$effect`) for reactivity—no legacy `$:` in new code.
- Co-locate state in `src/lib/stores.ts`; HTTP helpers in `src/lib/api.ts`; WS helpers in `src/lib/ws.ts`.
- Components remain presentational; business logic lives in lib/stores or page load.
- Accessibility: semantic HTML; keyboard support for interactive elements.
- Styling: Tailwind; centralize design tokens; avoid deep custom CSS unless needed.

---

## API Design Playbook

1. **Model first:** define/extend Pydantic request/response models.
2. **Route next:** add FastAPI route with `response_model`, status codes, and examples.
3. **Validation:** prefer Pydantic validators over ad-hoc checks.
4. **Docs:** endpoints must appear correctly in **OpenAPI** (`/openapi.json`) and **Swagger UI** (`/docs`).
5. **Client:** add/extend `frontend/src/lib/api.ts` with typed calls.
6. **WebSockets:** use discriminated unions (`type` field). Mirror shapes in TS types.

---

## Testing

- **Backend:** `pytest` (async where needed), test routers (`httpx.AsyncClient`), services, and models. Snapshot OpenAPI schema when practical.
- **Frontend:** `@testing-library/svelte` + `vitest` (via bun). Test behavior, not implementation details.
- **Contracts:** keep API schema changes deliberate; document in PR.

---

## Reliability & Perf

- Non-blocking server; heavy tasks → background workers (if introduced).
- Batch network calls; debounce UI updates.
- Prefer UTC ISO-8601 timestamps; validate inputs at boundaries.

---

## Security & Config

- CORS locked down in production via env.
- Secrets only via environment / `pydantic-settings`.
- Validate file uploads (type/size) if applicable.

---

## Contributing (agent workflow)

1. Branch: `feat/<scope>-<desc>` or `fix/<scope>-<desc>`.
2. Keep commits atomic; use conventional prefixes (`feat:`, `fix:`, `docs:`).
3. Update tests/docs with behavior changes.
4. PR must include: summary, rationale, screenshots (UI), **OpenAPI diff** notes.
5. Ensure: bun/uv builds pass; tests green; schema valid.

---

## Quick Links

- **OpenAPI JSON:** `GET http://localhost:8000/openapi.json`
- **Swagger UI:** `http://localhost:8000/docs`
- **Frontend dev:** `http://localhost:5173` (default Vite)
- **Backend dev:** `http://localhost:8000`

---

## Do / Don’t

- **Do:** use `bun` and `uv` for all install/run tasks; keep commands copy-pasteable.
- **Do:** favor small, reversible changes; ask clarifying questions in PRs.
- **Don’t:** add alternative build tools; violate Clean Code/DRY; break `/docs` or `/openapi.json`.
