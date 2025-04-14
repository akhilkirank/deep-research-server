/**
 * Enhanced Structured Logger
 *
 * A structured logging utility for the Deep Research Server that provides:
 * - Consistent log formatting with timestamps, log levels, and context
 * - Log categories for better organization
 * - Sensitive data redaction
 * - Configurable log levels
 * - Compact and readable output format
 */

// Get log level from environment or use default
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Get log format from environment or use default (pretty or json)
const LOG_FORMAT = process.env.LOG_FORMAT || 'pretty';

// Log categories
const CATEGORIES = {
  API: 'api',         // API calls (incoming/outgoing)
  SERVER: 'server',   // Server operations
  DB: 'db',           // Database operations
  AUTH: 'auth',       // Authentication/authorization
  RESEARCH: 'research', // Research operations
  SYSTEM: 'system',   // System operations
  TEST: 'test'        // Test operations
};

// Log levels with numeric values for comparison
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
  none: 5
};

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Color mapping for different log levels
const LEVEL_COLORS = {
  debug: COLORS.cyan,
  info: COLORS.green,
  warn: COLORS.yellow,
  error: COLORS.red,
  critical: COLORS.bright + COLORS.red
};

// Color mapping for different categories
const CATEGORY_COLORS = {
  [CATEGORIES.API]: COLORS.blue,
  [CATEGORIES.SERVER]: COLORS.green,
  [CATEGORIES.DB]: COLORS.magenta,
  [CATEGORIES.AUTH]: COLORS.yellow,
  [CATEGORIES.RESEARCH]: COLORS.cyan,
  [CATEGORIES.SYSTEM]: COLORS.white,
  [CATEGORIES.TEST]: COLORS.dim + COLORS.white
};

// Fields to redact in logs (case insensitive)
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'api_key',
  'apikey',
  'key',
  'secret',
  'authorization',
  'auth',
  'credential'
];

/**
 * Redact sensitive information from objects
 *
 * @param {Object} obj - The object to redact
 * @returns {Object} A new object with sensitive fields redacted
 */
function redactSensitiveData(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const result = Array.isArray(obj) ? [...obj] : {...obj};

  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      // Check if this key should be redacted
      const keyLower = key.toLowerCase();
      const shouldRedact = SENSITIVE_FIELDS.some(field => keyLower.includes(field.toLowerCase()));

      if (shouldRedact && result[key]) {
        // Redact the value but keep the type information
        if (typeof result[key] === 'string') {
          result[key] = '[REDACTED]';
        } else if (typeof result[key] === 'object') {
          result[key] = Array.isArray(result[key]) ? ['[REDACTED]'] : { redacted: true };
        } else {
          result[key] = '[REDACTED]';
        }
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        // Recursively redact nested objects
        result[key] = redactSensitiveData(result[key]);
      }
    }
  }

  return result;
}

/**
 * Format a log message with timestamp, level, category, and context
 *
 * @param {string} level - Log level (debug, info, warn, error, critical)
 * @param {string} message - The main log message
 * @param {Object} context - Additional context data
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const levelColor = LEVEL_COLORS[level] || COLORS.white;

  // Extract category from context if available
  const category = context.category || CATEGORIES.SYSTEM;
  const categoryColor = CATEGORY_COLORS[category] || COLORS.white;

  // Remove category from context to avoid duplication
  const contextWithoutCategory = {...context};
  delete contextWithoutCategory.category;

  // Redact sensitive data
  const safeContext = redactSensitiveData(contextWithoutCategory);

  // Format the base message with timestamp, level, and category
  let formattedMessage = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${levelColor}${level.toUpperCase().padEnd(7)}${COLORS.reset} ${categoryColor}[${category}]${COLORS.reset}: ${message}`;

  // Add context if provided and not empty
  if (Object.keys(safeContext).length > 0) {
    // Format context object for better readability
    const contextStr = Object.entries(safeContext)
      .map(([key, value]) => {
        // Handle different value types
        let formattedValue = value;

        if (value === null) {
          formattedValue = 'null';
        } else if (value === undefined) {
          formattedValue = 'undefined';
        } else if (typeof value === 'object') {
          try {
            // Limit object depth for readability
            formattedValue = JSON.stringify(value, null, 0);
            // Truncate if too long
            if (formattedValue.length > 100) {
              formattedValue = formattedValue.substring(0, 97) + '...';
            }
          } catch (e) {
            formattedValue = '[Object]';
          }
        }

        return `${COLORS.dim}${key}=${COLORS.reset}${formattedValue}`;
      })
      .join(' ');

    formattedMessage += ` ${contextStr}`;
  }

  return formattedMessage;
}

/**
 * Format a log message as JSON
 *
 * @param {string} level - Log level
 * @param {string} message - The main log message
 * @param {Object} context - Additional context data
 * @returns {string} JSON formatted log message
 */
