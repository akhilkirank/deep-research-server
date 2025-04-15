/**
 * Prompts Settings
 *
 * This file contains settings related to prompts used for different research tasks.
 */

// System Prompts
const systemPrompts = {
  // Default system prompt
  default: "You are a helpful research assistant. Your task is to help users research topics thoroughly and provide comprehensive information.",

  // Academic research system prompt
  academic: "You are an academic research assistant with expertise in scholarly research. Your task is to help users conduct thorough academic research, find relevant scholarly sources, and synthesize information into well-structured academic reports.",

  // Technical documentation system prompt
  technical: "You are a technical documentation specialist. Your task is to help users research technical topics, understand complex systems, and create clear, accurate technical documentation.",

  // News analysis system prompt
  news: "You are a news research assistant. Your task is to help users research current events, analyze news from multiple sources, and provide balanced, fact-based summaries of news topics.",

  // Product research system prompt
  product: "You are a product research specialist with expertise in analyzing and comparing products across various categories. Your task is to help users research products thoroughly, evaluate features, compare options, and provide data-driven recommendations based on user preferences and requirements. You should focus on objective analysis, highlighting pros and cons, and providing clear recommendations based on user-specified criteria."
};

// Report Style Prompts
const reportStylePrompts = {
  // Default report style
  default: "Structure the report with the following sections (and additional subsections as needed):\n1. Executive Summary\n2. Introduction\n3. Background\n4. Key Findings\n5. Analysis\n6. Implications\n7. Future Outlook\n8. Conclusion\n9. References",

  // Academic report style
  academic: "Structure the report as an academic paper with the following sections:\n1. Abstract\n2. Introduction\n3. Literature Review\n4. Methodology\n5. Results\n6. Discussion\n7. Conclusion\n8. References",

  // Technical documentation style
  technical: "Structure the documentation with the following sections:\n1. Overview\n2. Architecture\n3. Components\n4. Implementation Details\n5. API Reference\n6. Usage Examples\n7. Troubleshooting\n8. References",

  // News summary style
  news: "Structure the report with the following sections:\n1. Executive Summary\n2. Background\n3. Key Developments\n4. Stakeholder Perspectives\n5. Analysis\n6. Implications\n7. Future Developments\n8. Sources",

  // Product research style
  product: "Structure the product research report with the following sections:\n1. Introduction - Summarize the user's requirements and research goals\n2. Methodology - Brief overview of research sources and evaluation criteria\n3. Product Category Overview - General information about the product category and current market trends\n4. Detailed Product Analysis - For each recommended product:\n   - Key Specifications\n   - Pros and Cons\n   - Price Information\n   - Expert Opinions\n   - User Reviews Summary\n5. Comparative Analysis - Side-by-side comparison of top recommendations\n6. Final Recommendations - Personalized product recommendations based on user preferences\n7. Additional Considerations - Other factors to consider (upcoming releases, alternatives, etc.)\n8. Sources - References to data sources used in the research"
};

/**
 * Get the appropriate system prompt based on topic
 */
function getSystemPromptForTopic(topic) {
  const topicLower = topic.toLowerCase();

  if (topicLower.includes('research') ||
      topicLower.includes('study') ||
      topicLower.includes('paper') ||
      topicLower.includes('academic')) {
    return systemPrompts.academic;
  }

  if (topicLower.includes('code') ||
      topicLower.includes('programming') ||
      topicLower.includes('software') ||
      topicLower.includes('technical')) {
    return systemPrompts.technical;
  }

  if (topicLower.includes('news') ||
      topicLower.includes('current events') ||
      topicLower.includes('politics') ||
      topicLower.includes('recent developments')) {
    return systemPrompts.news;
  }

  return systemPrompts.default;
}

/**
 * Get the appropriate report style based on topic
 */
function getReportStyleForTopic(topic) {
  const topicLower = topic.toLowerCase();

  if (topicLower.includes('research') ||
      topicLower.includes('study') ||
      topicLower.includes('paper') ||
      topicLower.includes('academic')) {
    return reportStylePrompts.academic;
  }

  if (topicLower.includes('code') ||
      topicLower.includes('programming') ||
      topicLower.includes('software') ||
      topicLower.includes('technical')) {
    return reportStylePrompts.technical;
  }

  if (topicLower.includes('news') ||
      topicLower.includes('current events') ||
      topicLower.includes('politics') ||
      topicLower.includes('recent developments')) {
    return reportStylePrompts.news;
  }

  return reportStylePrompts.default;
}

// Detail Level Prompts
const detailLevelPrompts = {
  // Brief detail level
  brief: "Provide a concise overview with key points only. Focus on the most important information and keep explanations brief.",

  // Standard detail level (default)
  standard: "Provide a balanced level of detail with key information and supporting evidence. Include examples where helpful.",

  // Comprehensive detail level
  comprehensive: "Provide an extremely detailed and thorough analysis. Include extensive background information, multiple perspectives, detailed examples, and in-depth explanations of all relevant aspects."
};

/**
 * Get the appropriate detail level prompt
 */
function getDetailLevelPrompt(detailLevel = 'standard') {
  if (detailLevel && detailLevelPrompts[detailLevel]) {
    return detailLevelPrompts[detailLevel];
  }
  return detailLevelPrompts.standard;
}

/**
 * Get system prompt by name
 */
function getSystemPromptByName(promptName = 'default') {
  if (promptName && systemPrompts[promptName]) {
    return systemPrompts[promptName];
  }
  return systemPrompts.default;
}

/**
 * Get report style by name
 */
function getReportStyleByName(styleName = 'default') {
  if (styleName && reportStylePrompts[styleName]) {
    return reportStylePrompts[styleName];
  }
  return reportStylePrompts.default;
}

module.exports = {
  systemPrompts,
  reportStylePrompts,
  detailLevelPrompts,
  getSystemPromptForTopic,
  getReportStyleForTopic,
  getDetailLevelPrompt,
  getSystemPromptByName,
  getReportStyleByName
};
