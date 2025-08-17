# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebBuddy is a full-stack web application for managing digital screens and assets with real-time collaboration. It consists of:
- **Backend**: FastAPI-based REST API with WebSocket support (Python 3.12+)
- **Frontend**: SvelteKit application using Svelte 5 with shadcn-svelte components
- **Canvas System**: Interactive canvas using Konva.js for screen and asset management

## Development Commands

Don't worry about this, the user will run all commands for you.

## Architecture Overview

### Backend Architecture
- **FastAPI Application**: Main app in `app/main.py` with factory pattern for Uvicorn
- **API Routes**: REST endpoints in `app/api/` (screens, assets, websocket)
- **State Management**: In-memory storage via `app/state/memory_state.py`
- **Models**: Pydantic models in `app/models/` for screens and assets (ImageAsset, TextAsset)
- **Configuration**: Environment-based settings in `app/core/config.py`
- **WebSocket**: Real-time updates via connection manager in `app/util/connection_manager.py`

Key API endpoints:
- `/api/screens` - CRUD operations for screens
- `/api/assets` - CRUD operations for assets
- `/api/assets/upload` - File upload (multipart/form-data)
- `/ws` - WebSocket for real-time updates
- `/health` - Health check

### Frontend Architecture
- **SvelteKit + Svelte 5**: Modern reactive framework with runes ($state, $derived)
- **Canvas System**: Konva.js integration via `svelte-konva` for interactive graphics
- **State Management**: Global stores in `lib/stores.svelte.ts` using Svelte 5 runes
- **UI Components**: shadcn-svelte components in `lib/components/ui/`
- **Real-time Sync**: WebSocket client in `lib/ws.ts` for live updates
- **API Client**: HTTP client in `lib/api.ts` with TypeScript support

Key components:
- `Canvas.svelte` - Main canvas with zoom/pan controls
- `ScreenFrame.svelte` - Individual screen rendering
- `Toolbar.svelte` - Main toolbar interface
- `ErrorPanel.svelte` - Error handling component

### Data Flow
1. **REST API**: Initial data loading and CRUD operations
2. **WebSocket Events**: Real-time updates (asset_added, asset_updated, screen_deleted, etc.)
3. **State Sync**: Frontend stores automatically update from WebSocket events
4. **Canvas Rendering**: Konva.js renders screens/assets from reactive stores

### Asset System
- **Image Assets**: File uploads stored in `backend/uploads/`, served at `/uploads/*`
- **Text Assets**: Rich text with font, size, color properties
- **Asset Properties**: Position (x,y), rotation, scale, z-index for layering
- **Screen Assignment**: All assets belong to a specific screen

## Key Technologies

### Frontend Stack
- **Svelte 5**: Latest version with runes for reactivity
- **SvelteKit**: Full-stack framework
- **shadcn-svelte**: UI component library (prioritize over custom components)
- **Konva.js**: 2D canvas library for graphics
- **TailwindCSS v4**: Latest utility-first CSS framework
- **TypeScript**: Type safety throughout
- **runed**: Svelte 5 utilities for advanced reactivity patterns

### Backend Stack
- **FastAPI**: Modern async Python web framework
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server with hot-reload support
- **Ruff**: Linting and formatting
- **WebSockets**: Real-time communication

## Important Development Guidelines

### Code Standards
- Follow Svelte 5 documentation patterns strictly
- Use shadcn-svelte components for all UI elements
- Code must be DRY, clean, efficient, modular, and reusable
- Ensure proper logging (INFO and DEBUG levels)
- Use TypeScript throughout the frontend
- Use **Bun** as the package manager for all frontend dependencies

### Frontend Organization
- Keep routes for pages and layouts only. Move everything reusable to `src/lib`
- Treat third-party UI like vendor code: isolate it under `lib/vendor/` and expose only your own wrappers from `lib/ui/`
- Use feature-based organization under `lib/features/` (canvas, toolbar, error-panel, etc.)
- Co-locate tiny, page-specific components next to routes. Move anything generic to `lib/`

### CSS Architecture
- Use one **TailwindCSS v4** entry CSS that imports layer files (`base.css`, `components.css`, `utilities.css`)
- Prefer TailwindCSS v4 classes in Svelte 5 components; reserve @apply for patterns used 3+ times
- Don't import from vendor anywhere except your wrappers

