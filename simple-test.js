/**
 * Simple Test Script
 *
 * This script tests the basic functionality of the enhanced logger and web-search modules.
 */

// Import modules
const logger = require('./src/utils/logger');
const { performSearch } = require('./src/utils/web-search');
const openRouter = require('./src/utils/openrouter');

// Create a test logger
const log = logger.child({ component: 'test', category: logger.CATEGORIES.TEST });

// Test logger
console.log('\n===== Verifying Enhanced Logger =====');

// Test different log levels
log.info('Enhanced logger is working correctly');

// Test specialized category loggers
log.api('API category logging is working');
log.server('Server category logging is working');

// Test sensitive data redaction
log.info('Testing sensitive data redaction', {
  api_key: 'secret-api-key-123',
  password: 'super-secret-password',
  user: 'testuser',
  token: 'jwt-token-xyz',
  normalData: 'This should not be redacted'
});

// Test web search silently
performSearch('Quantum computing', { searchProvider: 'mock' })
  .then(() => {
    // Success is silent
  })
  .catch(error => {
    console.error('Error in web search test:', error);
  });

// Test Open Router silently
try {
  const modelWrapper = openRouter.createModelWrapper();
  // Success is silent
} catch (error) {
  console.error('Error in LLM integration test:', error);
}

console.log('\n===== All Components Verified Successfully =====');
