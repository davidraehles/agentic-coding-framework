import { EventEmitter } from 'events';
import { logger, PerformanceTimer } from '../utils/logger.js';
import { GroqSemanticEngine } from '../analysis/groq-engine.js';
import { ConstraintDetector } from '../analysis/constraint-detector.js';

export class EventProcessor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      processingMode: config.processingMode || 'real-time', // 'real-time' or 'batch'
      batchSize: config.batchSize || 10,
      batchTimeout: config.batchTimeout || 1000, // 1 second
      maxConcurrentProcessing: config.maxConcurrentProcessing || 5,
      enableSemanticAnalysis: config.enableSemanticAnalysis !== false,
      enableConstraintDetection: config.enableConstraintDetection !== false,
      ...config
    };

    // Initialize analysis engines
    this.groqEngine = null;
    this.constraintDetector = null;
    this.contextManager = new SessionContextManager();
    
    // Processing state
    this.processingQueue = [];
    this.currentlyProcessing = 0;
    this.batchTimer = null;
    this.running = false;
    
    // Statistics
    this.stats = {
      eventsProcessed: 0,
      analysisTime: 0,
      violationsDetected: 0,
      errors: 0,
      startTime: null
    };

    this.initializeEngines();
  }

  async initializeEngines() {
    try {
      // Initialize Groq semantic engine
      if (this.config.enableSemanticAnalysis) {
        this.groqEngine = new GroqSemanticEngine(this.config.groq);
        logger.info('Groq semantic engine initialized');
      }

      // Initialize constraint detector
      if (this.config.enableConstraintDetection) {
        this.constraintDetector = new ConstraintDetector(this.config.constraints);
        logger.info('Constraint detector initialized');
      }
    } catch (error) {
      logger.error('Failed to initialize analysis engines:', error);
      throw error;
    }
  }

  /**
   * Start event processing
   */
  async start() {
    if (this.running) {
      logger.warn('Event processor already running');
      return;
    }

    this.running = true;
    this.stats.startTime = Date.now();
    
    if (this.config.processingMode === 'batch') {
      this.startBatchProcessing();
    }

    logger.info(`Event processor started in ${this.config.processingMode} mode`);
    this.emit('started');
  }

  /**
   * Stop event processing
   */
  async stop() {
    if (!this.running) return;

    this.running = false;
    
    // Clear batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Wait for current processing to complete
    while (this.currentlyProcessing > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Process remaining events in queue
    if (this.processingQueue.length > 0) {
      logger.info(`Processing ${this.processingQueue.length} remaining events`);
      await this.processBatch(this.processingQueue.splice(0));
    }

    logger.info('Event processor stopped');
    this.emit('stopped');
  }

  /**
   * Process a single event
   */
  async processEvent(event) {
    if (!this.running) return;

    if (this.config.processingMode === 'real-time') {
      await this.processEventImmediate(event);
    } else {
      this.processingQueue.push(event);
      
      if (this.processingQueue.length >= this.config.batchSize) {
        this.processBatchNow();
      }
    }
  }

  /**
   * Process event immediately (real-time mode)
   */
  async processEventImmediate(event) {
    // Check concurrency limit
    if (this.currentlyProcessing >= this.config.maxConcurrentProcessing) {
      this.processingQueue.push(event);
      return;
    }

    this.currentlyProcessing++;
    const timer = new PerformanceTimer('process-event');

    try {
      await this.analyzeEvent(event);
      const duration = timer.end('completed');
      this.stats.analysisTime += duration;
    } catch (error) {
      timer.end('failed', { error: error.message });
      this.stats.errors++;
      logger.error('Event processing failed:', error);
    } finally {
      this.currentlyProcessing--;
      
      // Process queued events
      if (this.processingQueue.length > 0 && this.currentlyProcessing < this.config.maxConcurrentProcessing) {
        const nextEvent = this.processingQueue.shift();
        setImmediate(() => this.processEventImmediate(nextEvent));
      }
    }
  }

  /**
   * Analyze a single event
   */
  async analyzeEvent(event) {
    // Get or create session context
    const context = await this.contextManager.getContext(event.sessionId);
    
    // Update context with new event
    context.addEvent(event);

    // Perform semantic analysis
    let semanticAnalysis = null;
    if (this.groqEngine && this.shouldAnalyzeSemantics(event)) {
      semanticAnalysis = await this.groqEngine.analyzeInteraction(event, context);
    }

    // Detect constraint violations
    let violations = [];
    if (this.constraintDetector) {
      violations = await this.constraintDetector.detectViolations(
        event, 
        context, 
        this.groqEngine
      );
    }

    // Create analysis result
    const analysisResult = {
      event,
      context: context.getSummary(),
      semanticAnalysis,
      violations,
      timestamp: Date.now(),
      processingTime: Date.now() - event.timestamp
    };

    // Update statistics
    this.stats.eventsProcessed++;
    if (violations.length > 0) {
      this.stats.violationsDetected += violations.length;
    }

    // Emit results
    this.emit('analysisComplete', analysisResult);
    
    if (violations.length > 0) {
      this.emit('violationsDetected', { event, violations, context: context.getSummary() });
    }

    return analysisResult;
  }

  /**
   * Check if event should undergo semantic analysis
   */
  shouldAnalyzeSemantics(event) {
    const semanticEventTypes = [
      'user_input',
      'agent_response', 
      'tool_invocation',
      'tool_result'
    ];
    
    return semanticEventTypes.includes(event.type) && event.content && event.content.length > 10;
  }

  /**
   * Start batch processing timer
   */
  startBatchProcessing() {
    this.batchTimer = setTimeout(() => {
      if (this.processingQueue.length > 0) {
        this.processBatchNow();
      }
      
      if (this.running) {
        this.startBatchProcessing(); // Schedule next batch
      }
    }, this.config.batchTimeout);
  }

  /**
   * Process batch immediately
   */
  async processBatchNow() {
    if (this.processingQueue.length === 0) return;

    const batch = this.processingQueue.splice(0, this.config.batchSize);
    await this.processBatch(batch);
  }

  /**
   * Process a batch of events
   */
  async processBatch(events) {
    if (events.length === 0) return;

    const timer = new PerformanceTimer('process-batch');

    try {
      // Process events in parallel, respecting concurrency limits
      const chunks = this.chunkArray(events, this.config.maxConcurrentProcessing);
      
      for (const chunk of chunks) {
        const promises = chunk.map(event => this.analyzeEvent(event));
        await Promise.allSettled(promises);
      }

      const duration = timer.end('completed', { batchSize: events.length });
      this.stats.analysisTime += duration;
    } catch (error) {
      timer.end('failed', { error: error.message, batchSize: events.length });
      this.stats.errors++;
      logger.error('Batch processing failed:', error);
    }
  }

  /**
   * Utility function to chunk array
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get processing statistics
   */
  getStats() {
    const uptime = this.stats.startTime ? Date.now() - this.stats.startTime : 0;
    
    return {
      running: this.running,
      uptime,
      processingMode: this.config.processingMode,
      eventsProcessed: this.stats.eventsProcessed,
      violationsDetected: this.stats.violationsDetected,
      errors: this.stats.errors,
      averageProcessingTime: this.stats.eventsProcessed > 0 ? 
        (this.stats.analysisTime / this.stats.eventsProcessed).toFixed(2) : 0,
      queueSize: this.processingQueue.length,
      currentlyProcessing: this.currentlyProcessing,
      eventsPerSecond: uptime > 0 ? (this.stats.eventsProcessed / (uptime / 1000)).toFixed(2) : 0
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    const health = {
      healthy: this.running,
      issues: []
    };

    // Check analysis engines
    if (this.groqEngine) {
      const groqHealth = await this.groqEngine.healthCheck();
      if (!groqHealth.healthy) {
        health.healthy = false;
        health.issues.push(`Groq engine: ${groqHealth.error}`);
      }
    }

    // Check queue size
    if (this.processingQueue.length > 1000) {
      health.issues.push('Processing queue is large');
    }

    // Check error rate
    const errorRate = this.stats.eventsProcessed > 0 ? 
      (this.stats.errors / this.stats.eventsProcessed) : 0;
    
    if (errorRate > 0.1) {
      health.healthy = false;
      health.issues.push('High error rate detected');
    }

    return health;
  }
}

/**
 * Session context manager
 */
class SessionContextManager {
  constructor() {
    this.contexts = new Map();
    this.maxContextAge = 3600000; // 1 hour
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // 5 minutes
  }

  async getContext(sessionId) {
    if (this.contexts.has(sessionId)) {
      const context = this.contexts.get(sessionId);
      context.lastAccessed = Date.now();
      return context;
    }

    const context = new SessionContext(sessionId);
    this.contexts.set(sessionId, context);
    return context;
  }

  cleanup() {
    const now = Date.now();
    for (const [sessionId, context] of this.contexts) {
      if (now - context.lastAccessed > this.maxContextAge) {
        this.contexts.delete(sessionId);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.contexts.clear();
  }
}

/**
 * Session context for tracking conversation state
 */
class SessionContext {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.events = [];
    this.userIntent = null;
    this.activeConstraints = [];
    this.currentPhase = 'exploration';
    this.sessionStats = {
      fileReads: 0,
      toolUses: 0,
      violations: 0
    };
    this.createdAt = Date.now();
    this.lastAccessed = Date.now();
  }

  addEvent(event) {
    this.events.push({
      type: event.type,
      timestamp: event.timestamp,
      content: event.content?.substring(0, 200) // Truncate for storage
    });

    // Keep only recent events
    if (this.events.length > 50) {
      this.events.shift();
    }

    // Update stats
    if (event.type === 'tool_invocation' && event.toolName === 'Read') {
      this.sessionStats.fileReads++;
    }
    
    if (event.type === 'tool_invocation') {
      this.sessionStats.toolUses++;
    }

    // Extract user intent from user messages
    if (event.type === 'user_input' && event.content) {
      this.extractUserIntent(event.content);
    }

    this.lastAccessed = Date.now();
  }

  extractUserIntent(content) {
    // Simple intent extraction - could be enhanced with NLP
    const intentPatterns = [
      { pattern: /implement|build|create|add/i, intent: 'implementation' },
      { pattern: /fix|debug|resolve|solve/i, intent: 'bug_fixing' },
      { pattern: /refactor|improve|optimize/i, intent: 'refactoring' },
      { pattern: /explain|understand|analyze/i, intent: 'exploration' },
      { pattern: /test|verify|check/i, intent: 'verification' }
    ];

    for (const { pattern, intent } of intentPatterns) {
      if (pattern.test(content)) {
        this.userIntent = intent;
        break;
      }
    }
  }

  getSummary() {
    return {
      sessionId: this.sessionId,
      eventCount: this.events.length,
      userIntent: this.userIntent,
      currentPhase: this.currentPhase,
      activeConstraints: this.activeConstraints,
      sessionStats: this.sessionStats,
      recentEvents: this.events.slice(-5),
      summary: this.generateSummary()
    };
  }

  generateSummary() {
    if (this.events.length === 0) return 'New session';
    
    const recentContent = this.events
      .slice(-3)
      .map(e => e.content)
      .filter(Boolean)
      .join(' ')
      .substring(0, 200);
    
    return `${this.userIntent || 'Unknown intent'}: ${recentContent}`;
  }
}