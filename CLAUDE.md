# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebBuddy is a full-stack web application for managing digital screens and assets with real-time collaboration. It consists of:
- **Backend**: FastAPI-based REST API with WebSocket support (Python 3.12+)
- **Frontend**: SvelteKit application using Svelte 5 with shadcn-svelte components
- **Canvas System**: Interactive canvas using Konva.js for screen and asset management

## Development Commands

### Frontend (from `frontend/` directory)
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:unit    # Run unit tests with vitest
npm run check        # Type check with svelte-check
npm run lint         # Lint with ESLint and Prettier
npm run format       # Format code with Prettier
```

### Backend (from `backend/` directory)
Using uv (recommended):
```bash
uv sync              # Install dependencies
uv run debug         # Start with auto-reload (dev)
uv run start         # Start without reload (prod-like)
uv run lint          # Run Ruff linting
uv run format        # Format with Ruff
uv run test          # Run pytest
uv run clean         # Clean build artifacts
```

Using Python venv:
```bash
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
python -m pip install -e .
python -m app.scripts.debug    # Start with reload
```

### Docker (from project root)
```bash
docker compose up --build      # Run full stack
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

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
- **TailwindCSS**: Utility-first CSS framework
- **TypeScript**: Type safety throughout
- **Vitest**: Testing framework

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

## Testing
- Frontend: `npm run test` (Vitest)
- Backend: `uv run test` (pytest)
- No specific test framework assumptions - check existing tests for patterns

## Port Configuration
- Frontend dev server: 5173
- Backend API: 8000
- WebSocket: same as backend (8000/ws)

## Documentation References
- Extensive documentation in `docs/` directory:
  - `shadcn-svelte/` - UI component documentation
  - `Svelte-5-Documentation.md` - Svelte 5 patterns
  - `svelte-konva-docs.md` - Canvas integration guide
  - `runed/` - Svelte utility library docs