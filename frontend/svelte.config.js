import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: sveltePreprocess({
        postcss: {
            configFilePath: join(__dirname, 'postcss.config.cjs')
        }
    }),
	kit: { adapter: adapter() }
};
