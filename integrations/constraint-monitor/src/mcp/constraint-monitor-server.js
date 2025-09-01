import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { UniversalAgentMonitor } from '../capture/universal-monitor.js';
import { EventProcessor } from '../capture/event-processor.js';
import { LiveGuideRails } from '../intervention/live-guide-rails.js';
import { QdrantDatabase } from '../database/qdrant-client.js';
import { DuckDBAnalytics } from '../database/duckdb-client.js';
import { logger } from '../utils/logger.js';

/**
 * MCP Server for Constraint Monitor
 * 
 * Exposes constraint monitoring functionality as MCP tools for Claude Code
 */
export class ConstraintMonitorServer {
  constructor() {
    this.server = new Server(
      {
        name: 'constraint-monitor',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize components
    this.monitor = null;
    this.processor = null;
    this.guideRails = null;
    this.qdrant = null;
    this.duckdb = null;
    this.initialized = false;

    this.setupToolHandlers();
    this.setupErrorHandlers();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize databases
      this.qdrant = new QdrantDatabase();
      await this.qdrant.initialize();
      
      this.duckdb = new DuckDBAnalytics();
      await this.duckdb.initialize();

      // Initialize monitoring components
      this.monitor = new UniversalAgentMonitor();
      this.processor = new EventProcessor();
      this.guideRails = new LiveGuideRails();

      // Connect components
      this.monitor.on('event', async (event) => {
        await this.processor.processEvent(event);
      });

      this.processor.on('analysisComplete', async (result) => {
        await this.handleAnalysisResult(result);
      });

      this.processor.on('violationsDetected', async (data) => {
        await this.handleViolations(data);
      });

      // Start monitoring
      await this.monitor.start();
      await this.processor.start();

      this.initialized = true;
      logger.info('Constraint Monitor MCP Server initialized');
    } catch (error) {
      logger.error('Failed to initialize MCP server:', error);
      throw error;
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_constraint_status',
          description: 'Get current constraint monitoring status and metrics',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: {
                type: 'string',
                description: 'Optional session ID to get specific session metrics'
              }
            }
          }
        },
        {
          name: 'search_similar_violations',
          description: 'Search for similar constraint violations and their resolutions',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Description of the constraint violation or pattern to search for'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 5)'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'add_constraint_rule',
          description: 'Add a new constraint rule to the monitoring system',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the constraint'
              },
              type: {
                type: 'string',
                enum: ['pattern', 'anti-pattern', 'semantic', 'workflow'],
                description: 'Type of constraint rule'
              },
              severity: {
                type: 'string',
                enum: ['info', 'warning', 'error', 'critical'],
                description: 'Severity level of the constraint'
              },
              matcher: {
                type: 'string',
                description: 'Pattern or rule for matching violations'
              },
              message: {
                type: 'string',
                description: 'Message to display when constraint is violated'
              },
              correctionAction: {
                type: 'string',
                enum: ['warn', 'suggest', 'block', 'auto-correct'],
                description: 'Action to take when constraint is violated'
              }
            },
            required: ['id', 'type', 'message']
          }
        },
        {
          name: 'check_action_constraints',
          description: 'Check if a proposed action would violate any constraints',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'object',
                description: 'Action to check for constraint violations'
              },
              context: {
                type: 'object',
                description: 'Current session context'
              }
            },
            required: ['action']
          }
        },
        {
          name: 'get_violation_history',
          description: 'Get history of constraint violations and their resolutions',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: {
                type: 'string',
                description: 'Session ID to filter violations'
              },
              constraintId: {
                type: 'string',
                description: 'Constraint ID to filter violations'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of violations to return'
              },
              timeWindow: {
                type: 'string',
                description: 'Time window (e.g., "1h", "1d", "1w")'
              }
            }
          }
        },
        {
          name: 'resolve_violation',
          description: 'Mark a constraint violation as resolved',
          inputSchema: {
            type: 'object',
            properties: {
              violationId: {
                type: 'string',
                description: 'ID of the violation to resolve'
              },
              resolution: {
                type: 'string',
                description: 'Description of how the violation was resolved'
              }
            },
            required: ['violationId']
          }
        },
        {
          name: 'inject_constraint_context',
          description: 'Inject constraint context into a user prompt',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Original user prompt'
              },
              sessionId: {
                type: 'string',
                description: 'Session ID for context'
              }
            },
            required: ['prompt']
          }
        },
        {
          name: 'assess_risk',
          description: 'Assess risk level of a proposed action',
          inputSchema: {
            type: 'object',
            properties: {
              event: {
                type: 'object',
                description: 'Event or action to assess'
              },
              context: {
                type: 'object',
                description: 'Current context'
              }
            },
            required: ['event']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        await this.ensureInitialized();

        switch (name) {
          case 'get_constraint_status':
            return await this.getConstraintStatus(args);
            
          case 'search_similar_violations':
            return await this.searchSimilarViolations(args);
            
          case 'add_constraint_rule':
            return await this.addConstraintRule(args);
            
          case 'check_action_constraints':
            return await this.checkActionConstraints(args);
            
          case 'get_violation_history':
            return await this.getViolationHistory(args);
            
          case 'resolve_violation':
            return await this.resolveViolation(args);
            
          case 'inject_constraint_context':
            return await this.injectConstraintContext(args);
            
          case 'assess_risk':
            return await this.assessRisk(args);
            
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        logger.error(`Tool ${name} failed:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async getConstraintStatus(args) {
    const { sessionId } = args;
    
    const status = {
      monitoring: {
        active: this.monitor?.running || false,
        stats: this.monitor?.getStats() || {}
      },
      processing: {
        active: this.processor?.running || false,
        stats: this.processor?.getStats() || {}
      },
      guideRails: {
        stats: this.guideRails?.getStats() || {}
      }
    };

    if (sessionId) {
      status.session = await this.duckdb.getSessionMetrics(sessionId);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(status, null, 2)
      }]
    };
  }

  async searchSimilarViolations(args) {
    const { query, limit = 5 } = args;
    
    // Generate embedding for the query (simplified)
    const queryEmbedding = await this.generateQueryEmbedding(query);
    
    // Search similar violations in Qdrant
    const results = await this.qdrant.searchSimilarViolations(queryEmbedding, {
      limit,
      scoreThreshold: 0.7
    });

    // Enrich with context from DuckDB
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        const patterns = await this.duckdb.findViolationPatterns([result.payload.constraintId]);
        return {
          ...result,
          patterns: patterns.slice(0, 2) // Top 2 patterns
        };
      })
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          query,
          results: enrichedResults,
          count: enrichedResults.length
        }, null, 2)
      }]
    };
  }

  async addConstraintRule(args) {
    const success = this.processor.constraintDetector?.addConstraint(args);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success,
          constraint: args,
          message: success ? 'Constraint rule added successfully' : 'Failed to add constraint rule'
        }, null, 2)
      }]
    };
  }

  async checkActionConstraints(args) {
    const { action, context = {} } = args;
    
    // Create event from action
    const event = {
      uuid: 'check-' + Date.now(),
      timestamp: Date.now(),
      type: action.type || 'action_check',
      content: JSON.stringify(action),
      agent: 'constraint-check',
      sessionId: context.sessionId || 'check'
    };

    // Check for violations
    const violations = await this.processor.constraintDetector?.detectViolations(
      event,
      context,
      this.processor.groqEngine
    ) || [];

    // Assess intervention
    let intervention = null;
    if (violations.length > 0) {
      intervention = await this.guideRails.interventeOnViolations(violations, event, context);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          action,
          violations,
          intervention,
          recommendation: intervention?.blocked ? 'Block action' : 'Allow action'
        }, null, 2)
      }]
    };
  }

  async getViolationHistory(args) {
    const { sessionId, constraintId, limit = 10, timeWindow = '24 hours' } = args;
    
    const compliance = await this.duckdb.getComplianceMetrics(timeWindow);
    const topViolations = await this.duckdb.getTopViolations(limit, timeWindow);
    
    let sessionMetrics = null;
    if (sessionId) {
      sessionMetrics = await this.duckdb.getSessionMetrics(sessionId);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          timeWindow,
          compliance,
          topViolations,
          sessionMetrics
        }, null, 2)
      }]
    };
  }

  async resolveViolation(args) {
    const { violationId, resolution } = args;
    
    this.guideRails.resolveViolation(violationId);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          violationId,
          resolution,
          resolved: true,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }

  async injectConstraintContext(args) {
    const { prompt, sessionId = 'unknown' } = args;
    
    const enhancedPrompt = await this.guideRails.injectConstraintContext(prompt, sessionId);
    
    return {
      content: [{
        type: 'text',
        text: enhancedPrompt
      }]
    };
  }

  async assessRisk(args) {
    const { event, context = {} } = args;
    
    const riskAssessment = await this.guideRails.assessRisk(event, context);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(riskAssessment, null, 2)
      }]
    };
  }

  async generateQueryEmbedding(query) {
    // Simplified embedding generation
    // In production, would use a proper embedding model
    const hash = require('crypto').createHash('sha256').update(query).digest();
    const embedding = Array.from(hash).slice(0, 384).map(b => (b - 128) / 128);
    return embedding;
  }

  async handleAnalysisResult(result) {
    try {
      // Store in databases
      const eventData = {
        uuid: result.event.uuid,
        sessionId: result.event.sessionId,
        agent: result.event.agent,
        eventType: result.event.type,
        constraintId: result.violations[0]?.constraintId || null,
        violationSeverity: result.violations.length > 0 ? 
          Math.max(...result.violations.map(v => this.getSeverityScore(v.severity))) : 0,
        trajectoryScore: result.semanticAnalysis?.intentAlignment || 5,
        timestamp: result.event.timestamp,
        content: result.event.content,
        embedding: null // Would generate proper embedding
      };

      await Promise.all([
        this.duckdb.addConstraintEvent(eventData),
        // this.qdrant.addConstraintEvent(eventData) // Would add with proper embedding
      ]);
    } catch (error) {
      logger.error('Failed to handle analysis result:', error);
    }
  }

  async handleViolations(data) {
    try {
      // Apply interventions
      const intervention = await this.guideRails.interventeOnViolations(
        data.violations,
        data.event,
        data.context
      );
      
      if (intervention.intervention) {
        logger.info('Intervention applied', intervention);
      }
    } catch (error) {
      logger.error('Failed to handle violations:', error);
    }
  }

  getSeverityScore(severity) {
    const scores = { info: 1, warning: 2, error: 3, critical: 4 };
    return scores[severity] || 1;
  }

  setupErrorHandlers() {
    this.server.onerror = (error) => {
      logger.error('MCP Server error:', error);
    };

    process.on('SIGINT', async () => {
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.shutdown();
      process.exit(0);
    });
  }

  async shutdown() {
    try {
      logger.info('Shutting down Constraint Monitor MCP Server');
      
      if (this.monitor) await this.monitor.stop();
      if (this.processor) await this.processor.stop();
      if (this.duckdb) await this.duckdb.close();
      if (this.qdrant) await this.qdrant.close();
      
      logger.info('Constraint Monitor MCP Server shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown:', error);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Constraint Monitor MCP Server running on stdio');
  }
}

// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ConstraintMonitorServer();
  server.run().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}