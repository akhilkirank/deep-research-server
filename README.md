# Deep Research Server

A standalone server for performing deep research using AI and web search. This server provides a simple API for generating comprehensive research reports on any topic.

## Features

- Single API endpoint for complete research operations
- Configurable settings for customizing research behavior
- Integration with multiple LLM providers (Google Gemini, Open Router)
- Web search functionality using Tavily
- Detailed, well-structured research reports in Markdown format
- Structured logging with different log levels
- Customizable prompt templates and report styles

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/deep-research-server.git
   cd deep-research-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the provided `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file and add your API keys:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

## Usage

### Starting the Server

Start the server with:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### Running Tests

The server includes a comprehensive test suite with a custom reporter for clean, focused output. To run the tests:

```bash
npm test
```

This command runs all the unit tests and also executes the simple test script to verify the enhanced logger functionality.

You can also use these npm scripts:

```bash
# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

The test output is designed to be clean and focused:

- Detailed information is shown only for failing tests
- Passing tests are summarized without excessive output
- A summary of test results is shown at the end

If a test fails, you'll see detailed information about what went wrong, including the expected and actual values.

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
  "maxResults": 10,
  "detailLevel": "comprehensive",
  "promptType": "academic"
}
```

Response:

```json
{
  "report": "# History of Artificial Intelligence\n\n## Executive Summary\n\nThis report provides a comprehensive overview of the history of artificial intelligence (AI)..."
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
  "model": "gemini-1.5-flash",
  "promptType": "technical",
  "detailLevel": "standard"
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

Response:

```json
{
  "report": "# Quantum Computing: Principles, Applications, and Future Potential\n\n## Executive Summary\n\nThis report provides a comprehensive overview of quantum computing..."
}
```

## Configuration

### Environment Variables

| Variable                       | Description                                          | Default                             |
| ------------------------------ | ---------------------------------------------------- | ----------------------------------- |
| `PORT`                         | The port on which the server will run                | 3000                                |
| `NODE_ENV`                     | The environment mode (development, production, test) | development                         |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google Gemini API key                           | -                                   |
| `TAVILY_API_KEY`               | Your Tavily API key                                  | -                                   |
| `OPENROUTER_API_KEY`           | Your Open Router API key                             | -                                   |
| `LOG_LEVEL`                    | Logging level (debug, info, warn, error)             | info                                |
| `DEFAULT_LLM_PROVIDER`         | Default LLM provider to use                          | google                              |
| `DEFAULT_SEARCH_PROVIDER`      | Default search provider to use                       | tavily                              |
| `USE_MOCK_MODE`                | Enable mock mode for testing without API tokens      | false                               |
| `DEFAULT_THINKING_MODEL`       | Default model for thinking tasks                     | gemini-2.0-flash-thinking-exp-01-21 |
| `DEFAULT_NETWORKING_MODEL`     | Default model for networking tasks                   | gemini-2.0-flash-001                |
| `DEFAULT_OPENROUTER_MODEL`     | Default Open Router model                            | anthropic/claude-3-opus:beta        |

### Configuration Files

The server can be configured by editing the files in the `src/settings` directory:

- `app.js`: General application settings
- `api.js`: API-specific settings
- `llm.js`: Language model settings
- `search.js`: Web search settings
- `prompts.js`: Prompt templates for different research types

## LLM Providers

### Google Gemini

The server uses Google's Gemini models by default. You need to provide a valid Google API key in the `.env` file.

Available models:

- `gemini-2.0-flash-thinking-exp-01-21` (default for thinking tasks)
- `gemini-2.0-flash-001` (default for networking tasks)
- `gemini-1.5-pro`
- `gemini-1.5-flash`

### Open Router

Open Router provides access to various LLM models through a single API. You need to provide a valid Open Router API key in the `.env` file.

Available models:

- `anthropic/claude-3-opus:beta` (default)
- `anthropic/claude-3-sonnet:beta`
- `anthropic/claude-3-haiku:beta`
- `openai/gpt-4-turbo`
- `openai/gpt-4o`
- `openai/gpt-3.5-turbo`
- `meta-llama/llama-3-70b-instruct`
- `meta-llama/llama-3-8b-instruct`

### Mock Provider

The server includes a mock mode for testing without using real API tokens. This is useful for development and testing purposes.

To enable mock mode, set `USE_MOCK_MODE=true` in your `.env` file. When mock mode is enabled, **both** LLM providers and search providers will automatically use mock implementations, regardless of what providers are specified in API requests.

The mock implementations simulate responses with predefined content for different types of requests:

- Search query generation
- Search result processing
- Report writing
- Web search results

This ensures you can test the entire application flow without using any real API tokens.

You can test the mock mode by running:

```bash
node test-mock-mode.js
```

## Customization Options

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

## Logging

The server uses an enhanced structured logging system with categories, sensitive data redaction, and multiple output formats:

### Log Levels

- `debug`: Detailed debugging information (lowest level)
- `info`: General information about the application's operation
- `warn`: Warning messages that don't affect the application's operation
- `error`: Error messages that affect the application's operation
- `critical`: Critical errors that require immediate attention (highest level)

### Log Categories

Logs are organized into categories for better filtering and understanding:

- `api`: API calls (incoming/outgoing)
- `server`: Server operations
- `db`: Database operations
- `auth`: Authentication/authorization
- `research`: Research operations
- `system`: System operations
- `test`: Test operations

### Configuration

You can configure logging in the `.env` file:

```
# Set the minimum log level to display (debug, info, warn, error, critical)
LOG_LEVEL=info

# Set the log format (pretty or json)
LOG_FORMAT=pretty
```

### Security

The logging system automatically redacts sensitive information like API keys, passwords, and tokens to prevent accidental exposure in logs.

## License

MIT
