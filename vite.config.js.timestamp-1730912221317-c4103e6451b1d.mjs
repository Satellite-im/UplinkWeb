// vite.config.js
import { sveltekit } from "file:///Users/vague/Development/UplinkWeb/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///Users/vague/Development/UplinkWeb/node_modules/vite/dist/node/index.js";
import { nodePolyfills } from "file:///Users/vague/Development/UplinkWeb/node_modules/vite-plugin-node-polyfills/dist/index.js";
import removeAttribute from "file:///Users/vague/Development/UplinkWeb/node_modules/@castlenine/vite-remove-attribute/dist/index.js";
import path from "path";
import { execSync } from "child_process";
var __vite_injected_original_dirname = "/Users/vague/Development/UplinkWeb";
function getCommitHash() {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch (error) {
    console.error("Error fetching commit hash:", error);
    return "unknown";
  }
}
var IS_PRODUCTION = process.env.NODE_ENV === "production";
var vite_config_default = defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173
  },
  resolve: {
    alias: {
      $lib: path.resolve(__vite_injected_original_dirname, "src/lib"),
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  plugins: [
    IS_PRODUCTION ? removeAttribute({
      extensions: ["svelte"],
      attributes: ["data-cy", "hook"]
    }) : null,
    sveltekit(),
    nodePolyfills()
  ],
  optimizeDeps: {
    exclude: ["warp-wasm"]
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/variables.scss" as *;',
        api: "modern-compiler",
        importers: [
          // ...
        ]
      }
    }
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(getCommitHash())
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG
  },
  esbuild: {
    supported: {
      bigint: true
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdmFndWUvRGV2ZWxvcG1lbnQvVXBsaW5rV2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvdmFndWUvRGV2ZWxvcG1lbnQvVXBsaW5rV2ViL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy92YWd1ZS9EZXZlbG9wbWVudC9VcGxpbmtXZWIvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tIFwiQHN2ZWx0ZWpzL2tpdC92aXRlXCJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCJcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tIFwidml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIlxuaW1wb3J0IHJlbW92ZUF0dHJpYnV0ZSBmcm9tIFwiQGNhc3RsZW5pbmUvdml0ZS1yZW1vdmUtYXR0cmlidXRlXCJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIlxuXG4vLyBGdW5jdGlvbiB0byBnZXQgdGhlIGxhdGVzdCBHaXQgY29tbWl0IGhhc2hcbmZ1bmN0aW9uIGdldENvbW1pdEhhc2goKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGV4ZWNTeW5jKFwiZ2l0IHJldi1wYXJzZSBIRUFEXCIpLnRvU3RyaW5nKCkudHJpbSgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGZldGNoaW5nIGNvbW1pdCBoYXNoOlwiLCBlcnJvcilcbiAgICAgICAgcmV0dXJuIFwidW5rbm93blwiXG4gICAgfVxufVxuXG5jb25zdCBJU19QUk9EVUNUSU9OID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgc2VydmVyOiB7XG4gICAgICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgICAgICBwb3J0OiA1MTczLFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgJGxpYjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvbGliXCIpLFxuICAgICAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgICBJU19QUk9EVUNUSU9OXG4gICAgICAgICAgICA/IHJlbW92ZUF0dHJpYnV0ZSh7XG4gICAgICAgICAgICAgICAgICBleHRlbnNpb25zOiBbXCJzdmVsdGVcIl0sXG4gICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbXCJkYXRhLWN5XCIsIFwiaG9va1wiXSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgc3ZlbHRla2l0KCksXG4gICAgICAgIG5vZGVQb2x5ZmlsbHMoKSxcbiAgICBdLFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgICBleGNsdWRlOiBbXCJ3YXJwLXdhc21cIl0sXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICAgICAgc2Nzczoge1xuICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiAnQHVzZSBcIkAvdmFyaWFibGVzLnNjc3NcIiBhcyAqOycsXG4gICAgICAgICAgICAgICAgYXBpOiBcIm1vZGVybi1jb21waWxlclwiLFxuICAgICAgICAgICAgICAgIGltcG9ydGVyczogW1xuICAgICAgICAgICAgICAgICAgICAvLyAuLi5cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgICBfX0NPTU1JVF9IQVNIX186IEpTT04uc3RyaW5naWZ5KGdldENvbW1pdEhhc2goKSksXG4gICAgfSxcbiAgICBlbnZQcmVmaXg6IFtcIlZJVEVfXCIsIFwiVEFVUklfXCJdLFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIHRhcmdldDogcHJvY2Vzcy5lbnYuVEFVUklfUExBVEZPUk0gPT0gXCJ3aW5kb3dzXCIgPyBcImNocm9tZTEwNVwiIDogXCJzYWZhcmkxM1wiLFxuICAgICAgICBtaW5pZnk6ICFwcm9jZXNzLmVudi5UQVVSSV9ERUJVRyA/IFwiZXNidWlsZFwiIDogZmFsc2UsXG4gICAgICAgIHNvdXJjZW1hcDogISFwcm9jZXNzLmVudi5UQVVSSV9ERUJVRyxcbiAgICB9LFxuICAgIGVzYnVpbGQ6IHtcbiAgICAgICAgc3VwcG9ydGVkOiB7XG4gICAgICAgICAgICBiaWdpbnQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdSLFNBQVMsaUJBQWlCO0FBQ2xULFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMscUJBQXFCO0FBQzlCLE9BQU8scUJBQXFCO0FBQzVCLE9BQU8sVUFBVTtBQUNqQixTQUFTLGdCQUFnQjtBQUx6QixJQUFNLG1DQUFtQztBQVF6QyxTQUFTLGdCQUFnQjtBQUNyQixNQUFJO0FBQ0EsV0FBTyxTQUFTLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxLQUFLO0FBQUEsRUFDMUQsU0FBUyxPQUFPO0FBQ1osWUFBUSxNQUFNLCtCQUErQixLQUFLO0FBQ2xELFdBQU87QUFBQSxFQUNYO0FBQ0o7QUFFQSxJQUFNLGdCQUFnQixRQUFRLElBQUksYUFBYTtBQUUvQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsTUFBTSxLQUFLLFFBQVEsa0NBQVcsU0FBUztBQUFBLE1BQ3ZDLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUN0QztBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLGdCQUNNLGdCQUFnQjtBQUFBLE1BQ1osWUFBWSxDQUFDLFFBQVE7QUFBQSxNQUNyQixZQUFZLENBQUMsV0FBVyxNQUFNO0FBQUEsSUFDbEMsQ0FBQyxJQUNEO0FBQUEsSUFDTixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsRUFDbEI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNWLFNBQVMsQ0FBQyxXQUFXO0FBQUEsRUFDekI7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNELHFCQUFxQjtBQUFBLE1BQ2pCLE1BQU07QUFBQSxRQUNGLGdCQUFnQjtBQUFBLFFBQ2hCLEtBQUs7QUFBQSxRQUNMLFdBQVc7QUFBQTtBQUFBLFFBRVg7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLGlCQUFpQixLQUFLLFVBQVUsY0FBYyxDQUFDO0FBQUEsRUFDbkQ7QUFBQSxFQUNBLFdBQVcsQ0FBQyxTQUFTLFFBQVE7QUFBQSxFQUM3QixPQUFPO0FBQUEsSUFDSCxRQUFRLFFBQVEsSUFBSSxrQkFBa0IsWUFBWSxjQUFjO0FBQUEsSUFDaEUsUUFBUSxDQUFDLFFBQVEsSUFBSSxjQUFjLFlBQVk7QUFBQSxJQUMvQyxXQUFXLENBQUMsQ0FBQyxRQUFRLElBQUk7QUFBQSxFQUM3QjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsV0FBVztBQUFBLE1BQ1AsUUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
