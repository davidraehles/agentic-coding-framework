import { logger, PerformanceTimer } from '../utils/logger.js';
import { EventEmitter } from 'events';
import chokidar from 'chokidar';
import { ClaudeCodeAdapter } from './claude-adapter.js';

export class UniversalAgentMonitor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      enabledAdapters: config.enabledAdapters || ['claude-code'],
      pollingInterval: config.pollingInterval || 1000, // 1 second
      maxEvents: config.maxEvents || 10000,
      eventRetention: config.eventRetention || 86400000, // 24 hours
      ...config
    };

    this.adapters = new Map();
    this.eventBuffer = [];
    this.lastProcessedEvents = new Map(); // adapter -> last event ID/timestamp
    this.watchers = new Map();
    this.running = false;
    this.stats = {
      eventsProcessed: 0,
      adaptersActive: 0,
      errors: 0,
      startTime: null
    };

    this.initializeAdapters();
  }

  /**
   * Initialize adapters for different coding agents
   */
  initializeAdapters() {
    // Claude Code adapter
    if (this.config.enabledAdapters.includes('claude-code')) {
      const claudeAdapter = new ClaudeCodeAdapter({
        transcriptPath: process.env.CLAUDE_TRANSCRIPT_PATH,
        pollingInterval: this.config.pollingInterval
      });
      this.adapters.set('claude-code', claudeAdapter);
    }

    // Add other adapters as they're implemented
    // if (this.config.enabledAdapters.includes('cursor')) {
    //   const cursorAdapter = new CursorAdapter(this.config.cursor);
    //   this.adapters.set('cursor', cursorAdapter);
    // }

    logger.info(`Initialized ${this.adapters.size} agent adapters`);
  }

  /**
   * Start monitoring all configured agents
   */
  async start() {
    if (this.running) {
      logger.warn('Universal monitor already running');
      return;
    }

    try {
      this.running = true;
      this.stats.startTime = Date.now();
      this.stats.adaptersActive = 0;

      // Start each adapter
      for (const [name, adapter] of this.adapters) {
        try {
          await this.startAdapter(name, adapter);
          this.stats.adaptersActive++;
        } catch (error) {
          logger.error(`Failed to start adapter ${name}:`, error);
          this.stats.errors++;
        }
      }

      // Start event buffer cleanup
      this.startCleanupTimer();

      logger.info(`Universal monitor started with ${this.stats.adaptersActive} active adapters`);
      this.emit('started', { adaptersActive: this.stats.adaptersActive });
    } catch (error) {
      logger.error('Failed to start universal monitor:', error);
      this.running = false;
      throw error;
    }
  }

  async startAdapter(name, adapter) {
    const timer = new PerformanceTimer(`start-adapter-${name}`);

    try {
      // Set up event handlers
      adapter.on('event', (event) => this.handleAdapterEvent(name, event));
      adapter.on('error', (error) => this.handleAdapterError(name, error));
      adapter.on('status', (status) => this.handleAdapterStatus(name, status));

      // Start the adapter
      await adapter.start();
      
      timer.end('completed');
      logger.info(`Started adapter: ${name}`);
    } catch (error) {
      timer.end('failed', { error: error.message });
      throw error;
    }
  }

  handleAdapterEvent(adapterName, event) {
    try {
      // Enrich event with adapter information
      const enrichedEvent = {
        ...event,
        agent: event.agent || adapterName,
        capturedAt: Date.now(),
        adapterId: adapterName
      };

      // Add to buffer
      this.eventBuffer.push(enrichedEvent);
      
      // Maintain buffer size limit
      if (this.eventBuffer.length > this.config.maxEvents) {
        this.eventBuffer.shift();
      }

      // Update stats
      this.stats.eventsProcessed++;

      // Emit for downstream processing
      this.emit('event', enrichedEvent);

      logger.debug(`Event captured from ${adapterName}:`, {
        type: event.type,
        uuid: event.uuid,
        timestamp: event.timestamp
      });
    } catch (error) {
      logger.error(`Failed to handle event from ${adapterName}:`, error);
      this.stats.errors++;
    }
  }

  handleAdapterError(adapterName, error) {
    logger.error(`Adapter ${adapterName} error:`, error);
    this.stats.errors++;
    this.emit('adapterError', { adapter: adapterName, error });

    // Try to restart the adapter after a delay
    setTimeout(() => {
      this.restartAdapter(adapterName);
    }, 5000);
  }

  handleAdapterStatus(adapterName, status) {
    logger.debug(`Adapter ${adapterName} status:`, status);
    this.emit('adapterStatus', { adapter: adapterName, status });
  }

  async restartAdapter(adapterName) {
    try {
      const adapter = this.adapters.get(adapterName);
      if (!adapter) return;

      logger.info(`Restarting adapter: ${adapterName}`);
      
      await adapter.stop();
      await this.startAdapter(adapterName, adapter);
      
      logger.info(`Successfully restarted adapter: ${adapterName}`);
    } catch (error) {
      logger.error(`Failed to restart adapter ${adapterName}:`, error);
    }
  }

  /**
   * Stop monitoring
   */
  async stop() {
    if (!this.running) return;

    try {
      this.running = false;

      // Stop all adapters
      for (const [name, adapter] of this.adapters) {
        try {
          await adapter.stop();
          logger.debug(`Stopped adapter: ${name}`);
        } catch (error) {
          logger.error(`Error stopping adapter ${name}:`, error);
        }
      }

      // Stop file watchers
      for (const [path, watcher] of this.watchers) {
        try {
          await watcher.close();
        } catch (error) {
          logger.warn(`Error closing watcher for ${path}:`, error);
        }
      }
      this.watchers.clear();

      // Clear cleanup timer
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }

      this.stats.adaptersActive = 0;
      logger.info('Universal monitor stopped');
      this.emit('stopped');
    } catch (error) {
      logger.error('Error stopping universal monitor:', error);
      throw error;
    }
  }

  /**
   * Get recent events from buffer
   */
  getRecentEvents(options = {}) {
    const {
      limit = 100,
      agent = null,
      eventType = null,
      since = null
    } = options;

    let events = [...this.eventBuffer];

    // Filter by agent
    if (agent) {
      events = events.filter(e => e.agent === agent);
    }

    // Filter by event type
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }

    // Filter by timestamp
    if (since) {
      events = events.filter(e => e.timestamp >= since);
    }

    // Sort by timestamp (newest first) and limit
    return events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get new events since last check
   */
  getNewEvents(adapterName = null) {
    if (!adapterName) {
      // Return new events from all adapters
      const newEvents = [];
      for (const adapter of this.adapters.keys()) {
        newEvents.push(...this.getNewEvents(adapter));
      }
      return newEvents.sort((a, b) => a.timestamp - b.timestamp);
    }

    const lastProcessed = this.lastProcessedEvents.get(adapterName) || 0;
    const newEvents = this.eventBuffer.filter(event => 
      event.adapterId === adapterName && event.timestamp > lastProcessed
    );

    // Update last processed timestamp
    if (newEvents.length > 0) {
      const latestTimestamp = Math.max(...newEvents.map(e => e.timestamp));
      this.lastProcessedEvents.set(adapterName, latestTimestamp);
    }

    return newEvents;
  }

  /**
   * Add custom adapter
   */
  addAdapter(name, adapter) {
    if (this.adapters.has(name)) {
      throw new Error(`Adapter ${name} already exists`);
    }

    this.adapters.set(name, adapter);
    
    if (this.running) {
      this.startAdapter(name, adapter);
    }

    logger.info(`Added adapter: ${name}`);
  }

  /**
   * Remove adapter
   */
  async removeAdapter(name) {
    const adapter = this.adapters.get(name);
    if (!adapter) return false;

    try {
      await adapter.stop();
      this.adapters.delete(name);
      this.lastProcessedEvents.delete(name);
      
      logger.info(`Removed adapter: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Error removing adapter ${name}:`, error);
      return false;
    }
  }

  /**
   * Start cleanup timer for old events
   */
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldEvents();
    }, 300000); // 5 minutes
  }

  cleanupOldEvents() {
    const cutoff = Date.now() - this.config.eventRetention;
    const initialSize = this.eventBuffer.length;
    
    this.eventBuffer = this.eventBuffer.filter(event => 
      event.timestamp > cutoff
    );

    const removed = initialSize - this.eventBuffer.length;
    if (removed > 0) {
      logger.debug(`Cleaned up ${removed} old events`);
    }
  }

  /**
   * Get monitoring statistics
   */
  getStats() {
    const uptime = this.stats.startTime ? Date.now() - this.stats.startTime : 0;
    
    return {
      running: this.running,
      uptime,
      adapters: {
        total: this.adapters.size,
        active: this.stats.adaptersActive,
        configured: Array.from(this.adapters.keys())
      },
      events: {
        total: this.stats.eventsProcessed,
        buffered: this.eventBuffer.length,
        perSecond: uptime > 0 ? (this.stats.eventsProcessed / (uptime / 1000)).toFixed(2) : 0
      },
      errors: this.stats.errors,
      memory: {
        bufferSize: this.eventBuffer.length,
        maxEvents: this.config.maxEvents,
        retention: this.config.eventRetention
      }
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    const health = {
      healthy: this.running,
      adapters: {},
      issues: []
    };

    for (const [name, adapter] of this.adapters) {
      try {
        if (typeof adapter.healthCheck === 'function') {
          const adapterHealth = await adapter.healthCheck();
          health.adapters[name] = adapterHealth;
          
          if (!adapterHealth.healthy) {
            health.healthy = false;
            health.issues.push(`Adapter ${name}: ${adapterHealth.error || 'unhealthy'}`);
          }
        } else {
          health.adapters[name] = { healthy: true, note: 'No health check implemented' };
        }
      } catch (error) {
        health.healthy = false;
        health.adapters[name] = { healthy: false, error: error.message };
        health.issues.push(`Adapter ${name}: ${error.message}`);
      }
    }

    // Check buffer health
    if (this.eventBuffer.length >= this.config.maxEvents * 0.9) {
      health.issues.push('Event buffer near capacity');
    }

    if (this.stats.errors > 100) {
      health.issues.push('High error count detected');
    }

    return health;
  }

  /**
   * Reset monitoring state
   */
  reset() {
    this.eventBuffer = [];
    this.lastProcessedEvents.clear();
    this.stats = {
      eventsProcessed: 0,
      adaptersActive: this.stats.adaptersActive,
      errors: 0,
      startTime: this.stats.startTime
    };
    
    logger.info('Universal monitor state reset');
  }
}