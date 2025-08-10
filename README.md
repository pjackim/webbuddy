# PureRef-Like Web App — SvelteKit (Svelte 5) + FastAPI (Monorepo v0.2)

A production‑ready starter implementing an infinite, multi‑screen canvas with real‑time collaboration, offline mode, and a clean FastAPI backend. The frontend now uses SvelteKit (Vite 7), Tailwind CSS v4 (via @tailwindcss/vite), DaisyUI v5, and ships with ESLint + Prettier and Vitest (browser + node) powered by Playwright.

---

## Repo Structure

```
preref-webapp/
├─ backend/
│  ├─ app/...
│  ├─ pyproject.toml
│  ├─ uvicorn.ini
│  └─ Dockerfile
├─ frontend/
│  ├─ src/
│  │  ├─ app.d.ts
│  │  ├─ app.html
│  │  ├─ routes/
│  │  │  ├─ +layout.svelte
│  │  │  └─ +page.svelte
│  │  └─ lib/
│  │     ├─ api.ts
│  │     ├─ ws.ts
│  │     ├─ stores.ts
│  │     ├─ assets/favicon.svg
│  │     └─ components/
│  │        ├─ Toolbar.svelte
│  │        ├─ Canvas.svelte
│  │        ├─ ScreenFrame.svelte
│  │        └─ assets/{ImageAsset.svelte,TextAsset.svelte}
│  ├─ static/robots.txt
│  ├─ package.json
│  ├─ eslint.config.js
│  ├─ svelte.config.js
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ tailwind.config.cjs
│  ├─ postcss.config.cjs
│  ├─ vitest-setup-client.ts
│  ├─ README.md
│  ├─ bun.lock
│  └─ Dockerfile
├─ docker-compose.yml
└─ README.md
```

---

## Backend — FastAPI (Python 3.11+)

The backend structure, models, services, and API routes remain as previously documented. See source files under `backend/app` for full details, including:

- Core config and logging: `backend/app/core/{config.py,logging_config.py}`
- Pydantic v2 models: `backend/app/models/{screen_models.py,asset_models.py}`
- In‑memory state: `backend/app/state/memory_state.py`
- Services and WS manager: `backend/app/services/screen_service.py` and `backend/app/util/connection_manager.py`
- API routers: `backend/app/api/{routes_screens.py,routes_assets.py,websocket.py}`

Uvicorn is containerized via `backend/Dockerfile`. Environment variables are read from `backend/.env` or docker‑compose.

---

## Frontend — SvelteKit (Svelte 5), Tailwind v4 + DaisyUI, Konva

Note: Uses `svelte-konva` for a declarative Konva API in Svelte.

### `frontend/package.json` (key scripts and deps)

```json
{
    "name": "frontend",
    "private": true,
    "version": "0.0.1",
    "type": "module",
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
    },
    "devDependencies": {
        "@eslint/compat": "^1.2.5",
        "@eslint/js": "^9.18.0",
        "@sveltejs/adapter-auto": "^6.0.0",
        "@sveltejs/kit": "^2.22.0",
        "@sveltejs/vite-plugin-svelte": "^6.0.0",
        "@tailwindcss/forms": "^0.5.9",
        "@tailwindcss/typography": "^0.5.15",
        "@tailwindcss/vite": "^4.0.0",
        "@vitest/browser": "^3.2.3",
        "autoprefixer": "^10.4.21",
        "daisyui": "^5.0.50",
        "eslint": "^9.18.0",
        "eslint-config-prettier": "^10.0.1",
        "eslint-plugin-svelte": "^3.0.0",
        "globals": "^16.0.0",
        "playwright": "^1.53.0",
        "postcss": "^8.5.6",
        "prettier": "^3.4.2",
        "prettier-plugin-svelte": "^3.3.3",
        "svelte": "^5.0.0",
        "svelte-check": "^4.0.0",
        "tailwindcss": "^4.0.0",
        "typescript": "^5.0.0",
        "typescript-eslint": "^8.20.0",
        "vite": "^7.0.4",
        "vite-plugin-devtools-json": "^0.2.0",
        "vitest": "^3.2.3",
        "vitest-browser-svelte": "^0.1.0"
    },
    "dependencies": {
        "konva": "^9.3.22",
        "svelte-konva": "^0.3.1"
    }
}
```

