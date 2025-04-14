/**
 * LLM Settings
 * 
 * This file contains settings related to Language Models.
 */

// Google Gemini Settings
const googleSettings = {
  // Model for thinking tasks (query generation, review)
  thinkingModel: 'gemini-2.0-flash-thinking-exp-01-21',//use Gemini 2.0 Flash Thinking Experimental 01-21
  
  // Model for networking tasks (search processing, report writing)
  networkingModel: 'gemini-2.0-flash-001',//use Gemini 2.0 Flash,
  
  // Default temperature for generation
  defaultTemperature: 0.7,
  
  // Default top-p for generation
  defaultTopP: 0.95,
  
  // Default top-k for generation
  defaultTopK: 40,
  
  // Default maximum output tokens
  defaultMaxOutputTokens: 8192,
  
  // Safety settings
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
};

// Generation Settings
const generationSettings = {
  // Default temperature for different tasks
  temperature: {
    queryGeneration: 0.2,
    searchProcessing: 0.2,
    reportWriting: 0.7
  },
  
  // Maximum tokens for different tasks
  maxTokens: {
    queryGeneration: 1024,
    searchProcessing: 4096,
    reportWriting: 32768
  },
  
  // Whether to use streaming responses
  useStreaming: true,
  
  // Whether to include reasoning in responses
  includeReasoning: false
};

module.exports = {
  googleSettings,
  generationSettings
};
