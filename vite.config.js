import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import removeAttribute from "@castlenine/vite-remove-attribute"
import path from "path"
import { execSync } from "child_process"

// Function to get the latest Git commit hash
function getCommitHash() {
    try {
        return execSync("git rev-parse HEAD").toString().trim()
    } catch (error) {
        console.error("Error fetching commit hash:", error)
        return "unknown"
    }
}

const IS_PRODUCTION = process.env.NODE_ENV === "production"

export default defineConfig({
    resolve: {
        alias: {
            $lib: path.resolve(__dirname, "src/lib"),
        },
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
    define: {
        __COMMIT_HASH__: JSON.stringify(getCommitHash()),
    },
    envPrefix: ["VITE_", "TAURI_"],
    build: {
        target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
        minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
        sourcemap: !!process.env.TAURI_DEBUG,
    },
})
