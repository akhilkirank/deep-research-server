const { z } = require('zod');
const { shuffle } = require('radash');
// Using dynamic import for ES Modules
let pLimit;
let zodToJsonSchema;

// Import the Google Generative AI library
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import web search functionality
const { performSearch } = require('./web-search');

// Import settings
const settings = require('../settings');

/**
 * Get the system prompt for the LLM
 */
function getSystemPrompt(promptType = 'default') {
  return settings.prompts.getSystemPromptByName(promptType);
}

/**
 * Get the output guidelines prompt
 */
function getOutputGuidelinesPrompt(detailLevel = 'standard') {
  return settings.prompts.getDetailLevelPrompt(detailLevel);
}

/**
 * Get language-specific prompt
 */
function getResponseLanguagePrompt(language = "en-US") {
  if (language === "en-US") return "Please respond in English.";
  return `Please respond in ${language}.`;
}

/**
 * Get the SERP query schema
 */
function getSERPQuerySchema() {
  return z.array(
    z.object({
      query: z.string(),
      researchGoal: z.string(),
    })
  );
}

/**
 * Generate a prompt for SERP queries
 */
async function generateSerpQueriesPrompt(query) {
  // Dynamically import zod-to-json-schema (ES Module)
  if (!zodToJsonSchema) {
    const zodToJsonSchemaModule = await import('zod-to-json-schema');
    zodToJsonSchema = zodToJsonSchemaModule.zodToJsonSchema;
  }

  const SERPQuerySchema = getSERPQuerySchema();
  const outputSchema = JSON.stringify(
    zodToJsonSchema(SERPQuerySchema),
    null,
    4
  );

  // Example of properly formatted JSON output
  const exampleOutput = JSON.stringify([
    {
      query: "Latest developments in artificial intelligence",
      researchGoal: "Find recent breakthroughs and advancements in AI technology"
    },
    {
      query: "History of artificial intelligence",
      researchGoal: "Understand the historical context and evolution of AI"
    }
  ], null, 2);

  return [
    `Given the following query from the user:\n<query>${query}</query>`,
    `Based on previous user query, generate a list of SERP queries to further research the topic. Make sure each query is unique and not similar to each other.`,
    `IMPORTANT: You MUST respond with ONLY valid JSON array. Do not include any explanations, markdown formatting, or backticks in your response.`,
    `The JSON must match this schema:\n${outputSchema}`,
    `Here is an example of the exact format expected:\n${exampleOutput}`,
    `Remember: Your entire response must be a valid JSON array that can be parsed directly. Do not include any text before or after the JSON.`
  ].join("\n\n");
}

/**
 * Generate a prompt for processing search results
 */
function processResultPrompt(query, researchGoal, results = []) {
  const contents = results.map(
    (result) => `<content url="${result.url}">\n${result.content}\n</content>`
  );
  return [
    `Given the following contents from a SERP search for the query:\n<query>${query}</query>.`,
    `You need to organize the searched information according to the following requirements:\n<researchGoal>\n${researchGoal}\n</researchGoal>`,
    contents.length > 0 ? `<contents>${contents.join("\n")}</contents>` : "",
    `You need to think like a human researcher. Generate a list of learnings from the contents. Make sure each learning is unique and not similar to each other. The learnings should be to the point, as detailed and information dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any specific entities, metrics, numbers, and dates when available. The learnings will be used to research the topic further.`,
  ].join("\n\n");
}

/**
 * Generate a prompt for reviewing search results
 */
