import adapter from '@sveltejs/adapter-static';

const base = process.env.BASE_PATH || '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html'
		}),
		paths: {
			base
		},
		prerender: {
			handleUnseenRoutes: 'ignore'
		}
	}
};

export default config;
