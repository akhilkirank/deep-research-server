/**
 * Research Utility Tests
 */
const research = require('../../src/utils/research');

// Mock dependencies
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: () => 'This is a test response from the mock Google API.'
              }
            })
          };
        })
      };
    })
  };
});

jest.mock('../../src/utils/web-search', () => {
  return {
    performSearch: jest.fn().mockResolvedValue({
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
  };
});

jest.mock('../../src/utils/openrouter', () => {
  return {
    createModelWrapper: jest.fn().mockImplementation(() => {
      return {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'This is a test response from the mock Open Router API.'
          }
        })
      };
    })
  };
});

describe('Research Utility', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  // Tests
  test('should export the expected functions', () => {
    expect(research).toHaveProperty('generateSearchQueries');
    expect(research).toHaveProperty('runSearchTasks');
    expect(research).toHaveProperty('reviewSearchResults');
    expect(research).toHaveProperty('writeFinalReport');
    expect(research).toHaveProperty('directResearch');
  });
  
  test('should get the appropriate model based on provider and requested model', () => {
    // Test with Google provider
    let models = research.getModel('google');
    expect(models).toHaveProperty('thinkingModel');
    expect(models).toHaveProperty('networkingModel');
    
    // Test with Open Router provider
    models = research.getModel('openrouter');
    expect(models.thinkingModel).toContain('claude');
    
    // Test with requested model
    models = research.getModel('google', 'custom-model');
    expect(models.thinkingModel).toBe('custom-model');
    expect(models.networkingModel).toBe('custom-model');
  });
  
  test('should create a provider instance based on the specified provider', () => {
    // Test with Google provider
    let provider = research.createProvider('google', 'gemini-1.5-pro');
    expect(provider).toHaveProperty('generateContent');
    
    // Test with Open Router provider
    provider = research.createProvider('openrouter', 'anthropic/claude-3-opus:beta');
    expect(provider).toHaveProperty('generateContent');
    
    // Test with unsupported provider (should default to Google)
    provider = research.createProvider('unsupported', 'some-model');
    expect(provider).toHaveProperty('generateContent');
  });
  
  test('should generate search queries for a given topic', async () => {
    const result = await research.generateSearchQueries(
      'Quantum computing',
      'en-US',
      'google',
      'gemini-1.5-pro'
    );
    
    expect(result).toHaveProperty('queries');
    expect(Array.isArray(result.queries)).toBe(true);
  });
  
  test('should run search tasks for a set of queries', async () => {
    const queries = [
      {
        query: 'What is quantum computing',
        researchGoal: 'Understand the basic principles of quantum computing'
      },
      {
        query: 'Quantum computing applications',
        researchGoal: 'Explore practical applications of quantum computing'
      }
    ];
    
    const result = await research.runSearchTasks(
      queries,
      'en-US',
      'google',
      'gemini-1.5-pro',
      true,
      'tavily',
      false,
      5
    );
    
    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
  });
  
  test('should review search results and suggest additional queries', async () => {
    const topic = 'Quantum computing';
    const learnings = [
      'Quantum computing uses qubits instead of classical bits',
      'Quantum computers can solve certain problems exponentially faster than classical computers'
    ];
    
    const result = await research.reviewSearchResults(
      topic,
      learnings,
      '',
      'en-US',
      'google',
      'gemini-1.5-pro'
    );
    
    expect(result).toHaveProperty('queries');
    expect(Array.isArray(result.queries)).toBe(true);
  });
  
  test('should write a final report based on learnings', async () => {
    const topic = 'Quantum computing';
    const learnings = [
      'Quantum computing uses qubits instead of classical bits',
      'Quantum computers can solve certain problems exponentially faster than classical computers'
    ];
    
    const result = await research.writeFinalReport(
      topic,
      learnings,
      'en-US',
      'google',
      'gemini-1.5-pro',
      'Focus on practical applications',
      'technical',
      'technical',
      'comprehensive'
    );
    
    expect(result).toHaveProperty('report');
    expect(typeof result.report).toBe('string');
  });
  
  test('should perform direct research on a topic', async () => {
    const query = 'Quantum computing';
    
    const report = await research.directResearch(
      query,
      'en-US',
      'google',
      'gemini-1.5-pro',
      'tavily',
      2,
      'technical',
      'technical',
      'comprehensive',
      {}
    );
    
    expect(typeof report).toBe('string');
    expect(report).toContain('Quantum');
  });
  
  test('should handle errors gracefully during research process', async () => {
    // Mock a failure in generateContent
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    GoogleGenerativeAI.mockImplementationOnce(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            generateContent: jest.fn().mockRejectedValue(new Error('API error'))
          };
        })
      };
    });
    
    const query = 'Quantum computing';
    
    const report = await research.directResearch(
      query,
      'en-US',
      'google',
      'gemini-1.5-pro',
      'tavily',
      2,
      'technical',
      'technical',
      'comprehensive',
      {}
    );
    
    expect(typeof report).toBe('string');
    expect(report).toContain('Error');
  });
});
