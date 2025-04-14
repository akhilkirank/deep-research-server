/**
 * Open Router API Integration
 * 
 * This module provides integration with the Open Router API, allowing access to
 * various LLM models through a single API.
 */

// Import custom logger
const logger = require('./logger');

// Create a module-specific logger
const log = logger.child({ module: 'openrouter' });

// Base URL for Open Router API
const OPENROUTER_API_BASE_URL = process.env.OPENROUTER_API_BASE_URL || 'https://openrouter.ai/api';

/**
 * Create a chat completion using Open Router API
 * 
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Configuration options
 * @param {string} options.model - Model to use (default: anthropic/claude-3-opus:beta)
 * @param {number} options.temperature - Temperature for generation (default: 0.7)
 * @param {number} options.maxTokens - Maximum tokens to generate (default: 4096)
 * @param {string} options.apiKey - Open Router API key (optional, uses env var if not provided)
 * @returns {Promise<Object>} - Response from the API
 */
async function createChatCompletion(messages, options = {}) {
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    const error = new Error('Open Router API key is required');
    log.error('API key missing', { error: error.message });
    throw error;
  }
  
  const model = options.model || process.env.DEFAULT_OPENROUTER_MODEL || 'anthropic/claude-3-opus:beta';
  const temperature = options.temperature !== undefined ? options.temperature : 0.7;
  const maxTokens = options.maxTokens || 4096;
  
  try {
    log.debug('Creating chat completion', { 
      model, 
      temperature, 
      maxTokens,
      messageCount: messages.length
    });
    
    const response = await fetch(`${OPENROUTER_API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://deep-research-server',
        'X-Title': 'Deep Research Server'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Failed to parse error response' };
      }
      
      const error = new Error(`Open Router API error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.data = errorData;
      
      log.error('API request failed', { 
        status: response.status, 
        statusText: response.statusText,
        errorData
      });
      
      throw error;
    }
    
    const data = await response.json();
    
    log.debug('Chat completion successful', { 
      model: data.model,
      usage: data.usage,
      responseLength: data.choices?.[0]?.message?.content?.length || 0
    });
    
    return data;
  } catch (error) {
    log.error('Error creating chat completion', { 
      error: error.message,
      model,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Create a wrapper object that mimics the Google Generative AI interface
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.model - Model to use
 * @param {number} options.temperature - Temperature for generation
 * @param {number} options.maxOutputTokens - Maximum tokens to generate
 * @returns {Object} - Wrapper object with generateContent method
 */
function createModelWrapper(options = {}) {
  const modelOptions = {
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxOutputTokens
  };
  
  return {
    generateContent: async function(params) {
      // Convert Google Generative AI format to Open Router format
      const messages = [];
      
      if (params.contents) {
        for (const content of params.contents) {
          const message = {
            role: content.role === 'user' ? 'user' : 'assistant',
            content: content.parts.map(part => part.text).join('\n')
          };
          messages.push(message);
        }
      }
      
      // If there's a system message in the first content, extract it
      if (messages.length > 0 && messages[0].role === 'user') {
        const userMessage = messages[0].content;
        const systemPromptMatch = userMessage.match(/^(.*?)\n\n/);
        
        if (systemPromptMatch) {
          const systemPrompt = systemPromptMatch[1];
          messages[0].content = userMessage.replace(systemPrompt + '\n\n', '');
          messages.unshift({ role: 'system', content: systemPrompt });
        }
      }
      
      // Set generation parameters
      const completionOptions = {
        ...modelOptions,
        temperature: params.generationConfig?.temperature || modelOptions.temperature,
        maxTokens: params.generationConfig?.maxOutputTokens || modelOptions.maxTokens
      };
      
      // Call Open Router API
      const response = await createChatCompletion(messages, completionOptions);
      
      // Convert Open Router response to Google Generative AI format
      return {
        response: {
          text: () => response.choices[0].message.content
        }
      };
    }
  };
}

module.exports = {
  createChatCompletion,
  createModelWrapper
};
