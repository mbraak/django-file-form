import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Use the browser build of tus-js-client, like rollup.config.mjs
    alias: {
      "tus-js-client": "tus-js-client/lib/browser/index.js"
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
