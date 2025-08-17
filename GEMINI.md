# GEMINI REQUIREMENTS


## VERY IMPORTANT: [READ **ALL** DOCUMENTATION]("./frontend/docs/")

> By default, use [shadcn-svelte components](./frontend/docs/shadcn-svelte/) for almost all UI elements.


Prioritize using components and logic described in the documentation. This will ensure consistency and maintainability across the project.

You are required to use the following tools to access documentation, search, read/write files, and run commands. This is not optional and must be followed strictly.
- Edit
- FindFiles
- GoogleSearch
- ReadFile
- ReadFolder
- ReadManyFiles
- Save Memory
- SearchText
- Shell
- WebFetch
- WriteFile

## Tool usage best practices
- WebFetch: Programmatically test the running site (e.g., http://localhost:5173) and relevant endpoints. Validate status codes, headers, and HTML to confirm flows.
- Save Memory: Persist project invariants and decisions (e.g., “Use shadcn-svelte for all UI; replace vanilla HTML with shadcn components”, “Svelte 5 only”, “dev server: localhost:5173”) so they are auto-recalled.
- GoogleSearch: Research libraries, error messages, and ideal implementation patterns. Prefer official docs and reputable sources; cross-check before adoption.

## CODE STANDARDS:
- Use Svelte 5 for all components.
- Follow the [Svelte 5 documentation](./frontend/docs/Svelte-5-Documentation.md) like a bible.
- All code must be Dry, Clean, Efficient, modular, and reusable.
- Ensure pretty human-readable logging (at least INFO and DEBUG).


## UI and UX:
- The UI should be intuitive and user-friendly. Do not reinvent the wheel, use the existing components and patterns as defined in the [documentation](./frontend/docs/shadcn-svelte/).


## Reminders:

- There is a hot-reload dev server running on port localhost:5173. No need for you to restart any thing.
- You should require the user to install any new packages or libraries. Pause and wait for the user to install them before proceeding.
- You have the ability to view the website in a browser. Use this to test your code and ensure it works as expected.
