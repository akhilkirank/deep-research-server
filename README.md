# Deep Research Server

A standalone server for performing deep research using AI and web search. This server provides a simple API for generating comprehensive research reports on any topic.

## Features

- Single API endpoint for complete research operations
- Configurable settings for customizing research behavior
- Integration with Google Gemini for AI processing
- Web search functionality using Tavily
- Detailed, well-structured research reports in Markdown format

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/deep-research-server.git
   cd deep-research-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the provided `.env.example`:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file and add your API keys:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   ```

## Usage

### Starting the Server

Start the server with:

```
npm start
```

For development with auto-reload:

```
npm run dev
```

The server will be available at `http://localhost:3000` (or the port specified in your `.env` file).

### API Endpoints

#### Perform Research

```
POST /api/research/query
```

Request body:

```json
{
  "query": "History of artificial intelligence",
  "language": "en-US",
  "provider": "google",
  "model": "gemini-1.5-pro",
  "searchProvider": "tavily",
  "maxIterations": 2,
  "reportStyle": "academic",
  "maxResults": 10
}
```

Response:

```json
{
  "report": "# History of Artificial Intelligence\n\n## Executive Summary\n\nThis report provides a comprehensive overview of the history of artificial intelligence (AI)...",
}
```

#### Generate Search Queries

```
POST /api/research/start
```

Request body:

```json
{
  "topic": "Quantum computing",
  "language": "en-US",
  "provider": "google",
  "model": "gemini-1.5-flash"
}
```

Response:

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
    },
    ...
  ]
}
```

#### Run Search Tasks

```
POST /api/research/search
```

Request body:

```json
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

Response:

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
        },
        ...
      ],
      "learnings": [
        "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously due to superposition",
        "Unlike classical bits that are either 0 or 1, qubits can be both 0 and 1 at the same time",
        ...
      ]
    }
  ]
}
```

#### Generate Final Report

```
POST /api/research/report
```

Request body:

```json
{
  "topic": "Quantum computing",
  "learnings": [
    "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously due to superposition",
    "Unlike classical bits that are either 0 or 1, qubits can be both 0 and 1 at the same time",
    ...
  ],
  "language": "en-US",
  "provider": "google",
  "model": "gemini-1.5-pro",
  "requirement": "Focus on practical applications and future potential"
}
```

Response:

```json
{
  "report": "# Quantum Computing: Principles, Applications, and Future Potential\n\n## Executive Summary\n\nThis report provides a comprehensive overview of quantum computing..."
}
```

## Configuration

The server can be configured by editing the files in the `src/settings` directory:

- `app.js`: General application settings
- `api.js`: API-specific settings
- `llm.js`: Language model settings
- `search.js`: Web search settings
- `prompts.js`: Prompt templates for different research types

## Environment Variables

- `PORT`: The port on which the server will run (default: 3000)
- `NODE_ENV`: The environment mode (development, production, test)
- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google Gemini API key
- `TAVILY_API_KEY`: Your Tavily API key
- `ACCESS_PASSWORD`: Optional password for securing the API
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## License

MIT
