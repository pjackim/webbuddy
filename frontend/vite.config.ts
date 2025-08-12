import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
	// Load environment variables
	const env = loadEnv(mode, process.cwd(), '');
	
	// Inject build timestamp
	if (command === 'build') {
		process.env.VITE_BUILD_TIMESTAMP = new Date().toISOString();
	}
	
	return {
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
		globals: true,
		coverage: {
			enabled: true,
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			reportsDirectory: './coverage',
			exclude: [
				'node_modules/**',
				'build/**',
				'dist/**',
				'.svelte-kit/**',
				'**/*.config.*',
				'**/*.d.ts',
				'src/routes/**/*.spec.ts',
				'src/**/*.test.ts',
				'**/*.svelte.spec.ts',
				'scripts/**'
			],
			all: true,
			thresholds: {
				global: {
					branches: 70,
					functions: 70,
					lines: 70,
					statements: 70
				}
			}
		},
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
	};
});
