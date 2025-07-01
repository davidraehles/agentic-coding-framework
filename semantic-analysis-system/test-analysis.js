#!/usr/bin/env node

/**
 * Quick test of the semantic analysis system
 */

import { SemanticAnalysisAgent } from './agents/semantic-analysis/index.js';
import { portManager } from './shared/port-manager.js';
import { Logger } from './shared/logger.js';

const logger = new Logger('test-analysis');

async function testRepositoryAnalysis() {
  try {
    logger.info('Starting repository analysis test...');
    
    // Initialize port manager
    await portManager.initialize();
    
    // Create semantic analysis agent
    const agent = new SemanticAnalysisAgent({
      llm: { primary: 'claude', fallback: 'openai' }
    });
    
    await agent.initialize();
    
    // Analyze the current repository
    const result = await agent.analyzeRepository({
      repository: '/Users/q284340/Agentic/coding/semantic-analysis-system',
      depth: 10,
      significanceThreshold: 7
    });
    
    logger.info('Analysis completed successfully!');
    console.log(JSON.stringify(result, null, 2));
    
    // Update knowledge base
    if (result.insights && result.insights.length > 0) {
      logger.info(`Found ${result.insights.length} insights, updating knowledge base...`);
      
      // Use UKB to capture insights
      for (const insight of result.insights.slice(0, 3)) { // Limit to first 3
        console.log(`\n📝 Insight: ${insight.name}`);
        console.log(`📊 Significance: ${insight.significance}/10`);
        console.log(`💡 Description: ${insight.description}`);
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Analysis failed:', error);
    process.exit(1);
  }
}

testRepositoryAnalysis();