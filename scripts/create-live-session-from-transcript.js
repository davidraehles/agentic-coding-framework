#!/usr/bin/env node

/**
 * Create Live Session Log from Current Transcript
 * Converts Claude Code's transcript JSONL to live session format
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

class TranscriptToLiveSession {
  constructor() {
    this.transcriptPath = this.findCurrentTranscript();
    this.outputDir = path.join(process.cwd(), '.specstory', 'history');
    this.sessionId = null;
  }

  findCurrentTranscript() {
    const transcriptDir = path.join(os.homedir(), '.claude', 'projects', '-Users-q284340-Agentic-coding');
    
    if (!fs.existsSync(transcriptDir)) {
      throw new Error('Transcript directory not found');
    }

    const files = fs.readdirSync(transcriptDir)
      .filter(file => file.endsWith('.jsonl'))
      .map(file => {
        const filePath = path.join(transcriptDir, file);
        const stats = fs.statSync(filePath);
        return { file, path: filePath, mtime: stats.mtime, size: stats.size };
      })
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
      throw new Error('No transcript files found');
    }

    const mostRecent = files[0];
    const timeDiff = Date.now() - mostRecent.mtime.getTime();
    
    if (timeDiff > 600000) { // 10 minutes
      throw new Error(`Most recent transcript is too old: ${Math.round(timeDiff/1000)}s ago`);
    }

    console.log(`Using transcript: ${mostRecent.file} (${Math.round(mostRecent.size/1024)}KB)`);
    return mostRecent.path;
  }

  parseTranscript() {
    const content = fs.readFileSync(this.transcriptPath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    const exchanges = [];
    const messages = [];
    
    // Parse each JSON line
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        messages.push(entry);
        
        // Extract session ID from first message
        if (!this.sessionId && entry.sessionId) {
          this.sessionId = entry.sessionId;
        }
      } catch (error) {
        console.warn(`Skipping malformed line: ${line.substring(0, 100)}...`);
      }
    }

    // Group into exchanges (user message + assistant response + tool results)
    let currentExchange = null;
    
    for (const msg of messages) {
      if (msg.type === 'user' && msg.message?.role === 'user') {
        // Check if this is a tool result or a user message
        if (msg.message.content?.[0]?.type === 'tool_result') {
          // This is a tool result - add to current exchange
          if (currentExchange) {
            currentExchange.toolResults = currentExchange.toolResults || [];
            currentExchange.toolResults.push(msg);
          }
        } else {
          // This is a new user message - start new exchange
          if (currentExchange) {
            exchanges.push(currentExchange);
          }
          currentExchange = {
            user: msg,
            assistant: null,
            toolResults: [],
            timestamp: msg.timestamp
          };
        }
      } else if (msg.type === 'assistant' && msg.message?.role === 'assistant') {
        // Assistant response - add to current exchange
        if (currentExchange) {
          currentExchange.assistant = msg;
        }
      }
    }
    
    // Add final exchange if exists
    if (currentExchange) {
      exchanges.push(currentExchange);
    }

    console.log(`Parsed ${exchanges.length} exchanges from ${messages.length} messages`);
    return exchanges;
  }

  formatExchange(exchange, index) {
    const timestamp = new Date(exchange.timestamp).toLocaleString();
    let content = `## Exchange ${index + 1}: ${timestamp}\n\n`;

    // User message
    if (exchange.user?.message?.content) {
      const userContent = exchange.user.message.content;
      if (typeof userContent === 'string') {
        content += `**User:**\n${userContent}\n\n`;
      } else if (Array.isArray(userContent)) {
        // Handle tool results
        const toolResult = userContent.find(c => c.type === 'tool_result');
        if (toolResult) {
          content += `**Tool Result:** ${toolResult.tool_use_id}\n\`\`\`\n${toolResult.content}\n\`\`\`\n\n`;
        }
      }
    }

    // Assistant message
    if (exchange.assistant?.message?.content) {
      const assistantContent = exchange.assistant.message.content;
      content += `**Assistant:**\n`;
      
      if (typeof assistantContent === 'string') {
        content += `${assistantContent}\n\n`;
      } else if (Array.isArray(assistantContent)) {
        for (const item of assistantContent) {
          if (item.type === 'text') {
            content += `${item.text}\n\n`;
          } else if (item.type === 'tool_use') {
            content += `**Tool:** ${item.name}\n`;
            if (item.input) {
              content += `**Input:**\n\`\`\`json\n${JSON.stringify(item.input, null, 2)}\n\`\`\`\n\n`;
            }
          }
        }
      }
    }

    return content + `---\n\n`;
  }

  createLiveSessionLog() {
    try {
      const exchanges = this.parseTranscript();
      
      if (exchanges.length === 0) {
        console.log('No exchanges found in transcript');
        return;
      }

      // Ensure output directory exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // Create filename
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const shortSessionId = this.sessionId ? this.sessionId.substring(0, 8) : 'current';
      const filename = `${date}_${time}_${shortSessionId}_live-session.md`;
      const filePath = path.join(this.outputDir, filename);

      // Build content
      let content = `# Live Session Log (From Transcript)\n\n`;
      content += `**Session ID:** ${this.sessionId}\n`;
      content += `**Started:** ${exchanges[0]?.timestamp || new Date().toISOString()}\n`;
      content += `**Generated:** ${new Date().toISOString()}\n`;
      content += `**Source:** Claude Code Transcript (${path.basename(this.transcriptPath)})\n`;
      content += `**Exchanges:** ${exchanges.length}\n\n`;
      content += `---\n\n`;

      // Add exchanges
      for (let i = 0; i < exchanges.length; i++) {
        content += this.formatExchange(exchanges[i], i);
      }

      // Add summary
      content += `## Session Summary\n\n`;
      content += `- **Total Exchanges:** ${exchanges.length}\n`;
      content += `- **Session Duration:** Active session\n`;
      content += `- **Transcript Source:** ${path.basename(this.transcriptPath)}\n`;
      content += `- **Generated:** ${new Date().toLocaleString()}\n\n`;
      content += `*This live session log was generated from the current Claude Code transcript to ensure conversation history is preserved.*\n`;

      // Write file
      fs.writeFileSync(filePath, content);
      console.log(`✅ Live session log created: ${filePath}`);
      console.log(`📊 Captured ${exchanges.length} exchanges`);
      
      return filePath;
    } catch (error) {
      console.error('❌ Failed to create live session log:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    const converter = new TranscriptToLiveSession();
    const logFile = converter.createLiveSessionLog();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main();
}

export default TranscriptToLiveSession;