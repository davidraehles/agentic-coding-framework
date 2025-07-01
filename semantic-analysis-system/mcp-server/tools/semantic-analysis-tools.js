/**
 * Core Semantic Analysis Tools
 * These are the actual tool implementations that connect to the agent system
 */

import { SemanticAnalysisClient } from '../clients/semantic-analysis-client.js';
import { Logger } from '../../shared/logger.js';

const logger = new Logger('semantic-tools');
let cachedClient = null;

/**
 * Get or create semantic analysis client
 */
async function getClient() {
  if (!cachedClient) {
    cachedClient = new SemanticAnalysisClient({
      rpcUrl: `http://localhost:${process.env.JSON_RPC_PORT || '8081'}`,
      mqttUrl: 'mqtt://localhost:1883',
      timeout: 30000
    });
    await cachedClient.connect();
  }
  return cachedClient;
}

/**
 * Determine insights from repository or conversation
 */
export async function determine_insights(params) {
  const client = await getClient();
  
  const result = await client.executeWorkflow('determine_insights', {
    repository: params.repository,
    conversationContext: params.conversationContext,
    depth: params.depth || 10,
    significanceThreshold: params.significanceThreshold || 7
  });

  return {
    content: [
      {
        type: 'text',
        text: result.insights || 'No insights found'
      }
    ]
  };
}

/**
 * Analyze repository for patterns and insights
 */
export async function analyze_repository(params) {
  const client = await getClient();
  
  const result = await client.executeWorkflow('repository_analysis', {
    repository: params.repository,
    depth: params.depth || 10,
    significanceThreshold: params.significanceThreshold || 7,
    includeFiles: params.includeFiles || false
  });

  return {
    content: [
      {
        type: 'text',
        text: result.analysis || 'No analysis results'
      }
    ]
  };
}

/**
 * Update knowledge base with insights
 */
export async function update_knowledge_base(params) {
  const client = await getClient();
  
  const result = await client.executeWorkflow('update_knowledge', {
    insights: params.insights,
    source: params.source || 'manual',
    priority: params.priority || 'normal'
  });

  return {
    content: [
      {
        type: 'text', 
        text: result.summary || 'Knowledge base updated'
      }
    ]
  };
}

/**
 * Extract lessons learned from conversations or code
 */
export async function lessons_learned(params) {
  const client = await getClient();
  
  const result = await client.executeWorkflow('lessons_learned', {
    source: params.source,
    context: params.context,
    timeframe: params.timeframe || '30d'
  });

  return {
    content: [
      {
        type: 'text',
        text: result.lessons || 'No lessons found'
      }
    ]
  };
}

/**
 * Search knowledge base
 */
export async function search_knowledge(params) {
  const client = await getClient();
  
  const result = await client.executeWorkflow('search_knowledge', {
    query: params.query,
    limit: params.limit || 10,
    threshold: params.threshold || 0.7
  });

  return {
    content: [
      {
        type: 'text',
        text: result.results || 'No results found'
      }
    ]
  };
}