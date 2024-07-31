import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import adapter from '@sveltejs/adapter-static'
import path from "node:path"
import { execSync } from 'child_process'

// Function to get the latest Git commit hash
function getCommitHash() {
    try {
        return execSync('git rev-parse HEAD').toString().trim()
    } catch (error) {
        console.error('Error fetching commit hash:', error)
        return 'unknown'
    }
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [
        vitePreprocess({}),
    ],
    kit: {
        adapter: adapter(),
        vite: {
            define: {
                __COMMIT_HASH__: JSON.stringify(getCommitHash()),
            },
            resolve: {
                alias: {
                    $lib: path.resolve('src/lib')
                }
            }
        }
    }
}

export default config
