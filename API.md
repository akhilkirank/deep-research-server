# Deep Research Server API Documentation

This document provides detailed information about the API endpoints available in the Deep Research Server.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:3000/api/research
```

The port may vary depending on your configuration.

## Authentication

Currently, the API does not require authentication. However, you need to provide valid API keys in your server's `.env` file for the LLM providers and search services.

## API Endpoints

### Complete Research Query

Performs a complete research operation in a single request.

**Endpoint:** `POST /api/research/query`

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | The research topic or question |
| `language` | string | No | Output language (default: "en-US") |
| `provider` | string | No | LLM provider: "google" or "openrouter" (default: "google") |
| `model` | string | No | Model name (depends on provider) |
| `searchProvider` | string | No | Search provider: "tavily" (default: "tavily") |
| `maxIterations` | number | No | Number of research iterations (default: 2) |
| `maxResults` | number | No | Maximum search results per query (default: 5) |
| `promptType` | string | No | Persona type: "default", "academic", "technical", "news" |
| `detailLevel` | string | No | Detail level: "brief", "standard", "comprehensive" |
| `reportStyle` | string | No | Report structure style: "default", "academic", "technical", "news" |
| `requirement` | string | No | Additional instructions for the report |

**Example Request:**

```json
POST /api/research/query
{
  "query": "History of artificial intelligence",
  "language": "en-US",
  "provider": "google",
  "model": "gemini-1.5-pro",
  "searchProvider": "tavily",
  "maxIterations": 2,
  "reportStyle": "academic",
  "maxResults": 10,
  "detailLevel": "comprehensive",
  "promptType": "academic"
}
```

**Response:**

```json
{
  "report": "# History of Artificial Intelligence\n\n## Abstract\n\nThis paper provides a comprehensive overview of the history of artificial intelligence (AI)..."
}
```

### Generate Search Queries

Generates search queries for a given topic.

**Endpoint:** `POST /api/research/start`

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | The research topic |
| `language` | string | No | Output language (default: "en-US") |
| `provider` | string | No | LLM provider: "google" or "openrouter" (default: "google") |
| `model` | string | No | Model name (depends on provider) |
| `promptType` | string | No | Persona type: "default", "academic", "technical", "news" |
| `detailLevel` | string | No | Detail level: "brief", "standard", "comprehensive" |

**Example Request:**

```json
POST /api/research/start
{
  "topic": "Quantum computing",
  "language": "en-US",
  "provider": "google",
  "model": "gemini-1.5-flash",
  "promptType": "technical",
  "detailLevel": "standard"
}
```

**Response:**

```json
{
  "queries": [
    {
      "query": "What is quantum computing and how does it work",
      "researchGoal": "Understand the basic principles and mechanisms of quantum computing"
    },
    {
      "query": "History and evolution of quantum computing",
      "researchGoal": "Trace the development of quantum computing from theoretical concept to practical implementation"
    }
  ]
}
```

### Run Search Tasks

Runs search tasks for a set of queries.

**Endpoint:** `POST /api/research/search`

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `queries` | array | Yes | Array of query objects with `query` and `researchGoal` properties |
| `language` | string | No | Output language (default: "en-US") |
| `provider` | string | No | LLM provider: "google" or "openrouter" (default: "google") |
| `model` | string | No | Model name (depends on provider) |
| `enableSearch` | boolean | No | Whether to enable web search (default: true) |
| `searchProvider` | string | No | Search provider: "tavily" (default: "tavily") |
| `parallelSearch` | boolean | No | Whether to run searches in parallel (default: false) |
| `searchMaxResult` | number | No | Maximum search results per query (default: 5) |

**Example Request:**

```json
POST /api/research/search
{
  "queries": [
    {
      "query": "What is quantum computing and how does it work",
      "researchGoal": "Understand the basic principles and mechanisms of quantum computing"
    }
  ],
  "language": "en-US",
  "provider": "google",
  "model": "gemini-1.5-pro",
  "enableSearch": true,
  "searchProvider": "tavily",
  "parallelSearch": false,
  "searchMaxResult": 5
}
```

**Response:**

```json
{
  "results": [
    {
      "query": "What is quantum computing and how does it work",
      "researchGoal": "Understand the basic principles and mechanisms of quantum computing",
      "sources": [
        {
          "title": "Quantum Computing: Definition, How It Works, and Applications",
          "content": "Quantum computing is a type of computing that uses quantum bits or qubits...",
          "url": "https://example.com/quantum-computing"
        }
      ],
      "learnings": [
        "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously due to superposition",
        "Unlike classical bits that are either 0 or 1, qubits can be both 0 and 1 at the same time"
      ]
    }
  ]
}
```

### Generate Final Report

Generates a final report from research learnings.

**Endpoint:** `POST /api/research/report`

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | The research topic |
| `learnings` | array | Yes | Array of research findings as strings |
| `language` | string | No | Output language (default: "en-US") |
| `provider` | string | No | LLM provider: "google" or "openrouter" (default: "google") |
| `model` | string | No | Model name (depends on provider) |
| `requirement` | string | No | Additional instructions for the report |
| `promptType` | string | No | Persona type: "default", "academic", "technical", "news" |
| `detailLevel` | string | No | Detail level: "brief", "standard", "comprehensive" |
| `reportStyle` | string | No | Report structure style: "default", "academic", "technical", "news" |

**Example Request:**

```json
POST /api/research/report
{
  "topic": "Quantum computing",
  "learnings": [
    "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously due to superposition",
    "Unlike classical bits that are either 0 or 1, qubits can be both 0 and 1 at the same time"
  ],
  "language": "en-US",
  "provider": "openrouter",
  "model": "anthropic/claude-3-opus:beta",
  "requirement": "Focus on practical applications and future potential",
  "promptType": "technical",
  "detailLevel": "comprehensive",
  "reportStyle": "technical"
}
```

**Response:**

```json
{
  "report": "# Quantum Computing: Principles, Applications, and Future Potential\n\n## Overview\n\nThis report provides a comprehensive overview of quantum computing..."
}
```

## Health Check Endpoint

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

## Error Handling

The API is designed to be resilient and will attempt to return a valid response even in case of errors. If an error occurs during the research process, the API will return a basic report with information about the error.

**Example Error Response:**

```json
{
  "report": "# Research Report on Quantum Computing\n\n## Error Generating Report\n\nWe encountered an error while researching this topic: API rate limit exceeded\n\nPlease try again later or refine your query."
}
```

For critical errors that prevent the API from functioning, a standard error response will be returned:

```json
{
  "error": {
    "message": "Invalid request body",
    "code": 400
  }
}
```

## Rate Limiting

Currently, the API does not implement rate limiting. However, the underlying LLM providers may have their own rate limits. If you encounter rate limit errors, the server will attempt to retry with exponential backoff or fall back to a smaller model.
