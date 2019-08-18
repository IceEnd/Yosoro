// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  verbose: true,
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/lib/', '<rootDir>/out/'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/lib/', '<rootDir>/out/'],
};
