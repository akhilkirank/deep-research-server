/**
 * Custom Jest Reporter
 *
 * This reporter provides cleaner, more focused test output:
 * - Shows a summary of passed/failed tests
 * - Only shows details for failed tests
 * - Provides timing information
 * - Formats output for better readability
 */

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class CleanReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.testResults = [];
    this.startTime = null;
    this.endTime = null;
  }

  onRunStart(results, options) {
    this.startTime = new Date();
    console.log('Determining test suites to run...');
  }

  onTestResult(test, testResult, aggregatedResult) {
    const { numFailingTests, numPassingTests, numPendingTests, testResults } = testResult;

    // Store test results for summary
    this.testResults.push({
      testFilePath: testResult.testFilePath,
      numFailingTests,
      numPassingTests,
      numPendingTests,
      testResults
    });

    // Only show the test file status when it completes
    const fileName = testResult.testFilePath.split('/').pop();
    const relativePath = testResult.testFilePath.replace(process.cwd(), '');

    if (numFailingTests > 0) {
      console.log(`${COLORS.red} FAIL ${COLORS.reset} ${relativePath}`);

      // Show details for failing tests
      testResults.forEach(result => {
        if (result.status === 'failed') {
          console.log(`\n  ${COLORS.red}✖ ${COLORS.reset}${result.title}\n`);

          // Show error message and stack trace
          if (result.failureMessages && result.failureMessages.length > 0) {
            result.failureMessages.forEach(message => {
              // Extract just the relevant part of the stack trace
              const cleanMessage = message
                .split('\n')
                .filter(line => !line.includes('node_modules/'))
                .slice(0, 10) // Limit stack trace length
                .join('\n');

              console.log(`    ${COLORS.dim}${cleanMessage}${COLORS.reset}\n`);
            });
          }
        }
      });
    } else {
      console.log(`${COLORS.green} PASS ${COLORS.reset} ${relativePath}`);
    }
  }

  onRunComplete(contexts, results) {
    this.endTime = new Date();
    const duration = (this.endTime - this.startTime) / 1000;

    console.log('');
    console.log(`${COLORS.bright}${COLORS.blue}TEST SUMMARY${COLORS.reset}`);

    // Count total tests
    const totalTests = results.numTotalTests;
    const passedTests = results.numPassedTests;
    const failedTests = results.numFailedTests;
    const pendingTests = results.numPendingTests;

    // Print test counts
    console.log(`Total: ${totalTests} tests`);
    console.log(`${COLORS.green}Passed: ${passedTests} tests${COLORS.reset}`);

    if (failedTests > 0) {
      console.log(`${COLORS.red}Failed: ${failedTests} tests${COLORS.reset}`);
    } else {
      console.log(`${COLORS.green}Failed: ${failedTests} tests${COLORS.reset}`);
    }

    if (pendingTests > 0) {
      console.log(`${COLORS.yellow}Skipped: ${pendingTests} tests${COLORS.reset}`);
    }

    // Print duration
    console.log(`Time: ${duration.toFixed(2)}s`);

    // Print test suites summary
    console.log('');
    console.log(`Test Suites: ${results.numPassedTestSuites} passed, ${results.numTotalTestSuites} total`);
    console.log(`Tests:       ${pendingTests > 0 ? pendingTests + ' skipped, ' : ''}${passedTests} passed, ${totalTests} total`);
    console.log(`Snapshots:   ${results.snapshot.total} total`);
    console.log(`Time:        ${duration.toFixed(3)} s${results.startTime ? ', estimated ' + ((Date.now() - results.startTime) / 1000).toFixed(0) + ' s' : ''}`);

    // Print final status
    if (results.success) {
      console.log(`\n${COLORS.green}${COLORS.bright}✓ ALL TESTS PASSED${COLORS.reset}`);
    } else {
      // Only show failed message if there are actual failures, not just skipped tests
      if (failedTests > 0) {
        console.log(`\n${COLORS.red}${COLORS.bright}✖ TESTS FAILED${COLORS.reset}`);
      } else {
        console.log(`\n${COLORS.green}${COLORS.bright}✓ ALL TESTS PASSED${COLORS.reset}`);
      }
    }
  }
}

module.exports = CleanReporter;
