/**
 * Test script for prompt and detail level selection
 */
const settings = require('./src/settings');

// Test getting system prompts
console.log('=== Testing System Prompts ===');
console.log('Default prompt:', settings.prompts.getSystemPromptByName());
console.log('Academic prompt:', settings.prompts.getSystemPromptByName('academic'));
console.log('Technical prompt:', settings.prompts.getSystemPromptByName('technical'));
console.log('News prompt:', settings.prompts.getSystemPromptByName('news'));
console.log('Invalid prompt (should return default):', settings.prompts.getSystemPromptByName('invalid'));

// Test getting detail levels
console.log('\n=== Testing Detail Levels ===');
console.log('Brief detail:', settings.prompts.getDetailLevelPrompt('brief'));
console.log('Standard detail:', settings.prompts.getDetailLevelPrompt('standard'));
console.log('Comprehensive detail:', settings.prompts.getDetailLevelPrompt('comprehensive'));
console.log('Invalid detail (should return standard):', settings.prompts.getDetailLevelPrompt('invalid'));

// Test getting report styles
console.log('\n=== Testing Report Styles ===');
console.log('Default style:', settings.prompts.getReportStyleByName());
console.log('Academic style:', settings.prompts.getReportStyleByName('academic'));
console.log('Technical style:', settings.prompts.getReportStyleByName('technical'));
console.log('News style:', settings.prompts.getReportStyleByName('news'));
console.log('Invalid style (should return default):', settings.prompts.getReportStyleByName('invalid'));
