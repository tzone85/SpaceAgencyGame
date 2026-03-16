export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/tests/setup-webgl.js', '/tests/structure.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-webgl.js'],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!node_modules/**",
  ],
  collectCoverage: false,
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  globals: {
    jest: true,
  },
};