/**
 * Settings Tests
 */
const appSettings = require('../../src/settings/app');
const apiSettings = require('../../src/settings/api');
const llmSettings = require('../../src/settings/llm');
const searchSettings = require('../../src/settings/search');
const promptSettings = require('../../src/settings/prompts');

describe('Application Settings', () => {
  test('should export the expected settings objects', () => {
    expect(appSettings).toHaveProperty('appSettings');
    expect(appSettings).toHaveProperty('apiKeySettings');
    expect(appSettings).toHaveProperty('environmentSettings');
  });

  test('should have valid app settings', () => {
    expect(appSettings.appSettings).toHaveProperty('appName');
    expect(appSettings.appSettings).toHaveProperty('appVersion');
    expect(appSettings.appSettings).toHaveProperty('defaultLanguage');
  });

  test('should have valid API key settings', () => {
    expect(appSettings.apiKeySettings).toHaveProperty('googleApiKeyEnvVar');
    expect(appSettings.apiKeySettings).toHaveProperty('tavilyApiKeyEnvVar');
    expect(appSettings.apiKeySettings).toHaveProperty('openRouterApiKeyEnvVar');
  });
});

describe('API Settings', () => {
  test('should export the expected settings objects', () => {
    expect(apiSettings).toHaveProperty('apiSettings');
    expect(apiSettings).toHaveProperty('responseSettings');
  });

  test('should have valid API settings', () => {
    expect(apiSettings.apiSettings).toHaveProperty('basePath');
    expect(apiSettings.apiSettings).toHaveProperty('version');
  });

  test('should have valid response settings', () => {
    expect(apiSettings.responseSettings).toHaveProperty('defaultFormat');
    expect(apiSettings.responseSettings).toHaveProperty('availableFormats');
    expect(apiSettings.responseSettings).toHaveProperty('includeApiVersion');
  });
});

describe('LLM Settings', () => {
  test('should export the expected settings objects', () => {
    expect(llmSettings).toHaveProperty('googleSettings');
    expect(llmSettings).toHaveProperty('openRouterSettings');
    expect(llmSettings).toHaveProperty('generationSettings');
    expect(llmSettings).toHaveProperty('providerSettings');
  });

  test('should have valid Google settings', () => {
    expect(llmSettings.googleSettings).toHaveProperty('thinkingModel');
    expect(llmSettings.googleSettings).toHaveProperty('networkingModel');
    expect(llmSettings.googleSettings).toHaveProperty('defaultTemperature');
    expect(llmSettings.googleSettings).toHaveProperty('defaultMaxOutputTokens');
  });

  test('should have valid Open Router settings', () => {
    expect(llmSettings.openRouterSettings).toHaveProperty('thinkingModel');
    expect(llmSettings.openRouterSettings).toHaveProperty('networkingModel');
    expect(llmSettings.openRouterSettings).toHaveProperty('defaultTemperature');
    expect(llmSettings.openRouterSettings).toHaveProperty('availableModels');
  });

  test('should have valid provider settings', () => {
    expect(llmSettings.providerSettings).toHaveProperty('defaultProvider');
    expect(llmSettings.providerSettings).toHaveProperty('availableProviders');
    expect(llmSettings.providerSettings).toHaveProperty('providerNames');
  });
});

describe('Search Settings', () => {
  test('should export the expected settings objects', () => {
    expect(searchSettings).toHaveProperty('searchProviderSettings');
    expect(searchSettings).toHaveProperty('tavilySearchSettings');
    expect(searchSettings).toHaveProperty('topicSpecificSearchSettings');
  });

  test('should have valid search settings', () => {
    expect(searchSettings.searchProviderSettings).toHaveProperty('defaultProvider');
    expect(searchSettings.searchProviderSettings).toHaveProperty('maxIterations');
    expect(searchSettings.searchProviderSettings).toHaveProperty('availableProviders');
  });

  test('should have valid Tavily settings', () => {
    expect(searchSettings.tavilySearchSettings).toHaveProperty('searchDepth');
    expect(searchSettings.tavilySearchSettings).toHaveProperty('maxResults');
    expect(searchSettings.tavilySearchSettings).toHaveProperty('includeAnswer');
  });
});

describe('Prompt Settings', () => {
  test('should export the expected settings objects', () => {
    expect(promptSettings).toHaveProperty('systemPrompts');
    expect(promptSettings).toHaveProperty('detailLevelPrompts');
    expect(promptSettings).toHaveProperty('reportStylePrompts');
  });

  test('should have valid system prompts', () => {
    expect(promptSettings.systemPrompts).toHaveProperty('default');
    expect(promptSettings.systemPrompts).toHaveProperty('academic');
    expect(promptSettings.systemPrompts).toHaveProperty('technical');
    expect(promptSettings.systemPrompts).toHaveProperty('news');
  });

  test('should have valid detail level prompts', () => {
    expect(promptSettings.detailLevelPrompts).toHaveProperty('brief');
    expect(promptSettings.detailLevelPrompts).toHaveProperty('standard');
    expect(promptSettings.detailLevelPrompts).toHaveProperty('comprehensive');
  });

  test('should have valid report style prompts', () => {
    expect(promptSettings.reportStylePrompts).toHaveProperty('default');
    expect(promptSettings.reportStylePrompts).toHaveProperty('academic');
    expect(promptSettings.reportStylePrompts).toHaveProperty('technical');
    expect(promptSettings.reportStylePrompts).toHaveProperty('news');
  });
});
