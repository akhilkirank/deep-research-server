/**
 * Jest setup file
 *
 * This file runs before each test and sets up the environment.
 */

// Load environment variables from .env.test if it exists, otherwise from .env
const dotenv = require('dotenv');
const path = require('path');

const testEnvPath = path.resolve(process.cwd(), '.env.test');
const defaultEnvPath = path.resolve(process.cwd(), '.env');

// Try to load test environment variables first, then fall back to default
try {
  const testEnvResult = dotenv.config({ path: testEnvPath });
  if (testEnvResult.error) {
    // If .env.test doesn't exist, load .env
    dotenv.config({ path: defaultEnvPath });
  }
} catch (error) {
  // If there's an error loading .env.test, load .env
  dotenv.config({ path: defaultEnvPath });
}

// Set default environment variables for testing if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Configure logging for tests
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error'; // Reduce logging noise during tests
process.env.LOG_FORMAT = process.env.LOG_FORMAT || 'pretty'; // Use pretty format for better readability

// Mock API keys if not provided
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test_google_api_key';
}

if (!process.env.TAVILY_API_KEY) {
  process.env.TAVILY_API_KEY = 'test_tavily_api_key';
}

if (!process.env.OPENROUTER_API_KEY) {
  process.env.OPENROUTER_API_KEY = 'test_openrouter_api_key';
}

// Global test timeout (30 seconds)
jest.setTimeout(30000);

// Silence console during tests unless explicitly enabled
if (process.env.DEBUG_TESTS !== 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