async function reviewSerpQueriesPrompt(query, learnings, suggestion = "") {
  // Dynamically import zod-to-json-schema (ES Module)
  if (!zodToJsonSchema) {
    const zodToJsonSchemaModule = await import('zod-to-json-schema');
    zodToJsonSchema = zodToJsonSchemaModule.zodToJsonSchema;
  }

  const SERPQuerySchema = getSERPQuerySchema();
  const outputSchema = JSON.stringify(
    zodToJsonSchema(SERPQuerySchema),
    null,
    4
  );

  // Example of properly formatted JSON output
  const exampleOutput = JSON.stringify([
    {
      query: "Economic impact of renewable energy adoption",
      researchGoal: "Analyze how renewable energy affects job markets and economic growth"
    },
    {
      query: "Challenges in renewable energy implementation",
      researchGoal: "Identify technical and policy barriers to renewable energy adoption"
    }
  ], null, 2);

  const learningsString = learnings
    .map((learning) => `<learning>\n${learning}\n</learning>`)
    .join("\n");

  return [
    `Given the following query from the user:\n<query>${query}</query>`,
    `Here are all the learnings from previous research:\n<learnings>\n${learningsString}\n</learnings>`,
    suggestion !== ""
      ? `This is the user's suggestion for research direction:\n<suggestion>\n${suggestion}\n</suggestion>`
      : "",
    `Based on previous research${
      suggestion !== "" ? ` and user research suggestions` : ""
    }, determine whether further research is needed. If further research is needed, list of follow-up SERP queries to research the topic further. Make sure each query is unique and not similar to each other. If you believe no further research is needed, you can output an empty array: [].`,
    `IMPORTANT: You MUST respond with ONLY valid JSON array. Do not include any explanations, markdown formatting, or backticks in your response.`,
    `The JSON must match this schema:\n${outputSchema}`,
    `Here is an example of the exact format expected:\n${exampleOutput}`,
    `Remember: Your entire response must be a valid JSON array that can be parsed directly. Do not include any text before or after the JSON.`
  ].join("\n\n");
}

/**
 * Generate a prompt for writing the final report
 */
function writeFinalReportPrompt(query, learnings, requirement = "", reportStyle = "", detailLevel = 'standard') {
  const learningsString = learnings
    .map((learning) => `<learning>\n${learning}\n</learning>`)
    .join("\n");

  // Get the appropriate report style
  let reportStructure = "";
  if (reportStyle && reportStyle !== "") {
    reportStructure = settings.prompts.getReportStyleByName(reportStyle);
  } else {
    reportStructure = `Structure the report with the following sections (and additional subsections as needed):
1. Executive Summary - A concise overview of the entire report (250-300 words)
2. Introduction - Context, importance, and scope of the topic
3. Background - Historical context and development of the topic
4. Methodology - How the research was conducted (optional if not applicable)
5. Key Findings - The main body of the report with multiple subsections covering different aspects
6. Analysis - Critical examination of the findings with data-driven insights
7. Implications - What the findings mean for stakeholders, industry, or society
8. Future Outlook - Trends, predictions, and potential developments
9. Conclusion - Summary of key points and final thoughts
10. References - Sources of information (if applicable)`;
  }

  // Get the detail level prompt
  const detailLevelPrompt = settings.prompts.getDetailLevelPrompt(detailLevel);

  return [
    `Given the following query from the user, write a final report on the topic using the learnings from research. ${detailLevelPrompt} Incorporate ALL the learnings from research:\n<query>${query}</query>`,
    `Here are all the learnings from previous research:\n<learnings>\n${learningsString}\n</learnings>`,
    requirement !== ""
      ? `Please write according to the user's writing requirements:\n<requirement>${requirement}</requirement>`
      : "",
    reportStructure,
    `Ensure the report is:
- Logically structured with clear transitions between sections
- Evidence-based with specific facts, figures, and examples
- Balanced in presenting different perspectives
- Written in a professional tone
- Properly formatted using markdown syntax for readability`,
    `You need to write this report like a human researcher. Humans do not wrap their writing in markdown blocks. Include diverse data information such as tables, katex formulas, mermaid diagrams, etc. in the form of markdown syntax. **DO NOT** output anything other than the report.`,
  ].join("\n\n");
}

/**
 * Remove JSON markdown from a string
 */
