/**
 * Research Routes Tests
 */
const request = require('supertest');
const express = require('express');
const researchRoutes = require('../../src/routes/research');

// Mock research utility functions
jest.mock('../../src/utils/research', () => {
  return {
    generateSearchQueries: jest.fn().mockResolvedValue({
      queries: [
        {
          query: 'What is quantum computing',
          researchGoal: 'Understand the basic principles of quantum computing'
        },
        {
          query: 'Quantum computing applications',
          researchGoal: 'Explore practical applications of quantum computing'
        }
      ]
    }),
    runSearchTasks: jest.fn().mockResolvedValue({
      results: [
        {
          query: 'What is quantum computing',
          researchGoal: 'Understand the basic principles of quantum computing',
          sources: [
            {
              title: 'Test Source 1',
              content: 'Test content 1',
              url: 'https://example.com/test1'
            }
          ],
          learnings: [
            'Quantum computing uses qubits instead of classical bits'
          ]
        }
      ]
    }),
    reviewSearchResults: jest.fn().mockResolvedValue({
      queries: [
        {
          query: 'Quantum computing error correction',
          researchGoal: 'Understand how errors are corrected in quantum computers'
        }
      ]
    }),
    writeFinalReport: jest.fn().mockResolvedValue({
      report: '# Quantum Computing Report\n\nThis is a test report.'
    }),
    directResearch: jest.fn().mockResolvedValue('# Quantum Computing Report\n\nThis is a test report.'),
    performProductResearch: jest.fn().mockImplementation((productData) => {
      // Check if we need to return JSON array format
      if (productData.metadata?.responseFormat?.structure === 'array') {
        return JSON.stringify([
          {
            "id": "product1",
            "name": "Samsung Galaxy S23 Ultra",
            "imageUrl": "https://example.com/s23.jpg",
            "features": ["6.8-inch display", "200MP camera"],
            "pros": ["Excellent camera", "Great display", "Long battery life"],
            "cons": ["Expensive", "Large size"],
            "justification": "This premium phone matches your requirements for a Samsung device with large screen."
          },
          {
            "id": "product2",
            "name": "Samsung Galaxy Z Fold 4",
            "imageUrl": "https://example.com/fold4.jpg",
            "features": ["7.6-inch foldable display", "50MP camera"],
            "pros": ["Innovative design", "Large screen", "Multitasking"],
            "cons": ["Very expensive", "Heavy"],
            "justification": "This foldable device offers the largest screen in Samsung's lineup."
          },
          {
            "id": "product3",
            "name": "Samsung Galaxy S23+",
            "imageUrl": "https://example.com/s23plus.jpg",
            "features": ["6.6-inch display", "50MP camera"],
            "pros": ["Great performance", "Good camera", "Premium build"],
            "cons": ["Expensive", "Similar to previous model"],
            "justification": "A slightly more affordable option while maintaining premium features."
          }
        ]);
      }

      // Return standard markdown format
      return '# Smartphone Product Research Report\n\n## Top 3 Recommendations\n\n1. Samsung Galaxy S23 Ultra\n2. Samsung Galaxy Z Fold 4\n3. Samsung Galaxy S23+\n\nThis is a test product report with exactly 3 recommendations.';
    }),
    normalizeMarkdownNewlines: jest.fn(text => text)
  };
});

// Mock enhanced logger
jest.mock('../../src/utils/logger', () => {
  return {
    CATEGORIES: {
      API: 'api',
      SERVER: 'server',
      RESEARCH: 'research',
      SYSTEM: 'system',
      TEST: 'test'
    },
    LOG_LEVELS: {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4,
      none: 5
    },
    redactSensitiveData: jest.fn(data => data),
    child: jest.fn().mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      critical: jest.fn(),
      api: jest.fn(),
      apiError: jest.fn(),
      server: jest.fn(),
      research: jest.fn(),
      db: jest.fn(),
      auth: jest.fn(),
      test: jest.fn(),
      child: jest.fn().mockReturnValue({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        critical: jest.fn(),
        api: jest.fn(),
        apiError: jest.fn()
      })
    })
  };
});

// Create Express app for testing
const app = express();
app.use(express.json());

