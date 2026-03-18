export default {
  testEnvironment: "jsdom",
  transform: {},
  moduleNameMapper: {},
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  setupFiles: ["<rootDir>/tests/setup-globals.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js", "!node_modules/**"],
  collectCoverage: true,
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 50,
    },
  },
};
