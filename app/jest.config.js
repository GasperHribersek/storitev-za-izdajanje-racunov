module.exports = {
  // Test environment configuration
  testEnvironment: 'node',
  
  // Coverage configuration
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'json', 'text', 'lcov'],

  // Files/paths to ignore from coverage (exclude DB and models until tested)
 coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/config/",
    "<rootDir>/src/models/",
    "<rootDir>/src/views/"
  ],
  // Coverage thresholds (optional)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Module paths
  moduleDirectories: ['node_modules', 'src'],
  
  // Transform settings (for ES modules if needed)
  transform: {},
  
  // Projects for different test environments
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['**/tests/backend/**/*.test.js']
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['**/tests/frontend/**/*.test.js']
    }
  ]
};