function removeJsonMarkdown(text) {
  return text
    .replace(/^```json\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
}

/**
 * Safely parse JSON from LLM response with enhanced error handling
 * @param {string} text - The text to parse as JSON
 * @param {string} source - Source identifier for logging
 * @param {any} defaultValue - Default value to return if parsing fails
 * @returns {any} Parsed JSON or default value
 */
function safeJsonParse(text, source = 'unknown', defaultValue = []) {
  // First, try to clean the text to handle common issues
  let cleanedText = text;

  // Remove any markdown formatting
  cleanedText = removeJsonMarkdown(cleanedText);

  // Remove any text before the first '[' or '{' character
  const firstJsonChar = Math.min(
    cleanedText.indexOf('[') >= 0 ? cleanedText.indexOf('[') : Infinity,
    cleanedText.indexOf('{') >= 0 ? cleanedText.indexOf('{') : Infinity
  );

  if (firstJsonChar !== Infinity) {
    cleanedText = cleanedText.substring(firstJsonChar);
  }

  // Remove any text after the last ']' or '}' character
  const lastJsonChar = Math.max(
    cleanedText.lastIndexOf(']'),
    cleanedText.lastIndexOf('}')
  );

  if (lastJsonChar !== -1) {
    cleanedText = cleanedText.substring(0, lastJsonChar + 1);
  }

  // Try to parse the cleaned text
  try {
    return JSON.parse(cleanedText);
  } catch (err) {
    // If that fails, try more aggressive cleaning
    try {
      // Replace single quotes with double quotes
      const withDoubleQuotes = cleanedText.replace(/'/g, '"');
      return JSON.parse(withDoubleQuotes);
    } catch (err2) {
      try {
        // Try to fix unquoted property names
        const withQuotedProps = cleanedText.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
        return JSON.parse(withQuotedProps);
      } catch (err3) {
        // Log detailed error information
        console.error(`JSON parsing error in ${source}:`, err3);
        console.error('Original text:', text);
        console.error('Cleaned text:', cleanedText);

        // Return the default value
        return defaultValue;
      }
    }
  }
}

/**
 * Get the appropriate model based on provider and requested model
 */
function getModel(provider = "google", requestedModel) {
  const llmSettings = settings.llm;

  // Default models
  let thinkingModel = "gemini-1.5-flash";
  let networkingModel = "gemini-1.5-pro";

  // Override with requested model if provided
  if (requestedModel) {
    thinkingModel = requestedModel;
    networkingModel = requestedModel;
  } else if (provider === "google") {
    thinkingModel = llmSettings.googleSettings.thinkingModel;
    networkingModel = llmSettings.googleSettings.networkingModel;
  }

  return { thinkingModel, networkingModel };
}

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a provider instance based on the specified provider
 */
function createProvider(provider = "google", model, options = {}, apiKey) {
  if (provider === "google") {
    const genAI = new GoogleGenerativeAI(apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    return genAI.getGenerativeModel({ model: model || "gemini-1.5-pro", ...options });
  }

  // Default to Google if provider not supported
  const genAI = new GoogleGenerativeAI(apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  return genAI.getGenerativeModel({ model: model || "gemini-1.5-pro", ...options });
}

/**
 * Execute a function with retry logic for handling rate limits
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Options for retry behavior
 * @returns {Promise<any>} - Result of the function
 */
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    retryableStatusCodes = [429, 500, 503],
    fallbackModel = "gemini-1.5-flash",
    context = {}
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If this isn't the first attempt and we have a fallback model, use it
      if (attempt > 0 && context.model && fallbackModel) {
        console.log(`Attempt ${attempt}: Using fallback model ${fallbackModel} instead of ${context.model}`);
        context.model = fallbackModel;
      }

      return await fn(context);
    } catch (error) {
      lastError = error;

      // Check if this is a retryable error
      const isRateLimitError = error.status && retryableStatusCodes.includes(error.status);

      // If we've hit max retries or it's not a retryable error, throw
      if (attempt >= maxRetries || !isRateLimitError) {
        throw error;
      }

      // Get retry delay from error response if available
      let retryDelay = delay;
      if (error.errorDetails) {
        const retryInfo = error.errorDetails.find(detail =>
          detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        );

        if (retryInfo && retryInfo.retryDelay) {
          // Parse retry delay (format: "5s", "10s", etc.)
          const seconds = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
          if (!isNaN(seconds)) {
            retryDelay = seconds * 1000;
          }
        }
      }

      // Cap the delay at maxDelay
      retryDelay = Math.min(retryDelay, maxDelay);

      console.log(`Rate limit hit. Retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(retryDelay);

      // Exponential backoff for next attempt
      delay = Math.min(delay * factor, maxDelay);
    }
  }

  // If we get here, we've exhausted all retries
  throw lastError;
}

/**
 * Generate search queries for a topic
 */
