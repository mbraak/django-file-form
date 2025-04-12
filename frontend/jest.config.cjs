module.exports = {
  coverageReporters: ["lcov", "text"],
  setupFiles: ["./jestSetup/setupDragEvents.ts"],
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["node_modules/(?!(mime|url-join)/)"]
};
