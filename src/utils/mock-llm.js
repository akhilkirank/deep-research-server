/**
 * Mock LLM Implementation
 *
 * This module provides mock implementations of LLM services for testing
 * without using real API tokens. It mimics the interfaces of Google Generative AI
 * and OpenRouter APIs to allow for seamless testing.
 */

// Import custom logger
const logger = require('./logger');

// Create a module-specific logger
const log = logger.child({ module: 'mock-llm' });

/**
 * Mock responses for different types of queries
 * These can be expanded as needed for testing different scenarios
 */
const mockResponses = {
  // Search query generation
  queryGeneration: {
    default: JSON.stringify({
      queries: [
        {
          query: "What is artificial intelligence?",
          researchGoal: "Understand the basic definition and concepts of AI"
        },
        {
          query: "History of artificial intelligence development",
          researchGoal: "Learn about the key milestones in AI research"
        },
        {
          query: "Current applications of AI in everyday life",
          researchGoal: "Discover how AI is being used in modern society"
        }
      ]
    }),
    technical: JSON.stringify({
      queries: [
        {
          query: "Neural network architecture fundamentals",
          researchGoal: "Understand the technical structure of neural networks"
        },
        {
          query: "Machine learning algorithms comparison",
          researchGoal: "Analyze different ML algorithms and their applications"
        },
        {
          query: "Recent advancements in deep learning research",
          researchGoal: "Identify cutting-edge developments in deep learning"
        }
      ]
    })
  },

  // Search processing
  searchProcessing: {
    default: JSON.stringify({
      relevantInformation: [
        "Artificial intelligence (AI) is intelligence demonstrated by machines.",
        "Machine learning is a subset of AI focused on data and algorithms.",
        "Deep learning uses neural networks with many layers."
      ],
      irrelevantInformation: [
        "The term 'artificial intelligence' was coined in 1956."
      ],
      learnings: [
        "AI systems can perform tasks that typically require human intelligence.",
        "Machine learning allows systems to learn from data without explicit programming.",
        "Neural networks are computing systems inspired by the human brain."
      ]
    })
  },

  // Report writing
  reportWriting: {
    default: `# Artificial Intelligence: An Overview

## Introduction
Artificial intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. The term may also be applied to any machine that exhibits traits associated with a human mind such as learning and problem-solving.

## Key Concepts
- **Machine Learning**: A subset of AI that enables systems to learn from data
- **Neural Networks**: Computing systems inspired by biological neural networks
- **Deep Learning**: Advanced neural networks with multiple layers
- **Natural Language Processing**: Enables computers to understand human language

## Applications
AI has numerous applications across various industries:
- Healthcare: Diagnosis, drug discovery, personalized medicine
- Finance: Fraud detection, algorithmic trading
- Transportation: Autonomous vehicles, traffic management
- Entertainment: Recommendation systems, content creation

## Challenges and Ethical Considerations
Despite its potential, AI faces several challenges:
- Data privacy concerns
- Algorithmic bias
- Job displacement
- Security vulnerabilities

## Conclusion
Artificial intelligence continues to evolve rapidly, transforming industries and society. Understanding its capabilities, limitations, and ethical implications is crucial for responsible development and deployment.`,

    technical: `# Technical Analysis of Neural Network Architectures

## Introduction
Neural networks form the backbone of modern deep learning systems, with various architectures optimized for different tasks. This report examines the fundamental structures, training methodologies, and performance characteristics of major neural network architectures.

## Convolutional Neural Networks (CNNs)
CNNs excel at image processing tasks through:
- Convolutional layers for feature extraction
- Pooling layers for dimensionality reduction
- Fully connected layers for classification

Performance metrics show 95-98% accuracy on standard image classification benchmarks.

## Recurrent Neural Networks (RNNs)
RNNs process sequential data with:
- Memory cells that maintain state information
- Feedback connections for temporal processing
- Variants like LSTM and GRU to address vanishing gradient problems

## Transformer Architectures
Transformers have revolutionized NLP through:
- Self-attention mechanisms
- Parallel processing capabilities
- Positional encoding for sequence awareness

## Performance Comparison
| Architecture | Training Efficiency | Inference Speed | Parameter Count |
|--------------|---------------------|-----------------|-----------------|
| CNN          | Medium              | Fast            | 5-25M           |
| RNN/LSTM     | Slow                | Medium          | 10-50M          |
| Transformer  | Very Slow           | Medium          | 100M-175B       |

## Technical Challenges
- Computational complexity scales with model size
- Training stability issues in deep architectures
- Hyperparameter optimization complexity

## Conclusion
Each neural network architecture offers distinct advantages for specific problem domains. Selection should be based on data characteristics, computational constraints, and performance requirements.`
  }
};