async function generateSearchQueries(
  topic,
  language = "en-US",
  provider = "google",
  requestedModel,
  promptType = 'default',
  detailLevel = 'standard'
) {
  const { thinkingModel } = getModel(provider, requestedModel);

  try {
    // Default queries to use as fallback
    const defaultQueries = [
      {
        query: "Latest research on " + topic,
        researchGoal: "Find the most recent studies and papers on " + topic,
      },
      {
        query: "History of " + topic,
        researchGoal: "Understand the historical context and evolution of " + topic,
      },
      {
        query: "Future trends in " + topic,
        researchGoal: "Identify emerging trends and future directions for " + topic,
      },
    ];

    // Use retry mechanism with fallback to a different model if rate limited
    const result = await withRetry(async (context) => {
      // Use the model from context if available (for fallback), otherwise use the original model
      const modelToUse = context.model || thinkingModel;
      const model = createProvider(provider, modelToUse);

      // Set the system prompt based on the prompt type
      const systemPrompt = getSystemPrompt(promptType);

      // Generate the prompt (now async)
      const prompt = await generateSerpQueriesPrompt(topic);

      const response = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + prompt + "\n\n" + getOutputGuidelinesPrompt(detailLevel) + "\n\n" + getResponseLanguagePrompt(language) }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      });

      const content = response.response.text();

      // Use the robust JSON parser with detailed source information
      return safeJsonParse(content, 'generateSearchQueries', defaultQueries);
    }, {
      maxRetries: 3,
      fallbackModel: "gemini-1.5-flash", // Fallback to a smaller model if rate limited
      context: { model: thinkingModel } // Pass the original model for context
    });

    return { queries: result };
  } catch (error) {
    console.error("Error generating search queries:", error);
    // Return default queries instead of throwing
    return {
      queries: [
        {
          query: "Latest research on " + topic,
          researchGoal: "Find the most recent studies and papers on " + topic,
        },
        {
          query: "History of " + topic,
          researchGoal: "Understand the historical context and evolution of " + topic,
        },
        {
          query: "Future trends in " + topic,
          researchGoal: "Identify emerging trends and future directions for " + topic,
        },
      ],
      error: error.message
    };
  }
}

/**
 * Run search tasks for a set of queries
 */
async function runSearchTasks(
  queries,
  language = "en-US",
  provider = "google",
  requestedModel,
  enableSearch = true,
  searchProvider = "tavily",
  parallelSearch = false,
  searchMaxResult = 5
) {
  const { networkingModel } = getModel(provider, requestedModel);
  const results = [];

  try {
    // Dynamically import p-limit (ES Module)
    if (!pLimit) {
      try {
        const pLimitModule = await import('p-limit');
        pLimit = pLimitModule.default;
      } catch (err) {
        console.error("Error importing p-limit:", err);
        // Fallback to sequential processing if import fails
        pLimit = (concurrency) => {
          return (fn) => fn;
        };
      }
    }

    // Create a limit for parallel processing
    const limit = pLimit(parallelSearch ? 3 : 1);

    // Ensure queries is an array
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      console.warn("No valid queries provided to runSearchTasks");
      return { results: [] };
    }

    // Process each query
    const tasks = queries.map(query => limit(async () => {
      // Skip invalid queries
      if (!query || !query.query) {
        console.warn("Skipping invalid query in runSearchTasks");
        return null;
      }

      let sources = [];

      // Perform web search if enabled
      if (enableSearch && searchProvider !== "model") {
        try {
          sources = await performSearch(
            query.query,
            searchProvider,
            searchMaxResult
          );
        } catch (err) {
          console.error(`Search error with ${searchProvider}:`, err);
          // Continue with empty sources if search fails
        }
      }

      // Process the search results using retry mechanism
      let content;
      try {
        content = await withRetry(async (context) => {
          // Use the model from context if available (for fallback), otherwise use the original model
          const modelToUse = context.model || networkingModel;
          const model = createProvider(provider, modelToUse);

          const response = await model.generateContent({
            contents: [{
              role: "user",
              parts: [{
                text: processResultPrompt(query.query, query.researchGoal, sources) + "\n\n" + getResponseLanguagePrompt(language)
              }]
            }],
            generationConfig: {
              temperature: 0.2,
              // Reduce token count for fallback models
              maxOutputTokens: context.model !== networkingModel ? 2048 : 4096,
            },
          });

          return response.response.text();
        }, {
          maxRetries: 2, // Fewer retries for search tasks since we have multiple
          fallbackModel: "gemini-1.5-flash", // Fallback to a smaller model if rate limited
          context: { model: networkingModel } // Pass the original model for context
        });
      } catch (error) {
        console.error(`Error processing search results for query "${query.query}":`, error);
        // Return a basic response if we hit an error
        content = `Unable to process search results due to API limits. Basic information about ${query.query} would typically include key facts and data points relevant to the topic.`;
      }

      // Parse the learnings from the content
      const learnings = content
        .split("\n")
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[0-9]+\.\s*/, "").trim());

      const result = {
        query: query.query,
        researchGoal: query.researchGoal || "",
        sources,
        learnings
      };

      results.push(result);
      return result;
    }));

    try {
      // Wait for all tasks to complete, but handle individual task failures
      const taskResults = await Promise.allSettled(tasks);

      // Log any rejected tasks
      taskResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Task for query "${queries[index]?.query || 'unknown'}" failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error("Error waiting for search tasks to complete:", error);
      // Continue with whatever results we have
    }

    return { results };
  } catch (error) {
    console.error("Error running search tasks:", error);
    // Return empty results instead of throwing
    return { results: [] };
  }
}

