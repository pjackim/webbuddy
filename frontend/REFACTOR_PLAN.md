# AGENTS Frontend Refactor

VERY IMPORTANT: [READ **ALL** DOCUMENTATION]("../docs/")

Try not to change the resulting behavior (Or Style!) of the app, just the structure and organization of the project.

## Notes:
- Svelte5
- Tailwindv4
- Bun package manager
- Daily UI components
- `Shadcn-svelte` components and `Shadcn-svelte-extras`
    - Follow the [documentation](../docs/shadcn-svelte/) for UI components and patterns.


## Big ideas (TL;DR)

* Keep **routes** for pages and layouts only. Move everything reusable to **src/lib**.
* Treat third-party UI like **vendor code**: isolate it under `lib/vendor/` and expose only your **own wrappers** from `lib/ui/` so swapping libraries later is painless.
* Use **one Tailwind entry CSS** that imports a few tiny layer files (`base.css`, `components.css`, `utilities.css`) and optional **theme tokens**. Prefer Tailwind classes in Svelte components; reserve `@apply` for patterns used 3+ times.
* Co-locate tiny, page-specific components next to the route. Move anything generic to `lib/`.


---

# Suggested frontend layout

```
frontend/
├─ src/
│  ├─ app.html
│  ├─ app.d.ts
│  ├─ routes/
│  │  ├─ +layout.svelte
│  │  ├─ +page.svelte
│  │  ├─ (marketing)/...            # route groups
│  │  ├─ (app)/...                  # protected app
│  │  └─ error/+page.svelte
│  ├─ lib/
│  │  ├─ api/                       # fetchers, typed clients
│  │  │  └─ client.ts
│  │  ├─ assets/                    # app-owned assets (icons, svgs)
│  │  ├─ config/                    # constants/env mapping
│  │  ├─ stores/                    # writable/derived stores
│  │  ├─ utils/                     # helpers (date, classnames, etc.)
│  │  ├─ hooks/                     # tiny composables (use-*)
│  │  ├─ vendor/                    # third-party components (read-only)
│  │  │  └─ shadcn/… or radix/…
│  │  ├─ ui/                        # YOUR public UI surface (thin wrappers)
│  │  │  ├─ button/
│  │  │  │  ├─ Button.svelte        # wraps vendor, normalizes API
│  │  │  │  └─ index.ts
│  │  │  ├─ input/…
│  │  │  └─ index.ts                # barrel exports for ui/*
│  │  └─ features/                  # domain widgets (Canvas, Toolbar, etc.)
│  │     ├─ canvas/
│  │     │  ├─ Canvas.svelte
│  │     │  ├─ Grid.svelte
│  │     │  └─ index.ts
│  │     └─ error-panel/
│  │        ├─ ErrorPanel.svelte
│  │        └─ index.ts
│  ├─ styles/
│  │  ├─ app.css                    # single entry imported by app
│  │  ├─ base.css                   # @layer base
│  │  ├─ components.css             # @layer components (rare)
│  │  ├─ utilities.css              # tiny custom utilities (rare)
│  │  └─ theme.css                  # CSS vars / Tailwind v4 @theme tokens
│  ├─ ws.ts                         # websocket helper (or lib/ws/)
│  ├─ index.ts                      # lib re-exports
│  └─ vite-env.d.ts
├─ static/                          # public static files
│  └─ robots.txt
├─ svelte.config.js
├─ tailwind.config.(js|ts)?         # (v4 optional; keep only if needed)
├─ postcss.config.cjs
├─ tsconfig.json
└─ vite.config.ts
```

### Why these moves?

* `src/lib/vendor/*` holds **external** component source, untouched.
* `src/lib/ui/*` are your **wrappers** that stabilize props, class names, and slots so you can swap vendors later without hunting through your app.
* `src/lib/features/*` groups domain components (Canvas, Toolbar, ErrorPanel) so they don’t drown next to primitives.
* Route files stay lean—page orchestration only.

---

# Conventions for external UI

Because most of your `components/ui/*` are external:

1. **Vendor isolation**

   * Move them to `src/lib/vendor/shadcn/*` (or the library name).
   * Don’t import from `vendor` anywhere except your wrappers.

2. **Wrappers as your public API**

   * Create `src/lib/ui/button/Button.svelte` etc. Wrap the vendor component, set your defaults, and expose a stable prop API.
   * Export only from `lib/ui/index.ts`. Everywhere else in the app imports from `$lib/ui`.

3. **Class strategy**

   * Use Tailwind classes directly in wrappers.
   * If a class cluster repeats across multiple wrappers, extract it with `@apply` into `components.css` as a named utility (e.g., `.btn-base`), then `class="btn-base …"` in the wrapper.

4. **Theming**

   * Centralize colors, radii, spacing scales as CSS variables (or Tailwind v4 `@theme` tokens) in `styles/theme.css`.
   * Wrappers consume tokens via `var(--*)` or Tailwind token shortcuts so you can re-skin the whole app in one place.

