#!/usr/bin/env node

/**
 * Integrated Transcript Monitor - Clean Architecture
 * 
 * Designed according to user specifications:
 * - Everything runs from coding (always)
 * - Transcript monitor integrates with statusLine health checks (300ms intervals)
 * - File touch detection for redirect (coding directory touches → ->coding indicator)
 * - LSL creation triggered by user prompts, not time windows
 * - Environment variables, not hardcoded paths
 * - Comprehensive event logging to coding/logs
 * - Reuses existing LSL generation and trajectory systems
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import eventLogger from './event-logger.js';
import { generateLSL } from './generate-proper-lsl-from-transcripts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class IntegratedTranscriptMonitor {
  constructor() {
    // Use environment variables for all paths
    this.codingPath = process.env.CODING_TOOLS_PATH || process.env.CODING_REPO || path.join(__dirname, '..');
    this.targetProject = process.env.CODING_TARGET_PROJECT || process.cwd();
    
    // Configuration
    this.pollInterval = 2000; // 2 seconds for transcript checking
    this.statusHealthInterval = 300; // 300ms for status line health
    this.debounceDelay = 1000; // 1 second for prompt debouncing
    
    // State management
    this.isRunning = false;
    this.currentTranscriptFile = null;
    this.lastProcessedSize = 0;
    this.pendingPrompts = new Map();
    this.redirectStatus = {
      active: false,
      notifiedAt: null
    };
    
    // Health tracking for status line integration
    this.lastHealthCheck = 0;
    this.healthStatus = 'initializing';
    
    eventLogger.info('MONITOR_INIT', 'Integrated transcript monitor initializing', {
      coding_path: this.codingPath,
      target_project: this.targetProject
    });
  }

  async start() {
    if (this.isRunning) {
      eventLogger.warn('MONITOR_START', 'Monitor already running');
      return;
    }

    this.isRunning = true;
    this.currentTranscriptFile = await this.findActiveTranscript();
    
    if (!this.currentTranscriptFile) {
      eventLogger.error('MONITOR_START', 'No active transcript found');
      this.healthStatus = 'no_transcript';
      return;
    }

    eventLogger.transcriptMonitorStarted(this.targetProject, this.currentTranscriptFile);
    this.healthStatus = 'operational';

    // Start main monitoring loop
    this.startMonitoringLoop();
    
    console.log(`🚀 Integrated transcript monitor started`);
    console.log(`📁 Project: ${this.targetProject}`);
    console.log(`📊 Transcript: ${path.basename(this.currentTranscriptFile)}`);
    console.log(`🔍 Poll interval: ${this.pollInterval}ms`);
    console.log(`⏰ Prompt-triggered LSL creation enabled`);
  }

  async stop(reason = 'manual') {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    eventLogger.transcriptMonitorStopped(reason);
    this.healthStatus = 'stopped';
    
    console.log('🛑 Transcript monitor stopped');
  }

  startMonitoringLoop() {
    const monitorTick = async () => {
      if (!this.isRunning) return;
      
      try {
        await this.checkTranscriptChanges();
        await this.processStatusHealth();
      } catch (error) {
        eventLogger.systemError('MONITOR_LOOP', error);
        this.healthStatus = 'error';
      }
      
      // Schedule next tick
      setTimeout(monitorTick, this.pollInterval);
    };
    
    monitorTick();
  }

  async checkTranscriptChanges() {
    if (!this.currentTranscriptFile || !fs.existsSync(this.currentTranscriptFile)) {
      // Try to find a new active transcript
      const newTranscript = await this.findActiveTranscript();
      if (newTranscript) {
        this.currentTranscriptFile = newTranscript;
        this.lastProcessedSize = 0;
        eventLogger.info('TRANSCRIPT_SWITCH', 'Switched to new transcript', {
          new_file: newTranscript
        });
      } else {
        this.healthStatus = 'no_transcript';
        return;
      }
    }

    const stats = fs.statSync(this.currentTranscriptFile);
    const currentSize = stats.size;
    
    if (currentSize > this.lastProcessedSize) {
      await this.processNewTranscriptContent(currentSize);
      this.lastProcessedSize = currentSize;
      this.healthStatus = 'operational';
    }
  }

  async processNewTranscriptContent(currentSize) {
    try {
      const content = fs.readFileSync(this.currentTranscriptFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      // Process only new lines since last check
      const startLine = Math.max(0, lines.length - 10); // Check last 10 lines for new content
      const newLines = lines.slice(startLine);
      
      for (const line of newLines) {
        try {
          const entry = JSON.parse(line);
          await this.processTranscriptEntry(entry);
        } catch (error) {
          // Skip invalid JSON lines
          eventLogger.debug('TRANSCRIPT_PARSE', 'Skipped invalid JSON line', { error: error.message });
        }
      }
    } catch (error) {
      eventLogger.systemError('TRANSCRIPT_PROCESSING', error);
      this.healthStatus = 'error';
    }
  }

  async processTranscriptEntry(entry) {
    if (entry.type === 'user' && !entry.message?.content?.[0]?.tool_use_id && !entry.isMeta) {
      const userMessage = this.extractUserMessage(entry);
      
      if (userMessage && userMessage.trim().length > 0) {
        await this.handleUserPrompt(userMessage, entry.timestamp);
      }
    }
  }

  extractUserMessage(entry) {
    if (entry.message?.content) {
      if (typeof entry.message.content === 'string') {
        return entry.message.content;
      }
      if (Array.isArray(entry.message.content)) {
        return entry.message.content
          .filter(item => item && item.type === 'text')
          .map(item => item.text)
          .filter(text => text && text.trim())
          .join('\n');
      }
    }
    return '';
  }

  async handleUserPrompt(userMessage, timestamp) {
    eventLogger.promptDetected(userMessage, this.getCurrentWindow());
    
    // Check if this prompt touches coding directory (for redirect detection)
    const touchesCoding = this.detectsCodingOperation(userMessage);
    
    if (touchesCoding) {
      await this.handleCodingRedirect();
    }

    // Debounce LSL creation - wait for more exchanges before creating LSL
    const promptId = `${timestamp}-${userMessage.substring(0, 50)}`;
    
    if (this.pendingPrompts.has(promptId)) {
      clearTimeout(this.pendingPrompts.get(promptId));
    }
    
    const timeoutId = setTimeout(async () => {
      await this.triggerLSLCreation(userMessage, timestamp);
      this.pendingPrompts.delete(promptId);
    }, this.debounceDelay);
    
    this.pendingPrompts.set(promptId, timeoutId);
  }

  detectsCodingOperation(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check for coding directory paths
    const codingPaths = [
      '/users/q284340/agentic/coding/',
      '~/agentic/coding/',
      'coding/',
      'coding/scripts/',
      'coding/bin/',
      'coding/docs/',
      'coding/.specstory/'
    ];
    
    return codingPaths.some(path => message.includes(path));
  }

  async handleCodingRedirect() {
    const now = Date.now();
    
    // Only notify once per session or every 5 minutes
    if (!this.redirectStatus.active || (now - this.redirectStatus.notifiedAt) > 300000) {
      this.redirectStatus.active = true;
      this.redirectStatus.notifiedAt = now;
      
      const projectName = this.targetProject.split('/').pop();
      eventLogger.codingRedirectDetected(projectName, 'coding');
      
      // Notify status line about redirect
      await this.notifyStatusLineRedirect();
      
      console.log('🔀 Coding redirect detected - operations targeting coding directory');
    }
  }

  async notifyStatusLineRedirect() {
    // Create a touch file that status line can detect
    const touchFile = path.join(this.codingPath, '.redirect-active');
    try {
      fs.writeFileSync(touchFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        from_project: this.targetProject.split('/').pop(),
        detected_at: new Date().toISOString()
      }));
      
      // Auto-remove after 2 minutes
      setTimeout(() => {
        try {
          if (fs.existsSync(touchFile)) {
            fs.unlinkSync(touchFile);
            this.redirectStatus.active = false;
          }
        } catch (error) {
          eventLogger.debug('REDIRECT_CLEANUP', 'Failed to remove redirect file', { error: error.message });
        }
      }, 120000);
    } catch (error) {
      eventLogger.error('REDIRECT_NOTIFY', 'Failed to create redirect notification', { error: error.message });
    }
  }

  async triggerLSLCreation(userMessage, timestamp) {
    try {
      eventLogger.info('LSL_TRIGGER', 'Prompt-triggered LSL creation starting', {
        message_preview: userMessage.substring(0, 100),
        timestamp
      });

      // Use the existing LSL generation system
      await generateLSL();
      
      eventLogger.lslCreated('prompt-triggered', 1, this.targetProject);
      
      // After LSL creation, trigger trajectory generation if configured
      await this.triggerTrajectoryGeneration();
      
      console.log('📋 LSL created from user prompt');
    } catch (error) {
      eventLogger.systemError('LSL_CREATION', error);
    }
  }

  async triggerTrajectoryGeneration() {
    try {
      // Use environment variables to call trajectory generator
      const projectName = this.targetProject.split('/').pop();
      const trajectoryScript = path.join(this.codingPath, 'scripts', 'repository-trajectory-generator.js');
      
      if (fs.existsSync(trajectoryScript)) {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        const env = {
          ...process.env,
          CODING_TARGET_PROJECT: this.targetProject,
          CODING_TOOLS_PATH: this.codingPath
        };
        
        await execAsync(`node "${trajectoryScript}"`, { env, timeout: 30000 });
        eventLogger.trajectoryGenerated(this.targetProject, 'recent', 'light_semantic_analysis');
      } else {
        eventLogger.warn('TRAJECTORY', 'Trajectory script not found', { script_path: trajectoryScript });
      }
    } catch (error) {
      eventLogger.trajectoryFailed(this.targetProject, error);
    }
  }

  async processStatusHealth() {
    const now = Date.now();
    
    // Update health status every 300ms for status line integration
    if (now - this.lastHealthCheck >= this.statusHealthInterval) {
      this.lastHealthCheck = now;
      await this.updateHealthStatus();
    }
  }

  async updateHealthStatus() {
    const healthData = {
      status: this.healthStatus,
      transcript_file: this.currentTranscriptFile ? path.basename(this.currentTranscriptFile) : null,
      last_processed_size: this.lastProcessedSize,
      pending_prompts: this.pendingPrompts.size,
      redirect_active: this.redirectStatus.active,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
    
    eventLogger.healthCheck('TRANSCRIPT_MONITOR', this.healthStatus, healthData);
    
    // Write health status for status line to read
    const healthFile = path.join(this.codingPath, '.transcript-monitor-health');
    try {
      fs.writeFileSync(healthFile, JSON.stringify(healthData));
    } catch (error) {
      eventLogger.debug('HEALTH_WRITE', 'Failed to write health status', { error: error.message });
    }
  }

  async findActiveTranscript() {
    const transcriptDir = path.join(
      process.env.HOME || '/Users/q284340',
      '.claude',
      'projects'
    );
    
    if (!fs.existsSync(transcriptDir)) {
      eventLogger.error('TRANSCRIPT_FIND', 'Claude projects directory not found', { path: transcriptDir });
      return null;
    }
    
    try {
      // Look for project-specific transcript directories
      const projectName = this.targetProject.split('/').pop();
      const projectTranscriptDir = path.join(transcriptDir, `-Users-q284340-Agentic-${projectName}`);
      
      if (fs.existsSync(projectTranscriptDir)) {
        const files = fs.readdirSync(projectTranscriptDir)
          .filter(file => file.endsWith('.jsonl'))
          .map(file => {
            const filePath = path.join(projectTranscriptDir, file);
            const stats = fs.statSync(filePath);
            return { file: filePath, mtime: stats.mtime };
          })
          .sort((a, b) => b.mtime - a.mtime);
        
        if (files.length > 0) {
          return files[0].file;
        }
      }
      
      eventLogger.warn('TRANSCRIPT_FIND', 'No transcript found for project', { 
        project: projectName,
        searched_dir: projectTranscriptDir 
      });
      return null;
    } catch (error) {
      eventLogger.systemError('TRANSCRIPT_FIND', error);
      return null;
    }
  }

  getCurrentWindow() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Find the window start (XX30 format like existing system)
    let windowStart;
    if (minutes < 30) {
      windowStart = (hours - 1) * 60 + 30;
      if (windowStart < 0) {
        windowStart = 23 * 60 + 30;
      }
    } else {
      windowStart = hours * 60 + 30;
    }
    
    let startHour = Math.floor(windowStart / 60);
    let endHour = Math.floor((windowStart + 60) / 60);
    
    if (endHour >= 24) endHour = endHour % 24;
    if (startHour >= 24) startHour = startHour % 24;
    
    const formatTime = (h, m) => `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;
    
    return `${formatTime(startHour, 30)}-${formatTime(endHour, 30)}`;
  }

  // Health status for external monitoring
  getHealthStatus() {
    return {
      status: this.healthStatus,
      isRunning: this.isRunning,
      currentTranscript: this.currentTranscriptFile ? path.basename(this.currentTranscriptFile) : null,
      pendingPrompts: this.pendingPrompts.size,
      redirectActive: this.redirectStatus.active
    };
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Graceful shutdown initiated...');
  if (global.monitor) {
    await global.monitor.stop('SIGINT');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Graceful shutdown initiated...');
  if (global.monitor) {
    await global.monitor.stop('SIGTERM');
  }
  process.exit(0);
});

// CLI interface
async function main() {
  try {
    const monitor = new IntegratedTranscriptMonitor();
    global.monitor = monitor;
    
    await monitor.start();
    
    // Keep the process running
    process.stdin.resume();
  } catch (error) {
    eventLogger.systemError('MAIN', error);
    console.error('❌ Failed to start transcript monitor:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { IntegratedTranscriptMonitor };
export default IntegratedTranscriptMonitor;