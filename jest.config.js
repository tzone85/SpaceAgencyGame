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
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  globals: {
    jest: true,
  },
};