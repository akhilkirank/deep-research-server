const express = require('express');
const router = express.Router();
const { z } = require('zod');

// Import research utilities
const {
  generateSearchQueries,
  runSearchTasks,
  reviewSearchResults,
  writeFinalReport,
  performDirectResearch,
  normalizeMarkdownNewlines
} = require('../utils/research');

// Validation schemas
const ResearchQuerySchema = z.object({
  query: z.string().min(1),
  language: z.string().default("en-US"),
  provider: z.string().default("google"),
  model: z.string().optional(),
  searchProvider: z.string().default("tavily"),
  // Handle both number and string representations of numbers
  maxIterations: z.union([
    z.number(),
    z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
  ]).default(2),
  reportStyle: z.string().optional(),
  // Handle both number and string representations of numbers
  temperature: z.union([
    z.number(),
    z.string().regex(/^\d+(\.\d+)?$/).transform(val => parseFloat(val))
  ]).optional(),
  // Handle both number and string representations of numbers
  maxResults: z.union([
    z.number(),
    z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
  ]).optional(),
  promptType: z.string().optional(),
  detailLevel: z.enum(['brief', 'standard', 'comprehensive']).default('standard'),
  requirement: z.string().optional()
});

/**
 * @route POST /api/research/query
 * @description Perform a complete research operation in a single request
 */
router.post('/query', async (req, res) => {
  try {
    // Check if the request body is valid
    if (!req.body || typeof req.body !== 'object') {
      console.error('Invalid request body format:', req.body);
      // Try to parse it if it's a string
      if (typeof req.body === 'string') {
        try {
          req.body = JSON.parse(req.body);
        } catch (parseError) {
          console.error('Failed to parse request body as JSON:', parseError);
        }
      }

      // If still not an object, create a minimal valid object
      if (!req.body || typeof req.body !== 'object') {
        req.body = { query: "General research topic" };
      }
    }

    // Try to preprocess numeric string values
    const preprocessedBody = { ...req.body };

    // Log the incoming request for debugging
    console.log('Received research query request:', JSON.stringify(preprocessedBody));

    // Validate request body
    const result = ResearchQuerySchema.safeParse(preprocessedBody);
    if (!result.success) {
      console.error('Validation errors:', result.error.errors);

      // Instead of returning a 400 error, try to fix common issues and proceed
      // This is a more forgiving approach for API clients
      const fixedBody = { ...preprocessedBody };

      // Convert string numbers to actual numbers for common fields
      if (typeof fixedBody.maxIterations === 'string') {
        fixedBody.maxIterations = parseInt(fixedBody.maxIterations, 10) || 2;
      }

      if (typeof fixedBody.temperature === 'string') {
        fixedBody.temperature = parseFloat(fixedBody.temperature) || 0.7;
      }

      if (typeof fixedBody.maxResults === 'string') {
        fixedBody.maxResults = parseInt(fixedBody.maxResults, 10) || 5;
      }

      // Try validation again with fixed values
      const fixedResult = ResearchQuerySchema.safeParse(fixedBody);
      if (!fixedResult.success) {
        // If still failing, log but continue with default values
        console.error('Still having validation errors after fixing:', fixedResult.error.errors);
        // We'll continue with the original body and let the research function handle defaults
      } else {
        // Use the fixed and validated data
        console.log('Fixed validation issues, proceeding with research');
        result.data = fixedResult.data;
        result.success = true;
      }
    }

    // Extract data from result if validation succeeded, or use defaults if it failed
    let query, language, provider, model, searchProvider, maxIterations, reportStyle,
        temperature, maxResults, promptType, detailLevel, requirement;

    if (result.success) {
      // Use validated data
      ({
        query,
        language,
        provider,
        model,
        searchProvider,
        maxIterations,
        reportStyle,
        temperature,
        maxResults,
        promptType,
        detailLevel,
        requirement
      } = result.data);
    } else {
      // Use raw data with some basic validation/defaults
      query = req.body.query || "";
      if (!query) {
        // Instead of returning an error, use a default query
        console.warn("No query provided, using default query");
        query = "General research topic";
      }

      language = req.body.language || "en-US";
      provider = req.body.provider || "google";
      model = req.body.model;
      searchProvider = req.body.searchProvider || "tavily";
      maxIterations = parseInt(req.body.maxIterations, 10) || 2;
      reportStyle = req.body.reportStyle;
      temperature = parseFloat(req.body.temperature) || undefined;
      maxResults = parseInt(req.body.maxResults, 10) || undefined;
      promptType = req.body.promptType;
      detailLevel = ['brief', 'standard', 'comprehensive'].includes(req.body.detailLevel)
        ? req.body.detailLevel
        : 'standard';
      requirement = req.body.requirement;
    }

    console.log(`Starting research on: "${query}"`);
    console.log(`Provider: ${provider}, Search Provider: ${searchProvider}`);
    console.log(`Prompt Type: ${promptType || 'default'}, Detail Level: ${detailLevel}`);

    // Options for the research
    const options = {
      reportStyle,
      temperature,
      maxResults,
      model,
      promptType,
      detailLevel,
      requirement
    };

    // Perform the research
    let report;
    try {
      report = await performDirectResearch(
        query,
        language,
        provider,
        model,
        searchProvider,
        maxIterations,
        options
      );
    } catch (researchError) {
      console.error("Error during research process, but continuing with basic report:", researchError);
      // Generate a basic report even if the research process fails
      const errorReport = `# Research Report on ${query}\n\n` +
              `## Error During Research\n\n` +
              `We encountered an error while researching this topic: ${researchError.message}\n\n` +
              `Please try again later or refine your query.`;

      report = normalizeMarkdownNewlines(errorReport);
    }

    // Return the report
    return res.json({ report });
  } catch (error) {
    console.error("Error in research/query API:", error);

    // Even in case of a catastrophic error, try to return a report instead of an error
    // This ensures the client always gets a response they can use
    const query = req.body.query || "your query";
    const errorReport = `# Research Report on ${query}\n\n` +
                  `## Error Processing Request\n\n` +
                  `We encountered an unexpected error while processing your request: ${error.message}\n\n` +
                  `Please try again later or contact support if the issue persists.`;

    const formattedReport = normalizeMarkdownNewlines(errorReport);
    return res.json({ report: formattedReport });
  }
});