---

# Tailwind v4: organizing multiple CSS files

**Entry point (`src/styles/app.css`)**

```css
/* app.css */
@import "tailwindcss";      /* v4 single import */
@import "./theme.css";      /* your design tokens */
@import "./base.css";
@import "./components.css";
@import "./utilities.css";
```

**Base layer (`base.css`)** — resets & element-level defaults only.

```css
@layer base {
  :root {
    /* fallback tokens (or keep them in theme.css via @theme) */
  }

  html, body { height: 100%; }
  body { @apply antialiased; }
}
```

**Components layer (`components.css`)** — extracted patterns you reuse a lot.

```css
@layer components {
  .btn-base { @apply inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition; }
  .card     { @apply rounded-xl border bg-background p-4 shadow-sm; }
}
```

**Utilities layer (`utilities.css`)** — tiny app-specific utilities you wish Tailwind had.

```css
@layer utilities {
  .content-auto { content-visibility: auto; }
}
```

**Theme tokens (`theme.css`)**

* Tailwind v4 is “CSS-first”: define tokens in CSS. If you’re using the new `@theme` API, put it here; otherwise define CSS variables.

```css
/* Option A: CSS variables */
:root {
  --color-bg: 255 255 255;            /* use rgb components for opacity support */
  --color-fg: 15 23 42;
  --radius-sm: 0.375rem;
}

[data-theme="dark"] {
  --color-bg: 2 6 23;
  --color-fg: 226 232 240;
}

/* Use in classes: bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] rounded-[var(--radius-sm)] */
```

> Keep only **one** Tailwind entry CSS (here: `app.css`). Splitting Tailwind into multiple entry points causes stylesheet duplication and JIT misses. Multiple files are fine as **imports** under that entry.

### Where to import `app.css`

* In SvelteKit, import it once in `src/routes/+layout.svelte`:

  ```svelte
  <script>
    import '$styles/app.css';
  </script>
  <slot />
  ```

---

# Mapping your current files → the new layout

* `src/lib/components/*`

  * Move domain pieces like `Canvas.svelte`, `KonvaGrid.svelte`, `ScreenFrame.svelte`, `Toolbar.svelte` into `src/lib/features/…`.
  * Keep tiny building blocks (badges, inputs) under your **wrappers** in `src/lib/ui/*`.

* `src/lib/components/ui/*` (mostly external now)

  * Move to `src/lib/vendor/shadcn/*` (read-only), then create wrappers in `src/lib/ui/*` that re-export what you actually use.

* `components.css` (your root)

  * Replace with the `styles/` folder above and import via `app.css`. Keep extracted patterns only; prefer Tailwind classes in components.

* `ws.ts`, stores, utils

  * Slide them under `src/lib/ws.ts`, `src/lib/stores/*`, `src/lib/utils/*`.

---

# Practical rules of thumb

**Routes**

* `+layout.svelte` loads global providers and `app.css`.
* Keep data loading in `+page.ts` / `+page.server.ts`. Components take **data as props**, not fetch inside.

**Components**

* Co-locate page-specific components next to the route (`routes/(app)/dashboard/Chart.svelte`).
* Promote to `lib/features/*` when reused across routes.
* Use `index.ts` barrel files in every folder to keep imports short.

**Styling**

* Prefer Tailwind classes inline for 80–90% of cases.
* Extract with `@apply` only when:

  * the class blob appears 3+ times **and** has meaning (e.g., “card body”).
* Avoid fighting Tailwind with lots of bespoke CSS—reach for tokens first.

**Theming / design tokens**

* All scales (colors, spacing, radius, shadows) live in `theme.css`.
* For dark mode, use a `data-theme` attribute on `<html>` and swap variables.
* Your wrappers translate tokens into Tailwind classes (e.g., `bg-[rgb(var(--color-bg))]`), so vendor components inherit theme automatically.

**3rd-party churn**

* Only your wrappers are imported app-wide. If you replace shadcn with another library, you touch a handful of files in `lib/ui/*`, not your pages.

**Aliases**

* In `tsconfig.json`, set:

  ```json
  {
    "compilerOptions": {
      "paths": {
        "$lib/*": ["src/lib/*"],
        "$styles/*": ["src/styles/*"]
      }
    }
  }
  ```

  Then import with `$lib/ui`, `$styles/app.css`, etc.

---

# Minimal Tailwind v4 setup (SvelteKit)

* **postcss.config.cjs**

  ```js
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
  ```
* **(Optional) tailwind.config.ts** — only if you add plugins or safelist. Otherwise v4 can be config-light.
* Put your only `@import "tailwindcss";` in `src/styles/app.css`.

---

# Want me to refactor the tree?

If you like, I can output a rename/move plan (a list of shell commands) to transform your current `frontend/src` into this structure, plus stub a few wrapper examples (e.g., `Button.svelte`, `Card.svelte`) wired to your tokens.
