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
    server: {
        host: "0.0.0.0",
        port: 5173,
    },
    resolve: {
        alias: {
            $lib: path.resolve(__dirname, "src/lib"),
            "@": path.resolve(__dirname, "src"),
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
                additionalData: '@use "@/variables.scss" as *;',
                api: "modern-compiler",
                importers: [
                    // ...
                ],
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
