// Simple script to test if API keys are properly set
require('dotenv').config();

console.log('Testing API keys...');

const apiKeys = {
  googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
};

console.log('Google API Key:', apiKeys.googleApiKey ? '[Set]' : '[Not Set]');
console.log('Tavily API Key:', apiKeys.tavilyApiKey ? '[Set]' : '[Not Set]');

if (!apiKeys.googleApiKey) {
  console.log('Warning: Google API Key is not set. Set GOOGLE_GENERATIVE_AI_API_KEY environment variable.');
}

if (!apiKeys.tavilyApiKey) {
  console.log('Warning: Tavily API Key is not set. Set TAVILY_API_KEY environment variable.');
}

console.log('Done testing API keys.');
