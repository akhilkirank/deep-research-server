/**
 * Test Mock Mode
 *
 * This script tests the mock mode functionality by performing a simple research query
 * without using real API tokens. It's useful for development and testing.
 */

// Load environment variables
require('dotenv').config();

// Force mock mode for this test
process.env.USE_MOCK_MODE = 'true';

// Set log level to info for this test
process.env.LOG_LEVEL = 'info';

// Add console logs for debugging
console.log('Starting test-mock-mode.js');
console.log('Environment variables:', {
  USE_MOCK_MODE: process.env.USE_MOCK_MODE,
  LOG_LEVEL: process.env.LOG_LEVEL,
  DEFAULT_LLM_PROVIDER: process.env.DEFAULT_LLM_PROVIDER
});

// Import required modules
const research = require('./src/utils/research');
const logger = require('./src/utils/logger');

// Create a logger for this test
const log = logger.child({ component: 'test-mock-mode' });

// Test function
async function testMockMode() {
  log.info('Starting mock mode test');

  try {
    // Test creating a provider
    log.info('Testing provider creation');
    const googleProvider = research.createProvider('google', 'gemini-1.5-pro');
    const openRouterProvider = research.createProvider('openrouter', 'anthropic/claude-3-opus:beta');
    const mockProvider = research.createProvider('mock', 'test-model');

    log.info('Successfully created providers');

    // Test generating search queries
    log.info('Testing search query generation');
    const queryResult = await research.generateSearchQueries(
      'Artificial Intelligence',
      'en-US',
      'google', // This should be overridden to mock
      'gemini-1.5-pro',
      'default',
      'standard'
    );

    log.info('Generated search queries', {
      queryCount: queryResult.queries.length,
      firstQuery: queryResult.queries[0]?.query
    });

    // Test direct research
    log.info('Testing direct research');
    const report = await research.performDirectResearch(
      'Artificial Intelligence',
      'en-US',
      'google', // This will be automatically overridden to mock when USE_MOCK_MODE=true
      'gemini-1.5-pro',
      'tavily', // This will be automatically overridden to mock when USE_MOCK_MODE=true
      1,
      {
        promptType: 'default',
        reportStyle: '',
        detailLevel: 'standard'
      }
    );

    log.info('Generated research report', {
      reportLength: report.length,
      reportPreview: report.substring(0, 100) + '...'
    });

    log.info('Mock mode test completed successfully');
  } catch (error) {
    log.error('Error in mock mode test', {
      error: error.message,
      stack: error.stack
    });
  }
}

// Run the test
testMockMode();