function formatLogMessageJson(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const category = context.category || CATEGORIES.SYSTEM;

  // Remove category from context to avoid duplication
  const contextWithoutCategory = {...context};
  delete contextWithoutCategory.category;

  // Redact sensitive data
  const safeContext = redactSensitiveData(contextWithoutCategory);

  const logObject = {
    timestamp,
    level,
    category,
    message,
    ...safeContext
  };

  return JSON.stringify(logObject);
}

/**
 * Check if a log level should be displayed based on the configured level
 *
 * @param {string} level - The log level to check
 * @returns {boolean} Whether the log should be displayed
 */
function shouldLog(level) {
  const configuredLevel = LOG_LEVELS[LOG_LEVEL] !== undefined ? LOG_LEVELS[LOG_LEVEL] : LOG_LEVELS.info;
  const messageLevel = LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.info;

  return messageLevel >= configuredLevel;
}

/**
 * Output a log message using the appropriate formatter
 *
 * @param {string} level - Log level
 * @param {string} message - The message to log
 * @param {Object} context - Additional context data
 */
function outputLog(level, message, context = {}) {
  const output = LOG_FORMAT === 'json'
    ? formatLogMessageJson(level, message, context)
    : formatLogMessage(level, message, context);

  switch (level) {
    case 'warn':
      console.warn(output);
      break;
    case 'error':
    case 'critical':
      console.error(output);
      break;
    default:
      console.log(output);
  }
}

/**
 * Log a debug message
 *
 * @param {string} message - The message to log
 * @param {Object} context - Additional context data
 */
function debug(message, context = {}) {
  if (shouldLog('debug')) {
    outputLog('debug', message, context);
  }
}

/**
 * Log an info message
 *
 * @param {string} message - The message to log
 * @param {Object} context - Additional context data
 */
function info(message, context = {}) {
  if (shouldLog('info')) {
    outputLog('info', message, context);
  }
}

/**
 * Log a warning message
 *
 * @param {string} message - The message to log
 * @param {Object} context - Additional context data
 */
function warn(message, context = {}) {
  if (shouldLog('warn')) {
    outputLog('warn', message, context);
  }
}

/**
 * Log an error message
 *
 * @param {string} message - The message to log
 * @param {Object} context - Additional context data
 */
function error(message, context = {}) {
  if (shouldLog('error')) {
    outputLog('error', message, context);
  }
}

/**
 * Log a critical message (highest priority)
 *
 * @param {string} message - The message to log
 * @param {Object} context - Additional context data
 */
function critical(message, context = {}) {
  if (shouldLog('critical')) {
    outputLog('critical', message, context);
  }
}

/**
 * Create a child logger with predefined context
 *
 * @param {Object} baseContext - Base context to include in all logs
 * @returns {Object} A new logger instance with the base context
 */
function createChildLogger(baseContext = {}) {
  return {
    debug: (message, context = {}) => debug(message, { ...baseContext, ...context }),
    info: (message, context = {}) => info(message, { ...baseContext, ...context }),
    warn: (message, context = {}) => warn(message, { ...baseContext, ...context }),
    error: (message, context = {}) => error(message, { ...baseContext, ...context }),
    critical: (message, context = {}) => critical(message, { ...baseContext, ...context }),
    child: (childContext = {}) => createChildLogger({ ...baseContext, ...childContext }),
    // Specialized loggers for common operations
    api: (message, context = {}) => info(message, { ...baseContext, ...context, category: CATEGORIES.API }),
    apiError: (message, context = {}) => error(message, { ...baseContext, ...context, category: CATEGORIES.API }),
    server: (message, context = {}) => info(message, { ...baseContext, ...context, category: CATEGORIES.SERVER }),
    research: (message, context = {}) => info(message, { ...baseContext, ...context, category: CATEGORIES.RESEARCH }),
    db: (message, context = {}) => info(message, { ...baseContext, ...context, category: CATEGORIES.DB }),
    auth: (message, context = {}) => info(message, { ...baseContext, ...context, category: CATEGORIES.AUTH }),
    test: (message, context = {}) => info(message, { ...baseContext, ...context, category: CATEGORIES.TEST })
  };
}

// Export the logger functions and constants
module.exports = {
  debug,
  info,
  warn,
  error,
  critical,
  child: createChildLogger,
  CATEGORIES,
  LOG_LEVELS,
  redactSensitiveData
};
