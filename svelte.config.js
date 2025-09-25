// svelte.config.js
import adapter from '@sveltejs/adapter-static';

const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),

		paths: {
			base: process.env.NODE_ENV === 'production' ? '' : ''
		},

		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn',
			entries: ['*']
		}
	}
};

export default config;
