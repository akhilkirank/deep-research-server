/**
 * Jest configuration file
 *
 * This configuration includes a custom reporter for cleaner test output
 * and better error reporting.
 */
module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    '/node_modules/'
  ],

  // Use our custom reporter for cleaner output
  reporters: [
    ['./jest-custom-reporter.js', {}]
  ],

  // Disable verbose mode since our custom reporter handles output
  verbose: false,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover'
  ],

  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',

  // A map from regular expressions to paths to transformers
  transform: {},

  // Setup files that will be run before each test
  setupFiles: ['./tests/setup.js'],

  // Display test results with colors
  // colors: true, // This option is causing warnings, using the default

  // Only show the most useful information in test output
  errorOnDeprecated: true,

  // Fail tests on console.error calls
  // This helps catch unexpected errors that might be logged
  // Comment this out if you have legitimate console.error calls in your code
  // that shouldn't fail tests
  // errorOnConsole: true,

  // Stop running tests after the first failure
  // bail: true,

  // Respect the NODE_ENV when running tests
  testEnvironmentOptions: {
    NODE_ENV: process.env.NODE_ENV || 'test'
  }
};
