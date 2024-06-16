module.exports = {
  setupFiles: ["./jestSetup/setupDragEvents.js"],
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["node_modules/(?!(mime)/)"]
};
