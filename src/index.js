const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import custom logger
const logger = require('./utils/logger');

// Import routes
const researchRoutes = require('./routes/research');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create a server logger instance
const serverLogger = logger.child({ component: 'server', category: logger.CATEGORIES.SERVER });

// Middleware
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);

  // Create a request-specific logger with API category
  req.logger = logger.child({
    requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    category: logger.CATEGORIES.API
  });

  // Log incoming request with minimal info
  req.logger.api(`${req.method} ${req.originalUrl || req.url}`, {
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  });

  // Add response logging
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    const logContext = {
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: body ? body.length : 0
    };

    if (res.statusCode >= 400) {
      req.logger.apiError(`Request failed: ${req.method} ${req.originalUrl || req.url}`, logContext);
    } else {
      req.logger.api(`Request completed: ${req.method} ${req.originalUrl || req.url}`, logContext);
    }

    return originalSend.call(this, body);
  };

  next();
});

// Custom middleware to handle raw body for JSON requests
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/json' && req.method === 'POST') {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        // Only log body size for security and performance reasons
        req.logger.debug('Raw request body received', { bodySize: data.length });

        if (data) {
          req.rawBody = data;
          try {
            req.body = JSON.parse(data);
            req.logger.debug('Parsed JSON body successfully');
          } catch (e) {
            req.logger.apiError('Error parsing JSON body', { error: e.message });
            // Continue with empty body, will be handled later
            req.body = {};
          }
        }
        next();
      } catch (e) {
        req.logger.apiError('Error in raw body handler', { error: e.message, stack: e.stack });
        next();
      }
    });
  } else {
    // For non-JSON requests, use standard express.json middleware
    express.json({ limit: '10mb' })(req, res, next);
  }
});

// Middleware to preprocess request body for numeric strings
app.use((req, res, next) => {
  if (req.method === 'POST' && req.body) {
    // Special handling for requests which might have a nested body structure
    if (req.body.body && typeof req.body.body === 'object') {
      req.logger.debug('Detected request with nested body structure');
      // Replace the request body with the nested body
      req.body = req.body.body;
    }

    // Track changes for logging
    const changes = {};

    // Convert string numbers to actual numbers for common fields
    if (req.body.maxIterations && typeof req.body.maxIterations === 'string') {
      changes.maxIterations = { from: 'string', to: 'number' };
      req.body.maxIterations = parseInt(req.body.maxIterations, 10) || 2;
    }

    if (req.body.temperature && typeof req.body.temperature === 'string') {
      changes.temperature = { from: 'string', to: 'number' };
      req.body.temperature = parseFloat(req.body.temperature) || 0.7;
    }

    if (req.body.maxResults && typeof req.body.maxResults === 'string') {
      changes.maxResults = { from: 'string', to: 'number' };
      req.body.maxResults = parseInt(req.body.maxResults, 10) || 5;
    }

    if (req.body.searchMaxResult && typeof req.body.searchMaxResult === 'string') {
      changes.searchMaxResult = { from: 'string', to: 'number' };
      req.body.searchMaxResult = parseInt(req.body.searchMaxResult, 10) || 5;
    }

    // Convert string booleans to actual booleans
    if (req.body.enableSearch && typeof req.body.enableSearch === 'string') {
      changes.enableSearch = { from: 'string', to: 'boolean' };
      req.body.enableSearch = req.body.enableSearch.toLowerCase() === 'true';
    }

    if (req.body.parallelSearch && typeof req.body.parallelSearch === 'string') {
      changes.parallelSearch = { from: 'string', to: 'boolean' };
      req.body.parallelSearch = req.body.parallelSearch.toLowerCase() === 'true';
    }

    if (Object.keys(changes).length > 0) {
      req.logger.debug('Preprocessed request body fields', { changedFields: Object.keys(changes) });
    }
  }
  next();
});

// Routes
app.use('/api/research', researchRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorLogger = req.logger || serverLogger;

  // Use critical for 5xx errors, error for 4xx errors
  if (statusCode >= 500) {
    errorLogger.critical('Server error', {
      statusCode,
      error: err.message,
      path: req.originalUrl || req.url,
      method: req.method,
      stack: err.stack
    });
  } else {
    errorLogger.apiError('Client error', {
      statusCode,
      error: err.message,
      path: req.originalUrl || req.url,
      method: req.method
    });
  }

  res.status(statusCode).json({
    error: {
      message: err.message,
      code: statusCode
    }
  });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    serverLogger.server(`Deep Research Server started`, {
      port: PORT,
      environment: NODE_ENV,
      nodeVersion: process.version
    });
    serverLogger.server(`API available at http://localhost:${PORT}/api/research`);
  });
}

// Export the app for testing
module.exports = app;
