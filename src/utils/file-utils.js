/**
 * File Utilities
 *
 * This module provides utilities for file operations, particularly for saving
 * research reports as Markdown files.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Import custom logger
const logger = require('./logger');
const log = logger.child({ module: 'file-utils', category: logger.CATEGORIES.SYSTEM });

// Promisify fs functions
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Sanitize a string to be used as a filename
 *
 * @param {string} str - The string to sanitize
 * @returns {string} - A sanitized string safe for use as a filename
 */
function sanitizeFilename(str) {
  if (!str) return 'untitled';

  // Remove code block markers and language identifiers
  str = str.replace(/^```[\w-]*\s*\n?/, '').replace(/\n?```$/, '');

  // Extract the first line or first few words for very long inputs
  let shortened = str;
  if (str.length > 50) {
    // Try to get the first line, limited to 50 chars
    const firstLine = str.split('\n')[0].trim();
    shortened = firstLine.length > 0 ? firstLine : str.substring(0, 50);
  }

  // Replace invalid filename characters with underscores
  shortened = shortened
    .replace(/[/\\?%*:|"<>]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_')           // Replace spaces with underscores
    .replace(/_+/g, '_')            // Replace multiple underscores with a single one
    .trim();

  // Ensure the filename isn't too long (max 100 chars including extension and timestamp)
  // This leaves room for the timestamp and extension which will be added later
  return shortened.substring(0, 80);
}

/**
 * Ensure a directory exists, creating it if necessary
 *
 * @param {string} dirPath - The directory path to ensure
 * @returns {Promise<void>}
 */
async function ensureDirectoryExists(dirPath) {
  try {
    await mkdirAsync(dirPath, { recursive: true });
  } catch (error) {
    // Directory already exists or other error
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Save a report to a Markdown file
 *
 * @param {string} report - The report content in Markdown format
 * @param {string} topic - The research topic (used for filename)
 * @param {Object} options - Additional options
 * @param {string} [options.directory='reports'] - Directory to save reports in
 * @param {string} [options.prefix=''] - Prefix for the filename
 * @returns {Promise<string>} - The path to the saved file
 */
async function saveReportToFile(report, topic, options = {}) {
  try {
    // Default options
    const {
      directory = 'reports',
      prefix = ''
    } = options;

    // Create a sanitized filename from the topic
    let topicForFilename = topic;

    // If the topic is not a string, is very long, or starts with code block markers, use a generic name
    if (!topic || typeof topic !== 'string' || topic.length > 200 || topic.startsWith('```')) {
      // Extract a title from the report content if possible
      const titleMatch = report.match(/^# (.+)$/m);
      if (titleMatch && titleMatch[1]) {
        topicForFilename = titleMatch[1].trim();
      } else {
        topicForFilename = 'Research_Report';
      }
    }

    const sanitizedTopic = sanitizeFilename(topicForFilename);
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filename = `${prefix}${sanitizedTopic}_${timestamp}.md`;

    // Ensure the reports directory exists
    const reportsDir = path.resolve(process.cwd(), directory);
    await ensureDirectoryExists(reportsDir);

    // Full path to the report file
    const filePath = path.join(reportsDir, filename);

    // Write the report to the file
    await writeFileAsync(filePath, report, 'utf8');

    log.info(`Report saved to file`, {
      topic,
      filePath,
      size: report.length
    });

    return filePath;
  } catch (error) {
    log.error(`Error saving report to file`, {
      topic,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  sanitizeFilename,
  ensureDirectoryExists,
  saveReportToFile
};
