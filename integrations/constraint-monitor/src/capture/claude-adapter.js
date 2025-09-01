import { EventEmitter } from 'events';
import { readFileSync, existsSync, statSync, watchFile, unwatchFile } from 'fs';
import { logger, PerformanceTimer } from '../utils/logger.js';

export class ClaudeCodeAdapter extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      transcriptPath: config.transcriptPath || this.findClaudeTranscript(),
      pollingInterval: config.pollingInterval || 1000,
      maxLineLength: config.maxLineLength || 10000,
      encoding: config.encoding || 'utf8',
      watchMode: config.watchMode || 'poll', // 'poll' or 'watch'
      ...config
    };

    this.lastProcessedLine = 0;
    this.lastFileSize = 0;
    this.running = false;
    this.pollTimer = null;
    this.stats = {
      eventsProcessed: 0,
      linesProcessed: 0,
      errors: 0,
      startTime: null
    };

    if (!this.config.transcriptPath) {
      throw new Error('Claude Code transcript path not found. Set CLAUDE_TRANSCRIPT_PATH environment variable.');
    }
  }

  /**
   * Find Claude Code transcript file
   */
  findClaudeTranscript() {
    const possiblePaths = [
      process.env.CLAUDE_TRANSCRIPT_PATH,
      process.env.CLAUDE_CODE_TRANSCRIPT,
      // Common locations
      '/tmp/claude-transcript.jsonl',
      '~/.claude/transcript.jsonl',
      './transcript.jsonl'
    ].filter(Boolean);

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    return null;
  }

  /**
   * Start monitoring Claude Code transcript
   */
  async start() {
    if (this.running) {
      logger.warn('Claude Code adapter already running');
      return;
    }

    try {
      if (!existsSync(this.config.transcriptPath)) {
        throw new Error(`Claude transcript file not found: ${this.config.transcriptPath}`);
      }

      this.running = true;
      this.stats.startTime = Date.now();
      
      // Initialize file position
      await this.initializeFilePosition();

      // Start monitoring
      if (this.config.watchMode === 'watch') {
        this.startFileWatcher();
      } else {
        this.startPolling();
      }

      logger.info(`Claude Code adapter started monitoring: ${this.config.transcriptPath}`);
      this.emit('status', { status: 'started', transcriptPath: this.config.transcriptPath });
    } catch (error) {
      this.running = false;
      logger.error('Failed to start Claude Code adapter:', error);
      throw error;
    }
  }

  /**
   * Initialize file position to avoid processing old events
   */
  async initializeFilePosition() {
    try {
      const content = readFileSync(this.config.transcriptPath, this.config.encoding);
      const lines = content.split('\n');
      
      this.lastProcessedLine = lines.length - 1; // Start from end
      this.lastFileSize = statSync(this.config.transcriptPath).size;
      
      logger.debug(`Initialized at line ${this.lastProcessedLine}, file size: ${this.lastFileSize} bytes`);
    } catch (error) {
      logger.warn('Failed to initialize file position:', error);
      this.lastProcessedLine = 0;
      this.lastFileSize = 0;
    }
  }

  /**
   * Start file watching using Node.js fs.watchFile
   */
  startFileWatcher() {
    watchFile(this.config.transcriptPath, {
      interval: this.config.pollingInterval
    }, (current, previous) => {
      if (current.mtime > previous.mtime) {
        this.processNewContent();
      }
    });
  }

  /**
   * Start polling for file changes
   */
  startPolling() {
    this.pollTimer = setInterval(() => {
      this.processNewContent();
    }, this.config.pollingInterval);
  }

  /**
   * Process new content in the transcript file
   */
  async processNewContent() {
    if (!this.running) return;

    const timer = new PerformanceTimer('process-claude-content');
    
    try {
      const currentStats = statSync(this.config.transcriptPath);
      
      // Check if file has grown
      if (currentStats.size <= this.lastFileSize) {
        return; // No new content
      }

      const content = readFileSync(this.config.transcriptPath, this.config.encoding);
      const lines = content.split('\n');
      
      // Process new lines
      const newLines = lines.slice(this.lastProcessedLine);
      let eventsFound = 0;

      for (let i = 0; i < newLines.length; i++) {
        const line = newLines[i].trim();
        if (!line) continue;

        try {
          const event = this.parseJSONLLine(line);
          if (event) {
            this.emit('event', event);
            eventsFound++;
            this.stats.eventsProcessed++;
          }
        } catch (parseError) {
          // Skip invalid JSON lines
          logger.debug('Failed to parse JSONL line:', parseError.message);
        }
        
        this.stats.linesProcessed++;
      }

      // Update position
      this.lastProcessedLine = lines.length - 1;
      this.lastFileSize = currentStats.size;

      if (eventsFound > 0) {
        timer.end('completed', { eventsFound, totalLines: newLines.length });
      }
    } catch (error) {
      timer.end('failed', { error: error.message });
      this.stats.errors++;
      logger.error('Failed to process Claude transcript content:', error);
      this.emit('error', error);
    }
  }

  /**
   * Parse a JSONL line and convert to standardized event format
   */
  parseJSONLLine(line) {
    if (line.length > this.config.maxLineLength) {
      logger.warn(`Skipping oversized line: ${line.length} characters`);
      return null;
    }

    const data = JSON.parse(line);
    
    // Skip if not a relevant event
    if (!this.isRelevantEvent(data)) {
      return null;
    }

    // Convert to standardized event format
    return this.convertToStandardEvent(data);
  }

  /**
   * Check if a Claude event is relevant for constraint monitoring
   */
  isRelevantEvent(data) {
    const relevantTypes = [
      'user_message',
      'assistant_message', 
      'tool_use',
      'tool_result',
      'system_message'
    ];

    return data.type && relevantTypes.includes(data.type);
  }

  /**
   * Convert Claude JSONL format to standardized event format
   */
  convertToStandardEvent(data) {
    const baseEvent = {
      uuid: data.uuid || this.generateUUID(),
      timestamp: data.timestamp || Date.now(),
      agent: 'claude-code',
      sessionId: data.session_id || 'unknown'
    };

    switch (data.type) {
      case 'user_message':
        return {
          ...baseEvent,
          type: 'user_input',
          content: data.content || data.text || '',
          role: 'user'
        };

      case 'assistant_message':
        return {
          ...baseEvent,
          type: 'agent_response',
          content: data.content || data.text || '',
          role: 'assistant'
        };

      case 'tool_use':
        return {
          ...baseEvent,
          type: 'tool_invocation',
          toolName: data.tool_name || data.name,
          content: data.input ? JSON.stringify(data.input) : '',
          parameters: data.input || {}
        };

      case 'tool_result':
        return {
          ...baseEvent,
          type: 'tool_result',
          toolName: data.tool_name,
          content: data.content || data.result || '',
          success: !data.is_error,
          error: data.is_error ? data.content : null
        };

      case 'system_message':
        return {
          ...baseEvent,
          type: 'system_event',
          content: data.content || '',
          messageType: data.message_type || 'info'
        };

      default:
        return {
          ...baseEvent,
          type: 'unknown',
          content: JSON.stringify(data),
          rawType: data.type
        };
    }
  }

  /**
   * Generate simple UUID for events without one
   */
  generateUUID() {
    return 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Stop monitoring
   */
  async stop() {
    if (!this.running) return;

    try {
      this.running = false;

      // Stop polling
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }

      // Stop file watching
      try {
        unwatchFile(this.config.transcriptPath);
      } catch (error) {
        // Ignore errors when unwatching
      }

      logger.info('Claude Code adapter stopped');
      this.emit('status', { status: 'stopped' });
    } catch (error) {
      logger.error('Error stopping Claude Code adapter:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Check if transcript file exists and is readable
      if (!existsSync(this.config.transcriptPath)) {
        return {
          healthy: false,
          error: 'Transcript file not found'
        };
      }

      const stats = statSync(this.config.transcriptPath);
      const now = Date.now();
      const fileAge = now - stats.mtime.getTime();
      
      // File should be updated within last 5 minutes for active session
      const stale = fileAge > 300000; // 5 minutes

      return {
        healthy: this.running && !stale,
        transcriptPath: this.config.transcriptPath,
        fileSize: stats.size,
        lastModified: stats.mtime.toISOString(),
        fileAge: fileAge,
        stale,
        stats: this.getStats()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Get processing statistics
   */
  getStats() {
    const uptime = this.stats.startTime ? Date.now() - this.stats.startTime : 0;
    
    return {
      running: this.running,
      uptime,
      transcriptPath: this.config.transcriptPath,
      eventsProcessed: this.stats.eventsProcessed,
      linesProcessed: this.stats.linesProcessed,
      errors: this.stats.errors,
      lastProcessedLine: this.lastProcessedLine,
      lastFileSize: this.lastFileSize,
      eventsPerSecond: uptime > 0 ? (this.stats.eventsProcessed / (uptime / 1000)).toFixed(2) : 0
    };
  }

  /**
   * Reset adapter state
   */
  reset() {
    this.lastProcessedLine = 0;
    this.lastFileSize = 0;
    this.stats = {
      eventsProcessed: 0,
      linesProcessed: 0,
      errors: 0,
      startTime: this.stats.startTime
    };
    
    logger.info('Claude Code adapter state reset');
  }

  /**
   * Set transcript path (useful for testing)
   */
  setTranscriptPath(path) {
    if (this.running) {
      throw new Error('Cannot change transcript path while adapter is running');
    }
    
    this.config.transcriptPath = path;
    logger.info(`Transcript path set to: ${path}`);
  }
}