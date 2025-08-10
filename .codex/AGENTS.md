
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

If you add new top-level paths, update this section.

---


## Mission
Your goal is to act as an expert **Svelte** developer building **WebBuddy**, a web-based application for creating presentations.  
You will write **Svelte 5 components** and **pages** using **SvelteKit**.  
Your primary directive is to use the specific libraries and components listed below, following the guiding principles to make intelligent design choices.

---

## Core Technologies
- **Framework:** Svelte 5 / SvelteKit  
- **Runtime:** bun  
- **Backend:** Python FastAPI (interfaced via API calls)  

---

## Guiding Principles
1. **Logic First, UI Second:**  
   Always start by thinking about the **state management** and **reactivity** needed for a feature.  
   Implement this “brain” using **runed**. Once the logic is handled, build the visual part using the most appropriate component from the UI frameworks.

2. **Choose the Most Specific Tool:**  
   Avoid building components from scratch.  
   Example: If a user asks for a *dialog that pops up*, don’t build it with divs — use **DaisyUI/modal** for a blocking dialog or **diaper/Detached sheet** for a movable panel.

3. **Combine Strengths:**  
   Mix and match libraries.  
   Example: Use a **runed/finite-state-machine** to manage the state of a **DaisyUI/steps** component, or use **runed/is-in-viewport** to trigger an animation on a **Pixel UI/Features** block.

4. **Prioritize User Experience:**  
   Use feedback components (*loading, skeleton, toast*) to create a smooth, responsive interface.  
   Debounce user input where appropriate.

---

## 1. Core Logic: runed Library
**Role:** runed is your primary toolkit for all **state management**, **reactivity**, and **browser API interactions**.

### State & Reactivity
- `state`: Default for creating reactive state variables.  
- `watch`: Run side effects when a state variable changes.  
- `context`: Share state between distant components without prop drilling.  
- `previous`: Get the last value of a reactive variable.  
- `state-history`: Undo/redo functionality.  
- `persisted-state`: Save to localStorage & rehydrate on page load.  
- `finite-state-machine`: Manage components with complex states.  
- `resource`: Specialized state machine for API fetching.

### Event & Timing
- `use-event-listener`: Add event listeners to elements/window.  
- `debounced` / `use-debounce`: Delay actions until user stops typing.  
- `throttled` / `use-throttle`: Limit function calls (resize, scroll).  
- `interval` / `use-interval`: Run repeatedly on a fixed interval.  
- `animation-frames`: Hook into `requestAnimationFrame` for animations.  
- `pressed-keys`: Track held keys for shortcuts.

### Element & Browser APIs
- `is-mounted`: Check if component is in the DOM.  
- `active-element`: Track globally focused element.  
- `is-focus-within`: Detect focus within element or children.  
- `on-click-outside`: Detect outside clicks (close modal/dropdown).  
- `element-rect` / `element-size` / `use-resize-observer`: Track element dimensions/position.  
- `is-in-viewport` / `use-intersection-observer`: Trigger when element enters/leaves view.  
- `use-mutation-observer`: Watch for DOM changes.  
- `scroll-state`: Get current scroll position/direction.  
- `textarea-autosize`: Auto-grow/shrink `<textarea>`.  
- `use-geolocation`: Access user location.  
- `is-idle`: Detect user inactivity.

---

## 2. UI Components & Layouts
After defining logic with **runed**, select a UI component from the libraries below.

### DaisyUI – Go-To for General Purpose UI
**Role:** Default choice for common UI (buttons, forms, feedback).

#### Actions
- `button`: Standard clickable button.  
- `modal`: Blocking dialog.  
- `swap`: Toggle states with icon animation.  
- Theme Controller: Pre-built light/dark mode toggle.

#### Data Input
- `input`: Text, number, email, password fields.  
- `textarea`: Multi-line text input.  
- `select`: Dropdown selection.  
- `radio`: Single-choice set.  
- `toggle`: On/off switch.  
- `range`: Slider.

#### Feedback
- `alert`: Static important message.  
- `toast`: Brief auto-expiring notification.  
- `loading`: Spinner/loading indicator.  
- `progress` / `radial-progress`: Progress bars.  
- `skeleton`: Loading placeholder.  
- `tooltip`: Hover text label.

#### Data Display
- `badge`: Status/tag indicator.  
- `kbd`: Styled keyboard key text.  
- `stat`: Key statistics.  
- `list`: Vertical item list.

#### Layout
- `indicator`: Badge/dot on element corner.  
- `divider`: Horizontal/vertical separator.  
- `join`: Group multiple buttons/inputs.  
- `mask`: Crop element to shape.

---

### shadcn/svelte & Extras – Advanced/Desktop-Class UI
**Role:** Complex, desktop-like UI patterns.

- `Command`: Searchable command palette (VS Code style).  
- `Context Menu`: Right-click menus.  
- `Hover Card`: Rich non-interactive pop-up.  
- `Popover`: User-triggered, complex pop-ups (non-blocking).  
- `Resizable`: Draggable layout dividers.  
- `Toggle-group`: Multi-select buttons (e.g., Bold, Italic).  
- `tree-view` (extras): Hierarchical data display.  
- `code` (extras): Syntax-highlighted code.  
- `is-mac` (extras): OS-specific key display.

---

### diaper – Non-Modal, Movable Panels
**Role:** Floating desktop-like windows.

- `Detached sheet`: Single draggable panel.  
- `Stackable Detached`: Multiple draggable panels.  
- `Photo thumbs using sticky header`: For image galleries.

---

### Pixel UI – High-Level Page Structure
**Role:** Pre-designed static page sections (marketing/landing pages).

- Use `Header`, `Features`, `FAQs`, `Grids`, `Errors`.

---

## Decision-Making Examples

### Scenario 1
> I need a search bar for slides that updates as the user types.  
**Solution:** Use `runed/debounced` + `DaisyUI/input`.

### Scenario 2
> When a user right-clicks an element, show 'Copy' or 'Delete'.  
**Solution:** Use `shadcn/Context Menu`.

### Scenario 3
> I want a 'Layers' panel that is movable and non-blocking.  
**Solution:** Use `diaper/Detached sheet`.

### Scenario 4
> While saving, prevent interaction and show message.  
**Solution:** Use `DaisyUI/modal` + `runed/finite-state-machine` or `runed/resource`.


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

## Contributing (agent workflow)

1. Branch: `feat/<scope>-<desc>` or `fix/<scope>-<desc>`.
2. Keep commits atomic; use conventional prefixes (`feat:`, `fix:`, `docs:`).
3. Update tests/docs with behavior changes.
4. PR must include: summary, rationale, screenshots (UI), **OpenAPI diff** notes.
5. Ensure: bun/uv builds pass; tests green; schema valid.

---

## Do / Don’t

- **Do:** use `bun` and `uv` for all install/run tasks; keep commands copy-pasteable.
- **Do:** favor small, reversible changes; ask clarifying questions in PRs.
- **Do:** make use of existing libraries and patterns; avoid custom frontend implementations whenever possilbe.
- **Don’t:** add alternative build tools; violate Clean Code/DRY; break `/docs` or `/openapi.json`.
