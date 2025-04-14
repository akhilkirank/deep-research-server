/**
 * API Settings
 * 
 * This file contains settings related to the API functionality.
 */

// API Settings
const apiSettings = {
  // Base path for the API
  basePath: '/api',
  
  // API version
  version: 'v1',
  
  // Whether to enable CORS
  enableCors: true,
  
  // CORS allowed origins (empty array = all origins)
  corsAllowedOrigins: [],
  
  // Whether to enable rate limiting
  enableRateLimiting: false,
  
  // Rate limit window (in milliseconds)
  rateLimitWindow: 60000, // 1 minute
  
  // Maximum number of requests per window
  rateLimitMax: 60, // 60 requests per minute
  
  // Whether to enable API key authentication
  enableApiKeyAuth: false,
  
  // Whether to enable request logging
  enableRequestLogging: true
};

// Response Settings
const responseSettings = {
  // Whether to include timing information in responses
  includeTimingInfo: true,
  
  // Whether to include request ID in responses
  includeRequestId: true,
  
  // Whether to include API version in responses
  includeApiVersion: true,
  
  // Default response format
  defaultFormat: 'json',
  
  // Available response formats
  availableFormats: ['json', 'xml'],
  
  // Whether to pretty-print JSON responses
  prettyPrintJson: true
};

module.exports = {
  apiSettings,
  responseSettings
};
