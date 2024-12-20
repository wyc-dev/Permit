import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	assetsInclude: ['**/*.glb'],
	plugins: [sveltekit()],
	  ssr: {
		noExternal: ['@ton/ton', 'tonweb']
	  }
});
