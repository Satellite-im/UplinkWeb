import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import { fileURLToPath, URL } from 'url';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const warpWasmPath = path.resolve(__dirname, 'warp-wasm')

export default defineConfig({
  plugins: [sveltekit(), nodePolyfills()],
  server: {
    fs: {
      // Allow access to the warp-wasm package directory
      allow: [warpWasmPath]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "src/variables.scss" as *;',
      },
    },
  },
})

