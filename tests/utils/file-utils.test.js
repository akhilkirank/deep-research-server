/**
 * File Utilities Tests
 *
 * Tests for the file utilities module
 */

// Import the file utilities
const { sanitizeFilename } = require('../../src/utils/file-utils');

describe('File Utilities', () => {
  // Tests
  test('should sanitize filenames correctly', () => {
    // Test with various special characters
    expect(sanitizeFilename('test/file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test\\file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test?file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test%file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test*file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test:file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test|file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test"file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test<file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test>file.txt')).toBe('test_file.txt');

    // Test with spaces
    expect(sanitizeFilename('test file.txt')).toBe('test_file.txt');
    expect(sanitizeFilename('test  file.txt')).toBe('test_file.txt');

    // Test with multiple underscores
    expect(sanitizeFilename('test__file.txt')).toBe('test_file.txt');

    // Test with a complex example
    expect(sanitizeFilename('History of Artificial Intelligence (1950-2023)')).toBe(
      'History_of_Artificial_Intelligence_(1950-2023)'
    );

    // Test with code block markers
    expect(sanitizeFilename('```javascript\nconst x = 1;\n```')).toBe('const_x_=_1;');
    expect(sanitizeFilename('```\nSome text\n```')).toBe('Some_text');

    // Test with very long input
    const longInput = 'This is a very long input that should be truncated to ensure the filename is not too long. ' +
                     'We need to make sure it works correctly with very verbose topics or queries.';
    expect(sanitizeFilename(longInput).length).toBeLessThanOrEqual(80);
    expect(sanitizeFilename(longInput)).toBe('This_is_a_very_long_input_that_should_be_truncated_to_ensure_the_filename_is_not');

    // Test with empty or null input
    expect(sanitizeFilename('')).toBe('untitled');
    expect(sanitizeFilename(null)).toBe('untitled');
    expect(sanitizeFilename(undefined)).toBe('untitled');
  });
});
