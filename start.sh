#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Warning: .env file not found. Creating from .env.example..."
  cp .env.example .env
  echo "Please edit .env file and add your API keys before running the server."
  exit 1
fi

# Check if node_modules directory exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Test API keys
echo "Testing API keys..."
node test-api-keys.js

# Start the server
echo "Starting Deep Research Server..."
npm start
