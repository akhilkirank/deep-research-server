const { shuffle } = require('radash');
const settings = require('../settings');

// Import custom logger
const logger = require('./logger');
const log = logger.child({ module: 'web-search', category: logger.CATEGORIES.API });

// Base URLs for search providers
const TAVILY_BASE_URL = process.env.TAVILY_API_BASE_URL || "https://api.tavily.com";

/**
 * Complete a path with a base URL
 */
function completePath(baseUrl, path = "") {
  if (!baseUrl) return "";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) + path : baseUrl + path;
}

/**
 * Search with Tavily
 */
async function tavily(
  query,
  options = {},
  maxResults = 5
) {
  const startTime = Date.now();
  const tavilyApiKey = options.apiKey || process.env.TAVILY_API_KEY || "";
  const tavilyApiKeys = shuffle(tavilyApiKey.split(","));

  if (!tavilyApiKeys[0]) {
    const error = new Error('Tavily API key is required');
    log.apiError("No Tavily API key found", { error: error.message });
    throw error;
  }

  try {
    const searchSettings = settings.search.tavilySearchSettings;

    const response = await fetch(
      `${TAVILY_BASE_URL}/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tavilyApiKeys[0]}`,
        },
        body: JSON.stringify({
          query,
          search_depth: searchSettings.searchDepth,
          include_answer: searchSettings.includeAnswer,
          max_results: maxResults || searchSettings.maxResults,
          include_domains: searchSettings.includeDomains,
          exclude_domains: searchSettings.excludeDomains,
          include_raw_content: searchSettings.includeRawContent,
          include_images: searchSettings.includeImages,
          ...options,
        }),
      }
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Failed to parse error response' };
      }

      const error = new Error(`Tavily API error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.data = errorData;

      log.apiError("Tavily API request failed", {
        status: response.status,
        statusText: response.statusText,
        endpoint: '/search',
        errorSummary: errorData?.error || 'Unknown error'
      });

      throw error;
    }

    const { results } = await response.json();

    const formattedResults = (results || [])
      .filter((item) => item.content && item.url)
      .map((result) => ({
        title: result.title || "",
        content: result.content || "",
        url: result.url || ""
      }));

    log.api("Tavily search completed", {
      query,
      resultCount: formattedResults.length,
      timeToComplete: `${Date.now() - startTime}ms`
    });

    return { results: formattedResults };
  } catch (error) {
    log.apiError("Error in Tavily search", {
      query,
      error: error.message,
      errorType: error.name || 'Error'
    });
    throw error;
  }
}

/**
 * Mock search function for testing
 */
function mockSearch(query) {
  log.debug("Using mock search", { query });

  // Create mock search results that match the expected format
  const mockResults = [
    {
      title: "Mock Result 1 for " + query,
      content: "This is a mock search result for " + query + ". It contains some sample content that would be returned by a real search API.",
      url: "https://example.com/mock-result-1"
    },
    {
      title: "Mock Result 2 for " + query,
      content: "This is another mock search result for " + query + ". It contains different sample content to simulate multiple search results.",
      url: "https://example.com/mock-result-2"
    }
  ];

  return {
    results: mockResults
  };
}

/**
 * Perform a search using the specified provider
 */
/**
 * Perform a search using the specified provider
 *
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {string} options.searchProvider - The search provider to use (default: "tavily")
 * @param {number} options.maxResults - Maximum number of results to return (default: 10)
 * @param {string} options.apiKey - API key for the search provider (optional)
 * @returns {Promise<Object>} - Search results
 */
async function performSearch(query, options = {}) {
  const searchProvider = options.searchProvider || "tavily";
  const maxResults = options.maxResults || 10;
  const startTime = Date.now();
  try {
    // Check if search is enabled in settings
    const searchEnabled = settings.app.appSettings.enableSearch;
    if (!searchEnabled) {
      log.api("Search is disabled in settings. Using mock search.", { query });
      return mockSearch(query);
    }

    // Use mock implementation if specified in settings
    const useMockWhenKeysAreMissing = settings.app.appSettings.useMockWhenKeysAreMissing;

    log.api("Performing search", {
      query,
      provider: searchProvider,
      maxResults,
      options: Object.keys(options).filter(key => key !== 'apiKey').join(',')
    });

    // If mock mode is enabled globally, override the provider
    if (process.env.USE_MOCK_MODE === 'true' && searchProvider !== 'mock') {
      log.info('Mock mode is enabled, using mock search provider instead of ' + searchProvider);
      return mockSearch(query);
    }

    switch (searchProvider) {
      case "tavily":
        try {
          return await tavily(query, options, maxResults);
        } catch (error) {
          if (useMockWhenKeysAreMissing) {
            log.warn("Tavily search failed. Using mock search.", {
              errorType: error.name || 'Error',
              errorSummary: error.message
            });
            return mockSearch(query);
          }
          throw error;
        }

      case "mock":
        return mockSearch(query);

      default:
        log.warn(`Unsupported search provider: ${searchProvider}. Using mock search.`);
        return mockSearch(query);
    }
  } catch (error) {
    log.apiError(`Search operation failed`, {
      provider: searchProvider,
      query,
      error: error.message,
      duration: `${Date.now() - startTime}ms`,
      errorType: error.name || 'Error'
    });

    if (settings.app.appSettings.useMockWhenKeysAreMissing) {
      log.api("Falling back to mock search due to error", { query });
      return mockSearch(query);
    }
    throw error;
  }
}

module.exports = {
  completePath,
  tavily,
  mockSearch,
  performSearch
};
