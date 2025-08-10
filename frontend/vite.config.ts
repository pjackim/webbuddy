import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	server: { port: 5173, host: true },
	// Ensure Vitest resolves browser entry points when running under the Vitest process
	// to match Svelte 5 + Vite expectations during tests
	resolve:
		// Avoid requiring @types/node: check via globalThis
		typeof globalThis !== 'undefined' &&
		typeof (globalThis as any).process !== 'undefined' &&
		Boolean((globalThis as any).process?.env?.VITEST)
			? {
					conditions: ['browser']
				}
			: undefined,
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				test: {
					name: 'server',
					environment: 'node',
					// Use a safer process-based pool in Docker/Bun environments
					// to avoid worker-specific issues in some runtimes
					pool: 'forks',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
