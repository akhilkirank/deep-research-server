# Prompt Customization Guide

This document explains how to customize prompts, detail levels, and report styles in the Deep Research Server. These customization options allow you to tailor the research process and output to your specific needs.

## Available Customization Options

### Prompt Types

The system supports different prompt types that define the "persona" of the research assistant:

- `default`: General-purpose research assistant
- `academic`: Academic research specialist
- `technical`: Technical documentation specialist
- `news`: News analysis specialist

### Detail Levels

You can control the level of detail in the research output:

- `brief`: Concise overview with key points only
- `standard`: Balanced level of detail with supporting evidence (default)
- `comprehensive`: Extremely detailed analysis with extensive information

### Report Styles

You can specify different report structure styles:

- `default`: General-purpose report structure
- `academic`: Academic paper structure
- `technical`: Technical documentation structure
- `news`: News analysis structure

## Using Customization Options in API Requests

### Complete Research Query

```json
POST /api/research/query
{
  "query": "History of artificial intelligence",
  "language": "en-US",
  "provider": "google",                     // Can be "google" or "openrouter"
  "model": "gemini-1.5-pro",                // Model name depends on provider
  "searchProvider": "tavily",               // Currently only "tavily" is supported
  "maxIterations": 2,                       // Number of research iterations
  "promptType": "academic",                 // Persona type (academic, technical, news, default)
  "detailLevel": "comprehensive",           // Level of detail (brief, standard, comprehensive)
  "reportStyle": "academic",                // Report structure (academic, technical, news, default)
  "requirement": "Focus on the philosophical implications"  // Additional instructions
}
```

### Generate Search Queries

```json
POST /api/research/start
{
  "topic": "Renewable energy technologies",  // Research topic
  "language": "en-US",                      // Output language
  "provider": "google",                     // LLM provider (google, openrouter)
  "model": "gemini-1.5-pro",                // Model name
  "promptType": "technical",                // Persona type
  "detailLevel": "standard"                 // Level of detail
}
```

### Generate Final Report

```json
POST /api/research/report
{
  "topic": "Climate change impacts",         // Research topic
  "learnings": [                            // Array of research findings
    "Learning 1",
    "Learning 2",
    "..."
  ],
  "language": "en-US",                      // Output language
  "provider": "openrouter",                 // LLM provider
  "model": "anthropic/claude-3-opus:beta",   // Model name
  "promptType": "news",                     // Persona type
  "detailLevel": "brief",                   // Level of detail
  "reportStyle": "news",                    // Report structure
  "requirement": "Focus on recent developments"  // Additional instructions
}
```

## Default Values

If not specified, the system will use these defaults:

| Parameter        | Default Value       | Source                                                     |
| ---------------- | ------------------- | ---------------------------------------------------------- |
| `provider`       | "google"            | Environment variable `DEFAULT_LLM_PROVIDER` or fallback    |
| `model`          | Depends on provider | Environment variables or settings in `llm.js`              |
| `searchProvider` | "tavily"            | Environment variable `DEFAULT_SEARCH_PROVIDER` or fallback |
| `promptType`     | "default"           | Hard-coded in `prompts.js`                                 |
| `detailLevel`    | "standard"          | Hard-coded in `prompts.js`                                 |
| `reportStyle`    | Based on topic      | Determined by topic analysis or "default"                  |
| `language`       | "en-US"             | Environment variable or settings in `app.js`               |

## Provider-Specific Models

### Google Gemini Models

- `gemini-2.0-flash-thinking-exp-01-21` (default for thinking tasks)
- `gemini-2.0-flash-001` (default for networking tasks)
- `gemini-1.5-pro`
- `gemini-1.5-flash`

### Open Router Models

- `anthropic/claude-3-opus:beta` (default)
- `anthropic/claude-3-sonnet:beta`
- `anthropic/claude-3-haiku:beta`
- `openai/gpt-4-turbo`
- `openai/gpt-4o`
- `openai/gpt-3.5-turbo`
- `meta-llama/llama-3-70b-instruct`
- `meta-llama/llama-3-8b-instruct`

## Extending the System

You can add new prompt types, detail levels, and report styles by modifying the `src/settings/prompts.js` file. The system is designed to be easily extensible with new templates and styles.

### Adding a New Prompt Type

To add a new prompt type, add an entry to the `systemPrompts` object in `prompts.js`:

```javascript
// Example: Adding a new "marketing" prompt type
systemPrompts: {
  // Existing prompt types...
  marketing: "You are a marketing research assistant. Your task is to help users research market trends, consumer behavior, and competitive landscapes to create effective marketing strategies.";
}
```

### Adding a New Report Style

To add a new report style, add an entry to the `reportStylePrompts` object in `prompts.js`:

```javascript
// Example: Adding a new "marketing" report style
reportStylePrompts: {
  // Existing report styles...
  marketing: "Structure the report with the following sections:\n1. Executive Summary\n2. Market Overview\n3. Target Audience Analysis\n4. Competitive Landscape\n5. Marketing Strategy Recommendations\n6. Implementation Plan\n7. Metrics and KPIs\n8. References";
}
```
