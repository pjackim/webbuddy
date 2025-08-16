# GEMINI REQUIREMENTS


## VERY IMPORTANT: [READ **ALL** DOCUMENTATION]("../frontend/docs/")

> By default, use [shadcn-svelte components](../frontend/docs/shadcn-svelte/) for almost all UI elements.

Prioritize using components and logic described in the documentation. This will ensure consistency and maintainability across the project.
If online, you are required to use the `svelte5-documentation`, `konva-documentation`, `shadcn-documentation`  MCP Servers to access the latest documentation and code examples. This is not optional and must be followed strictly.

## DEVELOPMENT GUIDELINES:
- Keep routes for pages and layouts only. Move everything reusable to `src/lib`.
- Treat third-party UI like vendor code: isolate it under `lib/vendor/` and expose only your own wrappers from `lib/ui/` so swapping libraries later is painless.
- Use one Tailwindv4 entry CSS that imports a few tiny layer files (`base.css`, `components.css`, `utilities.css`) and optional theme tokens. Prefer Tailwindv4 classes in Svelte5 components; reserve @apply for patterns used 3+ times.
- Co-locate tiny, page-specific components next to the route. Move anything generic to `lib/`.
- Ensure pretty looking, human-readable logging (at least INFO and DEBUG levels).
- Don’t import from vendor anywhere except your wrappers.



## CODE STANDARDS:
- Use Svelte 5 for all components. Follow the [Svelte 5 documentation](../frontend/docs/Svelte-5-Documentation.md) like a bible.
- All code must be Dry, Clean, Efficient, modular, and reusable.
- Use Bun as the package manager. You should always ask and wait for the user to run bun commands. 


## UI and UX:
- The UI should be intuitive and user-friendly. Do not reinvent the wheel, use the existing components and patterns as defined in the [documentation](../frontend/docs/shadcn-svelte/).
