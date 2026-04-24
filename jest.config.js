export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": ["babel-jest", { rootMode: "upward" }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  setupFiles: ["<rootDir>/tests/setup-globals.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup-test-env.js"],
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
