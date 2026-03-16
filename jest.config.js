export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/tests/setup-webgl.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-webgl.js'],
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js"],
  collectCoverage: false, // Disable coverage for now to focus on functionality
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  globals: {
    jest: true,
  },
};