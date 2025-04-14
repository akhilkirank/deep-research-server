const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import routes
const researchRoutes = require('./routes/research');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Custom middleware to handle raw body for n8n requests
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/json' && req.method === 'POST') {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        console.log('Raw request body:', data);
        if (data) {
          req.rawBody = data;
          try {
            req.body = JSON.parse(data);
            console.log('Parsed JSON body:', JSON.stringify(req.body));
          } catch (e) {
            console.error('Error parsing JSON:', e);
            // Continue with empty body, will be handled later
            req.body = {};
          }
        }
        next();
      } catch (e) {
        console.error('Error in raw body handler:', e);
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
    // Special handling for n8n requests which might have a nested body structure
    if (req.body.body && typeof req.body.body === 'object') {
      console.log('Detected n8n request format with nested body');
      // Replace the request body with the nested body
      req.body = req.body.body;
    }

    // Convert string numbers to actual numbers for common fields
    if (req.body.maxIterations && typeof req.body.maxIterations === 'string') {
      req.body.maxIterations = parseInt(req.body.maxIterations, 10) || 2;
    }

    if (req.body.temperature && typeof req.body.temperature === 'string') {
      req.body.temperature = parseFloat(req.body.temperature) || 0.7;
    }

    if (req.body.maxResults && typeof req.body.maxResults === 'string') {
      req.body.maxResults = parseInt(req.body.maxResults, 10) || 5;
    }

    if (req.body.searchMaxResult && typeof req.body.searchMaxResult === 'string') {
      req.body.searchMaxResult = parseInt(req.body.searchMaxResult, 10) || 5;
    }

    // Convert string booleans to actual booleans
    if (req.body.enableSearch && typeof req.body.enableSearch === 'string') {
      req.body.enableSearch = req.body.enableSearch.toLowerCase() === 'true';
    }

    if (req.body.parallelSearch && typeof req.body.parallelSearch === 'string') {
      req.body.parallelSearch = req.body.parallelSearch.toLowerCase() === 'true';
    }

    console.log('Preprocessed request body:', JSON.stringify(req.body));
  }
  next();
});

// Routes
app.use('/api/research', researchRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Deep Research Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/research`);
});