/**
 * @route POST /api/research/start
 * @description Generate search queries for a topic
 */
router.post('/start', async (req, res) => {
  try {
    // Validate request body
    const StartSchema = z.object({
      topic: z.string().min(1),
      language: z.string().default("en-US"),
      provider: z.string().default("google"),
      model: z.string().optional(),
      promptType: z.string().optional(),
      detailLevel: z.enum(['brief', 'standard', 'comprehensive']).default('standard')
    });

    const result = StartSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        code: 400,
        message: "Invalid request body",
        errors: result.error.errors
      });
    }

    const { topic, language, provider, model, promptType, detailLevel } = result.data;

    // Generate search queries
    const queries = await generateSearchQueries(topic, language, provider, model, promptType, detailLevel);

    return res.json(queries);
  } catch (error) {
    console.error("Error in research/start API:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "An unknown error occurred"
    });
  }
});

/**
 * @route POST /api/research/search
 * @description Run search tasks for a set of queries
 */
router.post('/search', async (req, res) => {
  try {
    // Validate request body
    const SearchSchema = z.object({
      queries: z.array(z.object({
        query: z.string(),
        researchGoal: z.string()
      })),
      language: z.string().default("en-US"),
      provider: z.string().default("google"),
      model: z.string().optional(),
      enableSearch: z.union([
        z.boolean(),
        z.string().transform(val => val.toLowerCase() === 'true')
      ]).default(true),
      searchProvider: z.string().default("tavily"),
      parallelSearch: z.union([
        z.boolean(),
        z.string().transform(val => val.toLowerCase() === 'true')
      ]).default(false),
      searchMaxResult: z.union([
        z.number(),
        z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
      ]).default(5)
    });

    const result = SearchSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        code: 400,
        message: "Invalid request body",
        errors: result.error.errors
      });
    }

    const {
      queries,
      language,
      provider,
      model,
      enableSearch,
      searchProvider,
      parallelSearch,
      searchMaxResult
    } = result.data;

    // Run search tasks
    const searchResults = await runSearchTasks(
      queries,
      language,
      provider,
      model,
      enableSearch,
      searchProvider,
      parallelSearch,
      searchMaxResult
    );

    return res.json(searchResults);
  } catch (error) {
    console.error("Error in research/search API:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "An unknown error occurred"
    });
  }
});

/**
 * @route POST /api/research/review
 * @description Review search results and suggest further queries
 */
router.post('/review', async (req, res) => {
  try {
    // Validate request body
    const ReviewSchema = z.object({
      topic: z.string().min(1),
      learnings: z.array(z.string()),
      suggestion: z.string().default(""),
      language: z.string().default("en-US"),
      provider: z.string().default("google"),
      model: z.string().optional()
    });

    const result = ReviewSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        code: 400,
        message: "Invalid request body",
        errors: result.error.errors
      });
    }

    const { topic, learnings, suggestion, language, provider, model } = result.data;

    // Review search results
    const reviewResults = await reviewSearchResults(
      topic,
      learnings,
      suggestion,
      language,
      provider,
      model
    );

    return res.json(reviewResults);
  } catch (error) {
    console.error("Error in research/review API:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "An unknown error occurred"
    });
  }
});

/**
 * @route POST /api/research/report
 * @description Generate a final report from research learnings
 */
router.post('/report', async (req, res) => {
  try {
    // Validate request body
    const ReportSchema = z.object({
      topic: z.string().min(1),
      learnings: z.array(z.string()),
      language: z.string().default("en-US"),
      provider: z.string().default("google"),
      model: z.string().optional(),
      requirement: z.string().default(""),
      promptType: z.string().optional(),
      reportStyle: z.string().optional(),
      detailLevel: z.enum(['brief', 'standard', 'comprehensive']).default('standard')
    });

    const result = ReportSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        code: 400,
        message: "Invalid request body",
        errors: result.error.errors
      });
    }

    const { topic, learnings, language, provider, model, requirement, promptType, reportStyle, detailLevel } = result.data;

    // Generate final report
    const report = await writeFinalReport(
      topic,
      learnings,
      language,
      provider,
      model,
      requirement,
      promptType,
      reportStyle,
      detailLevel
    );

    // The report is already normalized by the writeFinalReport function
    return res.json({ report });
  } catch (error) {
    console.error("Error in research/report API:", error);

    // Create a basic error report with proper markdown formatting
    const topic = req.body?.topic || "the requested topic";
    const errorReport = `# Research Report on ${topic}\n\n` +
                       `## Error Generating Report\n\n` +
                       `We encountered an error while generating the report: ${error.message}\n\n` +
                       `Please try again later or contact support if the issue persists.`;

    const formattedReport = normalizeMarkdownNewlines(errorReport);

    // Return a formatted error report instead of an error status
    return res.json({
      report: formattedReport,
      error: error.message
    });
  }
});

module.exports = router;
