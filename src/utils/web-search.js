const { shuffle } = require('radash');
const settings = require('../settings');

// Base URLs for search providers
const TAVILY_BASE_URL = "https://api.tavily.com";

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
  const tavilyApiKey = process.env.TAVILY_API_KEY || "";
  const tavilyApiKeys = shuffle(tavilyApiKey.split(","));
  
  if (!tavilyApiKeys[0]) {
    console.error("No Tavily API key found");
    return [];
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
      const errorData = await response.json();
      console.error("Tavily API error:", errorData);
      return [];
    }
    
    const { results } = await response.json();
    
    return (results || [])
      .filter((item) => item.content && item.url)
      .map((result) => ({
        title: result.title || "",
        content: result.content || "",
        url: result.url || ""
      }));
  } catch (error) {
    console.error("Error in Tavily search:", error);
    return [];
  }
}

/**
 * Mock search function for testing
 */
function mockSearch(query) {
  return [
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
}

/**
 * Perform a search using the specified provider
 */
async function performSearch(
  query,
  searchProvider = "tavily",
  maxResults = 5
) {
  try {
    // Check if search is enabled in settings
    const searchEnabled = settings.app.appSettings.enableSearch;
    if (!searchEnabled) {
      console.log("Search is disabled in settings. Using mock search.");
      return mockSearch(query);
    }
    
    // Use mock implementation if specified in settings
    const useMockWhenKeysAreMissing = settings.app.appSettings.useMockWhenKeysAreMissing;
    
    switch (searchProvider) {
      case "tavily":
        const tavilyResults = await tavily(query, {}, maxResults);
        if (tavilyResults.length > 0 || !useMockWhenKeysAreMissing) {
          return tavilyResults;
        }
        console.log("No Tavily results. Using mock search.");
        return mockSearch(query);
        
      case "mock":
        return mockSearch(query);
        
      default:
        console.log(`Unsupported search provider: ${searchProvider}. Using mock search.`);
        return mockSearch(query);
    }
  } catch (error) {
    console.error(`Error in ${searchProvider} search:`, error);
    if (settings.app.appSettings.useMockWhenKeysAreMissing) {
      console.log("Using mock search due to error.");
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
