/**
 * App Settings
 * 
 * This file contains general application settings.
 */

// General Application Settings
const appSettings = {
  // Application name
  appName: 'Deep Research Server',
  
  // Application version
  appVersion: '1.0.0',
  
  // Default language
  defaultLanguage: 'en-US',
  
  // Available languages
  availableLanguages: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
  
  // Whether to use mock implementations when API keys are missing
  useMockWhenKeysAreMissing: true,
  
  // Whether to log detailed information
  enableDetailedLogging: true,
  
  // Maximum content length for requests (in bytes)
  maxContentLength: 1024 * 1024 * 10, // 10 MB
  
  // Timeout for API requests (in milliseconds)
  requestTimeout: 300000, // 5 minutes
  
  // Whether to enable search functionality
  enableSearch: true,
  
  // Whether to cache search results
  enableSearchResultCaching: true,
  
  // How long to cache search results (in seconds)
  searchResultCacheDuration: 3600, // 1 hour
};

// Environment Settings
const environmentSettings = {
  // Whether the application is in development mode
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Whether the application is in production mode
  isProduction: process.env.NODE_ENV === 'production',
  
  // Whether the application is in test mode
  isTest: process.env.NODE_ENV === 'test',
  
  // Port to run the server on
  port: process.env.PORT || 3000,
  
  // Host to run the server on
  host: process.env.HOST || 'localhost'
};

// API Keys (for reference only - actual keys should be in environment variables)
const apiKeySettings = {
  // Names of environment variables for API keys
  googleApiKeyEnvVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
  tavilyApiKeyEnvVar: 'TAVILY_API_KEY',
  
  // Whether to allow hardcoded API keys (not recommended for production)
  allowHardcodedKeys: false
};

module.exports = {
  appSettings,
  environmentSettings,
  apiKeySettings
};
