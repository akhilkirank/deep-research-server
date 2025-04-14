/**
 * Enhanced Logger Utility Tests
 */

// Mock console methods before requiring the logger
const mockConsoleLog = jest.fn();
const mockConsoleWarn = jest.fn();
const mockConsoleError = jest.fn();

// Save original console methods
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Replace console methods with mocks
console.log = mockConsoleLog;
console.warn = mockConsoleWarn;
console.error = mockConsoleError;

// Now require the logger after mocking console
const logger = require('../../src/utils/logger');

describe('Enhanced Logger Utility', () => {
  // Setup and teardown
  beforeEach(() => {
    // Clear mock history
    mockConsoleLog.mockClear();
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();

    // Reset LOG_LEVEL for each test
    process.env.LOG_LEVEL = 'debug';
    process.env.LOG_FORMAT = 'pretty';
  });

  afterEach(() => {
    // Reset environment variables
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_FORMAT;
  });

  // After all tests, restore console methods
  afterAll(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

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

  test('should log debug messages when LOG_LEVEL is debug', () => {
    process.env.LOG_LEVEL = 'debug';
    logger.debug('Test debug message');
    expect(console.log).toHaveBeenCalled();
  });

  test('should not log debug messages when LOG_LEVEL is info', () => {
    process.env.LOG_LEVEL = 'info';
    logger.debug('Test debug message');
    expect(console.log).not.toHaveBeenCalled();
  });

  test('should log info messages when LOG_LEVEL is info', () => {
    process.env.LOG_LEVEL = 'info';
    logger.info('Test info message');
    expect(console.log).toHaveBeenCalled();
  });

  test('should log warning messages when LOG_LEVEL is warn', () => {
    process.env.LOG_LEVEL = 'warn';
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalled();
  });

  test('should log error messages when LOG_LEVEL is error', () => {
    process.env.LOG_LEVEL = 'error';
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalled();
  });

  test('should not log any messages when LOG_LEVEL is none', () => {
    process.env.LOG_LEVEL = 'none';
    logger.debug('Test debug message');
    logger.info('Test info message');
    logger.warn('Test warning message');
    logger.error('Test error message');
    logger.critical('Test critical message');

    // In 'none' mode, no logs should be produced
    expect(console.log).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  test('should include context in log messages', () => {
    logger.info('Test message with context', { user: 'test', action: 'login' });
    expect(console.log).toHaveBeenCalled();
    const logCall = console.log.mock.calls[0][0];
    expect(logCall).toContain('user=test');
    expect(logCall).toContain('action=login');
  });

  test('should create child loggers with inherited context', () => {
    const childLogger = logger.child({ module: 'auth' });
    childLogger.info('Test child logger message');
    expect(console.log).toHaveBeenCalled();
    const logCall = console.log.mock.calls[0][0];
    expect(logCall).toContain('module=auth');
  });

  test('should handle nested child loggers', () => {
    const parentLogger = logger.child({ module: 'auth' });
    const childLogger = parentLogger.child({ submodule: 'login' });
    childLogger.info('Test nested child logger message');
    expect(console.log).toHaveBeenCalled();
    const logCall = console.log.mock.calls[0][0];
    expect(logCall).toContain('module=auth');
    expect(logCall).toContain('submodule=login');
  });

  test('should handle complex objects in context', () => {
    const complexObject = {
      user: {
        id: 123,
        name: 'Test User',
        roles: ['admin', 'user']
      },
      metadata: {
        timestamp: new Date(),
        source: 'test'
      }
    };

    logger.info('Test message with complex context', { data: complexObject });
    expect(console.log).toHaveBeenCalled();
  });

  test('should handle null and undefined values in context', () => {
    logger.info('Test message with null/undefined context', {
      nullValue: null,
      undefinedValue: undefined
    });
    expect(console.log).toHaveBeenCalled();
    const logCall = console.log.mock.calls[0][0];
    expect(logCall).toContain('nullValue=null');
    expect(logCall).toContain('undefinedValue=undefined');
  });

  test('should redact sensitive information in logs', () => {
    logger.info('Test message with sensitive data', {
      api_key: 'secret-api-key-123',
      password: 'super-secret-password',
      user: 'testuser',
      normalData: 'This should not be redacted'
    });
    expect(console.log).toHaveBeenCalled();
    const logCall = console.log.mock.calls[0][0];
    expect(logCall).toContain('[REDACTED]');
    expect(logCall).not.toContain('secret-api-key-123');
    expect(logCall).not.toContain('super-secret-password');
    expect(logCall).toContain('user=testuser');
    expect(logCall).toContain('normalData=This should not be redacted');
  });

  test('should support log categories', () => {
    const apiLogger = logger.child({ category: logger.CATEGORIES.API });
    apiLogger.info('Test API log message');
    expect(console.log).toHaveBeenCalled();
    const logCall = console.log.mock.calls[0][0];
    expect(logCall).toContain('[api]');
  });

  test('should support specialized category loggers', () => {
    const testLogger = logger.child({ component: 'test' });
    testLogger.api('Test API message');
    testLogger.server('Test server message');
    testLogger.research('Test research message');

    expect(console.log).toHaveBeenCalledTimes(3);
    expect(console.log.mock.calls[0][0]).toContain('[api]');
    expect(console.log.mock.calls[1][0]).toContain('[server]');
    expect(console.log.mock.calls[2][0]).toContain('[research]');
  });

  test('should log critical messages', () => {
    logger.critical('Test critical message');
    expect(console.error).toHaveBeenCalled();
    const logCall = console.error.mock.calls[0][0];
    expect(logCall).toContain('CRITICAL');
  });
});
