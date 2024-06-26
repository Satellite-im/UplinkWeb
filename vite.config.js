import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import removeAttribute from "@castlenine/vite-remove-attribute"
import { resolve } from 'path';


const IS_PRODUCTION = process.env.NODE_ENV == "production"

export default defineConfig({
    resolve: {
        alias: [
          {
            find: /^\$lib\/state\/(.*)$/,
            replacement: resolve(__dirname, 'src/lib/state/$1'),
          },
          {
            find: /^\$lib\/(.*)$/,
            replacement: resolve(__dirname, 'src/lib/$1'),
          }
        ],
      },
    plugins: [
        IS_PRODUCTION
            ? removeAttribute({
                  extensions: ["svelte"],
                  attributes: ["data-cy", "hook"],
              })
            : null,
        sveltekit(),
        nodePolyfills(),
    ],
    optimizeDeps: {
        exclude: ["warp-wasm"],
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: '@use "src/variables.scss" as *;',
            },
        },
    },
})
