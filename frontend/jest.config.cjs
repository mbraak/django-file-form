module.exports = {
  setupFiles: ["./setup-drag-events.js"],
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["node_modules/(?!(mime)/)"]
};
