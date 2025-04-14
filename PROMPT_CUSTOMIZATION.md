# Prompt Customization Guide

This document explains how to customize prompts and detail levels in the Deep Research Server.

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
  "provider": "google",
  "model": "gemini-1.5-pro",
  "searchProvider": "tavily",
  "maxIterations": 2,
  "promptType": "academic",
  "detailLevel": "comprehensive",
  "reportStyle": "academic",
  "requirement": "Focus on the philosophical implications"
}
```

### Generate Search Queries

```json
POST /api/research/start
{
  "topic": "Renewable energy technologies",
  "language": "en-US",
  "provider": "google",
  "model": "gemini-1.5-pro",
  "promptType": "technical",
  "detailLevel": "standard"
}
```

### Generate Final Report

```json
POST /api/research/report
{
  "topic": "Climate change impacts",
  "learnings": ["Learning 1", "Learning 2", "..."],
  "language": "en-US",
  "provider": "google",
  "model": "gemini-1.5-pro",
  "promptType": "news",
  "detailLevel": "brief",
  "reportStyle": "news",
  "requirement": "Focus on recent developments"
}
```

## Default Values

If not specified, the system will use these defaults:

- `promptType`: "default"
- `detailLevel`: "standard"
- `reportStyle`: Based on the topic or "default" if not specified

## Extending the System

You can add new prompt types, detail levels, and report styles by modifying the `src/settings/prompts.js` file.
