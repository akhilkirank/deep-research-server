/**
 * LLM Settings
 *
 * This file contains settings related to Language Models.
 * Includes configuration for Google Gemini and Open Router.
 */

// Get environment variables with defaults
const DEFAULT_THINKING_MODEL = process.env.DEFAULT_THINKING_MODEL || 'gemini-2.0-flash-thinking-exp-01-21';
const DEFAULT_NETWORKING_MODEL = process.env.DEFAULT_NETWORKING_MODEL || 'gemini-2.0-flash-001';
const DEFAULT_OPENROUTER_MODEL = process.env.DEFAULT_OPENROUTER_MODEL || 'google/gemini-2.5-pro-exp-03-25:free';

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

// Open Router Settings
const openRouterSettings = {
  // Model for thinking tasks (query generation, review)
  thinkingModel: DEFAULT_OPENROUTER_MODEL,

  // Model for networking tasks (search processing, report writing)
  networkingModel: DEFAULT_OPENROUTER_MODEL,

  // Default temperature for generation
  defaultTemperature: 0.7,

  // Default maximum output tokens
  defaultMaxOutputTokens: 4096,

  // Available models
  availableModels: [
    'anthropic/claude-3-opus:beta',
    'anthropic/claude-3-sonnet:beta',
    'anthropic/claude-3-haiku:beta',
    'openai/gpt-4-turbo',
    'openai/gpt-4o',
    'openai/gpt-3.5-turbo',
    'meta-llama/llama-3-70b-instruct',
    'meta-llama/llama-3-8b-instruct'
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

// Provider Settings
const providerSettings = {
  // Default provider
  defaultProvider: process.env.DEFAULT_LLM_PROVIDER || 'google',

  // Available providers
  availableProviders: ['google', 'openrouter'],

  // Provider display names
  providerNames: {
    google: 'Google Gemini',
    openrouter: 'Open Router'
  }
};

module.exports = {
  googleSettings,
  openRouterSettings,
  generationSettings,
  providerSettings
};
