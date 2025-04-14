const express = require('express');
const router = express.Router();
const { z } = require('zod');

// Import research utilities
const { 
  generateSearchQueries, 
  runSearchTasks, 
  reviewSearchResults, 
  writeFinalReport,
  performDirectResearch
} = require('../utils/research');

// Validation schemas
const ResearchQuerySchema = z.object({
  query: z.string().min(1),
  language: z.string().default("en-US"),
  provider: z.string().default("google"),
  model: z.string().optional(),
  searchProvider: z.string().default("tavily"),
  maxIterations: z.number().default(2),
  reportStyle: z.string().optional(),
  temperature: z.number().optional(),
  maxResults: z.number().optional()
});

/**
 * @route POST /api/research/query
 * @description Perform a complete research operation in a single request
 */
router.post('/query', async (req, res) => {
  try {
    // Validate request body
    const result = ResearchQuerySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        code: 400, 
        message: "Invalid request body", 
        errors: result.error.errors 
      });
    }

    const { 
      query, 
      language, 
      provider, 
      model, 
      searchProvider, 
      maxIterations,
      reportStyle,
      temperature,
      maxResults
    } = result.data;

    console.log(`Starting research on: "${query}"`);
    console.log(`Provider: ${provider}, Search Provider: ${searchProvider}`);

    // Options for the research
    const options = {
      reportStyle,
      temperature,
      maxResults,
      model
    };

    // Perform the research
    const report = await performDirectResearch(
      query, 
      language, 
      provider, 
      model, 
      searchProvider, 
      maxIterations,
      options
    );

    // Return the report
    return res.json({ report });
  } catch (error) {
    console.error("Error in research/query API:", error);
    return res.status(500).json({ 
      code: 500, 
      message: error.message || "An unknown error occurred" 
    });
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
      model: z.string().optional()
    });

    const result = StartSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        code: 400, 
        message: "Invalid request body", 
        errors: result.error.errors 
      });
    }
    
    const { topic, language, provider, model } = result.data;
    
    // Generate search queries
    const queries = await generateSearchQueries(topic, language, provider, model);
    
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
      enableSearch: z.boolean().default(true),
      searchProvider: z.string().default("tavily"),
      parallelSearch: z.boolean().default(false),
      searchMaxResult: z.number().default(5)
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
      requirement: z.string().default("")
    });

    const result = ReportSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        code: 400, 
        message: "Invalid request body", 
        errors: result.error.errors 
      });
    }
    
    const { topic, learnings, language, provider, model, requirement } = result.data;
    
    // Generate final report
    const report = await writeFinalReport(
      topic, 
      learnings, 
      language, 
      provider, 
      model,
      requirement
    );
    
    return res.json({ report });
  } catch (error) {
    console.error("Error in research/report API:", error);
    return res.status(500).json({ 
      code: 500, 
      message: error.message || "An unknown error occurred" 
    });
  }
});

module.exports = router;
