/**
 * Settings Index
 * 
 * This file exports all settings from the various settings files.
 * Import this file to access all settings in one place.
 */

// Export all settings from each file
const app = require('./app');
const api = require('./api');
const llm = require('./llm');
const search = require('./search');
const prompts = require('./prompts');

module.exports = {
  app,
  api,
  llm,
  search,
  prompts
};
