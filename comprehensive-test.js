/**
 * Comprehensive Test Script
 *
 * This script tests all the main components of the Deep Research Server.
 */

// Import modules
const logger = require('./src/utils/logger');
const { performSearch } = require('./src/utils/web-search');
const openRouter = require('./src/utils/openrouter');
const research = require('./src/utils/research');
const settings = require('./src/settings');

// Create a test logger with test category
const log = logger.child({ component: 'test', category: logger.CATEGORIES.TEST });

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Run a test and record the result
 */
async function runTest(name, testFn) {
  log.info(`Running test: ${name}`);

  try {
    await testFn();
    results.passed++;
    results.tests.push({ name, passed: true });
    log.info(`✅ Test passed: ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, passed: false, error: error.message });
    log.error(`❌ Test failed: ${name}`, { error: error.message, stack: error.stack });
  }
}

/**
 * Print test results with enhanced formatting
 */
function printResults() {
  const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
  };

  console.log(`\n${COLORS.bright}${COLORS.blue}==== TEST RESULTS ====${COLORS.reset}`);
  console.log(`${COLORS.green}Passed: ${results.passed}${COLORS.reset}`);
  console.log(`${results.failed > 0 ? COLORS.red : COLORS.green}Failed: ${results.failed}${COLORS.reset}`);
  console.log(`${COLORS.blue}Total: ${results.passed + results.failed}${COLORS.reset}`);

  if (results.failed > 0) {
    console.log(`\n${COLORS.bright}${COLORS.red}==== FAILED TESTS ====${COLORS.reset}`);
    results.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`${COLORS.red}❌ ${test.name}:${COLORS.reset} ${test.error}`);
      });
  }

  // Print success or failure message
  if (results.failed === 0) {
    console.log(`\n${COLORS.green}${COLORS.bright}✓ ALL TESTS PASSED${COLORS.reset}`);
  } else {
    console.log(`\n${COLORS.red}${COLORS.bright}✖ TESTS FAILED${COLORS.reset}`);
  }

  console.log(`\n${COLORS.blue}====================${COLORS.reset}`);
}

// Run all tests
async function runAllTests() {
  // Test logger
  await runTest('Logger - Basic functionality', async () => {
    log.debug('This is a debug message');
    log.info('This is an info message');
    log.warn('This is a warning message');
    log.error('This is an error message');

    // If we got here without errors, the test passed
    return true;
  });

  // Test child logger
  await runTest('Logger - Child loggers', async () => {
    const childLog = log.child({ subcomponent: 'child' });
    childLog.info('This is a message from a child logger');

    const nestedChildLog = childLog.child({ nestedComponent: 'nested' });
    nestedChildLog.info('This is a message from a nested child logger');

    // If we got here without errors, the test passed
    return true;
  });

  // Test web search
  await runTest('Web Search - Mock search', async () => {
    const results = await performSearch('Quantum computing', { searchProvider: 'mock' });

    if (!results || !results.results || !Array.isArray(results.results)) {
      throw new Error('Invalid search results format');
    }

    if (results.results.length !== 2) {
      throw new Error(`Expected 2 results, got ${results.results.length}`);
    }

    return true;
  });

  // Test Open Router
  await runTest('Open Router - Create model wrapper', async () => {
    const modelWrapper = openRouter.createModelWrapper({
      model: 'anthropic/claude-3-opus:beta',
      temperature: 0.7,
      maxTokens: 100
    });

    if (!modelWrapper || typeof modelWrapper.generateContent !== 'function') {
      throw new Error('Invalid model wrapper');
    }

    return true;
  });

  // Test research utility - getModel
  await runTest('Research - getModel', async () => {
    const googleModels = research.getModel('google');
    if (!googleModels.thinkingModel || !googleModels.networkingModel) {
      throw new Error('Invalid Google models');
    }

    const openRouterModels = research.getModel('openrouter');
    if (!openRouterModels.thinkingModel || !openRouterModels.networkingModel) {
      throw new Error('Invalid Open Router models');
    }

    return true;
  });

  // Test research utility - createProvider
  await runTest('Research - createProvider', async () => {
    const googleProvider = research.createProvider('google', 'gemini-1.5-pro');
    if (!googleProvider || typeof googleProvider.generateContent !== 'function') {
      throw new Error('Invalid Google provider');
    }

    const openRouterProvider = research.createProvider('openrouter', 'anthropic/claude-3-opus:beta');
    if (!openRouterProvider || typeof openRouterProvider.generateContent !== 'function') {
      throw new Error('Invalid Open Router provider');
    }

    return true;
  });

  // Test settings
  await runTest('Settings - App settings', async () => {
    if (!settings.app || !settings.app.appSettings) {
      throw new Error('Missing app settings');
    }

    if (!settings.app.appSettings.appName) {
      throw new Error('Missing app name');
    }

    return true;
  });

  await runTest('Settings - LLM settings', async () => {
    if (!settings.llm || !settings.llm.googleSettings) {
      throw new Error('Missing LLM settings');
    }

    if (!settings.llm.openRouterSettings) {
      throw new Error('Missing Open Router settings');
    }

    return true;
  });

  await runTest('Settings - Search settings', async () => {
    if (!settings.search || !settings.search.searchProviderSettings) {
      throw new Error('Missing search settings');
    }

    if (!settings.search.tavilySearchSettings) {
      throw new Error('Missing Tavily search settings');
    }

    return true;
  });

  // Print results
  printResults();
}

// Run all tests
runAllTests().catch(error => {
  log.error('Error running tests', { error: error.message, stack: error.stack });
  process.exit(1);
});
