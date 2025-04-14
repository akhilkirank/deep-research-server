#!/bin/bash

# Enhanced Test Runner Script
# This script runs all tests for the Deep Research Server with improved output

# Set environment to test
export NODE_ENV=test

# Set log level to error to reduce noise during tests
export LOG_LEVEL=error

# Set log format to pretty for better readability
export LOG_FORMAT=pretty

# Check if Jest is installed
if ! command -v npx jest &> /dev/null; then
  echo "Jest is not installed. Installing dependencies..."
  npm install
fi

# Parse command line arguments
COVERAGE=false
WATCH=false
VERBOSE=false
SIMPLE_TEST=true

for arg in "$@"; do
  case $arg in
    --coverage)
      COVERAGE=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --no-simple)
      SIMPLE_TEST=false
      shift
      ;;
  esac
done

# Print header
echo "\033[1;34m========================================\033[0m"
echo "\033[1;34m  Deep Research Server Test Runner     \033[0m"
echo "\033[1;34m========================================\033[0m"
echo ""

# Build command based on arguments
COMMAND="npx jest"

if [ "$COVERAGE" = true ]; then
  echo "\033[1;33mRunning tests with coverage...\033[0m"
  COMMAND="$COMMAND --coverage"
else
  echo "\033[1;36mRunning tests...\033[0m"
fi

if [ "$WATCH" = true ]; then
  COMMAND="$COMMAND --watch"
fi

if [ "$VERBOSE" = true ]; then
  COMMAND="$COMMAND --verbose"
fi

# Run the tests
eval "$COMMAND $*"

# Store exit code
JEST_EXIT_CODE=$?

# Run simple test if requested and Jest tests passed
if [ "$SIMPLE_TEST" = true ] && [ "$JEST_EXIT_CODE" -eq 0 ]; then
  echo "\n\033[1;36mRunning simple test...\033[0m"
  node simple-test.js
  SIMPLE_EXIT_CODE=$?

  # Use the simple test exit code if it failed
  if [ "$SIMPLE_EXIT_CODE" -ne 0 ]; then
    exit $SIMPLE_EXIT_CODE
  fi
fi

# Return the Jest exit code
exit $JEST_EXIT_CODE