/**
 * Review search results and suggest further queries
 */
async function reviewSearchResults(
  topic,
  learnings,
  suggestion = "",
  language = "en-US",
  provider = "google",
  requestedModel
) {
  const { thinkingModel } = getModel(provider, requestedModel);

  try {
    // Use retry mechanism with fallback to a different model if rate limited
    const queries = await withRetry(async (context) => {
      // Use the model from context if available (for fallback), otherwise use the original model
      const modelToUse = context.model || thinkingModel;
      const model = createProvider(provider, modelToUse);

      // Generate the prompt (now async)
      const prompt = await reviewSerpQueriesPrompt(topic, learnings, suggestion);

      const response = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: prompt + "\n\n" + getResponseLanguagePrompt(language)
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      });

      const content = response.response.text();

      // Use the robust JSON parser with detailed source information
      // Empty array as default if parsing fails
      return safeJsonParse(content, 'reviewSearchResults', []);
    }, {
      maxRetries: 3,
      fallbackModel: "gemini-1.5-flash", // Fallback to a smaller model if rate limited
      context: { model: thinkingModel } // Pass the original model for context
    });

    return { queries };
  } catch (error) {
    console.error("Error reviewing search results:", error);
    // Return empty array instead of throwing
    return { queries: [], error: error.message };
  }
}

/**
 * Write a final report based on research learnings
 */
async function writeFinalReport(
  topic,
  learnings,
  language = "en-US",
  provider = "google",
  requestedModel,
  requirement = "",
  promptType = 'default',
  reportStyle = '',
  detailLevel = 'standard'
) {
  const { networkingModel } = getModel(provider, requestedModel);

  try {
    // Use retry mechanism with fallback to a different model if rate limited
    const report = await withRetry(async (context) => {
      // Use the model from context if available (for fallback), otherwise use the original model
      const modelToUse = context.model || networkingModel;
      const model = createProvider(provider, modelToUse);

      // Set the system prompt based on the prompt type
      const systemPrompt = getSystemPrompt(promptType);

      const response = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + writeFinalReportPrompt(topic, learnings, requirement, reportStyle, detailLevel) + "\n\n" + getResponseLanguagePrompt(language) }]
          }
        ],
        generationConfig: {
          // Lower temperature for fallback models to ensure more reliable output
          temperature: context.model !== networkingModel ? 0.5 : 0.7,
          // Reduce token count for fallback models to avoid rate limits
          maxOutputTokens: context.model !== networkingModel ? 16384 : 32768,
        },
      });

      return response.response.text();
    }, {
      maxRetries: 3,
      fallbackModel: "gemini-1.5-flash", // Fallback to a smaller model if rate limited
      context: { model: networkingModel } // Pass the original model for context
    });

    return { report };
  } catch (error) {
    console.error("Error writing final report:", error);
    // Return a basic report instead of throwing
    return {
      report: `# Research Report on ${topic}\n\n` +
              `## Error Generating Full Report\n\n` +
              `We encountered an error while generating the full report: ${error.message}\n\n` +
              `## Key Learnings\n\n` +
              learnings.map((learning, index) => `${index + 1}. ${learning}`).join('\n\n'),
      error: error.message
    };
  }
}

/**
 * Perform a direct research operation in a single function
 */
