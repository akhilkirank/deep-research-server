const { normalizeMarkdownNewlines } = require('../../src/utils/research');

describe('Markdown Normalization', () => {
  test('should properly format headers with correct spacing', () => {
    const input = '# Header 1\n## Header 2\nSome text';
    const expected = '# Header 1\n\n## Header 2\n\nSome text';
    expect(normalizeMarkdownNewlines(input)).toBe(expected);
  });

  test('should properly format paragraphs with correct spacing', () => {
    const input = 'Paragraph 1\nParagraph 2\nParagraph 3';
    const expected = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
    expect(normalizeMarkdownNewlines(input)).toBe(expected);
  });

  test('should properly format lists with correct spacing', () => {
    const input = '- Item 1\n- Item 2\n- Item 3';
    const expected = '- Item 1\n\n- Item 2\n\n- Item 3';
    expect(normalizeMarkdownNewlines(input)).toBe(expected);
  });

  test('should properly format numbered lists with correct spacing', () => {
    const input = '1. Item 1\n2. Item 2\n3. Item 3';
    const expected = '1. Item 1\n\n2. Item 2\n\n3. Item 3';
    expect(normalizeMarkdownNewlines(input)).toBe(expected);
  });

  test('should properly format tables with correct spacing', () => {
    const input = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\nText after table';
    const expected = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n\nText after table';
    expect(normalizeMarkdownNewlines(input)).toBe(expected);
  });

  test('should remove excessive newlines', () => {
    const input = 'Paragraph 1\n\n\n\nParagraph 2\n\n\nParagraph 3';
    const expected = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
    expect(normalizeMarkdownNewlines(input)).toBe(expected);
  });

  test('should handle complex markdown documents', () => {
    const input = '# Research Report\n## Introduction\nThis is an introduction.\n- Point 1\n- Point 2\n## Analysis\nAnalysis text here.\n1. First item\n2. Second item\n| Data | Value |\n| --- | --- |\n| A | 1 |\n| B | 2 |\nConclusion paragraph.';

    // Get the actual result for debugging
    const result = normalizeMarkdownNewlines(input);

    // Check each part of the formatting separately for easier debugging
    expect(result).toContain('# Research Report\n\n## Introduction');
    expect(result).toContain('Introduction\n\nThis is an introduction');
    expect(result).toContain('introduction.\n\n- Point 1');
    expect(result).toContain('Point 1\n\n- Point 2');
    expect(result).toContain('Point 2\n\n## Analysis');
    expect(result).toContain('Analysis\n\nAnalysis text here');
    expect(result).toContain('text here.\n\n1. First item');
    expect(result).toContain('First item\n\n2. Second item');
    expect(result).toContain('| B | 2 |\n\nConclusion paragraph');
  });

  test('should handle null or empty input', () => {
    expect(normalizeMarkdownNewlines(null)).toBeNull();
    expect(normalizeMarkdownNewlines('')).toBe('');
  });
});