// Add request logger middleware to mimic the actual app
app.use((req, res, next) => {
  req.logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    critical: jest.fn(),
    api: jest.fn(),
    apiError: jest.fn(),
    server: jest.fn(),
    research: jest.fn(),
    child: jest.fn().mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      critical: jest.fn(),
      api: jest.fn(),
      apiError: jest.fn()
    })
  };
  next();
});

app.use('/api/research', researchRoutes);

describe('Research Routes', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  // Tests
  test('should have the expected routes', () => {
    const routes = researchRoutes.stack
      .filter(layer => layer.route)
      .map(layer => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      }));

    // Check that all expected routes exist
    expect(routes).toContainEqual({ path: '/query', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/start', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/search', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/review', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/report', methods: ['post'] });
  });

  test('POST /api/research/query should perform direct research', async () => {
    const response = await request(app)
      .post('/api/research/query')
      .send({
        query: 'Quantum computing',
        language: 'en-US',
        provider: 'google',
        model: 'gemini-1.5-pro',
        searchProvider: 'tavily',
        maxIterations: 2,
        reportStyle: 'academic',
        maxResults: 10,
        detailLevel: 'comprehensive',
        promptType: 'academic'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('report');
    expect(response.body.report).toContain('Quantum Computing Report');
  });

  test('POST /api/research/query should handle legacy product mode', async () => {
    const response = await request(app)
      .post('/api/research/query')
      .send({
        promType: 'product',
        reportStyle: 'product',
        productCategory: 'Smartphone',
        productName: '',
        userPreferences: {
          screenSize: '6-inch',
          budget: 'Under 600 USD',
          features: ['advanced camera', 'long battery life'],
          brandPreference: 'Any'
        },
        extraDetails: {
          focus: 'mid-range phones with top camera performance',
          notes: 'Include recent trends and expert reviews'
        },
        language: 'en-US',
        provider: 'google',
        model: 'gemini-1.5-pro',
        searchProvider: 'tavily',
        maxResults: 8
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('report');
    expect(response.body.report).toContain('Smartphone Product Research Report');
    expect(response.body.report).toContain('Top 3 Recommendations');
    expect(response.body.report).toContain('Samsung Galaxy S23 Ultra');
    expect(response.body.report).toContain('Samsung Galaxy Z Fold 4');
    expect(response.body.report).toContain('Samsung Galaxy S23+');
  });

  test('POST /api/research/query should handle new product mode format', async () => {
    const response = await request(app)
      .post('/api/research/query')
      .send({
        context: {
          category: 'Electronics',
          productType: 'Smartphones'
        },
        preferences: {
          questions: [
            {
              text: 'Preferred brand',
              answer: 'Samsung',
              keywords: 'Looking for the latest model'
            },
            {
              text: 'Screen size',
              answer: 'Extra Large (over 6.7")'
            },
            {
              text: 'Budget range',
              answer: 'Ultra Premium (over $900)'
            },
            {
              text: 'Feature',
              answer: 'Display quality'
            },
            {
              text: 'Color',
              answer: 'Red'
            }
          ]
        },
        metadata: {
          requestType: 'product_recommendation',
          responseFormat: {
            structure: 'array',
            fields: [
              'id',
              'name',
              'imageUrl',
              'features',
              'pros',
              'cons',
              'justification'
            ]
          },
          version: '1.0'
        },
        language: 'en-US',
        provider: 'google',
        model: 'gemini-1.5-pro',
        searchProvider: 'tavily',
        maxResults: 8
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('report');
    // For JSON array format, we should get a JSON string
    const report = response.body.report;
    expect(typeof report).toBe('string');

    // Parse the JSON to verify it's valid and has the expected structure
    const parsedReport = JSON.parse(report);
    expect(Array.isArray(parsedReport)).toBe(true);
    expect(parsedReport.length).toBe(3); // Exactly 3 products

    // Check that each product has the required fields
    parsedReport.forEach(product => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('imageUrl');
      expect(product).toHaveProperty('features');
      expect(product).toHaveProperty('pros');
      expect(product).toHaveProperty('cons');
      expect(product).toHaveProperty('justification');
    });

    // Check for specific product names
    const productNames = parsedReport.map(p => p.name);
    expect(productNames).toContain('Samsung Galaxy S23 Ultra');
    expect(productNames).toContain('Samsung Galaxy Z Fold 4');
    expect(productNames).toContain('Samsung Galaxy S23+');
  });

  test('POST /api/research/start should generate search queries', async () => {
    const response = await request(app)
      .post('/api/research/start')
      .send({
        topic: 'Quantum computing',
        language: 'en-US',
        provider: 'google',
        model: 'gemini-1.5-flash',
        promptType: 'technical',
        detailLevel: 'standard'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('queries');
    expect(response.body.queries).toHaveLength(2);
    expect(response.body.queries[0]).toHaveProperty('query');
    expect(response.body.queries[0]).toHaveProperty('researchGoal');
  });

  test('POST /api/research/search should run search tasks', async () => {
    const response = await request(app)
      .post('/api/research/search')
      .send({
        queries: [
          {
            query: 'What is quantum computing',
            researchGoal: 'Understand the basic principles of quantum computing'
          }
        ],
        language: 'en-US',
        provider: 'google',
        model: 'gemini-1.5-pro',
        enableSearch: true,
        searchProvider: 'tavily',
        parallelSearch: false,
        searchMaxResult: 5
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
    expect(response.body.results).toHaveLength(1);
    expect(response.body.results[0]).toHaveProperty('query');
    expect(response.body.results[0]).toHaveProperty('sources');
    expect(response.body.results[0]).toHaveProperty('learnings');
  });

  test('POST /api/research/review should review search results', async () => {
    const response = await request(app)
      .post('/api/research/review')
      .send({
        topic: 'Quantum computing',
        learnings: [
          'Quantum computing uses qubits instead of classical bits',
          'Quantum computers can solve certain problems exponentially faster than classical computers'
        ],
        language: 'en-US',
        provider: 'google',
        model: 'gemini-1.5-pro'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('queries');
    expect(response.body.queries).toHaveLength(1);
    expect(response.body.queries[0]).toHaveProperty('query');
    expect(response.body.queries[0]).toHaveProperty('researchGoal');
  });

  test('POST /api/research/report should generate a final report', async () => {
    const response = await request(app)
      .post('/api/research/report')
      .send({
        topic: 'Quantum computing',
        learnings: [
          'Quantum computing uses qubits instead of classical bits',
          'Quantum computers can solve certain problems exponentially faster than classical computers'
        ],
        language: 'en-US',
        provider: 'openrouter',
        model: 'anthropic/claude-3-opus:beta',
        requirement: 'Focus on practical applications and future potential',
        promptType: 'technical',
        detailLevel: 'comprehensive',
        reportStyle: 'technical'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('report');
    expect(response.body.report).toContain('Quantum Computing Report');
  });

  test('should handle errors gracefully', async () => {
    // Mock a failure in directResearch
    const research = require('../../src/utils/research');
    research.directResearch.mockRejectedValueOnce(new Error('Test error'));

    const response = await request(app)
      .post('/api/research/query')
      .send({
        query: 'Quantum computing',
        language: 'en-US'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  test('should handle product mode errors gracefully', async () => {
    // Mock a failure in performProductResearch
    const research = require('../../src/utils/research');
    research.performProductResearch.mockRejectedValueOnce(new Error('Product research error'));

    const response = await request(app)
      .post('/api/research/query')
      .send({
        promType: 'product',
        reportStyle: 'product',
        productCategory: 'Smartphone',
        language: 'en-US'
      });

    expect(response.status).toBe(200); // We still return 200 with an error report
    expect(response.body).toHaveProperty('report');
    expect(response.body.report).toContain('Error During Research');
  });

  test('should fallback to standard research when product mode validation fails', async () => {
    const response = await request(app)
      .post('/api/research/query')
      .send({
        promType: 'product', // Missing reportStyle: 'product'
        productCategory: 'Smartphone',
        query: 'Best smartphones', // This will trigger standard research
        language: 'en-US'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('report');
    // Should use standard research
    expect(response.body.report).toContain('Quantum Computing Report');
  });

  test('should validate request body', async () => {
    // Missing required field (query)
    const response = await request(app)
      .post('/api/research/query')
      .send({
        language: 'en-US'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
