import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Use the browser build of tus-js-client, like rollup.config.mjs
    alias: {
      "tus-js-client": fileURLToPath(
        new URL(
          "./node_modules/tus-js-client/lib.esm/browser/index.js",
          import.meta.url
        )
      )
    }
  },
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["lcov", "text"]
    },
    environment: "jsdom",
    server: {
      deps: {
        inline: ["tus-js-client"]
      }
    },
    setupFiles: ["./testSetup/vitestSetup.ts"]
  }
});
