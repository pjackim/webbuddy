# Frontend TODO (Svelte 5 + Tailwind v4)

This list captures the most urgent improvements validated against Svelte 5 docs and our current setup.

## 1) Fix Tailwind v4/PostCSS wiring in `svelte.config.js`
- Action:
  - Remove the explicit `postcss: { configFilePath: ... }` from `vitePreprocess(...)` (no `postcss.config.*` exists and Tailwind v4 with `@tailwindcss/vite` doesn’t require it by default).
  - Optionally remove `postcss` and `autoprefixer` devDeps if not used elsewhere.
- Why:
  - Prevents preprocessing errors/misconfig stemming from a missing PostCSS config and simplifies the toolchain.
- Svelte 5 alignment:
  - `vitePreprocess` is optional; removing PostCSS config does not affect runes or Svelte 5 features. Effects/props/state remain unchanged (ref: Svelte runes + lifecycle docs).

## 2) Clean up global listeners in `src/routes/+layout.svelte`
- Action:
  - Store the `window` listener callbacks and remove them in `onDestroy`, or attach them inside `$effect` and return a teardown function.
- Why:
  - Avoid duplicate handlers and memory leaks during HMR and navigation; stabilizes DX and error reporting.
- Svelte 5 alignment:
  - Official guidance: effects can return a teardown; `onMount`/`onDestroy` remain valid in Svelte 5 (ref: `$effect` cleanup + lifecycle docs).

## 3) Standardize on one package manager; remove Bun artifacts
- Action:
  - Remove `bun` from `dependencies` and delete `bun.lock`/`bun.lockb`.
  - Keep a single lockfile (e.g., npm’s `package-lock.json`), and add a Node version in `package.json#engines` to match CI/dev.
- Why:
  - Eliminates cross-manager drift and install/build flakiness.
- Svelte 5 alignment:
  - Tooling-only; no impact on Svelte 5 runtime or compiler behavior.

## 4) Modularize `src/app.css` into tokens/base/components/utilities
- Action:
  - Extract theme tokens and root/dark variables (tokens.css), base styles/backgrounds (base.css), reusable component styles (components.css), and custom `@utility` blocks (utilities.css). Re-import from a slim `app.css`.
- Why:
  - Improves readability, PR review clarity, and reduces accidental regressions in styling.
- Svelte 5 alignment:
  - Pure CSS organization; no change to Svelte 5 runes or component logic.

## 5) Remove Font Awesome CDN in `src/app.html`; rely on `lucide-svelte`
- Action:
  - Remove the external `<link>` to Font Awesome; use existing `lucide-svelte` icons (already in use).
- Why:
  - Reduces external dependencies, improves CSP posture and load performance, and avoids icon style conflicts.
- Svelte 5 alignment:
  - Markup-only; no effect on runes or Svelte lifecycle.