### `frontend/svelte.config.js`

```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
 // Consult https://svelte.dev/docs/kit/integrations
 // for more information about preprocessors
 preprocess: vitePreprocess(),
 kit: { adapter: adapter() }
};

export default config;
```

### `frontend/vite.config.ts`

```ts
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
  server: { port: 5173, host: true },
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'client',
          environment: 'browser',
          browser: { enabled: true, provider: 'playwright', instances: [{ browser: 'chromium' }] },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**'],
          setupFiles: ['./vitest-setup-client.ts']
        }
      },
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
        }
      }
    ]
  }
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
  plugins: { tailwindcss: {}, autoprefixer: {} }
};
```

### `frontend/src/app.css`

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #app { height: 100%; }
body { @apply bg-base-200 text-base-content; }

```

### `frontend/src/app.html`

```html
<!doctype html>
<html lang="en">
 <head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  %sveltekit.head%
 </head>
 <body data-sveltekit-preload-data="hover">
  <div style="display: contents">%sveltekit.body%</div>
 </body>
</html>

```

### `frontend/src/routes/+layout.svelte`

```svelte
<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
```

### Environment variables consumed by the frontend

- `VITE_API_BASE` (default `http://localhost:8000/api`)
- `VITE_WS_BASE` (default `ws://localhost:8000`)

---

## Docker and Compose

- Backend container builds with `uv` and runs `uvicorn`.
- Frontend container builds the SvelteKit app and serves it via Nginx. See `frontend/Dockerfile`.

Root `docker-compose.yml`:

```yaml
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

## Quickstart

Prereqs: Docker & Docker Compose

```bash
docker compose up --build
```

- Backend: http://localhost:8000 (docs at `/docs`)
- Frontend: http://localhost:5173

---

## Features

- Infinite canvas with pan/zoom (Konva)
- Multi‑screen layout: add/drag screen frames; per‑screen assets
- Image & text assets; drag to move
- Real‑time collaboration via WebSocket broadcast
- Offline mode toggle (local‑only edits if off)
- File uploads to backend (`/api/assets/upload`) serving from `/uploads`
- Clean Pydantic v2 models with discriminated unions
- External service wrapper (dry‑run by default)
- Tailwind CSS v4 with DaisyUI v5
- Vitest (browser + node) with Playwright, ESLint + Prettier

---

## Config

Set in `backend/.env` or docker‑compose envs:

- `PUBLIC_BASE_URL` – build absolute URLs for uploaded files
- `EXTERNAL_ENABLED=true` + `SCREEN_SERVICE_URL` + `SCREEN_SERVICE_TOKEN` – to call the external screen service
- `POLL_INTERVAL_SEC` – enable background polling of the source‑of‑truth (future; stub)

Frontend `.env` (optional):

- `VITE_API_BASE` – override backend API base
- `VITE_WS_BASE` – override WS base

---

## Extending

- Add new asset type: create model (backend), Svelte component (frontend), and mapping in `screen_service.py`.
- Add resize/rotate: use Konva `Transformer` attached to selected nodes; send PUT with `width/height/rotation`.
- Merge offline edits: queue diffs locally; upon rejoin, POST changes or discard (current behavior = discard).

---

## What’s implemented vs. planned
- ✅ Infinite canvas, multi‑screen frames, image/text assets, real‑time WS, offline toggle, uploads, Dockerized, Tailwind v4, tests and linting.
- 🔜 Konva Transformer (resize/rotate), snapping guides, background polling to single source‑of‑truth, Redis cache, auth.
