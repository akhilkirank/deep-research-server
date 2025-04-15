/**
 * Test script for report file saving
 * 
 * This script tests the saveReportToFile function with different types of topics
 */

const { saveReportToFile } = require('./src/utils/file-utils');

// Test cases
async function runTests() {
  console.log('Testing report file saving...');
  
  // Test case 1: Normal topic
  try {
    const normalTopic = 'Quantum Computing';
    const normalReport = '# Quantum Computing\n\nThis is a test report about quantum computing.';
    const normalPath = await saveReportToFile(normalReport, normalTopic);
    console.log(`✅ Normal topic test passed. File saved to: ${normalPath}`);
  } catch (error) {
    console.error(`❌ Normal topic test failed: ${error.message}`);
  }
  
  // Test case 2: Very long topic
  try {
    const longTopic = 'This is a very long topic that would normally cause filename issues because it exceeds the maximum length allowed by most file systems. We need to make sure it gets properly truncated and sanitized.';
    const longReport = '# Long Topic Test\n\nThis is a test report with a very long topic.';
    const longPath = await saveReportToFile(longReport, longTopic);
    console.log(`✅ Long topic test passed. File saved to: ${longPath}`);
  } catch (error) {
    console.error(`❌ Long topic test failed: ${error.message}`);
  }
  
  // Test case 3: Topic with code block markers
  try {
    const codeBlockTopic = '```javascript\nconst test = "This is a code block";\n```';
    const codeBlockReport = '# Code Block Test\n\nThis is a test report with a topic that contains code block markers.';
    const codeBlockPath = await saveReportToFile(codeBlockReport, codeBlockTopic);
    console.log(`✅ Code block topic test passed. File saved to: ${codeBlockPath}`);
  } catch (error) {
    console.error(`❌ Code block topic test failed: ${error.message}`);
  }
  
  console.log('\nAll tests completed.');
}

// Run the tests
runTests().catch(error => {
  console.error('Test script failed:', error);
});
