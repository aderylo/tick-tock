import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-static creates a static build in the 'build' directory
		// See https://svelte.dev/docs/kit/adapter-static
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html', // Changed from index.html to avoid overwriting the main page
			precompress: false,
			strict: true
		}),
		paths: {
			relative: true
		}
	}
};

export default config;
