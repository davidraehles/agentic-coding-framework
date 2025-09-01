#!/usr/bin/env node

/**
 * Constraint Monitor - Main Service Entry Point
 * 
 * Orchestrates all constraint monitoring components:
 * - Universal agent monitoring
 * - Real-time constraint detection  
 * - Live guide-rails intervention
 * - Vector and analytical databases
 * - HTTP API server
 */

import { EventEmitter } from 'events';
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

import { UniversalAgentMonitor } from './capture/universal-monitor.js';
import { EventProcessor } from './capture/event-processor.js';
import { LiveGuideRails } from './intervention/live-guide-rails.js';
import { QdrantDatabase } from './database/qdrant-client.js';
import { DuckDBAnalytics } from './database/duckdb-client.js';
import { logger, performanceLogger } from './utils/logger.js';

export class ConstraintMonitorService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      port: config.port || 8767,
      enableWebSocket: config.enableWebSocket !== false,
      enableHTTPAPI: config.enableHTTPAPI !== false,
      enableMCPServer: config.enableMCPServer !== false,
      ...config
    };

    // Core components
    this.monitor = null;
    this.processor = null;
    this.guideRails = null;
    this.qdrant = null;
    this.duckdb = null;

    // HTTP server components
    this.app = null;
    this.server = null;
    this.wss = null;

    // Service state
    this.running = false;
    this.startTime = null;
    this.connections = new Set();
    this.stats = {
      requests: 0,
      websocketConnections: 0,
      errors: 0
    };
  }

  /**
   * Initialize all service components
   */
  async initialize() {
    try {
      logger.info('Initializing Constraint Monitor Service');

      // Initialize databases first
      await this.initializeDatabases();
      
      // Initialize monitoring components
      await this.initializeMonitoring();
      
      // Initialize HTTP server
      if (this.config.enableHTTPAPI || this.config.enableWebSocket) {
        await this.initializeHTTPServer();
      }

      // Connect component event handlers
      this.connectComponents();

      logger.info('Constraint Monitor Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize service:', error);
      throw error;
    }
  }

  async initializeDatabases() {
    logger.info('Initializing databases');
    
    // Initialize vector database (Qdrant)
    this.qdrant = new QdrantDatabase(this.config.qdrant);
    await this.qdrant.initialize();
    
    // Initialize analytical database (DuckDB)
    this.duckdb = new DuckDBAnalytics(this.config.duckdb);
    await this.duckdb.initialize();
    
    logger.info('Databases initialized');
  }

  async initializeMonitoring() {
    logger.info('Initializing monitoring components');
    
    // Universal agent monitor
    this.monitor = new UniversalAgentMonitor(this.config.monitor);
    
    // Event processor with analysis engines
    this.processor = new EventProcessor({
      ...this.config.processor,
      qdrant: this.qdrant,
      duckdb: this.duckdb
    });
    
    // Live guide-rails intervention system
    this.guideRails = new LiveGuideRails(this.config.guideRails);
    
    logger.info('Monitoring components initialized');
  }

  async initializeHTTPServer() {
    logger.info('Initializing HTTP server');
    
    this.app = express();
    
    // Middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      this.stats.requests++;
      logger.debug(`${req.method} ${req.path}`);
      next();
    });

    // Setup routes
    this.setupRoutes();
    
    // Create HTTP server
    this.server = createServer(this.app);
    
    // Setup WebSocket if enabled
    if (this.config.enableWebSocket) {
      this.setupWebSocket();
    }
    
    logger.info('HTTP server initialized');
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', async (req, res) => {
      try {
        const health = await this.getHealthStatus();
        res.status(health.healthy ? 200 : 503).json(health);
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({ error: error.message });
      }
    });

    // Service status
    this.app.get('/api/status', async (req, res) => {
      try {
        const status = await this.getServiceStatus();
        res.json(status);
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({ error: error.message });
      }
    });

    // Real-time metrics
    this.app.get('/api/metrics', async (req, res) => {
      try {
        const metrics = await this.getMetrics();
        res.json(metrics);
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({ error: error.message });
      }
    });

    // Event processing endpoint (for hooks)
    this.app.post('/api/events', async (req, res) => {
      try {
        const event = req.body;
        event.receivedAt = Date.now();
        
        // Process event
        await this.processor.processEvent(event);
        
        res.json({ success: true, eventId: event.uuid });
      } catch (error) {
        this.stats.errors++;
        logger.error('Event processing failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Pre-action constraint check (for pre-hooks)
    this.app.post('/api/pre-check', async (req, res) => {
      try {
        const { action, context } = req.body;
        
        // Quick constraint check
        const result = await this.checkActionConstraints(action, context);
        
        res.json(result);
      } catch (error) {
        this.stats.errors++;
        logger.error('Pre-check failed:', error);
        res.status(500).json({ 
          shouldBlock: false, // Fail safe - don't block on error
          error: error.message 
        });
      }
    });

    // Violation search
    this.app.get('/api/violations/search', async (req, res) => {
      try {
        const { q: query, limit = 10 } = req.query;
        const results = await this.searchViolations(query, { limit: parseInt(limit) });
        res.json(results);
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({ error: error.message });
      }
    });

    // Constraint management
    this.app.post('/api/constraints', async (req, res) => {
      try {
        const constraint = req.body;
        const success = await this.addConstraint(constraint);
        res.json({ success, constraint });
      } catch (error) {
        this.stats.errors++;
        res.status(500).json({ error: error.message });
      }
    });

    // Static dashboard (simple)
    this.app.get('/dashboard', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      this.stats.errors++;
      logger.error('Express error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  setupWebSocket() {
    this.wss = new WebSocketServer({ server: this.server });
    
    this.wss.on('connection', (ws, req) => {
      this.connections.add(ws);
      this.stats.websocketConnections++;
      
      logger.debug('WebSocket connection established');
      
      // Send initial status
      ws.send(JSON.stringify({
        type: 'status',
        data: { connected: true, timestamp: Date.now() }
      }));
      
      ws.on('close', () => {
        this.connections.delete(ws);
        logger.debug('WebSocket connection closed');
      });
      
      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.connections.delete(ws);
      });
    });
  }

  connectComponents() {
    // Monitor -> Processor
    this.monitor.on('event', async (event) => {
      await this.processor.processEvent(event);
    });

    // Processor -> Guide Rails + Storage
    this.processor.on('analysisComplete', async (result) => {
      await this.handleAnalysisResult(result);
    });

    this.processor.on('violationsDetected', async (data) => {
      await this.handleViolations(data);
    });

    // Guide Rails -> WebSocket notifications
    this.guideRails.on('intervention', (intervention) => {
      this.broadcastToWebSockets({
        type: 'intervention',
        data: intervention
      });
    });

    this.guideRails.on('riskDetected', (risk) => {
      this.broadcastToWebSockets({
        type: 'risk',
        data: risk
      });
    });
  }

  /**
   * Start the service
   */
  async start() {
    if (this.running) {
      logger.warn('Service already running');
      return;
    }

    try {
      await this.initialize();
      
      // Start monitoring components
      await this.monitor.start();
      await this.processor.start();
      
      // Start HTTP server
      if (this.server) {
        await new Promise((resolve, reject) => {
          this.server.listen(this.config.port, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        
        logger.info(`HTTP server listening on port ${this.config.port}`);
      }

      this.running = true;
      this.startTime = Date.now();
      
      logger.info('Constraint Monitor Service started successfully');
      this.emit('started');
    } catch (error) {
      logger.error('Failed to start service:', error);
      throw error;
    }
  }

  /**
   * Stop the service
   */
  async stop() {
    if (!this.running) return;

    try {
      logger.info('Stopping Constraint Monitor Service');
      
      this.running = false;
      
      // Close WebSocket connections
      for (const ws of this.connections) {
        ws.close();
      }
      this.connections.clear();

      // Stop HTTP server
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
      }

      // Stop monitoring components
      if (this.monitor) await this.monitor.stop();
      if (this.processor) await this.processor.stop();
      
      // Close databases
      if (this.duckdb) await this.duckdb.close();
      if (this.qdrant) await this.qdrant.close();

      logger.info('Constraint Monitor Service stopped');
      this.emit('stopped');
    } catch (error) {
      logger.error('Error stopping service:', error);
      throw error;
    }
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
        violationSeverity: result.violations.length,
        trajectoryScore: result.semanticAnalysis?.intentAlignment || 5,
        timestamp: result.event.timestamp,
        content: result.event.content
      };

      await this.duckdb.addConstraintEvent(eventData);

      // Broadcast to WebSocket clients
      this.broadcastToWebSockets({
        type: 'analysis',
        data: {
          eventId: result.event.uuid,
          violationCount: result.violations.length,
          trajectoryScore: eventData.trajectoryScore
        }
      });
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
      
      // Broadcast violation event
      this.broadcastToWebSockets({
        type: 'violations',
        data: {
          violations: data.violations,
          intervention,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      logger.error('Failed to handle violations:', error);
    }
  }

  async checkActionConstraints(action, context) {
    // Create event from action
    const event = {
      uuid: 'check-' + Date.now(),
      timestamp: Date.now(),
      type: action.tool || 'action',
      content: JSON.stringify(action.input || action),
      agent: 'pre-check',
      sessionId: context?.sessionId || 'unknown'
    };

    // Quick constraint detection
    const violations = await this.processor.constraintDetector?.detectViolations(
      event,
      context || {},
      null // No semantic analysis for speed
    ) || [];

    if (violations.length > 0) {
      const criticalViolations = violations.filter(v => v.severity === 'critical');
      
      return {
        shouldBlock: criticalViolations.length > 0,
        violations,
        message: violations[0].message,
        suggestions: this.getSuggestionsForViolations(violations)
      };
    }

    return { shouldBlock: false };
  }

  getSuggestionsForViolations(violations) {
    const suggestions = [];
    for (const violation of violations) {
      if (violation.constraintId === 'unauthorized-commit') {
        suggestions.push('Ask user: "Should I commit these changes?"');
      } else if (violation.constraintId === 'no-console-log') {
        suggestions.push('Use Logger.log() instead of console.log');
      } else {
        suggestions.push('Ask user for permission before proceeding');
      }
    }
    return suggestions.slice(0, 3);
  }

  broadcastToWebSockets(message) {
    const messageStr = JSON.stringify(message);
    for (const ws of this.connections) {
      try {
        if (ws.readyState === ws.OPEN) {
          ws.send(messageStr);
        }
      } catch (error) {
        logger.error('WebSocket broadcast error:', error);
        this.connections.delete(ws);
      }
    }
  }

  async getHealthStatus() {
    const components = {};
    
    if (this.monitor) {
      components.monitor = await this.monitor.healthCheck();
    }
    
    if (this.processor) {
      components.processor = await this.processor.healthCheck();
    }
    
    if (this.guideRails) {
      components.guideRails = await this.guideRails.healthCheck();
    }

    const healthy = Object.values(components).every(c => c.healthy);
    
    return {
      healthy,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      components
    };
  }

  async getServiceStatus() {
    return {
      running: this.running,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      components: {
        monitor: this.monitor?.getStats(),
        processor: this.processor?.getStats(),
        guideRails: this.guideRails?.getStats()
      },
      server: {
        port: this.config.port,
        connections: this.connections.size,
        requests: this.stats.requests,
        errors: this.stats.errors
      }
    };
  }

  async getMetrics() {
    const compliance = await this.duckdb.getComplianceMetrics();
    const topViolations = await this.duckdb.getTopViolations(5);
    
    return {
      compliance,
      topViolations,
      realTime: {
        violationQueue: this.guideRails.getViolationQueue().length,
        activeConnections: this.connections.size,
        processingQueue: this.processor.getStats()?.queueSize || 0
      }
    };
  }

  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Constraint Monitor Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #e3f2fd; border-radius: 4px; }
        .status { padding: 5px 10px; border-radius: 4px; color: white; }
        .status.healthy { background: #4caf50; }
        .status.warning { background: #ff9800; }
        .status.error { background: #f44336; }
        #events { height: 300px; overflow-y: auto; background: #f8f8f8; padding: 10px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛡️ Constraint Monitor Dashboard</h1>
        
        <div class="card">
            <h2>Service Status</h2>
            <div id="status">Loading...</div>
        </div>
        
        <div class="card">
            <h2>Real-time Events</h2>
            <div id="events"></div>
        </div>
        
        <div class="card">
            <h2>Metrics</h2>
            <div id="metrics">Loading...</div>
        </div>
    </div>

    <script>
        // WebSocket connection for real-time updates
        const ws = new WebSocket('ws://localhost:${this.config.port}');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            addEvent(data.type + ': ' + JSON.stringify(data.data));
        };
        
        function addEvent(text) {
            const events = document.getElementById('events');
            events.innerHTML += new Date().toLocaleTimeString() + ' - ' + text + '<br>';
            events.scrollTop = events.scrollHeight;
        }
        
        // Load initial data
        fetch('/api/status').then(r => r.json()).then(data => {
            document.getElementById('status').innerHTML = 
                '<span class="status healthy">Running</span> Uptime: ' + Math.floor(data.uptime / 1000) + 's';
        });
        
        fetch('/api/metrics').then(r => r.json()).then(data => {
            document.getElementById('metrics').innerHTML = 
                '<div class="metric">Compliance: ' + (data.compliance?.[0]?.compliance_percentage || 'N/A') + '%</div>' +
                '<div class="metric">Active Violations: ' + (data.realTime?.violationQueue || 0) + '</div>' +
                '<div class="metric">Connections: ' + (data.realTime?.activeConnections || 0) + '</div>';
        });
    </script>
</body>
</html>`;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new ConstraintMonitorService();
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully');
    await service.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully');
    await service.stop();
    process.exit(0);
  });

  // Start service
  service.start().catch((error) => {
    logger.error('Failed to start service:', error);
    process.exit(1);
  });
}