### Reactivity Patterns
- Use Svelte 5 runes ($state, $derived, $effect) for component reactivity
- Leverage **runed** utilities for advanced reactivity patterns (debounced, throttled, element-rect, etc.)
- See `frontend/docs/runed/` for comprehensive utility documentation

### WebSocket Communication
The app uses WebSocket events for real-time collaboration:
- Events: `asset_added`, `asset_updated`, `asset_deleted`, `screen_added`, `screen_updated`, `screen_deleted`
- All state changes broadcast to connected clients
- Frontend automatically syncs with backend state via these events

### File Upload Process
1. Files dropped on canvas trigger upload to `/api/assets/upload`
2. Backend returns URL (absolute if `PUBLIC_BASE_URL` set)
3. Frontend creates ImageAsset with returned URL
4. WebSocket broadcasts asset creation to all clients

### Environment Configuration
Backend uses environment variables (`.env` file supported):
- `CORS_ORIGINS`: JSON array of allowed origins
- `PUBLIC_BASE_URL`: Base URL for asset URLs
- `EXTERNAL_ENABLED`: Enable/disable external service calls
- Development defaults are pre-configured in `docker-compose.yml`

## Documentation Access

> By default, use [shadcn-svelte components](frontend/docs/shadcn-svelte/) for almost all UI elements.

If online, you are required to use the `svelte5-documentation`, `konva-documentation`, `shadcn-documentation` MCP Servers to access the latest documentation and code examples. This is not optional and must be followed strictly.

Prioritize using components and logic described in the documentation. This will ensure consistency and maintainability across the project.

## Testing Strategy (Unit-test focused)

IMPORTANT: Testing will be done with unit and integration tests (not browser automation). The LLM MUST generate test code and fixtures; do NOT attempt to run tests. Prompt the user to run the test commands.

### Required Testing Process
- The LLM must produce unit and integration tests covering backend and frontend areas described below.
- After tests are generated, ask the user to run:
  - Backend: pytest (python -m pytest) — tests live under backend/tests/ or app/tests/
  - Frontend: use Bun/Vitest (ask user to run bun test or the equivalent) — tests live under frontend/tests/ or src/lib/**/__tests__/
- Provide clear fixtures, mocks, and instructions for running tests and any setup (env vars, tmp directories). Do not run commands yourself.

### Backend (pytest / pytest-asyncio)
Create tests that:
- Validate Pydantic models (validation, default values, edge cases).
- Test REST endpoints (screens, assets, upload) using httpx AsyncClient (or TestClient) with isolated test app fixtures.
- Test WebSocket behavior (connection manager, broadcast semantics) using asyncio test client or mocking connection manager.
- Use tmp_path fixtures for file uploads and ensure uploads directory is cleaned between tests.
- Provide fixtures for in-memory state reset between tests.
- Include negative tests (bad payloads, missing files, 404s).
- Aim for clear, small test functions and reusable fixtures.

Suggested structure:
- backend/tests/conftest.py — app, client, temp uploads, state reset fixtures
- backend/tests/test_models.py
- backend/tests/test_api_screens.py
- backend/tests/test_api_assets.py
- backend/tests/test_ws.py

### Frontend (Vitest + @testing-library/svelte)
Create tests that:
- Unit-test Svelte 5 components (Canvas, ScreenFrame, Toolbar) with @testing-library/svelte or appropriate Svelte 5 testing utilities.
- Mock network calls (fetch/http client) and WebSocket interactions (mock WebSocket or replace lib/ws.ts with a mock).
- Test stores and derived reactivity (use runes' test helpers where needed).
- Keep tests deterministic and fast; avoid requiring a browser.
- Suggested structure:
  - frontend/tests/unit/components/...
  - frontend/tests/unit/stores/...

### Quality & Coverage
- Provide sensible assertions and test names.
- Recommend coverage targets (e.g., >80%) and how to run coverage tools for backend (coverage.py) and frontend (Vitest coverage).
- Emphasize tests should be small, independent, and fast.

### Output Requirements for the LLM
- Generate complete test files (with import statements and fixtures).
- Include comments explaining any non-obvious mocks or fixtures.
- Do not modify production code unless a small, necessary change is required; explain rationale when you do.
- After producing tests, explicitly prompt the user to run the test commands and provide the exact commands to execute.
