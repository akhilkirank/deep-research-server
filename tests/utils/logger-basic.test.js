/**
 * Basic Logger Tests
 * 
 * These tests verify the basic functionality of the logger without mocking console methods,
 * which can cause issues with Jest's module system.
 */

// Import the logger
const logger = require('../../src/utils/logger');

describe('Logger Basic Functionality', () => {
  // Tests
  test('should export the expected functions and constants', () => {
    expect(logger).toHaveProperty('debug');
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('critical');
    expect(logger).toHaveProperty('child');
    expect(logger).toHaveProperty('CATEGORIES');
    expect(logger).toHaveProperty('LOG_LEVELS');
    expect(logger).toHaveProperty('redactSensitiveData');
  });

  test('should create child loggers with inherited context', () => {
    const childLogger = logger.child({ component: 'test' });
    expect(childLogger).toHaveProperty('debug');
    expect(childLogger).toHaveProperty('info');
    expect(childLogger).toHaveProperty('warn');
    expect(childLogger).toHaveProperty('error');
    expect(childLogger).toHaveProperty('critical');
    expect(childLogger).toHaveProperty('child');
  });

  test('should have specialized category loggers', () => {
    const childLogger = logger.child({ component: 'test' });
    expect(childLogger).toHaveProperty('api');
    expect(childLogger).toHaveProperty('apiError');
    expect(childLogger).toHaveProperty('server');
    expect(childLogger).toHaveProperty('research');
    expect(childLogger).toHaveProperty('db');
    expect(childLogger).toHaveProperty('auth');
    expect(childLogger).toHaveProperty('test');
  });

  test('should redact sensitive data', () => {
    const data = {
      api_key: 'secret-api-key-123',
      password: 'super-secret-password',
      user: 'testuser',
      normalData: 'This should not be redacted',
      nested: {
        token: 'secret-token',
        public: 'public-data'
      }
    };

    const redacted = logger.redactSensitiveData(data);
    
    // Check that sensitive fields are redacted
    expect(redacted.api_key).toBe('[REDACTED]');
    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.nested.token).toBe('[REDACTED]');
    
    // Check that non-sensitive fields are not redacted
    expect(redacted.user).toBe('testuser');
    expect(redacted.normalData).toBe('This should not be redacted');
    expect(redacted.nested.public).toBe('public-data');
  });

  test('should handle different log levels', () => {
    // This is just a smoke test to ensure the methods don't throw
    expect(() => {
      logger.debug('Test debug message');
      logger.info('Test info message');
      logger.warn('Test warning message');
      logger.error('Test error message');
      logger.critical('Test critical message');
    }).not.toThrow();
  });
});
