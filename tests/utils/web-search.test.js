/**
 * Web Search Utility Tests
 */
const { performSearch } = require('../../src/utils/web-search');

// Mock fetch
global.fetch = jest.fn();

// Mock logger
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
      test: jest.fn()
    })
  };
});

// Mock settings
jest.mock('../../src/settings', () => {
  return {
    app: {
      appSettings: {
        enableSearch: true,
        useMockWhenKeysAreMissing: true
      }
    },
    search: {
      tavilySearchSettings: {
        searchDepth: 'advanced',
        includeAnswer: true,
        includeDomains: [],
        excludeDomains: [],
        includeRawContent: false,
        includeImages: false,
        maxResults: 10
      }
    }
  };
});

describe('Web Search Utility', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Ensure mock mode is disabled for tests
    process.env.USE_MOCK_MODE = 'false';

    // Mock successful API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            title: 'Test Result 1',
            content: 'This is test content for result 1.',
            url: 'https://example.com/test1'
          },
          {
            title: 'Test Result 2',
            content: 'This is test content for result 2.',
            url: 'https://example.com/test2'
          }
        ]
      })
    });
  });

  // Tests
  test('should export the expected functions', () => {
    expect(typeof performSearch).toBe('function');
  });

  test('should use mock search when API key is not provided', async () => {
    // Save original API key and settings
    const originalApiKey = process.env.TAVILY_API_KEY;
    const originalSettings = require('../../src/settings');

    // Remove API key
    delete process.env.TAVILY_API_KEY;

    // Test without API key - should use mock search
    const options = {
      searchProvider: 'tavily'
    };

    const result = await performSearch('Quantum computing', options);

    // Should return mock results
    expect(result).toHaveProperty('results');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].title).toContain('Mock Result');

    // Restore API key
    process.env.TAVILY_API_KEY = originalApiKey;
  });

  test('should call the Tavily API with correct parameters', async () => {
    const query = 'Quantum computing';
    const options = {
      maxResults: 5,
      searchProvider: 'tavily',
      apiKey: 'test_api_key'
    };

    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            title: 'Test Result 1',
            content: 'This is test content for result 1.',
            url: 'https://example.com/test1'
          }
        ]
      })
    });

    await performSearch(query, options);

    // Check that fetch was called with the correct URL and parameters
    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, config] = fetch.mock.calls[0];
    // Fix the URL expectation to match the actual URL
    expect(url).toBe('https://api.tavily.com/search');
    expect(config.method).toBe('POST');
    expect(config.headers).toHaveProperty('Authorization', 'Bearer test_api_key');

    const body = JSON.parse(config.body);
    expect(body).toHaveProperty('query', 'Quantum computing');
    expect(body).toHaveProperty('max_results', 5);
  });

  test('should use mock search when API errors occur', async () => {
    // Mock API error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({
        error: 'Rate limit exceeded'
      })
    });

    // Test with default options (should use mock when API fails)
    const options = {
      searchProvider: 'tavily'
    };

    // Should use mock search when API errors occur
    const result = await performSearch('Quantum computing', options);

    // Should return mock results
    expect(result).toHaveProperty('results');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].title).toContain('Mock Result');
  });

  test('should return search results in the expected format', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            title: 'Test Result 1',
            content: 'This is test content for result 1.',
            url: 'https://example.com/test1'
          },
          {
            title: 'Test Result 2',
            content: 'This is test content for result 2.',
            url: 'https://example.com/test2'
          }
        ]
      })
    });

    const result = await performSearch('Quantum computing', { searchProvider: 'tavily' });

    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results).toHaveLength(2);

    expect(result.results[0]).toHaveProperty('title');
    expect(result.results[0]).toHaveProperty('content');
    expect(result.results[0]).toHaveProperty('url');
  });

  test('should use default options if not provided', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: []
      })
    });

    await performSearch('Quantum computing');

    // Check that fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, config] = fetch.mock.calls[0];
    const body = JSON.parse(config.body);

    // Check default options
    expect(body).toHaveProperty('max_results');
    expect(body.max_results).toBe(10); // Default maxResults
  });

  test('should use mock search when specified', async () => {
    const result = await performSearch('Quantum computing', { searchProvider: 'mock' });

    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].title).toContain('Mock Result');
  });
});
