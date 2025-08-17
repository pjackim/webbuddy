# Svelte 5 Project Structure Reorganization Plan

Based on a review of the Svelte 5 documentation and analysis of the project structure, here is a plan for reorganizing the `src/lib/` folder to align with Svelte 5 features and best practices.

## Folder Structure Analysis and Recommendations

| Item                         | Description |
|-----------------------------|-------------|
| `src/lib/api/`                | Functions for external API calls. Use .svelte.js/.svelte.ts for reusable, reactive data-fetching logic. |
| `src/lib/assets/`             | Static assets (images, fonts, icons) imported into components. Use @sveltejs/enhanced-img for optimization. |
| `src/lib/components/`         | Reusable Svelte components. Prefer Svelte 5 snippets for flexible composition. |
| `src/lib/components/ui/`      | Base UI elements (buttons, inputs, cards) for the design system. |
| `src/lib/config/`             | App-wide configuration like feature flags and constants (non-env). |
| `src/lib/features/`           | Self-contained feature modules with their components and logic. |
| `src/lib/hooks/`              | Custom reactive logic using .svelte.js/.svelte.ts (“runic” hooks). SvelteKit hooks stay in src/. |
| `src/lib/stores/`             | Role reduced by runes. Reserve for advanced cases: complex async logic (e.g., WebSockets), custom store contracts, and animation stores (tweened, spring). Refactor simple stores to runic state. |
| `src/lib/ui/`                 | Redundant with src/lib/components/ui/; consolidate into components/ui. |
| `src/lib/utils/`              | General-purpose utilities (dates, strings, helpers). |
| `src/lib/vendor/`             | Third-party/vendor code not managed via npm. Wrap and expose via lib/ui as needed. |
| `src/lib/vendor/shadcn/`      | shadcn-svelte components isolated from app components. |

## File Roles and Descriptions

| File                 | Role/Description |
|----------------------|------------------|
| demo.spec.ts         | End-to-end test for demo flows (e.g., Playwright/Cypress). |
| svelte-ambient.d.ts  | Ambient TypeScript declarations for Svelte-specific types. |
| vite-env.d.ts        | Type definitions for Vite (e.g., import.meta.env). |
| page.svelte.spec.ts  | Unit/component test for the root +page.svelte (e.g., Vitest). |
| +error.svelte        | Root error page for the app and sub-routes. |
| +layout.svelte       | Root layout wrapping all pages (nav, footer, shared UI). |
