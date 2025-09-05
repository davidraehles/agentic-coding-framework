#!/usr/bin/env node

/**
 * Simplified Claude Code Transcript Monitor
 * - Single process monitors current project only
 * - All content logged locally first
 * - Post-processing handles cross-project routing
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

class SimplifiedTranscriptMonitor {
  constructor(config = {}) {
    this.config = {
      checkInterval: config.checkInterval || 5000,
      maxProcessBatch: config.maxProcessBatch || 10,
      projectPath: config.projectPath || process.cwd(),
      debug: config.debug || process.env.TRANSCRIPT_DEBUG === 'true',
      sessionDuration: config.sessionDuration || 3600000, // 60 minutes
      ...config
    };

    this.transcriptPath = this.findCurrentTranscript();
    this.lastProcessedUuid = null;
    this.lastFileSize = 0;
    this.isProcessing = false;
    this.currentSessionFile = null;
  }

  /**
   * Find current session's transcript file in ~/.claude/projects/
   */
  findCurrentTranscript() {
    const baseDir = path.join(os.homedir(), '.claude', 'projects');
    const projectName = this.getProjectDirName();
    const projectDir = path.join(baseDir, projectName);
    
    if (!fs.existsSync(projectDir)) {
      this.debug(`Project directory not found: ${projectDir}`);
      return null;
    }

    try {
      const files = fs.readdirSync(projectDir)
        .filter(file => file.endsWith('.jsonl'))
        .map(file => {
          const filePath = path.join(projectDir, file);
          const stats = fs.statSync(filePath);
          return { path: filePath, mtime: stats.mtime, size: stats.size };
        })
        .sort((a, b) => b.mtime - a.mtime);

      if (files.length === 0) {
        this.debug('No transcript files found');
        return null;
      }

      const mostRecent = files[0];
      const timeDiff = Date.now() - mostRecent.mtime.getTime();
      
      if (timeDiff < this.config.sessionDuration) {
        this.debug(`Using transcript: ${mostRecent.path}`);
        return mostRecent.path;
      }

      this.debug('No recent transcript files found');
      return null;
    } catch (error) {
      this.debug(`Error finding transcript: ${error.message}`);
      return null;
    }
  }

  /**
   * Convert project path to Claude's directory naming convention
   */
  getProjectDirName() {
    const normalized = this.config.projectPath.replace(/\//g, '-');
    return normalized.startsWith('-') ? normalized : '-' + normalized;
  }

  /**
   * Read and parse transcript messages
   */
  readTranscriptMessages(transcriptPath) {
    if (!fs.existsSync(transcriptPath)) return [];

    try {
      const content = fs.readFileSync(transcriptPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      const messages = [];

      for (const line of lines) {
        try {
          const message = JSON.parse(line);
          messages.push(message);
        } catch (error) {
          continue; // Skip malformed lines
        }
      }
      return messages;
    } catch (error) {
      this.debug(`Error reading transcript: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract conversation exchanges from messages
   */
  extractExchanges(messages) {
    const exchanges = [];
    let currentExchange = null;

    for (const message of messages) {
      if (message.type === 'user' && message.message?.role === 'user') {
        if (currentExchange) exchanges.push(currentExchange);
        currentExchange = {
          id: message.uuid,
          timestamp: message.timestamp || Date.now(),
          userMessage: this.extractTextContent(message.message.content) || '',
          claudeResponse: '',
          toolCalls: [],
          toolResults: []
        };
      } else if (message.type === 'assistant' && currentExchange) {
        if (message.message?.content) {
          if (Array.isArray(message.message.content)) {
            for (const item of message.message.content) {
              if (item.type === 'text') {
                currentExchange.claudeResponse += item.text + '\n';
              } else if (item.type === 'tool_use') {
                currentExchange.toolCalls.push({
                  name: item.name,
                  input: item.input,
                  id: item.id
                });
              }
            }
          } else if (typeof message.message.content === 'string') {
            currentExchange.claudeResponse = message.message.content;
          }
        }
      } else if (message.type === 'user' && message.message?.content && Array.isArray(message.message.content)) {
        for (const item of message.message.content) {
          if (item.type === 'tool_result' && currentExchange) {
            currentExchange.toolResults.push({
              tool_use_id: item.tool_use_id,
              content: item.content,
              is_error: item.is_error || false
            });
          }
        }
      }
    }

    if (currentExchange) exchanges.push(currentExchange);
    return exchanges;
  }

  /**
   * Extract text content from message content array
   */
  extractTextContent(content) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
    }
    return '';
  }

  /**
   * Get unprocessed exchanges since last check
   */
  getUnprocessedExchanges() {
    if (!this.transcriptPath) return [];

    const messages = this.readTranscriptMessages(this.transcriptPath);
    if (messages.length === 0) return [];

    const exchanges = this.extractExchanges(messages);
    
    if (!this.lastProcessedUuid) {
      return exchanges.slice(-this.config.maxProcessBatch);
    }

    const lastIndex = exchanges.findIndex(ex => ex.id === this.lastProcessedUuid);
    if (lastIndex >= 0) {
      return exchanges.slice(lastIndex + 1, lastIndex + 1 + this.config.maxProcessBatch);
    }

    return exchanges.slice(-this.config.maxProcessBatch);
  }

  /**
   * Check if transcript has new content
   */
  hasNewContent() {
    if (!this.transcriptPath) return false;

    try {
      const stats = fs.statSync(this.transcriptPath);
      const hasNew = stats.size !== this.lastFileSize;
      this.lastFileSize = stats.size;
      return hasNew;
    } catch (error) {
      return false;
    }
  }

  /**
   * Process exchanges and log to current project
   */
  async processExchanges(exchanges) {
    if (!exchanges || exchanges.length === 0) return;

    this.debug(`Processing ${exchanges.length} new exchanges`);

    for (const exchange of exchanges) {
      try {
        for (const toolCall of exchange.toolCalls) {
          const result = exchange.toolResults.find(r => r.tool_use_id === toolCall.id);
          await this.logExchange(exchange, toolCall, result);
        }
        this.lastProcessedUuid = exchange.id;
      } catch (error) {
        this.debug(`Error processing exchange ${exchange.id}: ${error.message}`);
      }
    }
  }

  /**
   * Log exchange to current project's session file (simplified)
   */
  async logExchange(exchange, toolCall, result) {
    const sessionFile = await this.getCurrentSessionFile();
    const exchangeTime = new Date(exchange.timestamp).toISOString();
    const toolSuccess = result && !result.is_error;
    
    const content = `### ${toolCall.name} - ${exchangeTime}\n\n**User Request:** ${exchange.userMessage?.slice(0, 150) || 'No context'}${exchange.userMessage?.length > 150 ? '...' : ''}\n\n**Tool:** ${toolCall.name}  \n**Input:** \`\`\`json\n${JSON.stringify(toolCall.input, null, 2)}\n\`\`\`\n\n**Result:** ${toolSuccess ? '✅ Success' : '❌ Error'}\n${result?.content ? `**Output:** \`\`\`\n${typeof result.content === 'string' ? result.content.slice(0, 300) : JSON.stringify(result.content, null, 2).slice(0, 300)}\n\`\`\`` : ''}\n\n**AI Analysis:** ${this.isCodingRelated(toolCall, result) ? '🔍 Coding-related - may need routing' : '📋 General activity'} | CATEGORY: ${this.categorizeActivity(toolCall)}\n\n---\n\n`;

    fs.appendFileSync(sessionFile, content);
    
    const sessionFileName = path.basename(sessionFile);
    console.log(`[TranscriptMonitor] ${exchangeTime} Logged exchange to: ${sessionFileName}`);
    this.debug(`Logged exchange to: ${sessionFileName}`);

    // Post-processing: If this is coding-related, also log to coding project
    if (this.isCodingRelated(toolCall, result) && !this.config.projectPath.includes('/coding')) {
      await this.routeToCodingProject(exchange, toolCall, result, content);
    }
  }

  /**
   * Simple check if activity involves coding project
   */
  isCodingRelated(toolCall, result) {
    const toolInputStr = JSON.stringify(toolCall.input || {});
    const resultStr = JSON.stringify(result?.content || '');
    const combinedStr = (toolInputStr + resultStr).toLowerCase();

    const codingIndicators = [
      '/users/q284340/agentic/coding/',
      'coding/scripts/',
      'coding/bin/',
      'coding/src/',
      'coding/.specstory/',
      'coding/integrations/',
      'transcript-monitor',
      'launch-claude'
    ];

    return codingIndicators.some(indicator => combinedStr.includes(indicator));
  }

  /**
   * Categorize activity type
   */
  categorizeActivity(toolCall) {
    if (toolCall.name === 'Edit' || toolCall.name === 'Write' || toolCall.name === 'MultiEdit') return 'file_modification';
    if (toolCall.name === 'Read' || toolCall.name === 'Glob') return 'file_read';
    if (toolCall.name === 'Bash') return 'command';
    if (toolCall.name === 'Grep') return 'search';
    if (toolCall.name.startsWith('mcp__')) return 'mcp_tool';
    return 'other';
  }

  /**
   * Route coding-related activity to coding project (simple copy)
   */
  async routeToCodingProject(exchange, toolCall, result, content) {
    try {
      const codingProjectPath = process.env.CODING_TOOLS_PATH || '/Users/q284340/Agentic/coding';
      const codingSessionFile = await this.getCodingSessionFile(codingProjectPath);
      
      // Add routing note to content
      const routedContent = `🔀 Routed from ${path.basename(this.config.projectPath)} project\n\n${content}`;
      
      fs.appendFileSync(codingSessionFile, routedContent);
      console.log(`🔀 Routing to coding repo: ${path.basename(codingSessionFile)}`);
    } catch (error) {
      this.debug(`Failed to route to coding project: ${error.message}`);
    }
  }

  /**
   * Get session file for coding project
   */
  async getCodingSessionFile(codingPath) {
    const originalPath = this.config.projectPath;
    this.config.projectPath = codingPath;
    const sessionFile = await this.getCurrentSessionFile();
    this.config.projectPath = originalPath;
    return sessionFile;
  }

  /**
   * Get current session file (create if needed)
   */
  async getCurrentSessionFile() {
    const now = new Date();
    
    // Calculate 60-minute tranche (XX:30 - (XX+1):30)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const trancheStart = Math.floor((totalMinutes + 30) / 60) * 60 - 30;
    const trancheEnd = trancheStart + 60;
    const startHour = Math.floor(trancheStart / 60);
    const startMin = trancheStart % 60;
    const endHour = Math.floor(trancheEnd / 60);
    const endMin = trancheEnd % 60;
    const formatTime = (h, m) => `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;
    const currentTranche = `${formatTime(startHour, startMin)}-${formatTime(endHour, endMin)}`;
    
    const needNewSession = !this.currentSessionFile || 
                           !this.currentSessionFile.includes(currentTranche) ||
                           !this.currentSessionFile.includes(now.toISOString().split('T')[0]);
    
    if (needNewSession) {
      const date = now.toISOString().split('T')[0];
      const sessionFileName = `${date}_${currentTranche}-session.md`;
      
      this.currentSessionFile = path.join(this.config.projectPath, '.specstory', 'history', sessionFileName);
      
      if (!fs.existsSync(this.currentSessionFile)) {
        const sessionHeader = `# WORK SESSION (${currentTranche})\n\n` +
          `**Generated:** ${now.toISOString()}\n` +
          `**Work Period:** ${currentTranche}\n` +
          `**Focus:** Live session logging\n` +
          `**Duration:** ~60 minutes\n\n` +
          `---\n\n## Session Overview\n\n` +
          `This session captures real-time tool interactions and exchanges.\n\n` +
          `---\n\n## Key Activities\n\n`;
        
        const dir = path.dirname(this.currentSessionFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(this.currentSessionFile, sessionHeader);
        console.log(`📝 Started new 60-minute session: ${path.basename(this.currentSessionFile)}`);
      }
    }
    
    return this.currentSessionFile;
  }

  /**
   * Start monitoring
   */
  start() {
    if (!this.transcriptPath) {
      console.log('❌ No current transcript file found. Make sure Claude Code is running.');
      return;
    }

    console.log(`🚀 Starting simplified transcript monitor`);
    console.log(`📁 Project: ${this.config.projectPath}`);
    console.log(`📊 Transcript: ${path.basename(this.transcriptPath)}`);
    console.log(`🔍 Check interval: ${this.config.checkInterval}ms`);

    this.intervalId = setInterval(async () => {
      if (this.isProcessing) return;
      if (!this.hasNewContent()) return;

      this.isProcessing = true;
      try {
        const exchanges = this.getUnprocessedExchanges();
        if (exchanges.length > 0) {
          await this.processExchanges(exchanges);
        }
      } catch (error) {
        this.debug(`Error in monitoring loop: ${error.message}`);
      } finally {
        this.isProcessing = false;
      }
    }, this.config.checkInterval);

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping transcript monitor...');
      this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Stopping transcript monitor...');
      this.stop();
      process.exit(0);
    });
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('📋 Transcript monitor stopped');
  }

  /**
   * Debug logging
   */
  debug(message) {
    if (this.config.debug) {
      console.error(`[TranscriptMonitor] ${new Date().toISOString()} ${message}`);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new SimplifiedTranscriptMonitor({ debug: true });
  monitor.start();
}

export default SimplifiedTranscriptMonitor;