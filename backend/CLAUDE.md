# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- **Start server (production-like)**: `uv run start` or `make start`
- **Debug server (with reload)**: `uv run debug` or `make debug`
  - On Windows: Reload is disabled by default to prevent Ctrl+C issues
  - Enable reload: `$env:DEBUG_RELOAD = "1"; uv run debug` (PowerShell)
- **Server accessible at**: http://localhost:8000 (bound to 127.0.0.1 by default)
- **API docs**: http://localhost:8000/docs

### Testing and Quality
- **Run tests**: `uv run test` or `make test` or `uv run python -m pytest`
- **Lint code**: `uv run lint` or `make lint` 
- **Format code**: `uv run format` or `make format`
- **Type check**: `uv run mypy` or in make check
- **Full quality check**: `make check` (includes linting, type checking, dependency checks)

### Build and Setup
- **Install dependencies**: `make install` (runs `uv sync` and sets up pre-commit hooks)
- **Build wheel**: `uv run build` or `make build`
- **Clean build artifacts**: `uv run clean` or `make clean`

## Architecture Overview

### FastAPI Application Structure
- **Factory pattern**: Application uses `create_app()` factory function in `main.py`
- **Uvicorn integration**: Scripts in `src/web_buddy_backend/scripts/` handle server startup
- **CORS enabled**: Frontend dev server (localhost:5173) and other origins configured

### Core Components
- **Models**: Pydantic models in `models/` for Screen and Asset entities
  - `Screen`: Canvas areas with dimensions and position
  - Assets: `ImageAsset`, `TextAsset`, `VideoAsset` with transform properties (position, rotation, scale)
- **Services**: Business logic in `services/` for media processing and screen management
- **State Management**: In-memory state using `state/memory_state.py`
- **API Routes**: RESTful endpoints in `api/routes_*` + WebSocket support
- **Static file serving**: `/uploads` for user uploads, `/static` for assets

### Key Services
- **MediaService**: Handles file uploads, validation, image/video processing with OpenCV
- **ScreenService**: Manages screen CRUD and asset positioning
- **ConnectionManager**: WebSocket connection management for real-time updates

### Configuration
- **Settings**: Environment-based config in `core/config.py` using Pydantic settings
- **CORS origins**: Configurable list including SvelteKit dev server (localhost:5173)
- **External services**: Optional screen service integration with token auth

## Known Issues & Workarounds

### Windows Development
- **Ctrl+C issue**: Reload mode can cause unresponsive terminals on Windows
- **Workaround**: Use `uv run start` (no reload) or set `DEBUG_RELOAD=0`
- **Alternative**: Close terminal if server becomes unresponsive

### Server Binding
- **Default binding**: 127.0.0.1:8000 (use localhost:8000 to access)
- **Override**: Set HOST and PORT environment variables if needed

## Testing
- **Test framework**: pytest with coverage reporting
- **Test location**: `tests/` directory
- **Configuration**: pytest settings in `pyproject.toml`
- **Coverage**: Configured to include `src/` directory with branch coverage