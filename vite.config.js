import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import { fileURLToPath, URL } from 'url';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [sveltekit(), nodePolyfills()],
  optimizeDeps: {
    exclude: ["warp-wasm"]
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "src/variables.scss" as *;',
      },
    },
  },
})