/**
 * Create a mock Google Generative AI model
 *
 * @param {Object} options - Configuration options
 * @returns {Object} - Mock model with generateContent method
 */
function createMockGoogleModel(options = {}) {
  const model = options.model || 'gemini-1.5-pro';

  log.debug('Creating mock Google model', { model });

  return {
    generateContent: async function(params) {
      log.debug('Mock Google model generating content', {
        model,
        contentLength: params.contents?.[0]?.parts?.[0]?.text?.length || 0
      });

      // Determine the type of response based on the prompt
      const prompt = params.contents?.[0]?.parts?.[0]?.text || '';
      let responseText = '';

      if (prompt.includes('generate search queries')) {
        // Query generation response
        if (prompt.includes('technical') || prompt.includes('scientific')) {
          responseText = mockResponses.queryGeneration.technical;
        } else {
          responseText = mockResponses.queryGeneration.default;
        }
      } else if (prompt.includes('process search results') || prompt.includes('analyze the following search results')) {
        // Search processing response
        responseText = mockResponses.searchProcessing.default;
      } else if (prompt.includes('write a report') || prompt.includes('create a comprehensive report')) {
        // Report writing response
        if (prompt.includes('technical') || prompt.includes('scientific')) {
          responseText = mockResponses.reportWriting.technical;
        } else {
          responseText = mockResponses.reportWriting.default;
        }
      } else {
        // Default response - return a simple JSON array for safety
        responseText = JSON.stringify([
          { query: "Default mock query", researchGoal: "Default research goal" }
        ]);
      }

      // Add a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        response: {
          text: () => responseText
        }
      };
    }
  };
}

/**
 * Create a mock OpenRouter API wrapper
 *
 * @param {Object} options - Configuration options
 * @returns {Object} - Mock wrapper with generateContent method
 */
function createMockOpenRouterWrapper(options = {}) {
  const model = options.model || 'anthropic/claude-3-opus:beta';

  log.debug('Creating mock OpenRouter wrapper', { model });

  return {
    generateContent: async function(params) {
      log.debug('Mock OpenRouter wrapper generating content', {
        model,
        contentLength: params.contents?.[0]?.parts?.[0]?.text?.length || 0
      });

      // Determine the type of response based on the prompt
      const prompt = params.contents?.[0]?.parts?.[0]?.text || '';
      let responseText = '';

      if (prompt.includes('generate search queries')) {
        // Query generation response
        if (prompt.includes('technical') || prompt.includes('scientific')) {
          responseText = mockResponses.queryGeneration.technical;
        } else {
          responseText = mockResponses.queryGeneration.default;
        }
      } else if (prompt.includes('process search results') || prompt.includes('analyze the following search results')) {
        // Search processing response
        responseText = mockResponses.searchProcessing.default;
      } else if (prompt.includes('write a report') || prompt.includes('create a comprehensive report')) {
        // Report writing response
        if (prompt.includes('technical') || prompt.includes('scientific')) {
          responseText = mockResponses.reportWriting.technical;
        } else {
          responseText = mockResponses.reportWriting.default;
        }
      } else {
        // Default response - return a simple JSON array for safety
        responseText = JSON.stringify([
          { query: "Default mock query", researchGoal: "Default research goal" }
        ]);
      }

      // Add a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        response: {
          text: () => responseText
        }
      };
    }
  };
}

/**
 * Create a mock provider based on the specified type
 *
 * @param {string} provider - Provider type ('google' or 'openrouter')
 * @param {string} model - Model name
 * @param {Object} options - Additional options
 * @returns {Object} - Mock provider instance
 */
function createMockProvider(provider, model, options = {}) {
  log.debug('Creating mock provider', { provider, model });

  if (provider === 'google') {
    return createMockGoogleModel({ model, ...options });
  } else if (provider === 'openrouter') {
    return createMockOpenRouterWrapper({ model, ...options });
  }

  // Default to Google if provider not supported
  log.warn('Unsupported provider for mock, defaulting to Google', { requestedProvider: provider });
  return createMockGoogleModel({ model, ...options });
}

module.exports = {
  createMockProvider,
  createMockGoogleModel,
  createMockOpenRouterWrapper,
  mockResponses
};
