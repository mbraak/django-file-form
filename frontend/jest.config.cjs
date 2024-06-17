module.exports = {
  setupFiles: ["./jestSetup/setupDragEvents.ts"],
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["node_modules/(?!(mime)/)"]
};
