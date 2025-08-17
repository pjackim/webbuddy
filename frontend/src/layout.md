# Svelte 5 Project Structure Reorganization Plan

Based on a review of the Svelte 5 documentation and analysis of the project structure, here is a plan for reorganizing the `src/lib/` folder to align with Svelte 5 features and best practices.

## Folder Structure Analysis and Recommendations

Here are concise descriptions for each folder's purpose under Svelte 5 best practices:

*   **`src/lib/api/`**: This folder should contain functions for making external API calls. With Svelte 5, you can leverage `.svelte.js` or `.svelte.ts` files to create reusable, reactive data-fetching logic that can be used across multiple components.

*   **`src/lib/assets/`**: This directory is for static assets like images, fonts, and icons that are imported directly into your components. Vite will process these assets, and you can use them with `@sveltejs/enhanced-img` for optimization.

*   **`src/lib/components/`**: This folder will house your reusable Svelte components. With Svelte 5's introduction of snippets, you can create more flexible and composable components, reducing the need for complex slot-based layouts.
    *   **`ui/`**: This subfolder is ideal for base UI elements like buttons, inputs, and cards, which are often part of a design system.

*   **`src/lib/config/`**: This directory is suitable for application-wide configuration, such as feature flags, constants, or settings that don't belong in environment variables.

*   **`src/lib/features/`**: This folder is well-suited for self-contained feature modules. Each feature folder can contain its own components, stores, and logic, promoting a modular architecture.

*   **`src/lib/hooks/`**: In Svelte 5, this folder's role shifts. While SvelteKit hooks (`hooks.server.js`, `hooks.client.js`) remain at the `src/` level, this directory can be repurposed for custom reactive logic using `.svelte.js`/`.svelte.ts` files, effectively creating "runic" hooks.

*   **`src/lib/stores/`**: With Svelte 5 runes, the need for traditional Svelte stores is greatly diminished. Global reactive state can be managed using `$state` in `.svelte.ts` files. This folder should be phased out, with its logic migrated to `.svelte.ts` files, possibly within `src/lib/state` or co-located with relevant features.

*   **`src/lib/ui/`**: This folder appears to be redundant with `src/lib/components/ui/`. It is recommended to consolidate all UI components into a single location, preferably `src/lib/components/ui/`, to avoid confusion.

*   **`src/lib/utils/`**: This is the perfect place for utility functions that are not specific to any single component or feature, such as date formatting, string manipulation, or other general-purpose helpers.

*   **`src/lib/vendor/`**: This folder is for third-party libraries or components that are not managed via npm.
    *   **`shadcn/`**: This is a good place to keep components from the shadcn-svelte library, keeping them separate from your custom application components.

## File Roles and Descriptions

Here are the roles of the specified individual files:

*   **`demo.spec.ts`**: This is likely an end-to-end test file for the demo functionality of your application, probably using a testing framework like Playwright or Cypress.

*   **`svelte-ambient.d.ts`**: This is a TypeScript declaration file for providing ambient type definitions for Svelte-specific constructs, ensuring type safety within your `.svelte` files.

*   **`vite-env.d.ts`**: This file provides TypeScript type definitions for Vite-specific environment variables and features, such as `import.meta.env`.

*   **`page.svelte.spec.ts`**: This is a unit or component test file specifically for the `+page.svelte` component at the root of your application, likely using a testing framework like Vitest.

*   **`+error.svelte`**: This is a special SvelteKit file that defines a custom error page for its directory and all sub-routes. This one, being at the root, serves as the application-wide error page.

*   **`+layout.svelte`**: This is the root layout component for your SvelteKit application. It wraps all pages and allows you to define a consistent structure, like navigation bars and footers, that is shared across your entire site.