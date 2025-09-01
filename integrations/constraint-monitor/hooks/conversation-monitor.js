#!/usr/bin/env node

/**
 * Claude Code Hook: Conversation Monitor
 * 
 * This hook is called by Claude Code for various events and feeds data
 * into the real-time constraint monitoring system.
 * 
 * Usage in Claude Code hooks configuration:
 * {
 *   "user-prompt-submit": {
 *     "command": "node",
 *     "args": ["./integrations/constraint-monitor/hooks/conversation-monitor.js", "user-prompt"]
 *   },
 *   "post-tool-use": {
 *     "command": "node", 
 *     "args": ["./integrations/constraint-monitor/hooks/conversation-monitor.js", "post-tool"]
 *   }
 * }
 */

import { writeFileSync, appendFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class ConversationMonitor {
  constructor() {
    this.hookType = process.argv[2] || 'unknown';
    this.config = this.loadConfig();
    this.logPath = join(__dirname, '../logs/hook-events.jsonl');
    
    // Ensure logs directory exists
    try {
      const logsDir = dirname(this.logPath);
      if (!existsSync(logsDir)) {
        import('fs').then(fs => fs.mkdirSync(logsDir, { recursive: true }));
      }
    } catch (error) {
      // Continue without logging if directory creation fails
    }
  }

  loadConfig() {
    try {
      const configPath = join(__dirname, '../config/hooks.json');
      if (existsSync(configPath)) {
        return JSON.parse(readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      // Use default config
    }

    return {
      enabled: true,
      logEvents: true,
      forwardToProcessor: true,
      processorEndpoint: 'http://localhost:8767/api/events',
      timeout: 5000
    };
  }

  async processHook() {
    if (!this.config.enabled) {
      process.exit(0);
    }

    try {
      // Read input from stdin (Claude Code hook data)
      const input = await this.readStdin();
      const hookData = input ? JSON.parse(input) : {};
      
      // Create standardized event
      const event = this.createEvent(hookData);
      
      // Log event locally
      if (this.config.logEvents) {
        this.logEvent(event);
      }
      
      // Forward to constraint monitor processor
      if (this.config.forwardToProcessor) {
        await this.forwardEvent(event);
      }
      
      // Return success (no output = success for Claude Code hooks)
      process.exit(0);
    } catch (error) {
      this.logError(error);
      
      // Don't block Claude Code on monitoring failures
      process.exit(0);
    }
  }

  async readStdin() {
    return new Promise((resolve) => {
      let data = '';
      
      if (process.stdin.isTTY) {
        resolve('');
        return;
      }

      process.stdin.setEncoding('utf8');
      
      process.stdin.on('data', (chunk) => {
        data += chunk;
      });
      
      process.stdin.on('end', () => {
        resolve(data.trim());
      });
      
      // Timeout after 1 second
      setTimeout(() => {
        resolve(data.trim());
      }, 1000);
    });
  }

  createEvent(hookData) {
    const baseEvent = {
      uuid: this.generateUUID(),
      timestamp: Date.now(),
      agent: 'claude-code',
      hookType: this.hookType,
      capturedAt: new Date().toISOString()
    };

    switch (this.hookType) {
      case 'user-prompt':
        return {
          ...baseEvent,
          type: 'user_input',
          content: hookData.prompt || hookData.content || '',
          sessionId: hookData.sessionId || 'unknown',
          metadata: {
            promptLength: (hookData.prompt || '').length,
            hasContext: Boolean(hookData.context)
          }
        };

      case 'pre-tool':
        return {
          ...baseEvent,
          type: 'tool_pre_invocation',
          toolName: hookData.tool || hookData.toolName,
          content: JSON.stringify(hookData.input || hookData.args || {}),
          sessionId: hookData.sessionId || 'unknown',
          metadata: {
            toolName: hookData.tool || hookData.toolName,
            hasInput: Boolean(hookData.input || hookData.args)
          }
        };

      case 'post-tool':
        return {
          ...baseEvent,
          type: 'tool_result',
          toolName: hookData.tool || hookData.toolName,
          content: this.sanitizeOutput(hookData.output || hookData.result || ''),
          success: !hookData.error && !hookData.failed,
          error: hookData.error || null,
          sessionId: hookData.sessionId || 'unknown',
          metadata: {
            toolName: hookData.tool || hookData.toolName,
            duration: hookData.duration || null,
            success: !hookData.error && !hookData.failed,
            outputLength: (hookData.output || hookData.result || '').length
          }
        };

      case 'notification':
        return {
          ...baseEvent,
          type: 'system_event',
          content: hookData.message || hookData.content || '',
          messageType: hookData.type || 'info',
          sessionId: hookData.sessionId || 'unknown'
        };

      default:
        return {
          ...baseEvent,
          type: 'unknown_hook',
          content: JSON.stringify(hookData),
          rawData: hookData
        };
    }
  }

  sanitizeOutput(output) {
    if (typeof output !== 'string') {
      output = JSON.stringify(output);
    }

    // Truncate very long outputs
    if (output.length > 5000) {
      return output.substring(0, 5000) + '...[truncated]';
    }

    // Remove potential sensitive information
    return output
      .replace(/sk-[a-zA-Z0-9]{40,}/g, 'sk-[REDACTED]') // API keys
      .replace(/password['":\s=]*['"]\w+['"]?/gi, 'password="[REDACTED]"') // Passwords
      .replace(/token['":\s=]*['"]\w+['"]?/gi, 'token="[REDACTED]"'); // Tokens
  }

  logEvent(event) {
    try {
      const logLine = JSON.stringify(event) + '\n';
      appendFileSync(this.logPath, logLine, 'utf8');
    } catch (error) {
      // Silently fail - don't block on logging errors
    }
  }

  async forwardEvent(event) {
    try {
      // Use dynamic import for HTTP client to avoid dependency issues
      const { default: fetch } = await import('node-fetch');
      
      const response = await fetch(this.config.processorEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hook-Type': this.hookType
        },
        body: JSON.stringify(event),
        timeout: this.config.timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Log error but don't fail the hook
      this.logError(`Failed to forward event: ${error.message}`);
    }
  }

  logError(error) {
    try {
      const errorLog = {
        timestamp: Date.now(),
        hookType: this.hookType,
        error: error.message || error.toString(),
        stack: error.stack
      };
      
      const errorPath = join(__dirname, '../logs/hook-errors.jsonl');
      appendFileSync(errorPath, JSON.stringify(errorLog) + '\n', 'utf8');
    } catch (logError) {
      // Can't log the error, just continue
    }
  }

  generateUUID() {
    return 'hook-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

// Set a timeout to prevent hanging
setTimeout(() => {
  process.exit(0);
}, 10000); // 10 second max execution time

// Run the monitor
const monitor = new ConversationMonitor();
monitor.processHook().catch((error) => {
  // Log error and exit gracefully
  monitor.logError(error);
  process.exit(0);
});