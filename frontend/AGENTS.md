# Repository Guidelines

## Project Structure & Modules
- `src/routes`: SvelteKit pages/layouts (e.g., `+layout.svelte`, `+page.svelte`), with page tests like `page.svelte.spec.ts`.
- `src/lib`: shared code — `components/` (UI, prefer PascalCase, e.g., `Canvas.svelte`), `stores*.ts`, `utils*.ts`, `api.ts`, `ws.ts`.
- `static/`: public assets served as-is.
- Config: `svelte.config.js`, `vite.config.ts`, `tailwind.config.cjs`, `eslint.config.js`, `tsconfig.json`.

## Build, Test, and Development
- `npm run dev`: start Vite dev server on `http://localhost:5173`.
- `npm run build`: production build via Vite/SvelteKit.
- `npm run preview`: preview the production build.
- `npm run check` / `check:watch`: Svelte type/diagnostic checks.
- `npm run lint`: Prettier check + ESLint.
- `npm run format`: format code with Prettier.
- `npm test`: run Vitest once (CI-friendly). `npm run test:unit` for interactive/watch.
Note: Use npm/pnpm/bun; examples use npm. Install deps first (e.g., `npm i`).

## Coding Style & Naming
- Formatting: Prettier (tabs, single quotes, width 100). Run `npm run format`.
- Linting: ESLint (Svelte, TS, Prettier config). Run `npm run lint`.
- Components: PascalCase Svelte files (e.g., `ScreenFrame.svelte`); route files follow SvelteKit (`+page.svelte`).
- TypeScript-first: avoid `any`; prefer explicit types and readable names.

## Testing Guidelines
- Framework: Vitest with browser (Playwright) and node environments.
- Locations: colocate tests as `*.{test,spec}.ts` and `*.svelte.{test,spec}.ts` under `src/`.
- Patterns: client tests include `src/**/*.svelte.{test,spec}.{js,ts}`; server tests include `src/**/*.{test,spec}.{js,ts}` (excluding Svelte tests).
- Expectations: assertions required; write focused, deterministic tests.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject. Prefer Conventional Commits (e.g., `feat(ui): add Canvas selection`).
- PRs: clear description, linked issues, screenshots for UI changes, and a short testing checklist.
- Before opening: run `npm run lint`, `npm test`, and ensure `npm run build` succeeds.

## Security & Configuration Tips
- Do not commit secrets. Keep credentials server-side; never embed tokens in client code.
- Environment: SvelteKit adapter-auto; dev server port is 5173 (see `vite.config.ts`).
