export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { presets: ["@babel/preset-env"] }],
  },
  extensionsToTreatAsEsm: [],
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
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  globals: {
    jest: true,
  },
};