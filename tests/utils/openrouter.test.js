/**
 * Open Router API Integration Tests
 */
const openRouter = require('../../src/utils/openrouter');

// Mock fetch
global.fetch = jest.fn();

describe('Open Router API Integration', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock successful API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'test-completion-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'anthropic/claude-3-opus:beta',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'This is a test response from the mock API.'
            },
            index: 0,
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      })
    });
  });
  
  // Tests
  test('should export the expected functions', () => {
    expect(openRouter).toHaveProperty('createChatCompletion');
    expect(openRouter).toHaveProperty('createModelWrapper');
  });
  
  test('should throw an error if API key is not provided', async () => {
    // Save original API key
    const originalApiKey = process.env.OPENROUTER_API_KEY;
    
    // Remove API key
    delete process.env.OPENROUTER_API_KEY;
    
    // Test without API key
    await expect(openRouter.createChatCompletion([
      { role: 'user', content: 'Test message' }
    ])).rejects.toThrow('Open Router API key is required');
    
    // Restore API key
    process.env.OPENROUTER_API_KEY = originalApiKey;
  });
  
  test('should call the Open Router API with correct parameters', async () => {
    const messages = [
      { role: 'user', content: 'Test message' }
    ];
    
    const options = {
      model: 'anthropic/claude-3-opus:beta',
      temperature: 0.5,
      maxTokens: 2000,
      apiKey: 'test_api_key'
    };
    
    await openRouter.createChatCompletion(messages, options);
    
    // Check that fetch was called with the correct URL and parameters
    expect(fetch).toHaveBeenCalledTimes(1);
    
    const [url, config] = fetch.mock.calls[0];
    expect(url).toContain('/v1/chat/completions');
    expect(config.method).toBe('POST');
    expect(config.headers).toHaveProperty('Authorization', 'Bearer test_api_key');
    
    const body = JSON.parse(config.body);
    expect(body).toHaveProperty('model', 'anthropic/claude-3-opus:beta');
    expect(body).toHaveProperty('messages', messages);
    expect(body).toHaveProperty('temperature', 0.5);
    expect(body).toHaveProperty('max_tokens', 2000);
  });
  
  test('should handle API errors gracefully', async () => {
    // Mock API error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({
        error: {
          message: 'Rate limit exceeded',
          type: 'rate_limit_error'
        }
      })
    });
    
    // Test error handling
    await expect(openRouter.createChatCompletion([
      { role: 'user', content: 'Test message' }
    ])).rejects.toThrow('Open Router API error: 429 Too Many Requests');
  });
  
  test('should create a model wrapper that mimics Google Generative AI interface', async () => {
    const modelWrapper = openRouter.createModelWrapper({
      model: 'anthropic/claude-3-opus:beta',
      temperature: 0.7,
      maxTokens: 4096
    });
    
    // Check that the wrapper has the expected methods
    expect(modelWrapper).toHaveProperty('generateContent');
    
    // Test the generateContent method
    const result = await modelWrapper.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Test message' }]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 2000
      }
    });
    
    // Check that the result has the expected structure
    expect(result).toHaveProperty('response');
    expect(result.response).toHaveProperty('text');
    expect(result.response.text()).toBe('This is a test response from the mock API.');
    
    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledTimes(1);
    
    const [url, config] = fetch.mock.calls[0];
    const body = JSON.parse(config.body);
    
    // Check that the messages were correctly converted from Google format to Open Router format
    expect(body.messages).toEqual([
      { role: 'user', content: 'Test message' }
    ]);
    
    // Check that the generation config was correctly applied
    expect(body.temperature).toBe(0.5);
    expect(body.max_tokens).toBe(2000);
  });
  
  test('should handle system prompts in the first user message', async () => {
    const modelWrapper = openRouter.createModelWrapper();
    
    await modelWrapper.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: 'You are a helpful assistant.\n\nWhat is the capital of France?' }]
        }
      ]
    });
    
    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledTimes(1);
    
    const [url, config] = fetch.mock.calls[0];
    const body = JSON.parse(config.body);
    
    // Check that the system prompt was correctly extracted
    expect(body.messages).toEqual([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the capital of France?' }
    ]);
  });
});
