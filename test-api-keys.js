// Simple script to test if API keys are properly set
require('dotenv').config();

// Import enhanced logger
const logger = require('./src/utils/logger');
const log = logger.child({ component: 'test-api-keys', category: logger.CATEGORIES.SYSTEM });

log.info('Testing API keys...', { action: 'verify-keys' });

const apiKeys = {
  googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
};

// Log API key status
log.info('API Key Status', {
  google: apiKeys.googleApiKey ? 'Set' : 'Not Set',
  tavily: apiKeys.tavilyApiKey ? 'Set' : 'Not Set',
  openRouter: apiKeys.openRouterApiKey ? 'Set' : 'Not Set',
  timestamp: new Date().toISOString()
});

// Check for missing keys
const missingKeys = [];

if (!apiKeys.googleApiKey) {
  missingKeys.push('GOOGLE_GENERATIVE_AI_API_KEY');
  log.warn('Google API Key is not set', { provider: 'google', status: 'missing' });
}

if (!apiKeys.tavilyApiKey) {
  missingKeys.push('TAVILY_API_KEY');
  log.warn('Tavily API Key is not set', { provider: 'tavily', status: 'missing' });
}

if (!apiKeys.openRouterApiKey) {
  missingKeys.push('OPENROUTER_API_KEY');
  log.warn('Open Router API Key is not set', { provider: 'openrouter', status: 'missing' });
}

// Final summary
if (missingKeys.length > 0) {
  log.warn(`Missing API keys: ${missingKeys.join(', ')}`, {
    missingCount: missingKeys.length,
    missingKeys: missingKeys,
    status: 'incomplete'
  });
} else {
  log.info('All API keys are set', { status: 'complete' });
}

log.info('Done testing API keys.', { action: 'verify-keys-complete' });
