import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook: new URL('./src/lib/layouts/runbook.svelte', import.meta.url).pathname } })],
      adapter: adapter(),
      alias: { '#lib': 'src/lib' },
      prerender: { handleHttpError: 'warn' },
    }),
  ],
});
