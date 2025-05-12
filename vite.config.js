import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  assetsInclude: ['**/*.glb'],
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['@ton/ton', 'tonweb']
  },
  server: {
    allowedHosts: ['7cd62161-ed7b-47e8-8dd4-f782b3b1556f-00-1v5arvbwpnaop.picard.replit.dev']
  }
});