async function performDirectResearch(
  query,
  language = "en-US",
  provider = "google",
  model,
  searchProvider = "tavily",
  maxIterations = 2,
  options = {}
) {
  // Extract options with defaults
  const promptType = options.promptType || 'default';
  const reportStyle = options.reportStyle || '';
  const detailLevel = options.detailLevel || 'standard';
  try {
    console.log(`Starting direct research on: "${query}"`);

    // Step 1: Generate initial search queries
    console.log("Step 1: Generating search queries...");
    let queries = [];
    try {
      const result = await generateSearchQueries(query, language, provider, model, promptType, detailLevel);
      queries = result.queries;
    } catch (error) {
      console.error("Error generating search queries:", error);
      // Use default queries if there's an error
      queries = [
        {
          query: "Latest research on " + query,
          researchGoal: "Find the most recent studies and papers on " + query,
        },
        {
          query: "History of " + query,
          researchGoal: "Understand the historical context and evolution of " + query,
        },
        {
          query: "Future trends in " + query,
          researchGoal: "Identify emerging trends and future directions for " + query,
        },
      ];
    }

    // Step 2: Run search tasks
    console.log("Step 2: Running search tasks...");
    let results = [];
    try {
      const searchResults = await runSearchTasks(
        queries,
        language,
        provider,
        model,
        true,
        searchProvider,
        false,
        options.maxResults || 5
      );
      results = searchResults.results || [];
    } catch (error) {
      console.error("Error running search tasks:", error);
      // Continue with empty results if there's an error
    }

    // Collect all learnings
    let allLearnings = [];
    results.forEach(result => {
      if (result && result.learnings && Array.isArray(result.learnings)) {
        allLearnings = [...allLearnings, ...result.learnings];
      }
    });

    // If we have no learnings at this point, add a basic one to avoid empty reports
    if (allLearnings.length === 0) {
      allLearnings.push(`Basic information about ${query} would typically include key facts and data points relevant to the topic.`);
    }

    // Step 3: Perform additional iterations if needed
    let currentIteration = 1;
    while (currentIteration < maxIterations) {
      console.log(`Step ${currentIteration + 2}: Reviewing results and generating additional queries...`);

      // Review results and get additional queries
      let additionalQueries = [];
      try {
        const reviewResult = await reviewSearchResults(
          query,
          allLearnings,
          "",
          language,
          provider,
          model
        );
        additionalQueries = reviewResult.queries || [];
      } catch (error) {
        console.error("Error reviewing search results:", error);
        // Continue with empty additional queries if there's an error
        break;
      }

      // If no additional queries are suggested, break the loop
      if (!additionalQueries || additionalQueries.length === 0) {
        console.log("No additional queries suggested. Moving to final report.");
        break;
      }

      console.log(`Step ${currentIteration + 3}: Running additional search tasks...`);

      // Run search tasks for additional queries
      try {
        const additionalSearchResults = await runSearchTasks(
          additionalQueries,
          language,
          provider,
          model,
          true,
          searchProvider,
          false,
          options.maxResults || 5
        );

        // Add new learnings to the collection
        if (additionalSearchResults && additionalSearchResults.results) {
          additionalSearchResults.results.forEach(result => {
            if (result && result.learnings && Array.isArray(result.learnings)) {
              allLearnings = [...allLearnings, ...result.learnings];
            }
          });
        }
      } catch (error) {
        console.error(`Error running additional search tasks in iteration ${currentIteration}:`, error);
        // Continue to the next step even if there's an error
      }

      currentIteration++;
    }

    // Step 4: Generate final report
    console.log("Final Step: Generating comprehensive report...");
    try {
      const reportResult = await writeFinalReport(
        query,
        allLearnings,
        language,
        provider,
        model,
        options.requirement || "",
        promptType,
        reportStyle,
        detailLevel
      );
      return reportResult.report;
    } catch (error) {
      console.error("Error writing final report:", error);
      // Return a basic report if there's an error
      return `# Research Report on ${query}\n\n` +
             `## Error Generating Full Report\n\n` +
             `We encountered an error while generating the full report: ${error.message}\n\n` +
             `## Key Learnings\n\n` +
             allLearnings.map((learning, index) => `${index + 1}. ${learning}`).join('\n\n');
    }
  } catch (error) {
    console.error("Error in direct research:", error);
    // Return a basic report even if the entire process fails
    return `# Research Report on ${query}\n\n` +
           `## Error Generating Report\n\n` +
           `We encountered an error while researching this topic: ${error.message}\n\n` +
           `Please try again later or refine your query.`;
  }
}

module.exports = {
  getSystemPrompt,
  getOutputGuidelinesPrompt,
  getResponseLanguagePrompt,
  getSERPQuerySchema,
  generateSerpQueriesPrompt,
  processResultPrompt,
  reviewSerpQueriesPrompt,
  writeFinalReportPrompt,
  removeJsonMarkdown,
  safeJsonParse,
  sleep,
  withRetry,
  getModel,
  createProvider,
  generateSearchQueries,
  runSearchTasks,
  reviewSearchResults,
  writeFinalReport,
  performDirectResearch
};
